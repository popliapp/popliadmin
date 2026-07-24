import { useState, useEffect, useCallback, useRef } from 'react';
import { useRegisterRefresh } from '../hooks/useRegisterRefresh';
import {
  Target,
  Plus,
  Search,
  Trophy,
  Users,
  Calendar,
  Hash,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { challengesApi } from '@/services/api/challenges';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  SCHEDULED: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  COMPLETED: 'bg-muted text-muted-foreground',
  DRAFT: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  PAUSED: 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
};

const TYPE_STYLES: Record<string, string> = {
  DAILY: 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
  WEEKLY: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400',
  CUSTOM: 'bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400',
};

const formatCurrency = (val: number) =>
  '₹' + Number(val).toLocaleString('en-IN', { maximumFractionDigits: 0 });

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const SkeletonCard = () => (
  <div className="bg-card border border-border rounded-xl p-5 animate-pulse space-y-4">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-muted flex-shrink-0" />
      <div className="space-y-2 flex-1">
        <div className="h-3.5 bg-muted rounded w-3/4" />
        <div className="h-2.5 bg-muted/60 rounded w-1/3" />
      </div>
    </div>
    <div className="space-y-2.5">
      <div className="h-2.5 bg-muted/60 rounded w-full" />
      <div className="h-2.5 bg-muted/60 rounded w-5/6" />
    </div>
    <div className="grid grid-cols-2 gap-3 pt-1">
      <div className="h-12 bg-muted/40 rounded-lg" />
      <div className="h-12 bg-muted/40 rounded-lg" />
    </div>
    <div className="h-8 bg-muted/40 rounded-lg mt-2" />
  </div>
);

export const ChallengesPage = () => {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const LIMIT = 9;
  const navigate = useNavigate();

const fetchChallenges = useCallback((): Promise<void> => {
    setLoading(true);
    return challengesApi
      .getChallenges({
        page,
        limit: LIMIT,
        search: search || undefined,
        status: statusFilter || undefined,
      })
      .then((res) => {
        const payload = res.data;
        const items = payload?.data ?? payload ?? [];
        setChallenges(Array.isArray(items) ? items : []);
        if (payload?.meta) {
          setTotalPages(payload.meta.totalPages ?? 1);
          setTotalCount(payload.meta.total ?? items.length);
        } else {
          setTotalPages(1);
          setTotalCount(items.length);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, search, statusFilter]);

useRegisterRefresh(fetchChallenges);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-foreground tracking-tight">Challenges</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Create and manage daily, weekly, and custom creator contests.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchChallenges}
            className="w-9 h-9 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all flex items-center justify-center"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/challenges/create')}
            className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-white text-[13px] font-semibold hover:bg-primary/90 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Challenge
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search challenges..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-card text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {totalCount > 0 && !loading && (
          <div className="flex items-center h-9 px-3 rounded-lg bg-muted text-[12px] font-medium text-muted-foreground">
            {totalCount} challenge{totalCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: LIMIT }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : challenges.length === 0 ? (
        <div className="bg-card border border-border rounded-xl flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Target className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-[14px] font-semibold text-foreground">No challenges found</p>
          <p className="text-[12px] text-muted-foreground max-w-xs">
            {search || statusFilter
              ? 'Try adjusting your search or filter.'
              : 'Create your first challenge to get creators competing.'}
          </p>
          {!search && !statusFilter && (
            <button
              onClick={() => navigate('/challenges/create')}
              className="mt-2 flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-white text-[13px] font-semibold hover:bg-primary/90 transition-all"
            >
              <Plus className="w-4 h-4" />
              New Challenge
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              className="bg-card border border-border rounded-xl p-5 hover:shadow-md hover:border-primary/30 transition-all flex flex-col gap-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[14px] font-semibold text-foreground leading-snug truncate">
                      {challenge.title}
                    </h3>
                    {challenge.hashtagName && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Hash className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[11px] text-muted-foreground truncate">
                          {challenge.hashtagName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <span
                  className={cn(
                    'flex-shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md',
                    STATUS_STYLES[challenge.status] ?? 'bg-muted text-muted-foreground'
                  )}
                >
                  {challenge.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-muted/50 rounded-lg p-2.5 flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Trophy className="w-3 h-3" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Reward Pool</span>
                  </div>
                  <span className="text-[14px] font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(challenge.rewardPool ?? 0)}
                  </span>
                </div>
                <div className="bg-muted/50 rounded-lg p-2.5 flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="w-3 h-3" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Participants</span>
                  </div>
                  <span className="text-[14px] font-bold text-foreground">
                    {(challenge.participantCount ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span
                    className={cn(
                      'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md',
                      TYPE_STYLES[challenge.type] ?? 'bg-muted text-muted-foreground'
                    )}
                  >
                    {challenge.type}
                  </span>
                  {challenge.isSponsored && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                      Sponsored
                    </span>
                  )}
                </div>
                {challenge.endDate && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span className="text-[11px]">{formatDate(challenge.endDate)}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate(`/challenges/${challenge.id}`)}
                className="w-full h-8 rounded-lg border border-border bg-muted/40 hover:bg-muted text-[12px] font-semibold text-foreground transition-colors mt-auto"
              >
                Manage
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-[12px] text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};