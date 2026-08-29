import { db } from '@/lib/db';
import ProposalsClient from '@/components/ProposalsClient';

export default async function ProposalsPage() {
  const proposals = await db.proposal.findMany({
    include: {
      school: { select: { id: true, name: true, city: true, state: true } },
      createdBy: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const schools = await db.school.findMany({
    where: { archived: false },
    select: { id: true, name: true, city: true, state: true },
    orderBy: { name: 'asc' },
  });

  return <ProposalsClient proposals={proposals} schools={schools} />;
}
