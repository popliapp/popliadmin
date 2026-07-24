import { create } from 'zustand';

// Types
export interface Creator {
  id: string;
  name: string;
  username: string;
  avatar: string;
  city: string;
  state: string;
  followers: number;
  following: number;
  totalLikes: number;
  totalViews?: number;
  coinsEarned: number;
  videoCount: number;
  status: 'active' | 'suspended' | 'shadow_banned';
  isVerified: boolean;
  isMonetized?: boolean;
  earningsFrozen: boolean;
  registrationDate: string;
  lastActive: string;
}

export interface Reel {
  id: string;
  title: string;
  duration: number; // in seconds
  creatorId: string;
  creatorName: string;
  creatorUsername: string;
  views: number;
  likes: number;
  shares: number;
  commentsCount: number;
  city: string;
  category: 'comedy' | 'tech' | 'dance' | 'food' | 'music' | 'drama' | 'fashion' | 'vlog';
  isTrending: boolean;
  isHidden: boolean;
  copyrightFlag: boolean;
  reported: boolean;
  commentsDisabled: boolean;
  ageRestricted: boolean;
  uploadDate: string;
  videoUrl: string; // fallback preview link
  musicName?: string;
  location?: string;
  taggedUsers?: Array<{ id: string; username: string }>;
  pendingEarningsViews?: number;
  challengeApprovalStatus?: string;
}

export interface Transaction {
  id: string;
  creatorName: string;
  creatorUsername: string;
  amount: number; // in coins
  rupees: number; // equivalent rupees
  type: 'purchase' | 'withdrawal';
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  date: string;
  method: string;
}

export interface Campaign {
  id: string;
  title: string;
  type: 'push' | 'banner' | 'challenge' | 'event';
  status: 'active' | 'scheduled' | 'completed' | 'draft';
  targetAudience: string;
  dateCreated: string;
  scheduledTime?: string;
  hashtag?: string;
}

export interface ModerationReport {
  id: string;
  type: 'reel' | 'comment' | 'user' | 'chat';
  targetId: string;
  targetTitle: string;
  targetCreatorName: string;
  reportReason: string;
  reporterName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'actioned';
  date: string;
  aiClassification?: {
    nudity: number; // percentage
    violence: number;
    hateSpeech: number;
    spam: number;
  };
}

export interface SupportTicket {
  id: string;
  subject: string;
  userName: string;
  userUsername: string;
  category: 'withdrawal' | 'login' | 'account_recovery' | 'abuse_complaint' | 'coin_issue';
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved';
  dateCreated: string;
  chatHistory: Array<{
    sender: 'user' | 'support';
    message: string;
    timestamp: string;
  }>;
}

export interface Gift {
  id: string;
  name: string;
  icon: string;
  coinPrice: number;
  popularity: number;
  animationType: 'fade' | 'bounce' | 'zoom' | '3d';
}

export interface FeedBoost {
  id: string;
  type: string;
  target: string;
  intensity: number;
  isActive: boolean;
  createdAt: string;
}

export interface FeedMetrics {
  totalReels: number;
  totalViews: number;
  totalValidViews: number;
  pendingEarningsViews: number;
  activeUsers: number;
  pendingReports: number;
}

export interface FraudStats {
  shadowBannedCount: number;
  blockedCount: number;
  revokedSessionsCount: number;
  suspiciousUsers: Array<{
    id: string;
    name: string;
    username: string;
    avatar: string | null;
    city: string | null;
    createdAt: string;
    earningsFrozen: boolean;
    flagType: 'shadow_banned' | 'blocked';
  }>;
  suspiciousIps: Array<{
    ipAddress: string;
    sessionCount: number;
    riskLevel: 'medium' | 'high' | 'critical';
  }>;
  suspiciousDevices: Array<{
    deviceInfo: string;
    sessionCount: number;
    riskLevel: 'medium' | 'high' | 'critical';
  }>;
  highVolumeViewers: Array<{
    deviceId: string;
    viewCount: number;
    riskLevel: 'medium' | 'high' | 'critical';
  }>;
}
interface PlatformState {
  creators: Creator[];
  reels: Reel[];
  transactions: Transaction[];
  campaigns: Campaign[];
  reports: ModerationReport[];
  tickets: SupportTicket[];
  gifts: Gift[];
  dashboardStats: any;
feedBoosts: FeedBoost[];
  feedMetrics: FeedMetrics | null;
  fraudStats: FraudStats | null;
  
