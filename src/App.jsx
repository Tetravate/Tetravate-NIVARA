import React, { useState, Suspense, lazy } from 'react';
import { NivaraProvider, useNivara } from './context/NivaraContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MobileBottomNav from './components/MobileBottomNav';
import CommandPalette from './components/CommandPalette';
import NotificationsDrawer from './components/NotificationsDrawer';
import AuditLogDrawer from './components/AuditLogDrawer';
import PortfolioCaseStudyModal from './components/PortfolioCaseStudyModal';
import ProfileModal from './components/ProfileModal';
import AccountSettingsModal from './components/AccountSettingsModal';
import LoginPage from './components/auth/LoginPage';
import Toast from './components/Toast';
import { WifiOff } from 'lucide-react';
import './styles/app.css';

// Lazy-loaded role modules for optimized code-splitting & performance
const StudentDashboard = lazy(() => import('./components/roles/StudentDashboard'));
const FacultyDashboard = lazy(() => import('./components/roles/FacultyDashboard'));
const HODDashboard = lazy(() => import('./components/roles/HODDashboard'));
const PrincipalDashboard = lazy(() => import('./components/roles/PrincipalDashboard'));
const AdminDashboard = lazy(() => import('./components/roles/AdminDashboard'));
const ExamCellDashboard = lazy(() => import('./components/roles/ExamCellDashboard'));
const FinanceDashboard = lazy(() => import('./components/roles/FinanceDashboard'));
const PlacementDashboard = lazy(() => import('./components/roles/PlacementDashboard'));

function DashboardFallback() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', opacity: 0.7 }}>
      <div style={{ height: '24px', width: '200px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)' }} />
      <div style={{ height: '42px', width: '320px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)' }} />
      <div style={{ height: '120px', width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }} />
      <div style={{ height: '180px', width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }} />
    </div>
  );
}

function MainAppShell() {
  const {
    currentRole,
    isOffline,
    toasts,
    dismissToast,
    profileModalOpen,
    settingsModalOpen,
  } = useNivara();

  const [caseStudyOpen, setCaseStudyOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Desktop Navigation Sidebar (Adapts across all 8 roles) */}
      <Sidebar onOpenCaseStudy={() => setCaseStudyOpen(true)} />

      <div className="main-wrapper">
        {/* Top Header with 8-Role Switcher & Omnibar */}
        <Header onOpenCaseStudy={() => setCaseStudyOpen(true)} />

        {/* Offline Simulation Banner */}
        {isOffline && (
          <div className="offline-banner" role="alert">
            <WifiOff size={14} />
            <span>Nivara Offline Mode: Synchronized local database cache active.</span>
          </div>
        )}

        {/* Dynamic Role-Based Content Area with Code-Splitting Suspense */}
        <main className="content-container">
          <Suspense fallback={<DashboardFallback />}>
            {currentRole === 'student' && <StudentDashboard />}
            {currentRole === 'faculty' && <FacultyDashboard />}
            {currentRole === 'hod' && <HODDashboard />}
            {currentRole === 'principal' && <PrincipalDashboard />}
            {currentRole === 'admin' && <AdminDashboard />}
            {currentRole === 'exam_cell' && <ExamCellDashboard />}
            {currentRole === 'finance' && <FinanceDashboard />}
            {currentRole === 'placement' && <PlacementDashboard />}
          </Suspense>
        </main>
      </div>

      {/* Mobile Fluid Bottom Navigation */}
      <MobileBottomNav onOpenCaseStudy={() => setCaseStudyOpen(true)} />

      {/* Omnibar Command Palette (Ctrl + K) */}
      <CommandPalette />

      {/* Cross-Role Shared Notifications Drawer */}
      <NotificationsDrawer />

      {/* Synchronized Audit Trail Drawer */}
      <AuditLogDrawer />

      {/* Architectural Case Study Modal */}
      <PortfolioCaseStudyModal
        isOpen={caseStudyOpen}
        onClose={() => setCaseStudyOpen(false)}
      />

      {/* Global User Profile Modal */}
      {profileModalOpen && <ProfileModal />}

      {/* Global Account Preferences & Settings Modal */}
      {settingsModalOpen && <AccountSettingsModal />}

      {/* Floating System Toast Queue */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

function AppContent() {
  const { authenticatedSession, login, toasts, dismissToast } = useNivara();

  if (!authenticatedSession) {
    return (
      <div className="login-root">
        <LoginPage onLoginSuccess={login} />
        <Toast toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  return <MainAppShell />;
}

export default function App() {
  return (
    <NivaraProvider>
      <AppContent />
    </NivaraProvider>
  );
}
