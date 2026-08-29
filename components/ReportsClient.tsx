'use client';

import { useState } from 'react';
import {
  BarChart3,
  Building2,
  Users,
  Award,
  CheckCircle2,
  TrendingUp,
  MapPin,
  FileText,
  FileCheck,
} from '@/components/Icons';

interface ReportsClientProps {
  stageCounts: Record<string, number>;
  totalSchools: number;
  cityStats: { city: string; state: string; count: number; converted: number; stemLabs: number; roboticsLabs: number }[];
  userStats: { id: string; name: string; role: string; assignedCount: number; activitiesCount: number; completedFollowUps: number }[];
}

export default function ReportsClient({
  stageCounts,
  totalSchools,
  cityStats,
  userStats,
}: ReportsClientProps) {
  const [reportTab, setReportTab] = useState<'funnel' | 'geo' | 'team'>('funnel');

  const newCount = stageCounts['NEW'] || 0;
  const contactedCount = stageCounts['CONTACTED'] || 0;
  const engagedCount = stageCounts['ENGAGED'] || 0;
  const interestedCount = stageCounts['INTERESTED'] || 0;
  const meetingCount = stageCounts['MEETING'] || 0;
  const proposalCount = stageCounts['PROPOSAL_SENT'] || 0;
  const mouSentCount = stageCounts['MOU_SENT'] || 0;
  const mouSignedCount = stageCounts['MOU_SIGNED'] || 0;
  const convertedCount = stageCounts['CONVERTED'] || 0;

  const contactedTotal = totalSchools - newCount;

  // Funnel efficiency calculations
  const contactToInterested = contactedTotal > 0 ? ((interestedCount / contactedTotal) * 100).toFixed(1) : '0';
  const interestedToMeeting = interestedCount > 0 ? ((meetingCount / interestedCount) * 100).toFixed(1) : '0';
  const meetingToProposal = meetingCount > 0 ? ((proposalCount / meetingCount) * 100).toFixed(1) : '0';
  const proposalToMou = proposalCount > 0 ? ((mouSentCount / proposalCount) * 100).toFixed(1) : '0';
  const mouToConversion = mouSentCount + mouSignedCount > 0 ? ((convertedCount / (mouSentCount + mouSignedCount)) * 100).toFixed(1) : '0';
  const overallConversion = totalSchools > 0 ? ((convertedCount / totalSchools) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6 text-xs">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics & Performance Reports</h1>
        <p className="text-xs text-slate-500 mt-1">
          Deep business metrics on conversion funnel efficiency, regional city performance, and team user productivity.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 font-semibold">
        <button
          onClick={() => setReportTab('funnel')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors cursor-pointer ${
            reportTab === 'funnel'
              ? 'border-blue-600 text-blue-600 bg-white font-bold rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <span>Conversion Funnel Efficiency</span>
        </button>

        <button
          onClick={() => setReportTab('geo')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors cursor-pointer ${
            reportTab === 'geo'
              ? 'border-emerald-600 text-emerald-600 bg-white font-bold rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span>City & State Breakdown ({cityStats.length})</span>
        </button>

        <button
          onClick={() => setReportTab('team')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors cursor-pointer ${
            reportTab === 'team'
              ? 'border-purple-600 text-purple-600 bg-white font-bold rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-purple-600" />
          <span>Team User Productivity ({userStats.length})</span>
        </button>
      </div>

      {/* FUNNEL TAB */}
      {reportTab === 'funnel' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-center">
              <div className="text-[10px] uppercase font-semibold text-slate-500">Contact &rarr; Interested</div>
              <div className="text-xl font-black text-blue-600 mt-1">{contactToInterested}%</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-center">
              <div className="text-[10px] uppercase font-semibold text-slate-500">Interested &rarr; Meeting</div>
              <div className="text-xl font-black text-indigo-600 mt-1">{interestedToMeeting}%</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-center">
              <div className="text-[10px] uppercase font-semibold text-slate-500">Meeting &rarr; Proposal</div>
              <div className="text-xl font-black text-purple-600 mt-1">{meetingToProposal}%</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-center">
              <div className="text-[10px] uppercase font-semibold text-slate-500">Proposal &rarr; MOU</div>
              <div className="text-xl font-black text-pink-600 mt-1">{proposalToMou}%</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-center">
              <div className="text-[10px] uppercase font-semibold text-slate-500">MOU &rarr; Conversion</div>
              <div className="text-xl font-black text-emerald-600 mt-1">{mouToConversion}%</div>
            </div>

            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 shadow-sm text-center">
              <div className="text-[10px] uppercase font-bold text-emerald-800">Overall Conversion</div>
              <div className="text-xl font-black text-emerald-700 mt-1">{overallConversion}%</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Pipeline Step Breakdown</h3>
            <div className="space-y-3">
              {[
                { stage: 'New Records', count: newCount, color: 'bg-slate-500' },
                { stage: 'Initial Contact', count: contactedCount, color: 'bg-blue-500' },
                { stage: 'Engaged', count: engagedCount, color: 'bg-cyan-500' },
                { stage: 'Interested', count: interestedCount, color: 'bg-amber-500' },
                { stage: 'Meeting Conducted', count: meetingCount, color: 'bg-indigo-500' },
                { stage: 'Proposal Sent', count: proposalCount, color: 'bg-purple-500' },
                { stage: 'MOU Sent', count: mouSentCount, color: 'bg-pink-500' },
                { stage: 'MOU Signed', count: mouSignedCount, color: 'bg-teal-500' },
                { stage: 'Converted Partner', count: convertedCount, color: 'bg-emerald-600' },
              ].map((item) => {
                const percentage = totalSchools > 0 ? ((item.count / totalSchools) * 100).toFixed(1) : '0';
                return (
                  <div key={item.stage} className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span>{item.stage}</span>
                      <span>
                        {item.count} schools ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all`}
                        style={{ width: `${Math.max(Number(percentage), item.count > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* GEO TAB */}
      {reportTab === 'geo' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b font-bold text-slate-900">
            City & State Regional Breakdown
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="p-4">City</th>
                  <th className="p-4">State</th>
                  <th className="p-4">Total Schools</th>
                  <th className="p-4">STEM Labs</th>
                  <th className="p-4">Robotics Labs</th>
                  <th className="p-4">Converted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cityStats.map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-900">{c.city}</td>
                    <td className="p-4 text-slate-700">{c.state}</td>
                    <td className="p-4 font-semibold text-slate-800">{c.count}</td>
                    <td className="p-4 text-blue-700 font-bold">{c.stemLabs}</td>
                    <td className="p-4 text-indigo-700 font-bold">{c.roboticsLabs}</td>
                    <td className="p-4 text-emerald-700 font-bold">{c.converted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TEAM TAB */}
      {reportTab === 'team' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b font-bold text-slate-900">
            Outreach Team User Performance
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="p-4">Team Member</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Assigned Schools</th>
                  <th className="p-4">Logged Activities</th>
                  <th className="p-4">Completed Follow-ups</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {userStats.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-900">{u.name}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 bg-slate-100 rounded-full font-semibold">{u.role}</span>
                    </td>
                    <td className="p-4 font-bold text-slate-800">{u.assignedCount} schools</td>
                    <td className="p-4 font-bold text-blue-700">{u.activitiesCount} activities</td>
                    <td className="p-4 font-bold text-emerald-700">{u.completedFollowUps} completed</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
