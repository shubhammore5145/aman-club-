import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AppStorage } from '../../lib/storage';
import { useGym } from '../../contexts/GymContext';
import { QrCode, CheckCircle2, AlertTriangle, UserCheck, Search, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess?: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose, onScanSuccess }) => {
  const { currentGym } = useGym();
  const [tokenInput, setTokenInput] = useState('');
  const [result, setResult] = useState<{ success: boolean; message: string; memberName?: string } | null>(null);

  const members = AppStorage.getMembers(currentGym.id);

  const handleProcessCheckIn = (token: string) => {
    if (!token.trim()) return;

    // Search member by token or member_code
    const member = AppStorage.getMemberByQRCode(token.trim(), currentGym.id);

    if (!member) {
      setResult({
        success: false,
        message: `No active member found with QR/Code: "${token}". Please check registration.`,
      });
      return;
    }

    const checkInResult = AppStorage.checkInMember({
      gymId: currentGym.id,
      memberId: member.id,
      method: 'qr_code',
      sessionType: 'Workout Session',
    });

    if (checkInResult.success) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#f97316', '#fb923c', '#22c55e'],
      });
      setResult({
        success: true,
        message: checkInResult.message,
        memberName: member.full_name,
      });
      if (onScanSuccess) onScanSuccess();
    } else {
      setResult({
        success: false,
        message: checkInResult.message,
        memberName: member.full_name,
      });
    }
  };

  const handleReset = () => {
    setResult(null);
    setTokenInput('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        handleReset();
        onClose();
      }}
      title="High-Speed QR Code Check-In"
      description={`Instant contactless member validation for ${currentGym.name}`}
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Viewfinder UI */}
        <div className="relative aspect-video bg-[#0A0D15] rounded-xl border-2 border-dashed border-[#26334B] flex flex-col items-center justify-center overflow-hidden p-6 text-center">
          {/* Laser scanning beam */}
          <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-[0_0_15px_#f97316] animate-pulse" />

          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-3 shadow-glow-orange">
            <QrCode className="w-8 h-8 animate-pulse" />
          </div>

          <p className="text-xs font-semibold text-slate-200">Point Camera at Member QR Badge</p>
          <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
            Hold member card within frame or enter member code below
          </p>

          <div className="mt-3 flex items-center gap-2 text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-3 h-3" /> Duplicate Session Prevention Active
          </div>
        </div>

        {/* Result alert */}
        {result && (
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
              result.success
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-200'
            }`}
          >
            {result.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wider">
                {result.success ? 'Access Granted' : 'Check-In Blocked'}
              </p>
              <p className="text-sm font-semibold mt-0.5 text-white">{result.memberName}</p>
              <p className="text-xs text-slate-300 mt-1">{result.message}</p>
            </div>
            <button
              onClick={handleReset}
              className="text-xs underline text-slate-400 hover:text-white"
            >
              Scan Another
            </button>
          </div>
        )}

        {/* Manual code search/input */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-300">Enter Member Code / QR Token:</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. AMAN-001"
                value={tokenInput}
                onChange={e => setTokenInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleProcessCheckIn(tokenInput)}
                className="w-full bg-[#0D121D] border border-[#232D42] rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>
            <Button
              size="sm"
              onClick={() => handleProcessCheckIn(tokenInput)}
              disabled={!tokenInput.trim()}
            >
              Check-In
            </Button>
          </div>
        </div>

        {/* Registered Members Quick List */}
        {members.length > 0 && (
          <div className="pt-2 border-t border-[#1E273A]">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Recent Members:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {members.slice(0, 4).map(m => (
                <button
                  key={m.id}
                  onClick={() => handleProcessCheckIn(m.qr_code_token)}
                  className="flex items-center gap-2 p-2 rounded-lg bg-[#121826] border border-[#202B40] hover:border-orange-500/50 hover:bg-[#172034] text-left transition-all text-xs"
                >
                  <img
                    src={m.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                    alt={m.full_name}
                    className="w-7 h-7 rounded-full object-cover shrink-0"
                  />
                  <div className="truncate">
                    <p className="font-semibold text-slate-200 truncate">{m.full_name}</p>
                    <p className="text-[10px] text-slate-400">{m.member_code}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

