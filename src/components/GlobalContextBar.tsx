import React from 'react';
import { usePlatformStore } from '../store/usePlatformStore';
import { Wifi, AlertTriangle, ShieldCheck } from 'lucide-react';

export const GlobalContextBar: React.FC = () => {
 const { botProtectionEnabled, creators, reels } = usePlatformStore();
const [ping, setPing] = React.useState<number | null>(null);

  React.useEffect(() => {
    const measure = async () => {
      const start = performance.now();
      try {
        await fetch('/api/health', { method: 'HEAD', cache: 'no-store' }).catch(() =>
          fetch(import.meta.env.VITE_API_URL || '', { method: 'HEAD', cache: 'no-store' })
        );
      } catch {
      } finally {
        const ms = Math.round(performance.now() - start);
        setPing(ms);
      }
    };
    measure();
    const interval = setInterval(measure, 30000);
    return () => clearInterval(interval);
  }, []);

const totalUsers = creators.filter((c) => c.status !== 'suspended').length;
  const totalReels = reels.length;

  return (
<div className="h-10 bg-card border-b border-border flex items-center px-4 md:px-6 gap-4 flex-shrink-0 select-none overflow-x-auto">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="hidden sm:flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground">Creators:</span>
            <span className="text-[11px] font-semibold text-foreground">{totalUsers}</span>
          </div>
          <div className="w-px h-3 bg-border" />
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground">Reels Stream:</span>
            <span className="text-[11px] font-semibold text-foreground">{totalReels} Active</span>
          </div>
          <div className="w-px h-3 bg-border" />
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3 h-3 text-emerald-500" />
            <span className="text-[11px] text-muted-foreground">Ping:</span>
       <span className="text-[11px] font-semibold text-foreground font-mono">
              {ping != null ? `${ping}ms` : '—'}
            </span>
          </div>
</div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
     {botProtectionEnabled ? (
          <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-[11px] font-semibold px-2.5 h-7 rounded-lg animate-pulse">
            <AlertTriangle className="w-3 h-3" />
            <span>Threat Index: High</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold px-2.5 h-7 rounded-lg">
            <ShieldCheck className="w-3 h-3" />
            <span className="hidden sm:inline">Shield Status: Secure (Live Feed Active)</span>
            <span className="sm:hidden">Secure</span>
          </div>
        )}
      </div>
    </div>
  );
};