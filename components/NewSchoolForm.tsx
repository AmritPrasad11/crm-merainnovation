'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  MapPin,
  Globe,
  User,
  Mail,
  Phone,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
} from '@/components/Icons';
import { SCHOOL_BOARDS, SCHOOL_TYPES, CONTACT_DESIGNATIONS, SALES_STAGE_PIPELINE } from '@/lib/types';
import Link from 'next/link';

interface NewSchoolFormProps {
  users: { id: string; name: string; role: string }[];
  currentUserId: string;
}

export default function NewSchoolForm({ users, currentUserId }: NewSchoolFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    city: '',
    state: '',
    address: '',
    website: '',
    board: 'CBSE',
    schoolType: 'Private',
    studentStrength: '',
    hasStemLab: false,
    hasRoboticsLab: false,
    source: 'Cold Outreach',
    assignedUserId: currentUserId,
    salesStage: 'NEW',
    notes: '',
    contactName: '',
    contactDesignation: 'Principal',
    contactEmail: '',
    contactPhone: '',
    contactWhatsapp: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent, bypass = false) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!bypass) setDuplicateWarning(null);

    try {
      const res = await fetch('/api/schools/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, bypassDuplicateCheck: bypass }),
      });

      const data = await res.json();

      if (res.status === 409 && data.isDuplicate) {
        setDuplicateWarning(data);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create school');
      }

      router.push(`/schools/${data.school.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {duplicateWarning && (
        <div className="p-5 bg-amber-50 border-2 border-amber-300 text-amber-900 rounded-2xl space-y-3 shadow-md">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Duplicate School Detected</span>
          </div>
          <ul className="text-xs space-y-1 list-disc pl-5 text-amber-800">
            {duplicateWarning.reasons.map((r: string, idx: number) => (
              <li key={idx}>{r}</li>
            ))}
          </ul>
          {duplicateWarning.matchedSchool && (
            <div className="p-3 bg-white/80 rounded-xl border border-amber-200 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold">{duplicateWarning.matchedSchool.name}</span> &bull;{' '}
                {duplicateWarning.matchedSchool.city}, {duplicateWarning.matchedSchool.state} (Stage:{' '}
                {duplicateWarning.matchedSchool.salesStage})
              </div>
              <Link
                href={`/schools/${duplicateWarning.matchedSchool.id}`}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-[11px]"
              >
                View Existing
              </Link>
            </div>
          )}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              Proceed & Save Duplicate Record Anyway
            </button>
            <button
              type="button"
              onClick={() => setDuplicateWarning(null)}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold"
            >
              Cancel & Modify Info
            </button>
          </div>
        </div>
      )}

      {/* School General Info Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-600 flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          <span>School Profile Information</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">
              School Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. St. Xavier Public School"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              City <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="city"
              required
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g. Jaipur"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              State <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="state"
              required
              value={formData.state}
              onChange={handleChange}
              placeholder="e.g. Rajasthan"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Full Street Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. C-Scheme, Main Road"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">School Website</label>
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="e.g. www.stxaviersjaipur.edu.in"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Board</label>
            <select
              name="board"
              value={formData.board}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {SCHOOL_BOARDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">School Type</label>
            <select
              name="schoolType"
              value={formData.schoolType}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {SCHOOL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Student Strength</label>
            <input
              type="number"
              name="studentStrength"
              value={formData.studentStrength}
              onChange={handleChange}
              placeholder="e.g. 2400"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2 flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
              <input
                type="checkbox"
                name="hasStemLab"
                checked={formData.hasStemLab}
                onChange={handleChange}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span>Existing STEM Lab?</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
              <input
                type="checkbox"
                name="hasRoboticsLab"
                checked={formData.hasRoboticsLab}
                onChange={handleChange}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span>Existing Robotics Lab?</span>
            </label>
          </div>
        </div>
      </div>

      {/* Primary Contact Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-600 flex items-center gap-2">
          <User className="w-4 h-4" />
          <span>Primary Contact Person</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Contact Person Name</label>
            <input
              type="text"
              name="contactName"
              value={formData.contactName}
              onChange={handleChange}
              placeholder="e.g. Dr. R. K. Sharma"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Designation</label>
            <select
              name="contactDesignation"
              value={formData.contactDesignation}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {CONTACT_DESIGNATIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              placeholder="principal@stxaviersjaipur.edu.in"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              placeholder="+91 98290 12345"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">WhatsApp Number</label>
            <input
              type="text"
              name="contactWhatsapp"
              value={formData.contactWhatsapp}
              onChange={handleChange}
              placeholder="+91 98290 12345"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Assignment & Sales Stage Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-600 flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          <span>Pipeline & Ownership</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Assigned Sales User</label>
            <select
              name="assignedUserId"
              value={formData.assignedUserId}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Initial Sales Stage</label>
            <select
              name="salesStage"
              value={formData.salesStage}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {SALES_STAGE_PIPELINE.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Lead Source</label>
            <input
              type="text"
              name="source"
              value={formData.source}
              onChange={handleChange}
              placeholder="e.g. Bulk Import, Direct Call"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block font-semibold text-slate-700 mb-1">Initial Notes</label>
            <textarea
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add key insights, lab requirement notes, or follow-up details..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          href="/schools"
          className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/30 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
        >
          {loading ? (
            <span>Saving School...</span>
          ) : (
            <>
              <span>Save & View School</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
