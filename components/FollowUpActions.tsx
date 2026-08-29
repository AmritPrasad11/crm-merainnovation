'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from '@/components/Icons';

export default function FollowUpActions({
  schoolId,
  followUpId,
}: {
  schoolId: string;
  followUpId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    try {
      await fetch(`/api/schools/${schoolId}/follow-ups`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followUpId, status: 'COMPLETED' }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleComplete}
      disabled={loading}
      className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-[11px] transition-colors cursor-pointer"
    >
      <CheckCircle2 className="w-3 h-3" />
      <span>{loading ? 'Marking...' : 'Mark Done'}</span>
    </button>
  );
}
