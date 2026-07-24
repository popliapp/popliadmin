import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/adminService';
import { useRegisterRefresh } from '../hooks/useRegisterRefresh';
import toast from 'react-hot-toast';
import {
  Settings,
  Coins,
  Gift,
  UserPlus,
  ArrowDownToLine,
  Percent,
  TrendingUp,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Plus,
} from 'lucide-react';
import { cn } from '@/utils/cn';

// ─── Shared primitives ────────────────────────────────────────────────────────

function PageHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h1 className="text-[22px] font-bold text-foreground tracking-tight">{title}</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-card border border-border rounded-xl p-6 shadow-sm', className)}>
      {children}
    </div>
  );
}

function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
      {subtitle && <p className="text-[12px] text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
  );
}

function ConfigField({
  label,
  hint,
  value,
  onChange,
  type = 'number',
  step,
  min,
  max,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: number | string;
  onChange: (v: any) => void;
  type?: string;
  step?: string;
  min?: string;
  max?: string;
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
        max={max}
        placeholder={placeholder}
        value={value}
        onChange={(e) =>
          onChange(type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)
        }
        className="w-full h-9 bg-background border border-border rounded-lg px-3 text-[13px] text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
      />
      {hint && <span className="text-[11px] text-muted-foreground leading-relaxed">{hint}</span>}
    </div>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-3.5 bg-muted/50 border border-border rounded-lg text-[12px] text-muted-foreground">
      {children}
    </div>
  );
}

function SaveButton({ loading }: { loading?: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="h-9 px-6 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-all text-[13px] disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? 'Saving…' : 'Save Changes'}
    </button>
  );
}

// ─── Shared hooks ─────────────────────────────────────────────────────────────

function useConfig(key: string, defaultValue: number) {
  const [value, setValue] = useState(defaultValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getConfigs().then((configs: any) => {
      if (configs[key] !== undefined) setValue(configs[key]);
    }).catch(console.error).finally(() => setLoading(false));
  }, [key]);

  const save = async (v: number) => {
    await adminService.updateConfig(key, v);
  };

  return { value, setValue, loading, save };
}

function useMultiConfig(keys: string[], defaults: Record<string, number>) {
  const [values, setValues] = useState<Record<string, number>>(defaults);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getConfigs().then((configs: any) => {
      setValues((prev) => {
        const merged = { ...prev };
        for (const key of keys) {
          if (configs[key] !== undefined) merged[key] = configs[key];
        }
        return merged;
      });
    }).catch(console.error).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (key: string, v: number) =>
    setValues((prev) => ({ ...prev, [key]: v }));

  const saveAll = async () => {
    await Promise.all(keys.map((key) => adminService.updateConfig(key, values[key])));
  };

  return { values, set, loading, saveAll };
}

