import React from 'react';
import { X, Sparkles, Check, ArrowRight, Shield, Layers, Eye, Smartphone, Zap } from 'lucide-react';

export default function PortfolioCaseStudyModal({ isOpen, onClose }) {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;


  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Portfolio Case Study">
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px', maxHeight: '90vh' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid var(--border-subtle)',
          position: 'sticky',
          top: 0,
          background: 'var(--bg-surface)',
          zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="badge badge-info" style={{ fontSize: '0.625rem' }}>Tetravate Portfolio</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Case Study</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{ padding: '4px', minHeight: '32px' }}
            aria-label="Close Case Study"
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Header banner */}
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span className="badge badge-neutral">Product Design</span>
              <span className="badge badge-neutral">UX Architecture</span>
              <span className="badge badge-neutral">Web Application</span>
              <span className="badge badge-neutral">Education</span>
              <span className="badge badge-info">Self-Initiated Concept</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '0.5rem' }}>
              CAMPUS: Reimagining the College Operating Experience
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              A student-first college platform designed to turn complex academic information into a calm, personalized daily experience.
            </p>
          </div>

          {/* The Problem & Opportunity */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div style={{ background: 'var(--state-urgent-bg)', border: '1px solid var(--state-urgent-border)', padding: '1.25rem', borderRadius: 'var(--radius-inner)' }}>
              <h2 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--state-urgent)', marginBottom: '0.5rem' }}>
                The Problem
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Traditional college ERPs expose the entire institutional machinery to students: 15+ navigation menus, dense tables, and obscure administrative codes. The problem is not lack of features—it is too much information, too little clarity.
              </p>
            </div>

            <div style={{ background: 'var(--state-success-bg)', border: '1px solid var(--state-success-border)', padding: '1.25rem', borderRadius: 'var(--radius-inner)' }}>
              <h2 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--state-success)', marginBottom: '0.5rem' }}>
                The Opportunity
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Make college software feel as calm, fast, and thoughtful as consumer products like Notion, Linear, and Apple Notes. Focus on urgency: What do I need to know right now?
              </p>
            </div>
          </div>

          {/* Mental Model Comparison */}
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              Architecture Comparison: Traditional vs. CAMPUS
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', fontFamily: 'var(--font-sans)' }}>
                  Traditional Administrative ERP
                </div>
                <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Dashboard<br />
                  ├── Attendance Tables<br />
                  ├── Timetable Matrix<br />
                  ├── Examinations<br />
                  ├── Assignments<br />
                  ├── Department Portals<br />
                  └── Profile Logs
                </div>
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--brand-blue-border)', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--brand-blue)', marginBottom: '0.5rem', fontFamily: 'var(--font-sans)' }}>
                  CAMPUS by Tetravate
                </div>
                <div style={{ color: 'var(--text-primary)', lineHeight: 1.6 }}>
                  Context Hub<br />
                  ├── Right Now (Active session)<br />
                  ├── Next (Next class & room)<br />
                  ├── Needs Attention (&lt;48h tasks)<br />
                  └── Coming Up (Exams & events)
                </div>
              </div>
            </div>
          </div>

          {/* 7 Key UX Decisions */}
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Key UX Innovations Engineered in this Prototype
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Zap size={15} color="var(--brand-blue)" /> Today Timeline
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Chronological day stream replaces static tables. Includes the "Free for 90 Minutes" productivity insight.
                </p>
              </div>

              <div style={{ padding: '1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Sparkles size={15} color="var(--brand-blue)" /> Attendance Simulator
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Answers "How many classes can I miss?" with live mathematical simulation, eliminating student anxiety.
                </p>
              </div>

              <div style={{ padding: '1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Layers size={15} color="var(--brand-blue)" /> Rapid Faculty Roster
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  1-click "Mark All Present" with single-tap absent toggle cuts attendance time from 5 minutes down to 15 seconds.
                </p>
              </div>

              <div style={{ padding: '1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Shield size={15} color="var(--brand-blue)" /> Admin Safety UX
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Replaces endless tables with urgent action items (3 room conflicts) guarded by affirmative confirmation modals.
                </p>
              </div>
            </div>
          </div>

          {/* Tetravate Philosophy Quote */}
          <div style={{
            background: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-inner)',
            padding: '1.5rem',
            border: '1px solid var(--border-subtle)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--brand-blue)', marginBottom: '0.35rem' }}>
              TETRAVATE — From Thought to Thing
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', fontStyle: 'italic', marginBottom: '0.5rem' }}>
              “College is complicated enough. Your software shouldn't be.”
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              We don't just build features. We design how people experience them.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
