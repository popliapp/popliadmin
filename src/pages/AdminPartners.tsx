import React, { useState, useEffect, useCallback } from 'react';
import { useRegisterRefresh } from '../hooks/useRegisterRefresh';
import { adminService } from '@/services/adminService';
import { ALL_PERMISSIONS } from '@/types/auth';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, RefreshCw, Edit2, Trash2, KeyRound,
  CheckCircle, Ban, X, ChevronLeft, ChevronRight, Shield,
} from 'lucide-react';

interface Partner {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  designation: string;
  department?: string;
  status: 'ACTIVE' | 'SUSPENDED';
  permissions: Record<string, boolean>;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

const EMPTY_PERMISSIONS = ALL_PERMISSIONS.flatMap((g) => g.permissions).reduce(
  (acc, p) => ({ ...acc, [p.key]: false }),
  {} as Record<string, boolean>
);

const StatusBadge = ({ status }: { status: string }) => (
  <span className={cn(
    'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border',
    status === 'ACTIVE'
      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
      : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20'
  )}>
    {status}
  </span>
);

interface PartnerFormProps {
  initial?: Partial<Partner>;
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
  isEdit?: boolean;
}

const PartnerForm: React.FC<PartnerFormProps> = ({ initial, onSubmit, onClose, isEdit }) => {
  const [form, setForm] = useState({
    fullName: initial?.fullName ?? '',
    username: initial?.username ?? '',
    email: initial?.email ?? '',
    password: '',
    phone: initial?.phone ?? '',
    designation: initial?.designation ?? '',
    department: initial?.department ?? '',
    status: initial?.status ?? 'ACTIVE',
    permissions: initial?.permissions ?? { ...EMPTY_PERMISSIONS },
  });
  const [saving, setSaving] = useState(false);

  const setField = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const togglePerm = (key: string) =>
    setForm((f) => ({ ...f, permissions: { ...f.permissions, [key]: !f.permissions[key] } }));

  const setGroupAll = (keys: string[], val: boolean) =>
    setForm((f) => {
      const perms = { ...f.permissions };
      keys.forEach((k) => { perms[k] = val; });
      return { ...f, permissions: perms };
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.username || !form.email || !form.designation) {
      toast.error('Please fill all required fields');
      return;
    }
    if (!isEdit && !form.password) {
      toast.error('Password is required');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        fullName: form.fullName,
        username: form.username,
        email: form.email,
        phone: form.phone || undefined,
        designation: form.designation,
        department: form.department || undefined,
        status: form.status,
        permissions: form.permissions,
      };
      if (!isEdit) payload.password = form.password;
      await onSubmit(payload);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
        className="w-full max-w-[560px] h-full bg-card border-l border-border shadow-2xl flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-[15px] font-semibold text-foreground">
              {isEdit ? 'Edit Admin Partner' : 'Create Admin Partner'}
            </h2>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              {isEdit ? 'Update partner details and permissions' : 'Add a new team member with limited access'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Full Name *', key: 'fullName', placeholder: 'Shaho' },
              { label: 'Username *', key: 'username', placeholder: 'Shaho123' },
              { label: 'Email *', key: 'email', placeholder: 'shaho@email.com', type: 'email' },
              { label: 'Phone', key: 'phone', placeholder: '+91 9876543210' },
              { label: 'Designation *', key: 'designation', placeholder: 'Content Moderator' },
              { label: 'Department', key: 'department', placeholder: 'Trust & Safety' },
            ].map(({ label, key, placeholder, type }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {label}
                </label>
                <input
                  type={type ?? 'text'}
                  value={(form as any)[key]}
                  onChange={(e) => setField(key, e.target.value)}
                  placeholder={placeholder}
                  className="login-field w-full h-9 bg-muted border border-border rounded-lg px-3 text-[13px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all"
                />
              </div>
            ))}

            {!isEdit && (
              <div className="space-y-1.5 col-span-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Password *
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setField('password', e.target.value)}
                  placeholder="Min. 6 characters"
                  className="login-field w-full h-9 bg-muted border border-border rounded-lg px-3 text-[13px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setField('status', e.target.value)}
                className="login-field w-full h-9 bg-muted border border-border rounded-lg px-3 text-[13px] text-foreground outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all"
              >
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-primary" />
              <h3 className="text-[13px] font-semibold text-foreground">Permissions</h3>
              <div className="flex gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({
                    ...f,
                    permissions: ALL_PERMISSIONS.flatMap((g) => g.permissions).reduce(
                      (acc, p) => ({ ...acc, [p.key]: true }), {} as Record<string, boolean>
                    )
                  }))}
                  className="text-[11px] text-primary hover:underline"
                >
                  Grant All
                </button>
                <span className="text-muted-foreground/30">|</span>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, permissions: { ...EMPTY_PERMISSIONS } }))}
                  className="text-[11px] text-muted-foreground hover:text-foreground"
                >
                  Clear All
                </button>
              </div>
            </div>

            {ALL_PERMISSIONS.map((group) => {
              const keys = group.permissions.map((p) => p.key);
              const allChecked = keys.every((k) => form.permissions[k]);
              const someChecked = keys.some((k) => form.permissions[k]);
              return (
                <div key={group.group} className="bg-muted/40 border border-border rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                      {group.group}
                    </p>
                    <button
                      type="button"
                      onClick={() => setGroupAll(keys, !allChecked)}
                      className={cn(
                        'text-[10px] font-semibold px-2 py-0.5 rounded border transition-colors',
                        allChecked
                          ? 'bg-primary/10 text-primary border-primary/20'
                          : someChecked
                          ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
                          : 'bg-muted text-muted-foreground border-border'
                      )}
                    >
                      {allChecked ? 'All Granted' : someChecked ? 'Partial' : 'None'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {group.permissions.map((perm) => (
                      <label key={perm.key} className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={!!form.permissions[perm.key]}
                          onChange={() => togglePerm(perm.key)}
                          className="w-3.5 h-3.5 rounded border-border bg-muted text-primary [color-scheme:light] dark:[color-scheme:dark]"
                        />
                        <span className="text-[12px] text-muted-foreground group-hover:text-foreground transition-colors">
                          {perm.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3 px-6 py-4 border-t border-border flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 h-10 border border-border rounded-lg text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 h-10 bg-primary text-white rounded-lg text-[13px] font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            {isEdit ? 'Save Changes' : 'Create Partner'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export const AdminPartnersPage: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editPartner, setEditPartner] = useState<Partner | null>(null);
  const [resetTarget, setResetTarget] = useState<Partner | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Partner | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getAdminPartners({ search, status: statusFilter, page, limit: 20 });
      setPartners(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      toast.error('Failed to load admin partners');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

useRegisterRefresh(load);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (data: any) => {
    await adminService.createAdminPartner(data);
    toast.success('Admin partner created');
    setShowCreate(false);
    load();
  };

  const handleEdit = async (data: any) => {
    await adminService.updateAdminPartner(editPartner!.id, data);
    toast.success('Partner updated');
    setEditPartner(null);
    load();
  };

  const handleStatusToggle = async (partner: Partner) => {
    const next = partner.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await adminService.updateAdminPartnerStatus(partner.id, next);
    toast.success(`Partner ${next === 'ACTIVE' ? 'activated' : 'suspended'}`);
    load();
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setResetting(true);
    try {
      await adminService.resetAdminPartnerPassword(resetTarget!.id, newPassword);
      toast.success('Password reset successfully');
      setResetTarget(null);
      setNewPassword('');
    } catch {
      toast.error('Failed to reset password');
    } finally {
      setResetting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await adminService.deleteAdminPartner(deleteTarget!.id);
      toast.success('Partner deleted');
      setDeleteTarget(null);
      load();
    } catch {
      toast.error('Failed to delete partner');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-foreground tracking-tight">Admin Partners</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Manage team members with scoped access and permissions.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="h-9 px-4 bg-primary text-white rounded-lg text-[13px] font-semibold flex items-center gap-2 hover:bg-primary/90 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          New Partner
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email, username..."
            className="login-field w-full h-9 bg-muted border border-border rounded-lg pl-9 pr-4 text-[13px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="login-field h-9 bg-muted border border-border rounded-lg px-3 text-[13px] text-foreground outline-none focus:ring-2 focus:ring-ring/20 transition-all"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
        <button
          onClick={load}
          disabled={loading}
          className="h-9 px-3 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-2 text-[12px] font-medium"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <span className="text-[13px] font-semibold text-foreground">
            {total} Partner{total !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="w-5 h-5 text-muted-foreground animate-spin" />
            </div>
          ) : partners.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Shield className="w-10 h-10 text-muted-foreground opacity-20" />
              <p className="text-[13px] font-semibold text-foreground">No admin partners yet</p>
              <p className="text-[12px] text-muted-foreground">Create your first partner to delegate access.</p>
              <button
                onClick={() => setShowCreate(true)}
                className="mt-1 h-8 px-4 bg-primary text-white rounded-lg text-[12px] font-semibold hover:bg-primary/90 transition-all"
              >
                Create Partner
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {['Partner', 'Designation', 'Status', 'Last Login', 'Created', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {partners.map((partner) => (
                  <tr key={partner.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="text-[13px] font-semibold text-foreground">{partner.fullName}</p>
                        <p className="text-[11px] text-muted-foreground">@{partner.username} · {partner.email}</p>
                        {partner.department && (
                          <p className="text-[10px] text-muted-foreground/70">{partner.department}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-[12px] text-foreground">{partner.designation}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={partner.status} />
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-muted-foreground">
                      {partner.lastLoginAt
                        ? new Date(partner.lastLoginAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                        : 'Never'}
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-muted-foreground">
                      {new Date(partner.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditPartner(partner)}
                          title="Edit"
                          className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { setResetTarget(partner); setNewPassword(''); }}
                          title="Reset Password"
                          className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleStatusToggle(partner)}
                          title={partner.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                          className={cn(
                            'w-7 h-7 rounded-lg flex items-center justify-center transition-colors',
                            partner.status === 'ACTIVE'
                              ? 'hover:bg-amber-50 dark:hover:bg-amber-500/10 text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400'
                              : 'hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400'
                          )}
                        >
                          {partner.status === 'ACTIVE' ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => setDeleteTarget(partner)}
                          title="Delete"
                          className="w-7 h-7 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="px-5 py-3.5 border-t border-border flex items-center justify-between">
            <span className="text-[12px] text-muted-foreground">
              Page {page} of {totalPages} · {total} total
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreate && (
          <PartnerForm onSubmit={handleCreate} onClose={() => setShowCreate(false)} />
        )}
        {editPartner && (
          <PartnerForm initial={editPartner} onSubmit={handleEdit} onClose={() => setEditPartner(null)} isEdit />
        )}
      </AnimatePresence>

      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="text-[15px] font-semibold text-foreground">Reset Password</h3>
            <p className="text-[13px] text-muted-foreground">
              Set a new password for <span className="font-semibold text-foreground">{resetTarget.fullName}</span>.
            </p>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min. 6 characters)"
              className="login-field w-full h-10 bg-muted border border-border rounded-lg px-3 text-[13px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setResetTarget(null); setNewPassword(''); }}
                className="flex-1 h-9 border border-border rounded-lg text-[13px] font-medium text-muted-foreground hover:bg-muted transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                disabled={resetting}
                className="flex-1 h-9 bg-primary text-white rounded-lg text-[13px] font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {resetting && <RefreshCw className="w-3 h-3 animate-spin" />}
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="text-[15px] font-semibold text-foreground">Delete Partner</h3>
            <p className="text-[13px] text-muted-foreground">
              Are you sure you want to permanently delete{' '}
              <span className="font-semibold text-foreground">{deleteTarget.fullName}</span>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 h-9 border border-border rounded-lg text-[13px] font-medium text-muted-foreground hover:bg-muted transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 h-9 bg-destructive text-white rounded-lg text-[13px] font-semibold hover:bg-destructive/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {deleting && <RefreshCw className="w-3 h-3 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};