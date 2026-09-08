import { db } from '@/lib/db';
import MouClient from '@/components/MouClient';

export default async function MouPage() {
  const mous = await db.mou.findMany({
    where: {
      school: { archived: false },
    },
    include: {
      school: { select: { id: true, name: true, city: true, state: true, salesStage: true } },
      createdBy: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const schools = await db.school.findMany({
    where: { archived: false },
    select: { id: true, name: true, city: true, state: true },
    orderBy: { name: 'asc' },
  });

  return <MouClient mous={mous} schools={schools} />;
}
