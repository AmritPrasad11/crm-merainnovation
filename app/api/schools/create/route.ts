import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { normalizeText, calculateLeadScore } from '@/lib/utils';
import { checkDuplicateSchool } from '@/lib/duplicate';
import { logAuditAction } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      city,
      state,
      address,
      website,
      board,
      schoolType,
      studentStrength,
      hasStemLab,
      hasRoboticsLab,
      source,
      assignedUserId,
      salesStage,
      notes,
      contactName,
      contactDesignation,
      contactEmail,
      contactPhone,
      contactWhatsapp,
      bypassDuplicateCheck,
    } = body;

    if (!name || !city || !state) {
      return NextResponse.json({ error: 'School Name, City, and State are required.' }, { status: 400 });
    }

    // Perform duplicate detection unless explicitly bypassed by user
    if (!bypassDuplicateCheck) {
      const dupResult = await checkDuplicateSchool({
        name,
        city,
        state,
        email: contactEmail || undefined,
        phone: contactPhone || undefined,
        website: website || undefined,
      });

      if (dupResult.hasDuplicate) {
        return NextResponse.json(
          {
            error: 'Duplicate school detected',
            isDuplicate: true,
            reasons: dupResult.reasons,
            matchedSchool: dupResult.matchedSchool,
          },
          { status: 409 }
        );
      }
    }

    const normalizedName = normalizeText(name);
    const initialStage = salesStage || 'NEW';

    const calculatedScore = calculateLeadScore({
      hasStemLab: !!hasStemLab,
      hasRoboticsLab: !!hasRoboticsLab,
      salesStage: initialStage,
    });

    const newSchool = await db.school.create({
      data: {
        name,
        normalizedName,
        city,
        state,
        address: address || null,
        website: website || null,
        board: board || null,
        schoolType: schoolType || null,
        studentStrength: studentStrength ? parseInt(studentStrength, 10) : null,
        hasStemLab: !!hasStemLab,
        hasRoboticsLab: !!hasRoboticsLab,
        primaryEmail: contactEmail || null,
        primaryPhone: contactPhone || null,
        primaryWhatsapp: contactWhatsapp || contactPhone || null,
        source: source || 'Direct Manual Entry',
        salesStage: initialStage,
        leadScore: calculatedScore,
        assignedUserId: assignedUserId || currentUser.id,
        createdById: currentUser.id,
        notes: notes || null,
        contacts: contactName
          ? {
              create: [
                {
                  name: contactName,
                  designation: contactDesignation || 'Principal',
                  email: contactEmail || null,
                  phone: contactPhone || null,
                  whatsapp: contactWhatsapp || contactPhone || null,
                  isPrimary: true,
                },
              ],
            }
          : undefined,
        activities: {
          create: [
            {
              userId: currentUser.id,
              type: 'SYSTEM',
              title: 'School record created in CRM',
              description: `Added by ${currentUser.name} with sales stage ${initialStage}.`,
            },
          ],
        },
      },
    });

    await logAuditAction({
      userId: currentUser.id,
      action: 'CREATE_SCHOOL',
      entity: 'School',
      entityId: newSchool.id,
      newValue: { name, city, state, salesStage: initialStage },
    });

    return NextResponse.json({ success: true, school: newSchool });
  } catch (error) {
    console.error('Create school API error:', error);
    return NextResponse.json({ error: 'Failed to create school record' }, { status: 500 });
  }
}
