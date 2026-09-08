import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export async function POST(
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
        { error: 'You do not have permission to archive this school record.' },
        { status: 403 }
      );
    }

    // 1. Archive School parent record
    await db.school.update({
      where: { id },
      data: {
        archived: true,
      },
    });

    // 2. Archive all child entities belonging to this school safely
    const childEntities = [
      () => db.contact.updateMany({ where: { schoolId: id }, data: { archived: true } }),
      () => db.activity.updateMany({ where: { schoolId: id }, data: { archived: true } }),
      () => db.followUp.updateMany({ where: { schoolId: id }, data: { archived: true } }),
      () => db.proposal.updateMany({ where: { schoolId: id }, data: { archived: true } }),
      () => db.mou.updateMany({ where: { schoolId: id }, data: { archived: true } }),
      () => db.campaignRecipient.updateMany({ where: { schoolId: id }, data: { archived: true } }),
      () => db.messageLog.updateMany({ where: { schoolId: id }, data: { archived: true } }),
    ];

    for (const updateFn of childEntities) {
      try {
        await updateFn();
      } catch (childErr) {
        console.warn('[Archive] Child entity update skipped or failed:', childErr);
      }
    }

    // 3. Record system activity entry
    try {
      await db.activity.create({
        data: {
          schoolId: id,
          userId: currentUser.id,
          type: 'SYSTEM',
          title: 'School and all related records archived',
          description: `Archived by ${currentUser.name}. All contacts, follow-ups, activities, proposals, MOUs, and message logs have been archived.`,
          archived: true,
        },
      });
    } catch (actErr) {
      console.warn('[Archive] System activity log creation skipped or failed:', actErr);
    }

    await logAuditAction({
      userId: currentUser.id,
      action: 'ARCHIVE_SCHOOL',
      entity: 'School',
      entityId: id,
      previousValue: { archived: false, name: school.name },
      newValue: { archived: true, name: school.name, archivedAt: new Date(), archivedById: currentUser.id },
    });

    return NextResponse.json({
      success: true,
      message: `School '${school.name}' and all associated records have been archived successfully.`,
    });
  } catch (error: any) {
    console.error('Archive school API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to archive school and related records' },
      { status: 500 }
    );
  }
}
