import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Member } from '../../types/database';
import { useGym } from '../../contexts/GymContext';
import { QRCodeSVG } from 'qrcode.react';
import { formatDate } from '../../lib/utils';
import { Flame, ShieldCheck, Download, Share2, Phone, Calendar } from 'lucide-react';

interface MemberQRBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
}

export const MemberQRBadgeModal: React.FC<MemberQRBadgeModalProps> = ({ isOpen, onClose, member }) => {
  const { currentGym } = useGym();

  if (!member) return null;

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello ${member.full_name}! Here is your digital membership pass for ${currentGym.name}.\nMember Code: ${member.member_code}\nPlan: ${member.membership_plan?.name || 'Active Plan'}\nValid Until: ${formatDate(member.membership_end_date)}\nShow your QR code at the desk for check-in!`
    );
    window.open(`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Digital Membership Card"
      description="Official contactless access pass"
      maxWidth="sm"
    >
      <div className="space-y-4">
        {/* Pass Card */}
        <div className="relative rounded-2xl p-5 bg-gradient-to-b from-[#182136] via-[#101524] to-[#0A0D16] border border-orange-500/40 shadow-2xl overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-glow-orange">
                <Flame className="w-4 h-4 fill-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-white tracking-wider">{currentGym.name.toUpperCase()}</p>
                <p className="text-[9px] text-orange-400 font-semibold tracking-widest uppercase">Verified Access Pass</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
              {member.member_code}
            </span>
          </div>

          {/* Member Details */}
          <div className="py-4 flex items-center gap-4">
            <img
              src={member.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
              alt={member.full_name}
              className="w-14 h-14 rounded-xl object-cover border-2 border-orange-500/40 shadow-md shrink-0"
            />
            <div className="min-w-0">
              <h4 className="text-base font-bold text-white truncate">{member.full_name}</h4>
              <p className="text-xs text-orange-400 font-medium truncate mt-0.5">
                {member.membership_plan?.name || 'Active Membership'}
              </p>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>Exp: {formatDate(member.membership_end_date)}</span>
              </div>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="bg-white rounded-xl p-4 flex flex-col items-center justify-center shadow-lg my-2">
            <QRCodeSVG
              value={member.qr_code_token || member.member_code}
              size={150}
              level="H"
              includeMargin={false}
            />
            <p className="text-[10px] text-slate-700 font-mono font-bold mt-2 tracking-wider">
              {member.qr_code_token || member.member_code}
            </p>
          </div>

          {/* Footer note */}
          <div className="pt-2 text-center flex items-center justify-center gap-1.5 text-[10px] text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Authorized by Aman Sport club Systems</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 text-xs"
            leftIcon={<Share2 className="w-3.5 h-3.5 text-emerald-400" />}
            onClick={handleShareWhatsApp}
          >
            WhatsApp Pass
          </Button>
          <Button
            variant="primary"
            className="flex-1 text-xs"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={() => window.print()}
          >
            Print Pass
          </Button>
        </div>
      </div>
    </Modal>
  );
};
