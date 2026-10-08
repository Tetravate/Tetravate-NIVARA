import React, { useState } from 'react';
import {
  Briefcase,
  Check,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Building,
  Award,
  AlertCircle,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useNivara } from '../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, EmptyState } from './workspace';

export default function StudentPlacementView({ onBack }) {
  const {
    students,
    currentUser,
    placementDrives,
    studentPlacementApplications,
    placementOffers,
    updatePlacementOfferStatus,
    applyPlacementDrive,
    showToast,
  } = useNivara();

  const activeStudentId = currentUser?.studentId || '2024-AIDS-042';
  const student = (students || []).find((s) => s.id === activeStudentId) || (students || [])[0] || {};

  // Student's personal applications & offers
  const myApplications = (studentPlacementApplications || []).filter(
    (a) => a.studentId === student.id || a.studentName === student.name
  );

  const myOffers = (placementOffers || []).filter(
    (o) => o.studentId === student.id || o.studentName === student.name
  );

  const eligibleDrives = (placementDrives || []).filter(
    (d) => student.cgpa >= d.minCgpa && (student.backlogs || 0) <= d.allowedBacklogs
  );

  const placementMetrics = [
    {
      label: 'Open Campus Drives',
      value: `${(placementDrives || []).length} Companies`,
      subtext: 'Autumn 2026 Recruitment',
      state: 'info',
    },
    {
      label: 'Eligible Opportunities',
      value: `${eligibleDrives.length} Drives`,
      subtext: `Based on CGPA ${student.cgpa || 8.72}`,
      state: 'success',
    },
    {
      label: 'Active Applications',
      value: `${myApplications.length} Submissions`,
      subtext: 'Candidate pipeline stages',
      state: myApplications.length > 0 ? 'success' : 'neutral',
    },
    {
      label: 'Candidate Standing',
      value: 'Super Dream Tier',
      subtext: '>8.0 CGPA & Zero Backlogs',
      state: 'success',
    },
  ];

  const handleApply = (drive) => {
    applyPlacementDrive(drive.id);
    confetti({
      particleCount: 35,
      spread: 50,
      origin: { y: 0.7 },
    });
  };

  return (
    <div className="workspace-normal" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Page Header */}
      <PageHeader
        eyebrow="Career Development Center · Corporate Recruitment Season 2026–2027"
        title="Campus Hiring Drives & Applications"
        description="Corporate campus hiring, eligibility thresholds, continuous status tracking, and interview stages."
        actions={
          onBack && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={onBack}>
              <ArrowLeft size={13} /> Back to Home
            </button>
          )
        }
      />

      {/* 2. Metrics Strip */}
      <MetricStrip metrics={placementMetrics} />

      {/* 3. Candidate Eligibility Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem 1.5rem',
          background: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Candidate Verified Dossier
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
            {student.name} · CGPA: {student.cgpa} · Active Backlogs: {student.backlogs || 0}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--state-success)', fontWeight: 600 }}>
            Eligible for Tier-1 Super Dream Corporate Hiring (&gt;8.0 CGPA)
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="badge badge-success">
            <Check size={11} /> CDC Cleared
          </span>
          <span className="badge badge-neutral">Resume Verified</span>
          <span className="badge badge-info">{student.department || 'AI & DS'}</span>
        </div>
      </div>

      {/* 4. My Applications Section */}
      {myApplications.length > 0 && (
        <section>
          <SectionHeader
            title={`My Candidate Applications (${myApplications.length})`}
            subtitle="Live status tracker in recruitment pipeline"
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {myApplications.map((app, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                      {app.company}
                    </strong>
                    <span className="badge badge-info">{app.role}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Applied on: {app.appliedAt} · Current Stage: <strong style={{ color: 'var(--brand-primary)' }}>{app.stage}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="badge badge-success" style={{ padding: '0.35rem 0.65rem' }}>
                    <Check size={12} /> {app.stage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4.5. My Placement Offers Section */}
      {myOffers.length > 0 && (
        <section>
          <SectionHeader
            title={`Corporate Placement Offers (${myOffers.length})`}
            subtitle="Official corporate recruitment offers extended through CDC"
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {myOffers.map((off, idx) => {
              const isAccepted = off.placementStatus === 'placed' || off.offerStatus === 'accepted';
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.15rem 1.25rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--state-success, var(--border-subtle))',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                        {off.company}
                      </strong>
                      <span className="badge badge-success" style={{ fontWeight: 700 }}>
                        {off.packageLpa}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      {off.role} · Extended on: {off.offerDate} · Joining: {off.joiningDate || 'TBD'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isAccepted ? (
                      <span className="badge badge-success" style={{ padding: '0.45rem 0.85rem' }}>
                        <CheckCircle2 size={13} /> Offer Formally Accepted (Placed)
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          updatePlacementOfferStatus(off.id, 'accepted', 'placed');
                          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
                          showToast(`Congratulations! You have accepted the offer from ${off.company} ✓`, 'success');
                        }}
                      >
                        Accept Offer & Confirm Placement
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. Open Recruitment Drives */}
      <section>
        <SectionHeader
          title={`Open Campus Drives (${(placementDrives || []).length})`}
          subtitle="Companies currently accepting applications"
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {(!placementDrives || placementDrives.length === 0) ? (
            <EmptyState
              icon={Briefcase}
              title="No open recruitment drives currently"
              description="The Corporate Relations Cell publishes newly scheduled hiring drives and eligible opportunities here."
            />
          ) : (
            placementDrives.map((drive) => {
              const isEligible = student.cgpa >= drive.minCgpa && (student.backlogs || 0) <= drive.allowedBacklogs;
              const hasApplied = myApplications.some((a) => a.driveId === drive.id);

              return (
                <div
                  key={drive.id}
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {drive.company}
                        </span>
                        <span className="badge badge-info">{drive.packageLpa}</span>
                        <span className="badge badge-neutral">Deadline: {drive.deadline}</span>
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {drive.role} · {drive.location}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Eligibility: Minimum CGPA {drive.minCgpa} (Your CGPA: <strong>{student.cgpa}</strong>) · Target Branches: {drive.departmentTarget?.join(', ') || 'All Engineering'}
                      </div>
                    </div>

                    <div>
                      {hasApplied ? (
                        <span className="badge badge-success" style={{ padding: '0.45rem 0.85rem', fontSize: '0.75rem' }}>
                          <Check size={13} /> Application Submitted
                        </span>
                      ) : isEligible ? (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handleApply(drive)}
                        >
                          <Briefcase size={13} /> 1-Click Apply
                        </button>
                      ) : (
                        <span className="badge badge-neutral" style={{ padding: '0.45rem 0.85rem', fontSize: '0.75rem' }}>
                          CGPA Below Threshold
                        </span>
                      )}
                    </div>
                  </div>

                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem' }}>
                    {drive.description}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
