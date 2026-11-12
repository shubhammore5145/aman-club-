import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useGym } from '../../contexts/GymContext';
import { AppStorage } from '../../lib/storage';
import {
  Menu,
  Search,
  Bell,
  QrCode,
  Building2,
  ChevronDown,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { GymNotification } from '../../types/database';

interface NavbarProps {
  onOpenSidebar: () => void;
  onOpenQRScanner: () => void;
  onOpenMemberBadge?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSidebar, onOpenQRScanner, onOpenMemberBadge }) => {
  const { currentUser, currentRole } = useAuth();
  const { currentGym, allGyms, switchGym } = useGym();

  const [gymDropdownOpen, setGymDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<GymNotification[]>([]);

  const notifRef = useRef<HTMLDivElement>(null);
  const gymRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNotifications(AppStorage.getNotifications(currentGym.id));
  }, [currentGym.id]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
      if (gymRef.current && !gymRef.current.contains(e.target as Node)) {
        setGymDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = (id: string) => {
    AppStorage.markNotificationAsRead(id);
    setNotifications(AppStorage.getNotifications(currentGym.id));
  };

  return (
    <header className="h-16 bg-[#0D121D]/90 backdrop-blur-md border-b border-[#1E273A] px-4 lg:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile hamburger & Gym selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#1A2234]"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Multi-tenant Gym Switcher (Available for Super Admin & Owners) */}
        {(currentRole === 'super_admin' || currentRole === 'gym_owner') && (
          <div className="relative" ref={gymRef}>
            <button
              onClick={() => setGymDropdownOpen(!gymDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141B2A] border border-[#232F48] hover:border-orange-500/50 text-xs font-semibold text-slate-200 transition-all"
            >
              <Building2 className="w-3.5 h-3.5 text-orange-400" />
              <span className="max-w-[140px] sm:max-w-[180px] truncate">{currentGym.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {gymDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-[#111726] border border-[#232F48] rounded-xl shadow-2xl p-2 z-50">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 border-b border-[#1E283D]">
                  Switch Gym Tenant
                </div>
                <div className="mt-1 space-y-1">
                  {allGyms.map(gym => (
                    <button
                      key={gym.id}
                      onClick={() => {
                        switchGym(gym.id);
                        setGymDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                        gym.id === currentGym.id
                          ? 'bg-orange-500/15 text-orange-400 font-semibold'
                          : 'text-slate-300 hover:bg-[#1A2338]'
                      }`}
                    >
                      <div className="truncate">
                        <p className="truncate">{gym.name}</p>
                        <p className="text-[10px] text-slate-500">{gym.city || 'Standard Tenant'}</p>
                      </div>
                      {gym.id === currentGym.id && <Check className="w-4 h-4 text-orange-400 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Center: Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search members, phone, invoice, QR code..."
            className="w-full bg-[#121826] border border-[#222D42] rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500/60 transition-colors"
          />
        </div>
      </div>

      {/* Right: Quick actions, notifications, user avatar */}
      <div className="flex items-center gap-3">
        {/* Quick QR Check-in Button */}
        {currentRole !== 'member' ? (
          <button
            onClick={onOpenQRScanner}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/30 hover:bg-orange-500 hover:text-white transition-all text-xs font-semibold shadow-sm"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">QR Check-In</span>
          </button>
        ) : (
          <button
            onClick={onOpenMemberBadge}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 text-white shadow-glow-orange hover:bg-orange-600 transition-all text-xs font-semibold"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>My Pass</span>
          </button>
        )}

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#161E30] transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            )}
          </button>

          {notifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[#111726] border border-[#232F48] rounded-xl shadow-2xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-[#1E283D]">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Notifications</h4>
                <span className="text-[10px] text-orange-400 font-semibold">{unreadCount} new</span>
              </div>
              <div className="mt-2 space-y-2 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No notifications yet</p>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkAsRead(n.id)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                        n.is_read
                          ? 'bg-[#0E1320] border-[#1C2436] text-slate-400'
                          : 'bg-[#151D2E] border-orange-500/30 text-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {n.type === 'expiry' && <AlertCircle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />}
                        {n.type === 'payment' && <CreditCard className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />}
                        {n.type === 'system' && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 mt-0.5 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-100">{n.title}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{n.message}</p>
                          <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {formatDate(n.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Current User Chip */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#1E273A]">
          <img
            src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
            alt={currentUser.full_name}
            className="w-7 h-7 rounded-full object-cover border border-orange-500/40"
          />
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
              {currentUser.full_name}
            </p>
            <p className="text-[10px] text-orange-400 uppercase font-semibold">
              {currentUser.role.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
