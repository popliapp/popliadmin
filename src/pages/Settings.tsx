import React, { useState } from 'react';
import { usePlatformStore } from '../store/usePlatformStore';
import { RefreshCw, Settings2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

export const SettingsPage: React.FC = () => {
  const { resetPlatformStore } = usePlatformStore();

  const [aiModeration, setAiModeration] = useState(true);
  const [autoShadowBan, setAutoShadowBan] = useState(true);
  const [ipFingerprinting, setIpFingerprinting] = useState(true);
  const [pushPromotions, setPushPromotions] = useState(true);

  const handleSaveConfigs = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('POPLI system settings saved successfully!', { icon: '⚙️' });
  };

  const handleResetDatabase = () => {
    resetPlatformStore();
    toast.success('DEMO RESTORED: All data returned to defaults!', {
      icon: '🔄',
      style: { background: 'hsl(var(--card))', color: 'hsl(var(--primary))', border: '1px solid hsl(var(--border))' }
    });
  };

  const toggles = [
    { label: 'AI Nudity & Moderation Shield', value: aiModeration, setter: setAiModeration, desc: 'Auto check clips with computer vision' },
    { label: 'Auto Shadow-Ban Toxic Profiles', value: autoShadowBan, setter: setAutoShadowBan, desc: 'Throttles reached on automated flags' },
    { label: 'IP Fingerprint Clustering', value: ipFingerprinting, setter: setIpFingerprinting, desc: 'Flag same-device multi-registration' },
    { label: 'Auto-Push Creator Challenges', value: pushPromotions, setter: setPushPromotions, desc: 'Broadcast daily tags automatically' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">Platform Settings Console</h1>
        <p className="text-muted-foreground text-sm mt-1">POPLI global constants and operational configurations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core settings form */}
        <div className="bg-card border border-border rounded-2xl p-6 lg:col-span-2 space-y-6 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings2 className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground">System Constants Configurator</span>
          </div>

          <form onSubmit={handleSaveConfigs} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {toggles.map((toggle, i) => (
                <div
                  key={i}
                  className="p-4 bg-muted/40 border border-border rounded-xl flex justify-between items-center hover:border-primary/30 transition-colors duration-200"
                >
                  <div className="space-y-1 pr-4">
                    <span className="text-sm font-medium text-foreground block">{toggle.label}</span>
                    <span className="text-[10px] text-muted-foreground block">{toggle.desc}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggle.setter(!toggle.value)}
                    className={cn(
                      "relative w-11 h-6 rounded-full border-2 transition-all duration-300 shrink-0 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                      toggle.value
                        ? "bg-primary border-primary"
                        : "bg-muted border-border"
                    )}
                    aria-label={toggle.label}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300",
                        toggle.value ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 text-sm tracking-wide"
            >
              Save Global System Constants
            </button>
          </form>
        </div>

        {/* Demo Engine Controls */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 border-b border-border pb-4">
              <div className="p-2 bg-warning/10 rounded-lg">
                <RefreshCw className="w-4 h-4 text-warning" />
              </div>
              <span className="text-sm font-semibold text-foreground">Demo Engine Controls</span>
            </div>

            <div className="p-4 bg-warning/5 border border-warning/20 rounded-xl space-y-3">
              <span className="font-semibold text-foreground text-sm block">Reset Simulated Index</span>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Revert all temporary creator shadow-bans, verifies, coin payout values, and campaign histories to default indices.
              </p>
              <div className="p-2.5 bg-destructive/5 border border-destructive/20 rounded-lg">
                <p className="text-destructive text-[10px] font-semibold uppercase tracking-wide">
                  ⚠️ Warning: Local storage changes will be overwritten.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleResetDatabase}
            className="w-full h-11 bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-white font-semibold transition-all duration-200 rounded-xl text-sm flex items-center justify-center gap-2 active:scale-[0.98] mt-4"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Simulator Database</span>
          </button>
        </div>
      </div>
    </div>
  );
};
