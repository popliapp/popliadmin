import React, { useState, useEffect, useCallback } from 'react';
import { useRegisterRefresh } from '../hooks/useRegisterRefresh';
import { adminService } from '../services/adminService';
import toast from 'react-hot-toast';
import {
  Coins,
  ChevronUp,
  ChevronDown,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Plus,
  X,
} from 'lucide-react';
import { cn } from '@/utils/cn';

const EMPTY_FORM = {
  title: '',
  coins: 0,
  bonusCoins: 0,
  priceInr: 0,
  badge: '',
  badgeColor: '#A855F7',
  description: '',
  isPopular: false,
  isRecommended: false,
  isActive: true,
};

function Field({
  label,
  type = 'text',
  value,
  onChange,
  step,
  min,
  placeholder,
}: {
  label: string;
  type?: string;
  value: any;
  onChange: (v: any) => void;
  step?: string;
  min?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </label>
      <input
        type={type}
        step={step}
        min={min}
        placeholder={placeholder}
        value={value}
        onChange={(e) =>
          onChange(type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)
        }
        className="w-full h-9 bg-background border border-border rounded-lg px-3 text-[13px] text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
      />
    </div>
  );
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-primary rounded"
      />
      <span className="text-[13px] text-foreground">{label}</span>
    </label>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 bg-muted/30 border border-border rounded-lg animate-pulse">
      <div className="flex flex-col gap-1.5">
        <div className="w-5 h-4 bg-muted rounded" />
        <div className="w-5 h-4 bg-muted rounded" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-muted rounded w-40" />
        <div className="h-2.5 bg-muted/60 rounded w-28" />
      </div>
      <div className="flex gap-2">
        <div className="w-16 h-7 bg-muted rounded-lg" />
        <div className="w-12 h-7 bg-muted rounded-lg" />
        <div className="w-12 h-7 bg-muted rounded-lg" />
      </div>
    </div>
  );
}

