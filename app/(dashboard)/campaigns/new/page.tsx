import { db } from '@/lib/db';
import NewCampaignForm from '@/components/NewCampaignForm';

export default async function NewCampaignPage() {
  const templates = await db.template.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const schools = await db.school.findMany({
    where: { archived: false },
    include: {
      contacts: { where: { isPrimary: true }, take: 1 },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Launch New Outreach Campaign</h1>
        <p className="text-xs text-slate-500 mt-1">
          Select message template, segment target schools, and dispatch bulk Email or Meta WhatsApp campaigns.
        </p>
      </div>

      <NewCampaignForm templates={templates} schools={schools} />
    </div>
  );
}
