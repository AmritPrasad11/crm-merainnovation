import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import SchoolsTableClient from '@/components/SchoolsTableClient';

export default async function SchoolsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const currentUser = await getCurrentUser();
  const params = await searchParams;
  const search = params.q || '';
  const stageFilter = params.stage || '';
  const boardFilter = params.board || '';
  const sortBy = params.sort || 'createdAt';
  const viewMode = params.view === 'archived' ? 'archived' : 'active';

  const where: any = {
    archived: viewMode === 'archived',
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { city: { contains: search, mode: 'insensitive' } },
      { state: { contains: search, mode: 'insensitive' } },
      { primaryEmail: { contains: search, mode: 'insensitive' } },
      { primaryPhone: { contains: search } },
    ];
  }

  if (stageFilter) {
    where.salesStage = stageFilter;
  }

  if (boardFilter) {
    where.board = boardFilter;
  }

  let orderBy: any = { createdAt: 'desc' };
  if (sortBy === 'name') orderBy = { name: 'asc' };
  if (sortBy === 'score') orderBy = { leadScore: 'desc' };
  if (sortBy === 'lastContacted') orderBy = { lastContactedAt: 'desc' };

  const schools = await db.school.findMany({
    where,
    include: {
      assignedUser: { select: { id: true, name: true } },
      contacts: {
        where: { isPrimary: true },
        take: 1,
      },
    },
    orderBy,
  });

  const users = await db.user.findMany({
    select: { id: true, name: true, role: true },
    orderBy: { name: 'asc' },
  });

  return (
    <SchoolsTableClient
      schools={schools}
      users={users}
      currentUser={currentUser}
      search={search}
      stageFilter={stageFilter}
      boardFilter={boardFilter}
      sortBy={sortBy}
      viewMode={viewMode}
    />
  );
}
