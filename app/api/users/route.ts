import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/rbac';

export async function GET(request: Request) {
  try {
    const { user: currentUser, errorResponse } = await requireAdmin();
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const roleFilter = searchParams.get('role')?.trim() || '';
    const statusFilter = searchParams.get('status')?.trim() || '';

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (roleFilter && (roleFilter === 'ADMIN' || roleFilter === 'OUTREACH_USER')) {
      where.role = roleFilter;
    }

    if (statusFilter === 'ACTIVE') {
      where.isActive = true;
    } else if (statusFilter === 'INACTIVE') {
      where.isActive = false;
    }

    const users = await (db as any).user.findMany({
      where,
      include: {
        _count: {
          select: {
            assignedSchools: true,
            followUps: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error('Fetch users API error:', error);
    return NextResponse.json({ error: 'Failed to fetch users list' }, { status: 500 });
  }
}
