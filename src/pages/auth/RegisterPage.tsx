import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Flame, Building2, User, Mail, Phone, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

interface RegisterPageProps {
  onNavigateToLogin: () => void;
  onRegisterSuccess: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onNavigateToLogin,
  onRegisterSuccess,
}) => {
  const { registerGymOwner } = useAuth();

  const [formData, setFormData] = useState({
    gymName: '',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    address: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.gymName || !formData.ownerName || !formData.email) return;

    setIsLoading(true);
    setTimeout(() => {
      registerGymOwner({
        gymName: formData.gymName,
        ownerName: formData.ownerName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      });
      setIsLoading(false);
      onRegisterSuccess();
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#080B11] flex flex-col justify-center items-center p-4 relative overflow-hidden py-10">
      <div className="w-full max-w-lg space-y-6 relative z-10">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-400 flex items-center justify-center text-white shadow-glow-orange">
            <Flame className="w-7 h-7 fill-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Register Your Gym</h1>
          <p className="text-xs text-orange-400 font-semibold tracking-wider uppercase">
            Start Your Multi-Tenant SaaS Experience
          </p>
        </div>

        {/* Box */}
        <div className="bg-[#101522] border border-[#232D42] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="Gym / Fitness Club Brand Name"
              required
              placeholder="e.g. Aman Sport club (New Branch)"
              leftIcon={<Building2 className="w-4 h-4" />}
              value={formData.gymName}
              onChange={e => setFormData({ ...formData, gymName: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Gym Owner Full Name"
                required
                placeholder="Aman Singh"
                leftIcon={<User className="w-4 h-4" />}
                value={formData.ownerName}
                onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
              />
              <Input
                label="Mobile Phone"
                required
                placeholder="+91 98765 43210"
                leftIcon={<Phone className="w-4 h-4" />}
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <Input
              label="Business Email"
              type="email"
              required
              placeholder="contact@amansportclub.com"
              leftIcon={<Mail className="w-4 h-4" />}
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />

            <Input
              label="Facility Address / Location"
              placeholder="Sector 14, Civil Lines, Gurugram"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
            />

            <Input
              label="Admin Account Password"
              type="password"
              required
              placeholder="••••••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />

            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Includes 14-day Pro Plan trial with complete multi-tenant isolation.</span>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full text-sm py-2.5 mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create Gym Tenant & Launch
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <button
            onClick={onNavigateToLogin}
            className="text-orange-400 hover:text-orange-300 font-bold underline ml-1"
          >
            Sign In Here
          </button>
        </p>
      </div>
    </div>
  );
};