  // Platform Controls
  recommendationWeights: {
    watchTimeWeight: number;
    shareWeight: number;
    nearbyWeight: number;
    commentWeight: number;
    moodWeight: number;
  };

botProtectionEnabled: boolean;
  botProtectionEnabledAt: string | null;

fetchFeedBoosts: () => Promise<void>;
  createFeedBoost: (data: { type: string; target: string; intensity: number }) => Promise<void>;
  deleteFeedBoost: (boostId: string) => Promise<void>;
  fetchFeedMetrics: () => Promise<void>;
  fetchFraudStats: () => Promise<void>;

  banUser: (userId: string) => void;
  unbanUser: (userId: string) => void;
  verifyUser: (userId: string) => void;
  removeVerification: (userId: string) => void;
  shadowBanUser: (userId: string) => void;
freezeEarnings: (userId: string) => void;
  toggleMonetization: (userId: string) => Promise<void>;
  
  // Actions - Content Management
  removeReel: (reelId: string) => void;
  hideReel: (reelId: string) => void;
  forceTrendReel: (reelId: string) => void;
  restrictAgeReel: (reelId: string) => void;
  disableCommentsReel: (reelId: string) => void;
  
  // Actions - Payouts & Coins
  approveWithdrawal: (txId: string) => void;
  rejectWithdrawal: (txId: string) => void;

  addGiftItem: (gift: Gift) => void;
  deleteGiftItem: (giftId: string) => void;
  
  // Actions - Campaigns & Moderation
  addCampaign: (campaign: Omit<Campaign, 'id' | 'dateCreated' | 'sentCount' | 'openRate' | 'clickRate'>) => void;
  resolveReport: (reportId: string, action: 'warning' | 'removed' | 'dismissed') => void;
  sendSupportReply: (ticketId: string, message: string) => void;
  
  // Actions - Control Panel Sliders & Simulation
  setWeights: (weights: Partial<PlatformState['recommendationWeights']>) => void;
  saveWeights: () => Promise<void>;
 simulateLiveTicks: () => void;
 resetPlatformStore: () => void;
}

import { adminService } from '../services/adminService';

const initialGifts: Gift[] = [
  { id: 'g_1', name: 'Rose', icon: '🌹', coinPrice: 5, popularity: 82, animationType: 'fade' },
  { id: 'g_2', name: 'Heart', icon: '❤️', coinPrice: 10, popularity: 94, animationType: 'bounce' },
  { id: 'g_3', name: 'Fire', icon: '🔥', coinPrice: 50, popularity: 76, animationType: 'zoom' },
];

const DEFAULT_STATE = () => ({
  creators: [],
  reels: [],
  transactions: [],
  campaigns: [],
  reports: [],
  tickets: [],
  gifts: initialGifts,
  dashboardStats: null,
feedBoosts: [],
  feedMetrics: null,
  fraudStats: null,
  recommendationWeights: {
    watchTimeWeight: 45,
    shareWeight: 25,
    nearbyWeight: 20,
    commentWeight: 10,
    moodWeight: 5
  },

 botProtectionEnabled: false,
  botProtectionEnabledAt: null,
});