// ─── 1. General Settings ─────────────────────────────────────────────────────
export function GeneralSettingsPage() {
  const { value, setValue, loading, save } = useConfig('VIEW_RATE_PER_1000', 5);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    await adminService.getConfigs().catch(() => {});
  }, []);
  useRegisterRefresh(refresh);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (value <= 0) { toast.error('Rate must be greater than 0'); return; }
    setSaving(true);
    try {
      await save(value);
      toast.success('View rate updated');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader icon={Settings} title="General Settings" subtitle="Core earning rate for view monetization" />
      <div className="max-w-lg">
        <Card>
          <CardHeader title="View Rate" subtitle="INR paid to creators per 1,000 valid views" />
          <form onSubmit={handleSubmit} className="space-y-5">
            <ConfigField
              label="INR per 1,000 views"
              hint="Changes apply to all new views immediately. Existing pending earnings are not affected."
              value={value}
              onChange={setValue}
              step="0.01"
              min="0"
            />
            <InfoBox>
              <span className="font-semibold text-foreground block mb-1">Example payout</span>
              A reel with 50,000 valid views earns ₹{((value / 1000) * 50000).toFixed(2)} at the current rate.
            </InfoBox>
            <div className="flex justify-end">
              <SaveButton loading={loading || saving} />
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

// ─── 2. Creator Earnings ──────────────────────────────────────────────────────

export function CreatorEarningsPage() {
  const KEYS = ['VIEWER_COIN_REWARD_PER_VIEW', 'VIEWER_COIN_MAX_DAILY', 'LIKER_COIN_REWARD_PER_2_LIKES', 'LIKER_COIN_MAX_DAILY'];
  const DEFAULTS = { VIEWER_COIN_REWARD_PER_VIEW: 10, VIEWER_COIN_MAX_DAILY: 200, LIKER_COIN_REWARD_PER_2_LIKES: 1, LIKER_COIN_MAX_DAILY: 50 };
  const { values, set, loading, saveAll } = useMultiConfig(KEYS, DEFAULTS);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    await adminService.getConfigs().catch(() => {});
  }, []);
  useRegisterRefresh(refresh);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveAll();
      toast.success('Engagement rewards updated');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader icon={Coins} title="Creator Earnings" subtitle="Coin rewards granted to viewers and likers" />
      <div className="max-w-lg">
        <Card>
          <CardHeader title="Engagement Coin Rewards" />
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border pb-2">
                Viewer Rewards
              </p>
              <ConfigField
                label="Coins per valid view"
                hint="Coins awarded to the viewer for each valid view counted"
                value={values['VIEWER_COIN_REWARD_PER_VIEW']}
                onChange={(v) => set('VIEWER_COIN_REWARD_PER_VIEW', v)}
                min="0"
              />
              <ConfigField
                label="Max daily coins (viewer)"
                hint="Maximum coins a viewer can earn per day from watching reels"
                value={values['VIEWER_COIN_MAX_DAILY']}
                onChange={(v) => set('VIEWER_COIN_MAX_DAILY', v)}
                min="0"
              />
            </div>
            <div className="space-y-4">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border pb-2">
                Liker Rewards
              </p>
              <ConfigField
                label="Coins per 2 likes given"
                hint="Coins awarded per every 2 likes a user gives"
                value={values['LIKER_COIN_REWARD_PER_2_LIKES']}
                onChange={(v) => set('LIKER_COIN_REWARD_PER_2_LIKES', v)}
                min="0"
              />
              <ConfigField
                label="Max daily coins (liker)"
                hint="Maximum coins a user can earn per day from liking reels"
                value={values['LIKER_COIN_MAX_DAILY']}
                onChange={(v) => set('LIKER_COIN_MAX_DAILY', v)}
                min="0"
              />
            </div>
            <div className="flex justify-end pt-1">
              <SaveButton loading={loading || saving} />
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

// ─── 3. Gift Economy ──────────────────────────────────────────────────────────

