import React, { useState, useEffect } from 'react';
import { useGym } from '../../contexts/GymContext';
import { AppStorage, DATA_CHANGE_EVENT } from '../../lib/storage';
import { Member } from '../../types/database';
import { MemberModal } from '../../components/members/MemberModal';
import { MemberProfileDrawer } from '../../components/members/MemberProfileDrawer';
import { MemberQRBadgeModal } from '../../components/attendance/MemberQRBadgeModal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { formatDate, getDaysRemaining } from '../../lib/utils';
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  QrCode,
  Eye,
  Edit2,
  Trash2,
  Share2,
  Phone,
  UserCheck
} from 'lucide-react';

interface MembersPageProps {
  onOpenAddMemberModal: () => void;
}

export const MembersPage: React.FC<MembersPageProps> = () => {
  const { currentGym } = useGym();
  const [members, setMembers] = useState<Member[]>(AppStorage.getMembers(currentGym.id));
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired'>('all');

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [qrPassMember, setQrPassMember] = useState<Member | null>(null);

  const loadData = () => {
    setMembers(AppStorage.getMembers(currentGym.id));
  };

  useEffect(() => {
    loadData();
    window.addEventListener(DATA_CHANGE_EVENT, loadData);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, loadData);
  }, [currentGym.id]);

  const filteredMembers = members.filter(m => {
    const matchesSearch =
      m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.member_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery);

    const matchesStatus =
      statusFilter === 'all' ? true : m.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDeleteMember = (memberId: string) => {
    if (confirm('Are you sure you want to delete this member? All associated attendance and payments will remain in audit.')) {
      AppStorage.deleteMember(memberId);
      loadData();
    }
  };

  const handleExportCSV = () => {
    const headers = ['Member Code', 'Full Name', 'Phone', 'Email', 'Plan', 'Start Date', 'End Date', 'Status', 'Trainer'];
    const rows = filteredMembers.map(m => [
      m.member_code,
      `"${m.full_name}"`,
      m.phone,
      m.email || '',
      `"${m.membership_plan?.name || ''}"`,
      m.membership_start_date,
      m.membership_end_date,
      m.status,
      `"${m.assigned_trainer?.full_name || 'None'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentGym.slug}_members_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleWhatsAppContact = (m: Member) => {
    const text = encodeURIComponent(`Hi ${m.full_name}! Message from ${currentGym.name} desk.`);
    window.open(`https://wa.me/${m.phone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-400" />
            Member Directory ({filteredMembers.length})
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage registrations, subscriptions, personal training, and digital badges.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5 text-slate-400" />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => {
              setMemberToEdit(null);
              setAddModalOpen(true);
            }}
          >
            Add Member
          </Button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#101522] border border-[#232D42] p-3 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, phone, code..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#0D121D] border border-[#232D42] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          <div className="flex rounded-lg bg-[#0D121D] p-1 border border-[#232D42]">
            {(['all', 'active', 'expired'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 text-xs rounded-md font-medium uppercase tracking-wider transition-colors ${
                  statusFilter === s
                    ? 'bg-orange-500 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-[#101522] border border-[#232D42] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1E273A] bg-[#0E1320] text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Athlete / Member</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Plan & Validity</th>
                <th className="py-3.5 px-4">Trainer</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2234]">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                    No members match your criteria. Click "Add Member" to register.
                  </td>
                </tr>
              ) : (
                filteredMembers.map(m => {
                  const days = getDaysRemaining(m.membership_end_date);
                  return (
                    <tr key={m.id} className="hover:bg-[#131929] transition-colors">
                      {/* Name & Photo */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={m.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                            alt={m.full_name}
                            className="w-9 h-9 rounded-full object-cover border border-[#2A3756]"
                          />
                          <div>
                            <p className="font-semibold text-slate-100">{m.full_name}</p>
                            <span className="font-mono text-[10px] text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20">
                              {m.member_code}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-4">
                        <p className="text-slate-200 font-medium">{m.phone}</p>
                        <p className="text-slate-500 text-[11px] truncate max-w-[140px]">{m.email || 'N/A'}</p>
                      </td>

                      {/* Plan */}
                      <td className="py-3 px-4">
                        <p className="text-slate-200 font-medium">{m.membership_plan?.name || 'General'}</p>
                        <p className="text-[11px] text-slate-400">
                          Exp: {formatDate(m.membership_end_date)}
                          <span className={`ml-1 font-semibold ${days <= 7 ? 'text-amber-400' : 'text-slate-500'}`}>
                            ({days >= 0 ? `${days}d left` : 'Expired'})
                          </span>
                        </p>
                      </td>

                      {/* Trainer */}
                      <td className="py-3 px-4">
                        {m.assigned_trainer ? (
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <UserCheck className="w-3.5 h-3.5 text-orange-400" />
                            <span>{m.assigned_trainer.full_name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Self-Guided</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <Badge
                          variant={m.status === 'active' ? 'success' : 'danger'}
                          size="sm"
                        >
                          {m.status}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            title="Digital QR Card"
                            onClick={() => setQrPassMember(m)}
                            className="p-1.5 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 rounded-md transition-colors"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <button
                            title="View Full Profile"
                            onClick={() => setSelectedMember(m)}
                            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-[#1A2234] rounded-md transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            title="WhatsApp Member"
                            onClick={() => handleWhatsAppContact(m)}
                            className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-md transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button
                            title="Edit Member"
                            onClick={() => {
                              setMemberToEdit(m);
                              setAddModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-[#1A2234] rounded-md transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            title="Delete Member"
                            onClick={() => handleDeleteMember(m.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Member Modal */}
      <MemberModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        memberToEdit={memberToEdit}
        onSuccess={loadData}
      />

      {/* Member Profile Drawer */}
      <MemberProfileDrawer
        isOpen={Boolean(selectedMember)}
        onClose={() => setSelectedMember(null)}
        member={selectedMember}
        onOpenQRPass={() => {
          setQrPassMember(selectedMember);
        }}
      />

      {/* Member QR Pass Modal */}
      <MemberQRBadgeModal
        isOpen={Boolean(qrPassMember)}
        onClose={() => setQrPassMember(null)}
        member={qrPassMember}
      />
    </div>
  );
};

