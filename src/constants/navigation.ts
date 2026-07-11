import { 
  LayoutDashboard, 
  Users, 
  Video, 
  Sliders, 
  Coins, 
  Trophy,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';
import { UserRole } from '../types';

export interface NavItem {
  title: string;
  path: string;
  icon: any;
  roles?: UserRole[];
}

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'User Management',
    path: '/users',
    icon: Users,
    roles: ['super_admin', 'moderator', 'support_admin'],
  },
  {
    title: 'Reel Management',
    path: '/reels',
    icon: Video,
    roles: ['super_admin', 'moderator', 'marketing_admin'],
  },
  {
    title: 'Feed Control Center',
    path: '/feed-control',
    icon: Sliders,
    roles: ['super_admin', 'marketing_admin'],
  },
  {
    title: 'Coin & Monetization',
    path: '/monetization',
    icon: Coins,
    roles: ['super_admin', 'finance_admin'],
  },
  {
    title: 'Challenges',
    path: '/challenges',
    icon: Trophy,
    roles: ['super_admin', 'marketing_admin'],
  },
  {
    title: 'Moderation Queue',
    path: '/moderation',
    icon: AlertTriangle,
    roles: ['super_admin', 'moderator'],
  },
  {
    title: 'Customer Support',
    path: '/support',
    icon: HelpCircle,
    roles: ['super_admin', 'support_admin'],
  }
];
