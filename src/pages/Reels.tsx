import React, { useState, useEffect, useCallback } from 'react';
import { usePlatformStore, Reel } from '../store/usePlatformStore';
import { useRegisterRefresh } from '../hooks/useRegisterRefresh';
import {
  Search,
  Play,
  Trash2,
  EyeOff,
  Flame,
  MessageSquareOff,
  MessageSquare,
  Clock,
  MapPin,
  X,
  Volume2,
  Sliders,
  Music,
  AlertTriangle,
  ShieldCheck,
  Video,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export const ReelsPage: React.FC = () => {
  const {
    reels,
    removeReel,
    hideReel,
    forceTrendReel,
    restrictAgeReel,
    disableCommentsReel,
  } = usePlatformStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'comedy' | 'dance' | 'food' | 'music' | 'drama' | 'vlog'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'trending' | 'reported' | 'hidden' | 'copyright'>('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const [previewVideo, setPreviewVideo] = useState<Reel | null>(null);
  const [loading, setLoading] = useState(true);

 const { fetchAllData } = usePlatformStore();

  const refresh = useCallback(async () => {
    await fetchAllData();
  }, [fetchAllData]);

  useRegisterRefresh(refresh);

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    const handleCityChange = (e: any) => setCityFilter(e.detail);
    window.addEventListener('popli_city_changed', handleCityChange);
    if ((window as any).__popli_active_city_filter) {
      setCityFilter((window as any).__popli_active_city_filter);
    }
    return () => window.removeEventListener('popli_city_changed', handleCityChange);
  }, []);

  const handleRemove = (reel: Reel) => {
    removeReel(reel.id);
    toast.error(`Reel removed from feed`);
    if (selectedReel?.id === reel.id) setSelectedReel(null);
  };

  const handleHide = (reel: Reel) => {
    hideReel(reel.id);
    toast.success(`Reel ${!reel.isHidden ? 'hidden' : 'restored'}`);
    if (selectedReel?.id === reel.id)
      setSelectedReel((prev) => prev ? { ...prev, isHidden: !prev.isHidden } : null);
  };

  const handleForceTrend = (reel: Reel) => {
    forceTrendReel(reel.id);
    toast.success(`Reel ${!reel.isTrending ? 'added to trending' : 'removed from trending'}`);
    if (selectedReel?.id === reel.id)
      setSelectedReel((prev) => prev ? { ...prev, isTrending: !prev.isTrending } : null);
  };

  const handleAgeRestrict = (reel: Reel) => {
    restrictAgeReel(reel.id);
    toast.success(`Age restriction ${!reel.ageRestricted ? 'applied' : 'lifted'}`);
    if (selectedReel?.id === reel.id)
      setSelectedReel((prev) => prev ? { ...prev, ageRestricted: !prev.ageRestricted } : null);
  };

  const handleDisableComments = (reel: Reel) => {
    disableCommentsReel(reel.id);
    toast.success(`Comments ${!reel.commentsDisabled ? 'disabled' : 'enabled'}`);
    if (selectedReel?.id === reel.id)
      setSelectedReel((prev) => prev ? { ...prev, commentsDisabled: !prev.commentsDisabled } : null);
  };

  const filteredReels = reels.filter((reel) => {
    const matchesSearch =
      reel.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reel.creatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reel.creatorUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reel.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGlobalCity =
      cityFilter === 'all' || reel.city.toLowerCase() === cityFilter.toLowerCase();
    const matchesCategory =
      categoryFilter === 'all' || (reel.category || '').toLowerCase() === categoryFilter.toLowerCase();

    let matchesStatus = true;
    if (statusFilter === 'trending') matchesStatus = reel.isTrending;
    else if (statusFilter === 'reported') matchesStatus = reel.reported;
    else if (statusFilter === 'hidden') matchesStatus = reel.isHidden;
    else if (statusFilter === 'copyright') matchesStatus = reel.copyrightFlag;

    return matchesSearch && matchesGlobalCity && matchesCategory && matchesStatus;
  });

  const CATEGORY_TABS = [
    { id: 'all' as const, label: 'All' },
    { id: 'comedy' as const, label: 'Comedy' },
    { id: 'dance' as const, label: 'Dance' },
    { id: 'food' as const, label: 'Food' },
    { id: 'music' as const, label: 'Music' },
    { id: 'vlog' as const, label: 'Vlogs' },
  ];

  return (
    <div className="space-y-6 relative">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-foreground tracking-tight">Reel Management</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">{reels.length} reels in database</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by caption, creator, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 w-full pl-9 pr-4 rounded-lg border border-border bg-background text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border bg-background text-[13px] text-foreground outline-none focus:border-primary transition-colors cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="trending">Trending</option>
            <option value="reported">Reported</option>
            <option value="hidden">Hidden</option>
            <option value="copyright">Copyright Flagged</option>
          </select>
        </div>

        <div className="flex items-center gap-1 bg-muted rounded-lg p-1 flex-wrap">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={cn(
                'h-7 px-3 rounded-md text-[12px] font-medium transition-all',
                categoryFilter === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredReels.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Reel</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Creator</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Views</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Flags</th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReels.slice(0, 15).map((reel) => (
                  <tr
                    key={reel.id}
                    onClick={() => setSelectedReel(reel)}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); setPreviewVideo(reel); }}
                          className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-primary hover:text-white hover:border-transparent transition-all shrink-0"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <div className="max-w-[200px]">
                          <span className="text-[13px] font-medium text-foreground block truncate">{reel.title}</span>
                          <span className="text-[11px] text-muted-foreground font-mono">
                            {reel.duration > 0 ? `${reel.duration}s` : 'Duration unknown'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="text-[12px] text-muted-foreground font-mono">@{reel.creatorUsername}</span>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="text-[12px] text-foreground font-mono">{reel.views.toLocaleString()}</span>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="text-[12px] text-foreground capitalize">{reel.category}</span>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex gap-1.5 flex-wrap">
                        {reel.reported && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400">
                            <AlertTriangle className="w-3 h-3" /> Reported
                          </span>
                        )}
                        {reel.copyrightFlag && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400">
                            <Music className="w-3 h-3" /> Copyright
                          </span>
                        )}
                        {reel.isHidden && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground">
                            <EyeOff className="w-3 h-3" /> Hidden
                          </span>
                        )}
                        {!reel.reported && !reel.copyrightFlag && !reel.isHidden && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                            <ShieldCheck className="w-3 h-3" /> Clean
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedReel(reel); }}
                        className="h-7 px-3 rounded-lg border border-border bg-card text-[12px] font-medium text-foreground hover:bg-muted hover:border-primary/40 hover:text-primary transition-colors"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredReels.length > 15 && (
              <div className="px-5 py-3 border-t border-border bg-muted/20">
                <p className="text-[12px] text-muted-foreground">
                  Showing 15 of {filteredReels.length} reels — pagination not yet implemented
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-center py-14">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Video className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-[13px] font-semibold text-foreground">No reels found</p>
            <p className="text-[12px] text-muted-foreground">Try adjusting your search or filter</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {previewVideo && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewVideo(null)}
              className="fixed inset-0 z-50 bg-black"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-card border border-border rounded-xl p-5 w-full max-w-sm flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[13px] font-semibold text-foreground">Preview</span>
                </div>
                <button
                  onClick={() => setPreviewVideo(null)}
                  className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="aspect-[9/16] bg-muted border border-border rounded-lg overflow-hidden relative">
                <video
                  src={previewVideo.videoUrl}
                  autoPlay
                  loop
                  muted
                  controls
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-black/60 px-2 py-1 rounded-md flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-white" />
                  <span className="text-[11px] text-white">{previewVideo.city}</span>
                </div>
              </div>

              <div className="mt-3 space-y-1">
                <span className="text-[13px] font-semibold text-foreground block leading-snug">{previewVideo.title}</span>
                <span className="text-[12px] text-muted-foreground font-mono">@{previewVideo.creatorUsername}</span>
                <div className="flex items-center gap-1 pt-1">
                  <span className="text-[12px] text-muted-foreground">Views:</span>
                  <span className="text-[12px] text-foreground font-mono font-semibold">{previewVideo.views.toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedReel && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReel(null)}
              className="fixed inset-0 z-40 bg-black/20"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed top-0 right-0 w-full sm:w-[480px] h-full bg-card border-l border-border z-50 p-5 overflow-y-auto flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[13px] font-semibold text-foreground">Content Controls</span>
                </div>
                <button
                  onClick={() => setSelectedReel(null)}
                  className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 bg-muted/40 border border-border rounded-xl space-y-2 mb-5">
                <span className="text-[15px] font-semibold text-foreground block leading-snug">{selectedReel.title}</span>
                <span className="text-[12px] text-muted-foreground font-mono">@{selectedReel.creatorUsername}</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2 py-0.5 rounded-md bg-muted border border-border text-[11px] text-muted-foreground capitalize">
                    {selectedReel.category}
                  </span>
                  {selectedReel.musicName && (
                    <span className="px-2 py-0.5 rounded-md bg-muted border border-border text-[11px] text-muted-foreground flex items-center gap-1">
                      <Music className="w-3 h-3" /> {selectedReel.musicName}
                    </span>
                  )}
                  {selectedReel.location && (
                    <span className="px-2 py-0.5 rounded-md bg-muted border border-border text-[11px] text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {selectedReel.location}
                    </span>
                  )}
                </div>
                {selectedReel.taggedUsers && selectedReel.taggedUsers.length > 0 && (
                  <div className="pt-2 border-t border-border">
                    <span className="text-[11px] text-muted-foreground block mb-1">Tagged users</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedReel.taggedUsers.map((u, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-muted border border-border text-[11px] text-foreground font-mono">
                          @{u.username}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-4 gap-2 mb-5">
                {[
                  { label: 'Views', value: selectedReel.views },
                  { label: 'Likes', value: selectedReel.likes },
                  { label: 'Comments', value: selectedReel.commentsCount },
                  { label: 'Shares', value: selectedReel.shares },
                ].map((stat) => (
                  <div key={stat.label} className="p-3 bg-muted/40 border border-border rounded-xl text-center">
                    <span className="text-[11px] text-muted-foreground block">{stat.label}</span>
                    <span className="text-[13px] font-semibold text-foreground mt-1 block font-mono">
                      {stat.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-muted/40 border border-border rounded-xl p-4 mb-5 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <Flame className="w-3.5 h-3.5 text-muted-foreground" />
                  <h4 className="text-[13px] font-semibold text-foreground">Earnings</h4>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-card border border-border rounded-xl">
                    <span className="text-[11px] text-muted-foreground block">Pending Views</span>
                    <span className="text-[13px] font-semibold text-foreground font-mono mt-0.5 block">
                      {selectedReel.pendingEarningsViews?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="p-3 bg-card border border-border rounded-xl">
                    <span className="text-[11px] text-muted-foreground block">Est. Payout</span>
                    <span className="text-[13px] font-semibold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
                      Rs.{((selectedReel.pendingEarningsViews || 0) * 0.005).toFixed(2)}
                    </span>
                  </div>
                  <div className="col-span-2 p-3 bg-card border border-border rounded-xl flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">Challenge Approval</span>
                    <span className={cn(
                      'text-[11px] font-medium px-2 py-0.5 rounded-md',
                      selectedReel.challengeApprovalStatus === 'APPROVED'
                        ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                        : selectedReel.challengeApprovalStatus === 'REJECTED'
                        ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                        : 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
                    )}>
                      {selectedReel.challengeApprovalStatus || 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-[13px] font-semibold text-foreground">Moderation Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleForceTrend(selectedReel)}
                    className={cn(
                      'h-9 px-3 rounded-lg border text-[12px] font-medium flex items-center gap-2 transition-colors',
                      selectedReel.isTrending
                        ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20'
                        : 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/20'
                    )}
                  >
                    <Flame className="w-3.5 h-3.5 shrink-0" />
                    {selectedReel.isTrending ? 'Remove Trend' : 'Force Trend'}
                  </button>

                  <button
                    onClick={() => handleHide(selectedReel)}
                    className={cn(
                      'h-9 px-3 rounded-lg border text-[12px] font-medium flex items-center gap-2 transition-colors',
                      selectedReel.isHidden
                        ? 'bg-primary text-white border-transparent hover:bg-primary/90'
                        : 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20 hover:bg-amber-200 dark:hover:bg-amber-500/20'
                    )}
                  >
                    <EyeOff className="w-3.5 h-3.5 shrink-0" />
                    {selectedReel.isHidden ? 'Make Visible' : 'Hide'}
                  </button>

                  <button
                    onClick={() => handleDisableComments(selectedReel)}
                    className={cn(
                      'h-9 px-3 rounded-lg border text-[12px] font-medium flex items-center gap-2 transition-colors',
                      selectedReel.commentsDisabled
                        ? 'bg-primary text-white border-transparent hover:bg-primary/90'
                        : 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20 hover:bg-amber-200 dark:hover:bg-amber-500/20'
                    )}
                  >
                    {selectedReel.commentsDisabled
                      ? <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                      : <MessageSquareOff className="w-3.5 h-3.5 shrink-0" />}
                    {selectedReel.commentsDisabled ? 'Enable Comments' : 'Disable Comments'}
                  </button>

                  <button
                    onClick={() => handleAgeRestrict(selectedReel)}
                    className={cn(
                      'h-9 px-3 rounded-lg border text-[12px] font-medium flex items-center gap-2 transition-colors',
                      selectedReel.ageRestricted
                        ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20'
                        : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
                    )}
                  >
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    {selectedReel.ageRestricted ? 'Lift 18+ Restriction' : 'Restrict 18+'}
                  </button>
                </div>

                <button
                  onClick={() => handleRemove(selectedReel)}
                  className="w-full h-9 rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[12px] font-medium hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Reel Permanently
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};