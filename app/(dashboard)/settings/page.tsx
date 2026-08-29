import { getCurrentUser } from '@/lib/auth';
import { Settings, ShieldCheck, Database, Mail, MessageSquare, Server, Globe } from '@/components/Icons';

export default async function SettingsPage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          CRM configuration, environment variable status, and integration provider interfaces.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-600 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Authenticated User Profile</span>
          </h2>
          <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div><span className="font-semibold text-slate-500">Name:</span> <span className="font-bold text-slate-900">{user?.name}</span></div>
            <div><span className="font-semibold text-slate-500">Email:</span> <span className="font-bold text-slate-900">{user?.email}</span></div>
            <div><span className="font-semibold text-slate-500">Role:</span> <span className="font-bold text-blue-600">{user?.role}</span></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-600 flex items-center gap-2">
            <Server className="w-4 h-4" />
            <span>Architecture & Provider Status</span>
          </h2>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border">
              <span className="font-semibold flex items-center gap-2"><Database className="w-4 h-4 text-blue-600" /> Database ORM</span>
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">PostgreSQL (Prisma)</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border">
              <span className="font-semibold flex items-center gap-2"><Mail className="w-4 h-4 text-purple-600" /> Email Channel</span>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 font-bold rounded-full text-[10px]">Provider Interface Ready</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border">
              <span className="font-semibold flex items-center gap-2"><MessageSquare className="w-4 h-4 text-emerald-600" /> WhatsApp Channel</span>
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">Meta Cloud API Ready</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border">
              <span className="font-semibold flex items-center gap-2"><Globe className="w-4 h-4 text-slate-600" /> Target Domain</span>
              <span className="font-bold text-slate-900">crm.merainnovation.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
