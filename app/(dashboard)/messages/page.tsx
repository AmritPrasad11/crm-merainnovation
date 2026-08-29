import { db } from '@/lib/db';
import MessagesClient from '@/components/MessagesClient';

export default async function MessagesPage() {
  const messageLogs = await db.messageLog.findMany({
    include: {
      school: { select: { name: true } },
      contact: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return <MessagesClient initialLogs={messageLogs} />;
}
