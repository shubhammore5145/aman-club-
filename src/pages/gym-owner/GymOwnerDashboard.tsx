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
  Wrench,
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
  const [equipment, setEquipment] = useState(AppStorage.getEquipment(currentGym.id));

  const loadData = () => {
    setMembers(AppStorage.getMembers(currentGym.id));
    setPayments(AppStorage.getPayments(currentGym.id));
    setAttendance(AppStorage.getAttendance(currentGym.id));
    setTrainers(AppStorage.getTrainers(currentGym.id));
    setExpenses(AppStorage.getExpenses(currentGym.id));
    setEquipment(AppStorage.getEquipment(currentGym.id));
  };

  useEffect(() => {
    loadData();
    window.addEventListener(DATA_CHANGE_EVENT, loadData);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, loadData);
  }, [currentGym.id]);

  // Statistics calculations from actual records
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

  // Dynamically calculate 6-month Revenue trend from actual payments and expenses
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const revenueChartData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthIndex = d.getMonth();
    const year = d.getFullYear();
    const monthLabel = months[monthIndex];

    const rev = payments
      .filter(p => {
        const pd = new Date(p.payment_date);
        return p.status === 'paid' && pd.getMonth() === monthIndex && pd.getFullYear() === year;
      })
      .reduce((sum, p) => sum + p.total_amount, 0);

    const exp = expenses
      .filter(e => {
        const ed = new Date(e.expense_date);
        return ed.getMonth() === monthIndex && ed.getFullYear() === year;
      })
      .reduce((sum, e) => sum + e.amount, 0);

    revenueChartData.push({ month: monthLabel, revenue: rev, expenses: exp });
  }

  // Attendance by Day of Week calculated from actual attendance records
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const attendanceTrendData = dayLabels.map((day, idx) => {
    const targetJsDay = idx === 6 ? 0 : idx + 1;
    const count = attendance.filter(a => {
      const ad = new Date(a.date);
      return ad.getDay() === targetJsDay;
    }).length;
    return { day, count };
  });

  const handleDownloadReceipt = (payment: any) => {
    const m = payment.member || members.find(mem => mem.id === payment.member_id) || members[0];
    if (m) {
      const doc = generatePaymentReceiptPDF(payment, currentGym, m);
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
              Live Dashboard
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
          change={totalMembersCount > 0 ? `${activeMembersCount} Active` : 'No members yet'}
          trend={totalMembersCount > 0 ? 'up' : 'neutral'}
          icon={<Users className="w-4 h-4" />}
          description="Registered gym members"
        />
        <StatsCard
          title="Active Members"
          value={activeMembersCount}
          change={totalMembersCount > 0 ? `${Math.round((activeMembersCount / (totalMembersCount || 1)) * 100)}% active` : '0%'}
          trend={activeMembersCount > 0 ? 'up' : 'neutral'}
          icon={<UserCheck className="w-4 h-4 text-emerald-400" />}
          description="Members in good standing"
        />
        <StatsCard
          title="Today Attendance"
          value={todayAttendanceCount}
          change={todayAttendanceCount > 0 ? `${todayAttendanceCount} checked-in` : 'No check-ins today'}
          trend={todayAttendanceCount > 0 ? 'up' : 'neutral'}
          icon={<QrCode className="w-4 h-4 text-orange-400" />}
          description="Members on floor today"
        />
        <StatsCard
          title="Monthly Revenue"
          value={formatCurrency(totalMonthlyRevenue, currentGym.currency_symbol)}
          change={payments.filter(p => p.status === 'paid').length > 0 ? `${payments.filter(p => p.status === 'paid').length} Paid Invoices` : '₹0 collected'}
          trend={totalMonthlyRevenue > 0 ? 'up' : 'neutral'}
          icon={<IndianRupee className="w-4 h-4 text-emerald-400" />}
          description="Total received revenue"
        />
        <StatsCard
          title="Expired Members"
          value={expiredMembersCount}
          change={expiredMembersCount > 0 ? `${expiredMembersCount} to renew` : 'All memberships valid'}
          trend={expiredMembersCount > 0 ? 'down' : 'neutral'}
          icon={<AlertCircle className="w-4 h-4 text-rose-400" />}
          description="Renewal follow-ups"
        />
        <StatsCard
          title="Pending Payments"
          value={formatCurrency(pendingAmount, currentGym.currency_symbol)}
          change={pendingPaymentsList.length > 0 ? `${pendingPaymentsList.length} Invoices pending` : 'Zero dues'}
          trend={pendingAmount > 0 ? 'down' : 'neutral'}
          icon={<Receipt className="w-4 h-4 text-amber-400" />}
          description="Outstanding balances"
        />
        <StatsCard
          title="Active Trainers"
          value={trainers.length}
          change={trainers.length > 0 ? `${trainers.length} On staff` : 'No trainers added'}
          trend="neutral"
          icon={<TrendingUp className="w-4 h-4 text-sky-400" />}
          description="Fitness coaching staff"
        />
        <StatsCard
          title="Equipment Assets"
          value={equipment.length}
          change={equipment.length > 0 ? `${equipment.length} logged` : 'No assets logged'}
          trend="neutral"
          icon={<Wrench className="w-4 h-4 text-purple-400" />}
          description="Gym machinery & racks"
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
            <Badge variant="orange" size="sm">Past 6 Months</Badge>
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
              <CardDescription>Transaction records with downloadable PDF receipts</CardDescription>
            </div>
            <button
              onClick={() => onNavigate('payments')}
              className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </CardHeader>

          {payments.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <Receipt className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p>No payments recorded yet.</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3 text-xs"
                onClick={onOpenRecordPayment}
              >
                Record First Payment
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.slice(0, 5).map(p => (
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
          )}
        </Card>

        {/* Upcoming Expiries & WhatsApp Follow-up */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Upcoming Membership Expiries</CardTitle>
              <CardDescription>Members due for renewal within the next 15 days</CardDescription>
            </div>
            <Badge variant="warning" size="sm">{upcomingExpiries.length} Due</Badge>
          </CardHeader>

          {upcomingExpiries.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p>No memberships due for expiry within the next 15 days.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingExpiries.slice(0, 5).map(m => {
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
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
