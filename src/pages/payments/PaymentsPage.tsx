import React, { useState, useEffect } from 'react';
import { useGym } from '../../contexts/GymContext';
import { AppStorage, DATA_CHANGE_EVENT } from '../../lib/storage';
import { PaymentRecord, PaymentMethod } from '../../types/database';
import { Button } from '../../components/ui/Button';
import { StatsCard } from '../../components/ui/StatsCard';
import { Badge } from '../../components/ui/Badge';
import { RecordPaymentModal } from '../../components/payments/RecordPaymentModal';
import { formatCurrency, formatDate } from '../../lib/utils';
import { generatePaymentReceiptPDF } from '../../lib/pdfGenerator';
import {
  IndianRupee,
  Plus,
  Search,
  Download,
  Share2,
  FileText,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight
} from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const { currentGym } = useGym();
  const [payments, setPayments] = useState<PaymentRecord[]>(AppStorage.getPayments(currentGym.id));
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [recordModalOpen, setRecordModalOpen] = useState(false);

  const loadData = () => {
    setPayments(AppStorage.getPayments(currentGym.id));
  };

  useEffect(() => {
    loadData();
    window.addEventListener(DATA_CHANGE_EVENT, loadData);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, loadData);
  }, [currentGym.id]);

  const totalCollected = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.total_amount, 0);

  const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'partial');
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.total_amount, 0);

  const upiCollected = payments
    .filter(p => p.status === 'paid' && p.payment_method === 'upi')
    .reduce((sum, p) => sum + p.total_amount, 0);

  const filteredPayments = payments.filter(p => {
    const memberName = p.member?.full_name || '';
    const invoice = p.invoice_number || '';
    const matchesSearch =
      memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.transaction_id && p.transaction_id.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesMethod = methodFilter === 'all' ? true : p.payment_method === methodFilter;

    return matchesSearch && matchesMethod;
  });

  const handleDownloadPDF = (payment: PaymentRecord) => {
    const member = payment.member || AppStorage.getMembers(currentGym.id)[0];
    const doc = generatePaymentReceiptPDF(payment, currentGym, member);
    doc.save(`${payment.invoice_number}.pdf`);
  };

  const handleWhatsAppReceipt = (payment: PaymentRecord) => {
    const member = payment.member;
    if (!member) return;
    const text = encodeURIComponent(
      `Hello ${member.full_name}, thank you for your payment at ${currentGym.name}!\nInvoice: ${payment.invoice_number}\nAmount: ₹${payment.total_amount.toLocaleString()}\nMethod: ${payment.payment_method.toUpperCase()}\nStatus: CONFIRMED (PAID)\nValid Until: ${formatDate(member.membership_end_date)}`
    );
    window.open(`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  const handleExportCSV = () => {
    const headers = ['Invoice Number', 'Member Name', 'Member Code', 'Plan', 'Total Amount', 'Payment Method', 'Status', 'Date', 'Transaction ID'];
    const rows = filteredPayments.map(p => [
      p.invoice_number,
      `"${p.member?.full_name || 'Member'}"`,
      p.member?.member_code || '',
      `"${p.membership_plan?.name || ''}"`,
      p.total_amount,
      p.payment_method,
      p.status,
      p.payment_date,
      p.transaction_id || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentGym.slug}_payments_${new Date().toISOString().split('T')[0]}.csv`);
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
            <IndianRupee className="w-5 h-5 text-emerald-400" />
            Payment Management & Invoicing
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track revenue, print verified GST tax invoices, and reconcile online/UPI payments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExportCSV}
          >
            Export Ledger
          </Button>
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setRecordModalOpen(true)}
          >
            Record Payment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Collected"
          value={formatCurrency(totalCollected, currentGym.currency_symbol)}
          change="+18.4% MoM"
          trend="up"
          icon={<IndianRupee className="w-4 h-4 text-emerald-400" />}
          description="Verified incoming revenue"
        />
        <StatsCard
          title="UPI & Digital"
          value={formatCurrency(upiCollected, currentGym.currency_symbol)}
          change="Fast QR settlement"
          trend="up"
          icon={<CreditCard className="w-4 h-4 text-orange-400" />}
          description="Direct bank collections"
        />
        <StatsCard
          title="Pending Dues"
          value={formatCurrency(totalPending, currentGym.currency_symbol)}
          change={`${pendingPayments.length} open`}
          trend={totalPending > 0 ? 'down' : 'neutral'}
          icon={<Clock className="w-4 h-4 text-amber-400" />}
          description="Awaiting settlement"
        />
        <StatsCard
          title="Invoices Issued"
          value={payments.length}
          change="100% Tax Compliant"
          trend="neutral"
          icon={<FileText className="w-4 h-4 text-sky-400" />}
          description="GST ready receipts"
        />
      </div>

      {/* Filter and Invoices Table */}
      <div className="bg-[#101522] border border-[#232D42] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#1E283D] flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search invoice #, member name, transaction ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#0D121D] border border-[#232D42] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Method:</span>
            <select
              value={methodFilter}
              onChange={e => setMethodFilter(e.target.value)}
              className="bg-[#0D121D] border border-[#232D42] rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">All Modes</option>
              <option value="upi">UPI</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="online">Online</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1E273A] bg-[#0E1320] text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Method & Ref</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2234]">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    No payment records found. Click "Record Payment" to log a new invoice.
                  </td>
                </tr>
              ) : (
                filteredPayments.map(p => (
                  <tr key={p.id} className="hover:bg-[#131929] transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                      {p.invoice_number}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-100">{p.member?.full_name || 'Member'}</p>
                      <p className="text-[10px] text-slate-500">{p.member?.phone || ''}</p>
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      {p.membership_plan?.name || 'General Membership'}
                    </td>

                    <td className="py-3 px-4">
                      <span className="uppercase text-orange-400 font-semibold">{p.payment_method}</span>
                      <p className="text-[10px] text-slate-500 font-mono truncate max-w-[130px]">
                        {p.transaction_id || 'COUNTER'}
                      </p>
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-100">
                      {formatCurrency(p.total_amount, currentGym.currency_symbol)}
                    </td>

                    <td className="py-3 px-4 text-slate-400">
                      {formatDate(p.payment_date)}
                    </td>

                    <td className="py-3 px-4">
                      <Badge
                        variant={p.status === 'paid' ? 'success' : p.status === 'pending' ? 'warning' : 'danger'}
                        size="sm"
                      >
                        {p.status}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs px-2.5 text-orange-400 border-orange-500/30 hover:bg-orange-500/10"
                          leftIcon={<FileText className="w-3 h-3" />}
                          onClick={() => handleDownloadPDF(p)}
                        >
                          PDF
                        </Button>
                        <button
                          title="Share via WhatsApp"
                          onClick={() => handleWhatsAppReceipt(p)}
                          className="p-1.5 rounded text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RecordPaymentModal
        isOpen={recordModalOpen}
        onClose={() => setRecordModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
};
