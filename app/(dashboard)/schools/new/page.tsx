import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import NewSchoolForm from '@/components/NewSchoolForm';

export default async function NewSchoolPage() {
  const user = await getCurrentUser();

  const users = await db.user.findMany({
    select: { id: true, name: true, role: true },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add New School Record</h1>
        <p className="text-xs text-slate-500 mt-1">
          Register a school into the CRM outreach database with primary contact & lab status.
        </p>
      </div>

      <NewSchoolForm users={users} currentUserId={user?.id || ''} />
    </div>
  );
}
