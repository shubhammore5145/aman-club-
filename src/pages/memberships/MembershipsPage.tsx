import React, { useState, useEffect } from 'react';
import { useGym } from '../../contexts/GymContext';
import { AppStorage, DATA_CHANGE_EVENT } from '../../lib/storage';
import { MembershipPlan } from '../../types/database';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { formatCurrency } from '../../lib/utils';
import { CreditCard, Plus, Check, Edit2, Trash2, Shield, Sparkles } from 'lucide-react';

export const MembershipsPage: React.FC = () => {
  const { currentGym } = useGym();
  const [plans, setPlans] = useState<MembershipPlan[]>(AppStorage.getMembershipPlans(currentGym.id));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    duration_months: 1,
    duration_days: 30,
    price: 2499,
    description: '',
    benefitsInput: 'Gym Floor Access\nLocker Room\nShowers & Steam',
    is_active: true,
  });

  const loadData = () => {
    setPlans(AppStorage.getMembershipPlans(currentGym.id));
  };

  useEffect(() => {
    loadData();
    window.addEventListener(DATA_CHANGE_EVENT, loadData);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, loadData);
  }, [currentGym.id]);

  const handleOpenModal = (plan?: MembershipPlan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        duration_months: plan.duration_months,
        duration_days: plan.duration_days,
        price: plan.price,
        description: plan.description || '',
        benefitsInput: plan.benefits.join('\n'),
        is_active: plan.is_active,
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: '',
        duration_months: 1,
        duration_days: 30,
        price: 2499,
        description: '',
        benefitsInput: 'Gym Floor Access\nCardio Zone\nLocker Room\nMobile App Access',
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const benefits = formData.benefitsInput
      .split('\n')
      .map(b => b.trim())
      .filter(Boolean);

    if (editingPlan) {
      AppStorage.updateMembershipPlan({
        ...editingPlan,
        name: formData.name,
        duration_months: Number(formData.duration_months),
        duration_days: Number(formData.duration_days),
        price: Number(formData.price),
        description: formData.description,
        benefits,
        is_active: formData.is_active,
      });
    } else {
      AppStorage.addMembershipPlan({
        gym_id: currentGym.id,
        name: formData.name,
        duration_months: Number(formData.duration_months),
        duration_days: Number(formData.duration_days),
        price: Number(formData.price),
        description: formData.description,
        benefits,
        is_active: formData.is_active,
      });
    }

    loadData();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this membership plan?')) {
      AppStorage.deleteMembershipPlan(id);
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-orange-400" />
            Membership Plans & Pricing ({plans.length})
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure subscription packages, terms, pricing, and member perks for {currentGym.name}.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => handleOpenModal()}
        >
          Create New Plan
        </Button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {plans.map(p => (
          <Card
            key={p.id}
            hoverEffect
            className="flex flex-col justify-between relative overflow-hidden group"
          >
            {/* Top Badge */}
            <div className="flex items-center justify-between mb-3">
              <Badge variant={p.is_active ? 'success' : 'neutral'} size="sm">
                {p.is_active ? 'Active' : 'Inactive'}
              </Badge>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleOpenModal(p)}
                  className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-[#1A2234]"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Plan Info */}
            <div>
              <h3 className="text-base font-bold text-slate-100">{p.name}</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 min-h-[32px]">
                {p.description || 'Full club access and training benefits.'}
              </p>

              <div className="my-4 py-3 border-y border-[#1E283E]">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-orange-400">
                    {formatCurrency(p.price, currentGym.currency_symbol)}
                  </span>
                  <span className="text-xs text-slate-400">
                    / {p.duration_months === 1 ? 'month' : `${p.duration_months} months`}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Duration: {p.duration_days} days access
                </p>
              </div>

              {/* Benefits Checklist */}
              <div className="space-y-2 mb-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Included Perks:</p>
                {p.benefits.map((b, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{b}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Action */}
            <div className="pt-3 border-t border-[#1E273A] mt-auto">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => handleOpenModal(p)}
              >
                Modify Package
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Plan Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPlan ? 'Edit Membership Plan' : 'Create Membership Plan'}
        description="Configure pricing, billing intervals, and member entitlements"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Plan Title"
            required
            placeholder="e.g. Quarterly Muscle Transformation"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Price (INR)"
              type="number"
              required
              value={formData.price}
              onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
            />
            <Input
              label="Duration (Months)"
              type="number"
              required
              value={formData.duration_months}
              onChange={e => {
                const months = Number(e.target.value);
                setFormData({
                  ...formData,
                  duration_months: months,
                  duration_days: months * 30,
                });
              }}
            />
          </div>

          <Input
            label="Duration in Days"
            type="number"
            value={formData.duration_days}
            onChange={e => setFormData({ ...formData, duration_days: Number(e.target.value) })}
          />

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Description</label>
            <textarea
              rows={2}
              className="w-full bg-[#0D121D] border border-[#232D42] rounded-lg p-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
              placeholder="Short description of who this plan is tailored for..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Included Benefits (one per line)
            </label>
            <textarea
              rows={4}
              className="w-full bg-[#0D121D] border border-[#232D42] rounded-lg p-2.5 text-xs text-slate-100 font-mono placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
              value={formData.benefitsInput}
              onChange={e => setFormData({ ...formData, benefitsInput: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.is_active}
              onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded bg-[#0D121D] border-[#232D42] text-orange-500 focus:ring-orange-500"
            />
            <label htmlFor="isActive" className="text-xs text-slate-300 cursor-pointer">
              Active plan available for member assignment & renewals
            </label>
          </div>

          <div className="pt-3 border-t border-[#1E273A] flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingPlan ? 'Save Plan' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

