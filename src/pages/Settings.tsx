import React, { useState, useEffect, useCallback } from 'react';
import { useRegisterRefresh } from '../hooks/useRegisterRefresh';
import { Settings2, RefreshCw, Shield, Users, Fingerprint, Trophy } from 'lucide-react';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';
import { adminService } from '../services/adminService';

interface FeatureFlags {
  AI_MODERATION_ENABLED: boolean;
  AUTO_SHADOW_BAN_ENABLED: boolean;
  IP_FINGERPRINTING_ENABLED: boolean;
  AUTO_PUSH_CHALLENGES_ENABLED: boolean;
}

const FLAG_META: {
  key: keyof FeatureFlags;
  label: string;
  desc: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  detail: string;
}[] = [
  {
    key: 'AI_MODERATION_ENABLED',
    label: 'Content Moderation Gate',
    desc: 'Require admin review before reels go live',
    icon: Shield,
    iconBg: 'bg-blue-50 dark:bg-blue-500/10',
    iconColor: 'text-blue-600 dark:text-blue-400',
    detail: 'When enabled, all newly uploaded reels are held in PENDING state and must be approved by a moderator before appearing in the feed.',
  },
  {
    key: 'AUTO_SHADOW_BAN_ENABLED',
    label: 'Auto Shadow-Ban Toxic Profiles',
    desc: 'Automatically flag accounts exceeding report threshold',
    icon: Users,
    iconBg: 'bg-red-50 dark:bg-red-500/10',
    iconColor: 'text-red-600 dark:text-red-400',
    detail: 'A scheduled job runs daily at 2 AM. Any creator whose reels received 5+ unresolved reports in the past 7 days is automatically shadow-banned and logged in the audit trail.',
  },
  {
    key: 'IP_FINGERPRINTING_ENABLED',
    label: 'IP Fingerprint Clustering',
    desc: 'Flag suspicious multi-account registrations',
    icon: Fingerprint,
    iconBg: 'bg-amber-50 dark:bg-amber-500/10',
    iconColor: 'text-amber-600 dark:text-amber-400',
    detail: 'When enabled, login attempts from IPs with more than 5 associated accounts in the past 30 days are flagged and logged in the audit trail for admin review.',
  },
  {
    key: 'AUTO_PUSH_CHALLENGES_ENABLED',
    label: 'Auto-Push Creator Challenges',
    desc: 'Daily challenge notifications to all active creators',
    icon: Trophy,
    iconBg: 'bg-emerald-50 dark:bg-emerald-500/10',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    detail: 'A scheduled job runs daily at 9 AM. It finds the top 3 active challenges by participation and sends in-app notifications to all unblocked creators.',
  },
];

export const SettingsPage: React.FC = () => {
  const [flags, setFlags] = useState<FeatureFlags>({
    AI_MODERATION_ENABLED: false,
    AUTO_SHADOW_BAN_ENABLED: false,
    IP_FINGERPRINTING_ENABLED: false,
    AUTO_PUSH_CHALLENGES_ENABLED: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

const refresh = useCallback(async () => {
    const data = await adminService.getFeatureFlags().catch(() => null);
    if (data) setFlags(data);
  }, []);

  useRegisterRefresh(refresh);

  useEffect(() => {
    adminService.getFeatureFlags()
      .then((data: FeatureFlags) => setFlags(data))
      .catch(() => toast.error('Failed to load platform settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (key: keyof FeatureFlags) => {
    const newValue = !flags[key];
    setFlags((prev) => ({ ...prev, [key]: newValue }));
    setSaving(key);
    try {
      await adminService.updateFeatureFlag(key, newValue);
      toast.success(`${newValue ? 'Enabled' : 'Disabled'} successfully`);
    } catch (err: any) {
      setFlags((prev) => ({ ...prev, [key]: !newValue }));
      toast.error(err?.response?.data?.message || 'Failed to update setting');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-bold text-foreground tracking-tight">Platform Settings</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Feature flags that control real backend behaviour. Changes take effect immediately and are persisted to the database.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Settings2 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-foreground">System Feature Flags</p>
            <p className="text-[11px] text-muted-foreground">All changes are saved to PostgreSQL and logged in the audit trail</p>
          </div>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {FLAG_META.map((meta) => {
              const Icon = meta.icon;
              const isEnabled = flags[meta.key];
              const isSaving = saving === meta.key;
              return (
                <div
                  key={meta.key}
                  className={cn(
                    'p-4 border rounded-xl transition-all space-y-3',
                    isEnabled
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-border bg-muted/30'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', meta.iconBg)}>
                        <Icon className={cn('w-4 h-4', meta.iconColor)} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-foreground leading-snug">{meta.label}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{meta.desc}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle(meta.key)}
                      disabled={isSaving}
                      className={cn(
                        'relative w-11 h-6 rounded-full border-2 transition-all duration-300 shrink-0 focus:outline-none disabled:opacity-60',
                        isEnabled ? 'bg-primary border-primary' : 'bg-muted border-border'
                      )}
                    >
                      {isSaving ? (
                        <RefreshCw className="absolute inset-0 m-auto w-3 h-3 text-white animate-spin" />
                      ) : (
                        <span
                          className={cn(
                            'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300',
                            isEnabled ? 'translate-x-5' : 'translate-x-0'
                          )}
                        />
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed pl-11">
                    {meta.detail}
                  </p>
                  <div className="pl-11">
                    <span className={cn(
                      'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border',
                      isEnabled
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                        : 'bg-muted text-muted-foreground border-border'
                    )}>
                      {isEnabled ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};