import React, { useState, useEffect } from 'react';
import { useGym } from '../../contexts/GymContext';
import { AppStorage, DATA_CHANGE_EVENT } from '../../lib/storage';
import { ExpenseRecord, PaymentMethod } from '../../types/database';
import { Button } from '../../components/ui/Button';
import { StatsCard } from '../../components/ui/StatsCard';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { formatCurrency, formatDate } from '../../lib/utils';
import {
  Receipt,
  Plus,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Building,
  Zap,
  Users,
  Wrench,
  Search,
  PieChart
} from 'lucide-react';

export const ExpensesPage: React.FC = () => {
  const { currentGym } = useGym();
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(AppStorage.getExpenses(currentGym.id));
  const [payments, setPayments] = useState(AppStorage.getPayments(currentGym.id));

  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    category: 'maintenance' as ExpenseRecord['category'],
    amount: 5000,
    payment_method: 'upi' as PaymentMethod,
    expense_date: new Date().toISOString().split('T')[0],
    vendor_name: '',
    description: '',
  });

  const loadData = () => {
    setExpenses(AppStorage.getExpenses(currentGym.id));
    setPayments(AppStorage.getPayments(currentGym.id));
  };

  useEffect(() => {
    loadData();
    window.addEventListener(DATA_CHANGE_EVENT, loadData);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, loadData);
  }, [currentGym.id]);

  // Financial calculations
  const totalRevenue = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.total_amount, 0);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || formData.amount <= 0) return;

    AppStorage.addExpense({
      gym_id: currentGym.id,
      title: formData.title,
      category: formData.category,
      amount: Number(formData.amount),
      payment_method: formData.payment_method,
      expense_date: formData.expense_date,
      vendor_name: formData.vendor_name,
      description: formData.description,
    });

    loadData();
    setModalOpen(false);
  };

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.vendor_name && e.vendor_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat = categoryFilter === 'all' ? true : e.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'rent': return <Building className="w-3.5 h-3.5 text-rose-400" />;
      case 'electricity': return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      case 'staff_salary': return <Users className="w-3.5 h-3.5 text-sky-400" />;
      case 'maintenance': return <Wrench className="w-3.5 h-3.5 text-orange-400" />;
      default: return <Receipt className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Receipt className="w-5 h-5 text-orange-400" />
            Business Expenses & Financial Net Profit
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track operational bills, payroll, premises lease, maintenance, and bottom-line profit.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setModalOpen(true)}
        >
          Add Expense
        </Button>
      </div>

      {/* P&L Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Total Inflow (Income)"
          value={formatCurrency(totalRevenue, currentGym.currency_symbol)}
          change="Membership fees"
          trend="up"
          icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}
          description="Gross collections"
        />
        <StatsCard
          title="Total Outflow (Expenses)"
          value={formatCurrency(totalExpenses, currentGym.currency_symbol)}
          change="Operating costs"
          trend="down"
          icon={<TrendingDown className="w-4 h-4 text-rose-400" />}
          description="Facility overheads & salaries"
        />
        <StatsCard
          title="Net Profit"
          value={formatCurrency(netProfit, currentGym.currency_symbol)}
          change={netProfit >= 0 ? 'Profitable' : 'Deficit'}
          trend={netProfit >= 0 ? 'up' : 'down'}
          icon={<DollarSign className={`w-4 h-4 ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`} />}
          description="Income minus all expenses"
        />
      </div>

      {/* Expense Ledger Table */}
      <div className="bg-[#101522] border border-[#232D42] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#1E283D] flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search expenses by title, vendor..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#0D121D] border border-[#232D42] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Category:</span>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="bg-[#0D121D] border border-[#232D42] rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="rent">Rent</option>
              <option value="electricity">Electricity</option>
              <option value="staff_salary">Staff Salary</option>
              <option value="maintenance">Maintenance</option>
              <option value="marketing">Marketing</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1E273A] bg-[#0E1320] text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Expense Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Vendor / Payee</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2234]">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    No expense records found. Click "Add Expense" to record a bill.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(e => (
                  <tr key={e.id} className="hover:bg-[#131929] transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-100">{e.title}</p>
                      {e.description && <p className="text-[10px] text-slate-500 truncate max-w-xs">{e.description}</p>}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-slate-300 capitalize">
                        {getCategoryIcon(e.category)}
                        <span>{e.category.replace('_', ' ')}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-300 font-medium">
                      {e.vendor_name || 'Standard Vendor'}
                    </td>

                    <td className="py-3 px-4 uppercase text-slate-400 font-mono text-[11px]">
                      {e.payment_method}
                    </td>

                    <td className="py-3 px-4 text-slate-400">
                      {formatDate(e.expense_date)}
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-rose-400">
                      -{formatCurrency(e.amount, currentGym.currency_symbol)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Operating Expense"
        description="Log operational outflows to maintain real-time P&L integrity"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Expense Title"
            required
            placeholder="e.g. Monthly Commercial Electric Tariff"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Expense Category"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value as any })}
            >
              <option value="rent">Rent / Premises Lease</option>
              <option value="electricity">Electricity / Power</option>
              <option value="staff_salary">Staff & Trainer Salaries</option>
              <option value="equipment">Equipment Purchase</option>
              <option value="maintenance">Maintenance & Repairs</option>
              <option value="marketing">Marketing & Ads</option>
              <option value="other">Other Operations</option>
            </Select>

            <Input
              label="Amount (INR)"
              type="number"
              required
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Payment Method"
              value={formData.payment_method}
              onChange={e => setFormData({ ...formData, payment_method: e.target.value as PaymentMethod })}
            >
              <option value="bank_transfer">Bank Transfer / NEFT</option>
              <option value="upi">UPI</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
            </Select>

            <Input
              label="Expense Date"
              type="date"
              value={formData.expense_date}
              onChange={e => setFormData({ ...formData, expense_date: e.target.value })}
            />
          </div>

          <Input
            label="Vendor / Payee Name"
            placeholder="e.g. Power Utility Board, Landlord"
            value={formData.vendor_name}
            onChange={e => setFormData({ ...formData, vendor_name: e.target.value })}
          />

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Description (Optional)</label>
            <textarea
              rows={2}
              className="w-full bg-[#0D121D] border border-[#232D42] rounded-lg p-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="pt-3 border-t border-[#1E273A] flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Record Expense
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
