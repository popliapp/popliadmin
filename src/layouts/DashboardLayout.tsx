import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { logout } from '@/redux/slices/authSlice';
import { NAVIGATION_ITEMS } from '@/constants/navigation';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { GlobalContextBar } from '@/components/GlobalContextBar';
import { usePlatformStore } from '@/store/usePlatformStore';
import { 
  Menu, 
  X, 
  LogOut, 
  Bell, 
  ChevronRight,
  User,
  ArrowRightLeft,
  Tv,
  AlertTriangle,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

export const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [systemTime, setSystemTime] = useState(new Date().toLocaleTimeString());
  
  // Theme Dark/Light Mode state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('popli-theme');
      return savedTheme === 'dark' || 
        (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  // Zustand Store variables
  const { botAttackActive, toggleBotAttack, simulateLiveTicks, reports, fetchAllData } = usePlatformStore();

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Sync theme to document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('popli-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('popli-theme', 'light');
    }
  }, [isDarkMode]);

  // Live timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setSystemTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Periodic simulated platform ticks
  useEffect(() => {
    const tickInterval = setInterval(() => {
      simulateLiveTicks();
    }, 3000);
    return () => clearInterval(tickInterval);
  }, [simulateLiveTicks]);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Operations operator session terminated.");
    navigate('/login');
  };

  // Filter items based on active user role
  const filteredNavItems = NAVIGATION_ITEMS.filter(
    item => !item.roles || (user && item.roles.includes(user.role))
  );

  // Determine breadcrumb from location
  const activeItem = NAVIGATION_ITEMS.find(item => item.path === location.pathname) || 
                     NAVIGATION_ITEMS.find(item => location.pathname.startsWith(item.path)) || 
                     NAVIGATION_ITEMS[0];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const pendingReportsCount = reports.filter(r => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-background flex text-foreground overflow-hidden selection:bg-primary/20 font-sans relative">
      
      {/* 🖥️ Desktop Sidebar Navigation */}
      <motion.aside 
        animate={{ width: isSidebarOpen ? 270 : 76 }}
        transition={{ duration: 0.3, ease: [0.25, 0.8, 0.25, 1] }}
        className={cn(
          "hidden md:flex flex-col h-screen bg-card border-r border-border sticky top-0 left-0 z-20 flex-shrink-0 shadow-lg select-none"
        )}
      >
        {/* Desktop Header Brand Area */}
        <div className="h-16 flex items-center px-5 justify-between border-b border-border overflow-hidden whitespace-nowrap">
          <Link to="/" className="flex items-center gap-3 active:scale-95 transition-transform">
            <div className="bg-primary text-white p-2 rounded-xl shadow-md flex items-center justify-center font-black">
              <Tv className="w-4 h-4 text-white" />
            </div>
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col select-none"
              >
                <span className="font-display font-extrabold text-foreground text-base tracking-wider uppercase leading-none">POPLI</span>
                <span className="text-[8px] font-bold text-muted-foreground tracking-widest uppercase mt-1">ADMIN COMMAND</span>
              </motion.div>
            )}
          </Link>
        </div>

        {/* Scrollable Sidebar Items */}
        <nav className="flex-1 py-4 overflow-y-auto px-3 space-y-1 custom-scrollbar scroll-smooth">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "group flex items-center h-10 transition-all duration-200 select-none rounded-xl",
                  isSidebarOpen ? "px-3.5" : "justify-center px-0",
                  isActive 
                    ? "bg-primary text-white font-semibold shadow-md shadow-primary/20" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className={cn("w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-muted-foreground group-hover:text-primary")} />
                
                {isSidebarOpen && (
                  <motion.span 
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="ml-3 text-[11px] font-medium uppercase tracking-wide truncate"
                  >
                    {item.title}
                  </motion.span>
                )}
                
                {isSidebarOpen && item.path === '/moderation' && pendingReportsCount > 0 && (
                  <span className={cn(
                    "ml-auto text-[9px] px-2 py-0.5 font-bold rounded-lg",
                    isActive ? "bg-white text-primary" : "bg-red-500/10 text-red-500 border border-red-500/20"
                  )}>
                    {pendingReportsCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Trigger Button at bottom */}
        <div className="p-3 border-t border-border bg-muted/30">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center h-9 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors px-3 justify-center md:justify-start rounded-xl text-[10px] uppercase tracking-wider"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 flex-shrink-0" />
            {isSidebarOpen && <span className="ml-3 font-semibold">Tuck Sidebar</span>}
          </button>
        </div>
      </motion.aside>

      {/* 📱 Mobile Sidebar Drawer (Overlay) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col h-full shadow-2xl md:hidden"
            >
              <div className="h-16 flex items-center justify-between px-5 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="bg-primary text-white p-2 rounded-xl shadow-md">
                    <Tv className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-display font-extrabold tracking-wider uppercase text-foreground">POPLI CONTROL</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-muted rounded-xl text-muted-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {filteredNavItems.map((item) => {
                  const isActive = location.pathname === item.path || 
                    (item.path !== '/' && item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center h-11 px-3.5 transition-colors rounded-xl text-[11px] uppercase tracking-wide",
                        isActive ? "bg-primary text-white font-semibold shadow-md shadow-primary/25" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 🏢 Main Viewer Screen Layout */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background relative">
        
        {/* 🌐 Top Navigation Header */}
        <header className="h-16 bg-card/85 backdrop-blur-md border-b border-border sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 flex-shrink-0 select-none">
          <div className="flex items-center gap-3 md:gap-6">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 md:hidden hover:bg-muted rounded-xl text-muted-foreground active:scale-95"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Breadcrumbs */}
            <div className="flex items-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
              <span className="hover:text-foreground transition-colors">POPLI GATE</span>
              <ChevronRight className="w-3.5 h-3.5 mx-1 flex-shrink-0 text-muted-foreground/60" />
              <span className="text-primary truncate">{activeItem?.title}</span>
            </div>
          </div>

          {/* Top Navbar Controls Area */}
          <div className="flex items-center gap-3">
            
            {/* Live Clock */}
            <div className="hidden lg:block text-[10px] font-bold text-muted-foreground font-mono tracking-widest select-none bg-muted/65 border border-border px-3 py-1.5 rounded-xl">
              CLOCK: <span className="text-foreground">{systemTime}</span>
            </div>

            {/* Dev Simulator: Bot Attack Button */}
            <button
              onClick={() => {
                toggleBotAttack();
                if (!botAttackActive) {
                  toast.error("ALERT: BOT ATTACK SIMULATION ACTIVATED!", {
                    icon: '🚨',
                    style: { background: '#7f1d1d', color: '#fca5a5', border: '1px solid #ef4444' }
                  });
                } else {
                  toast.success("Security Shield restored. Bot traffic filtered.", {
                    icon: '🛡️'
                  });
                }
              }}
              className={cn(
                "hidden sm:flex items-center gap-2 h-9 px-3.5 text-[9px] font-bold font-mono tracking-wider uppercase transition-all rounded-xl border",
                botAttackActive
                  ? "bg-red-500 text-white animate-pulse border-transparent shadow-lg shadow-red-500/20"
                  : "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
              )}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{botAttackActive ? "HALT BOT ATTACK" : "LAUNCH BOT ATTACK"}</span>
            </button>

            {/* 🌗 Premium Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-95 flex items-center justify-center bg-card"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : (
                <Moon className="w-4 h-4 text-primary" />
              )}
            </button>

            {/* Notification Alert Popover */}
            <button 
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2.5 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-95"
            >
              <Bell className="w-4 h-4" />
              {pendingReportsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-card animate-pulse" />
              )}
            </button>

            <div className="w-px h-6 bg-border hidden md:block" />

            {/* 👤 Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-border bg-card hover:bg-muted transition-colors select-none active:scale-95"
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-6 h-6 rounded-full object-cover border border-border" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
                <span className="hidden md:block text-[10px] font-bold font-mono uppercase tracking-wider text-foreground">
                  {user?.name.split(' ')[0]} ({user?.role.replace('_', ' ')})
                </span>
              </button>

              {/* Account Popover Dropdown */}
              <AnimatePresence>
                {isProfileMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsProfileMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-1.5 w-52 z-20 bg-card border border-border rounded-xl shadow-2xl py-1 font-mono uppercase text-[9px] tracking-wider origin-top-right"
                    >
                      <div className="px-4 py-2.5 border-b border-border">
                        <p className="text-foreground font-extrabold truncate">{user?.name}</p>
                        <p className="text-muted-foreground text-[8px] truncate mt-1">{user?.email}</p>
                      </div>
                      <div className="p-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors text-left"
                        >
                          <LogOut className="w-3.5 h-3.5 text-red-500" />
                          <span>Close Session</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

          </div>
        </header>

        {/* Dynamic multi-city selector sub-header */}
        <GlobalContextBar />

        {/* 🖥️ Main Workspace Scroll injection Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background custom-scrollbar relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              className="h-full max-w-7xl mx-auto flex flex-col"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <RoleSwitcher />

      {/* Notifications Panel Pop */}
      <AnimatePresence>
        {isNotificationOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-black/25 dark:bg-black/50" onClick={() => setIsNotificationOpen(false)} />
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="fixed top-0 right-0 w-80 h-full bg-card border-l border-border z-50 p-5 shadow-2xl flex flex-col font-mono"
            >
              <div className="flex items-center justify-between border-b border-border pb-4 mb-4 select-none">
                <span className="font-extrabold text-primary uppercase text-xs tracking-widest font-display">Incident Notifications</span>
                <button onClick={() => setIsNotificationOpen(false)} className="p-2 hover:bg-muted rounded-xl text-muted-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar text-[10px]">
                {pendingReportsCount > 0 ? (
                  reports.filter(r => r.status === 'pending').map((rep) => (
                    <div key={rep.id} className="p-3.5 bg-red-500/5 border border-red-500/20 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-red-500">
                        <span>CRITICAL INCIDENT</span>
                        <span className="uppercase text-[8px] bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-md">{rep.severity}</span>
                      </div>
                      <p className="text-foreground font-bold tracking-tight uppercase leading-snug">{rep.reportReason}</p>
                      <p className="text-muted-foreground text-[8px] mt-1">
                        REEL: {rep.targetTitle.substring(0, 30)}... BY {rep.targetCreatorName}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground uppercase select-none py-12 space-y-2.5">
                    <span className="text-2xl">🛡️</span>
                    <span className="font-bold font-display text-xs text-foreground">Zero active threats</span>
                    <p className="text-[8px] font-normal leading-normal px-6 normal-case text-muted-foreground/80">System intelligence scans are performing clean sweep diagnostic checks.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};
