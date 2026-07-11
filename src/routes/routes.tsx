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
import { NearbyPage } from '@/pages/Nearby';
import { StaffPage } from '@/pages/Staff';
import { SupportPage } from '@/pages/Support';
import { SettingsPage } from '@/pages/Settings';
import { ChallengesPage } from '@/pages/Challenges';
import { CreateChallengePage } from '@/pages/CreateChallenge';
import { ChallengeDetailPage } from '@/pages/ChallengeDetail';

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
        element: <DashboardPage />,
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute allowedRoles={['super_admin', 'moderator', 'support_admin']}>
            <UsersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'reels',
        element: (
          <ProtectedRoute allowedRoles={['super_admin', 'moderator', 'marketing_admin']}>
            <ReelsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'feed-control',
        element: (
          <ProtectedRoute allowedRoles={['super_admin', 'marketing_admin']}>
            <FeedControlPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'monetization',
        element: (
          <ProtectedRoute allowedRoles={['super_admin', 'finance_admin']}>
            <MonetizationPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'fraud',
        element: (
          <ProtectedRoute allowedRoles={['super_admin', 'moderator']}>
            <FraudPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'campaigns',
        element: (
          <ProtectedRoute allowedRoles={['super_admin', 'marketing_admin']}>
            <CampaignsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'moderation',
        element: (
          <ProtectedRoute allowedRoles={['super_admin', 'moderator']}>
            <ModerationPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'messaging',
        element: (
          <ProtectedRoute allowedRoles={['super_admin', 'moderator']}>
            <MessagingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'analytics',
        element: (
          <ProtectedRoute allowedRoles={['super_admin', 'finance_admin', 'marketing_admin']}>
            <AnalyticsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'nearby',
        element: <NearbyPage />,
      },
      {
        path: 'challenges',
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute allowedRoles={['super_admin', 'marketing_admin']}>
                <ChallengesPage />
              </ProtectedRoute>
            ),
          },
        {
            path: 'create',
            element: (
              <ProtectedRoute allowedRoles={['super_admin', 'marketing_admin']}>
                <CreateChallengePage />
              </ProtectedRoute>
            ),
          },
       {
            path: ':id',
            element: (
              <ProtectedRoute allowedRoles={['super_admin', 'marketing_admin']}>
                <ChallengeDetailPage />
              </ProtectedRoute>
            ),
          },
          {
            path: ':id/edit',
            element: (
              <ProtectedRoute allowedRoles={['super_admin', 'marketing_admin']}>
                <div className="p-6">Edit Challenge Page (Coming Soon)</div>
              </ProtectedRoute>
            ),
          }
        ]
      },
      {
        path: 'staff',
        element: (
          <ProtectedRoute allowedRoles={['super_admin']}>
            <StaffPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'support',
        element: (
          <ProtectedRoute allowedRoles={['super_admin', 'support_admin']}>
            <SupportPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute allowedRoles={['super_admin']}>
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
        )
      }
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
