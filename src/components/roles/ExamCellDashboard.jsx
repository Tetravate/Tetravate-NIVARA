import React from 'react';
import { useNivara } from '../../context/NivaraContext';

// 11 Primary Exam Cell Modules
import ExamCellHome from './exam_cell/ExamCellHome';
import ExamCellCalendar from './exam_cell/ExamCellCalendar';
import ExamCellSchedules from './exam_cell/ExamCellSchedules';
import ExamCellManagement from './exam_cell/ExamCellManagement';
import ExamCellInternals from './exam_cell/ExamCellInternals';
import ExamCellMarks from './exam_cell/ExamCellMarks';
import ExamCellResults from './exam_cell/ExamCellResults';
import ExamCellRevaluation from './exam_cell/ExamCellRevaluation';
import ExamCellStudentRecords from './exam_cell/ExamCellStudentRecords';
import ExamCellReports from './exam_cell/ExamCellReports';
import ExamCellAnnouncements from './exam_cell/ExamCellAnnouncements';

/**
 * EXAM CELL OPERATING WORKSPACE
 * Office of the Controller of Examinations.
 *
 * Implements the 11 primary modules established by the Information Architecture:
 * 1. Exam Cell Home (`home`)
 * 2. Exam Calendar (`calendar`)
 * 3. Exam Schedules (`schedules`)
 * 4. Exam Management (`management`)
 * 5. Internal Assessments (`internals`)
 * 6. Marks & Grades (`marks`)
 * 7. Results (`results` / `publish`)
 * 8. Revaluation (`revaluation`)
 * 9. Student Records (`records`)
 * 10. Reports (`reports`)
 * 11. Announcements (`announcements`)
 */
export default function ExamCellDashboard() {
  const { activeTab, setActiveTab } = useNivara();

  switch (activeTab) {
    case 'calendar':
      return <ExamCellCalendar onNavigate={(tab) => setActiveTab(tab)} />;

    case 'schedules':
      return <ExamCellSchedules onNavigate={(tab) => setActiveTab(tab)} />;

    case 'management':
      return <ExamCellManagement onNavigate={(tab) => setActiveTab(tab)} />;

    case 'internals':
      return <ExamCellInternals onNavigate={(tab) => setActiveTab(tab)} />;

    case 'marks':
      return <ExamCellMarks onNavigate={(tab) => setActiveTab(tab)} />;

    case 'results':
    case 'publish':
      return <ExamCellResults onNavigate={(tab) => setActiveTab(tab)} />;

    case 'revaluation':
      return <ExamCellRevaluation onNavigate={(tab) => setActiveTab(tab)} />;

    case 'records':
      return <ExamCellStudentRecords onNavigate={(tab) => setActiveTab(tab)} />;

    case 'reports':
      return <ExamCellReports onNavigate={(tab) => setActiveTab(tab)} />;

    case 'announcements':
      return <ExamCellAnnouncements onNavigate={(tab) => setActiveTab(tab)} />;

    case 'home':
    default:
      return <ExamCellHome onNavigate={(tab) => setActiveTab(tab)} />;
  }
}
