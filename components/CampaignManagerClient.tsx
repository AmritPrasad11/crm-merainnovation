'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Send,
  Plus,
  Mail,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building2,
  Users,
  ChevronRight,
  Sparkles,
} from '@/components/Icons';
import { formatDate } from '@/lib/utils';

export default function CampaignManagerClient({ campaigns }: { campaigns: any[] }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Campaign Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, schedule, and track multi-channel Email & Meta WhatsApp Business Platform campaigns.
          </p>
        </div>

        <Link
          href="/campaigns/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Outreach Campaign</span>
        </Link>
      </div>

      {/* Campaign List */}
      <div className="space-y-4">
        {campaigns.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center space-y-3 text-xs">
            <Send className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-900 text-sm">No Campaigns Created Yet</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              Launch targeted bulk Email or Meta WhatsApp campaigns to engage schools across your pipeline.
            </p>
            <Link
              href="/campaigns/new"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl font-bold mt-2 shadow-sm"
            >
              Launch First Campaign
            </Link>
          </div>
        ) : (
          campaigns.map((cmp) => {
            const isEmail = cmp.channel === 'EMAIL';
            const deliveryRate =
              cmp.totalRecipients > 0 ? ((cmp.deliveredCount / cmp.totalRecipients) * 100).toFixed(0) : '0';

            return (
              <div
                key={cmp.id}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 text-xs"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900">{cmp.name}</h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          isEmail
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {cmp.channel}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border">
                        {cmp.status}
                      </span>
                    </div>
                    <p className="text-slate-500 mt-1">
                      Template: <span className="font-semibold text-slate-700">{cmp.template?.name || 'N/A'}</span> &bull; Created by {cmp.createdBy?.name || 'Admin'} on {formatDate(cmp.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Performance Metrics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-slate-50 rounded-xl border">
                    <div className="text-[10px] uppercase font-semibold text-slate-500">Target Audience</div>
                    <div className="text-lg font-black text-slate-900 mt-0.5">{cmp.totalRecipients}</div>
                  </div>

                  <div className="p-3 bg-emerald-50 border-emerald-200 rounded-xl border">
                    <div className="text-[10px] uppercase font-semibold text-emerald-800">Delivered</div>
                    <div className="text-lg font-black text-emerald-700 mt-0.5">{cmp.deliveredCount}</div>
                  </div>

                  <div className="p-3 bg-blue-50 border-blue-200 rounded-xl border">
                    <div className="text-[10px] uppercase font-semibold text-blue-800">Delivery Rate</div>
                    <div className="text-lg font-black text-blue-700 mt-0.5">{deliveryRate}%</div>
                  </div>

                  <div className="p-3 bg-rose-50 border-rose-200 rounded-xl border">
                    <div className="text-[10px] uppercase font-semibold text-rose-800">Failed / Invalid</div>
                    <div className="text-lg font-black text-rose-700 mt-0.5">{cmp.failedCount}</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
