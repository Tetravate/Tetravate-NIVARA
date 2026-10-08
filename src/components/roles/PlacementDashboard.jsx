import React from 'react';
import { useNivara } from '../../context/NivaraContext';

// 10 Primary Placement Officer Modules
import PlacementHome from './placement/PlacementHome';
import PlacementCompanies from './placement/PlacementCompanies';
import PlacementDrives from './placement/PlacementDrives';
import PlacementEligibility from './placement/PlacementEligibility';
import PlacementApplications from './placement/PlacementApplications';
import PlacementInterviews from './placement/PlacementInterviews';
import PlacementOffers from './placement/PlacementOffers';
import PlacementStudents from './placement/PlacementStudents';
import PlacementAnnouncements from './placement/PlacementAnnouncements';
import PlacementReports from './placement/PlacementReports';

/**
 * PLACEMENT OFFICER OPERATING WORKSPACE
 * Career Development Center & Corporate Relations Office.
 *
 * Implements the 10 primary modules established by Prompt 11 & Centralized Navigation:
 * 1. Placement Home (`home`)
 * 2. Companies (`companies`)
 * 3. Placement Drives (`drives`)
 * 4. Eligibility (`eligibility`)
 * 5. Applications (`applications`)
 * 6. Tests & Interviews (`interviews`)
 * 7. Offers & Placements (`offers`)
 * 8. Students (`students`)
 * 9. Announcements (`announcements`)
 * 10. Reports (`reports`)
 */
export default function PlacementDashboard() {
  const { activeTab, setActiveTab } = useNivara();

  switch (activeTab) {
    case 'companies':
      return <PlacementCompanies onNavigate={(tab) => setActiveTab(tab)} />;

    case 'drives':
      return <PlacementDrives onNavigate={(tab) => setActiveTab(tab)} />;

    case 'eligibility':
      return <PlacementEligibility onNavigate={(tab) => setActiveTab(tab)} />;

    case 'applications':
      return <PlacementApplications onNavigate={(tab) => setActiveTab(tab)} />;

    case 'interviews':
      return <PlacementInterviews onNavigate={(tab) => setActiveTab(tab)} />;

    case 'offers':
      return <PlacementOffers onNavigate={(tab) => setActiveTab(tab)} />;

    case 'students':
      return <PlacementStudents onNavigate={(tab) => setActiveTab(tab)} />;

    case 'announcements':
      return <PlacementAnnouncements onNavigate={(tab) => setActiveTab(tab)} />;

    case 'reports':
      return <PlacementReports onNavigate={(tab) => setActiveTab(tab)} />;

    case 'home':
    default:
      return <PlacementHome onNavigate={(tab) => setActiveTab(tab)} />;
  }
}
