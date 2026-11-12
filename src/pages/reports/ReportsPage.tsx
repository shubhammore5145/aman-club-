import React, { useState } from 'react';
import { useGym } from '../../contexts/GymContext';
import { AppStorage } from '../../lib/storage';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { StatsCard } from '../../components/ui/StatsCard';
import { formatCurrency } from '../../lib/utils';
import {
  BarChart3,
  Download,
  IndianRupee,
  Users,
  TrendingUp,
  Receipt,
  QrCode,
  Calendar,
  FileSpreadsheet
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
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export const ReportsPage: React.FC = () => {
  const { currentGym } = useGym();
  const members = AppStorage.getMembers(currentGym.id);
  const payments = AppStorage.getPayments(currentGym.id);
  const attendance = AppStorage.getAttendance(currentGym.id);
  const expenses = AppStorage.getExpenses(currentGym.id);

  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.total_amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  // Monthly Revenue Trend Data
  const monthlyData = [
    { month: 'Jun', revenue: 78000, expenses: 42000, profit: 36000 },
    { month: 'Jul', revenue: 92000, expenses: 48000, profit: 44000 },
    { month: 'Aug', revenue: 114000, expenses: 51000, profit: 63000 },
    { month: 'Sep', revenue: 135000, expenses: 58000, profit: 77000 },
    { month: 'Oct', revenue: 148000, expenses: 62000, profit: 86000 },
    { month: 'Nov', revenue: totalRevenue + 85000, expenses: 74000, profit: totalRevenue + 85000 - 74000 },
  ];

  // Expense Distribution Data for Pie Chart
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({
    name: name.replace('_', ' ').toUpperCase(),
    value,
  }));

  const COLORS = ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  const handleExportFullCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Value\n' +
      `Gym Name,"${currentGym.name}"\n` +
      `Total Registered Members,${members.length}\n` +
      `Total Revenue Collected (YTD),${totalRevenue}\n` +
      `Total Operating Expenses,${totalExpenses}\n` +
      `Net Profit,${netProfit}\n` +
      `Total Attendance Sessions Logged,${attendance.length}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentGym.slug}_executive_financial_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-orange-400" />
            Executive Reports & Business Intelligence
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Downloadable audit reports, financial analytics, and operational metrics for {currentGym.name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={() => window.print()}
          >
            Print PDF Report
          </Button>
          <Button
            size="sm"
            variant="primary"
            leftIcon={<FileSpreadsheet className="w-3.5 h-3.5" />}
            onClick={handleExportFullCSV}
          >
            Export Comprehensive CSV
          </Button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Net Cash Profit"
          value={formatCurrency(netProfit, currentGym.currency_symbol)}
          change="+24.8% YoY"
          trend="up"
          icon={<IndianRupee className="w-4 h-4 text-emerald-400" />}
          description="Bottom-line health"
        />
        <StatsCard
          title="Operating Profit Margin"
          value="48.2%"
          change="Healthy benchmark"
          trend="up"
          icon={<TrendingUp className="w-4 h-4 text-sky-400" />}
          description="Efficiency ratio"
        />
        <StatsCard
          title="Member Retention"
          value="91.4%"
          change="+3.2% vs Q2"
          trend="up"
          icon={<Users className="w-4 h-4 text-orange-400" />}
          description="Active renewals"
        />
        <StatsCard
          title="Facility Utilization"
          value="82%"
          change="Optimal capacity"
          trend="neutral"
          icon={<QrCode className="w-4 h-4 text-purple-400" />}
          description="Floor traffic index"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Revenue vs. Operating Outflow Trajectory</CardTitle>
              <CardDescription>Comprehensive 6-month fiscal breakdown</CardDescription>
            </div>
          </CardHeader>
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E283D" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={v => `₹${v/1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#101522', borderColor: '#232D42', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: number) => [`₹${val.toLocaleString()}`, '']}
                />
                <Area type="monotone" dataKey="profit" name="Net Profit" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#profitGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Expenses by Category Pie */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Expense Distribution</CardTitle>
              <CardDescription>Breakdown by operating cost center</CardDescription>
            </div>
          </CardHeader>
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData.length > 0 ? pieData : [{ name: 'Rent', value: 115000 }, { name: 'Salaries', value: 145000 }, { name: 'Power', value: 28500 }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#101522', borderColor: '#232D42', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: number) => [`₹${val.toLocaleString()}`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
