'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { interpolateTemplateVariables } from '@/lib/providers/email';
import {
  LayoutTemplate,
  Plus,
  Mail,
  MessageSquare,
  Sparkles,
  Trash,
  CheckCircle2,
  AlertTriangle,
  Edit,
} from '@/components/Icons';

export default function TemplateManagerClient({ initialTemplates }: { initialTemplates: any[] }) {
  const router = useRouter();
  const [templates, setTemplates] = useState(initialTemplates);
  const [activeChannel, setActiveChannel] = useState<'EMAIL' | 'WHATSAPP'>('EMAIL');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [channel, setChannel] = useState<'EMAIL' | 'WHATSAPP'>('EMAIL');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [metaTemplateId, setMetaTemplateId] = useState('');

  // Live Preview test variable state
  const [testSchool, setTestSchool] = useState('St. Xavier Public School');
  const [testContact, setTestContact] = useState('Dr. R. K. Sharma');
  const [testCity, setTestCity] = useState('Jaipur');
  const [testDesignation, setTestDesignation] = useState('Principal');
  const [testUser, setTestUser] = useState('Amrit');

  const filteredTemplates = templates.filter((t) => t.channel === activeChannel);

  const insertVariable = (varName: string) => {
    setContent((prev) => `${prev} {{${varName}}}`);
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          channel,
          subject,
          content,
          metaTemplateId,
          variables: 'school_name,contact_name,city,designation,assigned_user',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create template');

      setShowModal(false);
      setName('');
      setSubject('');
      setContent('');
      setMetaTemplateId('');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await fetch(`/api/templates?id=${id}`, { method: 'DELETE' });
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const previewContent = interpolateTemplateVariables(content, {
    school_name: testSchool,
    contact_name: testContact,
    city: testCity,
    designation: testDesignation,
    assigned_user: testUser,
  });

  const previewSubject = interpolateTemplateVariables(subject, {
    school_name: testSchool,
    contact_name: testContact,
    city: testCity,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Message Template Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Create dynamic Email & Meta WhatsApp message templates with dynamic variable interpolation.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md shadow-blue-600/30 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Template</span>
        </button>
      </div>

      {/* Channel Selector Tabs */}
      <div className="flex border-b border-slate-200 gap-2 text-xs font-semibold">
        <button
          onClick={() => setActiveChannel('EMAIL')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors cursor-pointer ${
            activeChannel === 'EMAIL'
              ? 'border-blue-600 text-blue-600 bg-white font-bold rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Mail className="w-4 h-4 text-purple-600" />
          <span>Email Templates ({templates.filter((t) => t.channel === 'EMAIL').length})</span>
        </button>

        <button
          onClick={() => setActiveChannel('WHATSAPP')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors cursor-pointer ${
            activeChannel === 'WHATSAPP'
              ? 'border-emerald-600 text-emerald-600 bg-white font-bold rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-600" />
          <span>Meta WhatsApp Templates ({templates.filter((t) => t.channel === 'WHATSAPP').length})</span>
        </button>
      </div>

      {/* Template Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {filteredTemplates.length === 0 ? (
          <div className="md:col-span-2 bg-white p-12 rounded-2xl border text-center space-y-3">
            <LayoutTemplate className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700">No {activeChannel} Templates</h3>
            <p className="text-slate-500">Create your first template to use in outreach campaigns.</p>
          </div>
        ) : (
          filteredTemplates.map((tpl) => (
            <div key={tpl.id} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{tpl.name}</h3>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                      Channel: {tpl.channel}
                    </div>
                  </div>
                  {tpl.metaStatus && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200">
                      META {tpl.metaStatus}
                    </span>
                  )}
                </div>

                {tpl.subject && (
                  <div className="p-2 bg-slate-50 rounded-lg border font-semibold text-slate-800">
                    Subject: {tpl.subject}
                  </div>
                )}

                <div className="p-3 bg-slate-50 rounded-xl border font-mono text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {tpl.content}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-slate-500">
                <span className="text-[11px]">Variables: {tpl.variables || 'Default'}</span>
                <button
                  onClick={() => handleDeleteTemplate(tpl.id)}
                  className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Trash className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE TEMPLATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full space-y-4 shadow-2xl border text-xs my-8">
            <h3 className="font-bold text-sm text-slate-900">Create Message Template</h3>

            {error && <div className="p-3 bg-rose-50 text-rose-700 rounded-xl">{error}</div>}

            <form onSubmit={handleCreateTemplate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Template Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. STEM Lab Intro Email"
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Channel</label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-semibold"
                  >
                    <option value="EMAIL">EMAIL (Custom HTML / Text)</option>
                    <option value="WHATSAPP">WHATSAPP (Meta Business Template)</option>
                  </select>
                </div>
              </div>

              {channel === 'EMAIL' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Subject Line</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Transforming STEM Education at {{school_name}}"
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>
              )}

              {channel === 'WHATSAPP' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Meta WhatsApp Template Name / ID</label>
                  <input
                    type="text"
                    value={metaTemplateId}
                    onChange={(e) => setMetaTemplateId(e.target.value)}
                    placeholder="e.g. mera_robotics_demo_intro"
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Template Content Body</label>
                  <span className="text-[11px] text-slate-400">Click chips to insert dynamic variable</span>
                </div>

                {/* Variable Chips */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {['school_name', 'contact_name', 'city', 'designation', 'assigned_user'].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => insertVariable(v)}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                    >
                      + {'{{' + v + '}}'}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={5}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Dear {{contact_name}}, greetings from Mera Innovation! We would love to set up a STEM lab at {{school_name}} in {{city}}..."
                  className="w-full p-3 bg-slate-50 border rounded-xl font-mono text-xs"
                />
              </div>

              {/* Real-time Interpolation Live Preview Box */}
              {content && (
                <div className="p-4 bg-slate-900 text-slate-200 rounded-xl space-y-2 border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-blue-400 tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Live Interpolation Preview
                  </div>
                  {channel === 'EMAIL' && (
                    <div className="font-semibold text-white border-b border-slate-800 pb-1">
                      Subject: {previewSubject}
                    </div>
                  )}
                  <div className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                    {previewContent}
                  </div>
                </div>
              )}

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
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
