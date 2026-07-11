import React, { useState, useEffect } from 'react';
import { usePlatformStore, Creator } from '../store/usePlatformStore';
import { 
  Search, 
  X, 
  Coins, 
  MapPin, 
  UserCheck, 
  EyeOff, 
  UserMinus, 
  Smartphone, 
  Database 
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export const UsersPage: React.FC = () => {
  // Zustand Store integrations
  const { 
    creators, 
    banUser, 
    unbanUser, 
    verifyUser, 
    removeVerification, 
    shadowBanUser, 
    freezeEarnings,
    toggleMonetization
  } = usePlatformStore();

  // Search & Filter local states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'shadow_banned' | 'verified' | 'nearby' | 'top'>('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [sortField, setSortField] = useState<'followers' | 'coinsEarned' | 'videoCount' | 'registrationDate'>('followers');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  // Listen to Global Context Multi-City Selector Changes!
  useEffect(() => {
    const handleCityChange = (e: any) => {
      setCityFilter(e.detail);
    };
    window.addEventListener('popli_city_changed', handleCityChange);
    // Initial fetch if global variable is present
    if ((window as any).__popli_active_city_filter) {
      setCityFilter((window as any).__popli_active_city_filter);
    }
    return () => window.removeEventListener('popli_city_changed', handleCityChange);
  }, []);

  // Actions wrapper with react-hot-toast feedback
  const handleVerify = (creator: Creator) => {
    if (creator.isVerified) {
      removeVerification(creator.id);
      toast('Verification Badge Stripped', { icon: '🛡️' });
    } else {
      verifyUser(creator.id);
      toast.success('Creator Verified Successfully', { icon: '👑' });
    }
    setSelectedCreator(prev => prev ? { ...prev, isVerified: !prev.isVerified } : null);
  };

  const handleToggleMonetization = async (creator: Creator) => {
    await toggleMonetization(creator.id);
    toast.success(`Monetization ${creator.isMonetized ? 'disabled' : 'enabled'} for @${creator.username}`, { icon: '💰' });
    setSelectedCreator(prev => prev ? { ...prev, isMonetized: !prev.isMonetized } : null);
  };

  const handleShadowBan = (creator: Creator) => {
    shadowBanUser(creator.id);
    toast.error(`Shadow ban enforced on @${creator.username}. Reach silently throttled.`, {
      icon: '👁️‍🗨️'
    });
    if (selectedCreator?.id === creator.id) {
      setSelectedCreator(prev => prev ? { ...prev, status: 'shadow_banned' } : null);
    }
  };

  const handleBanToggle = (creator: Creator) => {
    if (creator.status === 'suspended') {
      unbanUser(creator.id);
      toast.success(`Account @${creator.username} reinstated. Access restored.`);
      if (selectedCreator?.id === creator.id) {
        setSelectedCreator(prev => prev ? { ...prev, status: 'active' } : null);
      }
    } else {
      banUser(creator.id);
      toast.error(`Account @${creator.username} suspended. Token keys blacklisted!`);
      if (selectedCreator?.id === creator.id) {
        setSelectedCreator(prev => prev ? { ...prev, status: 'suspended' } : null);
      }
    }
  };

  const handleFreezeEarnings = (creator: Creator) => {
    freezeEarnings(creator.id);
    const action = !creator.earningsFrozen ? 'FROZEN' : 'UNFROZEN';
    toast.success(`Coins wallet status: ${action} for @${creator.username}`, {
      icon: '❄️'
    });
    if (selectedCreator?.id === creator.id) {
      setSelectedCreator(prev => prev ? { ...prev, earningsFrozen: !prev.earningsFrozen } : null);
    }
  };

  // Perform filtering & sorting
  const filteredCreators = creators
    .filter(creator => {
      // Search search filter
      const matchesSearch = 
        creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        creator.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        creator.city.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Multi-City operational header context filter
      const matchesGlobalCity = cityFilter === 'all' || creator.city.toLowerCase() === cityFilter.toLowerCase();

      // Sidebar sub-tab filter
      let matchesStatus = true;
      if (statusFilter === 'active') matchesStatus = creator.status === 'active';
      else if (statusFilter === 'suspended') matchesStatus = creator.status === 'suspended';
      else if (statusFilter === 'shadow_banned') matchesStatus = creator.status === 'shadow_banned';
      else if (statusFilter === 'verified') matchesStatus = creator.isVerified;
      else if (statusFilter === 'nearby') matchesStatus = creator.followers < 100000; // hyperlocal micro creator tier
      else if (statusFilter === 'top') matchesStatus = creator.followers > 1500000; // Mega creator tier
      
      return matchesSearch && matchesGlobalCity && matchesStatus;
    })
    .sort((a, b) => {
      let multiplier = sortOrder === 'desc' ? -1 : 1;
      if (sortField === 'registrationDate') {
        return (new Date(a.registrationDate).getTime() - new Date(b.registrationDate).getTime()) * multiplier;
      }
      return (a[sortField] - b[sortField]) * multiplier;
    });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const openCreatorDrawer = (creator: Creator) => {
    setSelectedCreator(creator);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6 relative">
      {/* 🚀 Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-foreground">Creator Management</h1>
          <p className="text-muted-foreground text-[10px] uppercase font-mono mt-1 font-semibold">Simulated database containing {creators.length} Indian profiles</p>
        </div>
      </div>

      {/* 🛠️ Filters Command Center */}
      <div className="bg-card border border-border p-4 rounded-2xl space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="SEARCH BY OPERATOR NAME, @USERNAME, IP OR CITY..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 bg-muted/40 border border-border rounded-xl pl-10 pr-4 text-xs placeholder-muted-foreground/60 uppercase text-foreground outline-none focus:border-primary transition-all font-mono"
            />
          </div>
          
          {/* Filter tabs */}
          <div className="flex flex-wrap bg-muted/40 border border-border p-1 rounded-xl select-none text-[9px] font-bold font-mono">
            {([
              { id: 'all', label: 'ALL INDIAN CREATORS' },
              { id: 'active', label: 'ACTIVE' },
              { id: 'shadow_banned', label: 'SHADOW BANNED' },
              { id: 'suspended', label: 'SUSPENDED' },
              { id: 'verified', label: 'VERIFIED' }
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={cn(
                  "px-3 py-2 transition-all rounded-lg uppercase tracking-wider",
                  statusFilter === tab.id 
                    ? "bg-primary text-white shadow-sm shadow-primary/20" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 📊 Data Grid Table */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          // 💀 Loading Skeleton Loader
          <div className="p-8 space-y-4 select-none">
            <div className="h-6 bg-muted border border-border animate-pulse rounded-lg w-full" />
            <div className="h-12 bg-muted border border-border animate-pulse rounded-lg w-full" />
            <div className="h-12 bg-muted border border-border animate-pulse rounded-lg w-full" />
            <div className="h-12 bg-muted border border-border animate-pulse rounded-lg w-full" />
          </div>
        ) : filteredCreators.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[10px] uppercase font-bold text-muted-foreground">
              <thead>
                <tr className="bg-muted/50 border-b border-border select-none text-muted-foreground font-mono">
                  <th className="p-3.5 pl-5">Creator details</th>
                  <th className="p-3.5">City location</th>
                  <th className="p-3.5 cursor-pointer hover:text-foreground" onClick={() => toggleSort('followers')}>
                    Followers {sortField === 'followers' && (sortOrder === 'desc' ? '▼' : '▲')}
                  </th>
                  <th className="p-3.5 cursor-pointer hover:text-foreground" onClick={() => toggleSort('coinsEarned')}>
                    Coins earned {sortField === 'coinsEarned' && (sortOrder === 'desc' ? '▼' : '▲')}
                  </th>
                  <th className="p-3.5 cursor-pointer hover:text-foreground" onClick={() => toggleSort('videoCount')}>
                    Videos {sortField === 'videoCount' && (sortOrder === 'desc' ? '▼' : '▲')}
                  </th>
                  <th className="p-3.5">Security status</th>
                  <th className="p-3.5 pr-5 text-right">Operational console</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredCreators.slice(0, 15).map((creator) => (
                  <tr key={creator.id} className="hover:bg-muted/30 transition-colors">
                    {/* Creator ID card */}
                    <td className="p-3 pl-5">
                      <div className="flex items-center gap-3">
                        <img 
                          src={creator.avatar} 
                          alt={creator.name} 
                          className="w-8 h-8 rounded-full border border-border object-cover bg-muted shrink-0" 
                        />
                        <div>
                          <span className="text-foreground font-extrabold block text-xs tracking-tight">{creator.name}</span>
                          <span className="text-muted-foreground font-normal block mt-0.5 select-all font-mono">@{creator.username}</span>
                        </div>
                      </div>
                    </td>
                    
                    {/* Location */}
                    <td className="p-3 text-foreground">
                      <div className="flex items-center gap-1.5 font-normal font-mono">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                      <span>{[creator.city, creator.state].filter(Boolean).join(', ') || '—'}</span>
                      </div>
                    </td>

                    {/* Followers */}
                    <td className="p-3 text-foreground font-mono font-semibold">
                      {creator.followers.toLocaleString()}
                    </td>

                    {/* Coins */}
                    <td className="p-3 text-primary font-mono font-semibold">
                      {creator.coinsEarned.toLocaleString()}
                    </td>

                    {/* Video Count */}
                    <td className="p-3 text-foreground font-mono">
                      {creator.videoCount}
                    </td>

                    {/* Status Badge */}
                    <td className="p-3">
                      <span className={cn(
                        "px-2 py-0.5 text-[8px] font-bold rounded-md border uppercase font-mono",
                        creator.status === 'active' 
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                          : creator.status === 'shadow_banned'
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            : "bg-red-500/10 text-red-500 border-red-500/20"
                      )}>
                        {creator.status.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-3 pr-5 text-right">
                      <div className="flex gap-1.5 justify-end">
                        <button
                          onClick={() => openCreatorDrawer(creator)}
                          className="bg-card border border-border hover:border-primary/50 text-foreground hover:text-primary px-3 py-1 rounded-xl text-[8px] font-bold font-mono tracking-wider transition-all shadow-sm active:scale-95"
                        >
                          OPEN AUDIT
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
            <span className="text-2xl">🔍</span>
            <p className="font-bold">Zero creators match filters</p>
            <p className="text-[8px] font-normal leading-normal px-6">System intelligence returned no indices matching the query parameters.</p>
          </div>
        )}
      </div>

      {/* 👤 Creator Side Drawer Audit Console */}
      <AnimatePresence>
        {isDrawerOpen && selectedCreator && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-black/25 dark:bg-black/50 backdrop-blur-xs"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
              className="fixed top-0 right-0 w-full sm:w-[480px] h-full bg-card border-l border-border z-50 p-6 overflow-y-auto custom-scrollbar flex flex-col font-sans text-[10px] text-muted-foreground uppercase select-none"
            >
              {/* Drawer Header */}
              <div className="flex justify-between items-center border-b border-border pb-4 mb-4 select-none">
                <span className="font-extrabold text-primary uppercase text-xs tracking-widest flex items-center gap-1.5 font-display">
                  <Database className="w-4 h-4 text-primary" /> CREATOR AUDIT PROFILE
                </span>
                <button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-muted rounded-xl text-muted-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Creator details card */}
              <div className="flex gap-4 p-4 bg-muted/40 border border-border rounded-2xl items-center mb-6">
                <img 
                  src={selectedCreator.avatar} 
                  alt={selectedCreator.name} 
                  className="w-16 h-16 rounded-full border border-border bg-muted object-cover" 
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground text-base font-black tracking-tight leading-none font-display">{selectedCreator.name}</span>
                    {selectedCreator.isVerified && (
                      <span className="bg-primary/10 border border-primary/20 text-primary text-[8px] font-bold px-1.5 py-0.5 rounded-md tracking-wider uppercase flex items-center gap-0.5 font-mono">
                        👑 VERIFIED
                      </span>
                    )}
                  </div>
                  <span className="text-muted-foreground block font-normal text-xs leading-none mt-0.5 select-all font-mono">@{selectedCreator.username}</span>
                </div>
              </div>

              {/* Stats overview widgets */}
              <div className="grid grid-cols-4 gap-2.5 mb-6 font-mono">
                {[
                  { label: 'Followers', value: selectedCreator.followers.toLocaleString(), color: 'text-foreground' },
                  { label: 'Likes', value: selectedCreator.totalLikes.toLocaleString(), color: 'text-foreground' },
                  { label: 'Views', value: (selectedCreator.totalViews || 0).toLocaleString(), color: 'text-foreground' },
                  { label: 'Coins', value: selectedCreator.coinsEarned.toLocaleString(), color: 'text-primary' }
                ].map((stat, i) => (
                  <div key={i} className="p-3 bg-muted/40 border border-border rounded-xl text-center">
                    <span className="text-[8px] text-muted-foreground block leading-none">{stat.label}</span>
                    <span className={cn("text-sm font-black mt-2 block tracking-tight leading-none", stat.color)}>{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Security Audit logs */}
              <div className="space-y-3.5 mb-6 border-b border-border pb-6 font-mono">
                <h4 className="font-extrabold text-foreground text-[11px] tracking-wider uppercase border-b border-border pb-1.5 flex items-center gap-1.5 font-display">
                  <Smartphone className="w-3.5 h-3.5 text-muted-foreground" /> Security fingerprint
                </h4>
                
                <div className="grid grid-cols-2 gap-4 text-[9px] font-bold">
                  {/* Removed device fingerprint and risk score metrics */}
                </div>
              </div>

              {/* Operations Control Actions Console */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-foreground text-[11px] tracking-wider uppercase border-b border-border pb-1.5 font-display">
                  OPERATIONAL CLEARANCE COMMANDS
                </h4>

                <div className="grid grid-cols-2 gap-2 text-[9px] font-bold font-mono">
                  {/* Verify button */}
                  <button
                    onClick={() => handleVerify(selectedCreator)}
                    className={cn(
                      "h-10 px-3 transition-all rounded-xl border uppercase flex items-center gap-2.5 active:scale-95 shadow-sm",
                      selectedCreator.isVerified 
                        ? "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/25" 
                        : "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
                    )}
                  >
                    <UserCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>{selectedCreator.isVerified ? "STRIP VERIFY" : "VERIFY USER"}</span>
                  </button>

                  {/* Freeze earnings */}
                  <button
                    onClick={() => handleFreezeEarnings(selectedCreator)}
                    className={cn(
                      "h-10 px-3 transition-all rounded-xl border uppercase flex items-center gap-2.5 active:scale-95 shadow-sm",
                      selectedCreator.earningsFrozen 
                        ? "bg-primary text-white border-transparent shadow-md shadow-primary/25" 
                        : "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20"
                    )}
                  >
                    <Coins className="w-3.5 h-3.5 shrink-0" />
                    <span>{selectedCreator.earningsFrozen ? "DEFROST COINS" : "FREEZE WALLET"}</span>
                  </button>

                  {/* Monetization Toggle */}
                  <button
                    onClick={() => handleToggleMonetization(selectedCreator)}
                    className={cn(
                      "h-10 px-3 transition-all rounded-xl border uppercase flex items-center gap-2.5 active:scale-95 shadow-sm",
                      selectedCreator.isMonetized 
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20" 
                        : "bg-muted text-muted-foreground hover:bg-muted/80 border-border"
                    )}
                  >
                    <Coins className="w-3.5 h-3.5 shrink-0" />
                    <span>{selectedCreator.isMonetized ? "DEMONETIZE" : "MONETIZE"}</span>
                  </button>

                  {/* Shadow ban */}
                  <button
                    onClick={() => handleShadowBan(selectedCreator)}
                    className={cn(
                      "h-10 px-3 transition-all rounded-xl border uppercase flex items-center gap-2.5 active:scale-95 shadow-sm",
                      selectedCreator.status === 'shadow_banned' 
                        ? "bg-primary text-white border-transparent shadow-md shadow-primary/25" 
                        : "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20"
                    )}
                  >
                    <EyeOff className="w-3.5 h-3.5 shrink-0" />
                    <span>SHADOW BAN</span>
                  </button>

                  {/* Suspend ban */}
                  <button
                    onClick={() => handleBanToggle(selectedCreator)}
                    className={cn(
                      "h-10 px-3 transition-all rounded-xl border uppercase flex items-center gap-2.5 active:scale-95 shadow-sm",
                      selectedCreator.status === 'suspended' 
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20" 
                        : "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20"
                    )}
                  >
                    <UserMinus className="w-3.5 h-3.5 shrink-0" />
                    <span>{selectedCreator.status === 'suspended' ? "ACTIVATE ACCESS" : "SUSPEND USER"}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
