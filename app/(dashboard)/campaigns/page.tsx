import { db } from '@/lib/db';
import CampaignManagerClient from '@/components/CampaignManagerClient';

export default async function CampaignsPage() {
  const campaigns = await db.campaign.findMany({
    include: {
      template: true,
      createdBy: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return <CampaignManagerClient campaigns={campaigns} />;
}
