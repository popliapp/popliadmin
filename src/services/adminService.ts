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

  getFeedConfig: async () => {
    const res = await apiClient.get('/admin/feed-config');
    return res.data;
  },

  updateFeedConfig: async (weights: any) => {
    const res = await apiClient.post('/admin/feed-config', weights);
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
  }
};
