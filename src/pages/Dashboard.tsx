import React, { useState, useEffect, useCallback } from 'react';
import { useRegisterRefresh } from '../hooks/useRegisterRefresh';
import { usePlatformStore } from '../store/usePlatformStore';
import { adminService } from '@/services/adminService';
import {
  Users as UsersIcon,
  Video,
  Eye,
  TrendingUp,
  Coins,
  Gift,
  Clock,
  Activity,
  Globe,
  ChevronDown,
  ShieldCheck,
  AlertTriangle,
  Shield,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { cn } from '@/utils/cn';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg px-3 py-2.5 text-[12px]">
        <p className="text-muted-foreground font-medium mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-foreground font-semibold">{entry.value.toLocaleString()} {entry.name}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const GrowthChart = ({ data, tab }: { data: any[]; tab: 'Monthly' | 'Weekly' }) => {
  const hasData = data && data.length > 0 && data.some((d) => (d.Users || d.users || 0) > 0);

  if (!hasData) {
    return (
      <div className="h-56 flex flex-col items-center justify-center gap-3 text-center">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-foreground">No growth data yet</p>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            Creator registrations will appear here once users sign up.
          </p>
        </div>
      </div>
    );
  }

  const normalized = data.map((d, i) => ({
    label: d.name || d.month || d.week || (tab === 'Monthly' ? MONTH_LABELS[i % 12] : `W${i + 1}`),
    Users: d.Users || d.users || d.count || 0,
  }));

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={normalized} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="0"
            stroke="hsl(220 13% 91%)"
            strokeOpacity={0.8}
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fill: 'hsl(220 9% 55%)', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
            tickLine={false}
            axisLine={false}
            dy={8}
          />
          <YAxis
            tick={{ fill: 'hsl(220 9% 55%)', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
            width={36}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#2563eb', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Area
            type="monotone"
            dataKey="Users"
            stroke="#2563eb"
            strokeWidth={2}
            fill="url(#gradUsers)"
            dot={false}
            activeDot={{ r: 4, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const KPICard = ({
  title,
  value,
  desc,
  icon: Icon,
  iconBg,
}: {
  title: string;
  value: string;
  desc: string;
  icon: React.ElementType;
  iconBg: string;
}) => (
  <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <span className="text-[13px] font-medium text-muted-foreground">{title}</span>
      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', iconBg)}>
        <Icon className="w-4 h-4" />
      </div>
    </div>
    <div>
      <span className="text-[28px] font-bold text-foreground leading-none tracking-tight">{value}</span>
      <p className="text-[11px] text-muted-foreground mt-1.5 uppercase tracking-wider font-medium">{desc}</p>
    </div>
  </div>
);

export const DashboardPage: React.FC = () => {
const { creators, reels, dashboardStats, fetchAllData } = usePlatformStore();
const [growthTab, setGrowthTab] = useState<'Monthly' | 'Weekly'>('Monthly');
const [botProtection, setBotProtection] = useState<{
  enabled: boolean;
  enabledAt: string | null;
  enabledByName: string | null;
  loading: boolean;
}>({ enabled: false, enabledAt: null, enabledByName: null, loading: true });
const [confirmDialog, setConfirmDialog] = useState<'enable' | 'disable' | null>(null);
const [actionLoading, setActionLoading] = useState(false);

const refresh = useCallback(async () => {
  await Promise.all([
    fetchAllData(),
    adminService.getBotProtectionStatus()
      .then((data) => setBotProtection({ enabled: data.enabled, enabledAt: data.enabledAt, enabledByName: data.enabledByName ?? null, loading: false }))
      .catch(() => {}),
  ]);
}, [fetchAllData]);

useRegisterRefresh(refresh);

useEffect(() => {
    adminService.getBotProtectionStatus()
      .then((data) => {
        setBotProtection({
          enabled: data.enabled,
          enabledAt: data.enabledAt,
          enabledByName: data.enabledByName ?? null,
          loading: false,
        });
      })
      .catch(() => {
        setBotProtection((prev) => ({ ...prev, loading: false }));
      });
  }, []);

  const handleBotProtectionConfirm = async () => {
    setActionLoading(true);
    try {
      if (confirmDialog === 'enable') {
        const res = await adminService.enableBotProtection('Enabled via admin dashboard');
        setBotProtection({ enabled: true, enabledAt: res.enabledAt, enabledByName: null, loading: false });
        toast.success('Bot protection enabled');
      } else {
        const res = await adminService.disableBotProtection('Disabled via admin dashboard');
        setBotProtection({ enabled: false, enabledAt: null, enabledByName: null, loading: false });
        toast.success('Bot protection disabled');
      }
    } catch {
      toast.error('Action failed. Check your permissions.');
    } finally {
      setActionLoading(false);
      setConfirmDialog(null);
    }
  };

  const CITIES = [
    { id: 'all', name: 'All India' },
    { id: 'mumbai', name: 'Mumbai' },
    { id: 'delhi', name: 'Delhi' },
    { id: 'bengaluru', name: 'Bengaluru' },
    { id: 'lucknow', name: 'Lucknow' },
    { id: 'jaipur', name: 'Jaipur' },
    { id: 'indore', name: 'Indore' },
    { id: 'madurai', name: 'Madurai' },
  ];

  const [selectedCity, setSelectedCity] = useState('all');

  const handleCityChange = (cityId: string) => {
    setSelectedCity(cityId);
    (window as any).__popli_active_city_filter = cityId;
    window.dispatchEvent(new CustomEvent('popli_city_changed', { detail: cityId }));
  };

const userGrowthData = dashboardStats?.userGrowthData || [];
  const moodPieData: { name: string; value: number; color: string }[] = dashboardStats?.moodPieData || [];
  const hasMoodData = moodPieData.length > 0 && moodPieData.some(d => d.value > 0);


const totalUsersCount = dashboardStats?.totalUsers ?? creators.filter(c => c.status !== 'suspended').length;
  const activeUsersCount = dashboardStats?.totalCreators ?? creators.filter((c) => c.status === 'active').length;
  const totalReelsCount = dashboardStats?.totalReels ?? reels.length;
  const totalViewsCount = reels.reduce((acc, r) => acc + r.views, 0);

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toString();
  };

const processingPercent = moodPieData.reduce((a: number, b: { value: number }) => a + b.value, 0);
 const liveSecurityEvents: any[] = dashboardStats?.securityEvents || [];

return (
    <div className="space-y-6">
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center',
                  confirmDialog === 'enable'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                )}>
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-[15px] font-semibold text-foreground">
                  {confirmDialog === 'enable' ? 'Enable Bot Protection?' : 'Disable Bot Protection?'}
                </h3>
              </div>
              <button
                onClick={() => setConfirmDialog(null)}
                className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              {confirmDialog === 'enable'
                ? 'You are about to enable Platform Bot Protection Mode. This will place the platform into a high-security state and begin monitoring suspicious activity. This action will be logged.'
                : 'You are about to disable Bot Protection. This will return the platform to normal operating mode. This action will be logged.'}
            </p>
            <div className="flex items-center gap-2 p-3 bg-muted/60 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <p className="text-[12px] text-muted-foreground">This action is recorded in the Audit Log.</p>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setConfirmDialog(null)}
                disabled={actionLoading}
                className="flex-1 h-10 border border-border rounded-lg text-[13px] font-medium text-muted-foreground hover:bg-muted transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBotProtectionConfirm}
                disabled={actionLoading}
                className={cn(
                  'flex-1 h-10 rounded-lg text-[13px] font-semibold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2',
                  confirmDialog === 'enable'
                    ? 'bg-primary hover:bg-primary/90'
                    : 'bg-red-500 hover:bg-red-600'
                )}
              >
                {actionLoading && <Activity className="w-3.5 h-3.5 animate-spin" />}
                {confirmDialog === 'enable' ? 'Enable Protection' : 'Disable Protection'}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-foreground tracking-tight">Platform Overview</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Centralized administrative monitoring for Popli Global Operations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <Globe className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none" />
            <select
              value={selectedCity}
              onChange={(e) => handleCityChange(e.target.value)}
              className="appearance-none h-9 pl-9 pr-8 rounded-lg border border-border bg-card text-[13px] font-medium text-foreground hover:bg-muted transition-colors cursor-pointer outline-none"
            >
              {CITIES.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 pointer-events-none" />
          </div>
<button
            disabled={botProtection.loading}
            onClick={() => setConfirmDialog(botProtection.enabled ? 'disable' : 'enable')}
            className={cn(
              'flex items-center gap-2 h-9 px-4 rounded-lg text-[13px] font-semibold transition-all disabled:opacity-50',
              botProtection.enabled
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-primary text-white hover:bg-primary/90'
            )}
          >
            <Shield className="w-4 h-4" />
            {botProtection.loading
              ? 'Loading...'
              : botProtection.enabled
              ? 'Bot Protection Active'
              : 'Enable Bot Protection'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Creators"
          value={formatNumber(totalUsersCount)}
          desc="Registered Profile Index"
          icon={UsersIcon}
          iconBg="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
        />
        <KPICard
          title="Active Creators"
          value={formatNumber(activeUsersCount)}
          desc="Clearance Secured Vibes"
          icon={Activity}
          iconBg="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
        />
        <KPICard
          title="Total Uploaded Reels"
          value={formatNumber(totalReelsCount)}
          desc="Content Repository Block"
          icon={Video}
          iconBg="bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
        />
        <KPICard
          title="Cumulative Views"
          value={formatNumber(totalViewsCount)}
          desc="Watch Loop Volumetric"
          icon={Eye}
          iconBg="bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400"
        />
        <KPICard
          title="Distributed Coins"
          value={formatNumber(dashboardStats?.distributedCoins || 0)}
          desc="Virtual Coin Circulation"
          icon={Coins}
          iconBg="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
        />
<KPICard
          title="Gift Revenue"
          value={dashboardStats?.giftRevenue != null ? '₹' + formatNumber(dashboardStats.giftRevenue) : '—'}
          desc="Commerce Inflow INR"
          icon={Gift}
          iconBg="bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400"
        />
        <KPICard
          title="Avg Watch Time"
          value={dashboardStats?.avgWatchTime != null ? `${dashboardStats.avgWatchTime} Min` : '—'}
          desc="Session Dopamine Depth"
          icon={Clock}
          iconBg="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
        />
        <KPICard
          title="Virality Accel"
          value={dashboardStats?.viralityAccel != null ? `${dashboardStats.viralityAccel}%` : '—'}
          desc="Recommender Exponential"
          icon={TrendingUp}
          iconBg="bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
  <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-semibold text-foreground">Platform Growth Vector</h2>
              <p className="text-[12px] text-muted-foreground mt-0.5">Historical trajectory of creator adoption</p>
            </div>
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              {(['Monthly', 'Weekly'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setGrowthTab(tab)}
                  className={cn(
                    'h-7 px-3 rounded-md text-[12px] font-medium transition-all',
                    growthTab === tab
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <GrowthChart data={userGrowthData} tab={growthTab} />
        </div>

    <div className="bg-card border border-border rounded-xl p-5 flex flex-col">
          <div>
            <h2 className="text-[15px] font-semibold text-foreground">Psychology Emotion Breakdown</h2>
            <p className="text-[12px] text-muted-foreground mt-0.5">Sentiment analysis of user interactions</p>
          </div>
          {hasMoodData ? (
            <>
              <div className="flex-1 flex items-center justify-center relative my-2">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={moodPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {moodPieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[22px] font-bold text-foreground">{processingPercent}%</span>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Processing</span>
                </div>
              </div>
              <div className="space-y-2 mt-2">
                {moodPieData.map((mood, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: mood.color }} />
                      <span className="text-[12px] text-muted-foreground">{mood.name}</span>
                    </div>
                    <span className="text-[12px] font-semibold text-foreground">{mood.value}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center py-8">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Activity className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-[13px] font-semibold text-foreground">No sentiment data yet</p>
              <p className="text-[12px] text-muted-foreground">Emotion analysis will appear once user interaction data is available.</p>
            </div>
          )}
        </div>
      </div>

   <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-[15px] font-semibold text-foreground">Security Event Log</h2>
      {botProtection.enabled && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 px-2.5 py-1 rounded-md flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Bot Protection Active
            </span>
          )}
        </div>
        {liveSecurityEvents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {['Timestamp', 'Event Type', 'Region', 'Status', 'Action'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {liveSecurityEvents.map((evt: any, idx: number) => (
                  <tr key={evt.id || idx} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 text-[12px] font-mono text-foreground">
                      {evt.time || (evt.createdAt ? new Date(evt.createdAt).toLocaleTimeString() : '—')}
                    </td>
                    <td className="px-5 py-3.5 text-[12px] font-medium text-foreground">{evt.type || evt.eventType || '—'}</td>
                    <td className="px-5 py-3.5 text-[12px] text-muted-foreground">{evt.region || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide',
                        ['STABLE', 'stable'].includes(evt.status)
                          ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                          : ['RESOLVED', 'resolved'].includes(evt.status)
                          ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
                          : 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
                      )}>
                        {evt.status || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button className="text-[12px] font-semibold text-primary hover:underline">Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-center py-10">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-[13px] font-semibold text-foreground">No security events</p>
         <p className="text-[12px] text-muted-foreground">Security events will appear here once bot protection actions are performed.</p>
          </div>
        )}
      </div>
    </div>
  );
};