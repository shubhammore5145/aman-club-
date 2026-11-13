import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useGym } from '../../contexts/GymContext';
import { AppStorage } from '../../lib/storage';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { QRCodeSVG } from 'qrcode.react';
import { formatDate, formatCurrency, getDaysRemaining } from '../../lib/utils';
import { generatePaymentReceiptPDF } from '../../lib/pdfGenerator';
import {
  Flame,
  Dumbbell,
  UtensilsCrossed,
  CreditCard,
  QrCode,
  Calendar,
  Clock,
  Download,
  ShieldCheck,
  CheckCircle2,
  Droplets
} from 'lucide-react';

export const MemberPortalPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { currentGym } = useGym();

  const members = AppStorage.getMembers(currentGym.id);
  const member = members.find(m => m.profile_id === currentUser.id) || members[0];

  const workouts = AppStorage.getWorkoutPlans(currentGym.id).filter(w => w.member_id === member.id);
  const diets = AppStorage.getDietPlans(currentGym.id).filter(d => d.member_id === member.id);
  const payments = AppStorage.getPayments(currentGym.id).filter(p => p.member_id === member.id);

  const daysRemaining = getDaysRemaining(member.membership_end_date);

  const handleDownloadPDF = (payment: any) => {
    const doc = generatePaymentReceiptPDF(payment, currentGym, member);
    doc.save(`${payment.invoice_number}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#141B2E] via-[#0E1424] to-[#0A0D16] border border-orange-500/40 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src={member.avatar_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
            alt={member.full_name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-orange-500/50 shadow-glow-orange"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Welcome, {member.full_name}</h2>
              <Badge variant="success" size="sm">Active Member</Badge>
            </div>
            <p className="text-xs text-orange-400 font-semibold mt-0.5">
              {member.membership_plan?.name || 'Annual Elite All-Access'} • {currentGym.name}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Membership Valid Until: <strong>{formatDate(member.membership_end_date)}</strong> ({daysRemaining} days left)
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="primary"
          leftIcon={<Download className="w-3.5 h-3.5" />}
          onClick={() => window.print()}
        >
          Print My Membership Pass
        </Button>
      </div>

      {/* Grid: Digital Pass + Workout + Nutrition */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Digital Member Card */}
        <Card className="flex flex-col items-center text-center p-6 bg-gradient-to-b from-[#141C2E] to-[#0D121F] border-orange-500/30">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white mb-2 shadow-glow-orange">
            <Flame className="w-6 h-6 fill-white" />
          </div>

          <h3 className="text-sm font-bold tracking-wider text-white uppercase">{currentGym.name}</h3>
          <p className="text-[10px] text-orange-400 font-semibold uppercase tracking-widest">Contactless Member Pass</p>

          <div className="bg-white p-3.5 rounded-2xl my-4 shadow-xl">
            <QRCodeSVG
              value={member.qr_code_token || member.member_code}
              size={150}
              level="H"
            />
          </div>

          <p className="font-mono text-xs font-bold text-slate-200 bg-[#0A0D15] px-3 py-1 rounded-md border border-[#232F48]">
            {member.member_code}
          </p>
          <p className="text-[11px] text-slate-400 mt-2 max-w-xs">
            Hold this screen against the club turnstile scanner upon entering.
          </p>

          <div className="mt-4 pt-3 border-t border-[#1E283D] w-full flex items-center justify-center gap-1.5 text-[11px] text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Athlete Access</span>
          </div>
        </Card>

        {/* Workout Routine */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>My Customized Workout Routine</CardTitle>
              <CardDescription>Prepared by head coach for maximum hypertrophy</CardDescription>
            </div>
            <Badge variant="orange" size="sm">Assigned Plan</Badge>
          </CardHeader>

          {workouts.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">No workout plan assigned yet.</p>
          ) : (
            <div className="space-y-3">
              {workouts[0].exercises?.map(ex => (
                <div
                  key={ex.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#0D121E] border border-[#1E283E] text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center font-bold">
                      <Dumbbell className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-100">{ex.exercise_name}</p>
                      <p className="text-[11px] text-slate-400">{ex.day_of_week} • {ex.target_muscle}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-orange-400">{ex.sets} Sets × {ex.reps}</p>
                    <p className="text-[10px] text-slate-500">{ex.rest_seconds}s rest</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Row 2: Diet Plan & Payment Receipts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diet Plan */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>My Nutrition & Meal Schedule</CardTitle>
              <CardDescription>Target: 3,000 kcal • 190g Protein</CardDescription>
            </div>
            <Badge variant="success" size="sm">Active Nutrition</Badge>
          </CardHeader>

          {diets.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No diet plan assigned yet.</p>
          ) : (
            <div className="space-y-3">
              {diets[0].meals?.map(m => (
                <div key={m.id} className="p-3 rounded-lg bg-[#0D121E] border border-[#1E283E] text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-100">{m.meal_type}: {m.meal_name}</span>
                    <span className="text-orange-400">{m.calories} kcal • {m.protein_g}g Pro</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{m.items.join(', ')}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Payment Invoices & Receipts */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>My Invoices & Receipts</CardTitle>
              <CardDescription>Download official GST compliant invoices</CardDescription>
            </div>
          </CardHeader>

          <div className="space-y-3">
            {payments.map(p => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-lg bg-[#0D121E] border border-[#1E283E] text-xs"
              >
                <div>
                  <p className="font-bold text-slate-100">{p.invoice_number}</p>
                  <p className="text-[11px] text-slate-400">
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
                    className="h-7 text-xs px-2 text-orange-400 border-orange-500/30"
                    leftIcon={<Download className="w-3 h-3" />}
                    onClick={() => handleDownloadPDF(p)}
                  >
                    PDF
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

