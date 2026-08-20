import React, { useState, useMemo } from 'react';
import { usePlatformStore } from '../store/usePlatformStore';
import { Search, History, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/utils/cn';

const formatINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400',
    processing: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400',
    failed: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400',
    rejected: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400',
  };
  return map[status.toLowerCase()] || 'bg-muted text-foreground border-border';
};

export const TransactionLogsPage: React.FC = () => {
  const { transactions } = usePlatformStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'purchase' | 'withdrawal'>('all');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        tx.creatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.creatorUsername.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'all' || tx.type === filterType;
      
      return matchesSearch && matchesType;
    });
  }, [transactions, searchTerm, filterType]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-foreground tracking-tight">Transaction Logs</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Complete history of all coin recharges and payouts.
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or @username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 w-full pl-9 pr-4 rounded-lg border border-border bg-background text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {['all', 'purchase', 'withdrawal'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterType(tab as any)}
                className={cn(
                  'h-7 px-3 rounded-md text-[12px] font-medium transition-all capitalize',
                  filterType === tab ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab === 'purchase' ? 'recharges' : tab === 'withdrawal' ? 'payouts' : 'all'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2">
              <History className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-[13px] font-semibold text-foreground">No transactions found</p>
            <p className="text-[12px] text-muted-foreground">Adjust your filters to see more results.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-bold text-[10px] uppercase">
                <tr>
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Amount (Coins)</th>
                  <th className="px-5 py-3">Amount (INR)</th>
                  <th className="px-5 py-3">Method</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-[13px] font-semibold text-foreground">{tx.creatorName}</p>
                      <p className="text-[11px] text-muted-foreground">@{tx.creatorUsername}</p>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        {tx.type === 'purchase' ? (
                          <ArrowDownRight className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-[12px] capitalize font-medium text-foreground">
                          {tx.type === 'purchase' ? 'Coin Recharge' : 'Payout'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-[13px] text-primary">
                      {tx.amount > 0 ? tx.amount.toLocaleString() : '-'}
                    </td>
                    <td className="px-5 py-3 font-bold text-foreground">
                      {tx.rupees > 0 ? formatINR(tx.rupees) : '-'}
                    </td>
                    <td className="px-5 py-3 text-[12px] text-muted-foreground capitalize">
                      {tx.method}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={cn('text-[10px] font-bold px-2 py-0.5 border rounded-full inline-block', statusBadge(tx.status))}>
                        {tx.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[11px] text-muted-foreground">
                      {new Date(tx.date).toLocaleString('en-IN')}
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
