'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, X, AlertTriangle, Archive, CheckCircle2 } from '@/components/Icons';

interface ArchiveSchoolModalProps {
  school: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ArchiveSchoolModal({
  school,
  isOpen,
  onClose,
  onSuccess,
}: ArchiveSchoolModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !school) return null;

  const handleConfirmArchive = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/schools/${school.id}/archive`, {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to archive school');
      }

      onSuccess();
      onClose();
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred while archiving');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-xs animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 bg-rose-950 text-white flex items-center justify-between border-b border-rose-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/20 rounded-xl border border-rose-500/30">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Archive School Record</h2>
              <p className="text-[11px] text-rose-300">Action requires administrator permission</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-rose-300 hover:text-white hover:bg-rose-900 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-4 bg-rose-50/60 border border-rose-200/80 rounded-xl space-y-2">
            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span>{school.name}</span>
              <span className="text-[11px] font-normal text-slate-500">
                ({school.city}, {school.state})
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Are you sure you want to archive this school?
            </p>
          </div>

          <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Data Integrity Guarantee:</span>
            </div>
            <p className="text-amber-800 leading-relaxed">
              Archiving removes <strong>{school.name}</strong> from the active school directory. All
              historical activities, contacts, message logs, proposals, and MOU agreements will be{' '}
              <strong>safely preserved</strong> without any data loss.
            </p>
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
              onClick={handleConfirmArchive}
              disabled={loading}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all shadow-md shadow-rose-600/30 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {loading ? (
                <span>Archiving...</span>
              ) : (
                <>
                  <Archive className="w-3.5 h-3.5" />
                  <span>Confirm Archive</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
