import React from 'react';
import { useNivara } from '../../context/NivaraContext';

// 13 Primary Principal / Dean Modules
import PrincipalHome from './principal/PrincipalHome';
import PrincipalOverview from './principal/PrincipalOverview';
import PrincipalDepartments from './principal/PrincipalDepartments';
import PrincipalStudents from './principal/PrincipalStudents';
import PrincipalFaculty from './principal/PrincipalFaculty';
import PrincipalAcademicPerformance from './principal/PrincipalAcademicPerformance';
import PrincipalAttendance from './principal/PrincipalAttendance';
import PrincipalExamsResults from './principal/PrincipalExamsResults';
import PrincipalPlacements from './principal/PrincipalPlacements';
import PrincipalFinance from './principal/PrincipalFinance';
import PrincipalApprovals from './principal/PrincipalApprovals';
import PrincipalAnnouncements from './principal/PrincipalAnnouncements';
import PrincipalReports from './principal/PrincipalReports';

/**
 * PRINCIPAL / DEAN OPERATING WORKSPACE
 * Executive Council OS for Dr. Aris Thorne (Principal & Academic Dean).
 *
 * Implements the 13 primary modules established by the Information Architecture:
 * 1. Executive Home (`home`)
 * 2. College Overview (`overview`)
 * 3. Departments (`departments`)
 * 4. Students (`students`)
 * 5. Faculty (`faculty`)
 * 6. Academic Performance (`performance` / `academics`)
 * 7. Attendance (`attendance`)
 * 8. Examinations & Results (`exams_results` / `exams`)
 * 9. Placements (`placements`)
 * 10. Finance (`finance` / `financials`)
 * 11. Approvals (`approvals`)
 * 12. Announcements (`announcements`)
 * 13. Reports (`reports`)
 */
export default function PrincipalDashboard() {
  const { activeTab, setActiveTab } = useNivara();

  switch (activeTab) {
    case 'overview':
      return <PrincipalOverview onNavigate={(tab) => setActiveTab(tab)} />;

    case 'departments':
      return <PrincipalDepartments onNavigate={(tab) => setActiveTab(tab)} />;

    case 'students':
      return <PrincipalStudents onNavigate={(tab) => setActiveTab(tab)} />;

    case 'faculty':
      return <PrincipalFaculty onNavigate={(tab) => setActiveTab(tab)} />;

    case 'performance':
    case 'academics':
      return <PrincipalAcademicPerformance onNavigate={(tab) => setActiveTab(tab)} />;

    case 'attendance':
      return <PrincipalAttendance onNavigate={(tab) => setActiveTab(tab)} />;

    case 'exams_results':
    case 'exams':
      return <PrincipalExamsResults onNavigate={(tab) => setActiveTab(tab)} />;

    case 'placements':
      return <PrincipalPlacements onNavigate={(tab) => setActiveTab(tab)} />;

    case 'finance':
    case 'financials':
      return <PrincipalFinance onNavigate={(tab) => setActiveTab(tab)} />;

    case 'approvals':
      return <PrincipalApprovals onNavigate={(tab) => setActiveTab(tab)} />;

    case 'announcements':
      return <PrincipalAnnouncements onNavigate={(tab) => setActiveTab(tab)} />;

    case 'reports':
      return <PrincipalReports onNavigate={(tab) => setActiveTab(tab)} />;

    case 'home':
    default:
      return <PrincipalHome onNavigate={(tab) => setActiveTab(tab)} />;
  }
}
