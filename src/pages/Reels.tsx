import React, { useState, useEffect } from 'react';
import { usePlatformStore, Reel } from '../store/usePlatformStore';
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
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export const ReelsPage: React.FC = () => {
  // Zustand Store integrations
  const { 
    reels, 
    removeReel, 
    hideReel, 
    forceTrendReel, 
    restrictAgeReel, 
    disableCommentsReel 
  } = usePlatformStore();

  // Local UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'comedy' | 'dance' | 'food' | 'music' | 'drama' | 'vlog'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'trending' | 'reported' | 'hidden' | 'copyright'>('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const [previewVideo, setPreviewVideo] = useState<Reel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  // Listen to Global Context Multi-City Selector Changes
  useEffect(() => {
    const handleCityChange = (e: any) => {
      setCityFilter(e.detail);
    };
    window.addEventListener('popli_city_changed', handleCityChange);
    if ((window as any).__popli_active_city_filter) {
      setCityFilter((window as any).__popli_active_city_filter);
    }
    return () => window.removeEventListener('popli_city_changed', handleCityChange);
  }, []);

  // Operational Commands wrapper
  const handleRemove = (reel: Reel) => {
    removeReel(reel.id);
    toast.error(`Reel ID [${reel.id}] has been permanently wiped from the feed databases.`, {
      icon: <Trash2 className="w-4 h-4" />
    });
    if (selectedReel?.id === reel.id) setSelectedReel(null);
  };

  const handleHide = (reel: Reel) => {
    hideReel(reel.id);
    const action = !reel.isHidden ? 'HIDDEN' : 'RESTORED';
    toast.success(`Content status: ${action} for Reel [${reel.id}]`);
    if (selectedReel?.id === reel.id) {
      setSelectedReel(prev => prev ? { ...prev, isHidden: !prev.isHidden } : null);
    }
  };

  const handleForceTrend = (reel: Reel) => {
    forceTrendReel(reel.id);
    const action = !reel.isTrending ? 'BOOSTED TO TRENDING' : 'REMOVED FROM TRENDS';
    toast.success(`Content recommendation: ${action} for [${reel.id}]`, {
      icon: <Flame className="w-4 h-4" />
    });
    if (selectedReel?.id === reel.id) {
      setSelectedReel(prev => prev ? { ...prev, isTrending: !prev.isTrending } : null);
    }
  };

  const handleAgeRestrict = (reel: Reel) => {
    restrictAgeReel(reel.id);
    const action = !reel.ageRestricted ? 'ENFORCED' : 'LIFTED';
    toast.success(`Age Restriction (18+): ${action} for Reel [${reel.id}]`);
    if (selectedReel?.id === reel.id) {
      setSelectedReel(prev => prev ? { ...prev, ageRestricted: !prev.ageRestricted } : null);
    }
  };

  const handleDisableComments = (reel: Reel) => {
    disableCommentsReel(reel.id);
    const action = !reel.commentsDisabled ? 'MUTED' : 'RESTORED';
    toast.success(`Comments section: ${action} for Reel [${reel.id}]`);
    if (selectedReel?.id === reel.id) {
      setSelectedReel(prev => prev ? { ...prev, commentsDisabled: !prev.commentsDisabled } : null);
    }
  };

  // Perform Filtering
  const filteredReels = reels.filter(reel => {
    const matchesSearch = 
      reel.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reel.creatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reel.creatorUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reel.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGlobalCity = cityFilter === 'all' || reel.city.toLowerCase() === cityFilter.toLowerCase();
    const matchesCategory = categoryFilter === 'all' || (reel.category || '').toLowerCase() === categoryFilter.toLowerCase();

    let matchesStatus = true;
    if (statusFilter === 'trending') matchesStatus = reel.isTrending;
    else if (statusFilter === 'reported') matchesStatus = reel.reported;
    else if (statusFilter === 'hidden') matchesStatus = reel.isHidden;
    else if (statusFilter === 'copyright') matchesStatus = reel.copyrightFlag;

    return matchesSearch && matchesGlobalCity && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 font-mono relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-4 gap-4">
        <div>
          <h1 className="text-xl font-extrabold uppercase tracking-wider text-foreground">Reel Content Repository</h1>
          <p className="text-muted-foreground text-[10px] uppercase mt-1">Simulated platform contains {reels.length} active shorts</p>
        </div>
      </div>

      {/* Filters Command Center */}
      <div className="bg-card border border-border p-4 rounded-[2px] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search bar */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="SEARCH BY CAPTION, CREATOR @USERNAME, OR CITY METADATA..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 bg-muted border border-border rounded-[2px] pl-10 pr-4 text-xs placeholder-muted-foreground uppercase text-foreground outline-none focus:border-primary transition-colors"
            />
          </div>
          
          {/* Status selector */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="w-full h-10 bg-muted border border-border rounded-[2px] px-3 text-xs text-foreground uppercase outline-none cursor-pointer focus:border-primary"
            >
              <option value="all">ALL FEEDS (NO FILTER)</option>
              <option value="trending">TRENDING INJECTED</option>
              <option value="reported">REPORTED FOR MODERATION</option>
              <option value="hidden">HIDDEN FROM PUBLIC</option>
              <option value="copyright">COPYRIGHT FLAGGED AUDIO</option>
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap bg-muted border border-border p-0.5 rounded-[2px] select-none text-[8px] font-bold">
          {([
            { id: 'all', label: 'ALL GENRES' },
            { id: 'comedy', label: 'COMEDY' },
            { id: 'dance', label: 'DANCE' },
            { id: 'food', label: 'FOOD' },
            { id: 'music', label: 'MUSIC' },
            { id: 'vlog', label: 'VLOGS' }
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={cn(
                "px-3 py-1.5 transition-colors rounded-[1px] uppercase tracking-wider",
                categoryFilter === tab.id 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Data Grid Table */}
      <div className="bg-card border border-border rounded-[2px] overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4 select-none animate-pulse">
            <div className="h-6 bg-muted border border-border w-full" />
            <div className="h-12 bg-muted border border-border w-full" />
            <div className="h-12 bg-muted border border-border w-full" />
          </div>
        ) : filteredReels.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[10px] uppercase font-bold text-muted-foreground">
              <thead>
                <tr className="bg-muted border-b border-border select-none text-muted-foreground">
                  <th className="p-3.5 pl-4">Reel details</th>
                  <th className="p-3.5">Creator username</th>
                  <th className="p-3.5">Views</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Viral Index</th>
                  <th className="p-3.5">Flags</th>
                  <th className="p-3.5 pr-4 text-right">Audit console</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredReels.slice(0, 15).map((reel) => (
                  <tr key={reel.id} onClick={() => setSelectedReel(reel)} className="hover:bg-muted/40 transition-colors cursor-pointer">
                    {/* Caption details */}
                    <td className="p-3 pl-4">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setPreviewVideo(reel); }}
                          className="w-8 h-8 bg-accent border border-border flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground hover:border-transparent transition-all shrink-0 active:scale-90"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <div className="max-w-xs truncate">
                          <span className="text-foreground font-extrabold block truncate">{reel.title}</span>
                          <span className="text-muted-foreground font-normal block mt-0.5 truncate leading-none lowercase tracking-normal">Duration: {reel.duration}s</span>
                        </div>
                      </div>
                    </td>

                    {/* Creator */}
                    <td className="p-3 text-foreground lowercase">
                      <span className="font-normal block text-muted-foreground">@{reel.creatorUsername}</span>
                    </td>

                    {/* Views */}
                    <td className="p-3 text-foreground font-mono">
                      {reel.views.toLocaleString()}
                    </td>

                    {/* Category */}
                    <td className="p-3 text-foreground">
                      <div className="flex items-center gap-1.5 font-normal">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span>{reel.category}</span>
                      </div>
                    </td>

                    {/* Viral score */}
                    <td className="p-3">
                      <div className="flex items-center gap-1 font-mono font-semibold">
                        <span className="text-muted-foreground">N/A</span>
                      </div>
                    </td>

                    {/* Flags */}
                    <td className="p-3">
                      <div className="flex gap-1.5">
                        {reel.reported && (
                          <span className="bg-destructive/10 text-destructive border border-destructive/30 text-[7px] px-1.5 py-0.5 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" /> REPORTED
                          </span>
                        )}
                        {reel.copyrightFlag && (
                          <span className="bg-warning/10 text-warning border border-warning/30 text-[7px] px-1.5 py-0.5 font-bold flex items-center gap-1">
                            <Music className="w-2.5 h-2.5" /> COPYRIGHT
                          </span>
                        )}
                        {reel.isHidden && (
                          <span className="bg-muted text-muted-foreground border border-border text-[7px] px-1.5 py-0.5 font-bold flex items-center gap-1">
                            <EyeOff className="w-2.5 h-2.5" /> HIDDEN
                          </span>
                        )}
                        {!reel.reported && !reel.copyrightFlag && !reel.isHidden && (
                          <span className="bg-success/10 text-success border border-success/30 text-[7px] px-1.5 py-0.5 font-bold flex items-center gap-1">
                            <ShieldCheck className="w-2.5 h-2.5" /> SECURED
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-3 pr-4 text-right">
                      <div className="flex gap-1.5 justify-end">
                        <button
                          onClick={() => setSelectedReel(reel)}
                          className="bg-muted border border-border hover:border-primary hover:text-foreground px-2.5 py-1 rounded-[1px] text-[8px] transition-colors"
                        >
                          OPERATIONS
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground uppercase select-none space-y-2">
            <Search className="w-8 h-8 mx-auto" />
            <p className="font-bold">Zero videos match filters</p>
            <p className="text-[8px] font-normal leading-normal px-6">System intelligence returned no content matching query parameters.</p>
          </div>
        )}
      </div>

      {/* Watch Reel Video Preview Modal */}
      <AnimatePresence>
        {previewVideo && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewVideo(null)}
              className="fixed inset-0 z-50 bg-black"
            />
            {/* Video Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-card border border-border rounded-[2px] p-5 w-full max-w-sm flex flex-col font-mono text-[10px] text-muted-foreground uppercase select-none shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-border pb-3 mb-3">
                <span className="font-extrabold text-primary tracking-widest text-[9px] flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 animate-bounce" /> LIVE FEED SIMULATION PLAYER
                </span>
                <button onClick={() => setPreviewVideo(null)} className="p-1 hover:bg-muted text-muted-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Video frame */}
              <div className="aspect-[9/16] bg-muted border border-border relative overflow-hidden rounded-[1px] flex items-center justify-center">
                <video 
                  src={previewVideo.videoUrl} 
                  autoPlay 
                  loop 
                  muted 
                  controls
                  className="w-full h-full object-cover" 
                />
                
                {/* City location badge */}
                <div className="absolute top-3 left-3 bg-background/75 px-2.5 py-1 text-[8px] border border-border rounded-[1px] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-primary" /> {previewVideo.city}
                </div>
              </div>

              {/* Reel Info */}
              <div className="mt-3.5 space-y-1.5">
                <span className="text-foreground font-extrabold block text-xs leading-snug">{previewVideo.title}</span>
                <span className="text-muted-foreground font-normal block leading-none select-all lowercase">By @{previewVideo.creatorUsername}</span>
                <div className="flex justify-between items-center pt-2 text-[9px] font-bold">
                  <span className="text-muted-foreground">VIEWS: <span className="text-foreground font-mono">{previewVideo.views.toLocaleString()}</span></span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Operations Control Side Drawer */}
      <AnimatePresence>
        {selectedReel && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReel(null)}
              className="fixed inset-0 z-40 bg-black"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
              className="fixed top-0 right-0 w-full sm:w-[480px] h-full bg-card border-l border-border z-50 p-6 overflow-y-auto custom-scrollbar flex flex-col font-mono text-[10px] text-muted-foreground uppercase select-none"
            >
              {/* Drawer Header */}
              <div className="flex justify-between items-center border-b border-border pb-4 mb-4">
                <span className="font-extrabold text-primary uppercase text-xs tracking-widest flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-primary" /> CONTENT CONTROL BOARD
                </span>
                <button onClick={() => setSelectedReel(null)} className="p-1.5 hover:bg-muted text-muted-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Reel Info Card */}
              <div className="p-4 bg-muted border border-border rounded-[2px] space-y-2 mb-6">
                <div className="flex justify-between items-start font-bold">
                  <span className="text-foreground text-xs font-black tracking-tight leading-snug">{selectedReel.title}</span>
                </div>
                <span className="text-muted-foreground block font-normal lowercase tracking-normal leading-none">By @{selectedReel.creatorUsername}</span>
                
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  <span className="bg-accent border border-border text-[9px] px-2 py-0.5 rounded-[1px] text-accent-foreground flex items-center gap-1">
                    GENRE: {selectedReel.category}
                  </span>
                  {selectedReel.location && (
                    <span className="bg-accent border border-border text-[9px] px-2 py-0.5 rounded-[1px] text-accent-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {selectedReel.location}
                    </span>
                  )}
                  {selectedReel.musicName && (
                    <span className="bg-accent border border-border text-[9px] px-2 py-0.5 rounded-[1px] text-accent-foreground flex items-center gap-1">
                      <Music className="w-3 h-3" /> {selectedReel.musicName}
                    </span>
                  )}
                </div>

                {selectedReel.taggedUsers && selectedReel.taggedUsers.length > 0 && (
                  <div className="pt-2 border-t border-border mt-2">
                    <span className="text-[9px] text-muted-foreground mb-1 block">TAGGED USERS:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedReel.taggedUsers.map((u, idx) => (
                        <span key={idx} className="bg-background border border-border text-[9px] px-1.5 py-0.5 rounded text-foreground">
                          @{u.username}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Engagement statistics widgets */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-6">
                {[
                  { label: 'Views', value: selectedReel.views },
                  { label: 'Likes', value: selectedReel.likes },
                  { label: 'Comments', value: selectedReel.commentsCount },
                  { label: 'Shares', value: selectedReel.shares }
                ].map((stat, i) => (
                  <div key={i} className="p-2.5 bg-muted border border-border rounded-[2px] text-center font-mono">
                    <span className="text-[7px] text-muted-foreground block leading-none">{stat.label}</span>
                    <span className="text-xs font-black mt-2 block tracking-tight leading-none text-foreground">
                      {stat.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Monetization & Approval Calculations */}
              <div className="bg-muted/30 border border-border p-3.5 rounded-[2px] mb-6 space-y-3">
                <h4 className="font-extrabold text-foreground text-[10px] tracking-wider uppercase flex items-center gap-1.5 border-b border-border pb-2">
                  <Flame className="w-3.5 h-3.5 text-primary" /> EARNINGS & APPROVAL ENGINE
                </h4>
                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div className="space-y-1 bg-background border border-border p-2 rounded-[2px]">
                    <span className="text-[8px] text-muted-foreground uppercase block font-bold tracking-tight">Unprocessed Views</span>
                    <span className="font-bold text-foreground text-sm">{selectedReel.pendingEarningsViews?.toLocaleString() || 0}</span>
                  </div>
                  <div className="space-y-1 bg-background border border-border p-2 rounded-[2px]">
                    <span className="text-[8px] text-muted-foreground uppercase block font-bold tracking-tight">Est. Payout</span>
                    <span className="font-bold text-emerald-500 text-sm">₹{((selectedReel.pendingEarningsViews || 0) * 0.005).toFixed(2)}</span>
                  </div>
                  <div className="space-y-1.5 col-span-2 bg-background border border-border p-2 rounded-[2px] flex justify-between items-center">
                    <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-tight">Challenge Approval</span>
                    <span className={cn(
                      "font-bold text-[9px] inline-flex px-2 py-0.5 rounded-[2px] border uppercase",
                      selectedReel.challengeApprovalStatus === 'APPROVED' ? "bg-success/10 text-success border-success/30" :
                      selectedReel.challengeApprovalStatus === 'REJECTED' ? "bg-destructive/10 text-destructive border-destructive/30" :
                      "bg-warning/10 text-warning border-warning/30"
                    )}>
                      {selectedReel.challengeApprovalStatus || 'PENDING'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Operations Control Action Commands Console */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-foreground text-[11px] tracking-wider uppercase border-b border-border pb-1.5">
                  FEED OPERATIONS COMMANDS
                </h4>

                <div className="grid grid-cols-2 gap-2 text-[9px] font-bold font-mono">
                  {/* Force trend */}
                  <button
                    onClick={() => handleForceTrend(selectedReel)}
                    className={cn(
                      "h-10 px-3 transition-colors rounded-[1px] border uppercase flex items-center gap-2.5",
                      selectedReel.isTrending 
                        ? "bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20" 
                        : "bg-accent text-primary hover:bg-primary/10 border-primary/30"
                    )}
                  >
                    <Flame className="w-3.5 h-3.5 shrink-0" />
                    <span>{selectedReel.isTrending ? "STRIP FROM TRENDS" : "FORCE TREND FEED"}</span>
                  </button>

                  {/* Hide content */}
                  <button
                    onClick={() => handleHide(selectedReel)}
                    className={cn(
                      "h-10 px-3 transition-colors rounded-[1px] border uppercase flex items-center gap-2.5",
                      selectedReel.isHidden 
                        ? "bg-primary text-primary-foreground font-extrabold border-transparent" 
                        : "bg-accent text-warning hover:bg-warning/10 border-warning/30"
                    )}
                  >
                    <EyeOff className="w-3.5 h-3.5 shrink-0" />
                    <span>{selectedReel.isHidden ? "MAKE VISIBLE" : "HIDE CONTENT"}</span>
                  </button>

                  {/* Disable comments */}
                  <button
                    onClick={() => handleDisableComments(selectedReel)}
                    className={cn(
                      "h-10 px-3 transition-colors rounded-[1px] border uppercase flex items-center gap-2.5",
                      selectedReel.commentsDisabled 
                        ? "bg-primary text-primary-foreground font-extrabold border-transparent" 
                        : "bg-accent text-warning hover:bg-warning/10 border-warning/30"
                    )}
                  >
                    {selectedReel.commentsDisabled ? <MessageSquare className="w-3.5 h-3.5 shrink-0" /> : <MessageSquareOff className="w-3.5 h-3.5 shrink-0" />}
                    <span>{selectedReel.commentsDisabled ? "ENABLE COMMENTS" : "DISABLE COMMENTS"}</span>
                  </button>

                  {/* Age Restrict */}
                  <button
                    onClick={() => handleAgeRestrict(selectedReel)}
                    className={cn(
                      "h-10 px-3 transition-colors rounded-[1px] border uppercase flex items-center gap-2.5",
                      selectedReel.ageRestricted 
                        ? "bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20" 
                        : "bg-accent text-muted-foreground border-border hover:bg-muted"
                    )}
                  >
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>{selectedReel.ageRestricted ? "LIFT 18+ BOUNDS" : "RESTRICT (18+)"}</span>
                  </button>
                </div>

                {/* Permanent Delete */}
                <button
                  onClick={() => handleRemove(selectedReel)}
                  className="w-full h-10 bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20 font-bold transition-colors font-mono rounded-[1px] uppercase tracking-wide flex items-center justify-center gap-2 mt-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>WIPE CONTENT FROM STORAGE DATABASE</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};