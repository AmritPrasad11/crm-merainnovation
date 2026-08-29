import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { notFound } from 'next/navigation';
import SchoolDetailClient from '@/components/SchoolDetailClient';

export default async function SchoolDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  const school = await db.school.findUnique({
    where: { id },
    include: {
      assignedUser: { select: { id: true, name: true, email: true, role: true } },
      createdBy: { select: { id: true, name: true } },
      contacts: { orderBy: { isPrimary: 'desc' } },
      activities: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      },
      followUps: {
        include: { assignedUser: { select: { name: true } } },
        orderBy: { dueDate: 'asc' },
      },
      proposals: {
        include: { createdBy: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      },
      mous: {
        include: { createdBy: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!school) {
    notFound();
  }

  const allUsers = await db.user.findMany({
    select: { id: true, name: true, role: true },
    orderBy: { name: 'asc' },
  });

  return (
    <SchoolDetailClient
      school={school}
      allUsers={allUsers}
      currentUserId={user?.id || ''}
      currentUserRole={user?.role || 'OUTREACH_USER'}
    />
  );
}
