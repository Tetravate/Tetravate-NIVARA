import React, { useState } from 'react';
import { Settings, Moon, Sun, Check, X } from 'lucide-react';
import { useNivara } from '../context/NivaraContext';

export default function AccountSettingsModal() {
  const {
    settingsModalOpen,
    setSettingsModalOpen,
    theme,
    toggleTheme,
    isOffline,
    setIsOffline,
    showToast,
  } = useNivara();

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [syncFreq, setSyncFreq] = useState('30');

  React.useEffect(() => {
    if (!settingsModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSettingsModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settingsModalOpen, setSettingsModalOpen]);

  if (!settingsModalOpen) return null;

  const handleSave = () => {
    setSettingsModalOpen(false);
    showToast('Account preferences and sync configuration saved ✓', 'success');
  };

  return (
    <div
      className="modal-backdrop"
      onClick={() => setSettingsModalOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div
        className="modal-sheet"
        style={{
          maxWidth: '520px',
          padding: '1.5rem',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings size={16} color="var(--brand-blue)" />
            <h3 id="settings-modal-title" style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Account Settings & Preferences
            </h3>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setSettingsModalOpen(false)}
            style={{ padding: '0.3rem' }}
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          {/* Appearance Section */}
          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
              Display & Appearance
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)', marginBottom: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Theme Mode ({theme === 'dark' ? 'Dark' : 'Light'})
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Switch between high-contrast dark palette and paper light
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={toggleTheme}
                style={{ minWidth: '85px' }}
              >
                {theme === 'dark' ? <><Sun size={13} color="#FDB022" /> Light</> : <><Moon size={13} /> Dark</>}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)' }}>
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Simulated Low-Bandwidth / Offline Mode
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Operate entirely from local storage without remote network
                </div>
              </div>
              <button
                type="button"
                className={`btn btn-sm ${isOffline ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setIsOffline(!isOffline)}
                style={{ minWidth: '85px' }}
              >
                {isOffline ? 'Active' : 'Disabled'}
              </button>
            </div>
          </div>

          {/* Notifications Section */}
          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
              Notifications & Dispatch Channels
            </div>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.25rem', cursor: 'pointer' }}>
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Real-Time In-App Alert Banners
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Show floating toasts for attendance updates, assignments, and fees
                </div>
              </div>
              <input
                type="checkbox"
                checked={pushAlerts}
                onChange={(e) => setPushAlerts(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.25rem', cursor: 'pointer' }}>
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Daily Digest to Registered Email
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Consolidated PDF summary of daily schedule and deadlines
                </div>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
            </label>
          </div>

          {/* Sync Frequency */}
          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
              Background Mesh Synchronization
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <label htmlFor="sync-frequency-select" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Heartbeat Interval:</label>
              <select
                id="sync-frequency-select"
                value={syncFreq}
                onChange={(e) => setSyncFreq(e.target.value)}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-canvas)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8125rem',
                }}
              >
                <option value="15">Every 15 seconds (High priority)</option>
                <option value="30">Every 30 seconds (Standard)</option>
                <option value="60">Every 60 seconds (Battery saving)</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setSettingsModalOpen(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleSave}
          >
            <Check size={12} /> Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
