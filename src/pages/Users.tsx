import React, { useState, useEffect, useCallback } from 'react';
import { usePlatformStore, Creator } from '../store/usePlatformStore';
import { useRegisterRefresh } from '../hooks/useRegisterRefresh';
import {
  Search,
  X,
  Coins,
  MapPin,
  UserCheck,
  EyeOff,
  UserMinus,
  Smartphone,
  Database,
  Users,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export const UsersPage: React.FC = () => {
  const {
    creators,
    banUser,
    unbanUser,
    verifyUser,
    removeVerification,
    shadowBanUser,
    freezeEarnings,
    toggleMonetization,
  } = usePlatformStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'suspended' | 'shadow_banned' | 'verified'
  >('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [sortField, setSortField] = useState<
    'followers' | 'coinsEarned' | 'videoCount' | 'registrationDate'
  >('followers');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

const { fetchAllData } = usePlatformStore();

  const refresh = useCallback(async () => {
    await fetchAllData();
  }, [fetchAllData]);

  useRegisterRefresh(refresh);

useEffect(() => {
    fetchAllData().finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    const handleCityChange = (e: any) => setCityFilter(e.detail);
    window.addEventListener('popli_city_changed', handleCityChange);
    if ((window as any).__popli_active_city_filter) {
      setCityFilter((window as any).__popli_active_city_filter);
    }
    return () => window.removeEventListener('popli_city_changed', handleCityChange);
  }, []);

  const handleVerify = (creator: Creator) => {
    if (creator.isVerified) {
      removeVerification(creator.id);
      toast('Verification removed', { icon: '🛡️' });
    } else {
      verifyUser(creator.id);
      toast.success('Creator verified');
    }
    setSelectedCreator((prev) => prev ? { ...prev, isVerified: !prev.isVerified } : null);
  };

  const handleToggleMonetization = async (creator: Creator) => {
    await toggleMonetization(creator.id);
    toast.success(
      `Monetization ${creator.isMonetized ? 'disabled' : 'enabled'} for @${creator.username}`
    );
    setSelectedCreator((prev) => prev ? { ...prev, isMonetized: !prev.isMonetized } : null);
  };

  const handleShadowBan = (creator: Creator) => {
    shadowBanUser(creator.id);
    toast.error(`Shadow ban applied to @${creator.username}`);
    if (selectedCreator?.id === creator.id) {
      setSelectedCreator((prev) => prev ? { ...prev, status: 'shadow_banned' } : null);
    }
  };

  const handleBanToggle = (creator: Creator) => {
    if (creator.status === 'suspended') {
      unbanUser(creator.id);
      toast.success(`@${creator.username} reinstated`);
      if (selectedCreator?.id === creator.id)
        setSelectedCreator((prev) => prev ? { ...prev, status: 'active' } : null);
    } else {
      banUser(creator.id);
      toast.error(`@${creator.username} suspended`);
      if (selectedCreator?.id === creator.id)
        setSelectedCreator((prev) => prev ? { ...prev, status: 'suspended' } : null);
    }
  };

  const handleFreezeEarnings = (creator: Creator) => {
    freezeEarnings(creator.id);
    toast.success(
      `Wallet ${!creator.earningsFrozen ? 'frozen' : 'unfrozen'} for @${creator.username}`
    );
    if (selectedCreator?.id === creator.id)
      setSelectedCreator((prev) => prev ? { ...prev, earningsFrozen: !prev.earningsFrozen } : null);
  };

  const filteredCreators = creators
    .filter((creator) => {
      const matchesSearch =
        creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        creator.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        creator.city.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGlobalCity =
        cityFilter === 'all' ||
        creator.city.toLowerCase() === cityFilter.toLowerCase();

      let matchesStatus = true;
      if (statusFilter === 'active') matchesStatus = creator.status === 'active';
      else if (statusFilter === 'suspended') matchesStatus = creator.status === 'suspended';
      else if (statusFilter === 'shadow_banned') matchesStatus = creator.status === 'shadow_banned';
      else if (statusFilter === 'verified') matchesStatus = creator.isVerified;

      return matchesSearch && matchesGlobalCity && matchesStatus;
    })
    .sort((a, b) => {
      const multiplier = sortOrder === 'desc' ? -1 : 1;
      if (sortField === 'registrationDate') {
        return (
          (new Date(a.registrationDate).getTime() -
            new Date(b.registrationDate).getTime()) *
          multiplier
        );
      }
      return (a[sortField] - b[sortField]) * multiplier;
    });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const openCreatorDrawer = (creator: Creator) => {
    setSelectedCreator(creator);
    setIsDrawerOpen(true);
  };

  const STATUS_TABS = [
    { id: 'all' as const, label: 'All Creators' },
    { id: 'active' as const, label: 'Active' },
    { id: 'shadow_banned' as const, label: 'Shadow Banned' },
    { id: 'suspended' as const, label: 'Suspended' },
    { id: 'verified' as const, label: 'Verified' },
  ];

  return (
    <div className="space-y-6 relative">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-foreground tracking-tight">
            Creator Management
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            {creators.length} creators in database
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, @username, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 w-full pl-9 pr-4 rounded-lg border border-border bg-background text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Status filter tabs */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1 flex-wrap">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={cn(
                  'h-7 px-3 rounded-md text-[12px] font-medium transition-all whitespace-nowrap',
                  statusFilter === tab.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredCreators.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Creator
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Location
                  </th>
                  <th
                    className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors select-none"
                    onClick={() => toggleSort('followers')}
                  >
                    Followers{' '}
                    {sortField === 'followers' && (
                      <span className="ml-1">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                    )}
                  </th>
                  <th
                    className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors select-none"
                    onClick={() => toggleSort('coinsEarned')}
                  >
                    Coins{' '}
                    {sortField === 'coinsEarned' && (
                      <span className="ml-1">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                    )}
                  </th>
                  <th
                    className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors select-none"
                    onClick={() => toggleSort('videoCount')}
                  >
                    Videos{' '}
                    {sortField === 'videoCount' && (
                      <span className="ml-1">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                    )}
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCreators.slice(0, 15).map((creator) => (
                  <tr
                    key={creator.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    {/* Creator */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={creator.avatar}
                          alt={creator.name}
                          className="w-8 h-8 rounded-full border border-border object-cover bg-muted shrink-0"
                        />
                        <div>
                          <span className="text-[13px] font-semibold text-foreground block">
                            {creator.name}
                          </span>
                          <span className="text-[12px] text-muted-foreground font-mono">
                            @{creator.username}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-[12px] text-foreground">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span>
                          {[creator.city, creator.state].filter(Boolean).join(', ') || '—'}
                        </span>
                      </div>
                    </td>

                    {/* Followers */}
                    <td className="px-5 py-3.5 text-[12px] text-foreground font-mono">
                      {creator.followers.toLocaleString()}
                    </td>

                    {/* Coins — NOTE: always 0, wallet not joined in getUsers() */}
                    <td className="px-5 py-3.5 text-[12px] text-primary font-mono">
                      {creator.coinsEarned.toLocaleString()}
                    </td>

                    {/* Videos — NOTE: always 0, _count not included in getUsers() */}
                    <td className="px-5 py-3.5 text-[12px] text-foreground font-mono">
                      {creator.videoCount}
                    </td>

                    {/* Status badge */}
                    <td className="px-5 py-3.5">
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium',
                          creator.status === 'active'
                            ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                            : creator.status === 'shadow_banned'
                            ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
                            : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                        )}
                      >
                        {creator.status.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => openCreatorDrawer(creator)}
                        className="h-7 px-3 rounded-lg border border-border bg-card text-[12px] font-medium text-foreground hover:bg-muted hover:border-primary/40 hover:text-primary transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination notice — hardcoded slice(0,15) */}
            {filteredCreators.length > 15 && (
              <div className="px-5 py-3 border-t border-border bg-muted/20">
                <p className="text-[12px] text-muted-foreground">
                  Showing 15 of {filteredCreators.length} creators — pagination not yet implemented
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-center py-14">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Users className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-[13px] font-semibold text-foreground">No creators found</p>
            <p className="text-[12px] text-muted-foreground">
              Try adjusting your search or filter
            </p>
          </div>
        )}
      </div>

      {/* Creator Drawer */}
      <AnimatePresence>
        {isDrawerOpen && selectedCreator && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-black/20"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed top-0 right-0 w-full sm:w-[480px] h-full bg-card border-l border-border z-50 p-5 overflow-y-auto flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[13px] font-semibold text-foreground">
                    Creator Profile
                  </span>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Identity card */}
              <div className="flex gap-4 p-4 bg-muted/40 border border-border rounded-xl items-center mb-5">
                <img
                  src={selectedCreator.avatar}
                  alt={selectedCreator.name}
                  className="w-14 h-14 rounded-full border border-border bg-muted object-cover shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[15px] font-semibold text-foreground">
                      {selectedCreator.name}
                    </span>
                    {selectedCreator.isVerified && (
                      <span className="bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[11px] font-medium px-2 py-0.5 rounded-md">
                        Verified
                      </span>
                    )}
                  </div>
                  <span className="text-[12px] text-muted-foreground font-mono">
                    @{selectedCreator.username}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className={cn(
                        'text-[11px] font-medium px-2 py-0.5 rounded-md',
                        selectedCreator.status === 'active'
                          ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                          : selectedCreator.status === 'shadow_banned'
                          ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
                          : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                      )}
                    >
                      {selectedCreator.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-4 gap-2 mb-5">
                {[
                  { label: 'Followers', value: selectedCreator.followers.toLocaleString() },
                  { label: 'Likes', value: selectedCreator.totalLikes.toLocaleString() },
                  { label: 'Views', value: (selectedCreator.totalViews || 0).toLocaleString() },
                  {
                    label: 'Coins',
                    value: selectedCreator.coinsEarned.toLocaleString(),
                    highlight: true,
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="p-3 bg-muted/40 border border-border rounded-xl text-center"
                  >
                    <span className="text-[11px] text-muted-foreground block">{stat.label}</span>
                    <span
                      className={cn(
                        'text-[13px] font-semibold mt-1 block',
                        stat.highlight ? 'text-primary' : 'text-foreground'
                      )}
                    >
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Security fingerprint section */}
              <div className="mb-5 pb-5 border-b border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Smartphone className="w-3.5 h-3.5 text-muted-foreground" />
                  <h4 className="text-[13px] font-semibold text-foreground">
                    Account Details
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/40 border border-border rounded-xl">
                    <span className="text-[11px] text-muted-foreground block">Location</span>
                    <span className="text-[12px] text-foreground font-medium mt-0.5 block">
                      {[selectedCreator.city, selectedCreator.state]
                        .filter(Boolean)
                        .join(', ') || '—'}
                    </span>
                  </div>
                  <div className="p-3 bg-muted/40 border border-border rounded-xl">
                    <span className="text-[11px] text-muted-foreground block">Joined</span>
                    <span className="text-[12px] text-foreground font-mono mt-0.5 block">
                      {new Date(selectedCreator.registrationDate).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <div className="p-3 bg-muted/40 border border-border rounded-xl">
                    <span className="text-[11px] text-muted-foreground block">Last Active</span>
                    <span className="text-[12px] text-foreground font-mono mt-0.5 block">
                      {new Date(selectedCreator.lastActive).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <div className="p-3 bg-muted/40 border border-border rounded-xl">
                    <span className="text-[11px] text-muted-foreground block">Monetization</span>
                    <span
                      className={cn(
                        'text-[12px] font-medium mt-0.5 block',
                        selectedCreator.isMonetized ? 'text-emerald-600' : 'text-muted-foreground'
                      )}
                    >
                      {selectedCreator.isMonetized ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div>
                <h4 className="text-[13px] font-semibold text-foreground mb-3">
                  Moderation Actions
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {/* Verify */}
                  <button
                    onClick={() => handleVerify(selectedCreator)}
                    className={cn(
                      'h-9 px-3 rounded-lg border text-[12px] font-medium flex items-center gap-2 transition-colors',
                      selectedCreator.isVerified
                        ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20'
                        : 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/20'
                    )}
                  >
                    <UserCheck className="w-3.5 h-3.5 shrink-0" />
                    {selectedCreator.isVerified ? 'Remove Verify' : 'Verify'}
                  </button>

                  {/* Freeze wallet */}
                  <button
                    onClick={() => handleFreezeEarnings(selectedCreator)}
                    className={cn(
                      'h-9 px-3 rounded-lg border text-[12px] font-medium flex items-center gap-2 transition-colors',
                      selectedCreator.earningsFrozen
                        ? 'bg-primary text-white border-transparent hover:bg-primary/90'
                        : 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20 hover:bg-amber-200 dark:hover:bg-amber-500/20'
                    )}
                  >
                    <Coins className="w-3.5 h-3.5 shrink-0" />
                    {selectedCreator.earningsFrozen ? 'Unfreeze' : 'Freeze Wallet'}
                  </button>

                  {/* Monetization */}
                  <button
                    onClick={() => handleToggleMonetization(selectedCreator)}
                    className={cn(
                      'h-9 px-3 rounded-lg border text-[12px] font-medium flex items-center gap-2 transition-colors',
                      selectedCreator.isMonetized
                        ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-200 dark:hover:bg-emerald-500/20'
                        : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
                    )}
                  >
                    <Coins className="w-3.5 h-3.5 shrink-0" />
                    {selectedCreator.isMonetized ? 'Demonetize' : 'Monetize'}
                  </button>

                  {/* Shadow ban */}
                  <button
                    onClick={() => handleShadowBan(selectedCreator)}
                    className={cn(
                      'h-9 px-3 rounded-lg border text-[12px] font-medium flex items-center gap-2 transition-colors',
                      selectedCreator.status === 'shadow_banned'
                        ? 'bg-primary text-white border-transparent hover:bg-primary/90'
                        : 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20 hover:bg-amber-200 dark:hover:bg-amber-500/20'
                    )}
                  >
                    <EyeOff className="w-3.5 h-3.5 shrink-0" />
                    {selectedCreator.status === 'shadow_banned' ? 'Remove Shadow Ban' : 'Shadow Ban'}
                  </button>

                  {/* Suspend / Reinstate */}
                  <button
                    onClick={() => handleBanToggle(selectedCreator)}
                    className={cn(
                      'h-9 px-3 rounded-lg border text-[12px] font-medium flex items-center gap-2 transition-colors col-span-2',
                      selectedCreator.status === 'suspended'
                        ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-200 dark:hover:bg-emerald-500/20'
                        : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20'
                    )}
                  >
                    <UserMinus className="w-3.5 h-3.5 shrink-0" />
                    {selectedCreator.status === 'suspended' ? 'Reinstate Account' : 'Suspend Account'}
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