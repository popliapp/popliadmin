import React, { useState } from 'react';
import { usePlatformStore, Gift as GiftItem, Transaction } from '../store/usePlatformStore';
import { Coins, Check, X, Trash2, TrendingUp, Gift } from 'lucide-react';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';
import { API_URL } from '../services/api';
import { adminService } from '../services/adminService';

export const MonetizationPage: React.FC = () => {
  const {
    transactions,
    gifts,
    coinRateSettings,
    updateCoinRates,
    addGiftItem,
    deleteGiftItem,
    approveWithdrawal,
    rejectWithdrawal,
    creators,
    fetchAllData
  } = usePlatformStore();

  const [activeSubTab, setActiveSubTab] = useState<'withdrawal' | 'coin' | 'gifts' | 'referrals'>('withdrawal');
  const [newGiftName, setNewGiftName] = useState('');
  const [newGiftIcon, setNewGiftIcon] = useState('🎁');
  const [newGiftPrice, setNewGiftPrice] = useState(10);

  const [purchasePrice, setPurchasePrice] = useState(coinRateSettings.purchasePricePerCoin);
  const [redeemRate, setRedeemRate] = useState(coinRateSettings.withdrawalRedeemRate);
  const [minCoins, setMinCoins] = useState(coinRateSettings.minimumWithdrawalCoins);

  const [creatorReward, setCreatorReward] = useState(50);
  const [standardReward, setStandardReward] = useState(20);
  const [superReward, setSuperReward] = useState(500);

  const handleUpdateRates = (e: React.FormEvent) => {
    e.preventDefault();
    updateCoinRates({ purchasePricePerCoin: purchasePrice, withdrawalRedeemRate: redeemRate, minimumWithdrawalCoins: minCoins });
    toast.success('POPLI coin-rupee economy re-calibrated!', { icon: '💰' });
  };


  React.useEffect(() => {
    adminService.getConfigs()
      .then(data => {
        if (data.REFERRAL_CREATOR_REWARD) setCreatorReward(data.REFERRAL_CREATOR_REWARD);
        if (data.REFERRAL_STANDARD_REWARD) setStandardReward(data.REFERRAL_STANDARD_REWARD);
        if (data.REFERRAL_SUPER_REWARD) setSuperReward(data.REFERRAL_SUPER_REWARD);
      }).catch(console.error);
  }, []);

  const handleUpdateReferralRates = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await Promise.all([
        adminService.updateConfig('REFERRAL_CREATOR_REWARD', creatorReward),
        adminService.updateConfig('REFERRAL_STANDARD_REWARD', standardReward),
        adminService.updateConfig('REFERRAL_SUPER_REWARD', superReward)
      ]);
      toast.success('Referral Rewards Updated!', { icon: '🤝' });
    } catch (e) {
      toast.error('Failed to update referral rewards');
    }
  };

  const handleApprovePayout = (tx: Transaction) => {
    approveWithdrawal(tx.id);
    toast.success(`Withdrawal approved: ₹${tx.rupees.toLocaleString()} disbursed to @${tx.creatorUsername}.`, {
      icon: '💸',
      style: { background: 'hsl(var(--card))', color: 'hsl(var(--primary))', border: '1px solid hsl(var(--border))' }
    });
  };

  const handleRejectPayout = (tx: Transaction) => {
    rejectWithdrawal(tx.id);
    toast.error(`Withdrawal rejected for @${tx.creatorUsername}. Coins returned.`);
  };

  const handleAddGift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGiftName) return;

    const newGift: GiftItem = {
      id: `g_${Date.now()}`,
      name: newGiftName,
      icon: newGiftIcon,
      coinPrice: newGiftPrice,
      popularity: 0,
      animationType: 'bounce'
    };

    addGiftItem(newGift);
    toast.success(`Gift inventoried: ${newGiftIcon} ${newGiftName} added to catalog!`);
    setNewGiftName('');
    setNewGiftPrice(10);
  };

  const handleDeleteGift = (id: string) => {
    deleteGiftItem(id);
    toast.error('Gift removed from catalog.');
  };

  const pendingPayouts = transactions.filter(tx => tx.type === 'withdrawal' && tx.status === 'pending');
  const topEarnersList = [...creators].sort((a, b) => b.coinsEarned - a.coinsEarned).slice(0, 5);

  const tabs = [
    { id: 'withdrawal', label: 'Withdrawal Payouts' },
    { id: 'coin', label: 'Coin System Rate' },
    { id: 'gifts', label: 'Gifts Management' },
    { id: 'referrals', label: 'Referral Rewards' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">Monetization & Economy</h1>
          <p className="text-muted-foreground text-sm mt-1">POPLI coin economy balance sheet and withdrawal ledger</p>
        </div>

        {/* Pill Tabs */}
        <div className="flex bg-muted/60 backdrop-blur-sm border border-border p-1 rounded-xl gap-1 self-stretch sm:self-auto flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={cn(
                "px-4 py-2 text-xs font-semibold tracking-wide transition-all rounded-lg",
                activeSubTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeSubTab === 'withdrawal' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending withdrawals */}
          <div className="bg-card border border-border rounded-2xl p-6 lg:col-span-2 space-y-4 flex flex-col h-[500px] shadow-sm">
            <span className="text-sm font-semibold text-foreground">Creator Pending Withdrawals</span>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {pendingPayouts.length > 0 ? (
                pendingPayouts.map((tx) => (
                  <div
                    key={tx.id}
                    className={cn(
                      "p-4 border rounded-xl flex justify-between items-center hover:shadow-md transition-all bg-muted/40 border-border hover:border-primary/30"
                    )}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">@{tx.creatorUsername}</span>
                      </div>
                      <span className="text-muted-foreground text-xs block">Method: {tx.method}</span>
                      <span className="text-muted-foreground text-[10px] font-mono select-all block">Payment Status: Pending</span>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 ml-4">
                      <div className="text-right">
                        <span className="text-primary font-bold text-sm font-mono block">{tx.amount.toLocaleString()} Coins</span>
                        <span className="text-foreground font-semibold font-mono text-sm block mt-0.5">₹{tx.rupees.toLocaleString()}</span>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleApprovePayout(tx)}
                          className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg transition-colors active:scale-95"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRejectPayout(tx)}
                          className="p-2 bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 rounded-lg transition-colors active:scale-95"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-12 space-y-3">
                  <Coins className="w-10 h-10 opacity-20" />
                  <span className="font-semibold text-sm">Zero pending withdrawals</span>
                  <p className="text-xs leading-relaxed px-6">Automated payouts and transaction monitors are clear.</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Earners */}
          <div className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between h-[500px] shadow-sm">
            <div>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">Platform Top Earners</span>
              </div>

              <div className="space-y-3">
                {topEarnersList.map((creator, idx) => (
                  <div key={creator.id} className="p-3 bg-muted/40 border border-border rounded-xl flex justify-between items-center hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground w-5 shrink-0">#{idx + 1}</span>
                      <img src={creator.avatar} alt={creator.name} className="w-8 h-8 rounded-lg object-cover shrink-0 border border-border" />
                      <div className="min-w-0">
                        <span className="text-sm font-semibold text-foreground block truncate">{creator.name}</span>
                        <span className="text-muted-foreground text-xs block truncate">@{creator.username}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <span className="text-primary font-bold text-xs font-mono block">{creator.coinsEarned.toLocaleString()}</span>
                      <span className="text-muted-foreground text-[10px] block mt-0.5">₹{Math.floor(creator.coinsEarned * 0.85).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 text-primary font-semibold text-xs px-3 py-2.5 rounded-xl mt-4">
              <Coins className="h-3.5 w-3.5 shrink-0" />
              <span>Commerce Engine Active</span>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'coin' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coin rates form */}
          <div className="bg-card border border-border rounded-2xl p-6 lg:col-span-2 space-y-5 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Coins className="w-4 h-4 text-warning" />
              </div>
              <span className="text-sm font-semibold text-foreground">Coin Economy Settings</span>
            </div>

            <form onSubmit={handleUpdateRates} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Coin Purchase Price (INR per 1 Coin)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(parseFloat(e.target.value))}
                    className="w-full h-10 bg-muted/40 border border-border rounded-xl px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <span className="text-[10px] text-muted-foreground">Price creators/viewers pay in INR to buy a coin</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Coin Redeem Rate (INR per 1 Coin)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={redeemRate}
                    onChange={(e) => setRedeemRate(parseFloat(e.target.value))}
                    className="w-full h-10 bg-muted/40 border border-border rounded-xl px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <span className="text-[10px] text-muted-foreground">INR rate paid to creators for payout withdrawals</span>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Minimum Withdrawal Threshold (Coins)
                  </label>
                  <input
                    type="number"
                    required
                    value={minCoins}
                    onChange={(e) => setMinCoins(parseInt(e.target.value))}
                    className="w-full h-10 bg-muted/40 border border-border rounded-xl px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <span className="text-[10px] text-muted-foreground">Minimum coins required in wallet to invoke withdrawal</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all text-sm"
              >
                Re-Calibrate Coin System Rules
              </button>
            </form>
          </div>

          {/* Commission Analysis */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
            <span className="text-sm font-semibold text-foreground">Commission Analysis</span>
            <div className="p-4 bg-muted/40 border border-border rounded-xl space-y-3">
              <span className="font-semibold text-foreground text-sm block">Platform Tax Revenues</span>
              <p className="text-muted-foreground text-xs leading-relaxed">
                For every gift sent, POPLI injects a platform commission of 20% into platform revenue vaults.
              </p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Creators receive 80% equivalent coin balances which redeem at ₹{coinRateSettings.withdrawalRedeemRate} per coin.
              </p>
              <div className="pt-3 border-t border-border flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Platform Commission</span>
                <span className="text-primary font-bold text-sm">20% Fixed</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'gifts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* New gift form */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Gift className="w-4 h-4 text-secondary" />
              </div>
              <span className="text-sm font-semibold text-foreground">Invent New Gift Item</span>
            </div>

            <form onSubmit={handleAddGift} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Gift Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Crown"
                  value={newGiftName}
                  onChange={(e) => setNewGiftName(e.target.value)}
                  className="w-full h-10 bg-muted/40 border border-border rounded-xl px-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Select Emoji</label>
                <select
                  value={newGiftIcon}
                  onChange={(e) => setNewGiftIcon(e.target.value)}
                  className="w-full h-10 bg-muted/40 border border-border rounded-xl px-3 text-sm text-foreground outline-none cursor-pointer focus:border-primary transition-colors"
                >
                  <option value="🎁">🎁 Giftbox</option>
                  <option value="🌹">🌹 Rose</option>
                  <option value="❤️">❤️ Heart</option>
                  <option value="👑">👑 Crown</option>
                  <option value="💎">💎 Diamond</option>
                  <option value="🚀">🚀 Rocket</option>
                  <option value="🦁">🦁 Lion</option>
                  <option value="🔥">🔥 Fire</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Coin Price</label>
                <input
                  type="number"
                  required
                  value={newGiftPrice}
                  onChange={(e) => setNewGiftPrice(parseInt(e.target.value))}
                  className="w-full h-10 bg-muted/40 border border-border rounded-xl px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all text-sm"
              >
                Add Premium Gift Item
              </button>
            </form>
          </div>

          {/* Gift catalog */}
          <div className="bg-card border border-border rounded-2xl p-6 lg:col-span-2 space-y-4 shadow-sm">
            <span className="text-sm font-semibold text-foreground">Active Premium Gift Catalog</span>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {gifts.map((gift) => (
                <div
                  key={gift.id}
                  className="p-4 bg-muted/40 border border-border rounded-xl flex justify-between items-center group hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{gift.icon}</span>
                    <div>
                      <span className="text-sm font-semibold text-foreground block">{gift.name}</span>
                      <span className="text-muted-foreground text-[10px] font-mono block mt-0.5">{gift.coinPrice} coins</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteGift(gift.id)}
                    className="p-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'referrals' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <span className="text-sm font-semibold text-foreground">Referral Program Rewards</span>
            </div>

            <form onSubmit={handleUpdateReferralRates} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Creator Referral (INR)
                </label>
                <input
                  type="number"
                  required
                  value={creatorReward}
                  onChange={(e) => setCreatorReward(parseInt(e.target.value))}
                  className="w-full h-10 bg-muted/40 border border-border rounded-xl px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <span className="text-[10px] text-muted-foreground">Reward for referring a friend with 1K+ followers</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Standard User Referral (INR)
                </label>
                <input
                  type="number"
                  required
                  value={standardReward}
                  onChange={(e) => setStandardReward(parseInt(e.target.value))}
                  className="w-full h-10 bg-muted/40 border border-border rounded-xl px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <span className="text-[10px] text-muted-foreground">Reward for referring a normal viewer</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Super Referral (INR)
                </label>
                <input
                  type="number"
                  required
                  value={superReward}
                  onChange={(e) => setSuperReward(parseInt(e.target.value))}
                  className="w-full h-10 bg-muted/40 border border-border rounded-xl px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <span className="text-[10px] text-muted-foreground">Reward for referring 10+ creators in a month</span>
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 active:scale-[0.98] transition-all text-sm mt-4"
              >
                Update Referral Rewards
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
