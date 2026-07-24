import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { PageRefreshProvider, usePageRefresh } from '../contexts/PageRefreshContext';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { logout } from '@/redux/slices/authSlice';
import { NAVIGATION_GROUPS } from '@/constants/navigation';

import { GlobalContextBar } from '@/components/GlobalContextBar';
import { usePlatformStore } from '@/store/usePlatformStore';
import {
  Menu,
  X,
  LogOut,
  Bell,
  ChevronRight,
  User,
  Sun,
  Moon,
  ArrowLeftRight,
  ShieldAlert,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

const RefreshButton: React.FC = () => {
  const { triggerRefresh, isRefreshing, hasRefreshHandler } = usePageRefresh();
  const [clicked, setClicked] = useState(false);

  const handleRefresh = async () => {
    if (!hasRefreshHandler || isRefreshing) return;
    setClicked(true);
    setTimeout(() => setClicked(false), 300);
    try {
      await triggerRefresh();
      toast.success('Page refreshed');  
    } catch {
      toast.error('Refresh failed');
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={handleRefresh}
        disabled={!hasRefreshHandler || isRefreshing}
        style={{ transform: clicked ? 'scale(0.82)' : 'scale(1)', transition: 'transform 0.15s ease' }}
        className={cn(
          'w-8 h-8 flex items-center justify-center rounded-lg border border-border transition-colors',
          hasRefreshHandler && !isRefreshing
            ? 'bg-card text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer'
            : 'bg-card text-muted-foreground/40 cursor-not-allowed'
        )}
      >
        <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
      </button>
      <div className="absolute right-0 top-9 z-50 hidden group-hover:block pointer-events-none">
        <div className="bg-popover border border-border text-foreground text-[11px] font-medium px-2 py-1 rounded-md shadow-md whitespace-nowrap">
          Refresh current page
        </div>
      </div>
    </div>
  );
};
export const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('popli-theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();

const { reports, tickets, transactions, fraudStats, fetchAllData } = usePlatformStore();

useEffect(() => { fetchAllData(); }, [location.pathname]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('popli-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('popli-theme', 'light');
    }
  }, [isDarkMode]);



  const handleLogout = () => {
    dispatch(logout());
    toast.success('Session terminated.');
    navigate('/login');
  };

const filteredGroups = NAVIGATION_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      if (user?.role === 'super_admin') return true;
      if (!item.permission) return true;
      return !!user?.permissions?.[item.permission];
    }),
  })).filter((group) => group.items.length > 0);

  const allNavItems = filteredGroups.flatMap((g) => g.items);
  const activeItem =
    allNavItems.find((item) => item.path === location.pathname) ||
    allNavItems.find((item) => item.path !== '/' && location.pathname.startsWith(item.path)) ||
    allNavItems[0];

  const pendingReportsCount = reports.filter((r) => r.status === 'pending').length;

