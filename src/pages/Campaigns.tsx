import React, { useState } from 'react';
import { usePlatformStore } from '../store/usePlatformStore';
import { Send, MapPin, Megaphone } from 'lucide-react';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

export const CampaignsPage: React.FC = () => {
  const { campaigns, addCampaign } = usePlatformStore();

  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'push' | 'banner' | 'challenge' | 'event'>('push');
  const [newAudience] = useState('All Indian Creators (Age 18-35)');
  const [newCity, setNewCity] = useState('National (All Cities)');
  const [newHashtag, setNewHashtag] = useState('');

  const handleLaunchCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    addCampaign({
      title: newTitle,
      type: newType,
      targetAudience: newAudience,
      status: 'active',
      hashtag: newHashtag ? `#${newHashtag.replace('#', '').toLowerCase()}` : undefined
    });

    toast.success(`Campaign launched: "${newTitle}" broadcasted to pipeline!`, {
      icon: '🚀',
      style: { background: 'hsl(var(--card))', color: 'hsl(var(--primary))', border: '1px solid hsl(var(--border))' }
    });

    setNewTitle('');
    setNewHashtag('');
  };

  const typeColors: Record<string, string> = {
    push: 'bg-primary/10 text-primary border-primary/20',
    banner: 'bg-secondary/10 text-secondary border-secondary/20',
    challenge: 'bg-warning/10 text-warning border-warning/20',
    event: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">Campaign & Notification Control</h1>
        <p className="text-muted-foreground text-sm mt-1">Operational designer for POPLI promotional push alerts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaign designer form */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Megaphone className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground">Design Campaign Alert</span>
          </div>

          <form onSubmit={handleLaunchCampaign} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Campaign Title</label>
              <input
                type="text"
                required
                placeholder="e.g., Diwali Hyperlocal Challenge 🪔"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full h-10 bg-muted/40 border border-border rounded-xl px-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Alert Vector Type</label>
              <select
                value={newType}
                onChange={(e: any) => setNewType(e.target.value)}
                className="w-full h-10 bg-muted/40 border border-border rounded-xl px-3 text-sm text-foreground outline-none cursor-pointer focus:border-primary transition-colors"
              >
                <option value="push">📲 Push Notification</option>
                <option value="banner">🖼️ Homepage Banner</option>
                <option value="challenge">🏆 Hashtag Challenge</option>
                <option value="event">📅 Creator Events</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Geography Target</label>
              <select
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                className="w-full h-10 bg-muted/40 border border-border rounded-xl px-3 text-sm text-foreground outline-none cursor-pointer focus:border-primary transition-colors"
              >
                <option value="National (All Cities)">National (All Cities)</option>
                <option value="Lucknow, Indore">Lucknow, Indore</option>
                <option value="Jaipur, Madurai">Jaipur, Madurai</option>
                <option value="Mumbai, Delhi, Bengaluru">Mumbai, Delhi, Bengaluru</option>
              </select>
            </div>

            {newType === 'challenge' && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Hashtag Binding</label>
                <input
                  type="text"
                  placeholder="e.g., diwalistar"
                  value={newHashtag}
                  onChange={(e) => setNewHashtag(e.target.value)}
                  className="w-full h-10 bg-muted/40 border border-border rounded-xl px-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full h-11 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Launch Promotional Alert</span>
            </button>
          </form>
        </div>

        {/* Active campaigns log */}
        <div className="bg-card border border-border rounded-2xl p-6 lg:col-span-2 space-y-4 flex flex-col h-[460px] shadow-sm">
          <span className="text-sm font-semibold text-foreground">Active Campaigns Register</span>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {campaigns.map((camp) => (
              <div
                key={camp.id}
                className="p-4 bg-muted/40 border border-border rounded-xl flex justify-between items-center hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-200"
              >
                <div className="space-y-2 min-w-0">
                  <span className="text-sm font-semibold text-foreground block truncate">{camp.title}</span>
                  <div className="flex flex-wrap gap-2">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wide",
                      typeColors[camp.type] || 'bg-muted text-muted-foreground border-border'
                    )}>
                      {camp.type}
                    </span>
                    <span className="text-muted-foreground text-[10px] flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" /> Local
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-4">
                  {camp.status === 'active' || camp.status === 'completed' ? (
                    <div className="space-y-1 text-xs">
                      <span className="text-foreground font-bold block">Active</span>
                    </div>
                  ) : (
                    <span className="bg-muted text-muted-foreground border border-border text-[10px] px-2 py-1 rounded-lg font-semibold">
                      Scheduled
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
