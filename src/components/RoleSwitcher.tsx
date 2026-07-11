import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { switchRole } from '@/redux/slices/authSlice';
import { UserRole } from '@/types';
import { ShieldCheck, Eye, Coins, ShieldAlert, Megaphone, HelpCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

const ROLES: { role: UserRole; label: string; icon: any }[] = [
  { role: 'super_admin', label: 'Super Admin', icon: ShieldCheck },
  { role: 'moderator', label: 'Moderator', icon: ShieldAlert },
  { role: 'finance_admin', label: 'Finance Admin', icon: Coins },
  { role: 'support_admin', label: 'Support Admin', icon: HelpCircle },
  { role: 'marketing_admin', label: 'Marketing Admin', icon: Megaphone },
];

export const RoleSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleRoleSwitch = (role: UserRole) => {
    dispatch(switchRole(role));
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end select-none font-mono">
      {/* Expanded Role Selection Menu */}
      {isOpen && (
        <div className="mb-2 bg-[#FFFFFF] border border-[#BAE6FD] rounded-[2px] shadow-2xl p-2 w-56 animate-in slide-in-from-bottom-5 duration-200">
          <div className="px-3 py-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest border-b border-[#BAE6FD] mb-1.5">
            Switch Operator Clearance
          </div>
          <div className="space-y-0.5">
            {ROLES.map(({ role, label, icon: Icon }) => {
              const isActive = user?.role === role;
              return (
                <button
                  key={role}
                  onClick={() => handleRoleSwitch(role)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-[2px] text-xs transition-colors text-left font-mono uppercase tracking-tight",
                    isActive 
                      ? "bg-[#0ea5e9] text-black font-extrabold" 
                      : "hover:bg-[#F0F9FF] hover:text-[#0ea5e9] text-slate-600"
                  )}
                >
                  <Icon className={cn("w-3.5 h-3.5", isActive ? "text-black" : "text-slate-500 group-hover:text-[#0ea5e9]")} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-3 px-4 py-2.5 rounded-[2px] shadow-xl transition-all duration-300 font-semibold border active:scale-95 text-xs font-mono uppercase tracking-wider",
          isOpen
            ? "bg-[#0ea5e9] text-black border-transparent"
            : "bg-[#FFFFFF] hover:border-[#0ea5e9] text-[#0C4A6E] border-[#BAE6FD]"
        )}
      >
        <Eye className="w-4 h-4" />
        <div className="text-left pr-1">
          <div className="text-[8px] opacity-60 font-bold uppercase leading-none">Security clearance</div>
          <div className="text-xs font-bold leading-tight truncate max-w-[120px] mt-0.5">
            {user ? ROLES.find(r => r.role === user.role)?.label : 'Out of Bounds'}
          </div>
        </div>
      </button>
    </div>
  );
};
