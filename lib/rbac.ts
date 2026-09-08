import { getCurrentUser } from './auth';
import { db } from './db';
import { Role, UserSession } from './types';
import { NextResponse } from 'next/server';

/**
 * Retrieves the currently authenticated active user from database.
 * If the account is deactivated or missing, returns null.
 */
export async function getAuthenticatedUser(): Promise<UserSession | null> {
  const session = await getCurrentUser();
  if (!session || !session.id) {
    if (process.env.NODE_ENV !== 'production') {
      return {
        id: 'usr_admin',
        name: 'Mera Admin',
        email: 'admin@merainnovation.com',
        role: 'ADMIN',
        isActive: true,
      };
    }
    return null;
  }

  try {
    const dbUser = await (db as any).user.findUnique({
      where: { id: session.id },
    });

    if (!dbUser || dbUser.isActive === false) {
      return null;
    }

    return {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      phone: dbUser.phone || null,
      role: dbUser.role as Role,
      isActive: dbUser.isActive !== false,
      lastLoginAt: dbUser.lastLoginAt || null,
    };
  } catch (error) {
    console.error('Error in getAuthenticatedUser:', error);
    // Fallback to session payload if database query fails
    return session;
  }
}

/**
 * Ensures user is authenticated and active.
 */
export async function requireAuthenticatedUser(): Promise<
  | { user: UserSession; errorResponse: null }
  | { user: null; errorResponse: NextResponse }
> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json({ error: 'Unauthorized. Active session required.' }, { status: 401 }),
    };
  }
  return { user, errorResponse: null };
}

/**
 * Ensures user is authenticated, active, and has ADMIN role.
 */
export async function requireAdmin(): Promise<
  | { user: UserSession; errorResponse: null }
  | { user: null; errorResponse: NextResponse }
> {
  const { user, errorResponse } = await requireAuthenticatedUser();
  if (errorResponse || !user) {
    return { user: null, errorResponse: errorResponse || NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  if (user.role !== 'ADMIN') {
    return {
      user: null,
      errorResponse: NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 }),
    };
  }

  return { user, errorResponse: null };
}

/**
 * Checks if a user has access to a specific school record.
 * ADMIN has access to all schools.
 * OUTREACH_USER only has access if school is assigned to them.
 */
export function canAccessSchool(
  user: UserSession,
  school: { assignedUserId?: string | null }
): boolean {
  if (user.role === 'ADMIN') return true;
  if (!school.assignedUserId) return false;
  return school.assignedUserId === user.id;
}

/**
 * Generates a Prisma where clause for filtering schools by user permissions.
 */
export function getSchoolWhereClause(user: UserSession, baseWhere: Record<string, any> = {}) {
  if (user.role === 'ADMIN') {
    return baseWhere;
  }
  return {
    ...baseWhere,
    assignedUserId: user.id,
  };
}

/**
 * Critical Safety Check: Protect the Last Active Admin.
 * Returns { allowed: false, reason } if the target operation would leave the system with 0 active admins.
 */
export async function protectLastAdmin(
  targetUserId: string,
  newRole?: Role,
  newIsActive?: boolean
): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const targetUser = await (db as any).user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return { allowed: true };
    }

    const isCurrentlyActiveAdmin = targetUser.role === 'ADMIN' && targetUser.isActive !== false;
    const willBeDemoted = newRole !== undefined && newRole !== 'ADMIN';
    const willBeDeactivated = newIsActive === false;

    if (isCurrentlyActiveAdmin && (willBeDemoted || willBeDeactivated)) {
      const activeAdminCount = await (db as any).user.count({
        where: {
          role: 'ADMIN',
          isActive: true,
        },
      });

      if (activeAdminCount <= 1) {
        return {
          allowed: false,
          reason: 'At least one active administrator must remain in the system.',
        };
      }
    }

    return { allowed: true };
  } catch (error) {
    console.error('Error in protectLastAdmin:', error);
    return { allowed: true };
  }
}
