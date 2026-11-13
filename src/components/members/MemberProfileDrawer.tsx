import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs } from '../ui/Tabs';
import { Member } from '../../types/database';
import { useGym } from '../../contexts/GymContext';
import { AppStorage } from '../../lib/storage';
import { formatDate, formatCurrency, formatTime, getDaysRemaining } from '../../lib/utils';
import { generatePaymentReceiptPDF } from '../../lib/pdfGenerator';
import {
  User,
  CreditCard,
  QrCode,
  Calendar,
  Dumbbell,
  UtensilsCrossed,
  ShieldAlert,
  Phone,
  Mail,
  MapPin,
  HeartPulse,
  Download,
  Share2,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface MemberProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  onOpenQRPass: () => void;
}

export const MemberProfileDrawer: React.FC<MemberProfileDrawerProps> = ({
  isOpen,
  onClose,
  member,
  onOpenQRPass,
}) => {
  const { currentGym } = useGym();
  const [activeTab, setActiveTab] = useState('overview');

  if (!member) return null;

  const payments = AppStorage.getPayments(currentGym.id).filter(p => p.member_id === member.id);
  const attendanceRecords = AppStorage.getAttendance(currentGym.id).filter(a => a.member_id === member.id);
  const workouts = AppStorage.getWorkoutPlans(currentGym.id).filter(w => w.member_id === member.id);
  const diets = AppStorage.getDietPlans(currentGym.id).filter(d => d.member_id === member.id);

  const daysRemaining = getDaysRemaining(member.membership_end_date);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <User className="w-3.5 h-3.5" /> },
    { id: 'payments', label: 'Payments', icon: <CreditCard className="w-3.5 h-3.5" />, badge: payments.length },
    { id: 'attendance', label: 'Attendance', icon: <QrCode className="w-3.5 h-3.5" />, badge: attendanceRecords.length },
    { id: 'workout', label: 'Workout Plan', icon: <Dumbbell className="w-3.5 h-3.5" /> },
    { id: 'diet', label: 'Diet Plan', icon: <UtensilsCrossed className="w-3.5 h-3.5" /> },
  ];

  const handleDownloadReceipt = (payment: any) => {
    const doc = generatePaymentReceiptPDF(payment, currentGym, member);
    doc.save(`${payment.invoice_number}.pdf`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={member.full_name}
      description={`Member ID: ${member.member_code} • ${currentGym.name}`}
      maxWidth="3xl"
    >
      <div className="space-y-5">
        {/* Top Profile Summary Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0D121F] border border-[#232F48]">
          <div className="flex items-center gap-4">
            <img
              src={member.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={member.full_name}
              className="w-14 h-14 rounded-xl object-cover border-2 border-orange-500/50 shadow-md shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{member.full_name}</h3>
                <Badge
                  variant={member.status === 'active' ? 'success' : 'danger'}
                  size="sm"
                >
                  {member.status}
                </Badge>
              </div>
              <p className="text-xs text-orange-400 font-medium mt-0.5">
                {member.membership_plan?.name || 'Standard Membership'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Valid until {formatDate(member.membership_end_date)} ({daysRemaining} days remaining)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<QrCode className="w-3.5 h-3.5 text-orange-400" />}
              onClick={onOpenQRPass}
            >
              View Pass
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-3 p-4 rounded-xl bg-[#0E1320] border border-[#1E273A]">
              <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] pb-2 border-b border-[#1E273A]">
                Contact & Personal Info
              </h4>
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{member.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{member.email || 'No email provided'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{member.address || 'Address not registered'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Born: {formatDate(member.date_of_birth)} ({member.gender})</span>
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-[#0E1320] border border-[#1E273A]">
              <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] pb-2 border-b border-[#1E273A]">
                Emergency & Health Profile
              </h4>
              <div className="flex items-start gap-2 text-slate-300">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-200">{member.emergency_contact_name || 'Emergency contact'}</p>
                  <p className="text-slate-400">{member.emergency_contact_phone || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-slate-300 pt-2 border-t border-[#1E273A]">
                <HeartPulse className="w-3.5 h-3.5 text-rose-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-200">Medical Notes:</p>
                  <p className="text-slate-400 leading-relaxed mt-0.5">
                    {member.health_notes || 'No known allergies or medical restrictions recorded.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Payments */}
        {activeTab === 'payments' && (
          <div className="space-y-2">
            {payments.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No payments recorded for this member yet.</p>
            ) : (
              payments.map(p => (
                <div
                  key={p.id}
                  className="p-3 rounded-lg bg-[#0E1320] border border-[#1E273A] flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-100">{p.invoice_number}</p>
                    <p className="text-slate-400 text-[11px]">
                      {formatDate(p.payment_date)} • <span className="uppercase text-orange-400">{p.payment_method}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-100">
                      {formatCurrency(p.total_amount, currentGym.currency_symbol)}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 px-2"
                      onClick={() => handleDownloadReceipt(p)}
                      leftIcon={<Download className="w-3 h-3 text-orange-400" />}
                    >
                      PDF
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Attendance History */}
        {activeTab === 'attendance' && (
          <div className="space-y-2">
            {attendanceRecords.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No attendance check-ins recorded yet.</p>
            ) : (
              attendanceRecords.map(a => (
                <div
                  key={a.id}
                  className="p-3 rounded-lg bg-[#0E1320] border border-[#1E273A] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <div>
                      <p className="font-semibold text-slate-200">{a.session_type || 'Workout Session'}</p>
                      <p className="text-[11px] text-slate-400">Date: {formatDate(a.date)}</p>
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-slate-400">
                    <p className="text-slate-200 font-medium">In: {formatTime(a.check_in_time)}</p>
                    {a.check_out_time && <p>Out: {formatTime(a.check_out_time)}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 4: Workout Plan */}
        {activeTab === 'workout' && (
          <div className="space-y-3">
            {workouts.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-[#0E1320] border border-[#1E273A]">
                <Dumbbell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No custom workout plan assigned yet.</p>
              </div>
            ) : (
              workouts.map(w => (
                <div key={w.id} className="p-4 rounded-xl bg-[#0E1320] border border-[#1E273A] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{w.name}</h4>
                      <p className="text-xs text-orange-400">{w.goal}</p>
                    </div>
                    <Badge variant="orange" size="sm">{w.difficulty}</Badge>
                  </div>
                  <div className="space-y-1.5 pt-2 border-t border-[#1E273A]">
                    {w.exercises?.map(ex => (
                      <div key={ex.id} className="flex items-center justify-between text-xs p-2 rounded bg-[#131929]">
                        <span className="font-medium text-slate-200">{ex.exercise_name}</span>
                        <span className="text-slate-400">{ex.sets} sets × {ex.reps} ({ex.rest_seconds}s rest)</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 5: Diet Plan */}
        {activeTab === 'diet' && (
          <div className="space-y-3">
            {diets.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-[#0E1320] border border-[#1E273A]">
                <UtensilsCrossed className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No diet plan assigned yet.</p>
              </div>
            ) : (
              diets.map(d => (
                <div key={d.id} className="p-4 rounded-xl bg-[#0E1320] border border-[#1E273A] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{d.name}</h4>
                      <p className="text-xs text-emerald-400">{d.target_calories} kcal target</p>
                    </div>
                    <div className="flex gap-2 text-[10px] text-slate-300">
                      <span className="bg-[#141B2A] px-2 py-0.5 rounded border border-[#232F48]">P: {d.protein_g}g</span>
                      <span className="bg-[#141B2A] px-2 py-0.5 rounded border border-[#232F48]">C: {d.carbs_g}g</span>
                      <span className="bg-[#141B2A] px-2 py-0.5 rounded border border-[#232F48]">F: {d.fat_g}g</span>
                    </div>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-[#1E273A]">
                    {d.meals?.map(m => (
                      <div key={m.id} className="p-2.5 rounded bg-[#131929] text-xs">
                        <div className="flex justify-between font-semibold text-slate-200">
                          <span>{m.meal_type}: {m.meal_name}</span>
                          <span className="text-orange-400">{m.calories} kcal</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{m.items.join(', ')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

