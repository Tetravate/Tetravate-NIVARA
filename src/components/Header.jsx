import React, { useState } from 'react';
import {
  Search,
  Moon,
  Sun,
  Bell,
  Wifi,
  WifiOff,
  ChevronDown,
  Check,
  User,
  Settings,
  LogOut,
  Clock,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { useNivara } from '../context/NivaraContext';
import { INSTITUTIONAL_ACCOUNTS } from '../services/authService';

export default function Header({ onOpenCaseStudy }) {
  const {
    currentRole,
    switchRole,
    currentUser,
    logout,
    resetDemoData,
    ROLES,
    theme,
    toggleTheme,
    isOffline,
    setIsOffline,
    setCommandPaletteOpen,
    setNotificationsOpen,
    setAuditLogOpen,
    setProfileModalOpen,
    setSettingsModalOpen,
    notifications,
    showToast,
  } = useNivara();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  // Unread notifications count contextual to role
  const unreadCount = notifications.filter(
    (n) => n.unread && (n.recipientRole === currentRole || n.recipientRole === 'all')
  ).length;

  const handleSignOut = async () => {
    setRoleDropdownOpen(false);
    await logout();
  };

  return (
    <header className="top-header" role="banner">
      {/* Brand logo & Nivara identity */}
      <div className="brand-block">
        <div className="brand-icon" aria-hidden="true">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
        </div>
        <div>
          <span className="brand-name">NIVARA</span>
        </div>
        <span
          className="brand-badge"
          title="Isolated portfolio demo environment with fictional academic data"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--state-success, #10B981)', display: 'inline-block' }} />
          Portfolio Demo Mode
        </span>
      </div>

      {/* Omnibar Search Trigger */}
      <button
        type="button"
        className="search-trigger-btn"
        onClick={() => setCommandPaletteOpen(true)}
        aria-label="Open search palette (Control + K)"
      >
        <Search size={14} />
        <span className="search-trigger-text">Search subjects, students, rooms...</span>
        <span className="search-kbd">⌘K</span>
      </button>

      {/* Controls & Role Selector */}
      <div className="header-actions">
        {/* Reset Demo Data Action Button */}
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Reset all demo data back to the pristine baseline? Any simulated changes from your session will be restored.')) {
              resetDemoData();
            }
          }}
          className="btn btn-secondary btn-sm"
          title="Restore original fictional sample dataset"
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.6rem', fontSize: '0.75rem', height: '32px' }}
          id="btn-reset-demo"
        >
          <RotateCcw size={13} color="var(--brand-blue)" />
          <span style={{ fontWeight: 600 }}>Reset Demo</span>
        </button>

        {/* Verifiable Synchronized Audit Trail button */}
        <button
          type="button"
          className="btn btn-secondary btn-sm btn-audit-nav"
          onClick={() => setAuditLogOpen(true)}
          title="Inspect real-time synchronized cross-role activity logs"
          style={{ display: 'none', gap: '0.35rem' }}
          id="btn-audit-desktop"
        >
          <Clock size={13} color="var(--brand-blue)" />
          <span>Audit Trail</span>
        </button>

        {/* Offline Simulation Toggle */}
        <button
          type="button"
          onClick={() => {
            const nextOffline = !isOffline;
            setIsOffline(nextOffline);
            showToast(
              nextOffline
                ? 'Offline mode active: Cached data displayed'
                : 'Back online: Reconnected to university data grid',
              nextOffline ? 'warning' : 'success'
            );
          }}
          className="btn btn-ghost btn-sm"
          title={isOffline ? 'Switch to Online mode' : 'Simulate low-connectivity offline mode'}
          aria-label="Toggle network state"
          style={{ padding: '0.4rem', minHeight: '34px', minWidth: '34px' }}
        >
          {isOffline ? <WifiOff size={15} color="var(--state-warning)" /> : <Wifi size={15} color="var(--text-muted)" />}
        </button>

        {/* Dark / Light Mode Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="btn btn-ghost btn-sm"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle theme"
          style={{ padding: '0.4rem', minHeight: '34px', minWidth: '34px' }}
        >
          {theme === 'dark' ? <Sun size={15} color="#FDB022" /> : <Moon size={15} color="var(--text-secondary)" />}
        </button>

        {/* Notifications Drawer */}
        <button
          type="button"
          onClick={() => setNotificationsOpen(true)}
          className="btn btn-ghost btn-sm"
          title="Notifications"
          aria-label="Open notifications"
          style={{ position: 'relative', padding: '0.4rem', minHeight: '34px', minWidth: '34px' }}
        >
          <Bell size={15} color="var(--text-secondary)" />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: 'var(--state-urgent)',
              }}
            />
          )}
        </button>

        {/* Profile & Role Switcher Menu */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="role-pill-trigger"
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            aria-expanded={roleDropdownOpen}
            aria-haspopup="true"
            aria-label="Open user profile and perspective menu"
          >
            <img src={currentUser?.avatar || ''} alt="" className="role-avatar" />
            <div className="role-pill-info" style={{ textAlign: 'left', lineHeight: 1.15 }}>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '140px',
                }}
                title={currentUser?.userName || 'User'}
              >
                {currentUser?.userName || 'User'}
              </div>
              <div
                style={{
                  fontSize: '0.625rem',
                  color: 'var(--brand-blue)',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '140px',
                }}
              >
                {currentUser?.label || 'Student'}
              </div>
            </div>
            <ChevronDown size={13} color="var(--text-muted)" />
          </button>

          {roleDropdownOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 60 }}
                onClick={() => setRoleDropdownOpen(false)}
              />
              <div
                className="role-dropdown-menu"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  right: 0,
                  width: '300px',
                  maxWidth: 'calc(100vw - 1.5rem)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-elevated)',
                  padding: '0.5rem',
                  zIndex: 70,
                }}
              >
                {/* User Identity Card */}
                <div style={{
                  padding: '0.65rem 0.75rem',
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.5rem',
                }}>
                  <img
                    src={currentUser?.avatar || ''}
                    alt=""
                    style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--border-subtle)' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {currentUser?.userName || 'User'}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {currentUser?.email || ''}
                    </div>
                    <span className="badge badge-info" style={{ fontSize: '0.625rem', marginTop: '0.2rem' }}>
                      {currentUser?.title || ''}
                    </span>
                  </div>
                </div>

                {/* Profile Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', marginBottom: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setRoleDropdownOpen(false);
                      setProfileModalOpen(true);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.45rem 0.65rem',
                      borderRadius: 'var(--radius-xs)',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-primary)',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <User size={14} color="var(--brand-blue)" />
                    <span>View Profile & Credentials</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRoleDropdownOpen(false);
                      setSettingsModalOpen(true);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.45rem 0.65rem',
                      borderRadius: 'var(--radius-xs)',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-primary)',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <Settings size={14} color="var(--text-muted)" />
                    <span>Account Settings & Preferences</span>
                  </button>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '0.35rem 0' }} />

                {/* 8-Role Perspective Switcher */}
                <div style={{ marginBottom: '0.4rem' }}>
                  <div style={{
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'var(--text-tertiary)',
                    padding: '0.35rem 0.65rem 0.25rem',
                  }}>
                    Switch Perspective (8 Roles)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', maxHeight: '180px', overflowY: 'auto' }}>
                    {INSTITUTIONAL_ACCOUNTS.map((acc) => {
                      const isCurrent = currentRole === acc.role;
                      return (
                        <button
                          key={acc.role}
                          type="button"
                          onClick={() => {
                            switchRole(acc.role);
                            setRoleDropdownOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.35rem 0.65rem',
                            borderRadius: 'var(--radius-xs)',
                            background: isCurrent ? 'var(--bg-subtle-2)' : 'transparent',
                            border: 'none',
                            color: isCurrent ? 'var(--text-primary)' : 'var(--text-secondary)',
                            fontSize: '0.75rem',
                            fontWeight: isCurrent ? 700 : 500,
                            cursor: 'pointer',
                            textAlign: 'left',
                            width: '100%',
                          }}
                        >
                          <img
                            src={acc.avatar}
                            alt=""
                            style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {acc.userName} ({acc.role.toUpperCase()})
                          </span>
                          {isCurrent && <Check size={12} color="var(--brand-primary)" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '0.35rem 0' }} />

                {/* Reset Demo Data Action */}
                <button
                  type="button"
                  onClick={() => {
                    setRoleDropdownOpen(false);
                    if (window.confirm('Reset all demo data back to the original baseline? Any simulated changes from your session will be restored.')) {
                      resetDemoData();
                    }
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.45rem 0.65rem',
                    borderRadius: 'var(--radius-xs)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--brand-blue)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    marginBottom: '0.2rem',
                  }}
                  title="Restore initial fictional dataset"
                >
                  <RotateCcw size={14} />
                  <span>Reset Demo Data</span>
                </button>

                {/* Sign Out Action */}
                <button
                  type="button"
                  onClick={handleSignOut}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.45rem 0.65rem',
                    borderRadius: 'var(--radius-xs)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--state-urgent)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <LogOut size={14} />
                  <span>Sign Out of Session</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

    </header>
  );
}
