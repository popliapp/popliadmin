import React, { useState } from 'react';
import { usePlatformStore } from '../store/usePlatformStore';
import { 
  Sliders, 
  MapPin, 
  Smile, 
  Compass, 
  Zap, 
  ShieldCheck, 
  Sparkles,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';

export const FeedControlPage: React.FC = () => {
  const { recommendationWeights, setWeights, saveWeights, reels } = usePlatformStore();

  const [activeSubTab, setActiveSubTab] = useState<'recommender' | 'simulation' | 'boost'>('recommender');
  const [boostType, setBoostType] = useState<'hashtag' | 'category' | 'creator'>('hashtag');
  const [boostTarget, setBoostTarget] = useState('');
  const [boostIntensity, setBoostIntensity] = useState(50);
  const [simulatedGenre, setSimulatedGenre] = useState<'comedy' | 'dance' | 'food' | 'music'>('comedy');

  const handleWeightChange = (key: keyof typeof recommendationWeights, value: number) => {
    setWeights({ [key]: value });
  };

  const handleApplyWeights = async () => {
    const toastId = toast.loading('Injecting weights to core engine...', { icon: '⚙️' });
    try {
      await saveWeights();
      toast.success("POPLI algorithm recommendation weights injected successfully!", {
        id: toastId,
        icon: '🧠',
      });
    } catch (e) {
      toast.error('Failed to inject algorithmic weights.', { id: toastId, icon: '❌' });
    }
  };

  const handleTriggerBoost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!boostTarget) return;
    toast.success(`BOOST ACTIVE: [${boostTarget.toUpperCase()}] boosted at intensity ${boostIntensity}%!`, {
      icon: '🚀'
    });
    setBoostTarget('');
  };

  const simulatedFeed = reels
    .filter(r => r.category === simulatedGenre)
    .slice(0, 4);

  return (
    <div className="space-y-6 font-mono relative text-[10px] text-muted-foreground uppercase select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-4 gap-4">
        <div>
          <h1 className="text-xl font-extrabold uppercase tracking-wider text-foreground">Feed Control Center</h1>
          <p className="text-muted-foreground text-[10px] uppercase mt-1">Operational command panel for POPLI viral acceleration loops</p>
        </div>

        {/* Sub tabs */}
        <div className="flex bg-card border border-border p-0.5 rounded-[2px] self-stretch sm:self-auto select-none">
          {([
            { id: 'recommender', label: 'RECOMMENDER MODULE' },
            { id: 'simulation', label: 'FEED SIMULATOR' },
            { id: 'boost', label: 'BOOST INJECTOR' }
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={cn(
                "px-3 py-1.5 text-[9px] font-bold tracking-wider transition-colors rounded-[1px] uppercase",
                activeSubTab === tab.id 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeSubTab === 'recommender' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sliders panel */}
          <div className="bg-card border border-border p-5 rounded-[2px] lg:col-span-2 space-y-5">
            <span className="text-xs font-extrabold uppercase tracking-widest block text-foreground">RECOMMENDATION COEFFICIENTS</span>
            
            <div className="space-y-5">
              {[
                { key: 'watchTimeWeight', label: 'Watch completion priority', desc: 'Throttles or boosts high retention reels', icon: Clock, max: 100 },
                { key: 'shareWeight', label: 'Share loop acceleration', desc: 'Prioritizes peer-to-peer sharing loops', icon: Compass, max: 100 },
                { key: 'nearbyWeight', label: 'Hyperlocal proximity index', desc: 'Weights video distance from creator node', icon: MapPin, max: 100 },
                { key: 'commentWeight', label: 'Engagement interaction score', desc: 'Filters for conversation density', icon: Sliders, max: 100 },
                { key: 'moodWeight', label: 'Psychology mood resonance', desc: 'Evokes mood triggers in feed pipelines', icon: Smile, max: 100 }
              ].map((slider) => {
                const Icon = slider.icon;
                const value = recommendationWeights[slider.key as keyof typeof recommendationWeights];
                return (
                  <div key={slider.key} className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="flex items-center gap-1.5 text-foreground">
                        <Icon className="w-4 h-4 text-primary" />
                        {slider.label}
                      </span>
                      <span className="text-primary font-mono">{value}%</span>
                    </div>
                    <div className="flex gap-4 items-center">
                      <input
                        type="range"
                        min="0"
                        max={slider.max}
                        value={value}
                        onChange={(e) => handleWeightChange(slider.key as keyof typeof recommendationWeights, parseInt(e.target.value))}
                        className="flex-1 h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary border border-border"
                      />
                    </div>
                    <span className="text-muted-foreground text-[8px] block font-normal leading-none">{slider.desc}</span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleApplyWeights}
              className="w-full h-10 bg-primary text-primary-foreground font-extrabold rounded-[1px] hover:bg-primary/90 transition-colors font-mono tracking-widest text-xs uppercase"
            >
              INJECT ALGORITHMIC WEIGHTS INTO CORE ENGINE
            </button>
          </div>

          {/* score card */}
          <div className="bg-card border border-border p-5 rounded-[2px] flex flex-col justify-between">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest block text-foreground mb-4">RECOMMENDER SCORE CARD</span>
              
              <div className="space-y-4">
                {[
                  { title: 'Feeds Injector Speed', value: '42K items/sec', desc: 'Real-time pipeline index velocity' },
                  { title: 'Recommender Latency', value: '11ms', desc: 'Microsecond query routing' },
                  { title: 'Mood retention ratio', value: '84.2%', desc: 'Creators hook loop coefficient' },
                  { title: 'Local proximity loops', value: '9,203 active', desc: 'Hyperlocal city connections' }
                ].map((score, i) => (
                  <div key={i} className="p-3 bg-muted border border-border rounded-[2px]">
                    <span className="text-muted-foreground block leading-none">{score.title}</span>
                    <span className="text-primary text-sm font-black mt-1.5 block tracking-tight">{score.value}</span>
                    <span className="text-muted-foreground text-[8px] font-normal block mt-1 leading-none">{score.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-success/10 border border-success/30 text-success font-bold uppercase px-3 py-1.5 rounded-[1px] mt-4">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              <span>ALGO SHIELD STATUS: SECURED</span>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'simulation' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Simulation controller */}
          <div className="bg-card border border-border p-5 rounded-[2px] space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest block text-foreground">SIMULATE ACTIVE PIPELINE</span>
            
            <div className="space-y-2.5">
              <span className="text-muted-foreground block">SELECT GENRE INJECTOR:</span>
              <div className="grid grid-cols-2 gap-2 text-[9px] font-bold">
                {([
                  { id: 'comedy', label: 'COMEDY SHORTS' },
                  { id: 'dance', label: 'DANCE CONTEST' },
                  { id: 'food', label: 'FOOD TRAILS' },
                  { id: 'music', label: 'VERNACULAR FOLK' }
                ] as const).map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => setSimulatedGenre(genre.id)}
                    className={cn(
                      "h-9 px-3 transition-colors rounded-[1px] border uppercase",
                      simulatedGenre === genre.id 
                        ? "bg-primary text-primary-foreground font-extrabold" 
                        : "hover:bg-muted hover:text-primary text-muted-foreground border-border"
                    )}
                  >
                    {genre.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-muted border border-border rounded-[2px] space-y-1 mt-4 text-[9px] font-normal leading-normal">
              <div className="flex gap-1.5 items-center font-bold text-foreground mb-1.5 uppercase">
                <Sparkles className="w-3.5 h-3.5 text-primary" /> ALGO EXPLAINER
              </div>
              <p>Injected genre sets prioritizations on feed pipelines.</p>
              <p className="mt-1">Hyperlocal creators within 15km of viewer node get +20% boost acceleration coefficients.</p>
            </div>
          </div>

          {/* Visual simulation preview grid */}
          <div className="bg-card border border-border p-5 rounded-[2px] lg:col-span-2 space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest block text-foreground">FEED SIMULATOR PREVIEW</span>
            
            <div className="grid grid-cols-2 gap-4">
              {simulatedFeed.map((reel) => (
                <div key={reel.id} className="p-3 bg-muted border border-border rounded-[1px] flex flex-col justify-between gap-3">
                  <div className="flex justify-between items-start">
                    <div className="max-w-[140px] truncate">
                      <span className="text-foreground font-extrabold block truncate">{reel.title}</span>
                      <span className="text-muted-foreground font-normal block mt-0.5 truncate leading-none select-all lowercase">@{reel.creatorUsername}</span>
                    </div>
                    <span className="bg-accent border border-border text-primary text-[8px] font-black px-1.5 py-0.5 uppercase rounded-[1px] font-mono leading-none">
                      {reel.category}
                    </span>
                  </div>
                  
                  {/* Stats line */}
                  <div className="flex justify-between items-center border-t border-border pt-2 text-[8px] text-muted-foreground font-mono">
                    <span>VIEWS: <span className="text-foreground font-bold">{reel.views.toLocaleString()}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'boost' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Boost input form */}
          <div className="bg-card border border-border p-5 rounded-[2px] space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest block text-foreground">BOOST SLOT MANAGER</span>
            
            <form onSubmit={handleTriggerBoost} className="space-y-4">
              <div className="space-y-1.5">
                <span className="text-muted-foreground block pl-0.5">SELECT VECTOR TARGET:</span>
                <div className="grid grid-cols-3 gap-2 text-[9px] font-bold">
                  {([
                    { id: 'hashtag', label: '#HASHTAG' },
                    { id: 'category', label: 'GENRE' },
                    { id: 'creator', label: 'CREATOR' }
                  ] as const).map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setBoostType(type.id)}
                      className={cn(
                        "h-9 px-1 transition-colors rounded-[1px] border uppercase",
                        boostType === type.id 
                          ? "bg-primary text-primary-foreground font-extrabold" 
                          : "hover:bg-muted hover:text-primary text-muted-foreground border-border"
                      )}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-muted-foreground block pl-0.5">INJECT VECTOR TARGET ID:</span>
                <input
                  type="text"
                  required
                  placeholder={boostType === 'hashtag' ? "e.g., #DiwaliStar" : (boostType === 'category' ? "e.g., comedy" : "e.g., @poojapatel")}
                  value={boostTarget}
                  onChange={(e) => setBoostTarget(e.target.value)}
                  className="w-full h-10 bg-muted border border-border rounded-[2px] px-3 text-xs text-foreground uppercase outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-[9px] font-bold">
                  <span>INJECTION COEFFICIENT VELOCITY:</span>
                  <span className="text-primary font-mono">{boostIntensity}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={boostIntensity}
                  onChange={(e) => setBoostIntensity(parseInt(e.target.value))}
                  className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary border border-border"
                />
              </div>

              <button
                type="submit"
                className="w-full h-10 bg-primary text-primary-foreground font-extrabold rounded-[1px] hover:bg-primary/90 transition-all uppercase tracking-wider text-xs font-mono flex items-center justify-center gap-2 active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>FIRE BOOST VECTOR INJECTOR</span>
              </button>
            </form>
          </div>

          {/* Active boost queues list */}
          <div className="bg-card border border-border p-5 rounded-[2px] lg:col-span-2 space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest block text-foreground">ACTIVE BOOSTED CHANNELS</span>
            
            <div className="space-y-3">
              {[
                { label: '#IPLCricketMania 🏏', rate: '92%', type: 'HASHTAG BOOSTED', speed: 'MAX ACCELERATION' },
                { label: '#DiwaliSparkChallenge 🪔', rate: '85%', type: 'HASHTAG BOOSTED', speed: 'HIGH ACCELERATION' },
                { label: 'COMEDY SHORTS GENRE 🎭', rate: '65%', type: 'GENRE OVERRIDE', speed: 'STABLE INJECTION' }
              ].map((boost, idx) => (
                <div key={idx} className="p-3 bg-muted border border-border rounded-[1px] flex justify-between items-center">
                  <div>
                    <span className="text-foreground font-extrabold tracking-wide text-xs block">{boost.label}</span>
                    <span className="text-muted-foreground text-[8px] font-normal block mt-1">{boost.type}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-primary font-mono font-black text-xs block">{boost.rate} BOOST</span>
                    <span className="text-muted-foreground text-[8px] font-normal block mt-1">{boost.speed}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};