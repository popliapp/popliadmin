import React, { useState, useEffect, useCallback } from 'react';
import { useRegisterRefresh } from '../hooks/useRegisterRefresh';
import {
  TrendingUp,
  Video,
  Users,
  Hash,
  MapPin,
  Coins,
  Gift,
  ArrowDownToLine,
  Eye,
  Heart,
  Share2,
  MessageCircle,
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
  Cell,
} from 'recharts';
import { cn } from '@/utils/cn';
import { adminService } from '@/services/adminService';

const CATEGORY_COLORS: Record<string, string> = {
  comedy: '#2563eb',
  dance: '#ec4899',
  tech: '#8b5cf6',
  food: '#f59e0b',
  music: '#10b981',
  drama: '#ef4444',
  fashion: '#f97316',
  vlog: '#06b6d4',
  unknown: '#6b7280',
};

const formatNumber = (n: number) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg px-3 py-2.5 text-[12px]">
        <p className="text-muted-foreground font-medium mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-foreground font-semibold">
              {formatNumber(entry.value)} {entry.name}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'creators' | 'revenue'>('overview');

const refresh = useCallback(async () => {
    setLoading(true);
    await adminService.getAnalytics().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  useRegisterRefresh(refresh);

  useEffect(() => {
    adminService.getAnalytics()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'content' as const, label: 'Content' },
    { id: 'creators' as const, label: 'Top Creators' },
    { id: 'revenue' as const, label: 'Revenue' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-foreground tracking-tight">Platform Analytics</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Real-time data from content, creators, and revenue streams
          </p>
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'h-7 px-3 rounded-md text-[12px] font-medium transition-all whitespace-nowrap',
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 space-y-4">
              <div>
                <h2 className="text-[15px] font-semibold text-foreground">User Growth</h2>
                <p className="text-[12px] text-muted-foreground mt-0.5">New registrations over the last 12 months</p>
              </div>
              {data?.userGrowth?.length > 0 ? (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.userGrowth} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gradGrowth" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563eb" stopOpacity={0.12} />
                          <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="0" stroke="hsl(220 13% 91%)" strokeOpacity={0.8} vertical={false} />
                      <XAxis dataKey="month" tick={{ fill: 'hsl(220 9% 55%)', fontSize: 11 }} tickLine={false} axisLine={false} dy={8} />
                      <YAxis tick={{ fill: 'hsl(220 9% 55%)', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => formatNumber(v)} width={36} />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#2563eb', strokeWidth: 1, strokeDasharray: '4 4' }} />
                      <Area type="monotone" dataKey="count" name="Users" stroke="#2563eb" strokeWidth={2} fill="url(#gradGrowth)" dot={false} activeDot={{ r: 4, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-56 flex flex-col items-center justify-center gap-2 text-center">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-[13px] font-semibold text-foreground">No growth data yet</p>
                  <p className="text-[12px] text-muted-foreground">Registrations will appear here once users sign up.</p>
                </div>
              )}
            </div>

            <div className="bg-card border border-border rounded-xl p-5 space-y-3">
              <div>
                <h2 className="text-[15px] font-semibold text-foreground">Top Cities by Views</h2>
                <p className="text-[12px] text-muted-foreground mt-0.5">Reel views per city</p>
              </div>
              {data?.cityBreakdown?.length > 0 ? (
                <div className="space-y-2.5">
                  {data.cityBreakdown.map((c: any, i: number) => {
                    const max = data.cityBreakdown[0]?.totalViews || 1;
                    const pct = Math.round((c.totalViews / max) * 100);
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <span className="text-[12px] font-medium text-foreground">{c.city}</span>
                          </div>
                          <span className="text-[12px] text-muted-foreground font-mono">{formatNumber(c.totalViews)}</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 text-center py-8">
                  <MapPin className="w-8 h-8 text-muted-foreground opacity-20" />
                  <p className="text-[12px] text-muted-foreground">No city data available</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <div>
              <h2 className="text-[15px] font-semibold text-foreground">Trending Hashtags</h2>
              <p className="text-[12px] text-muted-foreground mt-0.5">Top hashtags by usage count</p>
            </div>
            {data?.topHashtags?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.topHashtags.map((h: any) => (
                  <div
                    key={h.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-muted border border-border rounded-lg"
                  >
                    <Hash className="w-3 h-3 text-primary" />
                    <span className="text-[12px] font-medium text-foreground">{h.name}</span>
                    <span className="text-[11px] text-muted-foreground font-mono">{formatNumber(h.usageCount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 text-center py-6">
                <Hash className="w-8 h-8 text-muted-foreground opacity-20" />
                <p className="text-[12px] text-muted-foreground">No hashtag data available</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="space-y-5">
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <div>
              <h2 className="text-[15px] font-semibold text-foreground">Views by Category</h2>
              <p className="text-[12px] text-muted-foreground mt-0.5">Reel view distribution across content categories</p>
            </div>
            {data?.categoryBreakdown?.length > 0 ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.categoryBreakdown} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="0" stroke="hsl(220 13% 91%)" strokeOpacity={0.8} vertical={false} />
                    <XAxis dataKey="category" tick={{ fill: 'hsl(220 9% 55%)', fontSize: 11 }} tickLine={false} axisLine={false} dy={8} />
                    <YAxis tick={{ fill: 'hsl(220 9% 55%)', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => formatNumber(v)} width={36} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }} />
                    <Bar dataKey="totalViews" name="Views" radius={[4, 4, 0, 0]}>
                      {data.categoryBreakdown.map((entry: any, index: number) => (
                        <Cell key={index} fill={CATEGORY_COLORS[entry.category] || '#6b7280'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex flex-col items-center justify-center gap-2 text-center">
                <Video className="w-8 h-8 text-muted-foreground opacity-20" />
                <p className="text-[12px] text-muted-foreground">No category data available</p>
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-[15px] font-semibold text-foreground">Top Performing Reels</h2>
              <p className="text-[12px] text-muted-foreground mt-0.5">Ranked by total views</p>
            </div>
            {data?.topReels?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      {['Title', 'Creator', 'Category', 'Views', 'Likes', 'Shares', 'Comments'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.topReels.map((r: any, i: number) => (
                      <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3.5">
                          <span className="text-[12px] font-medium text-foreground line-clamp-1 max-w-[180px] block">
                            {r.title}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-[12px] text-muted-foreground font-mono">@{r.creatorUsername}</td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-muted text-foreground capitalize">
                            {r.category}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5 text-[12px] text-foreground font-mono">
                            <Eye className="w-3 h-3 text-muted-foreground" />
                            {formatNumber(r.views)}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5 text-[12px] text-foreground font-mono">
                            <Heart className="w-3 h-3 text-muted-foreground" />
                            {formatNumber(r.likes)}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5 text-[12px] text-foreground font-mono">
                            <Share2 className="w-3 h-3 text-muted-foreground" />
                            {formatNumber(r.shares)}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5 text-[12px] text-foreground font-mono">
                            <MessageCircle className="w-3 h-3 text-muted-foreground" />
                            {formatNumber(r.comments)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 text-center py-14">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Video className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-[13px] font-semibold text-foreground">No reels yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'creators' && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-[15px] font-semibold text-foreground">Top Creators</h2>
            <p className="text-[12px] text-muted-foreground mt-0.5">Ranked by followers</p>
          </div>
          {data?.topCreators?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {['Creator', 'Followers', 'Total Likes', 'Reels', 'Earnings (INR)'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.topCreators.map((c: any, i: number) => (
                    <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={c.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${c.username}`}
                            alt={c.name}
                            className="w-8 h-8 rounded-full border border-border object-cover bg-muted shrink-0"
                          />
                          <div>
                            <span className="text-[13px] font-semibold text-foreground block">{c.name}</span>
                            <span className="text-[12px] text-muted-foreground font-mono">@{c.username}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[12px] text-foreground font-mono">{formatNumber(c.followers)}</td>
                      <td className="px-5 py-3.5 text-[12px] text-foreground font-mono">{formatNumber(c.totalLikes)}</td>
                      <td className="px-5 py-3.5 text-[12px] text-foreground font-mono">{c.reelCount}</td>
                      <td className="px-5 py-3.5 text-[12px] text-primary font-mono font-semibold">
                        ₹{formatNumber(c.totalEarnings)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 text-center py-14">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Users className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-[13px] font-semibold text-foreground">No creator data yet</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'revenue' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Gift Revenue', value: data?.revenueStats?.giftRevenue || 0, icon: Gift, color: 'bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400' },
              { label: 'Coin Revenue', value: data?.revenueStats?.coinRevenue || 0, icon: Coins, color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' },
              { label: 'Total Withdrawn', value: data?.revenueStats?.totalWithdrawn || 0, icon: ArrowDownToLine, color: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <span className="text-[13px] font-medium text-muted-foreground">{stat.label}</span>
                    <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', stat.color)}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <span className="text-[28px] font-bold text-foreground leading-none tracking-tight">
                    ₹{formatNumber(stat.value)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <div>
              <h2 className="text-[15px] font-semibold text-foreground">Earnings Trend</h2>
              <p className="text-[12px] text-muted-foreground mt-0.5">Daily platform earnings from views and gifts</p>
            </div>
            {data?.earningsTrend?.length > 0 ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.earningsTrend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradView" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity={0.12} />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradGift" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ec4899" stopOpacity={0.12} />
                        <stop offset="100%" stopColor="#ec4899" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="0" stroke="hsl(220 13% 91%)" strokeOpacity={0.8} vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: 'hsl(220 9% 55%)', fontSize: 11 }} tickLine={false} axisLine={false} dy={8} />
                    <YAxis tick={{ fill: 'hsl(220 9% 55%)', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => '₹' + formatNumber(v)} width={44} />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#2563eb', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area type="monotone" dataKey="viewEarnings" name="View Earnings" stroke="#2563eb" strokeWidth={2} fill="url(#gradView)" dot={false} activeDot={{ r: 4, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }} />
                    <Area type="monotone" dataKey="giftEarnings" name="Gift Earnings" stroke="#ec4899" strokeWidth={2} fill="url(#gradGift)" dot={false} activeDot={{ r: 4, fill: '#ec4899', stroke: '#fff', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex flex-col items-center justify-center gap-2 text-center">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Coins className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-[13px] font-semibold text-foreground">No earnings data yet</p>
                <p className="text-[12px] text-muted-foreground">Earnings will appear once creators start earning.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};