import React from 'react';
import { useNivara } from '../../context/NivaraContext';

// 13 Primary ERP Administrator Modules
import AdminHome from './admin/AdminHome';
import AdminUsers from './admin/AdminUsers';
import AdminStudents from './admin/AdminStudents';
import AdminFaculty from './admin/AdminFaculty';
import AdminDepartments from './admin/AdminDepartments';
import AdminPrograms from './admin/AdminPrograms';
import AdminSubjects from './admin/AdminSubjects';
import AdminSections from './admin/AdminSections';
import AdminTimetableRooms from './admin/AdminTimetableRooms';
import AdminAcademicYears from './admin/AdminAcademicYears';
import AdminSystemConfig from './admin/AdminSystemConfig';
import AdminAnnouncements from './admin/AdminAnnouncements';
import AdminAuditLogs from './admin/AdminAuditLogs';

/**
 * ERP ADMINISTRATOR OPERATING WORKSPACE
 * System & Master Data Controller.
 *
 * Implements the 13 primary modules established by the Information Architecture:
 * 1. Admin Home (`home`)
 * 2. Users & Roles (`users`)
 * 3. Students (`students`)
 * 4. Faculty (`faculty`)
 * 5. Departments (`departments`)
 * 6. Programs & Courses (`programs`)
 * 7. Subjects (`subjects`)
 * 8. Classes & Sections (`sections`)
 * 9. Timetable & Rooms (`conflicts` / `timetable` / `rooms`)
 * 10. Academic Years (`academic_years` / `years`)
 * 11. System Configuration (`settings` / `configuration`)
 * 12. Announcements (`announcements`)
 * 13. Audit Logs (`audit_logs` / `audit`)
 */
export default function AdminDashboard() {
  const { activeTab, setActiveTab } = useNivara();

  switch (activeTab) {
    case 'users':
      return <AdminUsers onNavigate={(tab) => setActiveTab(tab)} />;

    case 'students':
      return <AdminStudents onNavigate={(tab) => setActiveTab(tab)} />;

    case 'faculty':
      return <AdminFaculty onNavigate={(tab) => setActiveTab(tab)} />;

    case 'departments':
      return <AdminDepartments onNavigate={(tab) => setActiveTab(tab)} />;

    case 'programs':
      return <AdminPrograms onNavigate={(tab) => setActiveTab(tab)} />;

    case 'subjects':
      return <AdminSubjects onNavigate={(tab) => setActiveTab(tab)} />;

    case 'sections':
      return <AdminSections onNavigate={(tab) => setActiveTab(tab)} />;

    case 'conflicts':
    case 'timetable':
    case 'rooms':
      return <AdminTimetableRooms onNavigate={(tab) => setActiveTab(tab)} />;

    case 'academic_years':
    case 'years':
      return <AdminAcademicYears onNavigate={(tab) => setActiveTab(tab)} />;

    case 'settings':
    case 'configuration':
      return <AdminSystemConfig onNavigate={(tab) => setActiveTab(tab)} />;

    case 'announcements':
      return <AdminAnnouncements onNavigate={(tab) => setActiveTab(tab)} />;

    case 'audit_logs':
    case 'audit':
      return <AdminAuditLogs onNavigate={(tab) => setActiveTab(tab)} />;

    case 'home':
    default:
      return <AdminHome onNavigate={(tab) => setActiveTab(tab)} />;
  }
}
