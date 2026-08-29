import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { sendEmailMessage } from '@/lib/providers/email';
import { sendWhatsAppMessage } from '@/lib/providers/whatsapp';
import { logAuditAction } from '@/lib/audit';

export async function GET() {
  try {
    const campaigns = await db.campaign.findMany({
      include: {
        template: true,
        createdBy: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(campaigns);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      channel,
      templateId,
      targetStage,
      targetCity,
      targetState,
      targetBoard,
      scheduleNow = true,
    } = body;

    if (!name || !channel || !templateId) {
      return NextResponse.json({ error: 'Name, channel, and template are required.' }, { status: 400 });
    }

    const template = await db.template.findUnique({ where: { id: templateId } });
    if (!template) {
      return NextResponse.json({ error: 'Selected template not found.' }, { status: 404 });
    }

    // Filter matching schools
    const whereSchool: any = { archived: false };
    if (targetStage) whereSchool.salesStage = targetStage;
    if (targetCity) whereSchool.city = targetCity;
    if (targetState) whereSchool.state = targetState;
    if (targetBoard) whereSchool.board = targetBoard;

    const targetSchools = await db.school.findMany({
      where: whereSchool,
      include: {
        assignedUser: true,
        contacts: { where: { isPrimary: true }, take: 1 },
      },
    });

    if (targetSchools.length === 0) {
      return NextResponse.json({ error: 'No schools match the selected target audience criteria.' }, { status: 400 });
    }

    // Create Campaign record
    const campaign = await db.campaign.create({
      data: {
        name,
        channel,
        templateId,
        targetStage: targetStage || null,
        targetCity: targetCity || null,
        targetState: targetState || null,
        targetBoard: targetBoard || null,
        status: scheduleNow ? 'RUNNING' : 'SCHEDULED',
        totalRecipients: targetSchools.length,
        createdById: user.id,
      },
    });

    let sentCount = 0;
    let deliveredCount = 0;
    let failedCount = 0;

    // Process recipient dispatch
    for (const school of targetSchools) {
      const primaryContact = school.contacts[0];
      const recipientAddress =
        channel === 'EMAIL'
          ? primaryContact?.email || school.primaryEmail
          : primaryContact?.whatsapp || primaryContact?.phone || school.primaryWhatsapp || school.primaryPhone;

      if (!recipientAddress) {
        failedCount++;
        continue;
      }

      let dispatchResult: any;

      if (channel === 'EMAIL') {
        dispatchResult = await sendEmailMessage({
          to: recipientAddress,
          subject: template.subject || 'Outreach from Mera Innovation',
          content: template.content,
          schoolName: school.name,
          contactName: primaryContact?.name || 'Principal / Educator',
          cityName: school.city,
          designation: primaryContact?.designation || 'Principal',
          assignedUser: school.assignedUser?.name || user.name,
        });
      } else {
        // Meta WhatsApp Business Cloud API
        dispatchResult = await sendWhatsAppMessage({
          to: recipientAddress,
          templateName: template.metaTemplateId || undefined,
          parameters: [primaryContact?.name || 'Educator', school.name, school.city],
          textBody: template.content,
        });
      }

      if (dispatchResult.success) {
        sentCount++;
        deliveredCount++; // Simulated immediate delivery in dev

        // Create Message Log
        await db.messageLog.create({
          data: {
            schoolId: school.id,
            contactId: primaryContact?.id || null,
            campaignId: campaign.id,
            channel,
            direction: 'OUTBOUND',
            sender: channel === 'EMAIL' ? 'outreach@merainnovation.com' : 'Meta WhatsApp Cloud API',
            recipient: recipientAddress,
            subject: template.subject || null,
            content: template.content,
            status: 'DELIVERED',
            externalId: dispatchResult.messageId || null,
          },
        });

        // Record Activity in School Timeline
        await db.activity.create({
          data: {
            schoolId: school.id,
            userId: user.id,
            type: channel === 'EMAIL' ? 'EMAIL_SENT' : 'WHATSAPP_SENT',
            title: `Outreach ${channel} sent via campaign "${name}"`,
            description: `Sent to ${recipientAddress} using template "${template.name}".`,
          },
        });
      } else {
        failedCount++;
      }
    }

    // Update Campaign Stats
    const updatedCampaign = await db.campaign.update({
      where: { id: campaign.id },
      data: {
        status: 'COMPLETED',
        sentCount,
        deliveredCount,
        failedCount,
      },
    });

    await logAuditAction({
      userId: user.id,
      action: 'EXECUTE_CAMPAIGN',
      entity: 'Campaign',
      entityId: campaign.id,
      newValue: { name, channel, totalRecipients: targetSchools.length, sentCount, deliveredCount, failedCount },
    });

    return NextResponse.json({ success: true, campaign: updatedCampaign });
  } catch (error) {
    console.error('Campaign execution API error:', error);
    return NextResponse.json({ error: 'Failed to execute campaign' }, { status: 500 });
  }
}
