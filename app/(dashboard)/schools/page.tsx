import { db } from '@/lib/db';
import { getAuthenticatedUser, getSchoolWhereClause } from '@/lib/rbac';
import SchoolsTableClient from '@/components/SchoolsTableClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SchoolsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const currentUser = (await getAuthenticatedUser()) || {
    id: 'usr_admin',
    name: 'Mera Admin',
    email: 'admin@merainnovation.com',
    role: 'ADMIN',
    isActive: true,
  };
  const params = await searchParams;
  const search = params.q || '';
  const stageFilter = params.stage || '';
  const boardFilter = params.board || '';
  const sortBy = params.sort || 'createdAt';
  const viewMode = params.view === 'archived' ? 'archived' : 'active';

  let where: any = getSchoolWhereClause(currentUser, {
    archived: viewMode === 'archived',
  });

  if (search) {
    where.AND = [
      ...(where.AND || []),
      {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
          { state: { contains: search, mode: 'insensitive' } },
          { primaryEmail: { contains: search, mode: 'insensitive' } },
          { primaryPhone: { contains: search } },
        ],
      },
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

  const schools = await (db as any).school.findMany({
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
