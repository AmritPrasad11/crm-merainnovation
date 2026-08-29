'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Send,
  Building2,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Mail,
  MessageSquare,
} from '@/components/Icons';
import { SALES_STAGE_PIPELINE, SALES_STAGE_OUTCOMES, SCHOOL_BOARDS } from '@/lib/types';
import Link from 'next/link';

interface NewCampaignFormProps {
  templates: any[];
  schools: any[];
}

export default function NewCampaignForm({ templates, schools }: NewCampaignFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [channel, setChannel] = useState<'EMAIL' | 'WHATSAPP'>('EMAIL');
  const [templateId, setTemplateId] = useState('');
  const [targetStage, setTargetStage] = useState('');
  const [targetCity, setTargetCity] = useState('');
  const [targetState, setTargetState] = useState('');
  const [targetBoard, setTargetBoard] = useState('');

  const filteredTemplates = templates.filter((t) => t.channel === channel);

  // Filter matching schools dynamically for live target calculation
  const matchingSchools = schools.filter((s) => {
    if (s.archived) return false;
    if (targetStage && s.salesStage !== targetStage) return false;
    if (targetCity && s.city.toLowerCase() !== targetCity.toLowerCase()) return false;
    if (targetState && s.state.toLowerCase() !== targetState.toLowerCase()) return false;
    if (targetBoard && s.board !== targetBoard) return false;
    return true;
  });

  const handleLaunchCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !templateId) {
      setError('Campaign Name and Template selection are required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          channel,
          templateId,
          targetStage: targetStage || undefined,
          targetCity: targetCity || undefined,
          targetState: targetState || undefined,
          targetBoard: targetBoard || undefined,
          scheduleNow: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to launch campaign');

      router.push('/campaigns');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred during campaign dispatch');
    } finally {
      setLoading(false);
    }
  };

  const allStages = [...SALES_STAGE_PIPELINE, ...SALES_STAGE_OUTCOMES];

  return (
    <form onSubmit={handleLaunchCampaign} className="space-y-6 text-xs">
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Campaign Setup */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-600 flex items-center gap-2">
          <Send className="w-4 h-4" />
          <span>Campaign Setup</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Campaign Title *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Q3 Rajasthan Schools STEM Lab Outreach"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Channel *</label>
            <select
              value={channel}
              onChange={(e) => {
                setChannel(e.target.value as any);
                setTemplateId('');
              }}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            >
              <option value="EMAIL">EMAIL</option>
              <option value="WHATSAPP">WHATSAPP (Meta Cloud API)</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="block font-semibold text-slate-700 mb-1">Select Message Template *</label>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              required
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
            >
              <option value="">-- Choose {channel} Template --</option>
              {filteredTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.variables || 'No vars'})
                </option>
              ))}
            </select>
            {filteredTemplates.length === 0 && (
              <p className="text-rose-600 mt-1 text-[11px]">
                No templates created for {channel}. <Link href="/templates" className="underline font-bold">Create Template first</Link>.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Step 2: Target Audience Filters */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-600 flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          <span>Target Audience Segmentation</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Filter Sales Stage</label>
            <select
              value={targetStage}
              onChange={(e) => setTargetStage(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border rounded-xl font-medium"
            >
              <option value="">All Sales Stages</option>
              {allStages.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Filter Board</label>
            <select
              value={targetBoard}
              onChange={(e) => setTargetBoard(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border rounded-xl font-medium"
            >
              <option value="">All Boards</option>
              {SCHOOL_BOARDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Filter State</label>
            <input
              type="text"
              value={targetState}
              onChange={(e) => setTargetState(e.target.value)}
              placeholder="e.g. Rajasthan"
              className="w-full p-2.5 bg-slate-50 border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Filter City</label>
            <input
              type="text"
              value={targetCity}
              onChange={(e) => setTargetCity(e.target.value)}
              placeholder="e.g. Jaipur"
              className="w-full p-2.5 bg-slate-50 border rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Step 3: Audience Match & Execution Summary */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-600 flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Target Audience Summary</span>
          </h2>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold rounded-full text-xs">
            {matchingSchools.length} School(s) Matched
          </span>
        </div>

        {matchingSchools.length === 0 ? (
          <p className="text-slate-500 italic py-4 text-center">
            No active schools match your target segmentation filters.
          </p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {matchingSchools.map((s) => (
              <div key={s.id} className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">{s.name}</span> &bull; {s.city}, {s.state} (Stage: {s.salesStage})
                </div>
                <span className="font-semibold text-slate-500">
                  Recipient: {s.contacts[0]?.name || 'School Inbox'} ({channel === 'EMAIL' ? s.primaryEmail : s.primaryPhone})
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Link
          href="/campaigns"
          className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-semibold transition-colors"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={loading || matchingSchools.length === 0 || !templateId}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-600/30 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
        >
          {loading ? (
            <span>Dispatching Campaign...</span>
          ) : (
            <>
              <span>Launch & Dispatch Campaign ({matchingSchools.length} recipients)</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
