import React from 'react';
import { Shield, Clock, X, CheckCircle, ArrowRight } from 'lucide-react';
import { useNivara } from '../context/NivaraContext';

export default function AuditLogDrawer() {
  const { auditLogOpen, setAuditLogOpen, auditLogs } = useNivara();

  React.useEffect(() => {
    if (!auditLogOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setAuditLogOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [auditLogOpen, setAuditLogOpen]);

  if (!auditLogOpen) return null;

  return (
    <div className="modal-backdrop" onClick={() => setAuditLogOpen(false)} role="dialog" aria-modal="true" aria-label="System Activity & Audit Log">
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={18} color="var(--brand-blue)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Nivara Synchronized Audit Trail
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setAuditLogOpen(false)}
            className="btn btn-ghost btn-sm"
            style={{ padding: '4px', minHeight: '32px' }}
            aria-label="Close Audit Trail"
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '75vh', overflowY: 'auto' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Every action performed in Nivara synchronizes across relevant roles. Here is the verifiable activity timeline:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {auditLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-neutral" style={{ fontSize: '0.625rem' }}>
                      {log.actorRole}
                    </span>
                    <strong style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                      {log.actorName}
                    </strong>
                  </div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {log.timestamp}
                  </span>
                </div>

                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {log.action}
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {log.details}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
