import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
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

// Modals
import { MemberModal } from './components/members/MemberModal';
import { RecordPaymentModal } from './components/payments/RecordPaymentModal';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('overview');
  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot-password' | 'authenticated'>('authenticated');

  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [recordPaymentModalOpen, setRecordPaymentModalOpen] = useState(false);

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

  // Render Gym Owner pages
  const renderPage = () => {
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
