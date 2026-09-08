import { db } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/rbac';
import { redirect } from 'next/navigation';
import UserManagementClient from '@/components/UserManagementClient';

export default async function UsersPage() {
  const user = await getAuthenticatedUser();

  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const usersList = await (db as any).user.findMany({
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

  return <UserManagementClient users={usersList} currentUserId={user.id} />;
}
