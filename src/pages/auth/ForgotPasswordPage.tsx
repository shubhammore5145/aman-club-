import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Flame, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface ForgotPasswordPageProps {
  onBackToLogin: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#080B11] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-400 flex items-center justify-center text-white shadow-glow-orange">
            <Flame className="w-7 h-7 fill-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Password Reset</h1>
          <p className="text-xs text-orange-400 font-semibold tracking-wider uppercase">
            Aman Sport club SaaS Recovery
          </p>
        </div>

        <div className="bg-[#101522] border border-[#232D42] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
          {submitted ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Reset Link Dispatched</h3>
              <p className="text-xs text-slate-400">
                A secure password reset authorization link has been routed to <strong>{email}</strong>.
              </p>
              <Button variant="outline" className="w-full text-xs" onClick={onBackToLogin}>
                Return to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-slate-400">
                Enter your registered admin or staff email address. We will transmit an encrypted recovery link.
              </p>
              <Input
                label="Registered Email"
                type="email"
                required
                placeholder="name@amansportclub.com"
                leftIcon={<Mail className="w-4 h-4" />}
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <Button type="submit" variant="primary" className="w-full text-sm">
                Send Reset Link
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-xs"
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                onClick={onBackToLogin}
              >
                Back to Sign In
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

