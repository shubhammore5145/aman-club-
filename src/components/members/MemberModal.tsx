import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Member, MembershipPlan, Trainer, MemberStatus } from '../../types/database';
import { useGym } from '../../contexts/GymContext';
import { AppStorage } from '../../lib/storage';
import { generateMemberCode } from '../../lib/utils';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberToEdit?: Member | null;
  onSuccess: () => void;
}

export const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  memberToEdit,
  onSuccess,
}) => {
  const { currentGym } = useGym();
  const plans = AppStorage.getMembershipPlans(currentGym.id);
  const trainers = AppStorage.getTrainers(currentGym.id);

  const [formData, setFormData] = useState({
    member_code: '',
    full_name: '',
    email: '',
    phone: '',
    gender: 'male' as 'male' | 'female' | 'other',
    date_of_birth: '1998-01-01',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    membership_plan_id: plans[0]?.id || '',
    membership_start_date: new Date().toISOString().split('T')[0],
    membership_end_date: '',
    assigned_trainer_id: trainers[0]?.id || '',
    health_notes: '',
    avatar_url: '',
    status: 'active' as MemberStatus,
  });

  useEffect(() => {
    if (memberToEdit) {
      setFormData({
        member_code: memberToEdit.member_code,
        full_name: memberToEdit.full_name,
        email: memberToEdit.email || '',
        phone: memberToEdit.phone,
        gender: memberToEdit.gender,
        date_of_birth: memberToEdit.date_of_birth || '1998-01-01',
        address: memberToEdit.address || '',
        emergency_contact_name: memberToEdit.emergency_contact_name || '',
        emergency_contact_phone: memberToEdit.emergency_contact_phone || '',
        membership_plan_id: memberToEdit.membership_plan_id || plans[0]?.id || '',
        membership_start_date: memberToEdit.membership_start_date,
        membership_end_date: memberToEdit.membership_end_date,
        assigned_trainer_id: memberToEdit.assigned_trainer_id || '',
        health_notes: memberToEdit.health_notes || '',
        avatar_url: memberToEdit.avatar_url || '',
        status: memberToEdit.status,
      });
    } else {
      // Calculate default end date based on selected plan
      const selectedPlan = plans[0];
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + (selectedPlan?.duration_days || 30));

      setFormData({
        member_code: generateMemberCode(currentGym.name.includes('Aman') ? 'AMAN' : 'GYM'),
        full_name: '',
        email: '',
        phone: '',
        gender: 'male',
        date_of_birth: '1998-01-01',
        address: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        membership_plan_id: selectedPlan?.id || '',
        membership_start_date: startDate.toISOString().split('T')[0],
        membership_end_date: endDate.toISOString().split('T')[0],
        assigned_trainer_id: trainers[0]?.id || '',
        health_notes: '',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        status: 'active',
      });
    }
  }, [memberToEdit, isOpen]);

  const handlePlanChange = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      const startDate = new Date(formData.membership_start_date);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + (plan.duration_days || 30));
      setFormData(prev => ({
        ...prev,
        membership_plan_id: planId,
        membership_end_date: endDate.toISOString().split('T')[0],
      }));
    } else {
      setFormData(prev => ({ ...prev, membership_plan_id: planId }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.phone) return;

    if (memberToEdit) {
      AppStorage.updateMember({
        ...memberToEdit,
        ...formData,
      });
    } else {
      AppStorage.addMember({
        gym_id: currentGym.id,
        member_code: formData.member_code,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        date_of_birth: formData.date_of_birth,
        address: formData.address,
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_phone: formData.emergency_contact_phone,
        joining_date: formData.membership_start_date,
        membership_plan_id: formData.membership_plan_id,
        membership_start_date: formData.membership_start_date,
        membership_end_date: formData.membership_end_date,
        assigned_trainer_id: formData.assigned_trainer_id,
        health_notes: formData.health_notes,
        avatar_url: formData.avatar_url,
        status: formData.status,
        qr_code_token: `${formData.member_code}-QR-${Date.now().toString(36).toUpperCase()}`,
      });
    }

    onSuccess();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={memberToEdit ? 'Edit Member Profile' : 'Register New Member'}
      description="Enter personal, medical, and membership subscription details"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Section 1: Basic Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            required
            placeholder="e.g. Rohit Sharma"
            value={formData.full_name}
            onChange={e => setFormData({ ...formData, full_name: e.target.value })}
          />
          <Input
            label="Member Code"
            required
            placeholder="AMAN-001"
            value={formData.member_code}
            onChange={e => setFormData({ ...formData, member_code: e.target.value })}
          />
          <Input
            label="Phone Number"
            required
            placeholder="+91 98765 43210"
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="rohit@example.com"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
          />
          <Select
            label="Gender"
            value={formData.gender}
            onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </Select>
          <Input
            label="Date of Birth"
            type="date"
            value={formData.date_of_birth}
            onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })}
          />
        </div>

        {/* Section 2: Membership & Trainer Assignment */}
        <div className="pt-3 border-t border-[#1E273A] grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Select Membership Plan"
            value={formData.membership_plan_id}
            onChange={e => handlePlanChange(e.target.value)}
          >
            {plans.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} - ₹{p.price.toLocaleString()} ({p.duration_months} mo)
              </option>
            ))}
          </Select>

          <Select
            label="Assign Personal Trainer"
            value={formData.assigned_trainer_id}
            onChange={e => setFormData({ ...formData, assigned_trainer_id: e.target.value })}
          >
            <option value="">No Trainer (General)</option>
            {trainers.map(t => (
              <option key={t.id} value={t.id}>
                {t.full_name} ({t.specialization})
              </option>
            ))}
          </Select>

          <Input
            label="Start Date"
            type="date"
            value={formData.membership_start_date}
            onChange={e => setFormData({ ...formData, membership_start_date: e.target.value })}
          />

          <Input
            label="End Date (Expiry)"
            type="date"
            value={formData.membership_end_date}
            onChange={e => setFormData({ ...formData, membership_end_date: e.target.value })}
          />
        </div>

        {/* Section 3: Emergency & Health Notes */}
        <div className="pt-3 border-t border-[#1E273A] grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Emergency Contact Name"
            placeholder="e.g. Sunita Sharma (Mother)"
            value={formData.emergency_contact_name}
            onChange={e => setFormData({ ...formData, emergency_contact_name: e.target.value })}
          />
          <Input
            label="Emergency Contact Phone"
            placeholder="+91 98777 00000"
            value={formData.emergency_contact_phone}
            onChange={e => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
          />
          <div className="sm:col-span-2">
            <Input
              label="Residential Address"
              placeholder="House, Sector / Street, City"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Medical & Health Notes (Injuries, Allergies, Fitness Goals)
            </label>
            <textarea
              rows={2}
              className="w-full bg-[#0D121D] border border-[#232D42] rounded-lg p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
              placeholder="e.g. Mild lower back sensitivity; needs careful deadlift warmup..."
              value={formData.health_notes}
              onChange={e => setFormData({ ...formData, health_notes: e.target.value })}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#1E273A] flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {memberToEdit ? 'Save Changes' : 'Complete Registration'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
