import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { loginStart, loginSuccess, loginFailure } from '@/redux/slices/authSlice';
import { adminService } from '@/services/adminService';
import { Play, Lock, Mail, Loader2, Eye, EyeOff, Radio } from 'lucide-react';
import { motion } from 'framer-motion';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isLocalLoading, setIsLocalLoading] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { error } = useAppSelector(state => state.auth);
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

      dispatch(loginSuccess({
        user: { ...data.user, role: mappedRole },
        token: data.token
      }));
      setIsLocalLoading(false);
      navigate('/');
    } catch (err: any) {
      dispatch(loginFailure(err.response?.data?.message || 'Invalid credentials.'));
      setIsLocalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex text-foreground selection:bg-primary/20 font-sans">
      
      {/* 🎨 Left Branding Side (Glassmorphism Cyberpunk Grid) */}
      <div className="hidden lg:flex lg:w-1/2 bg-card border-r border-border relative overflow-hidden items-center justify-center p-12">
        {/* Subtle Cyber Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:32px_32px] opacity-15" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-secondary/5 blur-3xl" />
        
        <div className="relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted border border-border mb-8 shadow-sm">
            <Radio className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground font-bold">System Command v1.0.8</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none mb-6 font-display">
            POPLI <br />
            <span className="text-primary uppercase font-mono">Control Center</span>
          </h1>
          
          <p className="text-muted-foreground text-sm leading-relaxed mb-10 normal-case">
            Enterprise-grade governance, hyperlocal virality sliders, coin economy distribution, and real-time behavioral moderation dashboard for the Indian creator ecosystem.
          </p>
          
          <div className="grid grid-cols-2 gap-6 pt-8 border-t border-border font-mono">
            <div>
              <h4 className="text-lg text-foreground font-black tracking-tight">100+ CREATORS</h4>
              <p className="text-muted-foreground/80 text-[10px] uppercase mt-0.5">Indian regional hubs</p>
            </div>
            <div>
              <h4 className="text-lg text-primary font-black tracking-tight">BOT SHIELD</h4>
              <p className="text-muted-foreground/80 text-[10px] uppercase mt-0.5">Real-time fraud guard</p>
            </div>
          </div>
        </div>
      </div>

      {/* 🔐 Right Login Side */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 md:px-20 xl:px-32 py-12 bg-background/50">
        <div className="max-w-md w-full mx-auto space-y-8">
          
          {/* Header Text */}
          <div className="text-center lg:text-left">
            <div className="lg:hidden bg-primary/10 text-primary w-12 h-12 mx-auto rounded-xl border border-primary/25 flex items-center justify-center shadow-md mb-4">
              <Play className="w-6 h-6 fill-current text-primary" />
            </div>
            <h2 className="text-3xl font-black tracking-tight font-display text-foreground">Access Control System</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Provide credentials to access the POPLI operations panel
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/5 border border-red-500/20 rounded-xl p-3.5 text-xs font-mono text-red-500 text-center flex items-center gap-2 justify-center"
            >
              <span className="bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[10px]">!</span>
              {error}
            </motion.div>
          )}

          {/* Credentials Form */}
          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-0.5 font-mono">Operator ID (Email)</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/60" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@popli.com"
                  required
                  className="w-full h-11 bg-card border border-border rounded-xl pl-11 pr-4 text-sm text-foreground placeholder-muted-foreground/50 outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary transition-all font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-0.5 font-mono">Access Key</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/60" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full h-11 bg-card border border-border rounded-xl pl-11 pr-10 text-sm text-foreground placeholder-muted-foreground/50 outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary transition-all font-mono"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLocalLoading}
              className="w-full h-11 bg-primary text-white font-extrabold rounded-xl shadow-md shadow-primary/20 hover:bg-primary/95 disabled:opacity-60 transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] mt-2 font-mono uppercase tracking-wider text-xs cursor-pointer"
            >
              {isLocalLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Connecting Secure...</span>
                </>
              ) : (
                <span>Initialize Session</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
