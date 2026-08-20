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
  { id: 'refunds', label: 'Coin Refunds' },
] as const;

type TabId = (typeof TABS)[number]['id'];

interface PaymentRecord {
  id: string;
  userId: string;
  packageId: string;
  gatewayOrderId: string;
  gatewayPaymentId: string | null;
  amount: number;
  coinsToCredit: number;
  status: string;
  paymentMethod: string | null;
  verifiedAt: string | null;
  createdAt: string;
  refunds: CoinRefund[];
}

interface CoinRefund {
  id: string;
  gatewayRefundId: string | null;
  amount: number;
  coinsDeducted: number;
  reason: string;
  status: string;
  processedAt: string | null;
  createdAt: string;
}

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

const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [paymentRecordsLoading, setPaymentRecordsLoading] = useState(false);
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);
  const [refundModal, setRefundModal] = useState<{
    open: boolean;
    record: PaymentRecord | null;
  }>({ open: false, record: null });
  const [refundForm, setRefundForm] = useState<{
    refundType: 'FULL' | 'PARTIAL';
    amount: string;
    reason: string;
  }>({ refundType: 'FULL', amount: '', reason: '' });
  const [refundSubmitting, setRefundSubmitting] = useState(false);
  const [refundSuccess, setRefundSuccess] = useState<{
    gatewayRefundId: string;
    refundAmount: number;
    coinsDeducted: number;
    status: string;
  } | null>(null);

  const loadPaymentRecords = useCallback(async () => {
    setPaymentRecordsLoading(true);
    try {
      const data = await adminService.getPaymentRecords();
      setPaymentRecords(data);
    } catch {
      toast.error('Failed to load payment records');
    } finally {
      setPaymentRecordsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'refunds' && paymentRecords.length === 0) {
      loadPaymentRecords();
    }
  }, [activeTab]);

  const getMaxRefundable = (record: PaymentRecord) => {
    const totalRefunded = record.refunds
      .filter(r => r.status === 'COMPLETED')
      .reduce((s, r) => s + r.amount, 0);
    return record.amount - totalRefunded;
  };

  const handleOpenRefundModal = (record: PaymentRecord) => {
    const max = getMaxRefundable(record);
    setRefundForm({ refundType: 'FULL', amount: String(max), reason: '' });
    setRefundSuccess(null);
    setRefundModal({ open: true, record });
  };

  const handleSubmitRefund = async () => {
    if (!refundModal.record) return;
    if (!refundForm.reason.trim()) {
      toast.error('Refund reason is required.');
      return;
    }
    const max = getMaxRefundable(refundModal.record);
    if (refundForm.refundType === 'PARTIAL') {
      const amt = parseFloat(refundForm.amount);
      if (!amt || amt <= 0 || amt > max) {
        toast.error(`Partial refund amount must be between 1 and ${max}.`);
        return;
      }
    }
    setRefundSubmitting(true);
    try {
      const result = await adminService.executeCoinRefund(refundModal.record.id, {
        refundType: refundForm.refundType,
        amount: refundForm.refundType === 'PARTIAL' ? parseFloat(refundForm.amount) : undefined,
        reason: refundForm.reason.trim(),
      });
      setRefundSuccess({
        gatewayRefundId: result.gatewayRefundId,
        refundAmount: result.refundAmount,
        coinsDeducted: result.coinsDeducted,
        status: result.status,
      });
      loadPaymentRecords();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to process refund.');
    } finally {
      setRefundSubmitting(false);
    }
  };

  const refundStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      PROCESSING: 'bg-amber-50 text-amber-700 border-amber-200',
      FAILED: 'bg-red-50 text-red-700 border-red-200',
      SUCCESS: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      REFUNDED: 'bg-rose-50 text-rose-700 border-rose-200',
      PARTIALLY_REFUNDED: 'bg-orange-50 text-orange-700 border-orange-200',
    };
    return map[status] || 'bg-muted text-foreground border-border';
  };

