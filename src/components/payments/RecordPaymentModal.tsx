import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { PaymentMethod, PaymentStatus } from '../../types/database';
import { useGym } from '../../contexts/GymContext';
import { AppStorage } from '../../lib/storage';
import { generateInvoiceNumber } from '../../lib/utils';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentGym } = useGym();
  const members = AppStorage.getMembers(currentGym.id);
  const plans = AppStorage.getMembershipPlans(currentGym.id);

  const [memberId, setMemberId] = useState(members[0]?.id || '');
  const [planId, setPlanId] = useState(plans[0]?.id || '');
  const [totalAmount, setTotalAmount] = useState<number>(plans[0]?.price || 2499);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [status, setStatus] = useState<PaymentStatus>('paid');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');

  const handlePlanChange = (selectedPlanId: string) => {
    setPlanId(selectedPlanId);
    const plan = plans.find(p => p.id === selectedPlanId);
    if (plan) {
      setTotalAmount(plan.price);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || totalAmount <= 0) return;

    const baseAmount = Number((totalAmount / 1.18).toFixed(2));
    const taxAmount = Number((totalAmount - baseAmount).toFixed(2));

    AppStorage.recordPayment({
      gym_id: currentGym.id,
      member_id: memberId,
      membership_plan_id: planId || undefined,
      invoice_number: generateInvoiceNumber(currentGym.name.includes('Aman') ? 'AMAN-INV' : 'GYM-INV'),
      amount: baseAmount,
      tax_amount: taxAmount,
      discount_amount: 0,
      total_amount: Number(totalAmount),
      payment_method: paymentMethod,
      payment_date: new Date().toISOString(),
      status: status,
      transaction_id: transactionId || `TXN-${Date.now().toString(36).toUpperCase()}`,
      notes: notes || 'Gym membership counter transaction',
    });

    onSuccess();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Member Payment"
      description="Issue tax invoice and update member subscription status"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Select Member"
          required
          value={memberId}
          onChange={e => setMemberId(e.target.value)}
        >
          {members.map(m => (
            <option key={m.id} value={m.id}>
              {m.full_name} ({m.member_code})
            </option>
          ))}
        </Select>

        <Select
          label="Membership Package"
          value={planId}
          onChange={e => handlePlanChange(e.target.value)}
        >
          <option value="">No Plan / Custom Fee</option>
          {plans.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} - ₹{p.price.toLocaleString()}
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Total Amount (INR)"
            type="number"
            required
            value={totalAmount}
            onChange={e => setTotalAmount(Number(e.target.value))}
          />
          <Select
            label="Payment Mode"
            value={paymentMethod}
            onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
          >
            <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
            <option value="cash">Cash Counter</option>
            <option value="card">Credit / Debit Card</option>
            <option value="bank_transfer">NEFT / IMPS / Bank</option>
            <option value="online">Online Gateway</option>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Payment Status"
            value={status}
            onChange={e => setStatus(e.target.value as PaymentStatus)}
          >
            <option value="paid">Paid (Confirmed)</option>
            <option value="partial">Partial Payment</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
          </Select>
          <Input
            label="Transaction ID / Ref"
            placeholder="e.g. UPI847291847192"
            value={transactionId}
            onChange={e => setTransactionId(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Notes / Memo</label>
          <input
            type="text"
            className="w-full bg-[#0D121D] border border-[#232D42] rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
            placeholder="e.g. Paid in full with GST invoice requested"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        <div className="pt-3 border-t border-[#1E273A] flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Confirm & Issue Receipt
          </Button>
        </div>
      </form>
    </Modal>
  );
};

