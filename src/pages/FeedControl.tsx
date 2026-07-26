import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Sliders, MapPin, Smile, Compass, Clock, Zap, ShieldCheck,
  Trash2, Pause, Play, AlertCircle, History, RotateCcw,
  Activity, TrendingUp, BarChart2, RefreshCw, ChevronDown, ChevronUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';
import { cn } from '@/utils/cn';
import { adminService } from '@/services/adminService';
import { API_URL } from '@/services/api';
import { useRegisterRefresh } from '@/hooks/useRegisterRefresh';

type BoostStatus = 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'SCHEDULED';

interface FeedBoost {
  id: string;
  type: string;
  target: string;
  intensity: number;
  status: BoostStatus;
  priority: number;
  startDate: string | null;
  endDate: string | null;
  notes: string | null;
  createdAt: string;
}

interface SimulatedReel {
  id: string;
  title: string;
  category: string;
  creatorUsername: string;
  creatorName: string;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  createdAt: string;
  scores: {
    final: number;
    watchTime: number;
    engagement: number;
    share: number;
    freshness: number;
    creator: number;
    reportPenalty: number;
  };
  reason: string;
  penaltyReason: string | null;
}

interface Metrics {
  totalReels: number;
  totalViews: number;
  totalValidViews: number;
  pendingEarningsViews: number;
  activeUsers: number;
  pendingReports: number;
  activeBoosts: number;
  topCategories: Array<{ category: string; count: number; views: number }>;
  topHashtags: Array<{ name: string; usageCount: number }>;
  configVersion: number;
}

interface ConfigVersion {
  id: string;
  version: number;
  weights: Record<string, number>;
  notes: string | null;
  changedBy: string;
  createdAt: string;
}

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue: any;
  newValue: any;
  timestamp: string;
}

const WEIGHT_KEYS = [
  { key: 'watchTimeWeight', label: 'Watch Completion', icon: Clock, desc: 'Prioritizes high watch-time reels' },
  { key: 'shareWeight', label: 'Share Acceleration', icon: Compass, desc: 'Boosts peer-to-peer sharing loops' },
  { key: 'nearbyWeight', label: 'Hyperlocal Proximity', icon: MapPin, desc: 'Weights distance from creator node' },
  { key: 'commentWeight', label: 'Engagement Score', icon: Sliders, desc: 'Filters for conversation density' },
  { key: 'moodWeight', label: 'Mood Resonance', icon: Smile, desc: 'Evokes mood triggers in feed pipeline' },
];

const BOOST_STATUS_STYLES: Record<BoostStatus, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  PAUSED: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  EXPIRED: 'bg-muted text-muted-foreground',
  SCHEDULED: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
};

const SUB_TABS = [
  { id: 'recommender', label: 'Recommender' },
  { id: 'simulator', label: 'Feed Simulator' },
  { id: 'boosts', label: 'Boost Injector' },
  { id: 'versions', label: 'Config History' },
  { id: 'audit', label: 'Audit Logs' },
];

const SkeletonBlock = ({ h = 'h-10' }: { h?: string }) => (
  <div className={cn('rounded-lg bg-muted animate-pulse', h)} />
);