const [reviewModal, setReviewModal] = useState<{ open: boolean; data: any | null }>({ open: false, data: null });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [draftStep, setDraftStep] = useState<'amount' | 'confirm' | null>(null);
  const [selectedAmountType, setSelectedAmountType] = useState<'full' | 'partial' | 'custom'>('full');
  const [customAmount, setCustomAmount] = useState('');
  const [draftSubmitting, setDraftSubmitting] = useState(false);
  const [sendingPayment, setSendingPayment] = useState(false);
  const [draftData, setDraftData] = useState<any | null>(null);

  const getApprovedAmount = (reviewData: any): number => {
    if (selectedAmountType === 'full') return reviewData.amount;
    if (selectedAmountType === 'partial') return Math.round(reviewData.amount * 0.7 * 100) / 100;
    return parseFloat(customAmount) || 0;
  };

  const handleOpenReview = async (w: PendingWithdrawal) => {
    setReviewLoading(true);
    setDraftStep('amount');
    setSelectedAmountType('full');
    setCustomAmount('');
    setDraftData(null);
    try {
      const data = await adminService.reviewWithdrawal(w.id);
      setReviewModal({ open: true, data });
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to load withdrawal details');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleCreateDraft = async () => {
    if (!reviewModal.data) return;
    const amt = getApprovedAmount(reviewModal.data);
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return; }
    if (amt > reviewModal.data.amount) { toast.error('Amount cannot exceed requested amount'); return; }
    if (amt > reviewModal.data.creator.availableBalance) { toast.error('Amount exceeds creator available balance'); return; }
    setDraftSubmitting(true);
    try {
      const draft = await adminService.createPaymentDraft(reviewModal.data.id, amt);
      setDraftData(draft);
      setDraftStep('confirm');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to create payment draft');
    } finally {
      setDraftSubmitting(false);
    }
  };

  const handleConfirmSend = async () => {
    if (!reviewModal.data) return;
    setSendingPayment(true);
    try {
      await adminService.sendWithdrawalPayout(reviewModal.data.id);
      toast.success('Payment sent via Cashfree. Status will update via webhook.');
      setReviewModal({ open: false, data: null });
      setDraftStep(null);
      loadMonetizationData();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to send payment');
    } finally {
      setSendingPayment(false);
    }
  };

