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
  Award,
  Clock,
  Calendar,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Microscope,
  Bot,
  FileText,
  FileCheck,
  ChevronRight,
  Shield,
  Edit,
  ArrowUpRight,
} from '@/components/Icons';
import {
  SALES_STAGE_PIPELINE,
  SALES_STAGE_OUTCOMES,
  CONTACT_DESIGNATIONS,
  ActivityType,
} from '@/lib/types';
import { formatDate, formatDateTime } from '@/lib/utils';
import Link from 'next/link';

interface SchoolDetailProps {
  school: any;
  allUsers: { id: string; name: string; role: string }[];
  currentUserId: string;
  currentUserRole: string;
}

export default function SchoolDetailClient({
  school,
  allUsers,
  currentUserId,
  currentUserRole,
}: SchoolDetailProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'timeline' | 'followups' | 'proposals' | 'mou'>('overview');
  const [loading, setLoading] = useState(false);

  // Modals state
  const [showStageModal, setShowStageModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState(school.salesStage);
  const [stageNote, setStageNote] = useState('');

  const [showActivityModal, setShowActivityModal] = useState(false);
  const [actType, setActType] = useState<ActivityType>('CALL');
  const [actTitle, setActTitle] = useState('');
  const [actDescription, setActDescription] = useState('');

  const [showContactModal, setShowContactModal] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactDesignation, setContactDesignation] = useState('STEM Coordinator');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactWhatsapp, setContactWhatsapp] = useState('');
  const [isPrimaryContact, setIsPrimaryContact] = useState(false);

  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [fuTitle, setFuTitle] = useState('');
  const [fuDueDate, setFuDueDate] = useState('');
  const [fuAssignee, setFuAssignee] = useState(currentUserId);
  const [fuNotes, setFuNotes] = useState('');

  const allStages = [...SALES_STAGE_PIPELINE, ...SALES_STAGE_OUTCOMES];
  const currentStageObj = allStages.find((s) => s.key === school.salesStage);

  // Handlers
  const handleUpdateStage = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/schools/${school.id}/update-stage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newStage: selectedStage, note: stageNote }),
      });
      if (res.ok) {
        setShowStageModal(false);
        setStageNote('');
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogActivity = async () => {
    if (!actTitle) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/schools/${school.id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: actType, title: actTitle, description: actDescription }),
      });
      if (res.ok) {
        setShowActivityModal(false);
        setActTitle('');
        setActDescription('');
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async () => {
    if (!contactName) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/schools/${school.id}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName,
          designation: contactDesignation,
          email: contactEmail,
          phone: contactPhone,
          whatsapp: contactWhatsapp || contactPhone,
          isPrimary: isPrimaryContact,
        }),
      });
      if (res.ok) {
        setShowContactModal(false);
        setContactName('');
        setContactEmail('');
        setContactPhone('');
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleFollowUp = async () => {
    if (!fuTitle || !fuDueDate) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/schools/${school.id}/follow-ups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: fuTitle,
          dueDate: fuDueDate,
          assignedUserId: fuAssignee,
          notes: fuNotes,
        }),
      });
      if (res.ok) {
        setShowFollowUpModal(false);
        setFuTitle('');
        setFuDueDate('');
        setFuNotes('');
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUpStatus = async (followUpId: string, status: string) => {
    setLoading(true);
    try {
      await fetch(`/api/schools/${school.id}/follow-ups`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followUpId, status }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{school.name}</h1>
              <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold rounded-full flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                Score: {school.leadScore}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {school.city}, {school.state}
              </span>
              <span>&bull;</span>
              <span>Board: {school.board || 'N/A'}</span>
              <span>&bull;</span>
              <span>Assigned: {school.assignedUser?.name || 'Unassigned'}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedStage(school.salesStage);
                setShowStageModal(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Update Sales Stage</span>
            </button>
            <button
              onClick={() => setShowActivityModal(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Activity</span>
            </button>
            <button
              onClick={() => setShowFollowUpModal(true)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Add Follow-up</span>
            </button>
          </div>
        </div>

        {/* Pipeline Progress Stepper */}
        <div className="pt-4 border-t border-slate-100">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Sales Pipeline Stage Progress</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                currentStageObj?.color || 'bg-slate-100'
              }`}
            >
              {currentStageObj?.label || school.salesStage}
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5">
            {SALES_STAGE_PIPELINE.map((stageItem, idx) => {
              const currentIdx = SALES_STAGE_PIPELINE.findIndex((s) => s.key === school.salesStage);
              const isPassed = currentIdx !== -1 && idx <= currentIdx;
              const isCurrent = school.salesStage === stageItem.key;

              return (
                <button
                  key={stageItem.key}
                  onClick={() => {
                    setSelectedStage(stageItem.key);
                    setShowStageModal(true);
                  }}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-md shadow-blue-600/30'
                      : isPassed
                      ? 'bg-blue-50 text-blue-800 border-blue-200 font-semibold'
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-[10px] uppercase tracking-wider opacity-75">Step {idx + 1}</div>
                  <div className="text-[11px] font-bold truncate mt-0.5">{stageItem.label}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto text-xs font-semibold">
        {[
          { key: 'overview', label: 'Overview & Details', icon: Building2 },
          { key: 'contacts', label: `Contacts (${school.contacts.length})`, icon: User },
          { key: 'timeline', label: `Activity Timeline (${school.activities.length})`, icon: Clock },
          { key: 'followups', label: `Follow-ups (${school.followUps.length})`, icon: Calendar },
          { key: 'proposals', label: `Proposals (${school.proposals.length})`, icon: FileText },
          { key: 'mou', label: `MOU (${school.mous.length})`, icon: FileCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-blue-600 text-blue-600 bg-white font-bold rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm min-h-[400px]">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6 text-xs text-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-600">
                  School Metadata
                </h3>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                  <div className="flex justify-between border-b border-slate-200/60 pb-2">
                    <span className="font-semibold text-slate-500">Board:</span>
                    <span className="font-bold text-slate-900">{school.board || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-2">
                    <span className="font-semibold text-slate-500">School Type:</span>
                    <span className="font-bold text-slate-900">{school.schoolType || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-2">
                    <span className="font-semibold text-slate-500">Student Strength:</span>
                    <span className="font-bold text-slate-900">{school.studentStrength || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-2">
                    <span className="font-semibold text-slate-500">Lead Source:</span>
                    <span className="font-bold text-slate-900">{school.source || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">Created Date:</span>
                    <span className="font-bold text-slate-900">{formatDate(school.createdAt)}</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-600 pt-2">
                  Lab & Infrastructure Status
                </h3>
                <div className="flex gap-4">
                  <div
                    className={`flex-1 p-4 rounded-xl border ${
                      school.hasStemLab
                        ? 'bg-blue-50/80 border-blue-200 text-blue-900'
                        : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <Microscope className="w-4 h-4 text-blue-600" />
                      <span>STEM Lab</span>
                    </div>
                    <p className="mt-1 text-[11px]">
                      {school.hasStemLab ? 'Existing STEM lab facility on campus' : 'No existing STEM lab'}
                    </p>
                  </div>

                  <div
                    className={`flex-1 p-4 rounded-xl border ${
                      school.hasRoboticsLab
                        ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900'
                        : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <Bot className="w-4 h-4 text-indigo-600" />
                      <span>Robotics Lab</span>
                    </div>
                    <p className="mt-1 text-[11px]">
                      {school.hasRoboticsLab ? 'Existing robotics lab setup' : 'No robotics lab setup'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-600">
                  Primary Contact & Address
                </h3>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                  <div>
                    <span className="font-semibold text-slate-500 block mb-1">Website:</span>
                    {school.website ? (
                      <a
                        href={`https://${school.website.replace(/^https?:\/\//, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        {school.website}
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">Not provided</span>
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 block mb-1">Primary Email:</span>
                    <span className="font-bold text-slate-900">{school.primaryEmail || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 block mb-1">Primary Phone:</span>
                    <span className="font-bold text-slate-900">{school.primaryPhone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 block mb-1">Full Address:</span>
                    <span className="text-slate-800">{school.address || `${school.city}, ${school.state}`}</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-600 pt-2">
                  Account Notes
                </h3>
                <div className="p-4 bg-amber-50/50 border border-amber-200/80 rounded-xl text-amber-900 leading-relaxed italic">
                  {school.notes || 'No account notes added yet.'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONTACTS TAB */}
        {activeTab === 'contacts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">School Contacts</h3>
                <p className="text-xs text-slate-500">
                  Key stakeholders, principal, STEM & robotics coordinators.
                </p>
              </div>
              <button
                onClick={() => setShowContactModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Contact</span>
              </button>
            </div>

            {school.contacts.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-8 text-center">
                No contacts listed for this school.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {school.contacts.map((c: any) => (
                  <div
                    key={c.id}
                    className={`p-4 rounded-xl border ${
                      c.isPrimary ? 'bg-blue-50/60 border-blue-200' : 'bg-slate-50 border-slate-200'
                    } space-y-2 text-xs`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                          {c.name}
                          {c.isPrimary && (
                            <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded">
                              PRIMARY
                            </span>
                          )}
                        </div>
                        <div className="text-blue-600 font-semibold mt-0.5">{c.designation}</div>
                      </div>
                    </div>

                    <div className="space-y-1 text-slate-600 pt-2 border-t border-slate-200/60">
                      {c.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.email}</span>
                        </div>
                      )}
                      {c.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.phone}</span>
                        </div>
                      )}
                      {c.whatsapp && (
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                          <span>WhatsApp: {c.whatsapp}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TIMELINE TAB */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Activity Timeline</h3>
                <p className="text-xs text-slate-500">
                  Chronological history of communications, calls, meetings, and stage changes.
                </p>
              </div>
              <button
                onClick={() => setShowActivityModal(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Log New Activity</span>
              </button>
            </div>

            <div className="relative border-l-2 border-slate-200 ml-4 space-y-6">
              {school.activities.map((act: any) => (
                <div key={act.id} className="relative pl-6">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-600 ring-4 ring-white" />
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{act.title}</span>
                      <span className="text-[10px] text-slate-400">{formatDateTime(act.createdAt)}</span>
                    </div>
                    {act.description && (
                      <p className="text-xs text-slate-600 mt-1">{act.description}</p>
                    )}
                    <div className="text-[10px] text-slate-400 pt-1 font-medium">
                      Logged by: {act.user?.name || 'System'} &bull; Type: {act.type}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FOLLOW-UPS TAB */}
        {activeTab === 'followups' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Scheduled Follow-ups</h3>
                <p className="text-xs text-slate-500">Track pending and completed follow-up tasks.</p>
              </div>
              <button
                onClick={() => setShowFollowUpModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule Follow-up</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {school.followUps.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-8 text-center">
                  No follow-ups scheduled yet.
                </p>
              ) : (
                school.followUps.map((fu: any) => (
                  <div
                    key={fu.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-4"
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{fu.title}</div>
                      <div className="text-slate-500 mt-1">Due: {formatDate(fu.dueDate)}</div>
                      {fu.notes && <p className="text-slate-600 mt-1 italic">{fu.notes}</p>}
                    </div>

                    <div className="flex items-center gap-2">
                      {fu.status === 'PENDING' ? (
                        <button
                          onClick={() => handleFollowUpStatus(fu.id, 'COMPLETED')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs cursor-pointer"
                        >
                          Mark Completed
                        </button>
                      ) : (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">
                          COMPLETED
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* PROPOSALS TAB */}
        {activeTab === 'proposals' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Commercial Proposals</h3>
            {school.proposals.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-8 text-center">
                No commercial proposals generated yet.
              </p>
            ) : (
              <div className="space-y-3">
                {school.proposals.map((p: any) => (
                  <div key={p.id} className="p-4 bg-slate-50 border rounded-xl text-xs flex justify-between">
                    <div>
                      <div className="font-bold">{p.title}</div>
                      <div>Amount: INR {p.amount}</div>
                    </div>
                    <span className="font-bold text-blue-600">{p.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MOU TAB */}
        {activeTab === 'mou' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">MOU Agreements</h3>
            {school.mous.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-8 text-center">
                No MOU records associated yet.
              </p>
            ) : (
              <div className="space-y-3">
                {school.mous.map((m: any) => (
                  <div key={m.id} className="p-4 bg-slate-50 border rounded-xl text-xs flex justify-between">
                    <div>
                      <div className="font-bold">MOU Version: {m.mouVersion}</div>
                      <div>Status: {m.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* UPDATE STAGE MODAL */}
      {showStageModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-sm text-slate-900">Update Sales Stage</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Stage</label>
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <optgroup label="Pipeline Progress">
                  {SALES_STAGE_PIPELINE.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label} - {s.description}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Outcome States">
                  {SALES_STAGE_OUTCOMES.map((o) => (
                    <option key={o.key} value={o.key}>
                      {o.label}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Update Reason / Note</label>
              <textarea
                rows={3}
                value={stageNote}
                onChange={(e) => setStageNote(e.target.value)}
                placeholder="Explain key trigger for stage transition..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowStageModal(false)}
                className="px-4 py-2 bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStage}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Save Stage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOG ACTIVITY MODAL */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-sm text-slate-900">Log Manual Activity</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Activity Type</label>
              <select
                value={actType}
                onChange={(e) => setActType(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="CALL font-bold">Call Completed</option>
                <option value="MEETING">Meeting / Presentation</option>
                <option value="NOTE">General Note</option>
                <option value="PROPOSAL">Proposal Discussion</option>
                <option value="MOU">MOU Review</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
              <input
                type="text"
                value={actTitle}
                onChange={(e) => setActTitle(e.target.value)}
                placeholder="e.g. Call with Principal Dr. Sharma"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Details</label>
              <textarea
                rows={3}
                value={actDescription}
                onChange={(e) => setActDescription(e.target.value)}
                placeholder="Key meeting notes or discussion details..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowActivityModal(false)}
                className="px-4 py-2 bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleLogActivity}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Save Activity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD CONTACT MODAL */}
      {showContactModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-sm text-slate-900">Add School Contact</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Sunita Verma"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
              <select
                value={contactDesignation}
                onChange={(e) => setContactDesignation(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                {CONTACT_DESIGNATIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="sunita@school.edu.in"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={isPrimaryContact}
                onChange={(e) => setIsPrimaryContact(e.target.checked)}
                className="rounded"
              />
              <span>Set as Primary School Contact</span>
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowContactModal(false)}
                className="px-4 py-2 bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleAddContact}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Save Contact
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE FOLLOW-UP MODAL */}
      {showFollowUpModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-sm text-slate-900">Schedule Follow-up</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title</label>
              <input
                type="text"
                value={fuTitle}
                onChange={(e) => setFuTitle(e.target.value)}
                placeholder="e.g. Call Principal to confirm proposal review"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                value={fuDueDate}
                onChange={(e) => setFuDueDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assignee</label>
              <select
                value={fuAssignee}
                onChange={(e) => setFuAssignee(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowFollowUpModal(false)}
                className="px-4 py-2 bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleFollowUp}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Save Follow-up
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
