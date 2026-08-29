import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import ImportWizard from '@/components/ImportWizard';

export default async function ImportSchoolsPage() {
  const user = await getCurrentUser();

  const users = await db.user.findMany({
    select: { id: true, name: true, role: true },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">CSV & Excel Batch School Import</h1>
        <p className="text-xs text-slate-500 mt-1">
          Upload bulk school lists with intelligent column auto-detection, pre-validation, and duplicate detection.
        </p>
      </div>

      <ImportWizard users={users} currentUserId={user?.id || ''} />
    </div>
  );
}
