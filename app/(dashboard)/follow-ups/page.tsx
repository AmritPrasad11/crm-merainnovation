import { db } from '@/lib/db';
import Link from 'next/link';
import { CalendarClock, AlertTriangle, CheckCircle2, Clock, MapPin } from '@/components/Icons';
import { formatDate } from '@/lib/utils';
import FollowUpActions from '@/components/FollowUpActions';

export default async function FollowUpsPage() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  // Overdue follow-ups (excluding archived schools & archived follow-ups)
  const overdueList = await db.followUp.findMany({
    where: {
      status: 'PENDING',
      school: { archived: false },
      dueDate: { lt: startOfDay },
    },
    include: {
      school: true,
      assignedUser: { select: { name: true } },
    },
    orderBy: { dueDate: 'asc' },
  });

  // Due Today follow-ups (excluding archived schools & archived follow-ups)
  const dueTodayList = await db.followUp.findMany({
    where: {
      status: 'PENDING',
      school: { archived: false },
      dueDate: { gte: startOfDay, lte: endOfDay },
    },
    include: {
      school: true,
      assignedUser: { select: { name: true } },
    },
    orderBy: { dueDate: 'asc' },
  });

  // Upcoming follow-ups (excluding archived schools & archived follow-ups)
  const upcomingList = await db.followUp.findMany({
    where: {
      status: 'PENDING',
      school: { archived: false },
      dueDate: { gt: endOfDay },
    },
    include: {
      school: true,
      assignedUser: { select: { name: true } },
    },
    orderBy: { dueDate: 'asc' },
    take: 10,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Follow-up Management</h1>
        <p className="text-xs text-slate-500 mt-1">
          Stay on top of outreach schedules, due calls, and pending active school follow-ups.
        </p>
      </div>

      {/* OVERDUE SECTION */}
      {overdueList.length > 0 && (
        <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-rose-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Overdue Follow-ups ({overdueList.length})</span>
            </h2>
            <span className="text-xs font-semibold text-rose-700">Immediate Action Needed</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {overdueList.map((item: any) => (
              <div key={item.id} className="bg-white p-4 rounded-xl border border-rose-200 space-y-2 shadow-xs">
                <div className="flex justify-between items-start">
                  <Link href={`/schools/${item.school.id}`} className="font-bold text-slate-900 hover:text-blue-600">
                    {item.school.name}
                  </Link>
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded">
                    OVERDUE ({formatDate(item.dueDate)})
                  </span>
                </div>
                <p className="text-slate-700 font-medium">{item.title}</p>
                <div className="flex items-center justify-between text-slate-500 pt-2 border-t border-slate-100">
                  <span>Assignee: {item.assignedUser?.name || 'Unassigned'}</span>
                  <FollowUpActions schoolId={item.school.id} followUpId={item.id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DUE TODAY SECTION */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          <span>Follow-ups Due Today ({dueTodayList.length})</span>
        </h2>

        {dueTodayList.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-6 text-center">
            No follow-ups due today. You are all caught up!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {dueTodayList.map((item: any) => (
              <div key={item.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-start">
                  <Link href={`/schools/${item.school.id}`} className="font-bold text-slate-900 hover:text-blue-600">
                    {item.school.name}
                  </Link>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                    DUE TODAY
                  </span>
                </div>
                <p className="text-slate-700 font-medium">{item.title}</p>
                <div className="flex items-center justify-between text-slate-500 pt-2 border-t border-slate-200/60">
                  <span>Assignee: {item.assignedUser?.name || 'Unassigned'}</span>
                  <FollowUpActions schoolId={item.school.id} followUpId={item.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* UPCOMING SECTION */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <CalendarClock className="w-4 h-4 text-blue-500" />
          <span>Upcoming Scheduled Follow-ups ({upcomingList.length})</span>
        </h2>

        {upcomingList.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-6 text-center">
            No upcoming follow-ups scheduled yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {upcomingList.map((item: any) => (
              <div key={item.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-start">
                  <Link href={`/schools/${item.school.id}`} className="font-bold text-slate-900 hover:text-blue-600">
                    {item.school.name}
                  </Link>
                  <span className="text-slate-500 text-[11px]">Due: {formatDate(item.dueDate)}</span>
                </div>
                <p className="text-slate-700 font-medium">{item.title}</p>
                <div className="flex items-center justify-between text-slate-500 pt-2 border-t border-slate-200/60">
                  <span>Assignee: {item.assignedUser?.name || 'Unassigned'}</span>
                  <FollowUpActions schoolId={item.school.id} followUpId={item.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
