import React, { useState, useEffect, useCallback } from 'react';
import { useRegisterRefresh } from '../hooks/useRegisterRefresh';
import {
  Coins,
  Check,
  X,
  TrendingUp,
  AlertCircle,
  Wallet,
  RefreshCw,
  Gift,
  Users,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';
import { adminService } from '../services/adminService';

const formatINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const formatCoins = (n: number) =>
  n >= 1_000_000
    ? (n / 1_000_000).toFixed(1) + 'M'
    : n >= 1_000
    ? (n / 1_000).toFixed(1) + 'K'
    : n.toString();

const SkeletonLine = ({ w = 'w-full' }: { w?: string }) => (
  <div className={cn('h-10 rounded-lg bg-muted animate-pulse', w)} />
);

const ConfigField = ({
  label,
  hint,
  value,
  step = '1',
  onChange,
  prefix,
}: {
  label: string;
  hint: string;
  value: number;
  step?: string;
  onChange: (v: number) => void;
  prefix?: string;
}) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
      {label}
    </label>
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-medium text-muted-foreground select-none">
          {prefix}
        </span>
      )}
      <input
        type="number"
        step={step}
        min={0}
        required
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className={cn(
          'w-full h-10 bg-muted border border-border rounded-lg text-[13px] text-foreground',
          'outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all',
          prefix ? 'pl-7 pr-3' : 'px-3',
        )}
      />
    </div>
    <p className="text-[11px] text-muted-foreground">{hint}</p>
  </div>
);

const TABS = [
  { id: 'withdrawal', label: 'Withdrawal Payouts' },
  { id: 'coin-economy', label: 'Coin Economy' },
  { id: 'referrals', label: 'Referral Rewards' },
] as const;

type TabId = (typeof TABS)[number]['id'];

interface TopEarner {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
  totalEarnings: number;
  coinBalance: number;
  withdrawableBalance: number;
  totalWithdrawn: number;
}

interface PendingWithdrawal {
  id: string;
  creatorName: string;
  creatorUsername: string;
  amount: number;
  rupees: number;
  method: string;
  status: string;
  createdAt: string;
}

interface MonetizationSummary {
  topEarners: TopEarner[];
  pendingWithdrawals: PendingWithdrawal[];
  summary: {
    totalPaidOut: number;
    totalPendingAmount: number;
    pendingCount: number;
  };
}

export const MonetizationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('withdrawal');

  const [monetizationData, setMonetizationData] = useState<MonetizationSummary | null>(null);
  const [monetizationLoading, setMonetizationLoading] = useState(true);

  const [configLoading, setConfigLoading] = useState(true);
  const [coinRates, setCoinRates] = useState({
    COIN_PURCHASE_PRICE_PER_COIN: 1.25,
    COIN_WITHDRAWAL_REDEEM_RATE: 0.85,
  });
  const [coinSaving, setCoinSaving] = useState(false);

  const [referralRates, setReferralRates] = useState({
    REFERRAL_CREATOR_REWARD: 100,
    REFERRAL_STANDARD_REWARD: 25,
    REFERRAL_SUPER_REWARD: 500,
  });
  const [referralSaving, setReferralSaving] = useState(false);
  const [giftCreatorShare, setGiftCreatorShare] = useState<number | null>(null);

  const loadMonetizationData = useCallback(async () => {
    setMonetizationLoading(true);
    try {
      const data = await adminService.getMonetizationSummary();
      setMonetizationData(data);
    } catch {
      toast.error('Failed to load monetization data');
    } finally {
      setMonetizationLoading(false);
    }
  }, []);

