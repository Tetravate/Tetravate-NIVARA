import React from 'react';
import { useNivara } from '../../context/NivaraContext';

// 12 Primary Faculty Modules
import FacultyHome from './faculty/FacultyHome';
import FacultyTodaySchedule from './faculty/FacultyTodaySchedule';
import FacultyClasses from './faculty/FacultyClasses';
import FacultyAttendance from './faculty/FacultyAttendance';
import FacultyAssignments from './faculty/FacultyAssignments';
import FacultyMaterials from './faculty/FacultyMaterials';
import FacultyMarks from './faculty/FacultyMarks';
import FacultyStudents from './faculty/FacultyStudents';
import FacultyStudentProgress from './faculty/FacultyStudentProgress';
import FacultyLeaves from './faculty/FacultyLeaves';
import FacultyAnnouncements from './faculty/FacultyAnnouncements';
import FacultyTimetable from './faculty/FacultyTimetable';

/**
 * FACULTY OPERATING WORKSPACE
 * Single connected operating system for Dr. Priya Raman (Associate Professor, AI & Data Science).
 *
 * Implements the 12 primary modules established by the Information Architecture:
 * 1. Faculty Home (`home`)
 * 2. Today's Schedule (`today`)
 * 3. My Classes (`classes`)
 * 4. Attendance (`attendance`)
 * 5. Assignments (`assignments` / `submissions`)
 * 6. Courses & Materials (`materials`)
 * 7. Assessments & Marks (`marks`)
 * 8. Students (`students`)
 * 9. Student Progress (`progress`)
 * 10. Leave Requests (`leaves`)
 * 11. Announcements (`announcements`)
 * 12. Timetable (`timetable`)
 */
export default function FacultyDashboard() {
  const { activeTab, setActiveTab } = useNivara();

  switch (activeTab) {
    case 'today':
      return <FacultyTodaySchedule onBack={() => setActiveTab('home')} />;

    case 'classes':
      return <FacultyClasses onBack={() => setActiveTab('home')} />;

    case 'attendance':
      return <FacultyAttendance onBack={() => setActiveTab('home')} />;

    case 'assignments':
    case 'submissions':
      return <FacultyAssignments onBack={() => setActiveTab('home')} />;

    case 'materials':
      return <FacultyMaterials onBack={() => setActiveTab('home')} />;

    case 'marks':
      return <FacultyMarks onBack={() => setActiveTab('home')} />;

    case 'students':
      return <FacultyStudents onBack={() => setActiveTab('home')} />;

    case 'progress':
      return <FacultyStudentProgress onBack={() => setActiveTab('home')} />;

    case 'leaves':
      return <FacultyLeaves onBack={() => setActiveTab('home')} />;

    case 'announcements':
      return <FacultyAnnouncements onBack={() => setActiveTab('home')} />;

    case 'timetable':
      return <FacultyTimetable onBack={() => setActiveTab('home')} />;

    case 'home':
    default:
      return <FacultyHome onNavigate={(tab) => setActiveTab(tab)} />;
  }
}
