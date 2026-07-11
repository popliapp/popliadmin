import React, { useState, useEffect } from 'react';
import { usePlatformStore } from '../store/usePlatformStore';
import { 
  Users as UsersIcon, 
  Video, 
  Eye, 
  TrendingUp, 
  Coins, 
  Gift, 
  Clock, 
  Zap, 
  Activity 
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
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { cn } from '@/utils/cn';

export const DashboardPage: React.FC = () => {
  const { creators, reels, dashboardStats } = usePlatformStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'live' | 'growth'>('overview');

  const userGrowthData = dashboardStats?.userGrowthData || [
    { name: 'Jan', Users: 0, active: 0 }
  ];

  const engagementData = dashboardStats?.engagementData || [
    { name: 'None', uploads: 0, views: 0 }
  ];

  const moodPieData = dashboardStats?.moodPieData || [
    { name: 'Data Pending', value: 100, color: '#7E8A9F' }
  ];

  const liveEvents = dashboardStats?.liveEvents || [];

  const hyperlocalData = dashboardStats?.hyperlocalData || [
    { city: 'PENDING', uploads: '0 uploads', views: '0 views', heat: 'bg-green-500' }
  ];

  const heatIndicators = dashboardStats?.heatIndicators || [
    { label: 'Data Pending', percent: '0%', desc: 'Waiting for server...', color: 'bg-muted' }
  ];


  // Summary counts
  const totalUsersCount = creators.length;
  const activeUsersCount = creators.filter(c => c.status === 'active').length;
  const totalReelsCount = reels.length;
  const totalViewsCount = reels.reduce((acc, r) => acc + r.views, 0);
  const totalCoinsDistributed = creators.reduce((acc, c) => acc + c.coinsEarned, 0);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* ⚡ Header Control Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-foreground">Platform Overview</h1>
          <p className="text-muted-foreground text-[10px] uppercase font-mono mt-1 font-semibold">POPLI administrative command status board</p>
        </div>
        
        <div className="flex bg-card border border-border p-1 rounded-xl self-stretch sm:self-auto shadow-sm">
          {([
            { id: 'overview', label: 'OPERATIONS OVERVIEW' },
            { id: 'live', label: 'LIVE SIMULATION' },
            { id: 'growth', label: 'GROWTH ANALYTICS' }
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-1.5 text-[9px] font-bold tracking-wider transition-all rounded-lg uppercase font-mono",
                activeTab === tab.id 
                  ? "bg-primary text-white shadow-sm shadow-primary/20" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* 📊 Metrics Widgets Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Total Creators', value: formatNumber(totalUsersCount), desc: 'REGISTERED PROFILE INDEX', icon: UsersIcon, color: '#0ea5e9' },
              { title: 'Active Creators', value: formatNumber(activeUsersCount), desc: 'CLEARANCE SECURED VIBES', icon: Activity, color: '#00D8F6' },
              { title: 'Total Uploaded Reels', value: formatNumber(totalReelsCount), desc: 'CONTENT REPOSITORY BLOCK', icon: Video, color: '#FF7C00' },
              { title: 'Cumulative Views', value: formatNumber(totalViewsCount), desc: 'WATCH LOOP VOLUMETRIC', icon: Eye, color: '#FF2A00' },
              { title: 'Distributed Coins', value: formatNumber(totalCoinsDistributed), desc: 'VIRTUAL COIN CIRCULATION', icon: Coins, color: '#0ea5e9' },
              { title: 'Gift Revenue', value: '₹' + formatNumber(totalCoinsDistributed * 1.25), desc: 'COMMERCE INFLOW INR', icon: Gift, color: '#00D8F6' },
              { title: 'Avg Watch Time', value: '43.2 Min', desc: 'SESSION DOPAMINE DEPTH', icon: Clock, color: '#FF7C00' },
              { title: 'Virality Accel', value: '88%', desc: 'RECOMMENDER EXPONENTIAL', icon: TrendingUp, color: '#FF2A00' }
            ].map((widget, i) => {
              const Icon = widget.icon;
              return (
                <div key={i} className="bg-card border border-border p-5 rounded-2xl flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl hover:border-primary/40 transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none font-mono">{widget.title}</span>
                    <div className="p-1.5 rounded-lg bg-muted flex items-center justify-center">
                      <Icon className="w-4 h-4" style={{ color: widget.color }} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-3xl font-black tracking-tight" style={{ color: widget.color }}>{widget.value}</span>
                    <p className="text-[8px] text-muted-foreground/80 font-bold uppercase tracking-widest mt-2 font-mono">{widget.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 📈 Operations Center Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Primary Graph: User Growth */}
            <div className="bg-card border border-border p-5 rounded-2xl lg:col-span-2 space-y-4 shadow-sm">
              <div className="flex justify-between items-center select-none">
                <span className="text-xs font-extrabold uppercase tracking-widest font-mono text-foreground">Platform Growth Vector</span>
                <span className="text-[8px] bg-primary/10 border border-primary/20 text-primary font-bold uppercase px-2 py-0.5 rounded-md flex items-center gap-1 font-mono">
                  <Zap className="w-3 h-3 text-primary" /> UPDATE SECURED
                </span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
                    <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={9} fontStyle="italic" />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={9} />
                    <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', fontSize: 10, fontFamily: 'monospace', borderRadius: 8 }} />
                    <Area type="monotone" dataKey="Users" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Platform Mood Retention breakdown */}
            <div className="bg-card border border-border p-5 rounded-2xl flex flex-col justify-between shadow-sm">
              <span className="text-xs font-extrabold uppercase tracking-widest block mb-4 font-mono text-foreground">PSYCHOLOGY EMOTION BREAKDOWN</span>
              <div className="h-44 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={moodPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={64}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {moodPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', fontSize: 10, fontFamily: 'monospace', borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 text-[9px] uppercase font-bold text-muted-foreground mt-2 font-mono">
                {moodPieData.map((mood, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-md" style={{ background: mood.color }} />
                      {mood.name}
                    </span>
                    <span className="text-foreground font-mono">{mood.value}%</span>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        </>
      )}

      {activeTab === 'live' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Action Tracker Feed */}
          <div className="bg-card border border-border p-5 rounded-2xl lg:col-span-2 flex flex-col h-[400px] shadow-sm">
            <div className="flex justify-between items-center border-b border-border pb-3 mb-3 select-none">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-ping" />
                <span className="text-xs font-extrabold uppercase tracking-widest font-mono text-foreground">LIVE EVENT DECODER</span>
              </div>
              <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold px-2 py-0.5 rounded-md uppercase font-mono">SYSTEM PING: ACTIVE</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar text-[10px] font-mono">
              {liveEvents.map((evt) => (
                <div key={evt.id} className="p-3 bg-muted/40 border border-border rounded-xl flex justify-between items-center hover:border-primary/30 transition-all hover:bg-muted/70">
                  <div className="flex items-center gap-2.5">
                    <span className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      evt.type === 'gift' ? 'bg-[#0ea5e9]' : (evt.type === 'upload' ? 'bg-[#ec4899]' : (evt.type === 'viral' ? 'bg-orange-500' : 'bg-green-500'))
                    )} />
                    <span className="text-foreground uppercase leading-normal tracking-wide">{evt.text}</span>
                  </div>
                  <span className="text-muted-foreground text-[8px] whitespace-nowrap ml-4">{evt.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Hyperlocal Activity Map widget */}
          <div className="bg-card border border-border p-5 rounded-2xl flex flex-col justify-between h-[400px] shadow-sm">
            <span className="text-xs font-extrabold uppercase tracking-widest block mb-4 font-mono text-foreground">HYPERLOCAL INJECTOR VOLUME</span>
            <div className="space-y-3 flex-1 overflow-y-auto pr-1 text-[10px] uppercase font-bold text-muted-foreground font-mono">
              {hyperlocalData.map((item: any, idx: number) => (
                <div key={idx} className="p-3 bg-muted/40 border border-border rounded-xl flex justify-between items-center hover:border-primary/20 transition-colors">
                  <div>
                    <span className="text-foreground tracking-wide block">{item.city}</span>
                    <span className="text-muted-foreground text-[8px] font-normal block mt-1">{item.uploads}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-primary tracking-wide block">{item.views}</span>
                    <div className="flex items-center gap-1.5 justify-end mt-1">
                      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0 animate-pulse", item.heat)} />
                      <span className="text-[7px] text-muted-foreground">HOTSPOT</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'growth' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart - Category view depth */}
          <div className="bg-card border border-border p-5 rounded-2xl space-y-4 shadow-sm">
            <span className="text-xs font-extrabold uppercase tracking-widest block font-mono text-foreground">CATEGORY UPLOADS VS VIEWS</span>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={engagementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
                  <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={9} fontStyle="italic" />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={9} />
                  <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', fontSize: 10, fontFamily: 'monospace', borderRadius: 8 }} />
                  <Bar dataKey="uploads" fill="#0ea5e9" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="views" fill="#ec4899" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Platform Performance metrics */}
          <div className="bg-card border border-border p-5 rounded-2xl space-y-4 shadow-sm">
            <span className="text-xs font-extrabold uppercase tracking-widest block font-mono text-foreground">Platform Heat indicators</span>
            <div className="space-y-4 pt-2">
              {heatIndicators.map((item: any, idx: number) => (
                <div key={idx} className="space-y-1.5 uppercase font-bold text-[10px] font-mono">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>{item.label}</span>
                    <span className="text-foreground font-mono">{item.percent}</span>
                  </div>
                  <div className="h-2 bg-muted border border-border rounded-lg overflow-hidden">
                    <div className={cn("h-full rounded-lg", item.color)} style={{ width: item.percent }} />
                  </div>
                  <span className="text-muted-foreground/60 text-[8px] block font-normal normal-case">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
