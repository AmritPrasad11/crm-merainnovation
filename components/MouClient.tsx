'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileCheck, Plus, CheckCircle2, AlertTriangle, Building2, User, Sparkles } from '@/components/Icons';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

interface MouClientProps {
  mous: any[];
  schools: any[];
}

export default function MouClient({ mous, schools }: MouClientProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [schoolId, setSchoolId] = useState('');
  const [mouVersion, setMouVersion] = useState('1.0');
  const [status, setStatus] = useState<'NOT_SENT' | 'SENT' | 'UNDER_REVIEW' | 'SIGNED' | 'REJECTED'>('SENT');
  const [documentUrl, setDocumentUrl] = useState('');
  const [notes, setNotes] = useState('');

  const handleCreateMou = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/mou', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId,
          mouVersion,
          status,
          documentUrl,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create MOU');

      setShowModal(false);
      setNotes('');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (mouId: string, newStatus: string) => {
    setLoading(true);
    try {
      await fetch('/api/mou', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: mouId, status: newStatus }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const signedMousCount = mous.filter((m) => m.status === 'SIGNED').length;

  return (
    <div className="space-y-6 text-xs">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">MOU Legal Agreements</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track Memorandum of Understanding (MOU) dispatches, reviews, and signed legal contracts.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold shadow-md shadow-blue-600/30 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Dispatch / Add MOU</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="text-[10px] uppercase font-semibold text-slate-500">Total MOUs</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{mous.length}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="text-[10px] uppercase font-semibold text-pink-800">MOUs Sent / Review</div>
          <div className="text-2xl font-black text-pink-600 mt-1">
            {mous.filter((m) => m.status === 'SENT' || m.status === 'UNDER_REVIEW').length}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="text-[10px] uppercase font-semibold text-emerald-800">Signed & Executed</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{signedMousCount}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="text-[10px] uppercase font-semibold text-teal-800">MOU Execution Rate</div>
          <div className="text-2xl font-black text-teal-600 mt-1">
            {mous.length > 0 ? ((signedMousCount / mous.length) * 100).toFixed(0) : '0'}%
          </div>
        </div>
      </div>

      {/* MOU Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {mous.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-2">
            <FileCheck className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700">No MOUs Created</h3>
            <p className="text-slate-500">Add MOU agreements when schools reach final proposal acceptance.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="p-4">MOU Version</th>
                  <th className="p-4">School</th>
                  <th className="p-4">Current Stage</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Sent / Signed Dates</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mous.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">Version {m.mouVersion}</div>
                    </td>

                    <td className="p-4">
                      <Link href={`/schools/${m.schoolId}`} className="font-semibold text-slate-900 hover:text-blue-600 block">
                        {m.school?.name}
                      </Link>
                      <span className="text-slate-500 text-[11px]">
                        {m.school?.city}, {m.school?.state}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-800">
                        {m.school?.salesStage}
                      </span>
                    </td>

                    <td className="p-4">
                      <select
                        value={m.status}
                        onChange={(e) => handleStatusChange(m.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border cursor-pointer ${
                          m.status === 'SIGNED'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : m.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-pink-100 text-pink-800 border-pink-300'
                        }`}
                      >
                        <option value="NOT_SENT">NOT SENT</option>
                        <option value="SENT">SENT</option>
                        <option value="UNDER_REVIEW">UNDER REVIEW</option>
                        <option value="SIGNED">SIGNED ✔</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                    </td>

                    <td className="p-4 text-slate-500">
                      <div>Sent: {formatDate(m.sentDate || m.createdAt)}</div>
                      {m.signedDate && <div className="text-emerald-700 font-bold">Signed: {formatDate(m.signedDate)}</div>}
                    </td>

                    <td className="p-4 text-right">
                      <Link
                        href={`/schools/${m.schoolId}`}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 rounded-xl font-semibold transition-colors"
                      >
                        View School
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE MOU MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border">
            <h3 className="font-bold text-sm text-slate-900">Dispatch / Add MOU Record</h3>

            {error && <div className="p-3 bg-rose-50 text-rose-700 rounded-xl">{error}</div>}

            <form onSubmit={handleCreateMou} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target School *</label>
                <select
                  required
                  value={schoolId}
                  onChange={(e) => setSchoolId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-semibold"
                >
                  <option value="">-- Select School --</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.city}, {s.state})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">MOU Version</label>
                <input
                  type="text"
                  value={mouVersion}
                  onChange={(e) => setMouVersion(e.target.value)}
                  placeholder="1.0"
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">MOU Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-semibold"
                >
                  <option value="NOT_SENT">NOT SENT</option>
                  <option value="SENT">SENT</option>
                  <option value="UNDER_REVIEW">UNDER REVIEW</option>
                  <option value="SIGNED">SIGNED (Advances School to MOU_SIGNED)</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Legal Terms</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="3-year STEM lab partnership MOU draft..."
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-800 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold cursor-pointer"
                >
                  Save MOU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
