import React, { useState } from 'react';
import { ShieldCheck, Plus, UserCircle, Key, Activity } from 'lucide-react';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'moderator' | 'finance_admin' | 'marketing_admin' | 'support_admin';
  status: 'active' | 'inactive';
  lastLogin: string;
}

const mockStaff: AdminUser[] = [
  { id: 's_1', name: 'Aditya Sharma', email: 'aditya.sharma@popli.com', role: 'super_admin', status: 'active', lastLogin: 'Just now' },
  { id: 's_2', name: 'Shalini Nair', email: 'shalini.nair@popli.com', role: 'moderator', status: 'active', lastLogin: '10 min ago' },
  { id: 's_3', name: 'Sunita Patil', email: 'sunita.patil@popli.com', role: 'finance_admin', status: 'active', lastLogin: '1 hr ago' },
  { id: 's_4', name: 'Vikram Rao', email: 'vikram.rao@popli.com', role: 'support_admin', status: 'active', lastLogin: 'Yesterday' },
  { id: 's_5', name: 'Manish Sen', email: 'manish.sen@popli.com', role: 'marketing_admin', status: 'inactive', lastLogin: '3 days ago' }
];

const mockActivityLogs = [
  { id: 'l_1', actor: 'Shalini Nair', action: 'Banned creator account @toxic_dancer_99', date: '10 min ago', sector: 'Moderation' },
  { id: 'l_2', actor: 'Sunita Patil', action: 'Approved payout withdrawal of 25,000 coins for @pujapatel', date: '1 hr ago', sector: 'Finance' },
  { id: 'l_3', actor: 'Aditya Sharma', action: 'Adjusted recommendation weights watch-time coefficient to 45%', date: '3 hr ago', sector: 'Algorithm' },
  { id: 'l_4', actor: 'Vikram Rao', action: 'Resolved support complaint #1002 from @kabir_reddy', date: 'Yesterday', sector: 'Support' },
  { id: 'l_5', actor: 'Shalini Nair', action: 'Shadow-banned spam profile @bot_farming_99', date: 'Yesterday', sector: 'Moderation' }
];

const roleColors: Record<string, string> = {
  super_admin: 'bg-primary/10 text-primary border-primary/20',
  moderator: 'bg-secondary/10 text-secondary border-secondary/20',
  finance_admin: 'bg-warning/10 text-warning border-warning/20',
  support_admin: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  marketing_admin: 'bg-muted text-muted-foreground border-border',
};

const sectorColors: Record<string, string> = {
  Moderation: 'bg-secondary/10 text-secondary border-secondary/20',
  Finance: 'bg-warning/10 text-warning border-warning/20',
  Algorithm: 'bg-primary/10 text-primary border-primary/20',
  Support: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  'SYSTEM ACCESS': 'bg-muted text-muted-foreground border-border',
};

export const StaffPage: React.FC = () => {
  const [staff, setStaff] = useState<AdminUser[]>(mockStaff);
  const [logs, setLogs] = useState(mockActivityLogs);
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<AdminUser['role']>('moderator');

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const newAdmin: AdminUser = {
      id: `s_${Date.now()}`,
      name: newName,
      email: newEmail,
      role: newRole,
      status: 'active',
      lastLogin: 'Never'
    };

    setStaff(prev => [...prev, newAdmin]);
    setLogs(prev => [{
      id: Math.random().toString(),
      actor: 'Aditya Sharma (Super Admin)',
      action: `Created new admin account for ${newName} (${newRole.replace('_', ' ')})`,
      date: 'Just now',
      sector: 'SYSTEM ACCESS'
    }, ...prev]);

    toast.success(`Clearance issued: ${newName} added as ${newRole.replace('_', ' ')}!`, { icon: '🔑' });
    setNewName('');
    setNewEmail('');
  };

  const handleToggleStatus = (id: string) => {
    setStaff(prev => prev.map(s => {
      if (s.id === id) {
        const nextStatus = s.status === 'active' ? 'inactive' : 'active';
        toast.success(`Account changed to ${nextStatus} for ${s.name}`);
        return { ...s, status: nextStatus as 'active' | 'inactive' };
      }
      return s;
    }));
  };

  const tabs = [
    { id: 'users', label: 'Operations Team' },
    { id: 'logs', label: 'Activity Audit' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">Staff Management & Audit</h1>
          <p className="text-muted-foreground text-sm mt-1">POPLI system operators clearance index and access logs</p>
        </div>

        {/* Pill Tabs */}
        <div className="flex bg-muted/60 backdrop-blur-sm border border-border p-1 rounded-xl gap-1 self-stretch sm:self-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2 text-xs font-semibold tracking-wide transition-all rounded-lg",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add admin form */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Key className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">Issue Operator Clearance</span>
            </div>

            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Full Operator Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Shalini Nair"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full h-10 bg-muted/40 border border-border rounded-xl px-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Operational Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g., shalini@popli.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full h-10 bg-muted/40 border border-border rounded-xl px-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Access Role</label>
                <select
                  value={newRole}
                  onChange={(e: any) => setNewRole(e.target.value)}
                  className="w-full h-10 bg-muted/40 border border-border rounded-xl px-3 text-sm text-foreground outline-none cursor-pointer focus:border-primary transition-colors"
                >
                  <option value="moderator">🛡️ Content Moderator</option>
                  <option value="finance_admin">💰 Finance Controller</option>
                  <option value="support_admin">🤝 Support Manager</option>
                  <option value="marketing_admin">📢 Campaigns Injector</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Generate Operator Key
              </button>
            </form>
          </div>

          {/* Staff list */}
          <div className="bg-card border border-border rounded-2xl p-6 lg:col-span-2 space-y-4 flex flex-col h-[440px] shadow-sm">
            <span className="text-sm font-semibold text-foreground">POPLI Operations Desk</span>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {staff.map((s) => {
                const isSuper = s.role === 'super_admin';
                return (
                  <div
                    key={s.id}
                    className="p-4 bg-muted/40 border border-border rounded-xl flex justify-between items-center hover:border-primary/30 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                        isSuper ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        {isSuper ? <ShieldCheck className="w-4 h-4" /> : <UserCircle className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-foreground block">{s.name}</span>
                        <div className="flex gap-2 pt-1 items-center flex-wrap">
                          <span className={cn(
                            "text-[9px] font-bold px-1.5 py-0.5 rounded-lg border uppercase",
                            roleColors[s.role] || 'bg-muted text-muted-foreground border-border'
                          )}>
                            {s.role.replace('_', ' ')}
                          </span>
                          <span className="text-muted-foreground text-[10px]">{s.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-muted-foreground text-xs hidden sm:block">{s.lastLogin}</span>
                      <button
                        disabled={isSuper}
                        onClick={() => handleToggleStatus(s.id)}
                        className={cn(
                          "px-3 py-1 text-xs font-semibold rounded-lg border transition-all active:scale-[0.97]",
                          s.status === 'active'
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                            : "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20",
                          isSuper && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {s.status}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground">Tactical Activity Monitor</span>
          </div>

          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-4 bg-muted/40 border border-border rounded-xl flex justify-between items-center hover:border-primary/30 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">{log.actor}</span>
                    <span className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded-lg border uppercase tracking-wide",
                      sectorColors[log.sector] || 'bg-muted text-muted-foreground border-border'
                    )}>
                      {log.sector}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">{log.action}</p>
                </div>
                <span className="text-muted-foreground text-xs shrink-0 ml-4">{log.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
