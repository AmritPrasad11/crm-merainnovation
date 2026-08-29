'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Building2, MapPin, CheckCircle2, ArrowRight, Sparkles } from '@/components/Icons';
import Link from 'next/link';

export default function DuplicateHubClient({ initialPairs }: { initialPairs: any[] }) {
  const router = useRouter();
  const [pairs, setPairs] = useState(initialPairs);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleMerge = async (primaryId: string, secondaryId: string) => {
    setLoadingId(primaryId + '_' + secondaryId);
    try {
      const res = await fetch('/api/schools/duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ primarySchoolId: primaryId, secondarySchoolId: secondaryId }),
      });

      if (res.ok) {
        setPairs((prev) =>
          prev.filter(
            (p) =>
              !(p.schoolA.id === primaryId && p.schoolB.id === secondaryId) &&
              !(p.schoolA.id === secondaryId && p.schoolB.id === primaryId)
          )
        );
        router.refresh();
      }
    } finally {
      setLoadingId(null);
    }
  };

  const handleDismissPair = (schoolAId: string, schoolBId: string) => {
    setPairs((prev) =>
      prev.filter(
        (p) =>
          !(p.schoolA.id === schoolAId && p.schoolB.id === schoolBId) &&
          !(p.schoolA.id === schoolBId && p.schoolB.id === schoolAId)
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Duplicate Resolution Hub</h1>
          <p className="text-xs text-slate-500 mt-1">
            Detect and resolve duplicate school records across the CRM database.
          </p>
        </div>
        <span className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold rounded-full">
          {pairs.length} Candidate Pair(s)
        </span>
      </div>

      {pairs.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900">No Duplicates Found</h3>
          <p className="text-xs text-slate-500">
            All active school records in your CRM database are unique.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pairs.map((pair, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4 text-xs">
              <div className="flex items-center justify-between bg-amber-50/80 p-3 rounded-xl border border-amber-200 text-amber-900 font-semibold">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Match Reasons: {pair.reasons.join(' • ')}</span>
                </div>
                <button
                  onClick={() => handleDismissPair(pair.schoolA.id, pair.schoolB.id)}
                  className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-lg border text-[11px]"
                >
                  Dismiss / Keep Both Separate
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* School A */}
                <div className="bg-slate-50 p-4 rounded-xl border space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link href={`/schools/${pair.schoolA.id}`} className="font-bold text-sm text-slate-900 hover:text-blue-600">
                        {pair.schoolA.name}
                      </Link>
                      <div className="text-slate-500 mt-0.5">{pair.schoolA.city}, {pair.schoolA.state}</div>
                    </div>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded text-[10px]">
                      Stage: {pair.schoolA.salesStage}
                    </span>
                  </div>

                  <div className="text-slate-600 space-y-1 pt-2 border-t">
                    <div>Email: {pair.schoolA.primaryEmail || 'N/A'}</div>
                    <div>Phone: {pair.schoolA.primaryPhone || 'N/A'}</div>
                    <div>Assignee: {pair.schoolA.assignedUser?.name || 'Unassigned'}</div>
                  </div>

                  <button
                    onClick={() => handleMerge(pair.schoolA.id, pair.schoolB.id)}
                    disabled={loadingId === pair.schoolA.id + '_' + pair.schoolB.id}
                    className="w-full mt-2 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg cursor-pointer"
                  >
                    Keep Record A (Merge B into A)
                  </button>
                </div>

                {/* School B */}
                <div className="bg-slate-50 p-4 rounded-xl border space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link href={`/schools/${pair.schoolB.id}`} className="font-bold text-sm text-slate-900 hover:text-blue-600">
                        {pair.schoolB.name}
                      </Link>
                      <div className="text-slate-500 mt-0.5">{pair.schoolB.city}, {pair.schoolB.state}</div>
                    </div>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded text-[10px]">
                      Stage: {pair.schoolB.salesStage}
                    </span>
                  </div>

                  <div className="text-slate-600 space-y-1 pt-2 border-t">
                    <div>Email: {pair.schoolB.primaryEmail || 'N/A'}</div>
                    <div>Phone: {pair.schoolB.primaryPhone || 'N/A'}</div>
                    <div>Assignee: {pair.schoolB.assignedUser?.name || 'Unassigned'}</div>
                  </div>

                  <button
                    onClick={() => handleMerge(pair.schoolB.id, pair.schoolA.id)}
                    disabled={loadingId === pair.schoolB.id + '_' + pair.schoolA.id}
                    className="w-full mt-2 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg cursor-pointer"
                  >
                    Keep Record B (Merge A into B)
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
