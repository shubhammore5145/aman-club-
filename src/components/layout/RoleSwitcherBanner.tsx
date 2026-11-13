import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { Shield, Crown, Dumbbell, User, Database, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../../types/database';

export const RoleSwitcherBanner: React.FC = () => {
  const { currentRole, switchRole } = useAuth();

  const roles: { role: UserRole; label: string; icon: React.ReactNode; desc: string }[] = [
    { role: 'super_admin', label: 'Super Admin', icon: <Shield className="w-3.5 h-3.5" />, desc: 'Platform SaaS' },
    { role: 'gym_owner', label: 'Gym Owner', icon: <Crown className="w-3.5 h-3.5" />, desc: 'Aman Sport club' },
    { role: 'trainer', label: 'Trainer', icon: <Dumbbell className="w-3.5 h-3.5" />, desc: 'Vikram Sharma' },
    { role: 'member', label: 'Member', icon: <User className="w-3.5 h-3.5" />, desc: 'Rahul Verma' },
  ];

  return (
    <div className="bg-[#0B0E17] border-b border-[#1E273A] px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
        </span>
        <span className="text-slate-300 font-medium hidden sm:inline">Role Simulator:</span>
        <div className="flex items-center gap-1 bg-[#121826] p-1 rounded-lg border border-[#232D42]">
          {roles.map(r => (
            <button
              key={r.role}
              onClick={() => switchRole(r.role)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                currentRole === r.role
                  ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1A2234]'
              }`}
              title={r.desc}
            >
              {r.icon}
              <span>{r.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#121826] border border-[#232D42] text-slate-300 text-[11px]">
          <Database className="w-3.5 h-3.5 text-orange-400" />
          <span>Backend:</span>
          {isSupabaseConfigured ? (
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Supabase Cloud Active
            </span>
          ) : (
            <span className="text-amber-400 font-semibold flex items-center gap-1">
              Dual-Mode Local & Ready
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

