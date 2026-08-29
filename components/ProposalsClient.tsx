'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Plus, CheckCircle2, AlertTriangle, Building2, User, Sparkles, Edit } from '@/components/Icons';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

interface ProposalsClientProps {
  proposals: any[];
  schools: any[];
}

export default function ProposalsClient({ proposals, schools }: ProposalsClientProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [schoolId, setSchoolId] = useState('');
  const [title, setTitle] = useState('');
  const [version, setVersion] = useState('1.0');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'SENT' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED'>('SENT');
  const [documentUrl, setDocumentUrl] = useState('');
  const [notes, setNotes] = useState('');

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId || !title) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId,
          title,
          version,
          amount,
          status,
          documentUrl,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create proposal');

      setShowModal(false);
      setTitle('');
      setAmount('');
      setNotes('');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (proposalId: string, newStatus: string) => {
    setLoading(true);
    try {
      await fetch('/api/proposals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: proposalId, status: newStatus }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const totalValue = proposals.reduce((acc, p) => acc + (p.amount || 0), 0);

  return (
    <div className="space-y-6 text-xs">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Commercial Proposal Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, version, and track commercial proposals and pricing quotes.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold shadow-md shadow-blue-600/30 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Proposal</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="text-[10px] uppercase font-semibold text-slate-500">Total Proposals</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{proposals.length}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="text-[10px] uppercase font-semibold text-purple-800">Under Review / Sent</div>
          <div className="text-2xl font-black text-purple-600 mt-1">
            {proposals.filter((p) => p.status === 'SENT' || p.status === 'UNDER_REVIEW').length}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="text-[10px] uppercase font-semibold text-emerald-800">Accepted Proposals</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {proposals.filter((p) => p.status === 'ACCEPTED').length}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="text-[10px] uppercase font-semibold text-blue-800">Total Pipeline Value</div>
          <div className="text-2xl font-black text-blue-600 mt-1">
            INR {(totalValue / 100000).toFixed(2)} Lakhs
          </div>
        </div>
      </div>

      {/* Proposal Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {proposals.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-2">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700">No Proposals Created</h3>
            <p className="text-slate-500">Create commercial proposals for schools in your sales pipeline.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="p-4">Proposal Title & Version</th>
                  <th className="p-4">School</th>
                  <th className="p-4">Commercial Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created By</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {proposals.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">{p.title}</div>
                      <div className="text-slate-500 text-[11px]">Version {p.version}</div>
                    </td>

                    <td className="p-4">
                      <Link href={`/schools/${p.schoolId}`} className="font-semibold text-slate-900 hover:text-blue-600 block">
                        {p.school?.name}
                      </Link>
                      <span className="text-slate-500 text-[11px]">
                        {p.school?.city}, {p.school?.state}
                      </span>
                    </td>

                    <td className="p-4 font-extrabold text-slate-900">
                      {p.amount ? `INR ${p.amount.toLocaleString('en-IN')}` : 'Custom Quote'}
                    </td>

                    <td className="p-4">
                      <select
                        value={p.status}
                        onChange={(e) => handleStatusChange(p.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border cursor-pointer ${
                          p.status === 'ACCEPTED'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : p.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-purple-100 text-purple-800 border-purple-300'
                        }`}
                      >
                        <option value="DRAFT">DRAFT</option>
                        <option value="SENT">SENT</option>
                        <option value="UNDER_REVIEW">UNDER REVIEW</option>
                        <option value="ACCEPTED">ACCEPTED</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                    </td>

                    <td className="p-4 text-slate-500">{p.createdBy?.name || 'Admin'}</td>

                    <td className="p-4 text-right">
                      <Link
                        href={`/schools/${p.schoolId}`}
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

      {/* CREATE PROPOSAL MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border">
            <h3 className="font-bold text-sm text-slate-900">Create Commercial Proposal</h3>

            {error && <div className="p-3 bg-rose-50 text-rose-700 rounded-xl">{error}</div>}

            <form onSubmit={handleCreateProposal} className="space-y-4">
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
                <label className="block font-semibold text-slate-700 mb-1">Proposal Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 50-Student Robotics & IoT Lab Setup Proposal"
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Version</label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="1.0"
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount (INR)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 450000"
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-semibold"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="SENT">SENT</option>
                  <option value="UNDER_REVIEW">UNDER REVIEW</option>
                  <option value="ACCEPTED">ACCEPTED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Terms</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Includes 1 year hardware warranty, curriculum kits & trainer support..."
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
                  Save Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