export function GiftEconomyPage() {
  const KEYS = ['GIFT_CREATOR_SHARE_PERCENT', 'GIFT_COIN_TO_INR_RATE'];
  const DEFAULTS = { GIFT_CREATOR_SHARE_PERCENT: 60, GIFT_COIN_TO_INR_RATE: 0.1 };
  const { values, set, loading, saveAll } = useMultiConfig(KEYS, DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [gifts, setGifts] = useState<any[]>([]);
  const [giftsLoading, setGiftsLoading] = useState(true);
  const [newGift, setNewGift] = useState({ name: '', iconUrl: '', costInCoins: 10, animationType: 'fly' });
  const [addingGift, setAddingGift] = useState(false);

  const refresh = useCallback(async () => {
    await Promise.all([
      adminService.getConfigs().catch(() => {}),
      adminService.getGifts().then(setGifts).catch(() => {}),
    ]);
  }, []);
  useRegisterRefresh(refresh);

  useEffect(() => {
    adminService.getGifts()
      .then(setGifts)
      .catch(console.error)
      .finally(() => setGiftsLoading(false));
  }, []);

  const handleSaveRates = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveAll();
      toast.success('Gift economy rates updated');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleAddGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGift.name.trim()) { toast.error('Gift name is required'); return; }
    if (!newGift.iconUrl.trim()) { toast.error('Icon URL or emoji is required'); return; }
    if (newGift.costInCoins <= 0) { toast.error('Coin price must be greater than 0'); return; }
    setAddingGift(true);
    try {
      const saved = await adminService.addGift({
        name: newGift.name.trim(),
        icon: newGift.iconUrl.trim(),
        coinPrice: newGift.costInCoins,
        animationType: newGift.animationType,
      });
      setGifts((prev) => [...prev, saved]);
      setNewGift({ name: '', iconUrl: '', costInCoins: 10, animationType: 'fly' });
      toast.success('Gift added');
    } catch {
      toast.error('Failed to add gift');
    } finally {
      setAddingGift(false);
    }
  };

  const handleToggleGift = async (gift: any) => {
    try {
      const updated = await adminService.updateGift(gift.id, { isActive: !gift.isActive });
      setGifts((prev) => prev.map((g) => g.id === gift.id ? { ...g, isActive: updated.isActive } : g));
    } catch {
      toast.error('Failed to update gift');
    }
  };

  const handleDeleteGift = async (giftId: string) => {
    try {
      await adminService.deleteGift(giftId);
      setGifts((prev) => prev.filter((g) => g.id !== giftId));
      toast.success('Gift deleted');
    } catch {
      toast.error('Failed to delete gift');
    }
  };

  const platformShare = 100 - values['GIFT_CREATOR_SHARE_PERCENT'];

  return (
    <div>
      <PageHeader icon={Gift} title="Gift Economy" subtitle="Creator revenue share and gift catalog management" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-4xl">
        <Card>
          <CardHeader title="Revenue Share" subtitle="How gift revenue is split between creators and the platform" />
          <form onSubmit={handleSaveRates} className="space-y-5">
            <ConfigField
              label="Creator share (%)"
              hint={`Creator receives ${values['GIFT_CREATOR_SHARE_PERCENT']}% — platform retains ${platformShare}% of each gift's value`}
              value={values['GIFT_CREATOR_SHARE_PERCENT']}
              onChange={(v) => set('GIFT_CREATOR_SHARE_PERCENT', Math.min(100, Math.max(0, v)))}
              step="1"
              min="0"
              max="100"
            />
            <ConfigField
              label="Coin to INR rate (fallback)"
              hint="INR value per coin used when a gift's costInINR is not explicitly set"
              value={values['GIFT_COIN_TO_INR_RATE']}
              onChange={(v) => set('GIFT_COIN_TO_INR_RATE', v)}
              step="0.001"
              min="0"
            />
            <InfoBox>
              <span className="font-semibold text-foreground block mb-1">Revenue split</span>
              Creator {values['GIFT_CREATOR_SHARE_PERCENT']}% · Platform {platformShare}%
            </InfoBox>
            <div className="flex justify-end">
              <SaveButton loading={loading || saving} />
            </div>
          </form>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Add Gift" subtitle="New gifts appear immediately in the user app" />
            <form onSubmit={handleAddGift} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <ConfigField
                  label="Gift name"
                  type="text"
                  value={newGift.name}
                  onChange={(v) => setNewGift((p) => ({ ...p, name: v }))}
                  placeholder="e.g. Diamond"
                />
                <ConfigField
                  label="Icon (emoji or URL)"
                  type="text"
                  value={newGift.iconUrl}
                  onChange={(v) => setNewGift((p) => ({ ...p, iconUrl: v }))}
                  placeholder="💎 or https://..."
                />
              </div>
              <ConfigField
                label="Coin price"
                value={newGift.costInCoins}
                onChange={(v) => setNewGift((p) => ({ ...p, costInCoins: v }))}
                min="1"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={addingGift}
                  className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-white text-[13px] font-semibold hover:bg-primary/90 transition-all disabled:opacity-60"
                >
                  <Plus className="w-4 h-4" />
                  {addingGift ? 'Adding…' : 'Add Gift'}
                </button>
              </div>
            </form>
          </Card>

          <Card>
            <CardHeader title="Gift Catalog" subtitle={`${gifts.length} gift${gifts.length !== 1 ? 's' : ''} configured`} />
            {giftsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-muted/40 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : gifts.length === 0 ? (
              <p className="text-[13px] text-muted-foreground text-center py-6">No gifts configured yet.</p>
            ) : (
              <div className="space-y-2">
                {gifts.map((gift) => (
                  <div
                    key={gift.id}
                    className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-lg"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl leading-none flex-shrink-0">{gift.iconUrl}</span>
                      <div className="min-w-0">
                        <span className="text-[13px] font-semibold text-foreground block truncate">{gift.name}</span>
                        <span className="text-[11px] text-muted-foreground">{gift.costInCoins} coins</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleToggleGift(gift)}
                        className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors"
                        style={{}}
                      >
                        {gift.isActive ? (
                          <>
                            <ToggleRight className="w-4 h-4 text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400">Active</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Inactive</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteGift(gift.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── 4. Coin Economy ──────────────────────────────────────────────────────────

export function CoinEconomyPage() {
  const KEYS = ['COIN_PURCHASE_PRICE_PER_COIN', 'COIN_WITHDRAWAL_REDEEM_RATE'];
  const DEFAULTS = { COIN_PURCHASE_PRICE_PER_COIN: 1.25, COIN_WITHDRAWAL_REDEEM_RATE: 0.85 };
  const { values, set, loading, saveAll } = useMultiConfig(KEYS, DEFAULTS);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    await adminService.getConfigs().catch(() => {});
  }, []);
  useRegisterRefresh(refresh);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (values['COIN_WITHDRAWAL_REDEEM_RATE'] >= values['COIN_PURCHASE_PRICE_PER_COIN']) {
      toast.error('Redeem rate must be less than purchase price');
      return;
    }
    setSaving(true);
    try {
      await saveAll();
      toast.success('Coin economy rates updated');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const spread = values['COIN_PURCHASE_PRICE_PER_COIN'] - values['COIN_WITHDRAWAL_REDEEM_RATE'];
  const margin = values['COIN_PURCHASE_PRICE_PER_COIN'] > 0
    ? ((spread / values['COIN_PURCHASE_PRICE_PER_COIN']) * 100).toFixed(1)
    : '0.0';

  return (
    <div>
      <PageHeader icon={TrendingUp} title="Coin Economy" subtitle="Purchase price and withdrawal redeem rate for coins" />
      <div className="max-w-lg">
        <Card>
          <CardHeader title="Coin Rates" subtitle="Controls the platform's buy-sell spread on coins" />
          <form onSubmit={handleSubmit} className="space-y-5">
            <ConfigField
              label="Purchase price per coin (INR)"
              hint="What users pay when buying coins"
              value={values['COIN_PURCHASE_PRICE_PER_COIN']}
              onChange={(v) => set('COIN_PURCHASE_PRICE_PER_COIN', v)}
              step="0.01"
              min="0.01"
            />
            <ConfigField
              label="Withdrawal redeem rate (INR per coin)"
              hint="INR paid to creator per coin when they request a withdrawal"
              value={values['COIN_WITHDRAWAL_REDEEM_RATE']}
              onChange={(v) => set('COIN_WITHDRAWAL_REDEEM_RATE', v)}
              step="0.01"
              min="0.01"
            />
            <InfoBox>
              <span className="font-semibold text-foreground block mb-1">Platform spread</span>
              <div className="flex gap-4 flex-wrap">
                <span>Buy ₹{values['COIN_PURCHASE_PRICE_PER_COIN'].toFixed(2)}/coin</span>
                <span>Redeem ₹{values['COIN_WITHDRAWAL_REDEEM_RATE'].toFixed(2)}/coin</span>
                <span className="text-primary font-semibold">Margin {margin}%</span>
              </div>
            </InfoBox>
            <div className="flex justify-end">
              <SaveButton loading={loading || saving} />
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

// ─── 5. Referral Rewards ──────────────────────────────────────────────────────

export function ReferralRewardsPage() {
  const KEYS = ['REFERRAL_CREATOR_REWARD', 'REFERRAL_STANDARD_REWARD', 'REFERRAL_SUPER_REWARD'];
  const DEFAULTS = { REFERRAL_CREATOR_REWARD: 100, REFERRAL_STANDARD_REWARD: 25, REFERRAL_SUPER_REWARD: 500 };
  const { values, set, loading, saveAll } = useMultiConfig(KEYS, DEFAULTS);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    await adminService.getConfigs().catch(() => {});
  }, []);
  useRegisterRefresh(refresh);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveAll();
      toast.success('Referral rewards updated');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader icon={UserPlus} title="Referral Rewards" subtitle="INR rewards paid for successful user referrals" />
      <div className="max-w-lg">
        <Card>
          <CardHeader title="Reward Tiers" subtitle="Triggered when a referred user completes KYC and uploads their first reel" />
          <form onSubmit={handleSubmit} className="space-y-5">
            <ConfigField
              label="Referrer reward (INR)"
              hint="Paid to the user who shared the referral code"
              value={values['REFERRAL_CREATOR_REWARD']}
              onChange={(v) => set('REFERRAL_CREATOR_REWARD', v)}
              min="0"
            />
            <ConfigField
              label="Referred user reward (INR)"
              hint="Paid to the new user who signed up via a referral code"
              value={values['REFERRAL_STANDARD_REWARD']}
              onChange={(v) => set('REFERRAL_STANDARD_REWARD', v)}
              min="0"
            />
            <ConfigField
              label="Super referral bonus (INR)"
              hint="Bonus for referring 10 or more creators within a single month"
              value={values['REFERRAL_SUPER_REWARD']}
              onChange={(v) => set('REFERRAL_SUPER_REWARD', v)}
              min="0"
            />
            <InfoBox>
              <span className="font-semibold text-foreground block mb-1">Max payout per referral pair</span>
              ₹{(values['REFERRAL_CREATOR_REWARD'] + values['REFERRAL_STANDARD_REWARD']).toLocaleString('en-IN')} combined
            </InfoBox>
            <div className="flex justify-end">
              <SaveButton loading={loading || saving} />
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

// ─── 6. Withdrawal Rules ─────────────────────────────────────────────────────

export function WithdrawalRulesPage() {
  const KEYS = ['MIN_WITHDRAWAL_INR'];
  const DEFAULTS = { MIN_WITHDRAWAL_INR: 500 };
  const { values, set, loading, saveAll } = useMultiConfig(KEYS, DEFAULTS);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    await adminService.getConfigs().catch(() => {});
  }, []);
  useRegisterRefresh(refresh);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (values['MIN_WITHDRAWAL_INR'] <= 0) { toast.error('Minimum must be greater than 0'); return; }
    setSaving(true);
    try {
      await saveAll();
      toast.success('Withdrawal rules updated');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader icon={ArrowDownToLine} title="Withdrawal Rules" subtitle="Minimum threshold and eligibility for creator withdrawals" />
      <div className="max-w-lg">
        <Card>
          <CardHeader title="Minimum Withdrawal" />
          <form onSubmit={handleSubmit} className="space-y-5">
            <ConfigField
              label="Minimum withdrawal amount (INR)"
              hint="Creators must have at least this amount in their withdrawable balance before they can request a payout"
              value={values['MIN_WITHDRAWAL_INR']}
              onChange={(v) => set('MIN_WITHDRAWAL_INR', v)}
              min="1"
            />
            <InfoBox>
              Creators below ₹{values['MIN_WITHDRAWAL_INR'].toLocaleString('en-IN')} cannot initiate a withdrawal request.
            </InfoBox>
            <div className="flex justify-end">
              <SaveButton loading={loading || saving} />
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

// ─── 7. Platform Fee & Tax ────────────────────────────────────────────────────

export function PlatformFeeTaxPage() {
  const KEYS = ['TDS_PERCENTAGE', 'PLATFORM_FEE_PERCENTAGE'];
  const DEFAULTS = { TDS_PERCENTAGE: 10, PLATFORM_FEE_PERCENTAGE: 2 };
  const { values, set, loading, saveAll } = useMultiConfig(KEYS, DEFAULTS);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    await adminService.getConfigs().catch(() => {});
  }, []);
  useRegisterRefresh(refresh);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = values['TDS_PERCENTAGE'] + values['PLATFORM_FEE_PERCENTAGE'];
    if (total >= 100) { toast.error('Total deduction cannot reach or exceed 100%'); return; }
    setSaving(true);
    try {
      await saveAll();
      toast.success('Fee and tax settings updated');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const total = values['TDS_PERCENTAGE'] + values['PLATFORM_FEE_PERCENTAGE'];
  const netPercent = (100 - total).toFixed(1);

  const exampleGross = 1000;
  const tdsAmt = ((values['TDS_PERCENTAGE'] / 100) * exampleGross).toFixed(2);
  const feeAmt = ((values['PLATFORM_FEE_PERCENTAGE'] / 100) * exampleGross).toFixed(2);
  const netAmt = (exampleGross - Number(tdsAmt) - Number(feeAmt)).toFixed(2);

  return (
    <div>
      <PageHeader icon={Percent} title="Platform Fee & Tax" subtitle="Deductions applied to creator withdrawal payouts" />
      <div className="max-w-lg">
        <Card>
          <CardHeader title="Deduction Rates" subtitle="Applied to the gross withdrawal amount at payout time" />
          <form onSubmit={handleSubmit} className="space-y-5">
            <ConfigField
              label="TDS (%)"
              hint="Tax Deducted at Source — statutory requirement under Indian tax law"
              value={values['TDS_PERCENTAGE']}
              onChange={(v) => set('TDS_PERCENTAGE', v)}
              step="0.1"
              min="0"
              max="99"
            />
            <ConfigField
              label="Platform fee (%)"
              hint="Popli's service fee deducted from each withdrawal"
              value={values['PLATFORM_FEE_PERCENTAGE']}
              onChange={(v) => set('PLATFORM_FEE_PERCENTAGE', v)}
              step="0.1"
              min="0"
              max="99"
            />
            <InfoBox>
              <span className="font-semibold text-foreground block mb-2">Payout preview — ₹{exampleGross} gross</span>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>TDS ({values['TDS_PERCENTAGE']}%)</span>
                  <span className="text-destructive font-semibold">− ₹{tdsAmt}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform fee ({values['PLATFORM_FEE_PERCENTAGE']}%)</span>
                  <span className="text-destructive font-semibold">− ₹{feeAmt}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-1 mt-1">
                  <span className="font-semibold text-foreground">Net to creator ({netPercent}%)</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{netAmt}</span>
                </div>
              </div>
            </InfoBox>
            <div className="flex justify-end">
              <SaveButton loading={loading || saving} />
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}