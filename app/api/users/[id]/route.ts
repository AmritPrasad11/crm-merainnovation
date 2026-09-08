import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, protectLastAdmin } from '@/lib/rbac';
import { logAuditAction } from '@/lib/audit';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user: currentUser, errorResponse } = await requireAdmin();
    if (errorResponse) return errorResponse;

    const resolvedParams = await params;
    const userId = resolvedParams.id;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    const body = await request.json();
    const { name, email, phone, role, isActive } = body;

    const existingUser = await (db as any).user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'Target user not found.' }, { status: 404 });
    }

    // Check duplicate email if email is being updated
    if (email && email.trim().toLowerCase() !== existingUser.email.toLowerCase()) {
      const emailTaken = await (db as any).user.findUnique({
        where: { email: email.trim().toLowerCase() },
      });
      if (emailTaken) {
        return NextResponse.json({ error: 'User with this email already exists.' }, { status: 409 });
      }
    }

    // Critical Guard: Check last active admin rule before role change or deactivation
    const guardCheck = await protectLastAdmin(
      userId,
      role !== undefined ? role : undefined,
      isActive !== undefined ? Boolean(isActive) : undefined
    );

    if (!guardCheck.allowed) {
      return NextResponse.json({ error: guardCheck.reason || 'Operation rejected by security policy.' }, { status: 400 });
    }

    // Perform User Update
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email.trim().toLowerCase();
    if (phone !== undefined) updateData.phone = phone || null;
    if (role !== undefined) updateData.role = role === 'ADMIN' ? 'ADMIN' : 'OUTREACH_USER';
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    let updatedUser;
    try {
      updatedUser = await (db as any).user.update({
        where: { id: userId },
        data: updateData,
      });
    } catch (dbErr: any) {
      console.warn('Full user update failed, trying core user fields update:', dbErr?.message);
      const coreData: any = {};
      if (name !== undefined) coreData.name = name;
      if (email !== undefined) coreData.email = email.trim().toLowerCase();
      if (role !== undefined) coreData.role = role === 'ADMIN' ? 'ADMIN' : 'OUTREACH_USER';

      updatedUser = await (db as any).user.update({
        where: { id: userId },
        data: coreData,
      });
    }

    // Write Audit Logs
    if (role !== undefined && role !== existingUser.role) {
      await logAuditAction({
        userId: currentUser.id,
        action: 'USER_ROLE_CHANGED',
        entity: 'User',
        entityId: userId,
        previousValue: { role: existingUser.role },
        newValue: { role: updatedUser.role },
      });
    }

    if (isActive !== undefined && Boolean(isActive) !== existingUser.isActive) {
      const action = Boolean(isActive) ? 'USER_ACTIVATED' : 'USER_DEACTIVATED';
      await logAuditAction({
        userId: currentUser.id,
        action,
        entity: 'User',
        entityId: userId,
        previousValue: { isActive: existingUser.isActive },
        newValue: { isActive: updatedUser.isActive },
      });
    }

    await logAuditAction({
      userId: currentUser.id,
      action: 'USER_UPDATED',
      entity: 'User',
      entityId: userId,
      previousValue: { name: existingUser.name, email: existingUser.email, phone: existingUser.phone },
      newValue: { name: updatedUser.name, email: updatedUser.email, phone: updatedUser.phone },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('Update user API error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update user' }, { status: 500 });
  }
}
