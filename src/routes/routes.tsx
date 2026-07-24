import { createBrowserRouter, Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '@/pages/Login';
import { DashboardPage } from '@/pages/Dashboard';
import { UsersPage } from '@/pages/Users';
import { ReelsPage } from '@/pages/Reels';
import { FeedControlPage } from '@/pages/FeedControl';
import { MonetizationPage } from '@/pages/Monetization';
import { FraudPage } from '@/pages/Fraud';
import { CampaignsPage } from '@/pages/Campaigns';
import { ModerationPage } from '@/pages/Moderation';
import { MessagingPage } from '@/pages/Messaging';
import { AnalyticsPage } from '@/pages/Analytics';


import { SupportPage } from '@/pages/Support';
import { SettingsPage } from '@/pages/Settings';
import { ChallengesPage } from '@/pages/Challenges';
import { CreateChallengePage } from '@/pages/CreateChallenge';
import { ChallengeDetailPage } from '@/pages/ChallengeDetail';
import {
  GeneralSettingsPage,
  CreatorEarningsPage,
  GiftEconomyPage,
  CoinEconomyPage,
  ReferralRewardsPage,
  WithdrawalRulesPage,
  PlatformFeeTaxPage,
} from '@/pages/FinancialSettings';
import { CoinPackagesPage } from '@/pages/CoinPackagesPage';
import { AdminPartnersPage } from '@/pages/AdminPartners';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute requiredPermission="view_dashboard">
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute requiredPermission="view_users">
            <UsersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'reels',
        element: (
          <ProtectedRoute requiredPermission="view_reels">
            <ReelsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'feed-control',
        element: (
          <ProtectedRoute requiredPermission="view_feed_control">
            <FeedControlPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'monetization',
        element: (
          <ProtectedRoute requiredPermission="view_monetization">
            <MonetizationPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'fraud',
        element: (
          <ProtectedRoute requiredPermission="view_fraud">
            <FraudPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'campaigns',
        element: (
          <ProtectedRoute requiredPermission="view_campaigns">
            <CampaignsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'moderation',
        element: (
          <ProtectedRoute requiredPermission="view_moderation">
            <ModerationPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'messaging',
        element: (
          <ProtectedRoute requiredPermission="view_support">
            <MessagingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'analytics',
        element: (
          <ProtectedRoute requiredPermission="view_analytics">
            <AnalyticsPage />
          </ProtectedRoute>
        ),
      },
     
      {
        path: 'challenges',
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute requiredPermission="view_challenges">
                <ChallengesPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'create',
            element: (
              <ProtectedRoute requiredPermission="create_challenges">
                <CreateChallengePage />
              </ProtectedRoute>
            ),
          },
          {
            path: ':id',
            element: (
              <ProtectedRoute requiredPermission="view_challenges">
                <ChallengeDetailPage />
              </ProtectedRoute>
            ),
          },
          {
            path: ':id/edit',
            element: (
              <ProtectedRoute requiredPermission="edit_challenges">
                <div className="p-6">Edit Challenge Page (Coming Soon)</div>
              </ProtectedRoute>
            ),
          },
        ],
      },
   
      {
        path: 'admin-partners',
        element: (
          <ProtectedRoute requiredPermission="view_partners">
            <AdminPartnersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'support',
        element: (
          <ProtectedRoute requiredPermission="view_support">
            <SupportPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'financial',
        children: [
          {
            path: 'general',
            element: (
              <ProtectedRoute requiredPermission="view_financial_settings">
                <GeneralSettingsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'earnings',
            element: (
              <ProtectedRoute requiredPermission="view_financial_settings">
                <CreatorEarningsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'gifts',
            element: (
              <ProtectedRoute requiredPermission="manage_gift_revenue">
                <GiftEconomyPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'coins',
            element: (
              <ProtectedRoute requiredPermission="manage_coins">
                <CoinEconomyPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'referrals',
            element: (
              <ProtectedRoute requiredPermission="manage_revenue_settings">
                <ReferralRewardsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'withdrawals',
            element: (
              <ProtectedRoute requiredPermission="manage_withdrawal_config">
                <WithdrawalRulesPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'fees',
            element: (
              <ProtectedRoute requiredPermission="manage_taxes_fees">
                <PlatformFeeTaxPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'coin-packages',
            element: (
              <ProtectedRoute requiredPermission="manage_coin_distribution">
                <CoinPackagesPage />
              </ProtectedRoute>
            ),
          },
        ],
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute requiredPermission="view_settings">
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'unauthorized',
        element: (
          <div className="flex flex-col items-center justify-center h-96 text-center bg-[#FFFFFF] border border-[#BAE6FD] rounded-[2px] p-6 font-mono select-none">
            <h2 className="text-xl font-bold text-red-600 mb-2 uppercase tracking-wide">Access Revoked</h2>
            <p className="text-slate-500 text-xs uppercase leading-normal">Your current operator clearance role lacks permissions to audit this module dataset.</p>
          </div>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);