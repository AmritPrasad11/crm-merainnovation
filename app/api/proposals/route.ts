import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { recalculateSchoolLeadScore } from '@/lib/scoring';
import { logAuditAction } from '@/lib/audit';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId');

    const where: any = {};
    if (schoolId) where.schoolId = schoolId;

    const proposals = await db.proposal.findMany({
      where,
      include: {
        school: { select: { id: true, name: true, city: true, state: true } },
        createdBy: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(proposals);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch proposals' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { schoolId, title, version = '1.0', amount, status = 'DRAFT', documentUrl, notes } = body;

    if (!schoolId || !title) {
      return NextResponse.json({ error: 'School selection and Proposal title are required.' }, { status: 400 });
    }

    const proposal = await db.proposal.create({
      data: {
        schoolId,
        title,
        version,
        amount: amount ? parseFloat(amount) : null,
        status,
        documentUrl: documentUrl || null,
        notes: notes || null,
        createdById: user.id,
      },
    });

    // Update school stage if currently in earlier stage
    const school = await db.school.findUnique({ where: { id: schoolId } });
    if (school && ['NEW', 'CONTACTED', 'ENGAGED', 'INTERESTED', 'MEETING'].includes(school.salesStage)) {
      await db.school.update({
        where: { id: schoolId },
        data: { salesStage: 'PROPOSAL_SENT', lastContactedAt: new Date() },
      });
    }

    // Log Activity
    await db.activity.create({
      data: {
        schoolId,
        userId: user.id,
        type: 'PROPOSAL',
        title: `Proposal ${version} created: ${title}`,
        description: `Amount: INR ${amount || 'N/A'} • Status: ${status}`,
      },
    });

    await recalculateSchoolLeadScore(schoolId);

    await logAuditAction({
      userId: user.id,
      action: 'CREATE_PROPOSAL',
      entity: 'Proposal',
      entityId: proposal.id,
      newValue: { schoolId, title, version, amount, status },
    });

    return NextResponse.json({ success: true, proposal });
  } catch (error) {
    console.error('Create proposal API error:', error);
    return NextResponse.json({ error: 'Failed to create proposal' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, notes } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Proposal ID and status required' }, { status: 400 });
    }

    const updated = await db.proposal.update({
      where: { id },
      data: { status, notes: notes || undefined },
    });

    await db.activity.create({
      data: {
        schoolId: updated.schoolId,
        userId: user.id,
        type: 'PROPOSAL',
        title: `Proposal status updated to ${status}`,
      },
    });

    await recalculateSchoolLeadScore(updated.schoolId);

    return NextResponse.json({ success: true, proposal: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update proposal' }, { status: 500 });
  }
}
