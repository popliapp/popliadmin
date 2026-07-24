import {
  LayoutDashboard,
  Users,
    MessageSquare,
  Video,
  Sliders,
  Coins,
  Trophy,
  AlertTriangle,
  HelpCircle,
  Settings,
  Gift,
  Percent,
  UserPlus,
  ArrowDownToLine,
  TrendingUp,
  Megaphone,
  ShieldAlert,
  Wallet,
} from 'lucide-react';
import { UserRole } from '../types';

export interface NavItem {
  title: string;
  path: string;
  icon: any;
  permission?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAVIGATION_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        title: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
        permission: 'view_dashboard',
      },
    ],
  },
  {
    label: 'Content & Users',
    items: [
      {
        title: 'User Management',
        path: '/users',
        icon: Users,
        permission: 'view_users',
      },
      {
        title: 'Reel Management',
        path: '/reels',
        icon: Video,
        permission: 'view_reels',
      },
      {
        title: 'Feed Control Center',
        path: '/feed-control',
        icon: Sliders,
        permission: 'view_feed_control',
      },
      {
        title: 'Challenges',
        path: '/challenges',
        icon: Trophy,
        permission: 'view_challenges',
      },
      {
        title: 'Campaigns',
        path: '/campaigns',
        icon: Megaphone,
        permission: 'view_campaigns',
      },
    ],
  },
  {
    label: 'Financial Settings',
    items: [
      {
        title: 'General Settings',
        path: '/financial/general',
        icon: Settings,
        permission: 'view_financial_settings',
      },
      {
        title: 'Creator Earnings',
        path: '/financial/earnings',
        icon: Coins,
        permission: 'view_financial_settings',
      },
      {
        title: 'Gift Economy',
        path: '/financial/gifts',
        icon: Gift,
        permission: 'manage_gift_revenue',
      },
      {
        title: 'Coin Economy',
        path: '/financial/coins',
        icon: Coins,
        permission: 'manage_coins',
      },
      {
        title: 'Referral Rewards',
        path: '/financial/referrals',
        icon: UserPlus,
        permission: 'manage_revenue_settings',
      },
      {
        title: 'Withdrawal Rules',
        path: '/financial/withdrawals',
        icon: ArrowDownToLine,
        permission: 'manage_withdrawal_config',
      },
      {
        title: 'Platform Fee & Tax',
        path: '/financial/fees',
        icon: Percent,
        permission: 'manage_taxes_fees',
      },
      {
        title: 'Coin Packages',
        path: '/financial/coin-packages',
        icon: Coins,
        permission: 'manage_coin_distribution',
      },
    ],
  },
  {
    label: 'Analytics',
    items: [
      {
        title: 'Analytics',
        path: '/analytics',
        icon: TrendingUp,
        permission: 'view_analytics',
      },
    ],
  },
  {
    label: 'Operations',
    items: [
      {
        title: 'Monetization',
        path: '/monetization',
        icon: Wallet,
        permission: 'view_monetization',
      },
      {
        title: 'Fraud & Security',
        path: '/fraud',
        icon: ShieldAlert,
        permission: 'view_fraud',
      },
      {
        title: 'Moderation Queue',
        path: '/moderation',
        icon: AlertTriangle,
        permission: 'view_moderation',
      },
   {
        title: 'Chat Moderation',
        path: '/messaging',
        icon: MessageSquare,
        permission: 'view_support',
      },
      {
        title: 'Customer Support',
        path: '/support',
        icon: HelpCircle,
        permission: 'view_support',
      },
    ],
  },
  {
    label: 'Admin',
    items: [
      {
        title: 'Admin Partners',
        path: '/admin-partners',
        icon: UserPlus,
        permission: 'view_partners',
      },
      {
        title: 'Settings',
        path: '/settings',
        icon: Settings,
        permission: 'view_settings',
      },
    ],
  },
];

export const NAVIGATION_ITEMS: NavItem[] = NAVIGATION_GROUPS.flatMap((g) => g.items);