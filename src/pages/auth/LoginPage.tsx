import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Flame, Lock, Mail, ArrowRight, ShieldCheck, Dumbbell, User } from 'lucide-react';
import { UserRole } from '../../types/database';

interface LoginPageProps {
  onNavigateToRegister: () => void;
  onNavigateToForgotPassword: () => void;
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateToRegister,
  onNavigateToForgotPassword,
  onLoginSuccess,
}) => {
  const { login, switchRole } = useAuth();
  const [email, setEmail] = useState('aman@amansportclub.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      const success = login(email);
      if (success) {
        onLoginSuccess();
      } else {
        // Fallback default
        setError('Invalid credentials. You can use the quick demo logins below!');
      }
      setIsLoading(false);
    }, 400);
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    switchRole(role);
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-[#080B11] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-400 flex items-center justify-center text-white shadow-glow-orange">
            <Flame className="w-8 h-8 fill-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">AMAN SPORT CLUB</h1>
          <p className="text-xs text-orange-400 font-semibold tracking-wider uppercase">
            Premium Gym Management SaaS Platform
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-[#101522] border border-[#232D42] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
          <div className="border-b border-[#1E283D] pb-3">
            <h2 className="text-lg font-bold text-white">Sign In to Dashboard</h2>
            <p className="text-xs text-slate-400 mt-0.5">Secure role-based multi-tenant authentication</p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              required
              leftIcon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={e => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              required
              leftIcon={<Lock className="w-4 h-4" />}
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded bg-[#0D121D] border-[#232D42] text-orange-500" />
                <span>Remember session</span>
              </label>
              <button
                type="button"
                onClick={onNavigateToForgotPassword}
                className="text-orange-400 hover:text-orange-300 font-medium"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full text-sm py-2.5"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Role Logins */}
          <div className="pt-4 border-t border-[#1E283D] space-y-2.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
              Quick 1-Click Demo Logins:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('gym_owner')}
                className="p-2 rounded-lg bg-[#141B2A] border border-[#232F48] hover:border-orange-500/50 text-slate-200 hover:text-white transition-all text-left"
              >
                <p className="font-bold text-orange-400">Gym Owner</p>
                <p className="text-[10px] text-slate-500">Aman Sport club</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('super_admin')}
                className="p-2 rounded-lg bg-[#141B2A] border border-[#232F48] hover:border-orange-500/50 text-slate-200 hover:text-white transition-all text-left"
              >
                <p className="font-bold text-sky-400">Super Admin</p>
                <p className="text-[10px] text-slate-500">All Gym Tenants</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('trainer')}
                className="p-2 rounded-lg bg-[#141B2A] border border-[#232F48] hover:border-orange-500/50 text-slate-200 hover:text-white transition-all text-left"
              >
                <p className="font-bold text-emerald-400">Head Trainer</p>
                <p className="text-[10px] text-slate-500">Vikram Sharma</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('member')}
                className="p-2 rounded-lg bg-[#141B2A] border border-[#232F48] hover:border-orange-500/50 text-slate-200 hover:text-white transition-all text-left"
              >
                <p className="font-bold text-purple-400">Athlete Member</p>
                <p className="text-[10px] text-slate-500">Rahul Verma</p>
              </button>
            </div>
          </div>
        </div>

        {/* Register Prompt */}
        <p className="text-center text-xs text-slate-400">
          Want to register your gym?{' '}
          <button
            onClick={onNavigateToRegister}
            className="text-orange-400 hover:text-orange-300 font-bold underline ml-1"
          >
            Start 14-Day Free SaaS Trial
          </button>
        </p>
      </div>
    </div>
  );
};
