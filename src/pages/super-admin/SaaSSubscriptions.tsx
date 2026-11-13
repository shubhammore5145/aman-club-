import React from 'react';
import { AppStorage } from '../../lib/storage';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency, formatDate } from '../../lib/utils';
import { CreditCard, Check, Sparkles, Shield, Zap, Crown } from 'lucide-react';

export const SaaSSubscriptions: React.FC = () => {
  const subscriptions = AppStorage.getSubscriptions();
  const gyms = AppStorage.getGyms();

  const tiers = [
    {
      id: 'free',
      name: 'Starter Trial',
      priceMonthly: 0,
      priceYearly: 0,
      description: 'Ideal for boutique independent trainers or single studio launch.',
      features: [
        'Up to 30 active athletes',
        '1 Personal trainer account',
        'Manual turnstile attendance',
        'Basic member directory',
        'Community email support',
      ],
      popular: false,
    },
    {
      id: 'basic',
      name: 'Club Basic',
      priceMonthly: 1999,
      priceYearly: 19999,
      description: 'Full management toolkit for growing local neighborhood gyms.',
      features: [
        'Up to 150 active athletes',
        '4 Trainer accounts',
        'High-speed QR Code check-ins',
        'Automated GST PDF receipts',
        'Basic expense ledger',
        'WhatsApp payment notifications',
      ],
      popular: false,
    },
    {
      id: 'pro',
      name: 'Commercial Pro',
      priceMonthly: 3499,
      priceYearly: 34999,
      description: 'Our most popular tier for high-volume commercial fitness clubs.',
      features: [
        'Up to 600 active athletes',
        'Unlimited trainers & front desk staff',
        'Full Workout & Diet plan builder',
        'P&L Financial analytics & Net profit',
        'Equipment maintenance logs',
        'WhatsApp direct messaging',
      ],
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Flagship Enterprise',
      priceMonthly: 6999,
      priceYearly: 69999,
      description: 'Multi-branch elite tier deployed for Aman Sport club & luxury chains.',
      features: [
        'Unlimited athletes & members',
        'Unlimited branches & gym locations',
        'Custom white-label branding',
        'Dedicated Supabase DB cluster',
        'Biometric hardware turnstile API',
        '24/7 Priority SLA phone support',
      ],
      popular: false,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-orange-400" />
          SaaS Platform Subscription Plans
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Tiered subscription models offered to gym owners with recurring monthly & annual billing cycles.
        </p>
      </div>

      {/* 4 Tier Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {tiers.map(t => (
          <Card
            key={t.id}
            hoverEffect
            className={`flex flex-col justify-between relative ${
              t.popular ? 'border-orange-500 shadow-glow-orange' : ''
            }`}
          >
            {t.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Most Popular
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-white">{t.name}</h3>
                {t.id === 'enterprise' ? <Crown className="w-4 h-4 text-amber-400" /> : <Zap className="w-4 h-4 text-orange-400" />}
              </div>
              <p className="text-xs text-slate-400 min-h-[32px]">{t.description}</p>

              <div className="my-4 py-3 border-y border-[#1E283E]">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-orange-400">
                    {t.priceMonthly === 0 ? 'Free' : formatCurrency(t.priceMonthly)}
                  </span>
                  {t.priceMonthly > 0 && <span className="text-xs text-slate-400">/ month</span>}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {t.priceYearly === 0 ? 'No credit card required' : `${formatCurrency(t.priceYearly)} billed annually`}
                </p>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Features Included:</p>
                {t.features.map((f, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant={t.popular ? 'primary' : 'outline'}
              size="sm"
              className="w-full text-xs mt-auto"
            >
              Select {t.name}
            </Button>
          </Card>
        ))}
      </div>

      {/* Tenant Subscription History Table */}
      <Card>
        <div className="flex items-center justify-between pb-3 border-b border-[#1E283D] mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100">Gym Tenant Subscription Invoices</h3>
            <p className="text-xs text-slate-400 mt-0.5">SaaS billing receipts generated across the multi-tenant base</p>
          </div>
          <Badge variant="orange" size="sm">Active Platform Billings</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1E273A] bg-[#0E1320] text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Gym Tenant</th>
                <th className="py-3 px-4">Tier</th>
                <th className="py-3 px-4">Cycle</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2234]">
              {subscriptions.map(s => {
                const gym = gyms.find(g => g.id === s.gym_id);
                return (
                  <tr key={s.id} className="hover:bg-[#131929] transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                      {s.invoice_number || 'SAAS-INV-001'}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-100">
                      {gym?.name || 'Aman Sport club'}
                    </td>
                    <td className="py-3 px-4 uppercase text-orange-400 font-semibold">
                      {s.plan_tier}
                    </td>
                    <td className="py-3 px-4 capitalize text-slate-300">
                      {s.cycle}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-400">
                      {formatCurrency(s.total_amount)}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {formatDate(s.start_date)} - {formatDate(s.end_date)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Badge variant="success" size="sm">
                        {s.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

