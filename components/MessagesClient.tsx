'use client';

import { useState } from 'react';
import {
  MessageSquare,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building2,
  User,
  Search,
} from '@/components/Icons';
import { formatDateTime } from '@/lib/utils';
import Link from 'next/link';

export default function MessagesClient({ initialLogs }: { initialLogs: any[] }) {
  const [activeChannel, setActiveChannel] = useState<'ALL' | 'EMAIL' | 'WHATSAPP'>('ALL');
  const [search, setSearch] = useState('');

  const filteredLogs = initialLogs.filter((log) => {
    if (activeChannel !== 'ALL' && log.channel !== activeChannel) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        log.school?.name?.toLowerCase().includes(q) ||
        log.recipient?.toLowerCase().includes(q) ||
        (log.subject && log.subject.toLowerCase().includes(q)) ||
        (log.content && log.content.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 text-xs">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Communication Log & Unified Inbox</h1>
        <p className="text-xs text-slate-500 mt-1">
          Unified real-time activity log of Email & Meta WhatsApp Business Platform message exchanges.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveChannel('ALL')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
              activeChannel === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Channels ({initialLogs.length})
          </button>
          <button
            onClick={() => setActiveChannel('EMAIL')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
              activeChannel === 'EMAIL' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
            }`}
          >
            Email ({initialLogs.filter((l) => l.channel === 'EMAIL').length})
          </button>
          <button
            onClick={() => setActiveChannel('WHATSAPP')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
              activeChannel === 'WHATSAPP' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            WhatsApp ({initialLogs.filter((l) => l.channel === 'WHATSAPP').length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search messages..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border rounded-xl"
          />
        </div>
      </div>

      {/* Messages List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-2">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700">No Messages Logged</h3>
            <p className="text-slate-500">No communication logs match the selected filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="p-4">Channel</th>
                  <th className="p-4">School & Contact</th>
                  <th className="p-4">Recipient</th>
                  <th className="p-4">Message Preview</th>
                  <th className="p-4">Delivery Status</th>
                  <th className="p-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => {
                  const isEmail = log.channel === 'EMAIL';

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            isEmail
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {log.channel}
                        </span>
                      </td>

                      <td className="p-4">
                        <Link
                          href={`/schools/${log.schoolId}`}
                          className="font-bold text-slate-900 hover:text-blue-600 block"
                        >
                          {log.school?.name || 'School Record'}
                        </Link>
                        {log.contact && <div className="text-slate-500 text-[11px]">{log.contact.name}</div>}
                      </td>

                      <td className="p-4 font-mono font-medium text-slate-700">{log.recipient}</td>

                      <td className="p-4 max-w-xs">
                        {log.subject && <div className="font-semibold text-slate-900 truncate">{log.subject}</div>}
                        <div className="text-slate-600 line-clamp-1 text-[11px]">{log.content}</div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            log.status === 'READ'
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : log.status === 'DELIVERED'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : log.status === 'FAILED'
                              ? 'bg-rose-100 text-rose-800 border-rose-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>

                      <td className="p-4 text-right text-slate-500 text-[11px]">
                        {formatDateTime(log.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
