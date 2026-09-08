import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/rbac';
import { logAuditAction } from '@/lib/audit';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user: currentUser, errorResponse } = await requireAdmin();
    if (errorResponse) return errorResponse;

    const resolvedParams = await params;
    const sourceUserId = resolvedParams.id;

    if (!sourceUserId) {
      return NextResponse.json({ error: 'Source User ID is required.' }, { status: 400 });
    }

    const body = await request.json();
    const { targetUserId } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: 'Target User ID is required for reassignment.' }, { status: 400 });
    }

    const sourceUser = await (db as any).user.findUnique({
      where: { id: sourceUserId },
    });

    const targetUser = await (db as any).user.findUnique({
      where: { id: targetUserId },
    });

    if (!sourceUser || !targetUser) {
      return NextResponse.json({ error: 'Source or target user not found.' }, { status: 404 });
    }

    if (targetUser.isActive === false) {
      return NextResponse.json({ error: 'Target user account is deactivated and cannot receive assigned schools.' }, { status: 400 });
    }

    // Reassign all active schools
    const updateResult = await (db as any).school.updateMany({
      where: { assignedUserId: sourceUserId, archived: false },
      data: { assignedUserId: targetUserId },
    });

    // Reassign active follow-ups as well
    await (db as any).followUp.updateMany({
      where: { assignedUserId: sourceUserId, status: 'PENDING' },
      data: { assignedUserId: targetUserId },
    });

    await logAuditAction({
      userId: currentUser.id,
      action: 'REASSIGN_SCHOOLS',
      entity: 'User',
      entityId: sourceUserId,
      previousValue: { assignedUserId: sourceUserId },
      newValue: { assignedUserId: targetUserId, count: updateResult.count },
    });

    return NextResponse.json({
      success: true,
      reassignedCount: updateResult.count,
      message: `Successfully reassigned ${updateResult.count} school(s) from ${sourceUser.name} to ${targetUser.name}.`,
    });
  } catch (error) {
    console.error('Reassign schools API error:', error);
    return NextResponse.json({ error: 'Failed to reassign user schools' }, { status: 500 });
  }
}
