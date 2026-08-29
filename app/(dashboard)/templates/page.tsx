import { db } from '@/lib/db';
import TemplateManagerClient from '@/components/TemplateManagerClient';

export default async function TemplatesPage() {
  const templates = await db.template.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return <TemplateManagerClient initialTemplates={templates} />;
}
