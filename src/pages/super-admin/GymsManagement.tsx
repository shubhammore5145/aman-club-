import React, { useState, useEffect } from 'react';
import { AppStorage, DATA_CHANGE_EVENT } from '../../lib/storage';
import { Gym } from '../../types/database';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { formatDate } from '../../lib/utils';
import {
  Building2,
  Plus,
  PowerOff,
  Power,
  Search,
  CheckCircle2,
  Clock,
  Shield,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

export const GymsManagement: React.FC = () => {
  const [gyms, setGyms] = useState<Gym[]>(AppStorage.getGyms());
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: 'New Delhi',
    state: 'Delhi',
    phone: '+91 98000 11223',
    email: 'contact@newgym.com',
    subscription_tier: 'pro' as Gym['subscription_tier'],
    subscription_cycle: 'yearly' as Gym['subscription_cycle'],
  });

  const loadData = () => {
    setGyms(AppStorage.getGyms());
  };

  useEffect(() => {
    loadData();
    window.addEventListener(DATA_CHANGE_EVENT, loadData);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, loadData);
  }, []);

  const handleToggleStatus = (gymId: string, currentStatus: Gym['status']) => {
    const next = currentStatus === 'active' ? 'suspended' : 'active';
    AppStorage.updateGymStatus(gymId, next);
    loadData();
  };

  const handleAddGym = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newGym: Gym = {
      id: crypto.randomUUID(),
      name: formData.name,
      slug: formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      address: formData.address,
      city: formData.city,
      state: formData.state,
      phone: formData.phone,
      email: formData.email,
      currency: 'INR',
      currency_symbol: '₹',
      tax_rate: 18,
      opening_hours: 'Mon - Sat: 6:00 AM - 10:00 PM',
      status: 'active',
      subscription_tier: formData.subscription_tier,
      subscription_cycle: formData.subscription_cycle,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const all = AppStorage.getGyms();
    all.push(newGym);
    localStorage.setItem('aman_gym_saas_gyms_v1', JSON.stringify(all));

    loadData();
    setModalOpen(false);
  };

  const filteredGyms = gyms.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (g.city && g.city.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-orange-400" />
            Gym Tenants Directory ({gyms.length})
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Authorize new tenant instances, inspect health metrics, and govern access policies.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setModalOpen(true)}
        >
          Register New Gym
        </Button>
      </div>

      {/* Search */}
      <div className="bg-[#101522] border border-[#232D42] p-3 rounded-xl flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search gym by name or city..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#0D121D] border border-[#232D42] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Gym Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredGyms.map(gym => (
          <Card key={gym.id} hoverEffect className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold text-base shadow-glow-orange shrink-0">
                  {gym.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{gym.name}</h3>
                  <p className="text-xs text-orange-400 font-mono mt-0.5">{gym.slug}</p>
                </div>
              </div>
              <Badge variant={gym.status === 'active' ? 'success' : 'danger'} size="sm">
                {gym.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 py-3 border-y border-[#1E283E] text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{gym.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{gym.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300 col-span-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{gym.address}, {gym.city}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400">
                Tier: <strong className="text-slate-200 capitalize">{gym.subscription_tier}</strong> ({gym.subscription_cycle})
              </span>
              <Button
                size="sm"
                variant={gym.status === 'active' ? 'danger' : 'outline'}
                className="text-xs h-7"
                leftIcon={gym.status === 'active' ? <PowerOff className="w-3 h-3" /> : <Power className="w-3 h-3" />}
                onClick={() => handleToggleStatus(gym.id, gym.status)}
              >
                {gym.status === 'active' ? 'Suspend Tenant' : 'Activate Tenant'}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Provision New Gym Tenant"
        description="Creates an isolated tenant database instance with fresh RLS policies"
        maxWidth="md"
      >
        <form onSubmit={handleAddGym} className="space-y-4">
          <Input
            label="Gym Name"
            required
            placeholder="e.g. IronPulse Fitness Arena"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />

          <Input
            label="Address"
            required
            placeholder="Commercial unit address"
            value={formData.address}
            onChange={e => setFormData({ ...formData, address: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City"
              value={formData.city}
              onChange={e => setFormData({ ...formData, city: e.target.value })}
            />
            <Input
              label="State"
              value={formData.state}
              onChange={e => setFormData({ ...formData, state: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Contact Phone"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Subscription Tier"
              value={formData.subscription_tier}
              onChange={e => setFormData({ ...formData, subscription_tier: e.target.value as any })}
            >
              <option value="basic">Basic Tier</option>
              <option value="pro">Pro Tier</option>
              <option value="enterprise">Enterprise Tier</option>
            </Select>

            <Select
              label="Billing Cycle"
              value={formData.subscription_cycle}
              onChange={e => setFormData({ ...formData, subscription_cycle: e.target.value as any })}
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </Select>
          </div>

          <div className="pt-3 border-t border-[#1E273A] flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Provision Gym
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
