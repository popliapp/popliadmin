import React, { useState } from 'react';
import { 
  Smile, 
  Zap, 
  Brain, 
  Sliders 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { cn } from '@/utils/cn';

export const AnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'psychology' | 'retention' | 'loops'>('psychology');

  const dopamineRetentionData = [
    { name: '10s', funny: 95, emotional: 80, educational: 70 },
    { name: '20s', funny: 88, emotional: 75, educational: 65 },
    { name: '30s', funny: 82, emotional: 70, educational: 58 },
    { name: '45s', funny: 70, emotional: 60, educational: 45 },
    { name: '60s', funny: 55, emotional: 48, educational: 30 }
  ];

  const scrollFatigueData = [
    { scrollIndex: '1-10', fatigueRisk: 5, engagement: 95 },
    { scrollIndex: '11-20', fatigueRisk: 12, engagement: 90 },
    { scrollIndex: '21-30', fatigueRisk: 28, engagement: 78 },
    { scrollIndex: '31-40', fatigueRisk: 50, engagement: 60 },
    { scrollIndex: '41-50', fatigueRisk: 75, engagement: 42 },
    { scrollIndex: '50+', fatigueRisk: 92, engagement: 18 }
  ];

  const tabs = [
    { id: 'psychology', label: 'Psychology Hub' },
    { id: 'retention', label: 'Genre Retention' },
    { id: 'loops', label: 'Scroll Fatigue' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
            Platform Analytics & Intelligence
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            POPLI creator behavioral tracking and user psychology metrics
          </p>
        </div>

        {/* Pill Tabs */}
        <div className="flex bg-muted/60 backdrop-blur-sm border border-border p-1 rounded-xl gap-1 self-stretch sm:self-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2 text-xs font-semibold tracking-wide transition-all rounded-lg",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'psychology' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Behavioral Coefficients */}
          <div className="bg-card border border-border rounded-2xl p-6 lg:col-span-2 space-y-5 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Behavioral Coefficients
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Dopamine Hook Ratio', value: '8.4 / 10', desc: 'Viewer emotional latching depth', icon: Brain, color: 'text-primary' },
                { label: 'Scroll Fatigue Trigger', value: '38.5 scrolls', desc: 'Avg scrolls before session exit', icon: Sliders, color: 'text-primary' },
                { label: 'Emotional Retention Rate', value: '72.4%', desc: 'Retention in comedy streams', icon: Smile, color: 'text-emerald-500' },
                { label: 'Rewatch Acceleration', value: '4.2×', desc: 'High rewatch loops in Indore/Lucknow', icon: Zap, color: 'text-warning' }
              ].map((wid, i) => {
                const Icon = wid.icon;
                return (
                  <div
                    key={i}
                    className="p-4 bg-muted/40 border border-border rounded-xl flex flex-col justify-between hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 transition-all duration-200 group"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs text-muted-foreground font-medium">{wid.label}</span>
                      <Icon className={cn("w-4 h-4 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity", wid.color)} />
                    </div>
                    <div className="mt-4">
                      <span className={cn("text-2xl font-bold tracking-tight block leading-none font-display", wid.color)}>
                        {wid.value}
                      </span>
                      <span className="text-muted-foreground text-[10px] font-normal block mt-1.5">{wid.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-2 text-sm leading-relaxed">
              <span className="font-semibold text-foreground block">Psychology Intelligence Summary</span>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Recommender prioritizes emotional triggers (funny, excited) within Lucknow and Jaipur metro clusters to maintain session longevity.
              </p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Viewers showing scroll velocity above 3 scrolls/sec are automatically routed into high-dopamine visual reels to combat fatigue.
              </p>
            </div>
          </div>

          {/* Psychology Status */}
          <div className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-5">
                Psychology Status
              </span>
              <div className="space-y-3">
                {[
                  { title: 'Vernacular comedy hook', value: '92.3% active', desc: 'Local dialect loops in UP/MP', good: true },
                  { title: 'Romantic narrative retain', value: '64.2% active', desc: 'Indian melody remix retention', good: true },
                  { title: 'Cringe video bounce rate', value: '45.1% bounce', desc: 'Audience scroll acceleration', good: false },
                  { title: 'Cricket challenge retention', value: '88.4% active', desc: 'National IPL triggers', good: true }
                ].map((score, i) => (
                  <div key={i} className="p-3 bg-muted/40 border border-border rounded-xl hover:border-primary/30 transition-colors">
                    <span className="text-xs text-muted-foreground block">{score.title}</span>
                    <span className={cn("text-sm font-bold mt-1 block", score.good ? "text-emerald-500" : "text-destructive")}>
                      {score.value}
                    </span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">{score.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold text-xs px-3 py-2.5 rounded-xl mt-5">
              <Brain className="h-3.5 w-3.5 shrink-0" />
              <span>Psychology Analytics Lock</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'retention' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 lg:col-span-2 space-y-4 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Emotional Content Retention Curve
            </span>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dopamineRetentionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorFunny" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorEmotional" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: 11,
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                  <Area type="monotone" dataKey="funny" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorFunny)" name="Funny" />
                  <Area type="monotone" dataKey="emotional" stroke="#ec4899" strokeWidth={2} fillOpacity={1} fill="url(#colorEmotional)" name="Emotional" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Retention Curve Analytics</span>
            <div className="p-4 bg-muted/40 border border-border rounded-xl space-y-3 text-sm leading-relaxed">
              <span className="font-semibold text-primary block">Retention Degradation Rate</span>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Comedy shorts retain 82% of viewer bases at the 30-second mark.
              </p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Educational tech vlogs show sharp drop-offs (−45%) after the 20-second threshold, needing immediate dopamine hook injections.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'loops' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 lg:col-span-2 space-y-4 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Scroll Fatigue vs. Engagement
            </span>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scrollFatigueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="scrollIndex" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: 11,
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                  <Bar dataKey="fatigueRisk" fill="#ef4444" radius={[4, 4, 0, 0]} name="Fatigue Risk %" />
                  <Bar dataKey="engagement" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Engagement %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Scroll Velocity Mitigator</span>
            <div className="p-4 bg-muted/40 border border-border rounded-xl space-y-3 text-sm leading-relaxed">
              <span className="font-semibold text-foreground block">Velocity Limits</span>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Risk index spikes after scroll index exceeds 40 consecutive videos within a single platform session.
              </p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Auto-injection of localized creator challenges (Cricket challenge) helps deflect scroll fatigue spikes successfully.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
