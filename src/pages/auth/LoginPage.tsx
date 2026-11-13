import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Flame, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

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
  const { login } = useAuth();
  const [email, setEmail] = useState('aman@amansportclub.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      login(email);
      onLoginSuccess();
      setIsLoading(false);
    }, 400);
  };

  const handleQuickOwnerLogin = () => {
    login('aman@amansportclub.com');
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
            Gym Owner Management Console
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-[#101522] border border-[#232D42] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
          <div className="border-b border-[#1E283D] pb-3">
            <h2 className="text-lg font-bold text-white">Owner Portal Sign In</h2>
            <p className="text-xs text-slate-400 mt-0.5">Manage members, attendance, payments and staff</p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Owner Email Address"
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
              Sign In to Dashboard
            </Button>
          </form>

          {/* Quick Demo Owner Login */}
          <div className="pt-3 border-t border-[#1E283D]">
            <Button
              type="button"
              variant="outline"
              className="w-full text-xs py-2 text-orange-400 border-orange-500/30 hover:bg-orange-500/10"
              onClick={handleQuickOwnerLogin}
            >
              Instant 1-Click Sign In as Aman Singh (Owner)
            </Button>
          </div>
        </div>

        {/* Register Prompt */}
        <p className="text-center text-xs text-slate-400">
          New gym owner?{' '}
          <button
            onClick={onNavigateToRegister}
            className="text-orange-400 hover:text-orange-300 font-bold underline ml-1"
          >
            Create New Gym Account
          </button>
        </p>
      </div>
    </div>
  );
};
