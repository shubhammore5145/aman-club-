import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Trainer } from '../../types/database';
import { useGym } from '../../contexts/GymContext';
import { AppStorage } from '../../lib/storage';

interface TrainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainerToEdit?: Trainer | null;
  onSuccess: () => void;
}

export const TrainerModal: React.FC<TrainerModalProps> = ({
  isOpen,
  onClose,
  trainerToEdit,
  onSuccess,
}) => {
  const { currentGym } = useGym();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    specialization: 'Strength & Conditioning',
    bio: '',
    salary_type: 'monthly' as 'monthly' | 'per_session',
    base_salary: 35000,
    status: 'active' as 'active' | 'inactive',
    photo_url: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200',
  });

  useEffect(() => {
    if (trainerToEdit) {
      setFormData({
        full_name: trainerToEdit.full_name,
        email: trainerToEdit.email,
        phone: trainerToEdit.phone,
        specialization: trainerToEdit.specialization,
        bio: trainerToEdit.bio || '',
        salary_type: trainerToEdit.salary_type,
        base_salary: trainerToEdit.base_salary,
        status: trainerToEdit.status,
        photo_url: trainerToEdit.photo_url || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200',
      });
    } else {
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        specialization: 'Strength & Conditioning',
        bio: '',
        salary_type: 'monthly',
        base_salary: 35000,
        status: 'active',
        photo_url: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200',
      });
    }
  }, [trainerToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.phone) return;

    if (trainerToEdit) {
      AppStorage.updateTrainer({
        ...trainerToEdit,
        ...formData,
      });
    } else {
      AppStorage.addTrainer({
        gym_id: currentGym.id,
        ...formData,
        joining_date: new Date().toISOString().split('T')[0],
        schedule: {
          Monday: '06:00 - 14:00',
          Tuesday: '06:00 - 14:00',
          Wednesday: '06:00 - 14:00',
          Thursday: '06:00 - 14:00',
          Friday: '06:00 - 14:00',
          Saturday: '06:00 - 12:00',
        },
      });
    }

    onSuccess();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={trainerToEdit ? 'Edit Trainer Profile' : 'Onboard New Coach / Trainer'}
      description={`Add certified coaches to ${currentGym.name}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Coach Name"
          required
          placeholder="e.g. Vikram Sharma"
          value={formData.full_name}
          onChange={e => setFormData({ ...formData, full_name: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Phone"
            required
            placeholder="+91 98111 22334"
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            placeholder="vikram@amansportclub.com"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <Input
          label="Specialization & Certification"
          placeholder="e.g. CSCS, Olympic Weightlifting, Rehab"
          value={formData.specialization}
          onChange={e => setFormData({ ...formData, specialization: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Base Monthly Salary (INR)"
            type="number"
            value={formData.base_salary}
            onChange={e => setFormData({ ...formData, base_salary: Number(e.target.value) })}
          />
          <Select
            label="Status"
            value={formData.status}
            onChange={e => setFormData({ ...formData, status: e.target.value as any })}
          >
            <option value="active">Active Coach</option>
            <option value="inactive">On Leave / Inactive</option>
          </Select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Coach Bio / Accreditations</label>
          <textarea
            rows={2}
            className="w-full bg-[#0D121D] border border-[#232D42] rounded-lg p-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
            placeholder="Specialized coaching background..."
            value={formData.bio}
            onChange={e => setFormData({ ...formData, bio: e.target.value })}
          />
        </div>

        <div className="pt-3 border-t border-[#1E273A] flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {trainerToEdit ? 'Save Changes' : 'Confirm Coach'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
