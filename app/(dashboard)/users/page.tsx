import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import UserManagementClient from '@/components/UserManagementClient';

export default async function UsersPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const usersList = await db.user.findMany({
    include: {
      _count: {
        select: { assignedSchools: true, followUps: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return <UserManagementClient users={usersList} currentUserId={user.id} />;
}