export const FeedControlPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('recommender');
  const [weights, setWeights] = useState<Record<string, number>>({
    watchTimeWeight: 45, shareWeight: 25, nearbyWeight: 20, commentWeight: 10, moodWeight: 5,
  });
  const [configNotes, setConfigNotes] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);
  const [boosts, setBoosts] = useState<FeedBoost[]>([]);
  const [boostsLoading, setBoostsLoading] = useState(true);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [versions, setVersions] = useState<ConfigVersion[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [simCategory, setSimCategory] = useState('comedy');
  const [simCity, setSimCity] = useState('');
  const [simResults, setSimResults] = useState<SimulatedReel[]>([]);
  const [simLoading, setSimLoading] = useState(false);
  const [expandedReel, setExpandedReel] = useState<string | null>(null);
  const [boostForm, setBoostForm] = useState({
    type: 'hashtag', target: '', intensity: 50, priority: 0,
    startDate: '', endDate: '', notes: '',
  });
  const [boostSubmitting, setBoostSubmitting] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      const m = await adminService.getFeedMetricsV2();
      setMetrics(m);
    } catch {
      toast.error('Failed to load metrics');
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  const fetchBoosts = useCallback(async () => {
    try {
      const b = await adminService.getFeedBoostsV2();
      setBoosts(Array.isArray(b) ? b : []);
    } catch {
      toast.error('Failed to load boosts');
    } finally {
      setBoostsLoading(false);
    }
  }, []);

  const fetchConfig = useCallback(async () => {
    try {
      const c = await adminService.getFeedConfig();
      if (c && typeof c === 'object') setWeights(c);
    } catch {}
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([fetchMetrics(), fetchBoosts(), fetchConfig()]);
  }, [fetchMetrics, fetchBoosts, fetchConfig]);

  useRegisterRefresh(refresh);

  useEffect(() => {
    fetchConfig();
    fetchMetrics();
    fetchBoosts();
  }, [fetchConfig, fetchMetrics, fetchBoosts]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    const socket = io(`${API_URL}/feed-admin`, {
      auth: { token },
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('connect', () => setWsConnected(true));
    socket.on('disconnect', () => setWsConnected(false));

    socket.on('boost_created', (boost: FeedBoost) => {
      setBoosts((prev) => [boost, ...prev]);
      toast.success(`Boost created: ${boost.target}`);
    });

    socket.on('boost_updated', (boost: FeedBoost) => {
      setBoosts((prev) => prev.map((b) => b.id === boost.id ? boost : b));
    });

    socket.on('boost_deleted', ({ id }: { id: string }) => {
      setBoosts((prev) => prev.filter((b) => b.id !== id));
    });

    socket.on('config_updated', (data: any) => {
      if (data?.weights) setWeights(data.weights);
      toast.success(`Config updated to v${data.version}`);
    });

    socket.on('metrics_updated', (m: Metrics) => setMetrics(m));

    return () => { socket.disconnect(); };
  }, []);

  useEffect(() => {
    if (activeTab === 'versions' && versions.length === 0) {
      setVersionsLoading(true);
      adminService.getFeedConfigVersions()
        .then(setVersions)
        .catch(() => toast.error('Failed to load versions'))
        .finally(() => setVersionsLoading(false));
    }
    if (activeTab === 'audit' && auditLogs.length === 0) {
      setAuditLoading(true);
      adminService.getFeedAuditLogs()
        .then(setAuditLogs)
        .catch(() => toast.error('Failed to load audit logs'))
        .finally(() => setAuditLoading(false));
    }
  }, [activeTab]);

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      await adminService.updateFeedConfig(weights, configNotes || undefined);
      toast.success('Weights saved');
      setConfigNotes('');
    } catch {
      toast.error('Failed to save weights');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleSimulate = async () => {
    setSimLoading(true);
    try {
      const res = await adminService.simulateFeed({
        category: simCategory || undefined,
        city: simCity || undefined,
        limit: 10,
      });
      setSimResults(res.reels ?? []);
    } catch {
      toast.error('Simulation failed');
    } finally {
      setSimLoading(false);
    }
  };

  const handleBoostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boostForm.target) return;
    setBoostSubmitting(true);
    try {
      await adminService.createFeedBoostV2({
        type: boostForm.type,
        target: boostForm.target,
        intensity: boostForm.intensity,
        priority: boostForm.priority,
        startDate: boostForm.startDate || undefined,
        endDate: boostForm.endDate || undefined,
        notes: boostForm.notes || undefined,
      });
      setBoostForm({ type: 'hashtag', target: '', intensity: 50, priority: 0, startDate: '', endDate: '', notes: '' });
    } catch {
      toast.error('Failed to create boost');
    } finally {
      setBoostSubmitting(false);
    }
  };

  const handleBoostStatusToggle = async (boost: FeedBoost) => {
    const newStatus = boost.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      await adminService.updateFeedBoost(boost.id, { status: newStatus });
    } catch {
      toast.error('Failed to update boost');
    }
  };

  const handleBoostDelete = async (id: string) => {
    try {
      await adminService.deleteFeedBoostV2(id);
    } catch {
      toast.error('Failed to delete boost');
    }
  };

  const handleRollback = async (versionId: string, version: number) => {
    try {
      await adminService.rollbackFeedConfig(versionId);
      toast.success(`Rolled back to v${version}`);
      const c = await adminService.getFeedConfig();
      if (c) setWeights(c);
    } catch {
      toast.error('Rollback failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-foreground tracking-tight">Feed Control Center</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Recommendation engine, boost injector, and feed intelligence
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            'flex items-center gap-1.5 px-2.5 h-7 rounded-full text-[11px] font-semibold border',
            wsConnected
              ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
              : 'bg-muted border-border text-muted-foreground'
          )}>
            <span className={cn('w-1.5 h-1.5 rounded-full', wsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground')} />
            {wsConnected ? 'Live' : 'Offline'}
          </div>
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {SUB_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'h-7 px-3 rounded-md text-[12px] font-medium transition-all whitespace-nowrap',
                  activeTab === tab.id ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === 'recommender' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-xl p-5 lg:col-span-2 space-y-5">
            <h2 className="text-[15px] font-semibold text-foreground">Recommendation Weights</h2>
            <div className="space-y-5">
              {WEIGHT_KEYS.map(({ key, label, icon: Icon, desc }) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-medium text-foreground flex items-center gap-2">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      {label}
                    </span>
                    <span className="text-[13px] font-semibold text-primary font-mono">{weights[key] ?? 0}%</span>
                  </div>
                  <input
                    type="range" min="0" max="100"
                    value={weights[key] ?? 0}
                    onChange={(e) => setWeights((prev) => ({ ...prev, [key]: parseInt(e.target.value) }))}
                    className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                  />
                  <span className="text-[11px] text-muted-foreground">{desc}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 pt-1">
              <input
                type="text"
                placeholder="Notes for this change (optional)"
                value={configNotes}
                onChange={(e) => setConfigNotes(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
              />
              <button
                onClick={handleSaveConfig}
                disabled={savingConfig}
                className="h-9 w-full rounded-lg bg-primary text-white text-[13px] font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {savingConfig ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                {savingConfig ? 'Saving...' : 'Save Weights to Backend'}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-5 space-y-3">
              <h2 className="text-[15px] font-semibold text-foreground flex items-center gap-2">
                <Activity className="w-4 h-4 text-muted-foreground" />
                Live Metrics
              </h2>
              {metricsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => <SkeletonBlock key={i} h="h-6" />)}
                </div>
              ) : metrics ? (
                <div className="space-y-2">
                  {[
                    { label: 'Config Version', value: `v${metrics.configVersion}` },
                    { label: 'Total Reels', value: metrics.totalReels.toLocaleString() },
                    { label: 'Total Views', value: metrics.totalViews.toLocaleString() },
                    { label: 'Valid Views', value: metrics.totalValidViews.toLocaleString() },
                    { label: 'Active Boosts', value: metrics.activeBoosts },
                    { label: 'Pending Reports', value: metrics.pendingReports },
                  ].map((m) => (
                    <div key={m.label} className="flex justify-between items-center">
                      <span className="text-[12px] text-muted-foreground">{m.label}</span>
                      <span className="text-[12px] font-semibold text-foreground font-mono">{m.value}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {metrics?.topCategories && metrics.topCategories.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-5 space-y-3">
                <h2 className="text-[13px] font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  Top Categories
                </h2>
                {metrics.topCategories.map((c) => (
                  <div key={c.category} className="flex justify-between items-center">
                    <span className="text-[12px] text-muted-foreground capitalize">{c.category}</span>
                    <span className="text-[12px] font-semibold text-foreground font-mono">{c.views.toLocaleString()} views</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'simulator' && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 flex flex-wrap gap-3 items-end">
            <div className="space-y-1.5">
              <p className="text-[12px] text-muted-foreground">Category</p>
              <select
                value={simCategory}
                onChange={(e) => setSimCategory(e.target.value)}
                className="h-9 px-3 rounded-lg border border-border bg-background text-[13px] text-foreground outline-none focus:border-primary"
              >
                {['comedy', 'dance', 'food', 'music', 'tech', 'drama', 'fashion', 'vlog'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <p className="text-[12px] text-muted-foreground">City (optional)</p>
              <input
                type="text"
                value={simCity}
                onChange={(e) => setSimCity(e.target.value)}
                placeholder="e.g. Mumbai"
                className="h-9 px-3 rounded-lg border border-border bg-background text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
              />
            </div>
            <button
              onClick={handleSimulate}
              disabled={simLoading}
              className="h-9 px-5 rounded-lg bg-primary text-white text-[13px] font-semibold hover:bg-primary/90 disabled:opacity-60 flex items-center gap-2"
            >
              {simLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
              Run Simulation
            </button>
          </div>

          {simLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonBlock key={i} h="h-24" />)}
            </div>
          ) : simResults.length === 0 ? (
            <div className="bg-card border border-border rounded-xl flex flex-col items-center justify-center py-16 gap-3">
              <BarChart2 className="w-8 h-8 text-muted-foreground/40" />
              <p className="text-[13px] font-semibold text-foreground">Run a simulation to see ranked results</p>
            </div>
          ) : (
            <div className="space-y-3">
              {simResults.map((reel, idx) => (
                <div key={reel.id} className="bg-card border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedReel(expandedReel === reel.id ? null : reel.id)}
                    className="w-full p-4 flex items-center gap-4 text-left hover:bg-muted/30 transition-colors"
                  >
                    <span className="text-[13px] font-bold text-muted-foreground w-6 text-center">#{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground truncate">{reel.title}</p>
                      <p className="text-[11px] text-muted-foreground">@{reel.creatorUsername} · {reel.category}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-[13px] font-bold text-primary font-mono">{reel.scores.final}</p>
                        <p className="text-[10px] text-muted-foreground">final score</p>
                      </div>
                      <span className={cn(
                        'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                        reel.scores.final > 0.5
                          ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                          : reel.scores.final > 0.2
                          ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
                          : 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                      )}>
                        {reel.scores.final > 0.5 ? 'High' : reel.scores.final > 0.2 ? 'Med' : 'Low'}
                      </span>
                      {expandedReel === reel.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </button>
                  {expandedReel === reel.id && (
                    <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                        {[
                          { label: 'Watch Time', value: reel.scores.watchTime },
                          { label: 'Engagement', value: reel.scores.engagement },
                          { label: 'Share', value: reel.scores.share },
                          { label: 'Freshness', value: reel.scores.freshness },
                          { label: 'Creator', value: reel.scores.creator },
                          { label: 'Penalty', value: -reel.scores.reportPenalty },
                        ].map((s) => (
                          <div key={s.label} className="bg-muted/40 rounded-lg p-2.5 text-center">
                            <p className={cn('text-[13px] font-bold font-mono', s.value < 0 ? 'text-red-500' : 'text-foreground')}>
                              {s.value >= 0 ? s.value : s.value}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                          </div>
                        ))}
                      </div>
                      <p className="text-[12px] text-muted-foreground">{reel.reason}</p>
                      {reel.penaltyReason && (
                        <p className="text-[12px] text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {reel.penaltyReason}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'boosts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="text-[15px] font-semibold text-foreground">Create Boost</h2>
            <form onSubmit={handleBoostSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <p className="text-[12px] text-muted-foreground">Type</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {['hashtag', 'category', 'creator'].map((t) => (
                    <button
                      key={t} type="button"
                      onClick={() => setBoostForm((p) => ({ ...p, type: t }))}
                      className={cn(
                        'h-8 rounded-lg border text-[12px] font-medium transition-colors capitalize',
                        boostForm.type === t
                          ? 'bg-primary text-white border-transparent'
                          : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-[12px] text-muted-foreground">Target</p>
                <input
                  required type="text"
                  placeholder={boostForm.type === 'hashtag' ? '#DiwaliStar' : boostForm.type === 'category' ? 'comedy' : '@username'}
                  value={boostForm.target}
                  onChange={(e) => setBoostForm((p) => ({ ...p, target: e.target.value }))}
                  className="h-9 w-full px-3 rounded-lg border border-border bg-background text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <p className="text-[12px] text-muted-foreground">Intensity</p>
                  <span className="text-[12px] font-semibold text-primary font-mono">{boostForm.intensity}%</span>
                </div>
                <input
                  type="range" min="1" max="100"
                  value={boostForm.intensity}
                  onChange={(e) => setBoostForm((p) => ({ ...p, intensity: parseInt(e.target.value) }))}
                  className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <p className="text-[12px] text-muted-foreground">Priority</p>
                  <span className="text-[12px] font-semibold text-foreground font-mono">{boostForm.priority}</span>
                </div>
                <input
                  type="range" min="0" max="10"
                  value={boostForm.priority}
                  onChange={(e) => setBoostForm((p) => ({ ...p, priority: parseInt(e.target.value) }))}
                  className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <p className="text-[12px] text-muted-foreground">Start Date</p>
                  <input
                    type="datetime-local"
                    value={boostForm.startDate}
                    onChange={(e) => setBoostForm((p) => ({ ...p, startDate: e.target.value }))}
                    className="h-9 w-full px-2 rounded-lg border border-border bg-background text-[12px] text-foreground outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-[12px] text-muted-foreground">End Date</p>
                  <input
                    type="datetime-local"
                    value={boostForm.endDate}
                    onChange={(e) => setBoostForm((p) => ({ ...p, endDate: e.target.value }))}
                    className="h-9 w-full px-2 rounded-lg border border-border bg-background text-[12px] text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-[12px] text-muted-foreground">Notes</p>
                <input
                  type="text"
                  value={boostForm.notes}
                  onChange={(e) => setBoostForm((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Optional"
                  className="h-9 w-full px-3 rounded-lg border border-border bg-background text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
                />
              </div>
              <button
                type="submit" disabled={boostSubmitting}
                className="h-9 w-full rounded-lg bg-primary text-white text-[13px] font-semibold hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {boostSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Fire Boost
              </button>
            </form>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 lg:col-span-2 space-y-4">
            <h2 className="text-[15px] font-semibold text-foreground">Active Boosts</h2>
            {boostsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <SkeletonBlock key={i} h="h-16" />)}
              </div>
            ) : boosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 gap-2 text-center">
                <Zap className="w-8 h-8 text-muted-foreground/40" />
                <p className="text-[13px] font-semibold text-foreground">No boosts yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {boosts.map((boost) => (
                  <div key={boost.id} className="p-4 bg-muted/40 border border-border rounded-xl">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[13px] font-semibold text-foreground">{boost.target}</span>
                          <span className={cn('text-[10px] font-bold uppercase px-1.5 py-0.5 rounded', BOOST_STATUS_STYLES[boost.status])}>
                            {boost.status}
                          </span>
                          <span className="text-[10px] text-muted-foreground capitalize bg-muted px-1.5 py-0.5 rounded">
                            {boost.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-[11px] text-muted-foreground">Intensity: <span className="font-semibold text-foreground">{boost.intensity}%</span></span>
                          <span className="text-[11px] text-muted-foreground">Priority: <span className="font-semibold text-foreground">{boost.priority}</span></span>
                          {boost.endDate && (
                            <span className="text-[11px] text-muted-foreground">
                              Expires: {new Date(boost.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                            </span>
                          )}
                        </div>
                        {boost.notes && <p className="text-[11px] text-muted-foreground mt-0.5 italic">{boost.notes}</p>}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => handleBoostStatusToggle(boost)}
                          className="w-7 h-7 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          {boost.status === 'ACTIVE' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleBoostDelete(boost.id)}
                          className="w-7 h-7 rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'versions' && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h2 className="text-[15px] font-semibold text-foreground flex items-center gap-2">
            <History className="w-4 h-4 text-muted-foreground" />
            Config Version History
          </h2>
          {versionsLoading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <SkeletonBlock key={i} h="h-16" />)}</div>
          ) : versions.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground text-[13px]">No versions saved yet.</div>
          ) : (
            <div className="space-y-3">
              {versions.map((v, idx) => (
                <div key={v.id} className="p-4 bg-muted/40 border border-border rounded-xl flex items-start justify-between gap-4">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-foreground">v{v.version}</span>
                      {idx === 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">Current</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {Object.entries(v.weights).map(([k, val]) => (
                        <span key={k} className="text-[11px] text-muted-foreground">
                          {k.replace('Weight', '')}: <span className="font-semibold text-foreground">{val}%</span>
                        </span>
                      ))}
                    </div>
                    {v.notes && <p className="text-[11px] text-muted-foreground italic">{v.notes}</p>}
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(v.createdAt).toLocaleString('en-IN')}
                    </p>
                  </div>
                  {idx !== 0 && (
                    <button
                      onClick={() => handleRollback(v.id, v.version)}
                      className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Rollback
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h2 className="text-[15px] font-semibold text-foreground">Audit Logs</h2>
          {auditLoading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <SkeletonBlock key={i} h="h-14" />)}</div>
          ) : auditLogs.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground text-[13px]">No audit logs yet.</div>
          ) : (
            <div className="divide-y divide-border">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[12px] font-semibold text-foreground">{log.action.replace(/_/g, ' ')}</span>
                      <span className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{log.entityType}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {new Date(log.timestamp).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};