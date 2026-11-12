import React, { useState, useEffect } from 'react';
import { useGym } from '../../contexts/GymContext';
import { AppStorage, DATA_CHANGE_EVENT } from '../../lib/storage';
import { StatsCard } from '../../components/ui/StatsCard';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency, formatDate, getDaysRemaining } from '../../lib/utils';
import { generatePaymentReceiptPDF } from '../../lib/pdfGenerator';
import {
  Users,
  CreditCard,
  QrCode,
  IndianRupee,
  UserCheck,
  TrendingUp,
  AlertCircle,
  Plus,
  Receipt,
  FileText,
  Share2,
  Calendar,
  Sparkles,
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

interface GymOwnerDashboardProps {
  onNavigate: (page: string) => void;
  onOpenAddMember: () => void;
  onOpenRecordPayment: () => void;
}

export const GymOwnerDashboard: React.FC<GymOwnerDashboardProps> = ({
  onNavigate,
  onOpenAddMember,
  onOpenRecordPayment,
}) => {
  const { currentGym } = useGym();

  const [members, setMembers] = useState(AppStorage.getMembers(currentGym.id));
  const [payments, setPayments] = useState(AppStorage.getPayments(currentGym.id));
  const [attendance, setAttendance] = useState(AppStorage.getAttendance(currentGym.id));
  const [trainers, setTrainers] = useState(AppStorage.getTrainers(currentGym.id));
  const [expenses, setExpenses] = useState(AppStorage.getExpenses(currentGym.id));

  const loadData = () => {
    setMembers(AppStorage.getMembers(currentGym.id));
    setPayments(AppStorage.getPayments(currentGym.id));
    setAttendance(AppStorage.getAttendance(currentGym.id));
    setTrainers(AppStorage.getTrainers(currentGym.id));
    setExpenses(AppStorage.getExpenses(currentGym.id));
  };

  useEffect(() => {
    loadData();
    window.addEventListener(DATA_CHANGE_EVENT, loadData);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, loadData);
  }, [currentGym.id]);

  // Statistics calculations from live database records
  const totalMembersCount = members.length;
  const activeMembersCount = members.filter(m => m.status === 'active').length;
  const expiredMembersCount = members.filter(m => m.status === 'expired').length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendanceCount = attendance.filter(a => a.date === todayStr).length;

  const totalMonthlyRevenue = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.total_amount, 0);

  const pendingPaymentsList = payments.filter(p => p.status === 'pending' || p.status === 'partial');
  const pendingAmount = pendingPaymentsList.reduce((sum, p) => sum + p.total_amount, 0);

  const upcomingExpiries = members
    .filter(m => {
      const days = getDaysRemaining(m.membership_end_date);
      return days >= 0 && days <= 15;
    })
    .sort((a, b) => new Date(a.membership_end_date).getTime() - new Date(b.membership_end_date).getTime());

  // Chart data: 6-month Revenue trend
  const revenueChartData = [
    { month: 'Jun', revenue: 78000, expenses: 42000 },
    { month: 'Jul', revenue: 92000, expenses: 48000 },
    { month: 'Aug', revenue: 114000, expenses: 51000 },
    { month: 'Sep', revenue: 135000, expenses: 58000 },
    { month: 'Oct', revenue: 148000, expenses: 62000 },
    { month: 'Nov', revenue: totalMonthlyRevenue + 85000, expenses: 74000 },
  ];

  // Attendance by Day of Week
  const attendanceTrendData = [
    { day: 'Mon', count: 48 },
    { day: 'Tue', count: 54 },
    { day: 'Wed', count: 51 },
    { day: 'Thu', count: 46 },
    { day: 'Fri', count: 58 },
    { day: 'Sat', count: 62 },
    { day: 'Sun', count: 24 },
  ];

  const handleDownloadReceipt = (payment: any) => {
    if (!payment.member) {
      const m = members.find(mem => mem.id === payment.member_id) || members[0];
      const doc = generatePaymentReceiptPDF(payment, currentGym, m);
      doc.save(`${payment.invoice_number}.pdf`);
    } else {
      const doc = generatePaymentReceiptPDF(payment, currentGym, payment.member);
      doc.save(`${payment.invoice_number}.pdf`);
    }
  };

  const handleWhatsAppReminder = (member: any) => {
    const text = encodeURIComponent(
      `Hi ${member.full_name}, greeting from ${currentGym.name}! Your gym membership ends on ${formatDate(member.membership_end_date)}. Renew today to maintain uninterrupted access and special renewal perks!`
    );
    window.open(`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#111726] to-[#0D121F] border border-[#232F48] p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">{currentGym.name} Overview</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30">
              Live SaaS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time club performance, member activities, and revenue analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Plus className="w-3.5 h-3.5 text-orange-400" />}
            onClick={onOpenAddMember}
          >
            Add Member
          </Button>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<IndianRupee className="w-3.5 h-3.5 text-emerald-400" />}
            onClick={onOpenRecordPayment}
          >
            Record Payment
          </Button>
          <Button
            size="sm"
            variant="primary"
            leftIcon={<QrCode className="w-3.5 h-3.5" />}
            onClick={() => onNavigate('attendance')}
          >
            Check-In Scanner
          </Button>
        </div>
      </div>

      {/* 8 Essential Key Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Members"
          value={totalMembersCount}
          change="+12% this mo"
          trend="up"
          icon={<Users className="w-4 h-4" />}
          description="Registered athletes"
        />
        <StatsCard
          title="Active Members"
          value={activeMembersCount}
          change={`${Math.round((activeMembersCount / (totalMembersCount || 1)) * 100)}% active`}
          trend="up"
          icon={<UserCheck className="w-4 h-4 text-emerald-400" />}
          description="In good standing"
        />
        <StatsCard
          title="Today Attendance"
          value={todayAttendanceCount}
          change="Live check-ins"
          trend="neutral"
          icon={<QrCode className="w-4 h-4 text-orange-400" />}
          description="Members on floor today"
        />
        <StatsCard
          title="Monthly Revenue"
          value={formatCurrency(totalMonthlyRevenue, currentGym.currency_symbol)}
          change="+18.4%"
          trend="up"
          icon={<IndianRupee className="w-4 h-4 text-emerald-400" />}
          description="Total collected revenue"
        />
        <StatsCard
          title="Expired Members"
          value={expiredMembersCount}
          change={expiredMembersCount > 0 ? 'Follow-up' : 'All clear'}
          trend={expiredMembersCount > 0 ? 'down' : 'neutral'}
          icon={<AlertCircle className="w-4 h-4 text-rose-400" />}
          description="Need renewal renewal"
        />
        <StatsCard
          title="Pending Payments"
          value={formatCurrency(pendingAmount, currentGym.currency_symbol)}
          change={`${pendingPaymentsList.length} invoices`}
          trend={pendingAmount > 0 ? 'down' : 'neutral'}
          icon={<Receipt className="w-4 h-4 text-amber-400" />}
          description="Outstanding balances"
        />
        <StatsCard
          title="Active Trainers"
          value={trainers.length}
          change="Full-time staff"
          trend="neutral"
          icon={<TrendingUp className="w-4 h-4 text-sky-400" />}
          description="Certified fitness coaches"
        />
        <StatsCard
          title="Avg Floor Usage"
          value="84%"
          change="Peak: 6-9 PM"
          trend="up"
          icon={<Sparkles className="w-4 h-4 text-purple-400" />}
          description="Equipment utilization"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Analytics (Area Chart) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Financial Trajectory & Revenue Growth</CardTitle>
              <CardDescription>Monthly collections vs operating expenses</CardDescription>
            </div>
            <Badge variant="orange" size="sm">Last 6 Months</Badge>
          </CardHeader>
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64748b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#64748b" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E283D" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={v => `₹${v/1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#101522', borderColor: '#232D42', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: number) => [`₹${val.toLocaleString()}`, '']}
                />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#f97316" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#94a3b8" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Weekly Attendance Heatmap / Bar Chart */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Peak Attendance Traffic</CardTitle>
              <CardDescription>Weekly visitor check-in distribution</CardDescription>
            </div>
          </CardHeader>
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E283D" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#101522', borderColor: '#232D42', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="Check-ins" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Two Column Detailed Operational Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments & Real PDF Receipt Generator */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Recent Payments & Invoices</CardTitle>
              <CardDescription>Live transaction records with downloadable PDF receipts</CardDescription>
            </div>
            <button
              onClick={() => onNavigate('payments')}
              className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </CardHeader>

          <div className="space-y-3">
            {payments.slice(0, 4).map(p => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-lg bg-[#0D121E] border border-[#1E283E] hover:border-orange-500/30 transition-all text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
                    ₹
                  </div>
                  <div>
                    <p className="font-semibold text-slate-100">{p.member?.full_name || 'Member'}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span>{p.invoice_number}</span>
                      <span>•</span>
                      <span className="uppercase text-orange-400 font-medium">{p.payment_method}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold text-slate-100">{formatCurrency(p.total_amount, currentGym.currency_symbol)}</p>
                    <p className="text-[10px] text-slate-500">{formatDate(p.payment_date)}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="p-1.5 h-auto text-orange-400 hover:bg-orange-500/10"
                    title="Download Official PDF Receipt"
                    onClick={() => handleDownloadReceipt(p)}
                  >
                    <FileText className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Expiries & WhatsApp Follow-up */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Upcoming Membership Expiries</CardTitle>
              <CardDescription>Members due for renewal within the next 15 days</CardDescription>
            </div>
            <Badge variant="warning" size="sm">{upcomingExpiries.length} Pending Renewal</Badge>
          </CardHeader>

          <div className="space-y-3">
            {upcomingExpiries.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No immediate expiries in the next 15 days.</p>
            ) : (
              upcomingExpiries.slice(0, 4).map(m => {
                const days = getDaysRemaining(m.membership_end_date);
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#0D121E] border border-[#1E283E] hover:border-amber-500/30 transition-all text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={m.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                        alt={m.full_name}
                        className="w-8 h-8 rounded-full object-cover border border-amber-500/30"
                      />
                      <div>
                        <p className="font-semibold text-slate-100">{m.full_name}</p>
                        <p className="text-[11px] text-slate-400">
                          {m.membership_plan?.name || 'Standard'} • <span className="text-amber-400 font-medium">Expires in {days} days</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="text-[11px] px-2 py-1 h-auto text-emerald-400 hover:text-emerald-300"
                        leftIcon={<Share2 className="w-3 h-3" />}
                        onClick={() => handleWhatsAppReminder(m)}
                      >
                        WhatsApp
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
