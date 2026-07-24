import React, { useState, useEffect, useCallback } from 'react';
import { usePlatformStore } from '../store/usePlatformStore';
import { useRegisterRefresh } from '../hooks/useRegisterRefresh';
import {
  Sliders,
  MapPin,
  Smile,
  Compass,
  Zap,
  ShieldCheck,
  Sparkles,
  Clock,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';

export const FeedControlPage: React.FC = () => {
const {
    recommendationWeights,
    setWeights,
    saveWeights,
    reels,
    feedBoosts,
    feedMetrics,
    fetchFeedBoosts,
    createFeedBoost,
    deleteFeedBoost,
    fetchFeedMetrics,
  } = usePlatformStore();

  const [activeSubTab, setActiveSubTab] = useState<'recommender' | 'simulation' | 'boost'>('recommender');
  const [boostType, setBoostType] = useState<'hashtag' | 'category' | 'creator'>('hashtag');
  const [boostTarget, setBoostTarget] = useState('');
  const [boostIntensity, setBoostIntensity] = useState(50);
  const [simulatedGenre, setSimulatedGenre] = useState<'comedy' | 'dance' | 'food' | 'music'>('comedy');

const refresh = useCallback(async () => {
    await Promise.all([fetchFeedBoosts(), fetchFeedMetrics()]);
  }, [fetchFeedBoosts, fetchFeedMetrics]);

  useRegisterRefresh(refresh);

  useEffect(() => {
    fetchFeedBoosts();
    fetchFeedMetrics();
  }, [fetchFeedBoosts, fetchFeedMetrics]);

  const handleWeightChange = (key: keyof typeof recommendationWeights, value: number) => {
    setWeights({ [key]: value });
  };

  const handleApplyWeights = async () => {
    const toastId = toast.loading('Saving weights...');
    try {
      await saveWeights();
      toast.success('Recommendation weights saved successfully', { id: toastId });
    } catch {
      toast.error('Failed to save weights', { id: toastId });
    }
  };

const handleTriggerBoost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boostTarget) return;
    try {
      await createFeedBoost({ type: boostType, target: boostTarget, intensity: boostIntensity });
      toast.success(`Boost created for ${boostTarget}`);
      setBoostTarget('');
    } catch {
      toast.error('Failed to create boost');
    }
  };

  const handleDeleteBoost = async (boostId: string) => {
    try {
      await deleteFeedBoost(boostId);
      toast.success('Boost removed');
    } catch {
      toast.error('Failed to remove boost');
    }
  };

  const simulatedFeed = reels
    .filter((r) => r.category === simulatedGenre)
    .slice(0, 4);

  const SUB_TABS = [
    { id: 'recommender' as const, label: 'Recommender' },
    { id: 'simulation' as const, label: 'Feed Simulator' },
    { id: 'boost' as const, label: 'Boost Injector' },
  ];

  const SLIDERS = [
    { key: 'watchTimeWeight', label: 'Watch Completion', desc: 'Prioritizes high watch-time reels', icon: Clock },
    { key: 'shareWeight', label: 'Share Acceleration', desc: 'Boosts peer-to-peer sharing loops', icon: Compass },
    { key: 'nearbyWeight', label: 'Hyperlocal Proximity', desc: 'Weights distance from creator node', icon: MapPin },
    { key: 'commentWeight', label: 'Engagement Score', desc: 'Filters for conversation density', icon: Sliders },
    { key: 'moodWeight', label: 'Mood Resonance', desc: 'Evokes mood triggers in feed pipeline', icon: Smile },
  ];

  return (
    <div className="space-y-6 relative">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-foreground tracking-tight">Feed Control Center</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Manage recommendation weights and content boosting</p>
        </div>

        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {SUB_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={cn(
                'h-7 px-3 rounded-md text-[12px] font-medium transition-all whitespace-nowrap',
                activeSubTab === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeSubTab === 'recommender' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-xl p-5 lg:col-span-2 space-y-6">
            <h2 className="text-[15px] font-semibold text-foreground">Recommendation Weights</h2>

            <div className="space-y-5">
              {SLIDERS.map((slider) => {
                const Icon = slider.icon;
                const value = recommendationWeights[slider.key as keyof typeof recommendationWeights];
                return (
                  <div key={slider.key} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] font-medium text-foreground flex items-center gap-2">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        {slider.label}
                      </span>
                      <span className="text-[13px] font-semibold text-primary font-mono">{value}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={value}
                      onChange={(e) =>
                        handleWeightChange(
                          slider.key as keyof typeof recommendationWeights,
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                    />
                    <span className="text-[11px] text-muted-foreground">{slider.desc}</span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleApplyWeights}
              className="h-9 px-4 rounded-lg bg-primary text-white text-[13px] font-semibold hover:bg-primary/90 transition-colors w-full"
            >
              Save Weights to Backend
            </button>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
            <h2 className="text-[15px] font-semibold text-foreground">System Status</h2>

  <div className="flex items-center gap-2 p-3 bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-[12px] font-medium text-emerald-700 dark:text-emerald-400">
                Algorithm shield active
              </span>
            </div>

            {feedMetrics ? (
              <div className="space-y-2">
                <p className="text-[12px] font-semibold text-foreground">Live Metrics</p>
                <div className="p-3 bg-muted/40 border border-border rounded-xl space-y-2">
                  {[
                    { label: 'Total Reels', value: feedMetrics.totalReels.toLocaleString() },
                    { label: 'Total Views', value: feedMetrics.totalViews.toLocaleString() },
                    { label: 'Valid Views', value: feedMetrics.totalValidViews.toLocaleString() },
                    { label: 'Pending Earnings Views', value: feedMetrics.pendingEarningsViews.toLocaleString() },
                    { label: 'Active Users', value: feedMetrics.activeUsers.toLocaleString() },
                    { label: 'Pending Reports', value: feedMetrics.pendingReports.toLocaleString() },
                  ].map((metric) => (
                    <div key={metric.label} className="flex justify-between items-center">
                      <span className="text-[12px] text-muted-foreground">{metric.label}</span>
                      <span className="text-[12px] font-semibold text-foreground font-mono">{metric.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-muted/40 border border-border rounded-xl">
                <p className="text-[12px] text-muted-foreground">Loading metrics...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'simulation' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="text-[15px] font-semibold text-foreground">Simulate Feed Pipeline</h2>

            <div className="space-y-2">
              <p className="text-[12px] text-muted-foreground">Select genre to preview</p>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { id: 'comedy' as const, label: 'Comedy' },
                    { id: 'dance' as const, label: 'Dance' },
                    { id: 'food' as const, label: 'Food' },
                    { id: 'music' as const, label: 'Music' },
                  ] as const
                ).map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => setSimulatedGenre(genre.id)}
                    className={cn(
                      'h-9 px-3 rounded-lg border text-[12px] font-medium transition-colors',
                      simulatedGenre === genre.id
                        ? 'bg-primary text-white border-transparent'
                        : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                  >
                    {genre.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-muted/40 border border-border rounded-xl space-y-1.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[12px] font-semibold text-foreground">How simulation works</span>
              </div>
              <p className="text-[12px] text-muted-foreground">
                Filters live reels from the database by the selected genre. Reflects actual content currently in the platform.
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 lg:col-span-2 space-y-4">
            <h2 className="text-[15px] font-semibold text-foreground">
              Feed Preview
              <span className="ml-2 text-[12px] text-muted-foreground font-normal capitalize">— {simulatedGenre}</span>
            </h2>

            {simulatedFeed.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {simulatedFeed.map((reel) => (
                  <div
                    key={reel.id}
                    className="p-4 bg-muted/40 border border-border rounded-xl flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <span className="text-[13px] font-medium text-foreground block truncate">{reel.title}</span>
                        <span className="text-[12px] text-muted-foreground font-mono truncate block">
                          @{reel.creatorUsername}
                        </span>
                      </div>
                      <span className="text-[11px] text-primary bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 px-2 py-0.5 rounded-md capitalize shrink-0">
                        {reel.category}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-border pt-2">
                      <span className="text-[11px] text-muted-foreground">Views</span>
                      <span className="text-[12px] font-semibold text-foreground font-mono">
                        {reel.views.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 text-center py-14">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Sliders className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-[13px] font-semibold text-foreground">No reels in this category</p>
                <p className="text-[12px] text-muted-foreground">Try a different genre</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'boost' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="text-[15px] font-semibold text-foreground">Boost Injector</h2>

            <div className="p-3 bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[12px] text-amber-700 dark:text-amber-400">
                No boost API endpoint exists yet. Submitting this form does not persist to the backend.
              </p>
            </div>

            <form onSubmit={handleTriggerBoost} className="space-y-4">
              <div className="space-y-2">
                <p className="text-[12px] text-muted-foreground">Boost target type</p>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'hashtag' as const, label: 'Hashtag' },
                      { id: 'category' as const, label: 'Genre' },
                      { id: 'creator' as const, label: 'Creator' },
                    ] as const
                  ).map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setBoostType(type.id)}
                      className={cn(
                        'h-8 px-2 rounded-lg border text-[12px] font-medium transition-colors',
                        boostType === type.id
                          ? 'bg-primary text-white border-transparent'
                          : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                      )}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[12px] text-muted-foreground">Target</p>
                <input
                  type="text"
                  required
                  placeholder={
                    boostType === 'hashtag'
                      ? '#DiwaliStar'
                      : boostType === 'category'
                      ? 'comedy'
                      : '@username'
                  }
                  value={boostTarget}
                  onChange={(e) => setBoostTarget(e.target.value)}
                  className="h-9 w-full pl-3 pr-4 rounded-lg border border-border bg-background text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-[12px] text-muted-foreground">Intensity</p>
                  <span className="text-[12px] font-semibold text-primary font-mono">{boostIntensity}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={boostIntensity}
                  onChange={(e) => setBoostIntensity(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                />
              </div>

              <button
                type="submit"
                className="h-9 px-4 rounded-lg bg-primary text-white text-[13px] font-semibold hover:bg-primary/90 transition-colors w-full flex items-center justify-center gap-2"
              >
                <Zap className="w-3.5 h-3.5" />
                Fire Boost
              </button>
            </form>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 lg:col-span-2 space-y-4">
            <h2 className="text-[15px] font-semibold text-foreground">Active Boosts</h2>

        {feedBoosts.length > 0 ? (
              <div className="space-y-2">
                {feedBoosts.map((boost) => (
                  <div
                    key={boost.id}
                    className="p-4 bg-muted/40 border border-border rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[13px] font-medium text-foreground block">{boost.target}</span>
                      <span className="text-[11px] text-muted-foreground capitalize">{boost.type} — {boost.intensity}% intensity</span>
                    </div>
                    <button
                      onClick={() => handleDeleteBoost(boost.id)}
                      className="w-7 h-7 rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 text-center py-14">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Zap className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-[13px] font-semibold text-foreground">No active boosts</p>
                <p className="text-[12px] text-muted-foreground">Create a boost using the form on the left</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};