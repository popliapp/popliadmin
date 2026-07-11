import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Users, Eye, Heart, Share2, Check, X, Gift, Play, Volume2, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { challengesApi } from '@/services/api/challenges';

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
    return <div className="p-6 text-muted-foreground font-mono text-sm">Loading...</div>;
  }

  if (!challenge) {
    return <div className="p-6 text-muted-foreground font-mono text-sm">Challenge not found</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
         <button
            onClick={() => navigate('/challenges')}
            className="w-9 h-9 flex items-center justify-center border border-border rounded-sm hover:bg-muted text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">{challenge.title}</h1>
            <p className="text-sm text-muted-foreground font-mono">{challenge.type} · {challenge.status}</p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="px-4 py-2 text-xs font-bold uppercase tracking-wide text-red-600 border border-red-200 rounded-sm hover:bg-red-50"
        >
          Delete Challenge
        </button>
      </div>

    <div className="flex items-center gap-1 border-b border-border">
        {(['overview', 'participants', 'reels', 'rewards'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wide border-b-2 transition-colors ${
              tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-sm p-4">
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-mono uppercase mb-1"><Users className="w-3.5 h-3.5" /> Participants</div>
              <div className="text-xl font-bold text-card-foreground">{analytics?.totalParticipants ?? 0}</div>
            </div>
            <div className="bg-card border border-border rounded-sm p-4">
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-mono uppercase mb-1"><Eye className="w-3.5 h-3.5" /> Views</div>
              <div className="text-xl font-bold text-card-foreground">{analytics?.totalViews ?? 0}</div>
            </div>
            <div className="bg-card border border-border rounded-sm p-4">
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-mono uppercase mb-1"><Heart className="w-3.5 h-3.5" /> Likes</div>
              <div className="text-xl font-bold text-card-foreground">{analytics?.totalLikes ?? 0}</div>
            </div>
            <div className="bg-card border border-border rounded-sm p-4">
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-mono uppercase mb-1"><Share2 className="w-3.5 h-3.5" /> Shares</div>
              <div className="text-xl font-bold text-card-foreground">{analytics?.totalShares ?? 0}</div>
            </div>
          </div>

      <div className="bg-card border border-border rounded-sm p-5 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-mono uppercase text-xs flex items-center gap-1"><Trophy className="w-3.5 h-3.5" /> Reward Pool</span>
              <span className="font-bold text-success">₹{challenge.rewardPool}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-mono uppercase text-xs">Start Date</span>
              <span className="text-card-foreground">{challenge.startDate ? new Date(challenge.startDate).toLocaleString() : '-'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-mono uppercase text-xs">End Date</span>
              <span className="text-card-foreground">{new Date(challenge.endDate).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-mono uppercase text-xs">Requires Approval</span>
              <span className="text-card-foreground">{challenge.requiresApproval ? 'Yes' : 'No'}</span>
            </div>
            {challenge.description && (
              <div className="pt-3 border-t border-border">
                <div className="text-muted-foreground font-mono uppercase text-xs mb-1">Description</div>
                <p className="text-sm text-card-foreground">{challenge.description}</p>
              </div>
            )}
            {challenge.rules && (
              <div className="pt-3 border-t border-border">
                <div className="text-muted-foreground font-mono uppercase text-xs mb-1">Rules</div>
                <p className="text-sm text-card-foreground">{challenge.rules}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'participants' && (
      <div className="bg-card border border-border rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground font-mono uppercase text-xs">
              <tr>
                <th className="text-left px-4 py-2.5">Rank</th>
                <th className="text-left px-4 py-2.5">User</th>
                <th className="text-right px-4 py-2.5">Score</th>
              </tr>
            </thead>
         <tbody>
              {participantsLoading && (
                <tr><td colSpan={3} className="px-4 py-6 text-center text-muted-foreground font-mono text-xs uppercase animate-pulse">Loading participants...</td></tr>
              )}
              {!participantsLoading && participants.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">No participants yet</td></tr>
              )}
              {!participantsLoading && participants.map((p, i) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-2.5 text-card-foreground">#{i + 1}</td>
                  <td className="px-4 py-2.5 text-card-foreground font-medium">{p.user?.name || p.user?.username}</td>
                  <td className="px-4 py-2.5 text-right text-card-foreground">{p.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    {tab === 'reels' && (
      <div className="space-y-3">
          {reelsLoading && (
            <div className="bg-card border border-border rounded-sm p-6 text-center text-muted-foreground text-sm font-mono uppercase text-xs animate-pulse">Loading reels...</div>
          )}
          {!reelsLoading && reels.length === 0 && (
            <div className="bg-card border border-border rounded-sm p-6 text-center text-muted-foreground text-sm">No reels submitted yet</div>
          )}
     {!reelsLoading && reels.map(reel => (
            <div key={reel.id} className="bg-card border border-border rounded-sm p-4 flex items-center justify-between gap-4">
              {/* Thumbnail / Play button */}
              <button
                onClick={() => setPreviewReel(reel)}
                className="w-16 h-16 flex-shrink-0 bg-muted border border-border rounded-sm overflow-hidden relative group"
              >
                {reel.thumbnailUrl ? (
                  <img src={reel.thumbnailUrl} alt="thumbnail" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-mono">NO<br/>MEDIA</div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-5 h-5 text-white fill-white" />
                </div>
              </button>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-card-foreground">{reel.creator?.name || reel.creator?.username}</div>
                <div className="text-xs text-muted-foreground font-mono uppercase">{reel.challengeApprovalStatus}</div>
                {reel.videoUrl && (
                  <button
                    onClick={() => setPreviewReel(reel)}
                    className="text-xs text-[#3B82F6] hover:underline font-mono mt-0.5"
                  >
                    ▶ Play Reel
                  </button>
                )}
              </div>
            <div className="flex items-center gap-2">
              {reel.challengeApprovalStatus === 'PENDING' && (
                  <>
              <button
                      onClick={() => handleApproval(reel.id, 'APPROVED')}
                      disabled={approvingId === reel.id}
                      className="w-8 h-8 flex items-center justify-center bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-sm hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setRejectTarget(reel.id)}
                      className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-600 border border-red-200 rounded-sm hover:bg-red-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}
              {reel.challengeApprovalStatus === 'APPROVED' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-600 font-mono uppercase">✓ Approved</span>
                <button
                      onClick={() => setRejectTarget(reel.id)}
                      className="text-xs font-bold uppercase text-muted-foreground hover:text-red-500 font-mono border border-border hover:border-red-300 px-2 py-1 rounded-sm"
                    >
                      Revoke
                    </button>
                  </div>
                )}
                {reel.challengeApprovalStatus === 'REJECTED' && (
                  <span className="text-xs font-bold text-red-500 font-mono uppercase">✗ Rejected</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

     {/* Reel Preview Modal */}
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
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-card border border-border rounded-sm p-5 w-full max-w-sm flex flex-col font-mono shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-border pb-3 mb-3">
                <span className="font-bold text-primary text-xs flex items-center gap-1.5 uppercase tracking-widest">
                  <Volume2 className="w-3.5 h-3.5" /> Reel Preview
                </span>
                <button onClick={() => setPreviewReel(null)} className="p-1 hover:bg-muted text-muted-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="aspect-[9/16] bg-muted border border-border relative overflow-hidden rounded-sm">
               {previewReel.mediaUrl ? (
                  <video src={previewReel.mediaUrl} autoPlay loop muted controls className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No video available</div>
                )}
              </div>
              <div className="mt-3 space-y-1">
                <div className="font-bold text-card-foreground text-sm">{previewReel.creator?.name || previewReel.creator?.username}</div>
                <div className="text-xs text-muted-foreground font-mono uppercase">{previewReel.challengeApprovalStatus}</div>
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
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-card border border-border rounded-sm p-5 w-full max-w-sm font-mono shadow-2xl space-y-3"
            >
              <div className="text-xs font-bold uppercase tracking-widest text-red-500">Reject Reel</div>
              <p className="text-sm text-muted-foreground">This reason will be sent to the creator via notification.</p>
              <textarea
                autoFocus
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Video quality too low, does not match challenge theme..."
                className="w-full border border-border rounded-sm px-3 py-2 text-sm text-card-foreground bg-background focus:outline-none focus:border-red-400 resize-none h-24"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => { setRejectTarget(null); setRejectReason(''); }}
                  className="px-3 py-1.5 text-xs font-bold uppercase text-muted-foreground border border-border rounded-sm hover:bg-muted"
                >
                  Cancel
                </button>
             <button
                  onClick={handleRejectConfirm}
                  disabled={rejectLoading}
                  className="px-3 py-1.5 text-xs font-bold uppercase text-white bg-red-500 border border-red-500 rounded-sm hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {rejectLoading ? 'Rejecting...' : 'Confirm Reject'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    {tab === 'rewards' && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-sm p-5 space-y-3">
            <div className="text-muted-foreground font-mono uppercase text-xs">Freeze Leaderboard & Select Winners</div>
            <input
              type="text"
              value={winnerIds}
              onChange={(e) => setWinnerIds(e.target.value)}
              placeholder="userId1, userId2, userId3"
              className="w-full border border-border rounded-sm px-3 py-2 text-sm text-card-foreground bg-background focus:outline-none focus:border-primary"
            />
            <button
              onClick={handleFreezeWinners}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 text-xs font-bold uppercase tracking-wide rounded-sm"
            >
              Freeze & Queue Rewards
            </button>
            {actionMsg && <p className="text-xs text-success font-mono">{actionMsg}</p>}
          </div>

          <div className="bg-card border border-border rounded-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground font-mono uppercase text-xs">
                <tr>
                  <th className="text-left px-4 py-2.5">Winner</th>
                  <th className="text-left px-4 py-2.5">Amount</th>
                  <th className="text-left px-4 py-2.5">Status</th>
                  <th className="text-right px-4 py-2.5">Action</th>
                </tr>
              </thead>
             <tbody>
                {rewardsLoading && (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-muted-foreground font-mono text-xs uppercase animate-pulse">Loading rewards...</td></tr>
                )}
                {!rewardsLoading && rewards.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">No reward transactions yet</td></tr>
                )}
                {!rewardsLoading && rewards.map(tx => (
                  <tr key={tx.id} className="border-t border-border">
                    <td className="px-4 py-2.5 text-card-foreground font-medium">{tx.winner?.name || tx.winner?.username}</td>
                    <td className="px-4 py-2.5 text-success font-bold">₹{tx.rewardAmount}</td>
                    <td className="px-4 py-2.5 text-card-foreground font-mono text-xs uppercase">{tx.status}</td>
                    <td className="px-4 py-2.5 text-right">
                      {tx.status === 'PENDING' && (
                        <button
                          onClick={() => handleProcessReward(tx.id)}
                          className="inline-flex items-center gap-1 text-xs font-bold uppercase text-[#3B82F6] hover:underline"
                        >
                          <Gift className="w-3.5 h-3.5" /> Process
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};