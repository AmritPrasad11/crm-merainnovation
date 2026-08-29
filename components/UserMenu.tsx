'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserSession } from '@/lib/types';
import { User, LogOut, ChevronDown, Shield } from '@/components/Icons';

export default function UserMenu({ user }: { user: UserSession }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-xs text-slate-200 transition-colors border border-slate-700/60 cursor-pointer"
      >
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
          {user.name.charAt(0)}
        </div>
        <div className="text-left hidden sm:block">
          <div className="font-semibold text-white leading-tight">{user.name}</div>
          <div className="text-[10px] text-slate-400 leading-tight">{user.role}</div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-2 z-50 text-xs text-slate-300"
          onMouseLeave={() => setOpen(false)}
        >
          <div className="px-4 py-2 border-b border-slate-800">
            <div className="font-semibold text-white">{user.name}</div>
            <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Shield className="w-2.5 h-2.5" />
              {user.role}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2.5 hover:bg-slate-800 text-rose-400 flex items-center gap-2 cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