const [rejectModal, setRejectModal] = useState<{ open: boolean; withdrawal: PendingWithdrawal | null }>({ open: false, withdrawal: null });
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const handleReject = (w: PendingWithdrawal) => {
    setRejectModal({ open: true, withdrawal: w });
    setRejectReason('');
  };

  const confirmReject = async () => {
    if (!rejectModal.withdrawal) return;
    if (!rejectReason.trim() || rejectReason.trim().length < 5) {
      toast.error('Please enter a rejection reason (min 5 characters)');
      return;
    }
    setRejecting(true);
    try {
      await adminService.rejectWithdrawal(rejectModal.withdrawal.id, rejectReason.trim());
      toast.success(`Rejected withdrawal for @${rejectModal.withdrawal.creatorUsername}. Balance refunded.`);
      setRejectModal({ open: false, withdrawal: null });
      loadMonetizationData();
    } catch {
      toast.error('Failed to reject withdrawal');
    } finally {
      setRejecting(false);
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
                          onClick={() => handleOpenReview(w)}
                          disabled={reviewLoading}
                          title="Review and process withdrawal"
                          className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleReject(w)}
                          title="Reject withdrawal"
                          className="p-2 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
{activeTab === 'refunds' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-semibold text-foreground">Coin Purchase Refunds</h2>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                Refund accidental coin purchases back to user bank accounts via Cashfree.
              </p>
            </div>
            <button
              onClick={loadPaymentRecords}
              disabled={paymentRecordsLoading}
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', paymentRecordsLoading && 'animate-spin')} />
            </button>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {paymentRecordsLoading ? (
              <div className="p-5 space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : paymentRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                <Coins className="w-8 h-8 text-muted-foreground opacity-30" />
                <p className="text-[13px] font-semibold text-foreground">No payment records found</p>
                <p className="text-[12px] text-muted-foreground">Successful coin purchases will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 border-b border-border text-muted-foreground font-bold text-[10px] uppercase">
                    <tr>
                      <th className="px-5 py-3">Payment ID</th>
                      <th className="px-5 py-3">User ID</th>
                      <th className="px-5 py-3">Amount</th>
                      <th className="px-5 py-3">Coins</th>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3 text-center">Status</th>
                      <th className="px-5 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {paymentRecords.map(record => {
                      const max = getMaxRefundable(record);
                      const totalRefunded = record.refunds
                        .filter(r => r.status === 'COMPLETED')
                        .reduce((s, r) => s + r.amount, 0);
                      const isExpanded = expandedRecord === record.id;
                      const canRefund = ['SUCCESS', 'PARTIALLY_REFUNDED'].includes(record.status) && max > 0 && record.gatewayPaymentId;

                      return (
                        <>
                          <tr
                            key={record.id}
                            className="hover:bg-muted/20 cursor-pointer"
                            onClick={() => setExpandedRecord(isExpanded ? null : record.id)}
                          >
                            <td className="px-5 py-3 font-mono text-[11px] text-muted-foreground">
                              {record.gatewayPaymentId?.slice(0, 16) ?? '-'}...
                            </td>
                            <td className="px-5 py-3 font-mono text-[11px] text-muted-foreground">
                              {record.userId.slice(0, 12)}...
                            </td>
                            <td className="px-5 py-3 font-bold text-foreground">
                              {formatINR(record.amount)}
                              {totalRefunded > 0 && (
                                <div className="text-[10px] text-rose-500 font-medium">
                                  -{formatINR(totalRefunded)} refunded
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-3 text-foreground">{record.coinsToCredit}</td>
                            <td className="px-5 py-3 text-[11px] text-muted-foreground">
                              {new Date(record.createdAt).toLocaleString('en-IN')}
                            </td>
                            <td className="px-5 py-3 text-center">
                              <span className={cn('text-[10px] font-bold px-2 py-0.5 border rounded-full inline-block', refundStatusBadge(record.status))}>
                                {record.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-right" onClick={e => e.stopPropagation()}>
                              {canRefund && (
                                <button
                                  onClick={() => handleOpenRefundModal(record)}
                                  className="text-rose-600 hover:text-rose-800 text-[11px] font-bold hover:underline"
                                >
                                  Refund
                                </button>
                              )}
                            </td>
                          </tr>
                          {isExpanded && record.refunds.length > 0 && (
                            <tr key={`${record.id}-refunds`}>
                              <td colSpan={7} className="px-5 pb-3 pt-0 bg-rose-50/40">
                                <div className="border border-rose-100 rounded-lg overflow-hidden">
                                  <div className="px-4 py-2 bg-rose-50 border-b border-rose-100">
                                    <span className="text-[10px] font-black text-rose-700 uppercase tracking-wider">
                                      Refund History ({record.refunds.length})
                                    </span>
                                  </div>
                                  {record.refunds.map(r => (
                                    <div key={r.id} className="px-4 py-2.5 flex items-center justify-between border-b border-rose-50 last:border-0 bg-white">
                                      <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                          <span className="font-mono text-[10px] text-muted-foreground">
                                            {r.gatewayRefundId ?? r.id.slice(0, 14)}...
                                          </span>
                                          <span className={cn('text-[9px] font-black px-1.5 py-0.5 rounded border uppercase', refundStatusBadge(r.status))}>
                                            {r.status}
                                          </span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">Reason: {r.reason}</p>
                                        <p className="text-[10px] text-muted-foreground">
                                          {new Date(r.createdAt).toLocaleString('en-IN')}
                                          {r.processedAt ? ` — Processed: ${new Date(r.processedAt).toLocaleString('en-IN')}` : ''}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-sm font-black text-rose-600">-{formatINR(r.amount)}</div>
                                        <div className="text-[10px] text-muted-foreground">{r.coinsDeducted} coins deducted</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {refundModal.open && refundModal.record && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-base font-black text-foreground">Refund Coin Purchase</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Max refundable: <span className="font-bold text-foreground">{formatINR(getMaxRefundable(refundModal.record))}</span>
                </p>
              </div>
              <button
                onClick={() => { setRefundModal({ open: false, record: null }); setRefundSuccess(null); }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {refundSuccess ? (
              <div className="p-6 space-y-4">
                <div className="flex flex-col items-center text-center gap-3 py-2">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <Check className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-black text-foreground text-base">
                      Refund {refundSuccess.status === 'COMPLETED' ? 'Processed' : 'Initiated'}
                    </p>
                    <p className="text-[12px] text-muted-foreground mt-1">
                      {formatINR(refundSuccess.refundAmount)} will be credited within 5-7 business days.
                    </p>
                    <p className="text-[11px] text-amber-600 font-medium mt-1">
                      {refundSuccess.coinsDeducted} coins deducted from user wallet.
                    </p>
                  </div>
                </div>
                {refundSuccess.gatewayRefundId && (
                  <div className="bg-muted/40 border border-border rounded-lg px-4 py-3 text-center space-y-1">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Cashfree Refund ID</p>
                    <p className="font-mono text-[12px] font-bold text-foreground">{refundSuccess.gatewayRefundId}</p>
                  </div>
                )}
                <button
                  onClick={() => { setRefundModal({ open: false, record: null }); setRefundSuccess(null); }}
                  className="w-full border border-border rounded-lg py-2.5 text-sm font-bold text-foreground hover:bg-muted/30 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-foreground mb-2 uppercase tracking-wider">
                    Refund Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['FULL', 'PARTIAL'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => setRefundForm(f => ({
                          ...f,
                          refundType: type,
                          amount: type === 'FULL' ? String(getMaxRefundable(refundModal.record!)) : '',
                        }))}
                        className={cn(
                          'py-2.5 rounded-lg border text-sm font-bold transition-all',
                          refundForm.refundType === type
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border text-muted-foreground hover:text-foreground',
                        )}
                      >
                        {type === 'FULL' ? `Full — ${formatINR(getMaxRefundable(refundModal.record!))}` : 'Partial'}
                      </button>
                    ))}
                  </div>
                </div>

                {refundForm.refundType === 'PARTIAL' && (
                  <div>
                    <label className="block text-[11px] font-bold text-foreground mb-1.5 uppercase tracking-wider">
                      Amount (INR)
                    </label>
                    <input
                      type="number"
                      value={refundForm.amount}
                      onChange={e => setRefundForm(f => ({ ...f, amount: e.target.value }))}
                      max={getMaxRefundable(refundModal.record)}
                      min={1}
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                      placeholder={`Max ${getMaxRefundable(refundModal.record)}`}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-foreground mb-1.5 uppercase tracking-wider">
                    Reason
                  </label>
                  <textarea
                    value={refundForm.reason}
                    onChange={e => setRefundForm(f => ({ ...f, reason: e.target.value }))}
                    rows={3}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="State the reason for this refund..."
                  />
                </div>

                <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-3">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    This will initiate a real refund via Cashfree and deduct the proportional coins from the user wallet. This cannot be undone.
                  </p>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => setRefundModal({ open: false, record: null })}
                    className="flex-1 border border-border rounded-lg py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitRefund}
                    disabled={refundSubmitting}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg py-2.5 text-sm font-black disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {refundSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                    {refundSubmitting ? 'Processing...' : 'Confirm Refund'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

  {reviewModal.open && reviewModal.data && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg my-4">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-[15px] font-black text-foreground">
                  {draftStep === 'confirm' ? 'Confirm Payment' : 'Review Withdrawal'}
                </h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  @{reviewModal.data.creator.username} — Requested {formatINR(reviewModal.data.amount)}
                </p>
              </div>
              <button onClick={() => { setReviewModal({ open: false, data: null }); setDraftStep(null); }} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Creator</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[12px]">
                  <span className="text-muted-foreground">Name</span><span className="text-foreground font-semibold">{reviewModal.data.creator.name}</span>
                  <span className="text-muted-foreground">Username</span><span className="text-foreground font-semibold">@{reviewModal.data.creator.username}</span>
                  <span className="text-muted-foreground">Email</span><span className="text-foreground truncate">{reviewModal.data.creator.email}</span>
                  <span className="text-muted-foreground">Available Balance</span><span className="text-emerald-600 font-bold">{formatINR(reviewModal.data.creator.availableBalance)}</span>
                </div>
              </div>

              {reviewModal.data.paymentMethod && (
                <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Payment Method</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[12px]">
                    <span className="text-muted-foreground">Type</span><span className="text-foreground font-semibold">{reviewModal.data.paymentMethod.type}</span>
                    {reviewModal.data.paymentMethod.type === 'UPI' && (
                      <><span className="text-muted-foreground">UPI ID</span><span className="text-foreground font-semibold">{reviewModal.data.paymentMethod.upiId}</span></>
                    )}
                    {reviewModal.data.paymentMethod.type === 'BANK' && (
                      <>
                        <span className="text-muted-foreground">Account</span><span className="text-foreground font-semibold">{reviewModal.data.paymentMethod.accountNumber}</span>
                        <span className="text-muted-foreground">IFSC</span><span className="text-foreground font-semibold">{reviewModal.data.paymentMethod.ifscCode}</span>
                      </>
                    )}
                    <span className="text-muted-foreground">Verified</span>
                    <span className={reviewModal.data.paymentMethod.verified ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold'}>
                      {reviewModal.data.paymentMethod.verified ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              )}

              {draftStep === 'amount' && (
                <div className="space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Select Payout Amount</p>
                  <div className="space-y-2">
                    {(['full', 'partial', 'custom'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedAmountType(type)}
                        className={cn(
                          'w-full flex items-center justify-between px-4 py-3 rounded-xl border text-[13px] font-semibold transition-all',
                          selectedAmountType === type
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border text-muted-foreground hover:text-foreground',
                        )}
                      >
                        <span>
                          {type === 'full' && 'Pay Full Amount'}
                          {type === 'partial' && 'Pay Partial (~70%)'}
                          {type === 'custom' && 'Enter Custom Amount'}
                        </span>
                        <span className="font-bold">
                          {type === 'full' && formatINR(reviewModal.data.amount)}
                          {type === 'partial' && formatINR(Math.round(reviewModal.data.amount * 0.7 * 100) / 100)}
                          {type === 'custom' && (customAmount ? formatINR(parseFloat(customAmount) || 0) : '—')}
                        </span>
                      </button>
                    ))}
                  </div>
                  {selectedAmountType === 'custom' && (
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder={`Max ${reviewModal.data.amount}`}
                      className="w-full h-10 bg-muted border border-border rounded-lg px-3 text-[13px] text-foreground outline-none focus:border-primary"
                    />
                  )}
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setReviewModal({ open: false, data: null })} className="flex-1 h-10 border border-border rounded-lg text-[13px] font-medium text-muted-foreground hover:bg-muted">
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateDraft}
                      disabled={draftSubmitting}
                      className="flex-1 h-10 bg-primary text-white rounded-lg text-[13px] font-black disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {draftSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                      {draftSubmitting ? 'Creating Draft...' : 'Create Payment Draft'}
                    </button>
                  </div>
                </div>
              )}

              {draftStep === 'confirm' && draftData && (
                <div className="space-y-4">
                  <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Payment Summary</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[12px]">
                      <span className="text-muted-foreground">Approved Amount</span><span className="text-foreground font-bold">{formatINR(draftData.approvedAmount)}</span>
                      <span className="text-muted-foreground">TDS Deducted</span><span className="text-red-500 font-semibold">-{formatINR(draftData.tdsDeducted)}</span>
                      <span className="text-muted-foreground">Platform Fee</span><span className="text-red-500 font-semibold">-{formatINR(draftData.platformFeeDeducted)}</span>
                      <span className="text-muted-foreground font-bold">Net to Creator</span><span className="text-emerald-600 font-black">{formatINR(draftData.netPayable)}</span>
                    </div>
                  </div>
                  <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-1 text-[12px]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Payment Service</p>
                    <div className="flex justify-between"><span className="text-muted-foreground">Provider</span><span className="text-foreground font-bold">Cashfree Payouts</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Environment</span><span className="text-foreground font-semibold capitalize">{draftData.cashfreeEnvironment}</span></div>
                  </div>
                  <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 rounded-lg px-3.5 py-3 text-[11px] text-blue-800 dark:text-blue-300">
                    This will initiate a real Cashfree payout. Once sent, the status will update via webhook. This cannot be undone.
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button onClick={() => setDraftStep('amount')} className="flex-1 h-10 border border-border rounded-lg text-[13px] font-medium text-muted-foreground hover:bg-muted">
                      Back
                    </button>
                    <button
                      onClick={handleConfirmSend}
                      disabled={sendingPayment}
                      className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[13px] font-black disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {sendingPayment && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                      {sendingPayment ? 'Sending...' : 'Confirm & Send Payment'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {rejectModal.open && rejectModal.withdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[15px] font-semibold text-foreground">Reject Withdrawal</h3>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  @{rejectModal.withdrawal.creatorUsername} — {formatINR(rejectModal.withdrawal.rupees)}
                </p>
              </div>
              <button
                onClick={() => setRejectModal({ open: false, withdrawal: null })}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Rejection Reason (mandatory)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Incorrect bank details, KYC pending, Fraud detection..."
                rows={3}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-[13px] text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              />
              <p className="text-[11px] text-muted-foreground">
                This reason will be sent to the creator via notification.
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setRejectModal({ open: false, withdrawal: null })}
                className="flex-1 h-10 border border-border rounded-lg text-[13px] font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={rejecting || rejectReason.trim().length < 5}
                className="flex-1 h-10 bg-red-500 hover:bg-red-600 text-white rounded-lg text-[13px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {rejecting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {rejecting ? 'Rejecting…' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
