import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Trophy, Users, Eye, Heart, Share2,
  Check, X, Gift, Play, Volume2, Trash2, CheckCircle, XCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { challengesApi } from '@/services/api/challenges';
import { cn } from '@/utils/cn';

type Tab = 'overview' | 'participants' | 'reels' | 'rewards';

export const ChallengeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('overview');
  const [challenge, setChallenge] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [reels, setReels] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [reelsLoading, setReelsLoading] = useState(false);
  const [rewardsLoading, setRewardsLoading] = useState(false);
  const [winnerIds, setWinnerIds] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [previewReel, setPreviewReel] = useState<any>(null);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const loadOverview = useCallback(async () => {
    if (!id) return;
    const [chRes, anRes] = await Promise.all([
      challengesApi.getChallenge(id),
      challengesApi.getAnalytics(id),
    ]);
    setChallenge(chRes.data);
    setAnalytics(anRes.data);
  }, [id]);

  const loadParticipants = useCallback(async () => {
    if (!id) return;
    setParticipantsLoading(true);
    try {
      const res = await challengesApi.getParticipants(id, { page: 1, limit: 20 });
      setParticipants(res.data.data);
    } finally {
      setParticipantsLoading(false);
    }
  }, [id]);

  const loadReels = useCallback(async () => {
    if (!id) return;
    setReelsLoading(true);
    try {
      const res = await challengesApi.getReels(id, { page: 1, limit: 20 });
      setReels(res.data.data);
    } finally {
      setReelsLoading(false);
    }
  }, [id]);

  const loadRewards = useCallback(async () => {
    if (!id) return;
    setRewardsLoading(true);
    try {
      const res = await challengesApi.getRewards(id);
      setRewards(res.data);
    } finally {
      setRewardsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    loadOverview().finally(() => setLoading(false));
  }, [loadOverview]);

  useEffect(() => {
    if (tab === 'participants') loadParticipants();
    if (tab === 'reels') loadReels();
    if (tab === 'rewards') loadRewards();
  }, [tab, loadParticipants, loadReels, loadRewards]);

  const handleApproval = async (reelId: string, status: 'APPROVED' | 'REJECTED', reason?: string) => {
    try {
      setApprovingId(reelId);
      await challengesApi.approveReel(reelId, status, reason);
      setReels(prev => prev.map(r => r.id === reelId ? { ...r, challengeApprovalStatus: status } : r));
    } catch (e) {
      console.error('Approval failed:', e);
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectTarget || rejectLoading) return;
    setRejectLoading(true);
    await handleApproval(rejectTarget, 'REJECTED', rejectReason);
    setRejectLoading(false);
    setRejectTarget(null);
    setRejectReason('');
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm('Delete this challenge permanently?')) return;
    await challengesApi.deleteChallenge(id);
    navigate('/challenges');
  };

  const handleFreezeWinners = async () => {
    if (!id) return;
    const ids = winnerIds.split(',').map(s => s.trim()).filter(Boolean);
    if (ids.length === 0) {
      setActionMsg('Enter at least one winner user ID');
      return;
    }
    await challengesApi.freezeLeaderboard(id, ids);
    setActionMsg('Leaderboard frozen and rewards queued');
    loadRewards();
    loadOverview();
  };

  const handleProcessReward = async (txId: string) => {
    await challengesApi.processReward(txId);
    loadRewards();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 bg-muted animate-pulse rounded-lg" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 text-center py-14">
        <Trophy className="w-8 h-8 text-muted-foreground opacity-20" />
        <p className="text-[13px] font-semibold text-foreground">Challenge not found</p>
      </div>
    );
  }

  const STATUS_COLORS: Record<string, string> = {
    ACTIVE: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    COMPLETED: 'bg-muted text-muted-foreground border-border',
    CANCELLED: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    DRAFT: 'bg-muted text-muted-foreground border-border',
    SCHEDULED: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    PAUSED: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  };

  const APPROVAL_COLORS: Record<string, string> = {
    APPROVED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    REJECTED: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    PENDING: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/challenges')}
            className="w-9 h-9 flex items-center justify-center border border-border rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-[26px] font-bold tracking-tight text-foreground">{challenge.title}</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              {challenge.type}
              <span className={cn(
                'ml-2 inline-flex items-center px-2 py-0.5 rounded border text-[11px] font-semibold uppercase tracking-wide',
                STATUS_COLORS[challenge.status] || 'bg-muted text-muted-foreground border-border'
              )}>
                {challenge.status}
              </span>
            </p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="h-9 px-4 text-[13px] font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-colors flex items-center gap-2"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete Challenge
        </button>
      </div>

      <div className="flex items-center gap-1 bg-muted rounded-lg p-1 w-fit">
        {(['overview', 'participants', 'reels', 'rewards'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'h-7 px-3 rounded-md text-[12px] font-medium transition-all capitalize',
              tab === t ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Participants', value: analytics?.totalParticipants ?? 0, icon: Users },
              { label: 'Views', value: analytics?.totalViews ?? 0, icon: Eye },
              { label: 'Likes', value: analytics?.totalLikes ?? 0, icon: Heart },
              { label: 'Shares', value: analytics?.totalShares ?? 0, icon: Share2 },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
                </div>
                <span className="text-[22px] font-bold text-foreground">{value.toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            {[
              { label: 'Reward Pool', value: `₹${challenge.rewardPool}`, highlight: true },
              { label: 'Start Date', value: challenge.startDate ? new Date(challenge.startDate).toLocaleString('en-IN') : '—' },
              { label: 'End Date', value: new Date(challenge.endDate).toLocaleString('en-IN') },
              { label: 'Requires Approval', value: challenge.requiresApproval ? 'Yes' : 'No' },
            ].map(({ label, value, highlight }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
                <span className={cn('text-[13px] font-semibold', highlight ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground')}>
                  {value}
                </span>
              </div>
            ))}
            {challenge.description && (
              <div className="pt-3 border-t border-border">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Description</span>
                <p className="text-[13px] text-foreground leading-relaxed">{challenge.description}</p>
              </div>
            )}
            {challenge.rules && (
              <div className="pt-3 border-t border-border">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Rules</span>
                <p className="text-[13px] text-foreground leading-relaxed">{challenge.rules}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'participants' && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {['Rank', 'User', 'Score'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {participantsLoading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      <td colSpan={3} className="px-5 py-3.5">
                        <div className="h-4 bg-muted animate-pulse rounded" />
                      </td>
                    </tr>
                  ))
                ) : participants.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-10 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="w-8 h-8 text-muted-foreground opacity-20" />
                        <p className="text-[13px] font-semibold text-foreground">No participants yet</p>
                      </div>
                    </td>
                  </tr>
                ) : participants.map((p, i) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 text-[12px] font-mono text-muted-foreground">#{i + 1}</td>
                    <td className="px-5 py-3.5 text-[13px] font-semibold text-foreground">{p.user?.name || p.user?.username}</td>
                    <td className="px-5 py-3.5 text-[12px] font-mono text-foreground">{p.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'reels' && (
        <div className="space-y-2.5">
          {reelsLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
            ))
          ) : reels.length === 0 ? (
            <div className="bg-card border border-border rounded-xl flex flex-col items-center justify-center gap-2 text-center py-14">
              <Play className="w-8 h-8 text-muted-foreground opacity-20" />
              <p className="text-[13px] font-semibold text-foreground">No reels submitted yet</p>
            </div>
          ) : reels.map(reel => (
            <div key={reel.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4 hover:border-primary/30 transition-colors">
              <button
                onClick={() => setPreviewReel(reel)}
                className="w-14 h-14 flex-shrink-0 bg-muted border border-border rounded-lg overflow-hidden relative group"
              >
                {reel.thumbnailUrl ? (
                  <img src={reel.thumbnailUrl} alt="thumbnail" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-4 h-4 text-white fill-white" />
                </div>
              </button>

              <div className="flex-1 min-w-0">
                <span className="text-[13px] font-semibold text-foreground block">
                  {reel.creator?.name || reel.creator?.username}
                </span>
                <span className={cn(
                  'inline-flex items-center mt-1 px-1.5 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider',
                  APPROVAL_COLORS[reel.challengeApprovalStatus] || 'bg-muted text-muted-foreground border-border'
                )}>
                  {reel.challengeApprovalStatus}
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {reel.challengeApprovalStatus === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleApproval(reel.id, 'APPROVED')}
                      disabled={approvingId === reel.id}
                      className="w-8 h-8 flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 disabled:opacity-50 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setRejectTarget(reel.id)}
                      className="w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
                {reel.challengeApprovalStatus === 'APPROVED' && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <button
                      onClick={() => setRejectTarget(reel.id)}
                      className="h-7 px-2 text-[11px] font-semibold text-muted-foreground hover:text-red-500 border border-border hover:border-red-300 rounded-lg transition-colors"
                    >
                      Revoke
                    </button>
                  </div>
                )}
                {reel.challengeApprovalStatus === 'REJECTED' && (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'rewards' && (
        <div className="space-y-5">
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <h2 className="text-[15px] font-semibold text-foreground">Freeze Leaderboard</h2>
            <p className="text-[12px] text-muted-foreground">Enter comma-separated user IDs to select winners and queue rewards.</p>
            <input
              type="text"
              value={winnerIds}
              onChange={(e) => setWinnerIds(e.target.value)}
              placeholder="userId1, userId2, userId3"
              className="w-full h-9 bg-muted border border-border rounded-lg px-3 text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-all"
            />
            <button
              onClick={handleFreezeWinners}
              className="h-9 px-4 bg-primary text-primary-foreground text-[13px] font-semibold rounded-lg hover:bg-primary/90 active:scale-[0.97] transition-all"
            >
              Freeze and Queue Rewards
            </button>
            {actionMsg && (
              <p className="text-[12px] text-emerald-600 dark:text-emerald-400 font-medium">{actionMsg}</p>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-[15px] font-semibold text-foreground">Reward Transactions</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {['Winner', 'Amount', 'Status', 'Action'].map(h => (
                      <th key={h} className={cn(
                        'px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider',
                        h === 'Action' ? 'text-right' : 'text-left'
                      )}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rewardsLoading ? (
                    [...Array(3)].map((_, i) => (
                      <tr key={i} className="border-b border-border">
                        <td colSpan={4} className="px-5 py-3.5">
                          <div className="h-4 bg-muted animate-pulse rounded" />
                        </td>
                      </tr>
                    ))
                  ) : rewards.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-10 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Gift className="w-8 h-8 text-muted-foreground opacity-20" />
                          <p className="text-[13px] font-semibold text-foreground">No reward transactions yet</p>
                        </div>
                      </td>
                    </tr>
                  ) : rewards.map(tx => (
                    <tr key={tx.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5 text-[13px] font-semibold text-foreground">
                        {tx.winner?.name || tx.winner?.username}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] font-semibold text-emerald-600 dark:text-emerald-400">
                        ₹{tx.rewardAmount}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider',
                          tx.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : tx.status === 'FAILED'
                            ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                        )}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {tx.status === 'PENDING' && (
                          <button
                            onClick={() => handleProcessReward(tx.id)}
                            className="h-7 px-3 text-[12px] font-semibold text-primary border border-primary/30 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-1.5 ml-auto"
                          >
                            <Gift className="w-3 h-3" />
                            Process
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {previewReel && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} exit={{ opacity: 0 }}
              onClick={() => setPreviewReel(null)}
              className="fixed inset-0 z-50 bg-black"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-card border border-border rounded-xl p-5 w-full max-w-sm flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-border pb-3 mb-3">
                <span className="text-[13px] font-semibold text-foreground flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
                  Reel Preview
                </span>
                <button onClick={() => setPreviewReel(null)} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="aspect-[9/16] bg-muted border border-border relative overflow-hidden rounded-lg">
                {previewReel.mediaUrl ? (
                  <video src={previewReel.mediaUrl} autoPlay loop muted controls className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-muted-foreground opacity-40" />
                  </div>
                )}
              </div>
              <div className="mt-3">
                <span className="text-[13px] font-semibold text-foreground block">
                  {previewReel.creator?.name || previewReel.creator?.username}
                </span>
                <span className={cn(
                  'inline-flex items-center mt-1 px-1.5 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider',
                  APPROVAL_COLORS[previewReel.challengeApprovalStatus] || 'bg-muted text-muted-foreground border-border'
                )}>
                  {previewReel.challengeApprovalStatus}
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {rejectTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              onClick={() => { setRejectTarget(null); setRejectReason(''); }}
              className="fixed inset-0 z-50 bg-black"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-card border border-border rounded-xl p-5 w-full max-w-sm shadow-2xl space-y-4"
            >
              <div>
                <h3 className="text-[15px] font-semibold text-foreground">Reject Reel</h3>
                <p className="text-[12px] text-muted-foreground mt-0.5">This reason will be sent to the creator via notification.</p>
              </div>
              <textarea
                autoFocus
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Video quality too low, does not match challenge theme..."
                className="w-full h-24 bg-muted border border-border rounded-lg px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-destructive transition-all resize-none"
              />
              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => { setRejectTarget(null); setRejectReason(''); }}
                  className="h-9 px-4 text-[13px] font-semibold text-muted-foreground border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectConfirm}
                  disabled={rejectLoading}
                  className="h-9 px-4 text-[13px] font-semibold text-white bg-destructive hover:bg-destructive/90 rounded-lg disabled:opacity-50 transition-colors"
                >
                  {rejectLoading ? 'Rejecting...' : 'Confirm Reject'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};