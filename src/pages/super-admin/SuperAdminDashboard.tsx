import React, { useState, useEffect } from 'react';
import { AppStorage, DATA_CHANGE_EVENT } from '../../lib/storage';
import { Gym, GymSubscription } from '../../types/database';
import { StatsCard } from '../../components/ui/StatsCard';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency, formatDate } from '../../lib/utils';
import {
  Shield,
  Building2,
  Users,
  CreditCard,
  IndianRupee,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  PowerOff,
  Power,
  ArrowRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface SuperAdminDashboardProps {
  onNavigate: (page: string) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ onNavigate }) => {
  const [gyms, setGyms] = useState<Gym[]>(AppStorage.getGyms());
  const [subscriptions, setSubscriptions] = useState<GymSubscription[]>(AppStorage.getSubscriptions());
  const [allMembers, setAllMembers] = useState(AppStorage.getMembers());

  const loadData = () => {
    setGyms(AppStorage.getGyms());
    setSubscriptions(AppStorage.getSubscriptions());
  };

  useEffect(() => {
    loadData();
    window.addEventListener(DATA_CHANGE_EVENT, loadData);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, loadData);
  }, []);

  const totalGyms = gyms.length;
  const activeGyms = gyms.filter(g => g.status === 'active').length;
  const suspendedGyms = gyms.filter(g => g.status === 'suspended').length;

  const totalSaaSRevenue = subscriptions.reduce((sum, s) => sum + s.total_amount, 0);
  const mrr = subscriptions.reduce((sum, s) => {
    if (s.cycle === 'monthly') return sum + s.amount;
    return sum + (s.amount / 12);
  }, 0);

  const saasGrowthData = [
    { month: 'Jun', gyms: 4, revenue: 45000 },
    { month: 'Jul', gyms: 7, revenue: 85000 },
    { month: 'Aug', gyms: 12, revenue: 140000 },
    { month: 'Sep', gyms: 18, revenue: 210000 },
    { month: 'Oct', gyms: 24, revenue: 295000 },
    { month: 'Nov', gyms: 32, revenue: 385000 },
  ];

  const handleToggleGymStatus = (gymId: string, currentStatus: Gym['status']) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    AppStorage.updateGymStatus(gymId, nextStatus);
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#141B2D] via-[#101524] to-[#0A0D16] border border-orange-500/30 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Super Admin SaaS Command Hub</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500 text-white">
              Platform Master
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Multi-tenant oversight across all registered clubs, tenant isolation, and recurring platform revenue.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onNavigate('super-admin-gyms')}
          >
            Manage Gym Tenants
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => onNavigate('super-admin-subscriptions')}
          >
            SaaS Tier Plans
          </Button>
        </div>
      </div>

      {/* Global SaaS KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Gym Tenants"
          value={totalGyms}
          change="+4 this mo"
          trend="up"
          icon={<Building2 className="w-4 h-4 text-orange-400" />}
          description="Registered SaaS tenants"
        />
        <StatsCard
          title="Active Gyms"
          value={activeGyms}
          change={`${Math.round((activeGyms / totalGyms) * 100)}% operational`}
          trend="up"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          description="Live subscriptions"
        />
        <StatsCard
          title="Monthly Recurring (MRR)"
          value={formatCurrency(Math.round(mrr))}
          change="+28.4% MoM"
          trend="up"
          icon={<IndianRupee className="w-4 h-4 text-emerald-400" />}
          description="Normalized SaaS run-rate"
        />
        <StatsCard
          title="Suspended Gyms"
          value={suspendedGyms}
          change={suspendedGyms > 0 ? 'Policy hold' : 'Zero flags'}
          trend={suspendedGyms > 0 ? 'down' : 'neutral'}
          icon={<AlertTriangle className="w-4 h-4 text-rose-400" />}
          description="Payment default or review"
        />
      </div>

      {/* Growth Chart */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>SaaS Platform Growth & Expansion</CardTitle>
            <CardDescription>Monthly new gym onboarding vs aggregate recurring revenue</CardDescription>
          </div>
          <Badge variant="orange" size="sm">Global Telemetry</Badge>
        </CardHeader>
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={saasGrowthData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="saasRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E283D" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={v => `₹${v/1000}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#101522', borderColor: '#232D42', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val: number) => [`₹${val.toLocaleString()}`, '']}
              />
              <Area type="monotone" dataKey="revenue" name="Platform Revenue" stroke="#f97316" strokeWidth={2.5} fillOpacity={1} fill="url(#saasRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Gym Directory with One-Click Suspend / Activate */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Registered Gym Tenants</CardTitle>
            <CardDescription>Independent tenant environments with Row Level Security boundaries</CardDescription>
          </div>
          <button
            onClick={() => onNavigate('super-admin-gyms')}
            className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1"
          >
            Full Directory <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1E273A] bg-[#0E1320] text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Gym Brand & Tenant</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">SaaS Tier</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Master Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2234]">
              {gyms.map(gym => (
                <tr key={gym.id} className="hover:bg-[#131929] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                        {gym.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-100">{gym.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{gym.slug}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-slate-300">
                    <p className="font-medium">{gym.city || 'City'}</p>
                    <p className="text-[10px] text-slate-500 truncate max-w-xs">{gym.address}</p>
                  </td>

                  <td className="py-3 px-4 text-slate-300">
                    <p>{gym.phone}</p>
                    <p className="text-[10px] text-slate-500">{gym.email}</p>
                  </td>

                  <td className="py-3 px-4">
                    <Badge variant="orange" size="sm">
                      {gym.subscription_tier} ({gym.subscription_cycle})
                    </Badge>
                  </td>

                  <td className="py-3 px-4">
                    <Badge variant={gym.status === 'active' ? 'success' : 'danger'} size="sm">
                      {gym.status}
                    </Badge>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <Button
                      size="sm"
                      variant={gym.status === 'active' ? 'danger' : 'outline'}
                      className="text-xs h-7 px-2.5"
                      leftIcon={gym.status === 'active' ? <PowerOff className="w-3 h-3" /> : <Power className="w-3 h-3" />}
                      onClick={() => handleToggleGymStatus(gym.id, gym.status)}
                    >
                      {gym.status === 'active' ? 'Suspend' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

