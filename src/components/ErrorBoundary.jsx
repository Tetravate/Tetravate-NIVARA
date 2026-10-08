import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Nivara Application Caught Exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    const hashParts = window.location.hash.replace(/^#\/?/, '').split('/');
    const currentRole = hashParts[0] || 'student';
    window.location.hash = `#/${currentRole}/home`;
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const errorMsg = this.state.error?.message || 'An unexpected rendering error occurred in this view.';

      return (
        <div
          role="alert"
          style={{
            margin: '2rem auto',
            maxWidth: '680px',
            padding: '2rem',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.12)',
              color: 'var(--state-urgent, #dc2626)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <AlertTriangle size={26} />
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Module Display Exception
          </h2>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            The requested module encountered an issue while loading. You can safely return to the workspace home or retry.
          </p>

          <div
            style={{
              background: 'var(--bg-subtle)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              color: 'var(--text-muted)',
              marginBottom: '1.5rem',
              textAlign: 'left',
              overflowX: 'auto',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {errorMsg}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={this.handleReset}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <RotateCcw size={14} /> Retry View
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={this.handleGoHome}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Home size={14} /> Return to Workspace Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