const refresh = useCallback(async () => {
    await Promise.all([
      loadMonetizationData(),
      adminService.getConfigs().then((configs: any) => {
        setCoinRates({
          COIN_PURCHASE_PRICE_PER_COIN: configs['COIN_PURCHASE_PRICE_PER_COIN'] ?? 1.25,
          COIN_WITHDRAWAL_REDEEM_RATE: configs['COIN_WITHDRAWAL_REDEEM_RATE'] ?? 0.85,
        });
        setReferralRates({
          REFERRAL_CREATOR_REWARD: configs['REFERRAL_CREATOR_REWARD'] ?? 100,
          REFERRAL_STANDARD_REWARD: configs['REFERRAL_STANDARD_REWARD'] ?? 25,
          REFERRAL_SUPER_REWARD: configs['REFERRAL_SUPER_REWARD'] ?? 500,
        });
        setGiftCreatorShare(configs['GIFT_CREATOR_SHARE_PERCENT'] ?? 60);
      }).catch(() => {}),
    ]);
  }, [loadMonetizationData]);

  useRegisterRefresh(refresh);

  useEffect(() => {
    loadMonetizationData();
    adminService
      .getConfigs()
      .then((configs: any) => {
        setCoinRates({
          COIN_PURCHASE_PRICE_PER_COIN: configs['COIN_PURCHASE_PRICE_PER_COIN'] ?? 1.25,
          COIN_WITHDRAWAL_REDEEM_RATE: configs['COIN_WITHDRAWAL_REDEEM_RATE'] ?? 0.85,
        });
        setReferralRates({
          REFERRAL_CREATOR_REWARD: configs['REFERRAL_CREATOR_REWARD'] ?? 100,
          REFERRAL_STANDARD_REWARD: configs['REFERRAL_STANDARD_REWARD'] ?? 25,
          REFERRAL_SUPER_REWARD: configs['REFERRAL_SUPER_REWARD'] ?? 500,
        });
        setGiftCreatorShare(configs['GIFT_CREATOR_SHARE_PERCENT'] ?? 60);
      })
      .catch(() => toast.error('Failed to load economy config'))
      .finally(() => setConfigLoading(false));
  }, [loadMonetizationData]);

  const pendingWithdrawals = monetizationData?.pendingWithdrawals ?? [];
  const topEarners = monetizationData?.topEarners ?? [];
  const summary = monetizationData?.summary;

  const handleApprove = async (w: PendingWithdrawal) => {
    try {
      await adminService.approveWithdrawal(w.id);
      toast.success(`Approved ${formatINR(w.rupees)} for @${w.creatorUsername}`);
      loadMonetizationData();
    } catch {
      toast.error('Failed to approve withdrawal');
    }
  };

  const handleReject = async (w: PendingWithdrawal) => {
    try {
      await adminService.rejectWithdrawal(w.id);
      toast.error(`Rejected withdrawal for @${w.creatorUsername}. Balance refunded.`);
      loadMonetizationData();
    } catch {
      toast.error('Failed to reject withdrawal');
    }
  };

  const handleSaveCoinRates = async (e: React.FormEvent) => {
    e.preventDefault();
    setCoinSaving(true);
    try {
      await Promise.all([
        adminService.updateConfig('COIN_PURCHASE_PRICE_PER_COIN', coinRates.COIN_PURCHASE_PRICE_PER_COIN),
        adminService.updateConfig('COIN_WITHDRAWAL_REDEEM_RATE', coinRates.COIN_WITHDRAWAL_REDEEM_RATE),
      ]);
      toast.success('Coin rates saved');
    } catch {
      toast.error('Failed to save coin rates');
    } finally {
      setCoinSaving(false);
    }
  };

  const handleSaveReferralRates = async (e: React.FormEvent) => {
    e.preventDefault();
    setReferralSaving(true);
    try {
      await Promise.all([
        adminService.updateConfig('REFERRAL_CREATOR_REWARD', referralRates.REFERRAL_CREATOR_REWARD),
        adminService.updateConfig('REFERRAL_STANDARD_REWARD', referralRates.REFERRAL_STANDARD_REWARD),
        adminService.updateConfig('REFERRAL_SUPER_REWARD', referralRates.REFERRAL_SUPER_REWARD),
      ]);
      toast.success('Referral rewards saved');
    } catch {
      toast.error('Failed to save referral rewards');
    } finally {
      setReferralSaving(false);
    }
  };

  const spread = (coinRates.COIN_PURCHASE_PRICE_PER_COIN - coinRates.COIN_WITHDRAWAL_REDEEM_RATE).toFixed(2);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-foreground tracking-tight">
            Monetization & Economy
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Withdrawal ledger, coin economy, and referral reward configuration.
          </p>
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1 self-start">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'h-7 px-3 rounded-md text-[12px] font-medium transition-all whitespace-nowrap',
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'withdrawal' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h2 className="text-[15px] font-semibold text-foreground">
                  Pending Withdrawal Requests
                </h2>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  Approve or reject creator payout requests
                </p>
              </div>
              <div className="flex items-center gap-3">
                {summary && summary.pendingCount > 0 && (
                  <div className="text-right">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      Total Pending
                    </p>
                    <p className="text-[18px] font-bold text-foreground font-mono">
                      {formatINR(summary.totalPendingAmount)}
                    </p>
                  </div>
                )}
                <button
                  onClick={loadMonetizationData}
                  disabled={monetizationLoading}
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                >
                  <RefreshCw className={cn('w-3.5 h-3.5', monetizationLoading && 'animate-spin')} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-border max-h-[480px]">
              {monetizationLoading ? (
                <div className="p-5 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
                  ))}
                </div>
              ) : pendingWithdrawals.length > 0 ? (
                pendingWithdrawals.map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Wallet className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-foreground truncate">
                          @{w.creatorUsername}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {w.creatorName} · via {w.method || 'UPI'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                      <span className="text-[15px] font-bold text-foreground font-mono">
                        {formatINR(w.rupees)}
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleApprove(w)}
                          title="Approve withdrawal"
                          className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/20 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleReject(w)}
                          title="Reject withdrawal"
                          className="p-2 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/20 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 text-center py-16">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Coins className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-[13px] font-semibold text-foreground">No pending withdrawals</p>
                  <p className="text-[12px] text-muted-foreground">
                    All withdrawal requests have been processed.
                  </p>
                </div>
              )}
            </div>

            {summary && summary.totalPaidOut > 0 && (
              <div className="px-5 py-3.5 border-t border-border flex items-center justify-between bg-muted/30">
                <span className="text-[12px] text-muted-foreground">Total paid out to creators</span>
                <span className="text-[13px] font-bold text-foreground font-mono">
                  {formatINR(summary.totalPaidOut)}
                </span>
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h2 className="text-[15px] font-semibold text-foreground">Top Earners</h2>
              <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
                Creators only
              </span>
            </div>

            <div className="flex-1 divide-y divide-border">
              {monetizationLoading ? (
                <div className="p-5 space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />
                  ))}
                </div>
              ) : topEarners.length > 0 ? (
                topEarners.map((creator, idx) => (
                  <div
                    key={creator.id}
                    className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[11px] font-bold text-muted-foreground w-4 flex-shrink-0">
                        #{idx + 1}
                      </span>
                      <img
                        src={creator.avatar ?? `https://api.dicebear.com/7.x/pixel-art/svg?seed=${creator.username}`}
                        alt={creator.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            `https://api.dicebear.com/7.x/pixel-art/svg?seed=${creator.username}`;
                        }}
                        className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-border bg-muted"
                      />
                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold text-foreground truncate">
                          {creator.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          @{creator.username}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0 ml-2">
                      <span className="text-[12px] font-bold text-primary font-mono">
                        {formatINR(creator.totalEarnings)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatCoins(creator.coinBalance)} coins
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                  <Users className="w-8 h-8 text-muted-foreground opacity-30" />
                  <p className="text-[12px] text-muted-foreground">No creator earnings yet</p>
                </div>
              )}
            </div>

            {giftCreatorShare !== null && (
              <div className="px-5 py-4 border-t border-border">
                <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 text-primary px-3 py-2.5 rounded-lg">
                  <Gift className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="text-[12px] font-semibold">
                    Creators receive {giftCreatorShare}% of gift value
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'coin-economy' && (
        <div className="max-w-lg">
          <div className="bg-card border border-border rounded-xl p-5 space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-foreground">Coin Economy Rates</h2>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  Changes are persisted to the database immediately on save.
                </p>
              </div>
            </div>

            {configLoading ? (
              <div className="space-y-4">
                <SkeletonLine />
                <SkeletonLine />
                <SkeletonLine w="w-2/3" />
              </div>
            ) : (
              <form onSubmit={handleSaveCoinRates} className="space-y-4">
                <ConfigField
                  label="Purchase Price Per Coin (INR)"
                  hint="Price users pay in INR to buy one coin"
                  value={coinRates.COIN_PURCHASE_PRICE_PER_COIN}
                  step="0.01"
                  prefix="₹"
                  onChange={(v) =>
                    setCoinRates((p) => ({ ...p, COIN_PURCHASE_PRICE_PER_COIN: v }))
                  }
                />
                <ConfigField
                  label="Withdrawal Redeem Rate (INR per coin)"
                  hint="INR paid to creators per coin when they withdraw earnings"
                  value={coinRates.COIN_WITHDRAWAL_REDEEM_RATE}
                  step="0.01"
                  prefix="₹"
                  onChange={(v) =>
                    setCoinRates((p) => ({ ...p, COIN_WITHDRAWAL_REDEEM_RATE: v }))
                  }
                />
                <div className="flex items-start gap-2 p-3 bg-muted rounded-lg border border-border">
                  <AlertCircle className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[12px] text-muted-foreground">
                      Platform spread:{' '}
                      <span className="font-semibold text-foreground">₹{spread} per coin</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Revenue retained per coin circulated through the economy.
                    </p>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={coinSaving}
                  className="w-full h-10 bg-primary text-white text-[13px] font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {coinSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  {coinSaving ? 'Saving…' : 'Save Coin Rates'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {activeTab === 'referrals' && (
        <div className="max-w-lg">
          <div className="bg-card border border-border rounded-xl p-5 space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-foreground">Referral Program Rewards</h2>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  INR rewards credited to wallets on qualifying referral events.
                </p>
              </div>
            </div>

            {configLoading ? (
              <div className="space-y-4">
                <SkeletonLine />
                <SkeletonLine />
                <SkeletonLine />
                <SkeletonLine w="w-2/3" />
              </div>
            ) : (
              <form onSubmit={handleSaveReferralRates} className="space-y-4">
                <ConfigField
                  label="Referrer Reward (INR)"
                  hint="Paid to the person who referred a new creator"
                  value={referralRates.REFERRAL_CREATOR_REWARD}
                  prefix="₹"
                  onChange={(v) =>
                    setReferralRates((p) => ({ ...p, REFERRAL_CREATOR_REWARD: v }))
                  }
                />
                <ConfigField
                  label="New User Reward (INR)"
                  hint="Paid to the referred user on completing KYC and uploading their first reel"
                  value={referralRates.REFERRAL_STANDARD_REWARD}
                  prefix="₹"
                  onChange={(v) =>
                    setReferralRates((p) => ({ ...p, REFERRAL_STANDARD_REWARD: v }))
                  }
                />
                <ConfigField
                  label="Super Referral Bonus (INR)"
                  hint="Bonus for referring 10+ creators within a calendar month"
                  value={referralRates.REFERRAL_SUPER_REWARD}
                  prefix="₹"
                  onChange={(v) =>
                    setReferralRates((p) => ({ ...p, REFERRAL_SUPER_REWARD: v }))
                  }
                />
                <button
                  type="submit"
                  disabled={referralSaving}
                  className="w-full h-10 bg-primary text-white text-[13px] font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {referralSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  {referralSaving ? 'Saving…' : 'Save Referral Rewards'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};