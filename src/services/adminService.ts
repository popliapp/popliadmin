import { apiClient } from './api';

export const adminService = {
  login: async (email: string, passwordString: string) => {
    const res = await apiClient.post('/admin/auth/login', { email, password: passwordString });
    if (res.data.token) {
      localStorage.setItem('adminToken', res.data.token);
    }
    return res.data;
  },

  getDashboardStats: async () => {
    const res = await apiClient.get('/admin/dashboard-stats');
    return res.data;
  },

  getUsers: async () => {
    const res = await apiClient.get('/admin/users');
    return res.data;
  },

  getReels: async () => {
    const res = await apiClient.get('/admin/reels');
    return res.data;
  },

getTransactions: async () => {
    const res = await apiClient.get('/admin/transactions');
    return res.data;
  },

  getWithdrawals: async () => {
    const res = await apiClient.get('/admin/withdrawals');
    return res.data;
  },

  getReports: async () => {
    const res = await apiClient.get('/admin/reports');
    return res.data;
  },

  getTickets: async () => {
    const res = await apiClient.get('/admin/tickets');
    return res.data;
  },

  suspendUser: async (userId: string) => {
    const res = await apiClient.post(`/admin/users/${userId}/suspend`);
    return res.data;
  },

  deleteReel: async (reelId: string) => {
    const res = await apiClient.post(`/admin/reels/${reelId}/delete`);
    return res.data;
  },

  unbanUser: async (userId: string) => {
    const res = await apiClient.post(`/admin/users/${userId}/unban`);
    return res.data;
  },

  verifyUser: async (userId: string) => {
    const res = await apiClient.post(`/admin/users/${userId}/verify`);
    return res.data;
  },

  removeVerification: async (userId: string) => {
    const res = await apiClient.post(`/admin/users/${userId}/remove-verification`);
    return res.data;
  },

  shadowBanUser: async (userId: string) => {
    const res = await apiClient.post(`/admin/users/${userId}/shadowban`);
    return res.data;
  },

  freezeEarnings: async (userId: string) => {
    const res = await apiClient.post(`/admin/users/${userId}/freeze-earnings`);
    return res.data;
  },

  hideReel: async (reelId: string) => {
    const res = await apiClient.post(`/admin/reels/${reelId}/hide`);
    return res.data;
  },

  forceTrendReel: async (reelId: string) => {
    const res = await apiClient.post(`/admin/reels/${reelId}/force-trend`);
    return res.data;
  },

  restrictAgeReel: async (reelId: string) => {
    const res = await apiClient.post(`/admin/reels/${reelId}/restrict-age`);
    return res.data;
  },

  disableCommentsReel: async (reelId: string) => {
    const res = await apiClient.post(`/admin/reels/${reelId}/disable-comments`);
    return res.data;
  },

 approveWithdrawal: async (txId: string) => {
    const res = await apiClient.post(`/admin/withdrawals/${txId}/approve`);
    return res.data;
  },

  rejectWithdrawal: async (txId: string) => {
    const res = await apiClient.post(`/admin/withdrawals/${txId}/reject`);
    return res.data;
  },

  getGifts: async () => {
    const res = await apiClient.get('/admin/gifts');
    return res.data;
  },

  addGift: async (giftData: any) => {
    const res = await apiClient.post('/admin/gifts', giftData);
    return res.data;
  },

  deleteGift: async (giftId: string) => {
    const res = await apiClient.delete(`/admin/gifts/${giftId}`);
    return res.data;
  },

  toggleUserMonetization: async (userId: string) => {
    const res = await apiClient.patch(`/admin/users/${userId}/monetization`);
    return res.data;
  },


  getConfigs: async () => {
    const res = await apiClient.get('/admin/configs');
    return res.data;
  },

  updateConfig: async (key: string, value: any) => {
    const res = await apiClient.post('/admin/configs', { key, value });
    return res.data;
  },

  resolveReport: async (reportId: string, action: string) => {
    const res = await apiClient.patch(`/admin/reports/${reportId}/resolve`, { action });
    return res.data;
  },

  replyToTicket: async (ticketId: string, message: string) => {
    const res = await apiClient.post(`/admin/tickets/${ticketId}/reply`, { message });
    return res.data;
  },
getCoinPackagesAdmin: async () => {
    const res = await apiClient.get('/coin-packages/admin');
    return res.data;
  },

  createCoinPackage: async (data: any) => {
    const res = await apiClient.post('/coin-packages/admin', data);
    return res.data;
  },

  updateCoinPackage: async (packageId: string, data: any) => {
    const res = await apiClient.patch(`/coin-packages/admin/${packageId}`, data);
    return res.data;
  },

  deleteCoinPackage: async (packageId: string) => {
    const res = await apiClient.delete(`/coin-packages/admin/${packageId}`);
    return res.data;
  },

updateGift: async (giftId: string, data: any) => {
    const res = await apiClient.patch(`/admin/gifts/${giftId}`, data);
    return res.data;
  },
getCampaigns: async () => {
    const res = await apiClient.get('/admin/campaigns');
    return res.data;
  },

  createCampaign: async (data: any) => {
    const res = await apiClient.post('/admin/campaigns', data);
    return res.data;
  },

  updateCampaignStatus: async (id: string, status: string) => {
    const res = await apiClient.patch(`/admin/campaigns/${id}/status`, { status });
    return res.data;
  },

  deleteCampaign: async (id: string) => {
    const res = await apiClient.delete(`/admin/campaigns/${id}`);
    return res.data;
  },

  getAnalytics: async () => {
    const res = await apiClient.get('/admin/analytics');
    return res.data;
  },

  getFeedMetrics: async () => {
    const res = await apiClient.get('/admin/feed-metrics');
    return res.data;
  },

getFraudStats: async () => {
    const res = await apiClient.get('/admin/fraud-stats');
    return res.data;
  },

  getFeedBoosts: async () => {
    const res = await apiClient.get('/admin/feed-boosts');
    return res.data;
  },

  createFeedBoost: async (data: { type: string; target: string; intensity: number }) => {
    const res = await apiClient.post('/admin/feed-boosts', data);
    return res.data;
  },

deleteFeedBoost: async (boostId: string) => {
    const res = await apiClient.delete(`/admin/feed-boosts/${boostId}`);
    return res.data;
  },

  getAdminPartners: async (params?: { search?: string; status?: string; page?: number; limit?: number }) => {
    const res = await apiClient.get('/admin/partners', { params });
    return res.data;
  },

  createAdminPartner: async (data: any) => {
    const res = await apiClient.post('/admin/partners', data);
    return res.data;
  },

  updateAdminPartner: async (id: string, data: any) => {
    const res = await apiClient.patch(`/admin/partners/${id}`, data);
    return res.data;
  },

  resetAdminPartnerPassword: async (id: string, newPassword: string) => {
    const res = await apiClient.post(`/admin/partners/${id}/reset-password`, { newPassword });
    return res.data;
  },

  updateAdminPartnerStatus: async (id: string, status: 'ACTIVE' | 'SUSPENDED') => {
    const res = await apiClient.patch(`/admin/partners/${id}/status`, { status });
    return res.data;
  },

deleteAdminPartner: async (id: string) => {
    const res = await apiClient.delete(`/admin/partners/${id}`);
    return res.data;
  },

getFeatureFlags: async () => {
    const res = await apiClient.get('/admin/feature-flags');
    return res.data;
  },

  updateFeatureFlag: async (key: string, enabled: boolean) => {
    const res = await apiClient.patch(`/admin/feature-flags/${key}`, { enabled });
    return res.data;
  },

  getMonetizationSummary: async () => {
    const res = await apiClient.get('/admin/monetization-summary');
    return res.data;
  },

  getPublicPlatformStats: async () => {
    const res = await apiClient.get('/admin/public/platform-stats');
    return res.data;
  },

  getBotProtectionStatus: async () => {
    const res = await apiClient.get('/admin/security/bot-protection');
    return res.data;
  },

  enableBotProtection: async (reason?: string) => {
    const res = await apiClient.post('/admin/security/bot-protection/enable', { reason });
    return res.data;
  },

 disableBotProtection: async (reason?: string) => {
    const res = await apiClient.post('/admin/security/bot-protection/disable', { reason });
    return res.data;
  },

  getChatModerationStats: async () => {
    const res = await apiClient.get('/admin/chat-moderation/stats');
    return res.data;
  },

  getChatModerationFlags: async (params?: {
    search?: string;
    status?: string;
    severity?: string;
    flagType?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) => {
    const res = await apiClient.get('/admin/chat-moderation/flags', { params });
    return res.data;
  },

  getChatModerationFlag: async (flagId: string) => {
    const res = await apiClient.get(`/admin/chat-moderation/flags/${flagId}`);
    return res.data;
  },

  getChatConversation: async (chatId: string) => {
    const res = await apiClient.get(`/admin/chat-moderation/conversation/${chatId}`);
    return res.data;
  },

performChatModerationAction: async (flagId: string, data: {
    action: string;
    reason?: string;
    targetUserId?: string;
  }) => {
    const res = await apiClient.post(`/admin/chat-moderation/flags/${flagId}/action`, data);
    return res.data;
  },

  getFeedConfig: async () => {
    const res = await apiClient.get('/admin/feed/config');
    return res.data;
  },

  updateFeedConfig: async (weights: Record<string, number>, notes?: string) => {
    const res = await apiClient.patch('/admin/feed/config', { weights, notes });
    return res.data;
  },

  getFeedConfigVersions: async () => {
    const res = await apiClient.get('/admin/feed/config/versions');
    return res.data;
  },

  rollbackFeedConfig: async (versionId: string) => {
    const res = await apiClient.post(`/admin/feed/config/rollback/${versionId}`);
    return res.data;
  },

  getFeedBoostsV2: async () => {
    const res = await apiClient.get('/admin/feed/boosts');
    return res.data;
  },

  createFeedBoostV2: async (data: {
    type: string;
    target: string;
    intensity: number;
    priority?: number;
    startDate?: string;
    endDate?: string;
    notes?: string;
  }) => {
    const res = await apiClient.post('/admin/feed/boosts', data);
    return res.data;
  },

  updateFeedBoost: async (id: string, data: {
    intensity?: number;
    priority?: number;
    status?: string;
    endDate?: string;
    notes?: string;
  }) => {
    const res = await apiClient.patch(`/admin/feed/boosts/${id}`, data);
    return res.data;
  },

  deleteFeedBoostV2: async (id: string) => {
    const res = await apiClient.delete(`/admin/feed/boosts/${id}`);
    return res.data;
  },

  simulateFeed: async (params: { category?: string; city?: string; limit?: number }) => {
    const res = await apiClient.get('/admin/feed/simulate', { params });
    return res.data;
  },

  getFeedMetricsV2: async () => {
    const res = await apiClient.get('/admin/feed/metrics');
    return res.data;
  },

  getFeedAuditLogs: async () => {
    const res = await apiClient.get('/admin/feed/audit-logs');
    return res.data;
  },
};