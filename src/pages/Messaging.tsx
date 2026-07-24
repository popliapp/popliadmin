import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search, AlertTriangle, ShieldAlert, MessageSquare, Ban,
  AlertCircle, CheckCircle, ChevronRight, RefreshCw,
  ExternalLink, Flag, Users, Clock, TrendingUp,
  Filter, X, ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';
import { adminService } from '@/services/adminService';
import { useRegisterRefresh } from '@/hooks/useRegisterRefresh';

type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type FlagStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED' | 'ESCALATED';

interface Participant {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
}

interface MessageItem {
  id: string;
  senderId: string;
  text: string | null;
  mediaUrl: string | null;
  createdAt: string;
  type: string;
  sender: { id: string; name: string; username: string; avatar: string | null };
}

interface ModerationFlag {
  id: string;
  chatId: string;
  messageId: string | null;
  flagType: string;
  reason: string;
  severity: Severity;
  status: FlagStatus;
  confidenceScore: number;
  detectedKeywords: string[];
  detectedLinks: string[];
  aiExplanation: string | null;
  createdAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  chat: {
    id: string;
    participants: Array<{ user: Participant }>;
    messages?: MessageItem[];
  };
  actions: Array<{ action: string; reason: string; createdAt: string }>;
}

interface Stats {
  total: number;
  open: number;
  critical: number;
  resolvedToday: number;
  byType: Array<{ flagType: string; _count: number }>;
  bySeverity: Array<{ severity: string; _count: number }>;
}

const SECTIONS = [
  { key: 'open', label: 'Open Flags', icon: Flag },
  { key: 'critical', label: 'Critical', icon: AlertTriangle },
  { key: 'spam', label: 'Spam', icon: MessageSquare },
  { key: 'scam', label: 'Scam Links', icon: ExternalLink },
  { key: 'harassment', label: 'Harassment', icon: AlertCircle },
  { key: 'nsfw', label: 'NSFW', icon: ShieldAlert },
  { key: 'hate', label: 'Hate Speech', icon: Ban },
  { key: 'impersonation', label: 'Impersonation', icon: Users },
  { key: 'resolved', label: 'Resolved', icon: CheckCircle },
];

const SEVERITY_STYLES: Record<Severity, string> = {
  LOW: 'bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400',
  MEDIUM: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
  CRITICAL: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
};

const STATUS_STYLES: Record<FlagStatus, string> = {
  OPEN: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  INVESTIGATING: 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
  RESOLVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  DISMISSED: 'bg-muted text-muted-foreground',
  ESCALATED: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
};

const SkeletonRow = () => (
  <div className="p-3 border border-border rounded-lg animate-pulse space-y-2">
    <div className="h-3 bg-muted rounded w-3/4" />
    <div className="h-2.5 bg-muted/60 rounded w-1/2" />
  </div>
);

