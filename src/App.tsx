import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GymProvider } from './contexts/GymContext';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Gym Owner Pages
import { GymOwnerDashboard } from './pages/gym-owner/GymOwnerDashboard';
import { MembersPage } from './pages/members/MembersPage';
import { MembershipsPage } from './pages/memberships/MembershipsPage';
import { AttendancePage } from './pages/attendance/AttendancePage';
import { PaymentsPage } from './pages/payments/PaymentsPage';
import { TrainersPage } from './pages/trainers/TrainersPage';
import { WorkoutsPage } from './pages/workouts/WorkoutsPage';
import { DietsPage } from './pages/diets/DietsPage';
import { ExpensesPage } from './pages/expenses/ExpensesPage';
import { EquipmentPage } from './pages/equipment/EquipmentPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { SettingsPage } from './pages/settings/SettingsPage';

// Super Admin Pages
import { SuperAdminDashboard } from './pages/super-admin/SuperAdminDashboard';
import { GymsManagement } from './pages/super-admin/GymsManagement';
import { SaaSSubscriptions } from './pages/super-admin/SaaSSubscriptions';

// Trainer & Member Portals
import { TrainerPortalPage } from './pages/trainer-portal/TrainerPortalPage';
import { MemberPortalPage } from './pages/member-portal/MemberPortalPage';

// Modals
import { MemberModal } from './components/members/MemberModal';
import { RecordPaymentModal } from './components/payments/RecordPaymentModal';

const AppContent: React.FC = () => {
  const { currentRole, currentUser } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('overview');
  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot-password' | 'authenticated'>('authenticated');

  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [recordPaymentModalOpen, setRecordPaymentModalOpen] = useState(false);

  // Sync default page when role switches
  useEffect(() => {
    if (currentRole === 'super_admin') {
      setCurrentPage('super-admin-overview');
    } else if (currentRole === 'trainer') {
      setCurrentPage('trainer-portal');
    } else if (currentRole === 'member') {
      setCurrentPage('member-portal');
    } else {
      setCurrentPage('overview');
    }
  }, [currentRole]);

  // Auth pages routing
  if (authView === 'login') {
    return (
      <LoginPage
        onNavigateToRegister={() => setAuthView('register')}
        onNavigateToForgotPassword={() => setAuthView('forgot-password')}
        onLoginSuccess={() => setAuthView('authenticated')}
      />
    );
  }

  if (authView === 'register') {
    return (
      <RegisterPage
        onNavigateToLogin={() => setAuthView('login')}
        onRegisterSuccess={() => setAuthView('authenticated')}
      />
    );
  }

  if (authView === 'forgot-password') {
    return (
      <ForgotPasswordPage
        onBackToLogin={() => setAuthView('login')}
      />
    );
  }

  // Render current dashboard page based on role and page selection
  const renderPage = () => {
    // Super Admin pages
    if (currentPage === 'super-admin-overview') {
      return <SuperAdminDashboard onNavigate={setCurrentPage} />;
    }
    if (currentPage === 'super-admin-gyms') {
      return <GymsManagement />;
    }
    if (currentPage === 'super-admin-subscriptions') {
      return <SaaSSubscriptions />;
    }

    // Trainer Portal
    if (currentPage === 'trainer-portal') {
      return <TrainerPortalPage onNavigate={setCurrentPage} />;
    }

    // Member Portal
    if (currentPage === 'member-portal' || currentPage === 'member-qr') {
      return <MemberPortalPage />;
    }

    // Standard / Gym Owner Pages
    switch (currentPage) {
      case 'overview':
        return (
          <GymOwnerDashboard
            onNavigate={setCurrentPage}
            onOpenAddMember={() => setAddMemberModalOpen(true)}
            onOpenRecordPayment={() => setRecordPaymentModalOpen(true)}
          />
        );
      case 'members':
        return (
          <MembersPage
            onOpenAddMemberModal={() => setAddMemberModalOpen(true)}
          />
        );
      case 'memberships':
        return <MembershipsPage />;
      case 'attendance':
        return <AttendancePage />;
      case 'payments':
        return <PaymentsPage />;
      case 'trainers':
        return <TrainersPage />;
      case 'workouts':
        return <WorkoutsPage />;
      case 'diets':
        return <DietsPage />;
      case 'expenses':
        return <ExpensesPage />;
      case 'equipment':
        return <EquipmentPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return (
          <GymOwnerDashboard
            onNavigate={setCurrentPage}
            onOpenAddMember={() => setAddMemberModalOpen(true)}
            onOpenRecordPayment={() => setRecordPaymentModalOpen(true)}
          />
        );
    }
  };

  return (
    <DashboardLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}

      {/* Global Quick Action Modals */}
      <MemberModal
        isOpen={addMemberModalOpen}
        onClose={() => setAddMemberModalOpen(false)}
        onSuccess={() => {}}
      />

      <RecordPaymentModal
        isOpen={recordPaymentModalOpen}
        onClose={() => setRecordPaymentModalOpen(false)}
        onSuccess={() => {}}
      />
    </DashboardLayout>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <GymProvider>
        <AppContent />
      </GymProvider>
    </AuthProvider>
  );
};

export default App;
