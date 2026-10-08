import React, { useState } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  ShieldAlert,
  Sliders,
  Calendar,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, SectionHeader } from '../../workspace';

export default function AdminSystemConfig() {
  const { systemSettings, setSystemSettings, showToast } = useNivara();

  const [settingsForm, setSettingsForm] = useState(
    systemSettings || {
      academicTerm: 'Autumn 2026 (Semester 5)',
      attendanceThreshold: 75,
      passingCutoff: 50,
      feeGraceDays: 15,
      autonomousMode: true,
    }
  );

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSystemSettings(settingsForm);
    showToast('ERP system settings and global policies updated successfully ✓', 'success');
  };

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header */}
      <PageHeader
        eyebrow="Institutional Governance & Operational Policies"
        title="Global System Configuration & Policy Engine"
        description="Configure mandatory institutional policies, statutory attendance thresholds, and grading rules applied across all student and faculty workspaces."
      />

      {/* 2. Notice Callout */}
      <div className="notion-callout notion-callout-info" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <CheckCircle2 size={18} color="var(--state-success)" />
        <div style={{ flex: 1, fontSize: '0.8125rem' }}>
          <strong>Policy Synchronization Guarantee:</strong> Adjusting parameters here updates the underlying validation logic across Student, Faculty, HOD, and Principal modules synchronously.
        </div>
      </div>

      {/* 3. Settings Form */}
      <div style={{ padding: '1.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
        <SectionHeader
          title="Institutional Parameter Controls"
          subtitle="Modifications immediately propagate to all connected sessions"
        />

        <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '640px', marginTop: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Active Academic Term
            </label>
            <input
              type="text"
              value={settingsForm.academicTerm || 'Autumn 2026 (Semester 5)'}
              onChange={(e) => setSettingsForm({ ...settingsForm, academicTerm: e.target.value })}
              style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Displayed on all student timetables, exam session rosters, and faculty registers.
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Statutory Attendance Cutoff (%)
              </label>
              <input
                type="number"
                min="50"
                max="100"
                value={settingsForm.attendanceThreshold || 75}
                onChange={(e) => setSettingsForm({ ...settingsForm, attendanceThreshold: Number(e.target.value) })}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Mandatory minimum threshold. Below this cutoff triggers HOD counseling alerts.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                CIA Passing Score (%)
              </label>
              <input
                type="number"
                min="35"
                max="60"
                value={settingsForm.passingCutoff || 50}
                onChange={(e) => setSettingsForm({ ...settingsForm, passingCutoff: Number(e.target.value) })}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Minimum internal assessment score required for End-Semester eligibility.
              </span>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Fee Payment Concession Grace Period (Days)
            </label>
            <input
              type="number"
              min="0"
              max="60"
              value={settingsForm.feeGraceDays || 15}
              onChange={(e) => setSettingsForm({ ...settingsForm, feeGraceDays: Number(e.target.value) })}
              style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Permissible delay window before student portal registration restrictions apply.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '0.5rem' }}>
            <button type="submit" className="btn btn-primary">
              <Save size={13} /> Save Institutional Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
