import React from 'react';
import { usePlatformStore } from '../store/usePlatformStore';
import { MapPin, Check, Wifi, AlertTriangle, ShieldCheck } from 'lucide-react';

const CITIES = [
  { id: 'all', name: 'All India' },
  { id: 'mumbai', name: 'Mumbai' },
  { id: 'delhi', name: 'Delhi' },
  { id: 'bengaluru', name: 'Bengaluru' },
  { id: 'lucknow', name: 'Lucknow' },
  { id: 'jaipur', name: 'Jaipur' },
  { id: 'indore', name: 'Indore' },
  { id: 'madurai', name: 'Madurai' }
];

export const GlobalContextBar: React.FC = () => {
  const { botAttackActive, creators, reels } = usePlatformStore();

  // We will keep a local state or ref to allow selecting active city context globally
  // and make sure we can trigger simple updates. For simplicity, we can read/write city filters
  // or just use it as a gorgeous context indicator. Let's make it highly interactive by saving 
  // the selected city into a window global or just styling it.
  const [selectedCity, setSelectedCity] = React.useState('all');

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(e.target.value);
    // Expose as window global or standard context trigger so pages can read it!
    (window as any).__popli_active_city_filter = e.target.value;
    // Dispatch a dummy event so active listeners update!
    window.dispatchEvent(new CustomEvent('popli_city_changed', { detail: e.target.value }));
  };

  const activeCityName = CITIES.find(c => c.id === selectedCity)?.name || 'All India';

  // Stats summaries
  const totalUsers = creators.length;
  const totalReels = reels.length;

  return (
    <div className="bg-card border-t border-b border-border text-muted-foreground text-[10px] px-6 py-2 flex flex-col md:flex-row items-start md:items-center gap-4 select-none font-mono">
      <div className="flex items-center gap-1.5 text-primary font-black tracking-widest uppercase shrink-0">
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        POPLI OPERATIONS SCOPE:
      </div>

      <div className="flex flex-wrap gap-4 flex-1 items-center w-full">
        {/* City/Geo Context Selector */}
        <div className="flex items-center gap-1.5 bg-muted border border-border px-2 py-0.5 rounded-[2px] hover:border-primary/40 transition-colors">
          <MapPin className="h-3 w-3 text-primary" />
          <select 
            value={selectedCity}
            onChange={handleCityChange}
            className="bg-transparent border-none outline-none text-foreground font-bold text-[10px] pr-1 cursor-pointer font-mono uppercase"
          >
            {CITIES.map(c => (
              <option key={c.id} value={c.id} className="text-foreground bg-card font-bold">{c.name}</option>
            ))}
          </select>
        </div>

        {/* Live System Performance Statistics */}
        <div className="hidden sm:flex items-center gap-4 text-[9px] font-semibold text-muted-foreground">
          <div className="flex items-center gap-1">
            <span>CREATORS:</span>
            <span className="text-foreground">{totalUsers}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>REELS STREAM:</span>
            <span className="text-foreground">{totalReels} ACTIVE</span>
          </div>
          <div className="flex items-center gap-1">
            <Wifi className="h-2.5 w-2.5 text-primary" />
            <span>PING:</span>
            <span className="text-foreground font-mono">34ms (STABLE)</span>
          </div>
        </div>

        {/* Alert status indicators based on bot simulation */}
        <div className="md:ml-auto flex items-center gap-2">
          {botAttackActive ? (
            <div className="flex items-center gap-1.5 bg-destructive/10 border border-destructive/50 text-destructive font-bold uppercase px-2 py-0.5 rounded-[2px] animate-pulse">
              <AlertTriangle className="h-3 w-3" /> 
              THREAT INDEX: HIGH (BOT INTRUSION)
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-success/10 border border-success/30 text-success font-bold uppercase px-2 py-0.5 rounded-[2px]">
              <ShieldCheck className="h-3 w-3 text-success" />
              SHIELD STATUS: SECURE (LIVE FEED ACTIVE)
            </div>
          )}
          
          <div className="hidden md:flex items-center gap-1.5 bg-muted border border-border text-muted-foreground font-bold uppercase px-2 py-0.5 rounded-[2px]">
            <Check className="h-2.5 w-2.5 text-primary" /> 
            <span>{activeCityName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};