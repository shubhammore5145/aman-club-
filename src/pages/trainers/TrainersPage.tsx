import React, { useState, useEffect } from 'react';
import { useGym } from '../../contexts/GymContext';
import { AppStorage, DATA_CHANGE_EVENT } from '../../lib/storage';
import { Trainer, Member } from '../../types/database';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { TrainerModal } from '../../components/trainers/TrainerModal';
import { formatCurrency, formatDate } from '../../lib/utils';
import {
  UserCheck,
  Plus,
  Phone,
  Mail,
  Calendar,
  Clock,
  Users,
  Edit2,
  Trash2,
  Award,
  Share2
} from 'lucide-react';

export const TrainersPage: React.FC = () => {
  const { currentGym } = useGym();
  const [trainers, setTrainers] = useState<Trainer[]>(AppStorage.getTrainers(currentGym.id));
  const [members, setMembers] = useState<Member[]>(AppStorage.getMembers(currentGym.id));

  const [modalOpen, setModalOpen] = useState(false);
  const [trainerToEdit, setTrainerToEdit] = useState<Trainer | null>(null);

  const loadData = () => {
    setTrainers(AppStorage.getTrainers(currentGym.id));
    setMembers(AppStorage.getMembers(currentGym.id));
  };

  useEffect(() => {
    loadData();
    window.addEventListener(DATA_CHANGE_EVENT, loadData);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, loadData);
  }, [currentGym.id]);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this trainer?')) {
      AppStorage.deleteTrainer(id);
      loadData();
    }
  };

  const handleWhatsApp = (t: Trainer) => {
    window.open(`https://wa.me/${t.phone.replace(/[^0-9]/g, '')}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-orange-400" />
            Coaching Staff & Trainers ({trainers.length})
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage floor trainers, personal training schedules, and salary records.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => {
            setTrainerToEdit(null);
            setModalOpen(true);
          }}
        >
          Add Trainer
        </Button>
      </div>

      {/* Trainers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {trainers.map(t => {
          const assignedMembers = members.filter(m => m.assigned_trainer_id === t.id);

          return (
            <Card
              key={t.id}
              hoverEffect
              className="flex flex-col justify-between relative group"
            >
              <div>
                {/* Header with Photo & Actions */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={t.photo_url || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150'}
                      alt={t.full_name}
                      className="w-12 h-12 rounded-xl object-cover border-2 border-orange-500/40 shadow-md"
                    />
                    <div>
                      <h3 className="text-base font-bold text-white">{t.full_name}</h3>
                      <p className="text-xs text-orange-400 font-medium">{t.specialization}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setTrainerToEdit(t);
                        setModalOpen(true);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-[#1A2234]"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-xs text-slate-400 mt-3 line-clamp-2 min-h-[32px]">
                  {t.bio || 'Certified fitness trainer guiding athletes to strength & conditioning goals.'}
                </p>

                {/* Details Breakdown */}
                <div className="my-4 space-y-2 py-3 border-y border-[#1E283E] text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Phone className="w-3.5 h-3.5" /> Contact:
                    </span>
                    <span className="font-semibold text-slate-200">{t.phone}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Users className="w-3.5 h-3.5" /> Active Trainees:
                    </span>
                    <span className="font-bold text-emerald-400">{assignedMembers.length} Members</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Award className="w-3.5 h-3.5" /> Base Compensation:
                    </span>
                    <span className="font-semibold text-slate-200">
                      {formatCurrency(t.base_salary, currentGym.currency_symbol)} / mo
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="w-3.5 h-3.5" /> Weekly Shift:
                    </span>
                    <span className="font-medium text-slate-300">Mon - Sat (8 hrs)</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                  leftIcon={<Share2 className="w-3 h-3" />}
                  onClick={() => handleWhatsApp(t)}
                >
                  WhatsApp
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex-1 text-xs"
                  onClick={() => {
                    setTrainerToEdit(t);
                    setModalOpen(true);
                  }}
                >
                  Edit Profile
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <TrainerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        trainerToEdit={trainerToEdit}
        onSuccess={loadData}
      />
    </div>
  );
};
