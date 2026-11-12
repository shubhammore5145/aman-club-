import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useGym } from '../../contexts/GymContext';
import { AppStorage } from '../../lib/storage';
import { StatsCard } from '../../components/ui/StatsCard';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatDate, formatCurrency } from '../../lib/utils';
import {
  Dumbbell,
  Users,
  QrCode,
  Calendar,
  Clock,
  CheckCircle2,
  Share2,
  Award,
  Sparkles
} from 'lucide-react';

interface TrainerPortalPageProps {
  onNavigate: (page: string) => void;
}

export const TrainerPortalPage: React.FC<TrainerPortalPageProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { currentGym } = useGym();

  const trainers = AppStorage.getTrainers(currentGym.id);
  const trainer = trainers.find(t => t.email === currentUser.email) || trainers[0];

  const allMembers = AppStorage.getMembers(currentGym.id);
  const assignedTrainees = allMembers.filter(m => m.assigned_trainer_id === trainer.id);

  const workouts = AppStorage.getWorkoutPlans(currentGym.id);
  const attendance = AppStorage.getAttendance(currentGym.id);

  const handleWhatsApp = (phone: string, name: string) => {
    const text = encodeURIComponent(`Hi ${name}, this is coach ${trainer.full_name} from ${currentGym.name}! Ready for today's training session?`);
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#111726] to-[#0D121F] border border-[#232F48] p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src={trainer.photo_url || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150'}
            alt={trainer.full_name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-orange-500/50 shadow-glow-orange"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Coach {trainer.full_name}</h2>
              <Badge variant="orange" size="sm">Certified Trainer</Badge>
            </div>
            <p className="text-xs text-orange-400 font-medium mt-0.5">{trainer.specialization}</p>
            <p className="text-[11px] text-slate-400">{currentGym.name} Coaching Division</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            leftIcon={<QrCode className="w-3.5 h-3.5" />}
            onClick={() => onNavigate('attendance')}
          >
            Check-In Trainee
          </Button>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Dumbbell className="w-3.5 h-3.5" />}
            onClick={() => onNavigate('workouts')}
          >
            Workout Builder
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Assigned Athletes"
          value={assignedTrainees.length}
          change="Personal training"
          trend="up"
          icon={<Users className="w-4 h-4 text-orange-400" />}
          description="Athletes under care"
        />
        <StatsCard
          title="Base Compensation"
          value={formatCurrency(trainer.base_salary, currentGym.currency_symbol)}
          change="Monthly payout"
          trend="neutral"
          icon={<Award className="w-4 h-4 text-emerald-400" />}
          description="Direct salary"
        />
        <StatsCard
          title="Shift Timing"
          value="6 AM - 2 PM"
          change="Morning Block"
          trend="neutral"
          icon={<Clock className="w-4 h-4 text-sky-400" />}
          description="Floor duty hours"
        />
        <StatsCard
          title="Trainee Retention"
          value="98%"
          change="Top tier"
          trend="up"
          icon={<Sparkles className="w-4 h-4 text-purple-400" />}
          description="Member satisfaction"
        />
      </div>

      {/* Trainees Table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>My Athletes & Trainees</CardTitle>
            <CardDescription>Athletes assigned to your coaching schedule</CardDescription>
          </div>
          <Badge variant="orange" size="sm">{assignedTrainees.length} Active</Badge>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1E273A] bg-[#0E1320] text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Athlete</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Package Plan</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Quick Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2234]">
              {assignedTrainees.map(m => (
                <tr key={m.id} className="hover:bg-[#131929] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={m.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                        alt={m.full_name}
                        className="w-8 h-8 rounded-full object-cover border border-[#232F48]"
                      />
                      <div>
                        <p className="font-semibold text-slate-100">{m.full_name}</p>
                        <p className="text-[10px] text-orange-400">{m.member_code}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-slate-300 font-medium">
                    {m.phone}
                  </td>

                  <td className="py-3 px-4 text-slate-200">
                    {m.membership_plan?.name || 'Pro Athlete'}
                  </td>

                  <td className="py-3 px-4 text-slate-400">
                    {formatDate(m.membership_end_date)}
                  </td>

                  <td className="py-3 px-4">
                    <Badge variant={m.status === 'active' ? 'success' : 'danger'} size="sm">
                      {m.status}
                    </Badge>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs px-2 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                      leftIcon={<Share2 className="w-3 h-3" />}
                      onClick={() => handleWhatsApp(m.phone, m.full_name)}
                    >
                      WhatsApp
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
