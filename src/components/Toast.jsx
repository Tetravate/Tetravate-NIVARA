import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" role="region" aria-live="polite" aria-label="Notifications">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast" role="status">
          {toast.type === 'success' && <CheckCircle2 size={18} color="#4ADE80" />}
          {toast.type === 'warning' && <AlertCircle size={18} color="#FBBF24" />}
          {toast.type === 'info' && <Info size={18} color="#38BDF8" />}
          <span>{toast.message}</span>
          <button
            onClick={() => onDismiss(toast.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              display: 'flex',
              padding: '2px',
              marginLeft: '4px',
            }}
            aria-label="Close notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
