import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useGym } from '../../contexts/GymContext';
import { AppStorage } from '../../lib/storage';
import {
  Menu,
  Search,
  Bell,
  QrCode,
  Flame,
  Clock,
  CreditCard,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { GymNotification } from '../../types/database';

interface NavbarProps {
  onOpenSidebar: () => void;
  onOpenQRScanner: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSidebar, onOpenQRScanner }) => {
  const { currentUser } = useAuth();
  const { currentGym } = useGym();

  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<GymNotification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNotifications(AppStorage.getNotifications(currentGym.id));
  }, [currentGym.id]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
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
      {/* Left: Mobile hamburger & Gym Brand Badge */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#1A2234]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141B2A] border border-[#232F48]">
          <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
          <span className="text-xs font-bold text-white tracking-wide">{currentGym.name}</span>
          <span className="text-[10px] text-orange-400 font-semibold bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20">
            Owner Dashboard
          </span>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search members, mobile, invoices, QR token..."
            className="w-full bg-[#121826] border border-[#222D42] rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500/60 transition-colors"
          />
        </div>
      </div>

      {/* Right: Quick actions, notifications, owner profile */}
      <div className="flex items-center gap-3">
        {/* Quick QR Check-in Button */}
        <button
          onClick={onOpenQRScanner}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/30 hover:bg-orange-500 hover:text-white transition-all text-xs font-semibold shadow-sm"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">QR Check-In</span>
        </button>

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

        {/* Current User Chip - Aman Singh (Owner) */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#1E273A]">
          <img
            src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
            alt={currentUser.full_name}
            className="w-7 h-7 rounded-full object-cover border border-orange-500/40"
          />
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
              {currentUser.full_name}
            </p>
            <p className="text-[10px] text-orange-400 uppercase font-semibold">
              Gym Owner
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