export const usePlatformStore = create<PlatformState & { fetchAllData: () => Promise<void> }>((set) => ({
  ...DEFAULT_STATE(),

  fetchAllData: async () => {
    try {
const [users, reels, txs, reports, tickets, fetchedGifts, withdrawals, dashboardStats, configWeights] = await Promise.all([
        adminService.getUsers().catch(() => []),
        adminService.getReels().catch(() => []),
        adminService.getTransactions().catch(() => []),
        adminService.getReports().catch(() => []),
        adminService.getTickets().catch(() => []),
        adminService.getGifts().catch(() => []),
        adminService.getWithdrawals().catch(() => []),
        adminService.getDashboardStats().catch(() => null),
        adminService.getConfigs().catch(() => null),
      ]);

const mappedCreators = users.map((u: any) => ({
  id: u.id,
  name: u.name || 'Unknown',
  username: u.username || 'unknown',
  avatar: u.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${u.username}`,
  city: u.city || '',
  state: u.state || '',
  followers: u.followersCount || 0,
  following: u.followingCount || 0,
  totalLikes: u.totalLikesReceived || 0,
  totalViews: u.reels?.reduce((sum: number, r: any) => sum + (r.viewsCount || 0), 0) || 0,
  coinsEarned: u.wallet?.totalEarnings || 0,
  videoCount: u._count?.reels || 0,
  status: u.isShadowBanned ? 'shadow_banned' : u.isBlocked ? 'suspended' : 'active',
  isVerified: u.isVerified || false,
  isMonetized: u.isMonetized ?? true,
  earningsFrozen: u.earningsFrozen ?? false,
  registrationDate: u.createdAt,
  lastActive: u.updatedAt
}));

const mappedReels = reels.map((r: any) => ({
        id: r.id,
        title: r.description || 'No Title',
        duration: r.durationSeconds || 0,
        creatorId: r.creatorId,
        creatorName: r.creator?.name || 'Unknown',
        creatorUsername: r.creator?.username || 'unknown',
        views: r.viewsCount || 0,
        likes: r.likesCount || 0,
        shares: r.sharesCount || 0,
        commentsCount: r.commentsCount || 0,
        city: r.city || 'Unknown',
        category: r.category || 'vlog',
        isTrending: r.isTrending ?? false,
        isHidden: r.privacy === 'Private',
        copyrightFlag: r.copyrightFlag ?? false,
        reported: r.reports && r.reports.length > 0,
        commentsDisabled: !r.allowComments,
        ageRestricted: r.ageRestricted ?? false,
        uploadDate: r.createdAt,
        videoUrl: r.mediaUrl || '',
        pendingEarningsViews: r.pendingEarningsViews || 0,
        challengeApprovalStatus: r.challengeApprovalStatus || 'PENDING',
        musicName: r.musicName || '',
        taggedUsers: r.taggedUsers || [],
      }));
    const mappedTxs = txs.map((t: any) => ({
        id: t.id,
        creatorName: t.wallet?.user?.name || 'Unknown',
        creatorUsername: t.wallet?.user?.username || 'unknown',
      amount: t.amount,
        rupees: t.currency === 'INR' ? t.amount : 0,
        type: t.type === 'WITHDRAWAL' ? 'withdrawal' : 'purchase',
        status: t.status.toLowerCase(),
        date: t.createdAt,
        method: t.description || 'UPI'
      }));

      const mappedWithdrawals = withdrawals.map((w: any) => ({
        id: w.id,
        creatorName: w.wallet?.user?.name || 'Unknown',
        creatorUsername: w.wallet?.user?.username || 'unknown',
      amount: w.amount,
        rupees: w.amount,
        type: 'withdrawal',
        status: w.status.toLowerCase(),
        date: w.createdAt,
      method: w.wallet?.user?.kycRecord?.upiId || '—'
      }));

      const mappedReports = reports.map((r: any) => ({
        id: r.id,
        type: 'reel',
        targetId: r.reelId,
        targetTitle: r.reel?.description || 'Unknown Reel',
        targetCreatorName: r.reel?.creator?.username || 'Unknown Creator',
        reportReason: r.reason,
        reporterName: r.reporter?.name || 'Unknown',
 severity: (() => {
          const reason = (r.reason || '').toLowerCase();
          if (reason.includes('nudity') || reason.includes('explicit') || reason.includes('csam')) return 'critical';
          if (reason.includes('violence') || reason.includes('hate') || reason.includes('abuse')) return 'high';
          if (reason.includes('spam') || reason.includes('misleading') || reason.includes('copyright')) return 'medium';
          return 'low';
        })(),
        status: r.status === 'PENDING' ? 'pending' : 'actioned',
        date: r.createdAt
      }));

      const mappedTickets = tickets.map((t: any) => ({
        id: t.id,
        subject: t.subject,
        userName: t.creator?.name || 'Unknown',
        userUsername: t.creator?.username || 'unknown',
        category: 'general',
        priority: 'medium',
        status: t.status.toLowerCase(),
        dateCreated: t.createdAt,
        chatHistory: Array.isArray(t.chatHistory) ? t.chatHistory : []
      }));

      const mappedGifts = fetchedGifts.map((g: any) => ({
        id: g.id,
        name: g.name,
        icon: g.iconUrl,
        coinPrice: g.costInCoins,
        popularity: 0,
        animationType: g.animationType || 'fly'
      }));

const fetchedCampaigns = await adminService.getCampaigns().catch(() => []);
      const mappedCampaigns = fetchedCampaigns.map((c: any) => ({
        id: c.id,
        title: c.title,
        type: c.type,
        status: c.status,
        targetAudience: c.targetAudience || '',
        dateCreated: c.createdAt,
        scheduledTime: c.scheduledTime || undefined,
        hashtag: c.hashtag || undefined,
      }));

set((state) => ({
        creators: mappedCreators,
        reels: mappedReels,
        transactions: [...mappedTxs, ...mappedWithdrawals],
        reports: mappedReports,
        tickets: mappedTickets,
        gifts: mappedGifts.length > 0 ? mappedGifts : state.gifts,
        dashboardStats: dashboardStats || state.dashboardStats,
        recommendationWeights: configWeights || state.recommendationWeights,
        campaigns: mappedCampaigns.length > 0 ? mappedCampaigns : state.campaigns,
        botProtectionEnabled: dashboardStats?.botProtection?.enabled ?? state.botProtectionEnabled,
        botProtectionEnabledAt: dashboardStats?.botProtection?.enabledAt ?? state.botProtectionEnabledAt,
      }));
    } catch (error) {
      console.error('Failed to fetch admin data', error);
    }
  },

  // Actions: User management
  banUser: async (userId) => {
    await adminService.suspendUser(userId).catch(console.error);
    set((state) => ({
      creators: state.creators.map((c) => c.id === userId ? { ...c, status: 'suspended' } : c)
    }));
  },
  
  unbanUser: async (userId) => {
    await adminService.unbanUser(userId).catch(console.error);
    set((state) => ({
      creators: state.creators.map((c) => c.id === userId ? { ...c, status: 'active' } : c)
    }));
  },
  
  verifyUser: async (userId) => {
    await adminService.verifyUser(userId).catch(console.error);
    set((state) => ({
      creators: state.creators.map((c) => c.id === userId ? { ...c, isVerified: true } : c)
    }));
  },
  
  removeVerification: async (userId) => {
    await adminService.removeVerification(userId).catch(console.error);
    set((state) => ({
      creators: state.creators.map((c) => c.id === userId ? { ...c, isVerified: false } : c)
    }));
  },
  
  shadowBanUser: async (userId) => {
    await adminService.shadowBanUser(userId).catch(console.error);
    set((state) => ({
      creators: state.creators.map((c) => c.id === userId ? { ...c, status: 'shadow_banned' } : c)
    }));
  },
  
  freezeEarnings: async (userId) => {
    await adminService.freezeEarnings(userId).catch(console.error);
    set((state) => ({
      creators: state.creators.map((c) => c.id === userId ? { ...c, earningsFrozen: !c.earningsFrozen } : c)
    }));
  },

  // Actions: Content Management
  removeReel: async (reelId) => {
    await adminService.deleteReel(reelId).catch(console.error);
    set((state) => ({
      reels: state.reels.filter((r) => r.id !== reelId),
      reports: state.reports.map((rep) => rep.targetId === reelId ? { ...rep, status: 'actioned' } : rep)
    }));
  },
  
  hideReel: async (reelId) => {
    await adminService.hideReel(reelId).catch(console.error);
    set((state) => ({
      reels: state.reels.map((r) => r.id === reelId ? { ...r, isHidden: !r.isHidden } : r)
    }));
  },
  
  forceTrendReel: async (reelId) => {
    await adminService.forceTrendReel(reelId).catch(console.error);
    set((state) => ({
      reels: state.reels.map((r) => r.id === reelId ? { ...r, isTrending: !r.isTrending } : r)
    }));
  },
  
  restrictAgeReel: async (reelId) => {
    await adminService.restrictAgeReel(reelId).catch(console.error);
    set((state) => ({
      reels: state.reels.map((r) => r.id === reelId ? { ...r, ageRestricted: !r.ageRestricted } : r)
    }));
  },
  
  disableCommentsReel: async (reelId) => {
    await adminService.disableCommentsReel(reelId).catch(console.error);
    set((state) => ({
      reels: state.reels.map((r) => r.id === reelId ? { ...r, commentsDisabled: !r.commentsDisabled } : r)
    }));
  },

  // Payouts & Coins
  approveWithdrawal: async (txId) => {
    await adminService.approveWithdrawal(txId).catch(console.error);
    set((state) => ({
      transactions: state.transactions.map((t) => t.id === txId ? { ...t, status: 'completed' } : t)
    }));
  },
  
  rejectWithdrawal: async (txId) => {
    await adminService.rejectWithdrawal(txId).catch(console.error);
    set((state) => ({
      transactions: state.transactions.map((t) => t.id === txId ? { ...t, status: 'rejected' } : t)
    }));
  },
  
  toggleMonetization: async (userId: string) => {
    try {
      await adminService.toggleUserMonetization(userId);
      set((state) => ({
        creators: state.creators.map(c => c.id === userId ? { ...c, isMonetized: !c.isMonetized } : c)
      }));
    } catch (error) {
      console.error('Failed to toggle monetization', error);
    }
  },


  addGiftItem: async (gift) => {
    try {
      const savedGift = await adminService.addGift(gift);
      set((state) => ({
        gifts: [...state.gifts, { ...gift, id: savedGift.id }]
      }));
    } catch (error) {
      console.error(error);
      set((state) => ({ gifts: [...state.gifts, gift] }));
    }
  },
  
  deleteGiftItem: async (giftId) => {
    await adminService.deleteGift(giftId).catch(console.error);
    set((state) => ({
      gifts: state.gifts.filter((g) => g.id !== giftId)
    }));
  },

  // Campaigns & Moderation
  addCampaign: (campaign) => set((state) => {
    const newCamp: Campaign = {
      ...campaign,
      id: `camp_${Math.floor(Math.random() * 10000)}`,
      dateCreated: new Date().toISOString().split('T')[0]
    };
    return { campaigns: [newCamp, ...state.campaigns] };
  }),
  
  resolveReport: async (reportId, action) => {
    try {
      await adminService.resolveReport(reportId, action);
      set((state) => {
        const report = state.reports.find((r) => r.id === reportId);
        if (!report) return {};
        
        let updatedReels = [...state.reels];
        if (action === 'removed') {
          updatedReels = updatedReels.filter((r) => r.id !== report.targetId);
        }
        
        return {
          reports: state.reports.map((rep) => rep.id === reportId ? { ...rep, status: 'actioned' } : rep),
          reels: updatedReels
        };
      });
    } catch (error) {
      console.error('Failed to resolve report', error);
    }
  },
  
  sendSupportReply: async (ticketId, message) => {
    try {
      await adminService.replyToTicket(ticketId, message);
      set((state) => ({
        tickets: state.tickets.map((t) => t.id === ticketId ? {
          ...t,
          status: 'in_progress',
          chatHistory: [...t.chatHistory, { sender: 'support', message, timestamp: new Date().toISOString() }]
        } : t)
      }));
    } catch (error) {
      console.error('Failed to send reply', error);
    }
  },

  // Config Sliders & Simulation
  setWeights: (weights) => set((state) => ({
    recommendationWeights: { ...state.recommendationWeights, ...weights }
  })),

  saveWeights: async () => {
    try {
      const state = usePlatformStore.getState();
   await adminService.updateConfig('recommendationWeights', state.recommendationWeights);
    } catch (error) {
      console.error('Failed to save weights', error);
      throw error;
    }
  },
  
simulateLiveTicks: () => set((state) => {
    return state; // Disable simulation on live data
  }),
  
fetchFeedBoosts: async () => {
    try {
      const boosts = await adminService.getFeedBoosts();
      set({ feedBoosts: boosts });
    } catch (error) {
      console.error('Failed to fetch feed boosts', error);
    }
  },

  createFeedBoost: async (data) => {
    try {
      const boost = await adminService.createFeedBoost(data);
      set((state) => ({ feedBoosts: [boost, ...state.feedBoosts] }));
    } catch (error) {
      console.error('Failed to create feed boost', error);
    }
  },

  deleteFeedBoost: async (boostId) => {
    try {
      await adminService.deleteFeedBoost(boostId);
      set((state) => ({ feedBoosts: state.feedBoosts.filter((b) => b.id !== boostId) }));
    } catch (error) {
      console.error('Failed to delete feed boost', error);
    }
  },

fetchFeedMetrics: async () => {
    try {
      const metrics = await adminService.getFeedMetrics();
      set({ feedMetrics: metrics });
    } catch (error) {
      console.error('Failed to fetch feed metrics', error);
    }
  },

  fetchFraudStats: async () => {
    try {
      const stats = await adminService.getFraudStats();
      set({ fraudStats: stats });
    } catch (error) {
      console.error('Failed to fetch fraud stats', error);
    }
  },

resetPlatformStore: () => {}
}));