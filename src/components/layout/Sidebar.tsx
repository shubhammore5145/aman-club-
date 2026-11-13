import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useGym } from '../../contexts/GymContext';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  QrCode,
  IndianRupee,
  UserCheck,
  Dumbbell,
  UtensilsCrossed,
  Receipt,
  Wrench,
  BarChart3,
  Settings,
  LogOut,
  Flame,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, isOpen, onClose }) => {
  const { logout } = useAuth();
  const { currentGym } = useGym();

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'memberships', label: 'Memberships', icon: CreditCard },
    { id: 'attendance', label: 'Attendance', icon: QrCode },
    { id: 'payments', label: 'Payments', icon: IndianRupee },
    { id: 'trainers', label: 'Trainers', icon: UserCheck },
    { id: 'workouts', label: 'Workouts', icon: Dumbbell },
    { id: 'diets', label: 'Diet Plans', icon: UtensilsCrossed },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'equipment', label: 'Equipment', icon: Wrench },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Gym Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/80 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0A0E17] border-r border-[#1D263B] flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-5 border-b border-[#1D263B] bg-[#0C111C]/80 gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-400 flex items-center justify-center text-white shadow-glow-orange shrink-0">
            <Flame className="w-5 h-5 fill-white" />
          </div>
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-white tracking-wide truncate">
              {currentGym.name}
            </h1>
            <p className="text-[10px] text-orange-400 uppercase tracking-widest font-semibold flex items-center gap-1">
              Owner Control Center
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Management Modules
          </div>

          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-[#121929]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-orange-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-orange-400" />}
              </button>
            );
          })}
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-3 border-t border-[#1D263B] bg-[#0C111C]/60">
          <div className="flex items-center justify-between p-2 rounded-lg bg-[#111726] border border-[#202B42]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                A
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-200 truncate">Aman Singh</p>
                <p className="text-[10px] text-orange-400 font-semibold uppercase">
                  Gym Owner
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
