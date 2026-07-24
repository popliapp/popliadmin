import React, { useEffect, useState } from 'react';
import { usePlatformStore } from '../store/usePlatformStore';
import {
  ShieldCheck,
  AlertTriangle,
  Monitor,
  Globe,
  RefreshCw,
  ShieldAlert,
  Ban,
  EyeOff,
  Shield,
  Activity,
  X,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';
import { adminService } from '@/services/adminService';
const RISK_BADGE: Record<string, string> = {
  critical: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20',
  high: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
  medium: 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
};

const FLAG_BADGE: Record<string, string> = {
  shadow_banned: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
  blocked: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20',
};

const FLAG_LABEL: Record<string, string> = {
  shadow_banned: 'Shadow Banned',
  blocked: 'Blocked',
};

const TABS = [
  { id: 'alerts', label: 'Threat Alerts', icon: AlertTriangle, desc: 'Real-time threat detection' },
  { id: 'devices', label: 'Device Fingerprints', icon: Monitor, desc: 'Multi-session device tracking' },
  { id: 'ips', label: 'IP Monitor', icon: Globe, desc: 'Suspicious IP clustering' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export const FraudPage: React.FC = () => {
 const { fraudStats, fetchFraudStats } = usePlatformStore();
  const [botProtection, setBotProtection] = useState<{
    enabled: boolean;
    enabledAt: string | null;
    loading: boolean;
  }>({ enabled: false, enabledAt: null, loading: true });
  const [confirmDialog, setConfirmDialog] = useState<'enable' | 'disable' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<TabId>('alerts');
  const [loading, setLoading] = useState(true);
useEffect(() => {
    fetchFraudStats().finally(() => setLoading(false));
    adminService.getBotProtectionStatus()
      .then((data) => setBotProtection({ enabled: data.enabled, enabledAt: data.enabledAt, loading: false }))
      .catch(() => setBotProtection((prev) => ({ ...prev, loading: false })));
  }, [fetchFraudStats]);
  const handleRefresh = () => {
    setLoading(true);
    fetchFraudStats().finally(() => setLoading(false));
  };

const handleBotProtectionConfirm = async () => {
    setActionLoading(true);
    try {
      if (confirmDialog === 'enable') {
        await adminService.enableBotProtection('Enabled via security center');
        setBotProtection((prev) => ({ ...prev, enabled: true, enabledAt: new Date().toISOString() }));
        toast.success('Bot protection enabled');
      } else {
        await adminService.disableBotProtection('Disabled via security center');
        setBotProtection((prev) => ({ ...prev, enabled: false, enabledAt: null }));
        toast.success('Bot protection disabled');
      }
    } catch {
      toast.error('Action failed. Check your permissions.');
    } finally {
      setActionLoading(false);
      setConfirmDialog(null);
    }
  };
  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-foreground tracking-tight">
            Security & Anti-Fraud Center
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Real-time threat detection, device fingerprinting, and IP monitoring.
          </p>
        </div>

      <button
          onClick={handleRefresh}
          disabled={loading}
          className="h-9 px-3 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-2 text-[12px] font-medium disabled:opacity-50 self-start"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

{/* ── Main layout: sidebar + content ── */}
      <div className="flex gap-6 items-start">

        {/* Page-level sidebar — desktop only */}
        <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Security Modules
            </p>
          </div>
          <nav className="p-2 space-y-0.5">
            {TABS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    'w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-all',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Icon className={cn('w-4 h-4 mt-0.5 flex-shrink-0', isActive ? 'text-white' : 'text-muted-foreground')} />
                  <div className="min-w-0">
                    <p className={cn('text-[12px] font-semibold leading-none', isActive ? 'text-white' : 'text-foreground')}>
                      {item.label}
                    </p>
                    <p className={cn('text-[11px] mt-1 leading-snug', isActive ? 'text-white/70' : 'text-muted-foreground')}>
                      {item.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Mobile tab strip */}
        <div className="flex lg:hidden items-center gap-1 bg-muted rounded-lg p-1 w-full">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 h-7 px-2 rounded-md text-[11px] font-medium transition-all truncate',
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content area */}
        <div className="flex-1 min-w-0 space-y-6">

      {/* ── KPI Summary Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Shadow Banned',
            value: loading ? '—' : (fraudStats?.shadowBannedCount ?? 0).toString(),
            icon: EyeOff,
            iconBg: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
          },
          {
            label: 'Blocked Users',
            value: loading ? '—' : (fraudStats?.blockedCount ?? 0).toString(),
            icon: Ban,
            iconBg: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
          },
          {
            label: 'Suspicious IPs',
            value: loading ? '—' : (fraudStats?.suspiciousIps?.length ?? 0).toString(),
            icon: Globe,
            iconBg: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
          },
          {
            label: 'Revoked Sessions',
            value: loading ? '—' : (fraudStats?.revokedSessionsCount ?? 0).toString(),
            icon: ShieldAlert,
            iconBg: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
          },
        ].map(({ label, value, icon: Icon, iconBg }) => (
          <div
            key={label}
            className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <span className="text-[13px] font-medium text-muted-foreground">{label}</span>
              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', iconBg)}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <span className="text-[28px] font-bold text-foreground leading-none tracking-tight">
              {value}
            </span>
          </div>
        ))}
      </div>

     {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', confirmDialog === 'enable' ? 'bg-primary/10 text-primary' : 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400')}>
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-[15px] font-semibold text-foreground">
                  {confirmDialog === 'enable' ? 'Enable Bot Protection?' : 'Disable Bot Protection?'}
                </h3>
              </div>
              <button onClick={() => setConfirmDialog(null)} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              {confirmDialog === 'enable'
                ? 'This will place the platform into high-security state. All actions are logged in the audit trail.'
                : 'This will return the platform to normal operating mode. This action is logged.'}
            </p>
            <div className="flex items-center gap-2 p-3 bg-muted/60 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <p className="text-[12px] text-muted-foreground">This action is recorded in the Audit Log.</p>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setConfirmDialog(null)} disabled={actionLoading} className="flex-1 h-10 border border-border rounded-lg text-[13px] font-medium text-muted-foreground hover:bg-muted transition-all disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleBotProtectionConfirm} disabled={actionLoading} className={cn('flex-1 h-10 rounded-lg text-[13px] font-semibold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2', confirmDialog === 'enable' ? 'bg-primary hover:bg-primary/90' : 'bg-red-500 hover:bg-red-600')}>
                {actionLoading && <Activity className="w-3.5 h-3.5 animate-spin" />}
                {confirmDialog === 'enable' ? 'Enable Protection' : 'Disable Protection'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={cn('border rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all', botProtection.enabled ? 'bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/30' : 'bg-card border-border')}>
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className={cn('w-2 h-2 rounded-full flex-shrink-0', botProtection.enabled ? 'bg-red-500 animate-pulse' : 'bg-emerald-500')} />
            <span className={cn('text-[13px] font-semibold', botProtection.enabled ? 'text-red-600 dark:text-red-400' : 'text-foreground')}>
              {botProtection.enabled ? 'Bot Protection Active' : 'Bot Protection Inactive'}
            </span>
          </div>
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            {botProtection.enabled
              ? `Enabled ${botProtection.enabledAt ? new Date(botProtection.enabledAt).toLocaleString() : ''}. Platform is in high-security mode.`
              : 'Enable to place the platform in high-security monitoring mode.'}
          </p>
        </div>
        <button
          disabled={botProtection.loading}
          onClick={() => setConfirmDialog(botProtection.enabled ? 'disable' : 'enable')}
          className={cn('h-9 px-4 rounded-lg text-[13px] font-semibold transition-all flex items-center gap-2 flex-shrink-0 disabled:opacity-50', botProtection.enabled ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-primary text-white hover:bg-primary/90')}
        >
          <Shield className="w-3.5 h-3.5" />
          {botProtection.loading ? 'Loading...' : botProtection.enabled ? 'Disable Protection' : 'Enable Protection'}
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════ */}
      {/* TAB: Threat Alerts                                       */}
      {/* ════════════════════════════════════════════════════════ */}
      {activeTab === 'alerts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* High-volume view farming devices */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-semibold text-foreground">
                  High-Volume View Farming Devices
                </h2>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  Devices generating abnormal view counts in the last 24 hours
                </p>
              </div>
              {(fraudStats?.highVolumeViewers?.length ?? 0) > 0 && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 px-2.5 py-1 rounded-md border border-red-200 dark:border-red-500/20">
                  {fraudStats!.highVolumeViewers.length} flagged
                </span>
              )}
            </div>

            <div className="overflow-y-auto max-h-[400px] divide-y divide-border">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <RefreshCw className="w-5 h-5 text-muted-foreground animate-spin" />
                </div>
              ) : (fraudStats?.highVolumeViewers?.length ?? 0) > 0 ? (
                fraudStats!.highVolumeViewers.map((viewer, idx) => (
                  <div
                    key={idx}
                    className="px-5 py-3.5 flex items-center justify-between hover:bg-muted/30 transition-colors"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-[12px] font-mono text-foreground truncate">
                        {viewer.deviceId}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {viewer.viewCount.toLocaleString()} views in 24h
                      </p>
                    </div>
                    <span
                      className={cn(
                        'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ml-4 flex-shrink-0',
                        RISK_BADGE[viewer.riskLevel],
                      )}
                    >
                      {viewer.riskLevel}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-[13px] font-semibold text-foreground">No farming activity detected</p>
                  <p className="text-[12px] text-muted-foreground">
                    No devices exceeded the view farming threshold in the last 24 hours.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Flagged users summary */}
          <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-[15px] font-semibold text-foreground">Flagged Users</h2>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                Shadow banned and blocked accounts
              </p>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-border max-h-[400px]">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <RefreshCw className="w-5 h-5 text-muted-foreground animate-spin" />
                </div>
              ) : (fraudStats?.suspiciousUsers?.length ?? 0) > 0 ? (
                fraudStats!.suspiciousUsers.map((user) => (
                  <div
                    key={user.id}
                    className="px-5 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={user.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`}
                        alt={user.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`;
                        }}
                        className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-border bg-muted"
                      />
                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold text-foreground truncate">
                          {user.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ml-3 flex-shrink-0',
                        FLAG_BADGE[user.flagType],
                      )}
                    >
                      {FLAG_LABEL[user.flagType]}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 gap-2 text-center px-5">
                  <ShieldCheck className="w-8 h-8 text-muted-foreground opacity-30" />
                  <p className="text-[12px] text-muted-foreground">No flagged users</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* TAB: Device Fingerprints                                 */}
      {/* ════════════════════════════════════════════════════════ */}
      {activeTab === 'devices' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-semibold text-foreground">
                  Suspicious Device Fingerprints
                </h2>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  Devices with multiple sessions in the last 7 days
                </p>
              </div>
              {(fraudStats?.suspiciousDevices?.length ?? 0) > 0 && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-500/20">
                  {fraudStats!.suspiciousDevices.length} flagged
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <RefreshCw className="w-5 h-5 text-muted-foreground animate-spin" />
                </div>
              ) : (fraudStats?.suspiciousDevices?.length ?? 0) > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      {['Device Info', 'Sessions (7d)', 'Risk Level'].map((h) => (
                        <th
                          key={h}
                          className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fraudStats!.suspiciousDevices.map((d, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-5 py-3.5 text-[12px] font-mono text-foreground max-w-[240px] truncate">
                          {d.deviceInfo}
                        </td>
                        <td className="px-5 py-3.5 text-[12px] font-semibold text-foreground">
                          {d.sessionCount.toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={cn(
                              'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border',
                              RISK_BADGE[d.riskLevel],
                            )}
                          >
                            {d.riskLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Monitor className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-[13px] font-semibold text-foreground">No suspicious devices</p>
                  <p className="text-[12px] text-muted-foreground">
                    No devices exceeded the multi-session threshold in the last 7 days.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="text-[15px] font-semibold text-foreground">How It Works</h2>
            <div className="space-y-3">
              {[
                {
                  title: 'Session Grouping',
                  body: 'Sessions are grouped by device fingerprint. Any device creating 5+ sessions in 7 days is flagged for review.',
                },
                {
                  title: 'Risk Thresholds',
                  body: '5–9 sessions = Medium. 10–19 sessions = High. 20+ sessions = Critical.',
                },
                {
                  title: 'Automatic Action',
                  body: 'Critical devices are candidates for automatic coin lock and reach throttling via the Users page.',
                },
              ].map((item) => (
                <div key={item.title} className="p-3 bg-muted/40 border border-border rounded-lg space-y-1">
                  <p className="text-[12px] font-semibold text-foreground">{item.title}</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* TAB: IP Monitor                                          */}
      {/* ════════════════════════════════════════════════════════ */}
      {activeTab === 'ips' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-semibold text-foreground">Suspicious IP Addresses</h2>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  IPs with 3+ sessions in the last 7 days
                </p>
              </div>
              {(fraudStats?.suspiciousIps?.length ?? 0) > 0 && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-500/20">
                  {fraudStats!.suspiciousIps.length} flagged
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <RefreshCw className="w-5 h-5 text-muted-foreground animate-spin" />
                </div>
              ) : (fraudStats?.suspiciousIps?.length ?? 0) > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      {['IP Address', 'Sessions (7d)', 'Risk Level'].map((h) => (
                        <th
                          key={h}
                          className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fraudStats!.suspiciousIps.map((ip, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-5 py-3.5 text-[12px] font-mono text-foreground">
                          {ip.ipAddress}
                        </td>
                        <td className="px-5 py-3.5 text-[12px] font-semibold text-foreground">
                          {ip.sessionCount.toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={cn(
                              'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border',
                              RISK_BADGE[ip.riskLevel],
                            )}
                          >
                            {ip.riskLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Globe className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-[13px] font-semibold text-foreground">No suspicious IPs</p>
                  <p className="text-[12px] text-muted-foreground">
                    No IP addresses exceeded the session threshold in the last 7 days.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="text-[15px] font-semibold text-foreground">IP Cluster Monitor</h2>
            <div className="space-y-3">
              {[
                {
                  title: 'Detection Method',
                  body: 'Sessions are grouped by IP address. IPs appearing 3+ times in 7 days are flagged for review.',
                },
                {
                  title: 'Risk Thresholds',
                  body: '3–4 sessions = Medium. 5–9 sessions = High. 10+ sessions = Critical.',
                },
                {
                  title: 'VPN & Proxy',
                  body: 'Shared IPs from VPN exit nodes or datacenter ranges typically generate Critical flags across unrelated users.',
                },
              ].map((item) => (
                <div key={item.title} className="p-3 bg-muted/40 border border-border rounded-lg space-y-1">
                  <p className="text-[12px] font-semibold text-foreground">{item.title}</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-3 py-2.5 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-[12px] font-semibold">Shield active — live DB data</span>
            </div>
          </div>
        </div>
      )}
</div>{/* end content area */}
      </div>{/* end sidebar + content row */}
    </div>
  );
};