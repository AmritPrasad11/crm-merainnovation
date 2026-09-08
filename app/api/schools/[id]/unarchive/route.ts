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
        { error: 'You do not have permission to unarchive this school record.' },
        { status: 403 }
      );
    }

    // 1. Unarchive School parent record
    await db.school.update({
      where: { id },
      data: {
        archived: false,
      },
    });

    // 2. Unarchive all child entities belonging to this school safely
    const childEntities = [
      () => db.contact.updateMany({ where: { schoolId: id }, data: { archived: false } as any }),
      () => db.activity.updateMany({ where: { schoolId: id }, data: { archived: false } as any }),
      () => db.followUp.updateMany({ where: { schoolId: id }, data: { archived: false } as any }),
      () => db.proposal.updateMany({ where: { schoolId: id }, data: { archived: false } as any }),
      () => db.mou.updateMany({ where: { schoolId: id }, data: { archived: false } as any }),
      () => db.campaignRecipient.updateMany({ where: { schoolId: id }, data: { archived: false } as any }),
      () => db.messageLog.updateMany({ where: { schoolId: id }, data: { archived: false } as any }),
    ];

    for (const updateFn of childEntities) {
      try {
        await updateFn();
      } catch (childErr) {
        console.warn('[Unarchive] Child entity update skipped or failed:', childErr);
      }
    }

    // 3. Record system activity entry
    try {
      await db.activity.create({
        data: {
          schoolId: id,
          userId: currentUser.id,
          type: 'SYSTEM',
          title: 'School and related records unarchived',
          description: `Restored to active CRM operations by ${currentUser.name}.`,
          archived: false,
        } as any,
      });
    } catch (actErr) {
      console.warn('[Unarchive] System activity log creation skipped or failed:', actErr);
    }

    await logAuditAction({
      userId: currentUser.id,
      action: 'UNARCHIVE_SCHOOL',
      entity: 'School',
      entityId: id,
      previousValue: { archived: true, name: school.name },
      newValue: { archived: false, name: school.name, unarchivedBy: currentUser.id },
    });

    return NextResponse.json({
      success: true,
      message: `School '${school.name}' and all associated records have been unarchived successfully.`,
    });
  } catch (error: any) {
    console.error('Unarchive school API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to unarchive school and related records' },
      { status: 500 }
    );
  }
}
