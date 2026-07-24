export type UserRole =
  | 'super_admin'
  | 'admin_partner'
  | 'moderator'
  | 'finance_admin'
  | 'support_admin'
  | 'marketing_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  status?: 'active' | 'inactive';
  permissions?: Record<string, boolean>;
  designation?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const ALL_PERMISSIONS: { group: string; permissions: { key: string; label: string }[] }[] = [
  {
    group: 'Dashboard',
    permissions: [
      { key: 'view_dashboard', label: 'View Dashboard' },
    ],
  },
  {
    group: 'Users',
    permissions: [
      { key: 'view_users', label: 'View Users' },
      { key: 'edit_users', label: 'Edit Users' },
      { key: 'suspend_users', label: 'Suspend Users' },
      { key: 'delete_users', label: 'Delete Users' },
      { key: 'verify_users', label: 'Verify Users' },
      { key: 'export_users', label: 'Export Users' },
    ],
  },
  {
    group: 'Reels',
    permissions: [
      { key: 'view_reels', label: 'View Reels' },
      { key: 'delete_reels', label: 'Delete Reels' },
      { key: 'hide_reels', label: 'Hide Reels' },
      { key: 'trend_reels', label: 'Force Trend Reels' },
      { key: 'moderate_reels', label: 'Moderate Reels' },
      { key: 'export_reels', label: 'Export Reels' },
    ],
  },
  {
    group: 'Feed Control',
    permissions: [
      { key: 'view_feed_control', label: 'View Feed Control' },
      { key: 'manage_feed_boosts', label: 'Manage Feed Boosts' },
      { key: 'edit_feed_weights', label: 'Edit Feed Weights' },
    ],
  },
  {
    group: 'Challenges',
    permissions: [
      { key: 'view_challenges', label: 'View Challenges' },
      { key: 'create_challenges', label: 'Create Challenges' },
      { key: 'edit_challenges', label: 'Edit Challenges' },
      { key: 'delete_challenges', label: 'Delete Challenges' },
      { key: 'manage_challenges', label: 'Manage Challenges' },
    ],
  },
  {
    group: 'Campaigns',
    permissions: [
      { key: 'view_campaigns', label: 'View Campaigns' },
      { key: 'create_campaigns', label: 'Create Campaigns' },
      { key: 'edit_campaigns', label: 'Edit Campaigns' },
      { key: 'delete_campaigns', label: 'Delete Campaigns' },
    ],
  },
  {
    group: 'Analytics',
    permissions: [
      { key: 'view_analytics', label: 'View Analytics' },
      { key: 'export_analytics', label: 'Export Analytics' },
    ],
  },
  {
    group: 'Monetization',
    permissions: [
      { key: 'view_monetization', label: 'View Monetization' },
      { key: 'approve_withdrawals', label: 'Approve Withdrawals' },
      { key: 'reject_withdrawals', label: 'Reject Withdrawals' },
      { key: 'manage_gifts', label: 'Manage Gifts' },
      { key: 'export_monetization', label: 'Export Monetization' },
    ],
  },
  {
    group: 'Financial Settings',
    permissions: [
      { key: 'view_financial_settings', label: 'View Financial Settings' },
      { key: 'edit_financial_settings', label: 'Edit Financial Settings' },
      { key: 'manage_coins', label: 'Manage Coins' },
      { key: 'manage_revenue_settings', label: 'Manage Revenue Settings' },
      { key: 'manage_gift_revenue', label: 'Manage Gift Revenue' },
      { key: 'manage_monetization_settings', label: 'Manage Monetization Settings' },
      { key: 'manage_coin_distribution', label: 'Manage Coin Distribution' },
      { key: 'manage_wallet_config', label: 'Manage Wallet Configuration' },
      { key: 'manage_withdrawal_config', label: 'Manage Withdrawal Configuration' },
      { key: 'manage_payment_config', label: 'Manage Payment Configuration' },
      { key: 'manage_commission_settings', label: 'Manage Commission Settings' },
      { key: 'manage_platform_charges', label: 'Manage Platform Charges' },
      { key: 'manage_taxes_fees', label: 'Manage Taxes & Fees' },
      { key: 'view_financial_reports', label: 'View Financial Reports' },
    ],
  },
  {
    group: 'Fraud & Security',
    permissions: [
      { key: 'view_fraud', label: 'View Fraud & Security' },
      { key: 'manage_fraud', label: 'Manage Fraud Cases' },
      { key: 'freeze_earnings', label: 'Freeze Earnings' },
    ],
  },
  {
    group: 'Moderation',
    permissions: [
      { key: 'view_moderation', label: 'View Moderation Queue' },
      { key: 'resolve_reports', label: 'Resolve Reports' },
      { key: 'dismiss_reports', label: 'Dismiss Reports' },
    ],
  },
  {
    group: 'Support',
    permissions: [
      { key: 'view_support', label: 'View Support Tickets' },
      { key: 'reply_support', label: 'Reply to Tickets' },
      { key: 'close_support', label: 'Close Tickets' },
    ],
  },
  {
    group: 'Admin Partners',
    permissions: [
      { key: 'view_partners', label: 'View Partners' },
      { key: 'create_partners', label: 'Create Partners' },
      { key: 'edit_partners', label: 'Edit Partners' },
      { key: 'delete_partners', label: 'Delete Partners' },
    ],
  },
  {
    group: 'Settings',
    permissions: [
      { key: 'view_settings', label: 'View Settings' },
      { key: 'update_settings', label: 'Update Settings' },
    ],
  },
  {
    group: 'Earnings',
    permissions: [
      { key: 'view_earnings', label: 'View Earnings' },
      { key: 'freeze_wallet', label: 'Freeze Wallet' },
      { key: 'release_wallet', label: 'Release Wallet' },
    ],
  },
  {
    group: 'Reports',
    permissions: [
      { key: 'view_reports', label: 'View Reports' },
      { key: 'download_reports', label: 'Download Reports' },
      { key: 'delete_reports', label: 'Delete Reports' },
    ],
  },
  {
    group: 'Payments',
    permissions: [
      { key: 'view_payments', label: 'View Payments' },
      { key: 'refund_payments', label: 'Refund Payments' },
    ],
  },
  {
    group: 'Roles & Permissions',
    permissions: [
      { key: 'manage_roles', label: 'Manage Roles' },
    ],
  },
];