const sidebarScrollRef = useRef<HTMLElement | null>(null);

  const SidebarContent = ({ collapsed }: { collapsed: boolean }) => {
    useLayoutEffect(() => {
      const nav = sidebarScrollRef.current;
      if (!nav) return;
      const saved = sessionStorage.getItem('sidebar-scroll');
      if (saved) {
        nav.scrollTop = parseInt(saved, 10);
      }
    }, []);

    return (
    <nav
      ref={(el) => { sidebarScrollRef.current = el; }}
      className="flex-1 overflow-y-auto py-3 px-2 space-y-5"
      onScroll={(e) => {
        sessionStorage.setItem('sidebar-scroll', String((e.currentTarget as HTMLElement).scrollTop));
      }}
    >
      {filteredGroups.map((group) => (
        <div key={group.label}>
          {!collapsed && (
            <p className="px-3 mb-1.5 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
              {group.label}
            </p>
          )}
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/' && item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={collapsed ? item.title : undefined}
                  className={cn(
                    'group flex items-center h-9 rounded-lg transition-all duration-150 select-none',
                    collapsed ? 'justify-center px-2' : 'px-3 gap-3',
                    isActive
                      ? 'bg-[hsl(var(--sidebar-active))] text-white'
                      : 'text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-muted))] hover:text-foreground'
                  )}
                >
               <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-white' : 'text-muted-foreground')} />
                  {!collapsed && (
                    <span className="text-[12px] font-medium truncate">{item.title}</span>
                  )}
                  {!collapsed && item.path === '/moderation' && pendingReportsCount > 0 && (
                    <span className={cn(
                      'ml-auto text-[9px] px-1.5 py-0.5 font-bold rounded-md',
                      isActive ? 'bg-white/20 text-white' : 'bg-red-500/20 text-red-400'
                    )}>
                      {pendingReportsCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
 </nav>
    );
  };
return (
    <PageRefreshProvider>
    <div className="min-h-screen bg-background flex text-foreground overflow-hidden font-sans">

      <motion.aside
        animate={{ width: isSidebarOpen ? 260 : 64 }}
        transition={{ duration: 0.25, ease: [0.25, 0.8, 0.25, 1] }}
        className="hidden md:flex flex-col h-screen sticky top-0 left-0 z-20 flex-shrink-0 overflow-hidden"
        style={{ background: 'hsl(var(--sidebar))' }}
      >
        <div
          className="h-16 flex items-center px-4 justify-between flex-shrink-0"
          style={{ borderBottom: '1px solid hsl(var(--sidebar-border))' }}
        >
       <Link to="/" className="flex items-center gap-3 min-w-0">
            <img
              src="/src/assets/adaptive-icon.png"
              alt="POPLI"
              className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
            />
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col min-w-0"
              >
             <span className="font-bold text-foreground text-sm tracking-wider uppercase leading-none">POPLI</span>
                <span className="text-[9px] font-medium tracking-widest uppercase mt-0.5 text-muted-foreground">
                  ADMIN COMMAND
                </span>
              </motion.div>
            )}
          </Link>
        </div>

        <SidebarContent collapsed={!isSidebarOpen} />

        <div
          className="p-2 flex-shrink-0"
          style={{ borderTop: '1px solid hsl(var(--sidebar-border))' }}
        >
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
         className={cn(
              'w-full flex items-center h-9 rounded-lg transition-colors text-[11px] font-medium select-none',
              isSidebarOpen ? 'px-3 gap-2' : 'justify-center',
              'text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--sidebar-muted))]'
            )}
          >
            <ArrowLeftRight className="w-3.5 h-3.5 flex-shrink-0" />
            {isSidebarOpen && <span>Tuck Sidebar</span>}
          </button>
        </div>
      </motion.aside>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col h-full md:hidden"
              style={{ background: 'hsl(var(--sidebar))' }}
            >
              <div
                className="h-16 flex items-center justify-between px-4"
                style={{ borderBottom: '1px solid hsl(var(--sidebar-border))' }}
              >
              <div className="flex items-center gap-3">
                  <img
                    src="/src/assets/adaptive-icon.png"
                    alt="POPLI"
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                  <span className="font-bold text-foreground text-sm tracking-wider uppercase">POPLI</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-[hsl(215_20%_45%)] hover:text-white hover:bg-[hsl(var(--sidebar-muted))]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <SidebarContent collapsed={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">

        <header className="h-14 bg-card border-b border-border sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 md:hidden hover:bg-muted rounded-lg text-muted-foreground"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
              <span className="font-medium">Popli Gate</span>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
              <span className="font-semibold text-primary">{activeItem?.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">


          <RefreshButton />

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-8 h-8 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all flex items-center justify-center"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative w-8 h-8 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all flex items-center justify-center"
            >
              <Bell className="w-4 h-4" />
            {(pendingReportsCount +
                tickets.filter((t) => t.status === 'open').length +
                transactions.filter((t) => t.type === 'withdrawal' && t.status === 'pending').length +
                (fraudStats?.highVolumeViewers?.length ?? 0)) > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-card" />
              )}
            </button>

            <div className="w-px h-5 bg-border hidden md:block mx-1" />

            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 h-8 px-2 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center overflow-hidden flex-shrink-0">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-white" />
                  )}
                </div>
                <div className="hidden md:flex flex-col items-start leading-none">
                  <span className="text-[12px] font-semibold text-foreground">{user?.name?.split(' ')[0] || 'Super Admin'}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    {user?.role?.replace('_', ' ') || 'ROOT_COMMAND'}
                  </span>
                </div>
              </button>

              <AnimatePresence>
                {isProfileMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsProfileMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 mt-1 w-48 z-20 bg-card border border-border rounded-xl shadow-xl py-1 origin-top-right"
                    >
                      <div className="px-3 py-2 border-b border-border">
                        <p className="text-[12px] font-semibold text-foreground truncate">{user?.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                      </div>
                      <div className="p-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign out</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <GlobalContextBar />

        <main className="flex-1 overflow-y-auto bg-background">
          <div className="p-4 md:p-6 max-w-screen-xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        <footer className="h-10 bg-card border-t border-border flex items-center justify-between px-4 md:px-6 flex-shrink-0">
     <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-muted-foreground font-medium">Live Feed Active</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground">Security Clearance:</span>
            <span className="text-[11px] font-semibold text-foreground uppercase">
              {user?.role?.replace('_', ' ') || 'Super Admin'}
            </span>
          </div>
        </footer>
      </div>

    

  <AnimatePresence>
        {isNotificationOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setIsNotificationOpen(false)} />
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60 }}
              transition={{ duration: 0.2 }}
              className="fixed top-0 right-0 w-[340px] h-full bg-card border-l border-border z-50 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-border flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[13px] text-foreground">Notifications</span>
                  {(() => {
                    const total =
                      reports.filter((r) => r.status === 'pending').length +
                      tickets.filter((t) => t.status === 'open').length +
                      transactions.filter((t) => t.type === 'withdrawal' && t.status === 'pending').length +
                      (fraudStats?.highVolumeViewers?.length ?? 0);
                    return total > 0 ? (
                      <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                        {total}
                      </span>
                    ) : null;
                  })()}
                </div>
                <button
                  onClick={() => setIsNotificationOpen(false)}
                  className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {(() => {
                  const pendingReports = reports.filter((r) => r.status === 'pending');
                  const openTickets = tickets.filter((t) => t.status === 'open');
                  const pendingWithdrawals = transactions.filter(
                    (t) => t.type === 'withdrawal' && t.status === 'pending'
                  );
                  const fraudAlerts = fraudStats?.highVolumeViewers ?? [];
                  const hasAny =
                    pendingReports.length > 0 ||
                    openTickets.length > 0 ||
                    pendingWithdrawals.length > 0 ||
                    fraudAlerts.length > 0;

                  if (!hasAny) {
                    return (
                      <div className="h-full flex flex-col items-center justify-center text-center py-12 px-6 space-y-2">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-1">
                          <ShieldAlert className="w-5 h-5 text-muted-foreground opacity-40" />
                        </div>
                        <span className="text-[13px] font-semibold text-foreground">No active alerts</span>
                        <p className="text-[12px] text-muted-foreground leading-relaxed">
                          System is running clean diagnostics.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="p-3 space-y-4">
                      {pendingReports.length > 0 && (
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground px-1 mb-2">
                            Moderation Reports
                          </p>
                          <div className="space-y-1.5">
                            {pendingReports.map((rep) => (
                              <div
                                key={rep.id}
                                onClick={() => { navigate('/moderation'); setIsNotificationOpen(false); }}
                                className="p-3 bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-xl space-y-1 cursor-pointer hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-red-600 dark:text-red-400">
                                    Report Pending
                                  </span>
                                  <span
                                    className={cn(
                                      'text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border',
                                      rep.severity === 'critical'
                                        ? 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20'
                                        : rep.severity === 'high'
                                        ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
                                        : 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20'
                                    )}
                                  >
                                    {rep.severity}
                                  </span>
                                </div>
                                <p className="text-[12px] text-foreground font-medium leading-snug line-clamp-1">
                                  {rep.reportReason}
                                </p>
                                <p className="text-[11px] text-muted-foreground line-clamp-1">
                                  {rep.targetTitle} · by @{rep.targetCreatorName}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {pendingWithdrawals.length > 0 && (
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground px-1 mb-2">
                            Pending Withdrawals
                          </p>
                          <div className="space-y-1.5">
                            {pendingWithdrawals.map((tx) => (
                              <div
                                key={tx.id}
                                onClick={() => { navigate('/monetization'); setIsNotificationOpen(false); }}
                                className="p-3 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-xl space-y-1 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-500/10 transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                                    Withdrawal Request
                                  </span>
                                  <span className="text-[11px] font-bold text-foreground">
                                    ₹{tx.rupees.toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-[12px] text-foreground font-medium">
                                  {tx.creatorName}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  @{tx.creatorUsername} · {tx.method}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {openTickets.length > 0 && (
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground px-1 mb-2">
                            Support Tickets
                          </p>
                          <div className="space-y-1.5">
                            {openTickets.map((ticket) => (
                              <div
                                key={ticket.id}
                                onClick={() => { navigate('/support'); setIsNotificationOpen(false); }}
                                className="p-3 bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 rounded-xl space-y-1 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-500/10 transition-colors"
                              >
                                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                                  Open Ticket
                                </span>
                                <p className="text-[12px] text-foreground font-medium line-clamp-1">
                                  {ticket.subject}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  @{ticket.userUsername} · {new Date(ticket.dateCreated).toLocaleDateString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {fraudAlerts.length > 0 && (
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground px-1 mb-2">
                            Fraud Alerts
                          </p>
                          <div className="space-y-1.5">
                            {fraudAlerts.map((alert, idx) => (
                              <div
                                key={idx}
                                onClick={() => { navigate('/fraud'); setIsNotificationOpen(false); }}
                                className="p-3 bg-purple-50 dark:bg-purple-500/5 border border-purple-200 dark:border-purple-500/20 rounded-xl space-y-1 cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-500/10 transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                                    View Farming Detected
                                  </span>
                                  <span
                                    className={cn(
                                      'text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border',
                                      alert.riskLevel === 'critical'
                                        ? 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20'
                                        : 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
                                    )}
                                  >
                                    {alert.riskLevel}
                                  </span>
                                </div>
                                <p className="text-[12px] text-foreground font-mono line-clamp-1">
                                  {alert.deviceId}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  {alert.viewCount.toLocaleString()} views in 24h
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
</div>
    </PageRefreshProvider>
  );
};