export function CoinPackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
const refresh = useCallback(async () => {
    await load();
  }, []);

  useRegisterRefresh(refresh);

  useEffect(() => {
    load();
  }, []);
  const load = async () => {
    setLoading(true);
    try {
      const data = await adminService.getCoinPackagesAdmin();
      setPackages(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const setField = (key: string, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
  };

  const startEdit = (pkg: any) => {
    setForm({
      title: pkg.title,
      coins: pkg.coins,
      bonusCoins: pkg.bonusCoins,
      priceInr: pkg.priceInr,
      badge: pkg.badge ?? '',
      badgeColor: pkg.badgeColor ?? '#A855F7',
      description: pkg.description ?? '',
      isPopular: pkg.isPopular,
      isRecommended: pkg.isRecommended,
      isActive: pkg.isActive,
    });
    setEditingId(pkg.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (form.coins <= 0) { toast.error('Coins must be greater than 0'); return; }
    if (form.priceInr <= 0) { toast.error('Price must be greater than 0'); return; }
    setSaving(true);
    try {
      if (editingId) {
        const updated = await adminService.updateCoinPackage(editingId, form);
        setPackages((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
        toast.success('Package updated');
      } else {
        const created = await adminService.createCoinPackage(form);
        setPackages((prev) => [...prev, created]);
        toast.success('Package created');
      }
      resetForm();
    } catch {
      toast.error('Failed to save package');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (pkg: any) => {
    try {
      const updated = await adminService.updateCoinPackage(pkg.id, { isActive: !pkg.isActive });
      setPackages((prev) => prev.map((p) => (p.id === pkg.id ? updated : p)));
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this package? This cannot be undone.')) return;
    try {
      await adminService.deleteCoinPackage(id);
      setPackages((prev) => prev.filter((p) => p.id !== id));
      toast.success('Package deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const idx = packages.findIndex((p) => p.id === id);
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === packages.length - 1) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const updated = [...packages];
    const sortA = updated[swapIdx].sortOrder;
    const sortB = updated[idx].sortOrder;
    try {
      await Promise.all([
        adminService.updateCoinPackage(updated[idx].id, { sortOrder: sortA }),
        adminService.updateCoinPackage(updated[swapIdx].id, { sortOrder: sortB }),
      ]);
      [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
      setPackages([...updated]);
    } catch {
      toast.error('Failed to reorder');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-bold text-foreground tracking-tight">Coin Packages</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Manage purchasable coin bundles shown to users in the app. Changes take effect immediately.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl p-5 sticky top-20">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[15px] font-semibold text-foreground">
                {editingId ? 'Edit Package' : 'New Package'}
              </h2>
              {editingId && (
                <button
                  onClick={resetForm}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field
                label="Title"
                value={form.title}
                onChange={(v) => setField('title', v)}
                placeholder="e.g. Starter Pack"
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Coins"
                  type="number"
                  value={form.coins}
                  onChange={(v) => setField('coins', v)}
                  min="1"
                />
                <Field
                  label="Bonus Coins"
                  type="number"
                  value={form.bonusCoins}
                  onChange={(v) => setField('bonusCoins', v)}
                  min="0"
                />
              </div>
              <Field
                label="Price (INR)"
                type="number"
                value={form.priceInr}
                onChange={(v) => setField('priceInr', v)}
                min="1"
              />
              <Field
                label="Description (optional)"
                value={form.description}
                onChange={(v) => setField('description', v)}
                placeholder="Short description for users"
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Badge text"
                  value={form.badge}
                  onChange={(v) => setField('badge', v)}
                  placeholder="e.g. Best Value"
                />
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Badge color
                  </label>
                  <div className="flex items-center gap-2 h-9">
                    <input
                      type="color"
                      value={form.badgeColor}
                      onChange={(e) => setField('badgeColor', e.target.value)}
                      className="w-9 h-9 rounded-lg border border-border cursor-pointer bg-transparent p-0.5"
                    />
                    <span className="text-[12px] text-muted-foreground font-mono">{form.badgeColor}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-1">
                <Check label="Popular" checked={form.isPopular} onChange={(v) => setField('isPopular', v)} />
                <Check label="Recommended" checked={form.isRecommended} onChange={(v) => setField('isRecommended', v)} />
                <Check label="Active" checked={form.isActive} onChange={(v) => setField('isActive', v)} />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-white text-[13px] font-semibold hover:bg-primary/90 disabled:opacity-60 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  {saving ? 'Saving…' : editingId ? 'Update Package' : 'Create Package'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="h-9 px-4 rounded-lg bg-muted text-foreground text-[13px] font-semibold hover:bg-muted/70 transition-all"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-semibold text-foreground">
                All Packages
                {!loading && (
                  <span className="ml-2 text-[12px] font-medium text-muted-foreground">
                    ({packages.length})
                  </span>
                )}
              </h2>
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Coins className="w-4 h-4 text-primary" />
              </div>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)}
              </div>
            ) : packages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Coins className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-[13px] font-semibold text-foreground">No packages yet</p>
                <p className="text-[12px] text-muted-foreground">Create your first coin package using the form.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {packages.map((pkg, idx) => (
                  <div
                    key={pkg.id}
                    className={cn(
                      'flex items-center gap-3 p-3.5 border rounded-lg transition-colors',
                      editingId === pkg.id
                        ? 'border-primary/40 bg-primary/5'
                        : 'border-border bg-muted/20 hover:bg-muted/40'
                    )}
                  >
                    <div className="flex flex-col gap-0.5 flex-shrink-0">
                      <button
                        onClick={() => handleReorder(pkg.id, 'up')}
                        disabled={idx === 0}
                        className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleReorder(pkg.id, 'down')}
                        disabled={idx === packages.length - 1}
                        className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                        <span className="text-[13px] font-semibold text-foreground truncate">
                          {pkg.title}
                        </span>
                        {pkg.badge && (
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white flex-shrink-0"
                            style={{ backgroundColor: pkg.badgeColor || '#A855F7' }}
                          >
                            {pkg.badge}
                          </span>
                        )}
                        {pkg.isPopular && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 flex-shrink-0">
                            Popular
                          </span>
                        )}
                        {pkg.isRecommended && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 flex-shrink-0">
                            Recommended
                          </span>
                        )}
                      </div>
                      <span className="text-[12px] text-muted-foreground">
                        {pkg.coins.toLocaleString()} coins
                        {pkg.bonusCoins > 0 && (
                          <span className="text-amber-600 dark:text-amber-400 font-medium">
                            {' '}+ {pkg.bonusCoins.toLocaleString()} bonus
                          </span>
                        )}
                        {' · '}
                        <span className="font-semibold text-foreground">₹{pkg.priceInr.toLocaleString('en-IN')}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleToggle(pkg)}
                        className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg transition-colors"
                      >
                        {pkg.isActive ? (
                          <>
                            <ToggleRight className="w-4 h-4 text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400 hidden sm:inline">Active</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground hidden sm:inline">Inactive</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => startEdit(pkg)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(pkg.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}