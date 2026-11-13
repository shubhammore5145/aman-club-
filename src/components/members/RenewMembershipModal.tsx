import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { Member, MembershipPlan, PaymentMethod } from '../../types/database';
import { useGym } from '../../contexts/GymContext';
import { AppStorage } from '../../lib/storage';
import { formatCurrency, formatDate, getExpiryStatus } from '../../lib/utils';
import {
  RotateCcw,
  CreditCard,
  Calendar,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Share2,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RenewMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  onSuccess: () => void;
}

export const RenewMembershipModal: React.FC<RenewMembershipModalProps> = ({
  isOpen,
  onClose,
  member,
  onSuccess,
}) => {
  const { currentGym } = useGym();
  const plans = AppStorage.getMembershipPlans(currentGym.id).filter(p => p.is_active);

  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || '');
  const [paymentAmount, setPaymentAmount] = useState<number>(plans[0]?.price || 2499);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [renewedPlanName, setRenewedPlanName] = useState('');

  useEffect(() => {
    if (member && plans.length > 0) {
      // Pick member's current plan or default to first plan
      const matchingPlan = plans.find(p => p.id === member.membership_plan_id) || plans[0];
      setSelectedPlanId(matchingPlan.id);
      setPaymentAmount(matchingPlan.price);
      setTransactionId('');
      setNotes('');
      setIsSuccess(false);
      setSuccessMessage('');
    }
  }, [member, isOpen]);

  if (!member) return null;

  const currentPlan = member.membership_plan;
  const expiryStatus = getExpiryStatus(member.membership_end_date);
  const selectedNewPlan = plans.find(p => p.id === selectedPlanId) || plans[0];

  // Calculate new start & end dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentEnd = new Date(member.membership_end_date);
  currentEnd.setHours(0, 0, 0, 0);

  const newStartDate = (currentEnd > today && member.status === 'active')
    ? currentEnd
    : today;

  const newEndDate = new Date(newStartDate);
  newEndDate.setDate(newStartDate.getDate() + (selectedNewPlan?.duration_days || 30));

  const handleSelectPlan = (plan: MembershipPlan) => {
    setSelectedPlanId(plan.id);
    setPaymentAmount(plan.price);
  };

  const handleRenewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId || paymentAmount <= 0) return;

    const res = AppStorage.renewMembership({
      memberId: member.id,
      newPlanId: selectedPlanId,
      paymentAmount: Number(paymentAmount),
      paymentMethod,
      transactionId,
      notes,
    });

    if (res.success) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f97316', '#22c55e', '#fb923c'],
      });
      setRenewedPlanName(selectedNewPlan.name);
      setSuccessMessage(res.message);
      setIsSuccess(true);
      onSuccess();
    } else {
      alert(res.message);
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Hello ${member.full_name}, your membership at ${currentGym.name} has been renewed successfully!\nNew Plan: ${selectedNewPlan?.name}\nNew Validity: Until ${formatDate(newEndDate.toISOString())}\nAmount Paid: ₹${paymentAmount.toLocaleString()}\nThank you for choosing ${currentGym.name}!`
    );
    window.open(`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Renew Gym Membership"
      description={`Update subscription and extend validity for ${member.full_name}`}
      maxWidth="lg"
    >
      {isSuccess ? (
        <div className="py-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-glow-subtle">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">Membership Renewed Successfully!</h3>
            <p className="text-xs text-orange-400 font-semibold mt-1">
              New Plan Activated: {renewedPlanName}
            </p>
            <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto">
              {successMessage}
            </p>
          </div>

          <div className="p-3 bg-[#0D121E] border border-[#232F48] rounded-xl max-w-sm mx-auto text-xs space-y-1.5">
            <div className="flex justify-between text-slate-400">
              <span>Member:</span>
              <span className="font-semibold text-slate-200">{member.full_name} ({member.member_code})</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Activated Plan:</span>
              <span className="font-bold text-orange-400">{renewedPlanName}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>New Expiry Date:</span>
              <span className="font-bold text-emerald-400">{formatDate(newEndDate.toISOString())}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Amount Paid:</span>
              <span className="font-bold text-white">{formatCurrency(paymentAmount, currentGym.currency_symbol)}</span>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Share2 className="w-3.5 h-3.5 text-emerald-400" />}
              onClick={handleWhatsAppShare}
            >
              Share WhatsApp Confirmation
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onClose}
            >
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleRenewSubmit} className="space-y-4">
          {/* Member Card with Current Expiry */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0D121E] border border-[#232F48]">
            <div className="flex items-center gap-3">
              <img
                src={member.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                alt={member.full_name}
                className="w-11 h-11 rounded-full object-cover border-2 border-orange-500/40 shrink-0"
              />
              <div>
                <p className="font-bold text-white text-sm">{member.full_name}</p>
                <p className="text-xs text-slate-400">
                  ID: <span className="font-mono text-orange-400 font-semibold">{member.member_code}</span> • {member.phone}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Previous Plan: <span className="text-slate-200 font-semibold">{currentPlan?.name || 'Standard Membership'}</span>
                </p>
              </div>
            </div>

            <div className="text-right">
              <Badge variant={expiryStatus.variant} size="sm" className="font-semibold">
                {expiryStatus.label}
              </Badge>
              <p className="text-[10px] text-slate-400 mt-1">
                Last Expiry: {formatDate(member.membership_end_date)}
              </p>
            </div>
          </div>

          {/* New Plan Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                Select New Membership Plan:
              </label>
              <span className="text-[11px] text-orange-400 font-semibold">
                Selected: {selectedNewPlan?.name}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {plans.map(p => {
                const isSelected = p.id === selectedPlanId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPlan(p)}
                    className={`p-3 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? 'bg-orange-500/20 border-orange-500 text-white shadow-glow-subtle ring-1 ring-orange-500'
                        : 'bg-[#0D121D] border-[#232D42] text-slate-300 hover:border-slate-500 hover:bg-[#131929]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-xs truncate">{p.name}</p>
                      {isSelected ? (
                        <span className="w-4 h-4 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-orange-400 font-black mt-1">
                      {formatCurrency(p.price, currentGym.currency_symbol)}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {p.duration_months} Month{p.duration_months > 1 ? 's' : ''} • {p.duration_days} Days validity
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* New Plan Validity Breakdown Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#151D2E] to-[#0E1424] border-2 border-orange-500/50 shadow-md space-y-2.5 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="flex items-center gap-1.5 text-orange-400 font-bold">
                <Sparkles className="w-4 h-4 text-orange-400" /> New Plan Activated:
              </span>
              <span className="text-white font-extrabold text-sm px-2.5 py-0.5 rounded-md bg-orange-500/20 border border-orange-500/40">
                {selectedNewPlan?.name}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
              <div>
                <p className="text-slate-400">Plan Duration:</p>
                <p className="font-bold text-slate-200 mt-0.5">
                  {selectedNewPlan?.duration_months} Mo ({selectedNewPlan?.duration_days} Days)
                </p>
              </div>
              <div>
                <p className="text-slate-400">Renewal Starts:</p>
                <p className="font-semibold text-slate-200 mt-0.5">{formatDate(newStartDate.toISOString())}</p>
              </div>
              <div>
                <p className="text-slate-400">New Expiry Date:</p>
                <p className="font-bold text-emerald-400 text-xs mt-0.5">
                  {formatDate(newEndDate.toISOString())}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <Input
              label="Renewal Fee (INR)"
              type="number"
              required
              value={paymentAmount}
              onChange={e => setPaymentAmount(Number(e.target.value))}
            />

            <Select
              label="Payment Mode"
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
            >
              <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
              <option value="cash">Cash Counter</option>
              <option value="card">Credit / Debit Card</option>
              <option value="bank_transfer">Bank Transfer / IMPS</option>
              <option value="online">Online Gateway</option>
            </Select>
          </div>

          <Input
            label="Transaction ID / Notes (Optional)"
            placeholder="e.g. UPI Ref # or cash memo notes"
            value={transactionId}
            onChange={e => setTransactionId(e.target.value)}
          />

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-[#1E273A] flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Confirm & Renew Plan
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
