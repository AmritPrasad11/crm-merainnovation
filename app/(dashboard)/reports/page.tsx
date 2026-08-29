import { db } from '@/lib/db';
import ReportsClient from '@/components/ReportsClient';

export default async function ReportsPage() {
  // Sales stage counts
  const schoolsByStage = await db.school.groupBy({
    by: ['salesStage'],
    where: { archived: false },
    _count: { id: true },
  });

  const stageCounts: Record<string, number> = {};
  schoolsByStage.forEach((item: any) => {
    stageCounts[item.salesStage] = item._count.id;
  });

  const totalSchools = Object.values(stageCounts).reduce((a, b) => a + b, 0);

  // City & State Stats
  const allSchools = await db.school.findMany({
    where: { archived: false },
    select: { city: true, state: true, salesStage: true, hasStemLab: true, hasRoboticsLab: true },
  });

  const cityMap: Record<string, { city: string; state: string; count: number; converted: number; stemLabs: number; roboticsLabs: number }> = {};
  allSchools.forEach((s: any) => {
    const key = `${s.city}_${s.state}`;
    if (!cityMap[key]) {
      cityMap[key] = { city: s.city, state: s.state, count: 0, converted: 0, stemLabs: 0, roboticsLabs: 0 };
    }
    cityMap[key].count++;
    if (s.salesStage === 'CONVERTED') cityMap[key].converted++;
    if (s.hasStemLab) cityMap[key].stemLabs++;
    if (s.hasRoboticsLab) cityMap[key].roboticsLabs++;
  });

  const cityStats = Object.values(cityMap);

  // User Team Stats
  const users = await db.user.findMany({
    select: { id: true, name: true, role: true },
  });

  const userStats = await Promise.all(
    users.map(async (u: any) => {
      const assignedCount = await db.school.count({ where: { assignedUserId: u.id, archived: false } });
      const activitiesCount = await db.activity.count({ where: { userId: u.id } });
      const completedFollowUps = await db.followUp.count({ where: { assignedUserId: u.id, status: 'COMPLETED' } });
      return {
        id: u.id,
        name: u.name,
        role: u.role,
        assignedCount,
        activitiesCount,
        completedFollowUps,
      };
    })
  );

  return (
    <ReportsClient
      stageCounts={stageCounts}
      totalSchools={totalSchools}
      cityStats={cityStats}
      userStats={userStats}
    />
  );
}
