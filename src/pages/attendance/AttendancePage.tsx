import React, { useState, useEffect } from 'react';
import { useGym } from '../../contexts/GymContext';
import { AppStorage, DATA_CHANGE_EVENT } from '../../lib/storage';
import { AttendanceRecord, Member } from '../../types/database';
import { Button } from '../../components/ui/Button';
import { StatsCard } from '../../components/ui/StatsCard';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { QRScannerModal } from '../../components/attendance/QRScannerModal';
import { formatDate, formatTime } from '../../lib/utils';
import {
  QrCode,
  CheckCircle2,
  Clock,
  Users,
  Search,
  Filter,
  LogOut,
  Calendar,
  Sparkles,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const { currentGym } = useGym();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(AppStorage.getAttendance(currentGym.id));
  const [members, setMembers] = useState<Member[]>(AppStorage.getMembers(currentGym.id));

  const [scannerOpen, setScannerOpen] = useState(false);
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [manualSessionType, setManualSessionType] = useState('General Workout');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = () => {
    setAttendance(AppStorage.getAttendance(currentGym.id));
    setMembers(AppStorage.getMembers(currentGym.id));
  };

  useEffect(() => {
    loadData();
    window.addEventListener(DATA_CHANGE_EVENT, loadData);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, loadData);
  }, [currentGym.id]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(a => a.date === todayStr);
  const currentlyOnFloor = todayAttendance.filter(a => !a.check_out_time).length;

  const handleManualCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) return;

    const res = AppStorage.checkInMember({
      gymId: currentGym.id,
      memberId: selectedMemberId,
      method: 'manual',
      sessionType: manualSessionType,
    });

    if (res.success) {
      loadData();
      setManualModalOpen(false);
      setSelectedMemberId('');
    } else {
      alert(res.message);
    }
  };

  const handleCheckOut = (recordId: string) => {
    AppStorage.checkOutMember(recordId);
    loadData();
  };

  const filteredAttendance = attendance.filter(a => {
    const memberName = a.member?.full_name || '';
    const memberCode = a.member?.member_code || '';
    return (
      memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memberCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.date.includes(searchQuery)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <QrCode className="w-5 h-5 text-orange-400" />
            Live Attendance & Turnstile Log
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time biometric & QR code check-ins for {currentGym.name}.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<UserCheck className="w-3.5 h-3.5 text-slate-300" />}
            onClick={() => setManualModalOpen(true)}
          >
            Manual Desk Check-In
          </Button>
          <Button
            size="sm"
            variant="primary"
            leftIcon={<QrCode className="w-3.5 h-3.5" />}
            onClick={() => setScannerOpen(true)}
          >
            Launch QR Scanner
          </Button>
        </div>
      </div>

      {/* Live Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Today's Check-Ins"
          value={todayAttendance.length}
          change="Logged visits"
          trend="up"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          description="Total sessions today"
        />
        <StatsCard
          title="Currently on Floor"
          value={currentlyOnFloor}
          change="Real-time occupancy"
          trend="neutral"
          icon={<Users className="w-4 h-4 text-orange-400" />}
          description="Active workout athletes"
        />
        <StatsCard
          title="Peak Session"
          value="Evening (6-9 PM)"
          change="72% volume"
          trend="up"
          icon={<Clock className="w-4 h-4 text-sky-400" />}
          description="Heaviest floor usage"
        />
        <StatsCard
          title="Duplicate Gate"
          value="100% Protected"
          change="Active Guard"
          trend="up"
          icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
          description="One session per day rule"
        />
      </div>

      {/* Search and Table */}
      <div className="bg-[#101522] border border-[#232D42] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#1E283D] flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search attendance by member, date..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#0D121D] border border-[#232D42] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Turnstile sync active</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1E273A] bg-[#0E1320] text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Session Date</th>
                <th className="py-3 px-4">Check-In Time</th>
                <th className="py-3 px-4">Check-Out Time</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Session Type</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2234]">
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    No attendance records logged yet.
                  </td>
                </tr>
              ) : (
                filteredAttendance.map(record => (
                  <tr key={record.id} className="hover:bg-[#131929] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={record.member?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                          alt={record.member?.full_name || 'Member'}
                          className="w-7 h-7 rounded-full object-cover border border-[#232F48]"
                        />
                        <div>
                          <p className="font-semibold text-slate-100">{record.member?.full_name || 'Member'}</p>
                          <p className="text-[10px] text-slate-500">{record.member?.member_code || 'AMAN-000'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-300">
                      {formatDate(record.date)}
                    </td>

                    <td className="py-3 px-4 text-emerald-400 font-mono font-semibold">
                      {formatTime(record.check_in_time)}
                    </td>

                    <td className="py-3 px-4 text-slate-400 font-mono">
                      {record.check_out_time ? (
                        formatTime(record.check_out_time)
                      ) : (
                        <button
                          onClick={() => handleCheckOut(record.id)}
                          className="text-[11px] text-orange-400 hover:text-orange-300 font-medium underline flex items-center gap-1"
                        >
                          <LogOut className="w-3 h-3" /> Log Out
                        </button>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <Badge
                        variant={record.method === 'qr_code' ? 'orange' : 'neutral'}
                        size="sm"
                      >
                        {record.method === 'qr_code' ? 'QR Code' : 'Desk Manual'}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      {record.session_type || 'Workout'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {record.check_out_time ? (
                        <span className="text-[11px] text-slate-500">Completed</span>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-400 flex items-center justify-end gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          On Floor
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Check-in Modal */}
      <Modal
        isOpen={manualModalOpen}
        onClose={() => setManualModalOpen(false)}
        title="Manual Desk Check-In"
        description="Verify and record member attendance without QR badge"
        maxWidth="md"
      >
        <form onSubmit={handleManualCheckIn} className="space-y-4">
          <Select
            label="Select Member"
            required
            value={selectedMemberId}
            onChange={e => setSelectedMemberId(e.target.value)}
          >
            <option value="">-- Choose Member --</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>
                {m.full_name} ({m.member_code}) - {m.status.toUpperCase()}
              </option>
            ))}
          </Select>

          <Select
            label="Session Type"
            value={manualSessionType}
            onChange={e => setManualSessionType(e.target.value)}
          >
            <option value="General Workout">General Workout</option>
            <option value="Personal Training Session">Personal Training Session</option>
            <option value="Cardio & Mobility">Cardio & Mobility</option>
            <option value="Steam & Sauna Recovery">Steam & Sauna Recovery</option>
          </Select>

          <div className="pt-3 border-t border-[#1E273A] flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setManualModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={!selectedMemberId}>
              Confirm Check-In
            </Button>
          </div>
        </form>
      </Modal>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanSuccess={loadData}
      />
    </div>
  );
};