export const MessagingPage: React.FC = () => {
  const [section, setSection] = useState('open');
  const [flags, setFlags] = useState<ModerationFlag[]>([]);
  const [selectedFlag, setSelectedFlag] = useState<ModerationFlag | null>(null);
  const [conversation, setConversation] = useState<{ participants: Array<{ user: Participant }>; messages: MessageItem[] } | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [convLoading, setConvLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sectionToQuery = (s: string): { status?: string; severity?: string; flagType?: string } => {
    const map: Record<string, any> = {
      open: { status: 'OPEN' },
      critical: { severity: 'CRITICAL' },
      spam: { flagType: 'SPAM' },
      scam: { flagType: 'SCAM_LINK' },
      harassment: { flagType: 'HARASSMENT' },
      nsfw: { flagType: 'NSFW' },
      hate: { flagType: 'HATE_SPEECH' },
      impersonation: { flagType: 'IMPERSONATION' },
      resolved: { status: 'RESOLVED' },
    };
    return map[s] || {};
  };

  const fetchFlags = useCallback(async () => {
    setLoading(true);
    try {
      const sectionQuery = sectionToQuery(section);
      const res = await adminService.getChatModerationFlags({
        ...sectionQuery,
        search: search || undefined,
        status: statusFilter || sectionQuery.status || undefined,
        severity: severityFilter || sectionQuery.severity || undefined,
        page,
        limit: 15,
      });
      setFlags(res.data ?? []);
      setTotalPages(res.meta?.totalPages ?? 1);
    } catch {
      toast.error('Failed to load flags');
    } finally {
      setLoading(false);
    }
  }, [section, search, statusFilter, severityFilter, page]);

  const fetchStats = useCallback(async () => {
    try {
      const s = await adminService.getChatModerationStats();
      setStats(s);
    } catch {}
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([fetchFlags(), fetchStats()]);
  }, [fetchFlags, fetchStats]);

  useRegisterRefresh(refresh);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    setPage(1);
  }, [section, search, statusFilter, severityFilter]);

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  const handleSelectFlag = async (flag: ModerationFlag) => {
    setSelectedFlag(flag);
    setConvLoading(true);
    try {
      const conv = await adminService.getChatConversation(flag.chatId);
      setConversation(conv);
    } catch {
      toast.error('Failed to load conversation');
    } finally {
      setConvLoading(false);
    }
  };

  const handleAction = async (action: string, targetUserId?: string) => {
    if (!selectedFlag) return;
    setActionLoading(true);
    try {
      await adminService.performChatModerationAction(selectedFlag.id, {
        action,
        reason: `Admin action: ${action}`,
        targetUserId,
      });
      toast.success(`Action applied: ${action.replace(/_/g, ' ')}`);
      setSelectedFlag(null);
      setConversation(null);
      await fetchFlags();
      await fetchStats();
    } catch {
      toast.error('Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const participants = conversation?.participants ?? selectedFlag?.chat?.participants ?? [];
  const sender = participants[0]?.user;
  const receiver = participants[1]?.user;

  return (
    <div className="flex h-[calc(100vh-112px)] gap-0 overflow-hidden rounded-xl border border-border bg-card">
      <div className="w-48 flex-shrink-0 border-r border-border flex flex-col bg-muted/20">
        <div className="p-3 border-b border-border">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Chat Moderation</span>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.key}
                onClick={() => { setSection(s.key); setSelectedFlag(null); setConversation(null); }}
                className={cn(
                  'w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] font-medium transition-all text-left',
                  section === s.key
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{s.label}</span>
              </button>
            );
          })}
        </nav>

        {stats && (
          <div className="p-3 border-t border-border space-y-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-muted-foreground">Open</span>
              <span className="font-bold text-blue-500">{stats.open}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-muted-foreground">Critical</span>
              <span className="font-bold text-red-500">{stats.critical}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-muted-foreground">Resolved Today</span>
              <span className="font-bold text-emerald-500">{stats.resolvedToday}</span>
            </div>
          </div>
        )}
      </div>

      <div className="w-72 flex-shrink-0 border-r border-border flex flex-col">
        <div className="p-3 border-b border-border space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search flags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 pl-8 pr-3 rounded-lg border border-border bg-background text-[12px] text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div className="flex gap-1.5">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="flex-1 h-7 px-2 rounded-md border border-border bg-background text-[11px] text-foreground outline-none"
            >
              <option value="">All Severity</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
            <button
              onClick={() => { setSeverityFilter(''); setStatusFilter(''); setSearch(''); }}
              className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-3 space-y-2">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : flags.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-center p-6">
              <ShieldAlert className="w-8 h-8 text-muted-foreground/40" />
              <p className="text-[12px] font-semibold text-foreground">No flags found</p>
              <p className="text-[11px] text-muted-foreground">This queue is clear.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {flags.map((flag) => (
                <button
                  key={flag.id}
                  onClick={() => handleSelectFlag(flag)}
                  className={cn(
                    'w-full p-3 text-left hover:bg-muted/50 transition-colors',
                    selectedFlag?.id === flag.id && 'bg-primary/5 border-l-2 border-primary'
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-[12px] font-semibold text-foreground truncate">
                      {flag.chat.participants[0]?.user.username ?? 'Unknown'}
                    </span>
                    <span className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded flex-shrink-0', SEVERITY_STYLES[flag.severity])}>
                      {flag.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{flag.reason}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className={cn('text-[9px] font-semibold px-1.5 py-0.5 rounded', STATUS_STYLES[flag.status])}>
                      {flag.status}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(flag.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="p-2 border-t border-border flex items-center justify-between">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="text-[11px] px-2 py-1 rounded border border-border disabled:opacity-40 hover:bg-muted"
            >
              Prev
            </button>
            <span className="text-[11px] text-muted-foreground">{page} / {totalPages}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="text-[11px] px-2 py-1 rounded border border-border disabled:opacity-40 hover:bg-muted"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {!selectedFlag ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
              <MessageSquare className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-[14px] font-semibold text-foreground">Select a flagged conversation</p>
            <p className="text-[12px] text-muted-foreground max-w-xs">Choose a flag from the list to inspect the full conversation and take moderation action.</p>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-border flex items-start justify-between gap-4 flex-shrink-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13px] font-bold text-foreground">
                    @{sender?.username ?? '?'} → @{receiver?.username ?? '?'}
                  </span>
                  <span className={cn('text-[10px] font-bold uppercase px-2 py-0.5 rounded', SEVERITY_STYLES[selectedFlag.severity])}>
                    {selectedFlag.severity}
                  </span>
                  <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded', STATUS_STYLES[selectedFlag.status])}>
                    {selectedFlag.status}
                  </span>
                </div>
                <p className="text-[12px] text-muted-foreground mt-0.5">{selectedFlag.reason}</p>
                {selectedFlag.detectedLinks.length > 0 && (
                  <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                    {selectedFlag.detectedLinks.map((link, i) => (
                      <span key={i} className="text-[10px] font-mono bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-0.5 rounded border border-red-200 dark:border-red-500/20">
                        {link.length > 40 ? link.slice(0, 40) + '...' : link}
                      </span>
                    ))}
                  </div>
                )}
                {selectedFlag.aiExplanation && (
                  <p className="text-[11px] text-muted-foreground mt-1 italic">{selectedFlag.aiExplanation}</p>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-[11px] text-muted-foreground">Confidence:</span>
                <span className="text-[11px] font-bold text-foreground">
                  {Math.round(selectedFlag.confidenceScore * 100)}%
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {convLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={cn('max-w-sm animate-pulse', i % 2 === 0 ? 'mr-auto' : 'ml-auto')}>
                      <div className="h-10 bg-muted rounded-xl" />
                    </div>
                  ))}
                </div>
              ) : conversation?.messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-[12px]">
                  No messages in this conversation.
                </div>
              ) : (
                conversation?.messages.map((msg) => {
                  const isSender = msg.senderId === sender?.id;
                  const isFlaggedMsg = msg.id === selectedFlag.messageId;
                  return (
                    <div
                      key={msg.id}
                      className={cn('flex flex-col max-w-sm gap-1', isSender ? 'mr-auto items-start' : 'ml-auto items-end')}
                    >
                      <span className="text-[10px] text-muted-foreground px-1">@{msg.sender.username}</span>
                      <div className={cn(
                        'px-3 py-2 rounded-xl text-[12px]',
                        isFlaggedMsg
                          ? 'bg-red-100 dark:bg-red-500/10 border border-red-300 dark:border-red-500/30 text-red-800 dark:text-red-300'
                          : isSender
                          ? 'bg-muted text-foreground'
                          : 'bg-primary/10 text-foreground'
                      )}>
                        {msg.text || (msg.mediaUrl && (
                          <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer" className="underline text-primary text-[11px]">
                            Media attachment
                          </a>
                        ))}
                        {isFlaggedMsg && (
                          <div className="mt-1 text-[10px] font-semibold text-red-500">Flagged message</div>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground px-1">
                        {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 border-t border-border flex items-center gap-2 flex-wrap flex-shrink-0">
              <button
                disabled={actionLoading}
                onClick={() => handleAction('DISMISS_FLAG')}
                className="h-8 px-3 rounded-lg border border-border bg-muted/40 hover:bg-muted text-[12px] font-semibold text-foreground transition-colors disabled:opacity-50"
              >
                Dismiss
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handleAction('WARN_USER', sender?.id)}
                className="h-8 px-3 rounded-lg border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-[12px] font-semibold transition-colors disabled:opacity-50"
              >
                Warn Sender
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handleAction('MUTE_USER', sender?.id)}
                className="h-8 px-3 rounded-lg border border-orange-300 dark:border-orange-500/30 bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 hover:bg-orange-100 text-[12px] font-semibold transition-colors disabled:opacity-50"
              >
                Mute Sender
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handleAction('ESCALATE')}
                className="h-8 px-3 rounded-lg border border-purple-300 dark:border-purple-500/30 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 text-[12px] font-semibold transition-colors disabled:opacity-50"
              >
                Escalate
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handleAction('BAN_USER', sender?.id)}
                className="h-8 px-3 rounded-lg border border-red-300 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 hover:bg-red-100 text-[12px] font-semibold transition-colors disabled:opacity-50 ml-auto"
              >
                Ban Sender
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};