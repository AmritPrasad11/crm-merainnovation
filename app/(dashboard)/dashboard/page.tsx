import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import Link from 'next/link';
import {
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  FileText,
  FileCheck,
  Award,
  ArrowRight,
  Send,
  Users,
  MapPin,
  CalendarClock,
  Sparkles,
} from '@/components/Icons';
import { SALES_STAGE_PIPELINE, SALES_STAGE_OUTCOMES } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // Fetch counts by Sales Stage
  const schoolsByStage = await db.school.groupBy({
    by: ['salesStage'],
    where: { archived: false },
    _count: { id: true },
  });

  const stageCounts: Record<string, number> = {};
  schoolsByStage.forEach((item) => {
    stageCounts[item.salesStage] = item._count.id;
  });

  const totalSchools = Object.values(stageCounts).reduce((a, b) => a + b, 0);

  // Follow-ups due today & overdue
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const followUpsDueToday = await db.followUp.count({
    where: {
      status: 'PENDING',
      dueDate: { gte: startOfDay, lte: endOfDay },
    },
  });

  const overdueFollowUps = await db.followUp.count({
    where: {
      status: 'PENDING',
      dueDate: { lt: startOfDay },
    },
  });

  const recentFollowUpsList = await db.followUp.findMany({
    where: {
      status: 'PENDING',
    },
    include: {
      school: true,
      assignedUser: true,
    },
    orderBy: { dueDate: 'asc' },
    take: 5,
  });

  // Recent activities
  const recentActivities = await db.activity.findMany({
    include: {
      school: true,
      user: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 6,
  });

  // Calculate funnel conversions
  const newCount = stageCounts['NEW'] || 0;
  const contactedCount = stageCounts['CONTACTED'] || 0;
  const engagedCount = stageCounts['ENGAGED'] || 0;
  const interestedCount = stageCounts['INTERESTED'] || 0;
  const meetingCount = stageCounts['MEETING'] || 0;
  const proposalCount = stageCounts['PROPOSAL_SENT'] || 0;
  const mouSentCount = stageCounts['MOU_SENT'] || 0;
  const mouSignedCount = stageCounts['MOU_SIGNED'] || 0;
  const convertedCount = stageCounts['CONVERTED'] || 0;

  const contactedOrFurther =
    totalSchools - (stageCounts['NEW'] || 0) - (stageCounts['INVALID_CONTACT'] || 0);

  const overallConversionRate = totalSchools > 0 ? ((convertedCount / totalSchools) * 100).toFixed(1) : '0';
  const interestedConversionRate = contactedOrFurther > 0 ? ((interestedCount / contactedOrFurther) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mera Innovation Sales Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time overview of school outreach, pipeline performance, and follow-ups.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/schools/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-lg shadow-blue-600/30"
          >
            <Building2 className="w-4 h-4" />
            <span>Add New School</span>
          </Link>
          <Link
            href="/follow-ups"
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
          >
            <CalendarClock className="w-4 h-4" />
            <span>View Follow-ups</span>
          </Link>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total Schools</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalSchools}</div>
          <p className="text-[11px] text-slate-500 mt-1">Active outreach database</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Interested</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{interestedCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">High interest leads</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Proposals</span>
            <FileText className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600">{proposalCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Commercial proposals</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>MOU Sent</span>
            <FileCheck className="w-4 h-4 text-pink-500" />
          </div>
          <div className="text-2xl font-black text-pink-600">{mouSentCount + mouSignedCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Legal agreements</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Converted</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{convertedCount}</div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">
            {overallConversionRate}% conversion rate
          </p>
        </div>

        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 shadow-sm">
          <div className="flex items-center justify-between text-amber-800 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Due / Overdue</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900">
            {followUpsDueToday + overdueFollowUps}
          </div>
          <div className="flex gap-2 text-[10px] font-semibold mt-1">
            <span className="text-amber-800">{followUpsDueToday} today</span>
            <span className="text-rose-700">{overdueFollowUps} overdue</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Pipeline Funnel + Urgent Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Funnel */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Sales Stage Funnel</h2>
              <p className="text-xs text-slate-500">Live breakdown across all sales pipeline stages</p>
            </div>
            <Link
              href="/schools"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View All Schools</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {SALES_STAGE_PIPELINE.map((stage) => {
              const count = stageCounts[stage.key] || 0;
              const percentage = totalSchools > 0 ? ((count / totalSchools) * 100).toFixed(0) : 0;
              return (
                <div key={stage.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${stage.color}`}>
                        {stage.label}
                      </span>
                      <span className="text-slate-500 text-[11px] hidden sm:inline">
                        {stage.description}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900">
                      {count} <span className="text-slate-400 font-normal text-[11px]">({percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(Number(percentage), count > 0 ? 3 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Outcome Breakdown */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Separated Outcome States
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SALES_STAGE_OUTCOMES.map((outcome) => {
                const count = stageCounts[outcome.key] || 0;
                return (
                  <div key={outcome.key} className={`p-3 rounded-xl border text-center ${outcome.color}`}>
                    <div className="text-xs font-semibold">{outcome.label}</div>
                    <div className="text-lg font-black mt-0.5">{count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Actionable Right Column: Urgent Follow-ups & Recent Activity */}
        <div className="space-y-6">
          {/* Due & Overdue Follow-ups */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Urgent Follow-ups</span>
              </h3>
              <Link href="/follow-ups" className="text-xs font-medium text-blue-600 hover:underline">
                View All
              </Link>
            </div>

            {recentFollowUpsList.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">
                No pending follow-ups right now.
              </p>
            ) : (
              <div className="space-y-3">
                {recentFollowUpsList.map((fu) => {
                  const isOverdue = new Date(fu.dueDate) < startOfDay;
                  return (
                    <div
                      key={fu.id}
                      className={`p-3 rounded-xl border ${
                        isOverdue ? 'bg-rose-50/60 border-rose-200' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/schools/${fu.school.id}`}
                          className="font-semibold text-xs text-slate-900 hover:text-blue-600 line-clamp-1"
                        >
                          {fu.school.name}
                        </Link>
                        {isOverdue ? (
                          <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded">
                            OVERDUE
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                            DUE TODAY
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{fu.title}</p>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Due: {formatDate(fu.dueDate)}</span>
                        <span>Assignee: {fu.assignedUser?.name || 'Unassigned'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Activity Feed */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span>Recent Activity Feed</span>
            </h3>

            {recentActivities.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">
                No recent activity logged yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((act) => (
                  <div key={act.id} className="text-xs border-l-2 border-blue-500 pl-3 py-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/schools/${act.school.id}`}
                        className="font-semibold text-slate-900 hover:text-blue-600"
                      >
                        {act.school.name}
                      </Link>
                      <span className="text-[10px] text-slate-400">{formatDate(act.createdAt)}</span>
                    </div>
                    <p className="text-slate-600 font-medium">{act.title}</p>
                    {act.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-1">{act.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
