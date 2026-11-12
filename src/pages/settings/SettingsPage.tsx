import React, { useState } from 'react';
import { useGym } from '../../contexts/GymContext';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import {
  Settings,
  Building,
  Save,
  CheckCircle2,
  Bell,
  Receipt,
  Clock,
  ShieldCheck,
  Flame
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { currentGym, updateGymSettings } = useGym();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: currentGym.name,
    address: currentGym.address,
    city: currentGym.city || 'Gurugram',
    state: currentGym.state || 'Haryana',
    postal_code: currentGym.postal_code || '122001',
    phone: currentGym.phone,
    email: currentGym.email,
    currency_symbol: currentGym.currency_symbol || '₹',
    tax_rate: currentGym.tax_rate || 18,
    opening_hours: currentGym.opening_hours || 'Mon - Sat: 5:30 AM - 10:30 PM | Sun: 6:00 AM - 2:00 PM',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateGymSettings({
      ...formData,
      tax_rate: Number(formData.tax_rate),
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-orange-400" />
            Gym Configuration & Brand Settings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage official tax compliance, facility operating hours, and communication preferences.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-semibold animate-pulse">
            <CheckCircle2 className="w-4 h-4" />
            Settings saved successfully!
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Brand & Location */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Gym Identity & Contact</CardTitle>
              <CardDescription>Legal business name printed on official receipts</CardDescription>
            </div>
          </CardHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Gym / Club Brand Name"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                label="Official Contact Number"
                required
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Official Email Address"
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
              <Input
                label="Operating Hours"
                value={formData.opening_hours}
                onChange={e => setFormData({ ...formData, opening_hours: e.target.value })}
              />
            </div>

            <Input
              label="Street Address / Facility Location"
              required
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
            />

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="City"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
              />
              <Input
                label="State / Province"
                value={formData.state}
                onChange={e => setFormData({ ...formData, state: e.target.value })}
              />
              <Input
                label="Postal PIN Code"
                value={formData.postal_code}
                onChange={e => setFormData({ ...formData, postal_code: e.target.value })}
              />
            </div>
          </div>
        </Card>

        {/* Card 2: Billing & Tax Settings */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Taxation & Invoice Compliance</CardTitle>
              <CardDescription>Default currency symbol and statutory GST rates</CardDescription>
            </div>
          </CardHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Default Currency Symbol"
              value={formData.currency_symbol}
              onChange={e => setFormData({ ...formData, currency_symbol: e.target.value })}
            >
              <option value="₹">₹ (Indian Rupee - INR)</option>
              <option value="$">$ (US Dollar - USD)</option>
              <option value="€">€ (Euro - EUR)</option>
              <option value="£">£ (British Pound - GBP)</option>
              <option value="AED">AED (UAE Dirham)</option>
            </Select>

            <Input
              label="GST / Sales Tax Rate (%)"
              type="number"
              step="0.5"
              value={formData.tax_rate}
              onChange={e => setFormData({ ...formData, tax_rate: Number(e.target.value) })}
              helperText="Standard gym services in India fall under 18% GST"
            />
          </div>
        </Card>

        {/* Card 3: Notification Integrations */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Automated Notification Channels</CardTitle>
              <CardDescription>Dispatch channels for expiry reminders and receipts</CardDescription>
            </div>
          </CardHeader>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0D121D] border border-[#232D42]">
              <div>
                <p className="font-semibold text-slate-100">WhatsApp Instant Receipts & Alerts</p>
                <p className="text-slate-500 mt-0.5">Direct member WhatsApp web link generation</p>
              </div>
              <Badge variant="success" size="sm">Active (Ready)</Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0D121D] border border-[#232D42]">
              <div>
                <p className="font-semibold text-slate-100">In-App Notification Stream</p>
                <p className="text-slate-500 mt-0.5">Real-time alerts for staff and owners</p>
              </div>
              <Badge variant="success" size="sm">Active</Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0D121D] border border-[#232D42]">
              <div>
                <p className="font-semibold text-slate-100">Email SMTP Relay Hook</p>
                <p className="text-slate-500 mt-0.5">Automated invoice PDF attachments via Supabase Edge Function</p>
              </div>
              <Badge variant="info" size="sm">Hook Configured</Badge>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Brand Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
