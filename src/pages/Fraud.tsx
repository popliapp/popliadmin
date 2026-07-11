import React, { useState } from 'react';
import { usePlatformStore } from '../store/usePlatformStore';
import { ShieldCheck, Zap } from 'lucide-react';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

export const FraudPage: React.FC = () => {
  const { botAttackActive, toggleBotAttack, creators, transactions } = usePlatformStore();
  const [activeSubTab, setActiveSubTab] = useState<'alerts' | 'devices' | 'ips'>('alerts');

  const handleToggleAttack = () => {
    toggleBotAttack();
    if (!botAttackActive) {
      toast.error('ALERT: Simulating coordinated Bot Intrusion wave! Red Flags active.', {
        icon: '🚨',
        style: { background: '#7f1d1d', color: '#fca5a5', border: '1px solid #ef4444' }
      });
    } else {
      toast.success('Security Shield restored. VPN spam blocked successfully.', { icon: '🛡️' });
    }
  };

  const highRiskCreators = creators
    .filter(c => c.status === 'suspended');

  const fraudTransactions = transactions
    .filter(tx => botAttackActive && tx.amount > 15000)
    .slice(0, 10);

  const tabs = [
    { id: 'alerts', label: 'Threat Alerts' },
    { id: 'devices', label: 'Device Fingerprints' },
    { id: 'ips', label: 'IP Monitor' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">Security & Anti-Fraud Center</h1>
          <p className="text-muted-foreground text-sm mt-1">POPLI platform bot traffic shields and risk audit center</p>
        </div>

        {/* Pill Tabs */}
        <div className="flex bg-muted/60 backdrop-blur-sm border border-border p-1 rounded-xl gap-1 self-stretch sm:self-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={cn(
                "px-4 py-2 text-xs font-semibold tracking-wide transition-all rounded-lg",
                activeSubTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bot Attack Simulation Banner */}
      <div className={cn(
        "p-5 border rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-300",
        botAttackActive
          ? "bg-destructive/5 border-destructive/40"
          : "bg-card border-border"
      )}>
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <span className={cn(
              "w-2.5 h-2.5 rounded-full shrink-0",
              botAttackActive ? "bg-destructive animate-ping" : "bg-emerald-500"
            )} />
            <span className={cn(
              "font-semibold text-sm",
              botAttackActive ? "text-destructive" : "text-foreground"
            )}>
              {botAttackActive
                ? "🚨 THREAT IN PROGRESS — Simulated Bot Intrusion Wave"
                : "Dev Simulation Control Console"}
            </span>
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed">
            {botAttackActive
              ? "VPN loop nodes are launching automated view count farming and withdrawal attacks."
              : "Launch an artificial attack wave to test real-time red warnings, auto shadow-bans, and geo-fraud maps."}
          </p>
        </div>

        <button
          onClick={handleToggleAttack}
          className={cn(
            "h-10 px-5 text-sm font-semibold transition-all rounded-xl border flex items-center justify-center gap-2 active:scale-[0.97] shrink-0 self-stretch sm:self-auto",
            botAttackActive
              ? "bg-destructive text-white border-transparent hover:bg-destructive/90"
              : "bg-primary text-primary-foreground border-transparent hover:bg-primary/90"
          )}
        >
          <Zap className="w-4 h-4 fill-current" />
          {botAttackActive ? "Halt Attack Simulation" : "Simulate Bot Attack"}
        </button>
      </div>

      {activeSubTab === 'alerts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Threat logs */}
          <div className="bg-card border border-border rounded-2xl p-6 lg:col-span-2 space-y-4 flex flex-col h-[420px] shadow-sm">
            <span className="text-sm font-semibold text-foreground">Real-Time Threat Logs</span>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {fraudTransactions.length > 0 ? (
                fraudTransactions.map((tx) => (
                  <div key={tx.id} className="p-4 bg-destructive/5 border border-destructive/20 rounded-xl flex justify-between items-center">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-destructive font-semibold text-sm">VPN Interrupt Block</span>
                        <span className="bg-destructive/10 border border-destructive/20 text-destructive text-[9px] font-bold px-2 py-0.5 rounded-lg uppercase">
                          View Farming
                        </span>
                      </div>
                      <span className="text-foreground text-xs block">@{tx.creatorUsername} via {tx.method}</span>
                      <span className="text-muted-foreground text-[10px] font-mono select-all block">Suspicious Activity</span>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <span className="text-destructive font-bold text-sm font-mono block">{tx.amount.toLocaleString()} Coins</span>
                      <span className="text-muted-foreground text-[10px] block mt-1">Risk: 98%</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-12 space-y-3">
                  <ShieldCheck className="w-10 h-10 opacity-20" />
                  <span className="font-semibold text-sm">Zero active threat anomalies detected</span>
                  <p className="text-xs leading-relaxed px-6">System integrity shields are performing stable diagnostic operations.</p>
                </div>
              )}
            </div>
          </div>

          {/* Threat Metrics */}
          <div className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between h-[420px] shadow-sm">
            <div>
              <span className="text-sm font-semibold text-foreground block mb-5">Threat Level Metrics</span>
              <div className="space-y-4">
                {[
                  { label: 'VPN loop nodes blocked', value: botAttackActive ? '1,420 nodes' : '23 nodes/hr', desc: 'Auto blocking active' },
                  { label: 'Emulator farming scripts', value: botAttackActive ? '94 scripts' : '2 scripts/day', desc: 'Auto signature detected' },
                  { label: 'Withdrawal queue freeze', value: botAttackActive ? 'ACTIVE' : 'Inactive', desc: 'Fraud triggers live' }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 bg-muted/40 border border-border rounded-xl hover:border-primary/30 transition-colors">
                    <span className="text-xs text-muted-foreground block">{item.label}</span>
                    <span className={cn(
                      "text-base font-bold mt-1.5 block",
                      botAttackActive ? "text-destructive animate-pulse" : "text-primary"
                    )}>{item.value}</span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold text-xs px-3 py-2.5 rounded-xl mt-4">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              <span>Bot Shield Activated</span>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'devices' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 lg:col-span-2 space-y-4 flex flex-col h-[420px] shadow-sm">
            <span className="text-sm font-semibold text-foreground">Suspicious Profile Risks</span>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {highRiskCreators.map((creator) => (
                <div key={creator.id} className="p-4 bg-muted/40 border border-border rounded-xl flex justify-between items-center hover:border-warning/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <img src={creator.avatar} alt={creator.name} className="w-9 h-9 rounded-xl object-cover shrink-0 border border-border" />
                    <div>
                      <span className="text-sm font-semibold text-foreground block">{creator.name}</span>
                      <span className="text-muted-foreground text-xs block mt-0.5">@{creator.username}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <span className={cn(
                      "font-bold text-sm font-mono block",
                      "text-destructive animate-pulse"
                    )}>
                      Status: Suspended
                    </span>
                    <span className="text-muted-foreground text-[10px] block mt-0.5 font-mono select-all">
                      Action Required
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
            <span className="text-sm font-semibold text-foreground">Device Audit Explainer</span>
            <div className="p-4 bg-muted/40 border border-border rounded-xl space-y-3 text-sm leading-relaxed">
              <span className="font-semibold text-foreground block">Fingerprinting Engine</span>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Device fingerprinting tracks screen height, processor cores, GPU renderer model, and active emulators.
              </p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Multiple accounts registered on a single device within 24 hours trigger automated coins lock and reach throttling.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'ips' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 lg:col-span-2 space-y-4 flex flex-col h-[420px] shadow-sm">
            <span className="text-sm font-semibold text-foreground">IP Monitor Workspace</span>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {creators.slice(0, 12).map((creator) => (
                <div key={creator.id} className="p-4 bg-muted/40 border border-border rounded-xl flex justify-between items-center hover:border-primary/30 transition-colors">
                  <div className="space-y-1">
                    <span className="text-sm font-semibold text-foreground font-mono select-all block">{creator.name}</span>
                    <span className="text-muted-foreground text-xs block">@{creator.username} · {creator.city}</span>
                  </div>
                  <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] px-2 py-1 rounded-lg uppercase tracking-wide shrink-0 ml-4">
                    VPN Free
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
            <span className="text-sm font-semibold text-foreground">IP Cluster Monitor</span>
            <div className="p-4 bg-muted/40 border border-border rounded-xl space-y-3 text-sm leading-relaxed">
              <span className="font-semibold text-foreground block">Cluster Monitoring</span>
              <p className="text-muted-foreground text-xs leading-relaxed">
                VPN abuse monitoring catches creators routing accounts through foreign proxy nodes.
              </p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Real-time alerts trigger when creators in Lucknow or Indore use foreign IP addresses.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
