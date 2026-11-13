import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { QRScannerModal } from '../attendance/QRScannerModal';
import { MemberQRBadgeModal } from '../attendance/MemberQRBadgeModal';
import { AppStorage } from '../../lib/storage';

interface DashboardLayoutProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentPage,
  onNavigate,
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [memberBadgeOpen, setMemberBadgeOpen] = useState(false);

  const members = AppStorage.getMembers();
  const currentMember = members[0] || null;

  return (
    <div className="min-h-screen bg-[#080B11] text-slate-100 flex flex-col font-sans">
      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onNavigate={onNavigate}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
          <Navbar
            onOpenSidebar={() => setSidebarOpen(true)}
            onOpenQRScanner={() => setQrScannerOpen(true)}
          />

          <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>

      {/* Global QR Code Scanner Modal */}
      <QRScannerModal
        isOpen={qrScannerOpen}
        onClose={() => setQrScannerOpen(false)}
      />

      {/* Global Member QR Badge Modal */}
      <MemberQRBadgeModal
        isOpen={memberBadgeOpen}
        onClose={() => setMemberBadgeOpen(false)}
        member={currentMember}
      />
    </div>
  );
};
