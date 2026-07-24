import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { loginStart, loginSuccess, loginFailure } from '@/redux/slices/authSlice';
import { adminService } from '@/services/adminService';
import { Lock, Mail, Loader2, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';

interface PlatformStats {
  totalCreators: number;
  totalReels: number;
  suspiciousUsersBlocked: number;
  totalCoinRevenue: number;
}

const formatStatNumber = (num: number): string => {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toString();
};

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { error } = useAppSelector((state) => state.auth);

useEffect(() => {
    const savedEmail = localStorage.getItem('remember_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = stored === 'dark' || (!stored && prefersDark);
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  useEffect(() => {
    const styleId = 'login-input-theme';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .login-field {
        background-color: hsl(var(--muted)) !important;
        color: hsl(var(--foreground)) !important;
        border-color: hsl(var(--border)) !important;
      }
      .login-field::placeholder {
        color: hsl(var(--muted-foreground) / 0.6) !important;
      }
      .login-field:-webkit-autofill,
      .login-field:-webkit-autofill:hover,
      .login-field:-webkit-autofill:focus {
        -webkit-box-shadow: 0 0 0 1000px hsl(var(--muted)) inset !important;
        -webkit-text-fill-color: hsl(var(--foreground)) !important;
        caret-color: hsl(var(--foreground)) !important;
        border-color: hsl(var(--border)) !important;
      }
    `;
    document.head.appendChild(style);
    return () => { document.getElementById(styleId)?.remove(); };
  }, []);

useEffect(() => {
    adminService.getPublicPlatformStats()
      .then((data) => setPlatformStats(data))
      .catch(() => {});
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLocalLoading(true);
    dispatch(loginStart());

    try {
      const data = await adminService.login(email, password);

      let mappedRole = 'super_admin';
      if (data.user?.role) {
        mappedRole = data.user.role === 'ADMIN' ? 'super_admin' : data.user.role.toLowerCase();
      }

   if (rememberMe) {
        localStorage.setItem('remember_email', email);
      } else {
        localStorage.removeItem('remember_email');
      }
      dispatch(loginSuccess({ user: { ...data.user, role: mappedRole }, token: data.token }));
      setIsLocalLoading(false);
      navigate('/');
    } catch (err: any) {
      dispatch(loginFailure(err.response?.data?.message || 'Invalid credentials.'));
      setIsLocalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">

      <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4">
  <div className="flex items-center gap-2.5">
          <img
            src="/src/assets/adaptive-icon.png"
            alt="POPLI"
            className="w-8 h-8 rounded-lg object-cover"
          />
          <span className="text-[13px] font-semibold text-foreground tracking-tight hidden sm:block">
            POPLI Admin
          </span>
        </div>

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-9 h-9 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex items-center justify-center"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </header>

      <main className="flex flex-1 min-h-screen">

        <section className="hidden lg:flex lg:w-[45%] bg-card border-r border-border relative overflow-hidden items-center justify-center p-16">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 0% 0%, hsl(221 83% 53%) 0, transparent 50%), radial-gradient(circle at 100% 100%, hsl(220 14% 93%) 0, transparent 50%)',
            }}
          />
          <div className="absolute top-[-8%] left-[-8%] w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-8%] right-[-8%] w-72 h-72 rounded-full bg-muted/30 blur-3xl pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative z-10 max-w-sm w-full"
          >
            <div className="mb-10">
         <div className="w-14 h-14 rounded-2xl overflow-hidden mb-8">
                <img
                  src="/src/assets/adaptive-icon.png"
                  alt="POPLI"
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="text-[2.25rem] font-bold leading-tight tracking-tight text-foreground mb-2">
                POPLI Operations
              </h1>
              <p className="text-primary font-semibold text-xl leading-snug mb-6">
                Enterprise Operations Platform
              </p>
              <p className="text-muted-foreground text-[15px] leading-relaxed">
                Securely manage creators, moderation, monetization, campaigns, analytics, payouts,
                and platform operations from one centralized workspace.
              </p>
            </div>

     <div className="grid grid-cols-2 gap-4 pt-8 border-t border-border">
              {[
                {
                  label: platformStats ? formatStatNumber(platformStats.totalCreators) + ' Creators' : '— Creators',
                  sub: 'Registered on platform',
                },
                {
                  label: platformStats ? formatStatNumber(platformStats.suspiciousUsersBlocked) + ' Blocked' : '— Blocked',
                  sub: 'Fraud & bot accounts',
                  accent: true,
                },
                {
                  label: platformStats ? formatStatNumber(platformStats.totalReels) + ' Reels' : '— Reels',
                  sub: 'Total content uploaded',
                },
                {
                  label: platformStats ? '₹' + formatStatNumber(platformStats.totalCoinRevenue) + ' Revenue' : '— Revenue',
                  sub: 'Coin economy total',
                },
              ].map((item) => (
                <div key={item.label} className="space-y-0.5">
                  <p className={cn('text-[13px] font-semibold', item.accent ? 'text-primary' : 'text-foreground')}>
                    {item.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{item.sub}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="flex-1 flex items-center justify-center p-6 md:p-12 bg-background relative">
          <div className="md:hidden absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle at 0% 0%, hsl(221 83% 53%) 0, transparent 50%)',
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
            className="w-full max-w-[440px] z-10"
          >
            <div className="bg-card border border-border rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-8">

              <div className="mb-8">
                <div className="lg:hidden flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-xl overflow-hidden">
                    <img
                      src="/src/assets/adaptive-icon.png"
                      alt="POPLI"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="font-semibold text-foreground text-sm">POPLI Admin</span>
                </div>

                <h2 className="text-[1.5rem] font-semibold text-foreground tracking-tight mb-1">
                  Welcome Back
                </h2>
                <p className="text-muted-foreground text-[14px]">
                  Enter your credentials to access the admin panel.
                </p>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    className="mb-5 overflow-hidden"
                  >
                    <div className="flex items-center gap-2.5 bg-destructive/5 border border-destructive/20 rounded-lg px-3.5 py-2.5">
                      <span className="w-4 h-4 rounded-full bg-destructive flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white">
                        !
                      </span>
                      <span className="text-[12px] text-destructive">{error}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form className="space-y-4" onSubmit={handleLogin}>
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-medium text-foreground" htmlFor="email">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      required
                      className="login-field w-full h-11 bg-muted border border-border rounded-lg pl-10 pr-4 text-[14px] text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[13px] font-medium text-foreground" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                      className="login-field w-full h-11 bg-muted border border-border rounded-lg pl-10 pr-11 text-[14px] text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all [color-scheme:light] dark:[color-scheme:dark]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                 <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-border bg-muted text-primary focus:ring-2 focus:ring-ring/20 transition-all [color-scheme:light] dark:[color-scheme:dark]"
                    />
                    <span className="text-[13px] text-muted-foreground group-hover:text-foreground transition-colors">
                      Remember me
                    </span>
                  </label>
                  <a
                    href="#"
                    className="text-[13px] text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={isLocalLoading}
                  className="w-full h-11 bg-primary text-white font-medium text-[14px] rounded-lg hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  {isLocalLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              <div className="relative my-7">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                
              </div>

            
            </div>

            <p className="mt-6 text-center text-[12px] font-mono text-muted-foreground">
              POPLI Operations v2.4.0
            </p>
          </motion.div>
        </section>
      </main>

      <footer className="absolute bottom-0 left-0 right-0 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-8 py-4 z-50">
        <span className="text-[11px] font-mono text-muted-foreground">Version 2.4.0</span>
        <span className="text-muted-foreground/30 hidden sm:inline text-xs">|</span>
        <a href="#" className="text-[12px] text-muted-foreground hover:text-primary transition-colors">
          Privacy Policy
        </a>
        <span className="text-muted-foreground/30 hidden sm:inline text-xs">|</span>
        <a href="#" className="text-[12px] text-muted-foreground hover:text-primary transition-colors">
          Terms of Service
        </a>
        <span className="text-muted-foreground/30 hidden sm:inline text-xs">|</span>
        <span className="text-[12px] text-muted-foreground/60">
          © 2024 POPLI Operations. All rights reserved.
        </span>
      </footer>
    </div>
  );
};