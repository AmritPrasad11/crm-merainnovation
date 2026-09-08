import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { requireAdmin } from '@/lib/rbac';
import { logAuditAction } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const { user: currentUser, errorResponse } = await requireAdmin();
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { name, email, password, phone, role, isActive } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
    }

    const existingUser = await (db as any).user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists.' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const newUser = await (db as any).user.create({
      data: {
        name,
        email: email.trim().toLowerCase(),
        phone: phone || null,
        passwordHash,
        role: role === 'ADMIN' ? 'ADMIN' : 'OUTREACH_USER',
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    await logAuditAction({
      userId: currentUser.id,
      action: 'USER_CREATED',
      entity: 'User',
      entityId: newUser.id,
      newValue: { name, email: newUser.email, phone: newUser.phone, role: newUser.role, isActive: newUser.isActive },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        isActive: newUser.isActive,
      },
    });
  } catch (error) {
    console.error('Create user API error:', error);
    return NextResponse.json({ error: 'Failed to create team user' }, { status: 500 });
  }
}
