import React, { useState, useCallback } from 'react';
import { usePlatformStore, ModerationReport } from '../store/usePlatformStore';
import { useRegisterRefresh } from '../hooks/useRegisterRefresh';
import {
  AlertTriangle,
  Check,
  Trash2,
  Search,
  Activity,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

const SEVERITY_STYLES: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
  high: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  medium: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
  low: 'bg-muted text-muted-foreground border-border',
};

const formatDate = (iso: string) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
};

export const ModerationPage: React.FC = () => {
const { reports, resolveReport, fetchAllData } = usePlatformStore();

  const refresh = useCallback(async () => {
    await fetchAllData();
  }, [fetchAllData]);

  useRegisterRefresh(refresh);

  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [statusView, setStatusView] = useState<'pending' | 'actioned'>('pending');
  const [selectedReport, setSelectedReport] = useState<ModerationReport | null>(null);

  const handleModerationAction = (reportId: string, action: 'warning' | 'removed' | 'dismissed') => {
    resolveReport(reportId, action);
    if (action === 'removed') {
      toast.error('Content permanently removed from feed.');
    } else if (action === 'warning') {
      toast.success('Warning issued to creator.');
    } else {
      toast.success('Report dismissed. Content reinstated.');
    }
    setSelectedReport(null);
  };

  const pendingCount = reports.filter((r) => r.status === 'pending').length;
  const actionedCount = reports.filter((r) => r.status === 'actioned').length;

  const filteredReports = reports.filter((rep) => {
    const matchesSearch =
      (rep.targetTitle ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rep.targetCreatorName ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rep.reportReason ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || rep.severity === severityFilter;
    const matchesStatus = rep.status === statusView;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-foreground tracking-tight">Moderation Queue</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Review reported content and take enforcement action.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => { setStatusView('pending'); setSelectedReport(null); }}
              className={cn(
                'h-7 px-3 rounded-md text-[12px] font-medium transition-all',
                statusView === 'pending'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Pending
              {pendingCount > 0 && (
                <span className={cn(
                  'ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded',
                  statusView === 'pending' ? 'bg-white/20 text-white' : 'bg-red-500/15 text-red-500'
                )}>
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => { setStatusView('actioned'); setSelectedReport(null); }}
              className={cn(
                'h-7 px-3 rounded-md text-[12px] font-medium transition-all',
                statusView === 'actioned'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Actioned
              {actionedCount > 0 && (
                <span className={cn(
                  'ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded',
                  statusView === 'actioned' ? 'bg-white/20 text-white' : 'bg-muted-foreground/20 text-muted-foreground'
                )}>
                  {actionedCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search by reason, creator, or content…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 bg-card border border-border rounded-lg pl-9 pr-4 text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <select
          value={severityFilter}
          onChange={(e: any) => setSeverityFilter(e.target.value)}
          className="h-9 bg-card border border-border rounded-lg px-3 text-[13px] text-foreground outline-none cursor-pointer focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-foreground">
              {statusView === 'pending' ? 'Pending Reports' : 'Actioned Reports'}
            </h2>
            {filteredReports.length > 0 && (
              <span className="text-[12px] text-muted-foreground">{filteredReports.length} item{filteredReports.length !== 1 ? 's' : ''}</span>
            )}
          </div>

          <div className="overflow-y-auto max-h-[560px]">
            {filteredReports.length > 0 ? (
              <div className="divide-y divide-border">
                {filteredReports.map((rep) => (
                  <div
                    key={rep.id}
                    onClick={() => setSelectedReport(rep)}
                    className={cn(
                      'px-5 py-4 flex justify-between items-start cursor-pointer transition-colors',
                      selectedReport?.id === rep.id
                        ? 'bg-primary/5 border-l-2 border-l-primary'
                        : 'hover:bg-muted/40 border-l-2 border-l-transparent'
                    )}
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] font-semibold text-foreground">
                          {rep.reportReason || 'No reason provided'}
                        </span>
                        <span className={cn(
                          'text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider',
                          SEVERITY_STYLES[rep.severity] ?? SEVERITY_STYLES.low
                        )}>
                          {rep.severity}
                        </span>
                      </div>
                      <p className="text-[12px] text-muted-foreground truncate">
                        {(rep.targetTitle ?? 'Unknown content').substring(0, 60)}
                      </p>
                      <p className="text-[12px] text-muted-foreground">
                        By <span className="font-medium text-foreground">{rep.targetCreatorName || 'Unknown'}</span>
                        {' · '}
                        <span>{formatDate(rep.date)}</span>
                        {' · Reported by '}
                        <span className="font-medium text-foreground">{rep.reporterName || 'Unknown'}</span>
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5 ml-3" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  {statusView === 'pending' ? (
                    <ShieldCheck className="w-6 h-6 text-muted-foreground" />
                  ) : (
                    <ShieldAlert className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <p className="text-[13px] font-semibold text-foreground">
                  {statusView === 'pending' ? 'No pending reports' : 'No actioned reports'}
                </p>
                <p className="text-[12px] text-muted-foreground max-w-xs">
                  {statusView === 'pending'
                    ? 'The queue is clear. All reported content has been reviewed.'
                    : 'No reports have been actioned yet.'}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-[15px] font-semibold text-foreground">Report Detail</h2>
          </div>

          {selectedReport ? (
            <div className="p-5 flex flex-col gap-5">
              <div className="space-y-3">
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Reason
                  </p>
                  <p className="text-[13px] text-foreground font-medium">{selectedReport.reportReason}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Content
                  </p>
                  <p className="text-[13px] text-foreground">{selectedReport.targetTitle || '—'}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Creator
                    </p>
                    <p className="text-[13px] text-foreground font-medium">{selectedReport.targetCreatorName || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Reporter
                    </p>
                    <p className="text-[13px] text-foreground font-medium">{selectedReport.reporterName || '—'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    AI Classification
                  </p>
                  {!selectedReport.aiClassification && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Info className="w-3 h-3" />
                      <span>Not available</span>
                    </div>
                  )}
                </div>

                {selectedReport.aiClassification ? (
                  <div className="space-y-3">
                    {[
                      { label: 'Nudity / Explicit', value: selectedReport.aiClassification.nudity, color: 'bg-red-500' },
                      { label: 'Violent Content', value: selectedReport.aiClassification.violence, color: 'bg-red-500' },
                      { label: 'Hate Speech', value: selectedReport.aiClassification.hateSpeech, color: 'bg-amber-500' },
                      { label: 'Spam', value: selectedReport.aiClassification.spam, color: 'bg-primary' },
                    ].map((ai) => (
                      <div key={ai.label} className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[12px] text-muted-foreground">{ai.label}</span>
                          <span className="text-[12px] font-bold text-foreground font-mono">{ai.value}%</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn('h-full rounded-full transition-all duration-500', ai.color)}
                            style={{ width: `${ai.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-muted/40 border border-border rounded-lg text-center">
                    <p className="text-[12px] text-muted-foreground">
                      AI classification data is not yet available for this report. Backend integration required.
                    </p>
                  </div>
                )}
              </div>

              {statusView === 'pending' && (
                <div className="space-y-2 pt-1 border-t border-border">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Take Action
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleModerationAction(selectedReport.id, 'dismissed')}
                      className="h-9 px-3 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 rounded-lg transition-all text-[12px] font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Dismiss
                    </button>
                    <button
                      onClick={() => handleModerationAction(selectedReport.id, 'warning')}
                      className="h-9 px-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg transition-all text-[12px] font-semibold flex items-center justify-center gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Warn
                    </button>
                  </div>
                  <button
                    onClick={() => handleModerationAction(selectedReport.id, 'removed')}
                    className="w-full h-9 bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-white font-semibold transition-all rounded-lg text-[12px] flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove Content
                  </button>
                </div>
              )}

              {statusView === 'actioned' && (
                <div className="p-3 bg-muted/40 border border-border rounded-lg text-center">
                  <p className="text-[12px] text-muted-foreground">This report has already been actioned.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-5">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Activity className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-[13px] font-semibold text-foreground">No report selected</p>
              <p className="text-[12px] text-muted-foreground">
                Select a report from the list to review details and take action.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};