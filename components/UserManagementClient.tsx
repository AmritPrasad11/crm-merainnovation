'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserCheck,
  Shield,
  Plus,
  Mail,
  Phone,
  User,
  Search,
  Filter,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRightLeft,
  Calendar,
  Clock,
  Eye,
} from '@/components/Icons';
import { formatDate } from '@/lib/utils';
import { Role, UserListItem } from '@/lib/types';

interface UserManagementClientProps {
  users: UserListItem[];
  currentUserId: string;
}

export default function UserManagementClient({
  users: initialUsers,
  currentUserId,
}: UserManagementClientProps) {
  const router = useRouter();

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'OUTREACH_USER'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modals & Action States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editUser, setEditUser] = useState<UserListItem | null>(null);
  const [changeRoleUser, setChangeRoleUser] = useState<{ user: UserListItem; targetRole: Role } | null>(null);
  const [deactivateUser, setDeactivateUser] = useState<UserListItem | null>(null);
  const [reassignModalUser, setReassignModalUser] = useState<UserListItem | null>(null);
  const [viewUserDetail, setViewUserDetail] = useState<UserListItem | null>(null);

  // Form States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create User Form
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPhone, setCreatePhone] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createRole, setCreateRole] = useState<Role>('OUTREACH_USER');

  // Edit User Form
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<Role>('OUTREACH_USER');
  const [editIsActive, setEditIsActive] = useState<boolean>(true);

  // Reassign Form
  const [targetReassignUserId, setTargetReassignUserId] = useState('');
  const [reassignSuccessMsg, setReassignSuccessMsg] = useState<string | null>(null);

  // Filtered Users List
  const filteredUsers = initialUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone && u.phone.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && u.isActive !== false) ||
      (statusFilter === 'INACTIVE' && u.isActive === false);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const activeOtherUsers = initialUsers.filter(
    (u) => u.isActive !== false && u.id !== (deactivateUser?.id || reassignModalUser?.id)
  );

  // Handlers
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createName,
          email: createEmail,
          phone: createPhone,
          password: createPassword,
          role: createRole,
          isActive: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');

      setShowCreateModal(false);
      setCreateName('');
      setCreateEmail('');
      setCreatePhone('');
      setCreatePassword('');
      setCreateRole('OUTREACH_USER');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/users/${editUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          phone: editPhone,
          role: editRole,
          isActive: editIsActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update user');

      setEditUser(null);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRoleChange = async () => {
    if (!changeRoleUser) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/users/${changeRoleUser.user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: changeRoleUser.targetRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change role');

      setChangeRoleUser(null);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActivation = async (user: UserListItem, nextActive: boolean) => {
    // If deactivating user with assigned schools, open reassignment modal first
    if (!nextActive && user._count.assignedSchools > 0) {
      setDeactivateUser(user);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextActive }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to toggle account activation');

      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Action rejected by server security rules.');
    } finally {
      setLoading(false);
    }
  };

  const handleReassignSchoolsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sourceUser = deactivateUser || reassignModalUser;
    if (!sourceUser || !targetReassignUserId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/users/${sourceUser.id}/reassign-schools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: targetReassignUserId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reassign schools');

      setReassignSuccessMsg(data.message || 'Schools reassigned successfully.');

      // If we came from deactivation workflow, proceed to deactivate
      if (deactivateUser) {
        await fetch(`/api/users/${deactivateUser.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: false }),
        });
        setDeactivateUser(null);
      } else {
        setReassignModalUser(null);
      }

      setTargetReassignUserId('');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to reassign schools');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (user: UserListItem) => {
    setEditUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phone || '');
    setEditRole(user.role);
    setEditIsActive(user.isActive !== false);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Main Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-blue-600" />
            <span>Admin User Management & RBAC</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage admin and outreach user accounts, set access roles, monitor activity, and reassign school workloads.
          </p>
        </div>

        <button
          onClick={() => {
            setError(null);
            setShowCreateModal(true);
          }}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md shadow-blue-600/30 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create User</span>
        </button>
      </div>

      {/* Search & Filtering Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between text-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by name, email, phone..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Role Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            {(['ALL', 'ADMIN', 'OUTREACH_USER'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  roleFilter === r
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r === 'ALL' ? 'All Roles' : r === 'ADMIN' ? 'Admin' : 'Outreach'}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  statusFilter === s
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s === 'ALL' ? 'All Status' : s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Assigned Schools</th>
                <th className="p-4">Last Login</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No matching users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isActive = u.isActive !== false;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Email */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 uppercase">
                            {u.name.substring(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {u.id === currentUserId && (
                                <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-400" />
                                {u.email}
                              </span>
                              {u.phone && (
                                <span className="flex items-center gap-1 border-l border-slate-200 pl-2">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  {u.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            u.role === 'ADMIN'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          <Shield className="w-3 h-3" />
                          {u.role === 'ADMIN' ? 'ADMIN' : 'OUTREACH_USER'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {isActive ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-rose-600" /> Deactivated
                            </>
                          )}
                        </span>
                      </td>

                      {/* Assigned Schools */}
                      <td className="p-4 font-medium text-slate-700">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">
                            {u._count?.assignedSchools ?? 0}
                          </span>
                          <span>active school(s)</span>
                          {u._count?.assignedSchools > 0 && (
                            <button
                              onClick={() => {
                                setError(null);
                                setReassignModalUser(u);
                              }}
                              title="Reassign schools to another user"
                              className="text-blue-600 hover:text-blue-800 text-[11px] underline ml-1 cursor-pointer"
                            >
                              Reassign
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Last Login */}
                      <td className="p-4 text-slate-500">
                        {u.lastLoginAt ? (
                          <span className="flex items-center gap-1 text-[11px]">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {formatDate(u.lastLoginAt)}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Never</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Details */}
                          <button
                            onClick={() => setViewUserDetail(u)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="View User Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Details */}
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit User Details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Role Toggle Dropdown / Button */}
                          <button
                            onClick={() =>
                              setChangeRoleUser({
                                user: u,
                                targetRole: u.role === 'ADMIN' ? 'OUTREACH_USER' : 'ADMIN',
                              })
                            }
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                            title="Change Role"
                          >
                            {u.role === 'ADMIN' ? 'Demote' : 'Make Admin'}
                          </button>

                          {/* Active Toggle */}
                          <button
                            onClick={() => handleToggleActivation(u, !isActive)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                              isActive
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                          >
                            {isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200 text-xs">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" /> Create Team User Account
            </h3>

            {error && <div className="p-3 bg-rose-50 text-rose-700 rounded-xl font-medium">{error}</div>}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g. Amrit Prasad"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Work Email (Login ID) *</label>
                <input
                  type="email"
                  required
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  placeholder="e.g. amrit@merainnovation.com"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={createPhone}
                  onChange={(e) => setCreatePhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Initial Password *</label>
                <input
                  type="password"
                  required
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned System Role *</label>
                <select
                  value={createRole}
                  onChange={(e) => setCreateRole(e.target.value as Role)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="OUTREACH_USER">OUTREACH_USER (Restricted Access)</option>
                  <option value="ADMIN">ADMIN (Full Access)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold cursor-pointer shadow-md shadow-blue-600/30"
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editUser && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200 text-xs">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-blue-600" /> Edit User: {editUser.name}
            </h3>

            {error && <div className="p-3 bg-rose-50 text-rose-700 rounded-xl font-medium">{error}</div>}

            <form onSubmit={handleEditUserSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as Role)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="OUTREACH_USER">OUTREACH_USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editIsActiveCheck"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="editIsActiveCheck" className="font-semibold text-slate-800">
                  Account Status: Active
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold cursor-pointer"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM ROLE CHANGE DIALOG */}
      {changeRoleUser && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-sm text-slate-900">Confirm Role Modification</h3>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Are you sure you want to change <strong>{changeRoleUser.user.name}</strong>'s role from{' '}
              <span className="font-bold text-slate-900">{changeRoleUser.user.role}</span> to{' '}
              <span className="font-bold text-blue-600">{changeRoleUser.targetRole}</span>?
            </p>

            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl font-medium text-[11px]">
              This role change takes effect immediately on their next server request or session refresh.
            </div>

            {error && <div className="p-3 bg-rose-50 text-rose-700 rounded-xl font-medium">{error}</div>}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setChangeRoleUser(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRoleChange}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold cursor-pointer"
              >
                {loading ? 'Updating...' : 'Confirm Role Change'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEACTIVATION / REASSIGNMENT MODAL */}
      {(deactivateUser || reassignModalUser) && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center gap-3 text-blue-600">
              <ArrowRightLeft className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-sm text-slate-900">
                {deactivateUser
                  ? `Deactivate User: ${deactivateUser.name}`
                  : `Reassign Schools: ${reassignModalUser?.name}`}
              </h3>
            </div>

            {deactivateUser && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-medium">
                <strong>Notice:</strong> This user currently has{' '}
                <span className="font-extrabold">{deactivateUser._count.assignedSchools}</span> assigned school(s).
                Reassign their workload to an active user below before deactivating.
              </div>
            )}

            {reassignSuccessMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl font-medium">
                {reassignSuccessMsg}
              </div>
            )}

            {error && <div className="p-3 bg-rose-50 text-rose-700 rounded-xl font-medium">{error}</div>}

            <form onSubmit={handleReassignSchoolsSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Target Active User to Receive Assigned Schools *
                </label>
                <select
                  required
                  value={targetReassignUserId}
                  onChange={(e) => setTargetReassignUserId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="">-- Select Active User --</option>
                  {activeOtherUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role}) - {u.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeactivateUser(null);
                    setReassignModalUser(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading || !targetReassignUserId}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold cursor-pointer disabled:opacity-50"
                >
                  {loading
                    ? 'Processing...'
                    : deactivateUser
                    ? 'Reassign & Deactivate User'
                    : 'Reassign Schools'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW USER DETAILS DRAWER / MODAL */}
      {viewUserDetail && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200 text-xs">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">{viewUserDetail.name}</h3>
                <p className="text-slate-500">{viewUserDetail.email}</p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                  viewUserDetail.role === 'ADMIN'
                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                {viewUserDetail.role}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Account Status</span>
                <span className="font-bold text-slate-800">
                  {viewUserDetail.isActive !== false ? 'Active' : 'Deactivated'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Phone</span>
                <span className="font-bold text-slate-800">{viewUserDetail.phone || 'N/A'}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Assigned Schools</span>
                <span className="font-bold text-slate-800">
                  {viewUserDetail._count?.assignedSchools ?? 0} active schools
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Pending Tasks</span>
                <span className="font-bold text-slate-800">
                  {viewUserDetail._count?.followUps ?? 0} follow-ups
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Account Created</span>
                <span className="font-medium text-slate-700">{formatDate(viewUserDetail.createdAt)}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Last Login</span>
                <span className="font-medium text-slate-700">
                  {viewUserDetail.lastLoginAt ? formatDate(viewUserDetail.lastLoginAt) : 'Never'}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewUserDetail(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
