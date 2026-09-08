import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { normalizeText, calculateLeadScore } from '@/lib/utils';
import { logAuditAction } from '@/lib/audit';

// GET single school details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const school = await db.school.findUnique({
      where: { id },
      include: {
        assignedUser: { select: { id: true, name: true, role: true } },
        createdBy: { select: { id: true, name: true } },
        contacts: true,
        proposals: true,
        mous: true,
        activities: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
        },
        followUps: {
          include: { assignedUser: { select: { name: true } } },
          orderBy: { dueDate: 'asc' },
        },
      },
    });

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    let archivedBy = null;
    const schAny = school as any;
    if (schAny.archivedById) {
      archivedBy = await db.user.findUnique({
        where: { id: schAny.archivedById },
        select: { id: true, name: true },
      });
    }

    return NextResponse.json({ success: true, school: { ...school, archivedBy } });
  } catch (error) {
    console.error('GET school API error:', error);
    return NextResponse.json({ error: 'Failed to fetch school details' }, { status: 500 });
  }
}

// PUT / PATCH update school details
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const school = await db.school.findUnique({ where: { id } });
    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    // Permission check: Admin or assigned user / creator
    if (
      currentUser.role !== 'ADMIN' &&
      school.assignedUserId !== currentUser.id &&
      school.createdById !== currentUser.id
    ) {
      return NextResponse.json(
        { error: 'You do not have permission to edit this school record.' },
        { status: 403 }
      );
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
      primaryEmail,
      primaryPhone,
      primaryWhatsapp,
      source,
      assignedUserId,
      salesStage,
      nextFollowUpAt,
      notes,
    } = body;

    if (!name || !city || !state) {
      return NextResponse.json(
        { error: 'School Name, City, and State are required.' },
        { status: 400 }
      );
    }

    const activitiesCount = await db.activity.count({ where: { schoolId: id, school: { archived: false } } as any });
    const targetStage = salesStage || school.salesStage;

    const calculatedScore = calculateLeadScore({
      hasStemLab: !!hasStemLab,
      hasRoboticsLab: !!hasRoboticsLab,
      salesStage: targetStage,
      activitiesCount,
    });

    const updatedSchool = await db.school.update({
      where: { id },
      data: {
        name,
        normalizedName: normalizeText(name),
        city,
        state,
        address: address || null,
        website: website || null,
        board: board || null,
        schoolType: schoolType || null,
        studentStrength: studentStrength ? parseInt(String(studentStrength), 10) : null,
        hasStemLab: !!hasStemLab,
        hasRoboticsLab: !!hasRoboticsLab,
        primaryEmail: primaryEmail || null,
        primaryPhone: primaryPhone || null,
        primaryWhatsapp: primaryWhatsapp || primaryPhone || null,
        source: source || school.source,
        assignedUserId: assignedUserId || school.assignedUserId,
        salesStage: targetStage,
        leadScore: calculatedScore,
        nextFollowUpAt: nextFollowUpAt ? new Date(nextFollowUpAt) : school.nextFollowUpAt,
        notes: notes || null,
        activities: {
          create: {
            userId: currentUser.id,
            type: 'SYSTEM',
            title: 'School profile updated',
            description: `School profile information updated by ${currentUser.name}.`,
          },
        },
      },
    });

    await logAuditAction({
      userId: currentUser.id,
      action: 'UPDATE_SCHOOL',
      entity: 'School',
      entityId: id,
      previousValue: { name: school.name, city: school.city, salesStage: school.salesStage },
      newValue: { name, city, state, salesStage: targetStage },
    });

    return NextResponse.json({ success: true, school: updatedSchool });
  } catch (error) {
    console.error('Update school API error:', error);
    return NextResponse.json({ error: 'Failed to update school record' }, { status: 500 });
  }
}

// DELETE: Permanent deletion (ADMIN ONLY with transactional cascade safety)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // STRICT PERMISSION SAFETY: ADMIN ONLY
    if (currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Only administrators are allowed to permanently delete school records.' },
        { status: 403 }
      );
    }

    const school = await db.school.findUnique({ where: { id } });
    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    // STRICT BUSINESS RULE: Only archived schools can be permanently deleted
    if (!school.archived) {
      return NextResponse.json(
        { error: 'Only archived schools can be permanently deleted. Please archive the school record first.' },
        { status: 400 }
      );
    }

    // Optional confirmation verification from request body
    let bodyConfirmName: string | null = null;
    try {
      const body = await request.json();
      bodyConfirmName = body?.confirmName || null;
    } catch {
      // Body may be empty if called without json payload
    }

    if (bodyConfirmName && bodyConfirmName.trim() !== school.name.trim()) {
      return NextResponse.json(
        { error: `School name confirmation mismatch. Expected '${school.name}'.` },
        { status: 400 }
      );
    }

    const schoolName = school.name;
    const schoolCity = school.city;
    const schoolState = school.state;

    // Transactional cascade deletion of all school-owned child records (Never delete Users, Templates, Campaigns)
    await db.$transaction(async (tx) => {
      await tx.messageLog.deleteMany({ where: { schoolId: id } });
      await tx.campaignRecipient.deleteMany({ where: { schoolId: id } });
      await tx.followUp.deleteMany({ where: { schoolId: id } });
      await tx.activity.deleteMany({ where: { schoolId: id } });
      await tx.contact.deleteMany({ where: { schoolId: id } });
      await tx.proposal.deleteMany({ where: { schoolId: id } });
      await tx.mou.deleteMany({ where: { schoolId: id } });
      await tx.school.delete({ where: { id } });
    });

    // Audit log survives school deletion
    await logAuditAction({
      userId: currentUser.id,
      action: 'DELETE_SCHOOL',
      entity: 'School',
      entityId: id,
      previousValue: { schoolName, city: schoolCity, state: schoolState, deletedBy: currentUser.name },
    });

    return NextResponse.json({
      success: true,
      message: `School '${schoolName}' and all associated records have been permanently deleted.`,
    });
  } catch (error) {
    console.error('Permanent delete school API error:', error);
    return NextResponse.json({ error: 'Failed to permanently delete school record' }, { status: 500 });
  }
}
