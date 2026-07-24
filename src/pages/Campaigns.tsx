import React, { useState, useEffect, useCallback } from 'react';
import { useRegisterRefresh } from '../hooks/useRegisterRefresh';
import {
  Send,
  MapPin,
  Megaphone,
  Bell,
  Image,
  Trophy,
  CalendarDays,
  Trash2,
  CheckCircle,
  PauseCircle,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';
import { adminService } from '@/services/adminService';

const TYPE_ICONS: Record<string, React.ElementType> = {
  push: Bell,
  banner: Image,
  challenge: Trophy,
  event: CalendarDays,
};

const TYPE_COLORS: Record<string, string> = {
  push: 'bg-primary/10 text-primary border-primary/20',
  banner: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  challenge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  event: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  scheduled: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  completed: 'bg-muted text-muted-foreground border-border',
  draft: 'bg-muted text-muted-foreground border-border',
};

export const CampaignsPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'push' | 'banner' | 'challenge' | 'event'>('push');
  const [newCity, setNewCity] = useState('National (All Cities)');
  const [newHashtag, setNewHashtag] = useState('');
  const [newStatus, setNewStatus] = useState<'active' | 'scheduled' | 'draft'>('active');

  const fetchCampaigns = async () => {
    try {
      const data = await adminService.getCampaigns();
      setCampaigns(data);
    } catch {
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

const refresh = useCallback(async () => {
    await fetchCampaigns();
  }, []);

  useRegisterRefresh(refresh);

  useEffect(() => {
    fetchCampaigns();
  }, []);
  const handleLaunchCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    setSubmitting(true);
    try {
      const created = await adminService.createCampaign({
        title: newTitle,
        type: newType,
        status: newStatus,
        targetAudience: 'All Indian Creators',
        targetCity: newCity,
        hashtag: newHashtag ? `#${newHashtag.replace('#', '').toLowerCase()}` : null,
      });
      setCampaigns((prev) => [created, ...prev]);
      toast.success(`Campaign launched: "${newTitle}"`);
      setNewTitle('');
      setNewHashtag('');
    } catch {
      toast.error('Failed to launch campaign');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusToggle = async (campaign: any) => {
    const nextStatus = campaign.status === 'active' ? 'completed' : 'active';
    try {
      await adminService.updateCampaignStatus(campaign.id, nextStatus);
      setCampaigns((prev) =>
        prev.map((c) => (c.id === campaign.id ? { ...c, status: nextStatus } : c))
      );
      toast.success(`Campaign marked as ${nextStatus}`);
    } catch {
      toast.error('Failed to update campaign status');
    }
  };

  const handleDelete = async (campaignId: string) => {
    try {
      await adminService.deleteCampaign(campaignId);
      setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
      toast.success('Campaign deleted');
    } catch {
      toast.error('Failed to delete campaign');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-foreground tracking-tight">Campaign Control</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Operational designer for POPLI promotional push alerts
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Megaphone className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-[15px] font-semibold text-foreground">Design Campaign</h2>
          </div>

          <form onSubmit={handleLaunchCampaign} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Campaign Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Diwali Hyperlocal Challenge"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full h-9 bg-muted border border-border rounded-lg px-3 text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Alert Type
              </label>
              <select
                value={newType}
                onChange={(e: any) => setNewType(e.target.value)}
                className="w-full h-9 bg-muted border border-border rounded-lg px-3 text-[13px] text-foreground outline-none cursor-pointer focus:border-primary transition-colors"
              >
                <option value="push">Push Notification</option>
                <option value="banner">Homepage Banner</option>
                <option value="challenge">Hashtag Challenge</option>
                <option value="event">Creator Event</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Status
              </label>
              <select
                value={newStatus}
                onChange={(e: any) => setNewStatus(e.target.value)}
                className="w-full h-9 bg-muted border border-border rounded-lg px-3 text-[13px] text-foreground outline-none cursor-pointer focus:border-primary transition-colors"
              >
                <option value="active">Active</option>
                <option value="scheduled">Scheduled</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Geography Target
              </label>
              <select
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                className="w-full h-9 bg-muted border border-border rounded-lg px-3 text-[13px] text-foreground outline-none cursor-pointer focus:border-primary transition-colors"
              >
                <option value="National (All Cities)">National (All Cities)</option>
                <option value="Lucknow, Indore">Lucknow, Indore</option>
                <option value="Jaipur, Madurai">Jaipur, Madurai</option>
                <option value="Mumbai, Delhi, Bengaluru">Mumbai, Delhi, Bengaluru</option>
              </select>
            </div>

            {newType === 'challenge' && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Hashtag
                </label>
                <input
                  type="text"
                  placeholder="e.g., diwalistar"
                  value={newHashtag}
                  onChange={(e) => setNewHashtag(e.target.value)}
                  className="w-full h-9 bg-muted border border-border rounded-lg px-3 text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-all"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-9 bg-primary text-primary-foreground text-[13px] font-semibold rounded-lg hover:bg-primary/90 active:scale-[0.97] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Launching...' : 'Launch Campaign'}
            </button>
          </form>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 lg:col-span-2 flex flex-col h-[560px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold text-foreground">Campaigns Register</h2>
            <span className="text-[12px] text-muted-foreground">{campaigns.length} total</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 bg-muted border border-border rounded-xl animate-pulse h-20" />
              ))
            ) : campaigns.length > 0 ? (
              campaigns.map((camp) => {
                const TypeIcon = TYPE_ICONS[camp.type] || Bell;
                return (
                  <div
                    key={camp.id}
                    className="p-4 bg-muted/40 border border-border rounded-xl flex justify-between items-center hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                        TYPE_COLORS[camp.type] || 'bg-muted text-muted-foreground'
                      )}>
                        <TypeIcon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[13px] font-semibold text-foreground block truncate">
                          {camp.title}
                        </span>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className={cn(
                            'text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider',
                            TYPE_COLORS[camp.type] || 'bg-muted text-muted-foreground border-border'
                          )}>
                            {camp.type}
                          </span>
                          <span className={cn(
                            'text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider',
                            STATUS_COLORS[camp.status] || 'bg-muted text-muted-foreground border-border'
                          )}>
                            {camp.status}
                          </span>
                          {camp.targetCity && (
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3 shrink-0" />
                              {camp.targetCity}
                            </span>
                          )}
                          {camp.hashtag && (
                            <span className="text-[11px] text-primary font-mono">{camp.hashtag}</span>
                          )}
                        </div>
                        <span className="text-[11px] text-muted-foreground mt-1 block">
                          {new Date(camp.createdAt).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                      <button
                        onClick={() => handleStatusToggle(camp)}
                        title={camp.status === 'active' ? 'Mark completed' : 'Mark active'}
                        className="w-7 h-7 rounded-lg border border-border hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {camp.status === 'active' ? (
                          <PauseCircle className="w-3.5 h-3.5" />
                        ) : (
                          <CheckCircle className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(camp.id)}
                        className="w-7 h-7 rounded-lg border border-border hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-center">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Megaphone className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-[13px] font-semibold text-foreground">No campaigns yet</p>
                <p className="text-[12px] text-muted-foreground">Create your first campaign using the form.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};