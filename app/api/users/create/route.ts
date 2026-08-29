import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, hashPassword } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists.' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const newUser = await db.user.create({
      data: {
        name,
        email: email.trim().toLowerCase(),
        passwordHash,
        role: role === 'ADMIN' ? 'ADMIN' : 'OUTREACH_USER',
      },
    });

    await logAuditAction({
      userId: currentUser.id,
      action: 'CREATE_USER',
      entity: 'User',
      entityId: newUser.id,
      newValue: { name, email, role: newUser.role },
    });

    return NextResponse.json({ success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } });
  } catch (error) {
    console.error('Create user API error:', error);
    return NextResponse.json({ error: 'Failed to create team user' }, { status: 500 });
  }
}
