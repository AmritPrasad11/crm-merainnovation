'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  MapPin,
  Bot,
  Microscope,
  Phone,
  Mail,
  User,
  ChevronRight,
  Upload,
  ShieldAlert,
  Download,
  Users,
  CheckCircle2,
} from '@/components/Icons';
import { SALES_STAGE_PIPELINE, SALES_STAGE_OUTCOMES, SCHOOL_BOARDS } from '@/lib/types';

interface SchoolsTableClientProps {
  schools: any[];
  users: { id: string; name: string; role: string }[];
  search: string;
  stageFilter: string;
  boardFilter: string;
  sortBy: string;
}

export default function SchoolsTableClient({
  schools,
  users,
  search,
  stageFilter,
  boardFilter,
  sortBy,
}: SchoolsTableClientProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Bulk action options
  const [bulkAction, setBulkAction] = useState<'ASSIGN' | 'UPDATE_STAGE' | 'ARCHIVE'>('ASSIGN');
  const [bulkUserId, setBulkUserId] = useState(users[0]?.id || '');
  const [bulkStage, setBulkStage] = useState('CONTACTED');

  const allStages = [...SALES_STAGE_PIPELINE, ...SALES_STAGE_OUTCOMES];

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(schools.map((s) => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleExecuteBulkAction = async () => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/schools/bulk-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: bulkAction,
          schoolIds: selectedIds,
          assignedUserId: bulkUserId,
          salesStage: bulkStage,
        }),
      });

      if (res.ok) {
        setSelectedIds([]);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (stageFilter) params.set('stage', stageFilter);
    if (boardFilter) params.set('board', boardFilter);
    window.open(`/api/schools/export?${params.toString()}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">School Directory & Pipeline</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage schools, perform bulk assignments, import CSV batches, and export CRM data.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Link
            href="/schools/import"
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2.5 rounded-xl font-semibold transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4 text-blue-400" />
            <span>CSV Batch Import</span>
          </Link>

          <Link
            href="/schools/duplicates"
            className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-3.5 py-2.5 rounded-xl font-semibold transition-colors"
          >
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Duplicates Hub</span>
          </Link>

          <button
            onClick={handleExportData}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-3.5 py-2.5 rounded-xl font-semibold transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <Link
            href="/schools/new"
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold shadow-md shadow-blue-600/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add School</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              name="q"
              defaultValue={search}
              placeholder="Search school, city, email..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <select
              name="stage"
              defaultValue={stageFilter}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Sales Stages</option>
              {allStages.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              name="board"
              defaultValue={boardFilter}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Boards</option>
              {SCHOOL_BOARDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <select
              name="sort"
              defaultValue={sortBy}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt">Newest First</option>
              <option value="name">School Name (A-Z)</option>
              <option value="score">Highest Lead Score</option>
              <option value="lastContacted">Recently Contacted</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Bulk Action Controls Bar */}
      {selectedIds.length > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-center gap-2 font-bold text-blue-900">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{selectedIds.length} School(s) Selected</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value as any)}
              className="p-2 bg-white border border-blue-300 rounded-xl font-semibold"
            >
              <option value="ASSIGN">Reassign Sales User</option>
              <option value="UPDATE_STAGE">Update Sales Stage</option>
              <option value="ARCHIVE">Archive Selected</option>
            </select>

            {bulkAction === 'ASSIGN' && (
              <select
                value={bulkUserId}
                onChange={(e) => setBulkUserId(e.target.value)}
                className="p-2 bg-white border border-blue-300 rounded-xl font-semibold"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            )}

            {bulkAction === 'UPDATE_STAGE' && (
              <select
                value={bulkStage}
                onChange={(e) => setBulkStage(e.target.value)}
                className="p-2 bg-white border border-blue-300 rounded-xl font-semibold"
              >
                {allStages.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={handleExecuteBulkAction}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl cursor-pointer shadow-sm"
            >
              {loading ? 'Processing...' : 'Apply Bulk Action'}
            </button>
          </div>
        </div>
      )}

      {/* School List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden text-xs">
        {schools.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No Schools Found</h3>
            <p className="text-xs text-slate-500">
              Try adjusting your search query or filters, or import a new school list.
            </p>
            <Link
              href="/schools/new"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold mt-2"
            >
              Add New School
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === schools.length && schools.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                  </th>
                  <th className="p-4">School Name</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Sales Stage</th>
                  <th className="p-4">Primary Contact</th>
                  <th className="p-4">Labs</th>
                  <th className="p-4">Assigned To</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schools.map((school) => {
                  const stageObj = allStages.find((s) => s.key === school.salesStage);
                  const primaryContact = school.contacts[0];
                  const isSelected = selectedIds.includes(school.id);

                  return (
                    <tr
                      key={school.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(school.id)}
                          className="w-4 h-4 rounded text-blue-600"
                        />
                      </td>

                      <td className="p-4">
                        <Link
                          href={`/schools/${school.id}`}
                          className="font-bold text-slate-900 hover:text-blue-600 block text-sm"
                        >
                          {school.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-1 text-slate-500 text-[11px]">
                          <span>Board: {school.board || 'N/A'}</span>
                          <span>&bull;</span>
                          <span>Strength: {school.studentStrength || 'N/A'}</span>
                        </div>
                      </td>

                      <td className="p-4 text-slate-700">
                        <div className="flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            {school.city}, {school.state}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                            stageObj?.color || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {stageObj?.label || school.salesStage}
                        </span>
                      </td>

                      <td className="p-4 text-slate-700">
                        {primaryContact ? (
                          <div>
                            <div className="font-semibold text-slate-900">{primaryContact.name}</div>
                            <div className="text-[11px] text-slate-500">{primaryContact.designation}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No contact added</span>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex gap-1.5">
                          {school.hasStemLab && (
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-semibold flex items-center gap-1">
                              <Microscope className="w-3 h-3" /> STEM
                            </span>
                          )}
                          {school.hasRoboticsLab && (
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-[10px] font-semibold flex items-center gap-1">
                              <Bot className="w-3 h-3" /> Robotics
                            </span>
                          )}
                          {!school.hasStemLab && !school.hasRoboticsLab && (
                            <span className="text-slate-400 text-[11px]">None</span>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="px-2 py-1 bg-slate-100 rounded-lg text-slate-700 font-medium">
                          {school.assignedUser?.name || 'Unassigned'}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <Link
                          href={`/schools/${school.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 rounded-xl font-semibold transition-colors"
                        >
                          <span>View Detail</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
