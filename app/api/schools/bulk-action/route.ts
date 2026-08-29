import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, schoolIds, assignedUserId, salesStage } = body;

    if (!Array.isArray(schoolIds) || schoolIds.length === 0) {
      return NextResponse.json({ error: 'No schools selected for bulk action.' }, { status: 400 });
    }

    if (action === 'ASSIGN') {
      if (!assignedUserId) {
        return NextResponse.json({ error: 'Target user ID required for assignment.' }, { status: 400 });
      }

      for (const id of schoolIds) {
        await db.school.update({
          where: { id },
          data: {
            assignedUserId,
            activities: {
              create: {
                userId: user.id,
                type: 'SYSTEM',
                title: 'School reassigned via bulk operation',
              },
            },
          },
        });
      }
    } else if (action === 'UPDATE_STAGE') {
      if (!salesStage) {
        return NextResponse.json({ error: 'Target sales stage required.' }, { status: 400 });
      }

      for (const id of schoolIds) {
        await db.school.update({
          where: { id },
          data: {
            salesStage,
            activities: {
              create: {
                userId: user.id,
                type: 'STAGE_CHANGE',
                title: `Sales stage bulk updated to ${salesStage}`,
              },
            },
          },
        });
      }
    } else if (action === 'ARCHIVE') {
      for (const id of schoolIds) {
        await db.school.update({
          where: { id },
          data: { archived: true },
        });
      }
    } else {
      return NextResponse.json({ error: 'Invalid bulk action specified.' }, { status: 400 });
    }

    await logAuditAction({
      userId: user.id,
      action: `BULK_${action}`,
      entity: 'School',
      entityId: 'bulk',
      newValue: { schoolCount: schoolIds.length, action, assignedUserId, salesStage },
    });

    return NextResponse.json({ success: true, count: schoolIds.length });
  } catch (error) {
    console.error('Bulk action API error:', error);
    return NextResponse.json({ error: 'Failed to execute bulk action' }, { status: 500 });
  }
}
