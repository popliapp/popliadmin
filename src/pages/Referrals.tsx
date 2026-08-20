import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { Search, Users, Calendar, ArrowRight} from 'lucide-react';
import { motion } from 'framer-motion';

export const ReferralsPage: React.FC = () => {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const data = await adminService.getReferrals();
      setReferrals(data);
    } catch (error) {
      console.error('Error fetching referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReferrals = referrals.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.phone.includes(searchTerm) ||
    r.referrer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.referrer?.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-foreground tracking-tight flex items-center gap-3">
            Referrals Log
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Track user referrals across the platform</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 w-full pl-9 pr-4 rounded-lg border border-border bg-background text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Date Joined</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">New User</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"></th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Referred By</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Loading referrals...
                    </div>
                  </td>
                </tr>
              ) : filteredReferrals.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    No referrals found.
                  </td>
                </tr>
              ) : (
                filteredReferrals.map((referral, index) => (
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={referral.id}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-5 py-4 whitespace-nowrap text-[13px] text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {new Date(referral.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-[14px] text-foreground">{referral.name}</div>
                          <div className="text-[12px] text-muted-foreground">{referral.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </td>
                    <td className="px-5 py-4">
                      {referral.referrer ? (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <Users className="w-4 h-4 text-emerald-500" />
                          </div>
                          <div>
                            <div className="font-medium text-[14px] text-foreground">{referral.referrer.name}</div>
                            <div className="text-[12px] text-muted-foreground">{referral.referrer.phone}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[13px] text-muted-foreground italic">Unknown Referrer</span>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
