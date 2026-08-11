import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { useRegisterRefresh } from '../hooks/useRegisterRefresh';
import toast from 'react-hot-toast';
import { RefreshCw, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

const formatINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);

const STATUS_TABS = ['ALL', 'DRAFT', 'PROCESSING', 'SUCCESS', 'FAILED', 'REVERSED'] as const;

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    DRAFT: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    PROCESSING: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
    SUCCESS: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    FAILED: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
    REVERSED: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20',
    PENDING: 'bg-muted text-muted-foreground border-border',
    APPROVED: 'bg-muted text-muted-foreground border-border',
  };
  return map[status] || 'bg-muted text-foreground border-border';
};

export const PaymentProcessPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getPaymentProcessList(activeTab === 'ALL' ? undefined : activeTab);
      setRecords(data);
    } catch {
      toast.error('Failed to load payment process records');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { load(); }, [load]);
  useRegisterRefresh(load);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-foreground tracking-tight">Payment Process</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            All Cashfree payout drafts and transfer statuses.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors self-start"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
        </button>
      </div>

      <div className="flex items-center gap-1 bg-muted rounded-lg p-1 self-start overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'h-7 px-3 rounded-md text-[12px] font-medium transition-all whitespace-nowrap',
              activeTab === tab ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />)}
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <p className="text-[13px] font-semibold text-foreground">No records found</p>
            <p className="text-[12px] text-muted-foreground">Payment drafts and transfers will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-bold text-[10px] uppercase">
                <tr>
                  <th className="px-5 py-3">Creator</th>
                  <th className="px-5 py-3">Requested</th>
                  <th className="px-5 py-3">Approved</th>
                  <th className="px-5 py-3">Net Payable</th>
                  <th className="px-5 py-3">Method</th>
                  <th className="px-5 py-3">Cashfree ID</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {records.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-muted/20 cursor-pointer transition-colors"
                    onClick={() => navigate(`/payment-process/${r.id}`)}
                  >
                    <td className="px-5 py-3">
                      <p className="text-[13px] font-semibold text-foreground">{r.creator.name}</p>
                      <p className="text-[11px] text-muted-foreground">@{r.creator.username}</p>
                    </td>
                    <td className="px-5 py-3 font-bold text-foreground">{formatINR(r.amount)}</td>
                    <td className="px-5 py-3 font-bold text-foreground">{r.approvedAmount ? formatINR(r.approvedAmount) : '-'}</td>
                    <td className="px-5 py-3 text-emerald-600 font-bold">{formatINR(r.netPayable)}</td>
                    <td className="px-5 py-3 text-[12px] text-muted-foreground">
                      {r.paymentMethod ? `${r.paymentMethod.type}${r.paymentMethod.type === 'UPI' ? `: ${r.paymentMethod.upiId}` : `: ${r.paymentMethod.accountNumber}`}` : '-'}
                    </td>
                    <td className="px-5 py-3 font-mono text-[11px] text-muted-foreground">
                      {r.cashfreeTransferId ? `${r.cashfreeTransferId.slice(0, 14)}...` : '-'}
                    </td>
                    <td className="px-5 py-3 text-[11px] text-muted-foreground">
                      {new Date(r.updatedAt).toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={cn('text-[10px] font-bold px-2 py-0.5 border rounded-full inline-block', statusBadge(r.status))}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};