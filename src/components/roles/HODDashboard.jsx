import React from 'react';
import { useNivara } from '../../context/NivaraContext';

// 12 Primary HOD Modules
import HODHome from './hod/HODHome';
import HODOverview from './hod/HODOverview';
import HODStudents from './hod/HODStudents';
import HODFaculty from './hod/HODFaculty';
import HODAttendance from './hod/HODAttendance';
import HODAcademicPerformance from './hod/HODAcademicPerformance';
import HODAtRisk from './hod/HODAtRisk';
import HODWorkload from './hod/HODWorkload';
import HODTimetable from './hod/HODTimetable';
import HODApprovals from './hod/HODApprovals';
import HODAnnouncements from './hod/HODAnnouncements';
import HODReports from './hod/HODReports';

/**
 * HOD OPERATING WORKSPACE
 * Single connected operating system for Dr. K. Mohan (Professor & Head, Dept of AI & Data Science).
 *
 * Implements the 12 primary modules established by the Information Architecture:
 * 1. HOD Home (`home`)
 * 2. Department Overview (`overview`)
 * 3. Students (`students`)
 * 4. Faculty (`faculty`)
 * 5. Attendance (`attendance`)
 * 6. Academic Performance (`performance` / `academics`)
 * 7. At-Risk Students (`at_risk` / `at-risk`)
 * 8. Faculty Workload (`workload`)
 * 9. Timetable (`timetable`)
 * 10. Approvals (`approvals` / `leaves`)
 * 11. Announcements (`announcements`)
 * 12. Reports (`reports`)
 */
export default function HODDashboard() {
  const { activeTab, setActiveTab } = useNivara();

  switch (activeTab) {
    case 'overview':
      return <HODOverview onNavigate={(tab) => setActiveTab(tab)} />;

    case 'students':
      return <HODStudents onNavigate={(tab) => setActiveTab(tab)} />;

    case 'faculty':
      return <HODFaculty onNavigate={(tab) => setActiveTab(tab)} />;

    case 'attendance':
      return <HODAttendance onNavigate={(tab) => setActiveTab(tab)} />;

    case 'performance':
    case 'academics':
      return <HODAcademicPerformance onNavigate={(tab) => setActiveTab(tab)} />;

    case 'at_risk':
    case 'at-risk':
      return <HODAtRisk onNavigate={(tab) => setActiveTab(tab)} />;

    case 'workload':
      return <HODWorkload onNavigate={(tab) => setActiveTab(tab)} />;

    case 'timetable':
      return <HODTimetable onNavigate={(tab) => setActiveTab(tab)} />;

    case 'approvals':
    case 'leaves':
      return <HODApprovals onNavigate={(tab) => setActiveTab(tab)} />;

    case 'announcements':
      return <HODAnnouncements onNavigate={(tab) => setActiveTab(tab)} />;

    case 'reports':
      return <HODReports onNavigate={(tab) => setActiveTab(tab)} />;

    case 'home':
    default:
      return <HODHome onNavigate={(tab) => setActiveTab(tab)} />;
  }
}
