import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { ChevronLeft, CheckCircle, XCircle, RefreshCw, AlertCircle, Clock, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';

const formatINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    DRAFT: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    PROCESSING: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
    SUCCESS: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    FAILED: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
    REVERSED: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20',
  };
  return map[status] || 'bg-muted text-foreground border-border';
};

export const PaymentProcessDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const data = await adminService.getPaymentProcessDetail(id);
      setRecord(data);
    } catch {
      toast.error('Failed to load payment detail');
      navigate('/payment-process');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSendPayout = async () => {
    if (!record) return;
    setSending(true);
    try {
      await adminService.sendWithdrawalPayout(record.withdrawalId);
      toast.success('Payout sent to Cashfree. Status will update via webhook.');
      loadData();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to send payout');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (!record) return null;

  const isDraft = record.status === 'DRAFT';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/payment-process')}
            className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-[26px] font-bold text-foreground tracking-tight">Payment Detail</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              Ref: {record.withdrawalId.slice(-8).toUpperCase()}
            </p>
          </div>
        </div>
        <span className={cn('text-[12px] font-bold px-3 py-1 border rounded-full', statusBadge(record.status))}>
          {record.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h2 className="text-[14px] font-bold uppercase tracking-wider text-muted-foreground">Creator Info</h2>
          <div className="flex items-center gap-4">
            <img 
              src={record.creator.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${record.creator.username}`} 
              className="w-12 h-12 rounded-full border border-border bg-muted" 
              alt="Avatar"
            />
            <div>
              <p className="text-[15px] font-semibold text-foreground">{record.creator.name}</p>
              <p className="text-[13px] text-muted-foreground">@{record.creator.username}</p>
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-border grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] text-muted-foreground mb-0.5">Email</p>
              <p className="text-[13px] font-medium text-foreground truncate">{record.creator.email}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground mb-0.5">Phone</p>
              <p className="text-[13px] font-medium text-foreground">{record.creator.phone || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h2 className="text-[14px] font-bold uppercase tracking-wider text-muted-foreground">Payment Details</h2>
          <div className="grid grid-cols-2 gap-y-4 gap-x-4">
            <div>
              <p className="text-[11px] text-muted-foreground mb-0.5">Requested Amount</p>
              <p className="text-[14px] font-medium text-foreground">{formatINR(record.amount)}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground mb-0.5">Approved Amount</p>
              <p className="text-[14px] font-bold text-emerald-600">{formatINR(record.approvedAmount || record.amount)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[11px] text-muted-foreground mb-0.5">Payout Method ({record.paymentMethod?.type})</p>
              <p className="text-[13px] font-mono font-medium text-foreground">
                {record.paymentMethod?.type === 'UPI' 
                  ? record.paymentMethod?.upiId 
                  : `${record.paymentMethod?.accountNumber} (IFSC: ${record.paymentMethod?.ifscCode})`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-[14px] font-bold uppercase tracking-wider text-muted-foreground mb-4">Cashfree Integration</h2>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-[13px] text-muted-foreground">Transfer ID</span>
            <span className="text-[13px] font-mono text-foreground">{record.cashfreeTransferId || 'Not assigned yet'}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-[13px] text-muted-foreground">Last Updated</span>
            <span className="text-[13px] text-foreground">{new Date(record.updatedAt).toLocaleString('en-IN')}</span>
          </div>
          
          {isDraft && (
            <div className="mt-4 flex flex-col gap-3">
              <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 rounded-lg border border-amber-200 dark:border-amber-500/20">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p className="text-[13px] text-amber-800 dark:text-amber-400">
                  This payment is currently a <strong>DRAFT</strong>. Click the button below to initiate the transfer via Cashfree API.
                  Once initiated, it cannot be canceled.
                </p>
              </div>
              
              <button
                onClick={handleSendPayout}
                disabled={sending}
                className="w-full sm:w-auto self-end px-6 py-3 bg-primary text-white rounded-lg font-bold text-[14px] hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {sending ? 'Sending Payout...' : 'Send Payout via Cashfree'}
              </button>
            </div>
          )}

          {!isDraft && record.status !== 'PROCESSING' && (
            <div className="mt-2 p-4 bg-muted/50 rounded-lg border border-border flex items-center justify-center gap-2 text-muted-foreground">
              {record.status === 'SUCCESS' ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-rose-500" />}
              <span className="text-[13px] font-medium">Payment processed. No further action required.</span>
            </div>
          )}

          {record.status === 'PROCESSING' && (
            <div className="mt-2 p-4 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 flex items-center justify-center gap-2 text-blue-700 dark:text-blue-400">
              <Clock className="w-5 h-5 animate-pulse" />
              <span className="text-[13px] font-medium">Processing... Waiting for Cashfree Webhook</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
