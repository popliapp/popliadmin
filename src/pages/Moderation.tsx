import React, { useState } from 'react';
import { usePlatformStore, ModerationReport } from '../store/usePlatformStore';
import { 
  AlertTriangle, Check, Trash2, Search, Activity, ChevronRight, ShieldAlert
} from 'lucide-react';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

export const ModerationPage: React.FC = () => {
  const { reports, resolveReport } = usePlatformStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [selectedReport, setSelectedReport] = useState<ModerationReport | null>(null);

  const handleModerationAction = (reportId: string, action: 'warning' | 'removed' | 'dismissed') => {
    resolveReport(reportId, action);

    if (action === 'removed') {
      toast.error('Content permanently removed from feed.', { icon: '🗑️' });
    } else if (action === 'warning') {
      toast.success('Warning issued to creator.');
    } else {
      toast.success('Report dismissed. Content reinstated.');
    }

    setSelectedReport(null);
  };

  const filteredReports = reports.filter(rep => {
    const matchesSearch =
      rep.targetTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.targetCreatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.reportReason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = severityFilter === 'all' || rep.severity === severityFilter;
    return matchesSearch && matchesSeverity && rep.status === 'pending';
  });

  const severityBadge: Record<string, string> = {
    critical: 'bg-destructive/10 text-destructive border-destructive/20',
    high: 'bg-warning/10 text-warning border-warning/20',
    medium: 'bg-secondary/10 text-secondary border-secondary/20',
    low: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">Platform Moderation Queue</h1>
        <p className="text-muted-foreground text-sm mt-1">POPLI AI moderation queue and operator override center</p>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by reason, creator name, or content…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 bg-muted/40 border border-border rounded-xl pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <select
            value={severityFilter}
            onChange={(e: any) => setSeverityFilter(e.target.value)}
            className="h-10 bg-muted/40 border border-border rounded-xl px-3 text-sm text-foreground outline-none cursor-pointer focus:border-primary transition-colors"
          >
            <option value="all">All Severities</option>
            <option value="critical">🚨 Critical</option>
            <option value="high">⚠️ High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reports list */}
        <div className="bg-card border border-border rounded-2xl p-6 lg:col-span-2 space-y-4 flex flex-col h-[500px] shadow-sm">
          <span className="text-sm font-semibold text-foreground">Moderation Override Log</span>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {filteredReports.length > 0 ? (
              filteredReports.map((rep) => (
                <div
                  key={rep.id}
                  onClick={() => setSelectedReport(rep)}
                  className={cn(
                    "p-4 bg-muted/40 border rounded-xl flex justify-between items-center cursor-pointer transition-all duration-200 hover:shadow-md",
                    selectedReport?.id === rep.id
                      ? "border-primary shadow-md shadow-primary/5 bg-primary/5"
                      : "border-border hover:border-primary/40"
                  )}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground">{rep.reportReason}</span>
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-lg border uppercase",
                        severityBadge[rep.severity] || 'bg-muted text-muted-foreground border-border'
                      )}>
                        {rep.severity}
                      </span>
                    </div>
                    <span className="text-muted-foreground text-xs block">
                      Reel: {rep.targetTitle.substring(0, 45)}…
                    </span>
                    <span className="text-muted-foreground text-xs block">
                      By: {rep.targetCreatorName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <span className="text-muted-foreground text-xs">{rep.date}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-12 space-y-3">
                <ShieldAlert className="w-10 h-10 opacity-20" />
                <span className="font-semibold text-sm">Zero pending moderation issues</span>
                <p className="text-xs leading-relaxed px-6">
                  POPLI computer vision algorithms are keeping the feed clean.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* AI Classification Preview */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between h-[500px] shadow-sm">
          {selectedReport ? (
            <div className="flex-1 flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-center gap-2.5 border-b border-border pb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Activity className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">AI Vision Preview</span>
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'Nudity/Explicit Confidence', value: selectedReport.aiClassification?.nudity || 2, color: 'bg-destructive' },
                    { label: 'Violent Content Confidence', value: selectedReport.aiClassification?.violence || 1, color: 'bg-destructive' },
                    { label: 'Hate Speech Confidence', value: selectedReport.aiClassification?.hateSpeech || 1, color: 'bg-warning' },
                    { label: 'Spam Probability', value: selectedReport.aiClassification?.spam || 5, color: 'bg-primary' }
                  ].map((ai, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">{ai.label}</span>
                        <span className="text-foreground font-bold font-mono">{ai.value}%</span>
                      </div>
                      <div className="h-2 bg-muted border border-border rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all duration-500", ai.color)}
                          style={{ width: `${ai.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-5 border-t border-border">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleModerationAction(selectedReport.id, 'dismissed')}
                    className="h-10 px-3 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 rounded-xl transition-all text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-[0.97]"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Dismiss
                  </button>
                  <button
                    onClick={() => handleModerationAction(selectedReport.id, 'warning')}
                    className="h-10 px-3 bg-warning/10 text-warning hover:bg-warning/20 border border-warning/20 rounded-xl transition-all text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-[0.97]"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Warn
                  </button>
                </div>
                <button
                  onClick={() => handleModerationAction(selectedReport.id, 'removed')}
                  className="w-full h-10 bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-white font-semibold transition-all rounded-xl text-xs flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove Content
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-12 space-y-3">
              <Activity className="w-10 h-10 opacity-20" />
              <span className="font-semibold text-sm">Select a report</span>
              <p className="text-xs leading-relaxed px-6">
                Click any incident log to load the AI classification metrics.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
