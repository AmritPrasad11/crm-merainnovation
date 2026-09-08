'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, X, AlertTriangle, Trash } from '@/components/Icons';

interface DeleteSchoolModalProps {
  school: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteSchoolModal({
  school,
  isOpen,
  onClose,
  onSuccess,
}: DeleteSchoolModalProps) {
  const router = useRouter();
  const [typedName, setTypedName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !school) return null;

  const isConfirmed = typedName.trim() === school.name.trim();

  const handlePermanentDelete = async () => {
    if (!isConfirmed) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/schools/${school.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmName: typedName.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to permanently delete school');
      }

      onSuccess();
      onClose();
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred during permanent deletion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-rose-200 overflow-hidden text-xs animate-in fade-in zoom-in-95 duration-200">
        {/* Danger Header */}
        <div className="px-5 py-4 bg-rose-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <Trash className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Permanently Delete School?</h2>
              <p className="text-[11px] text-rose-100">Administrator Permanent Destructive Action</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-rose-100 hover:text-white hover:bg-rose-700 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-rose-900">
            <div className="font-bold text-sm flex items-center gap-1.5 text-rose-950">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>CRITICAL WARNING</span>
            </div>
            <p className="text-[11px] leading-relaxed text-rose-800">
              This action will <strong>permanently delete</strong> school <strong>{school.name}</strong> and all of its associated contacts, activities, follow-ups, proposals, MOUs, and message logs from the database.
            </p>
            <p className="text-[11px] font-bold text-rose-900">
              This action CANNOT be undone.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block font-semibold text-slate-700">
              To confirm, type <span className="font-bold text-slate-900 select-all">&quot;{school.name}&quot;</span> below:
            </label>
            <input
              type="text"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder={school.name}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none text-xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePermanentDelete}
              disabled={!isConfirmed || loading}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all shadow-md shadow-rose-600/30 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
            >
              {loading ? (
                <span>Deleting...</span>
              ) : (
                <>
                  <Trash className="w-3.5 h-3.5" />
                  <span>Permanently Delete</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
