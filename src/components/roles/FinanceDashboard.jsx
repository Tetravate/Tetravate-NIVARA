import React from 'react';
import { useNivara } from '../../context/NivaraContext';

// 10 Primary Finance & Accounts Modules
import FinanceHome from './finance/FinanceHome';
import FinanceStructure from './finance/FinanceStructure';
import FinanceStudents from './finance/FinanceStudents';
import FinancePayments from './finance/FinancePayments';
import FinanceDues from './finance/FinanceDues';
import FinanceReceipts from './finance/FinanceReceipts';
import FinanceRefunds from './finance/FinanceRefunds';
import FinanceScholarships from './finance/FinanceScholarships';
import FinanceReports from './finance/FinanceReports';
import FinanceAnnouncements from './finance/FinanceAnnouncements';

/**
 * FINANCE & ACCOUNTS OPERATING WORKSPACE
 * Office of the Bursar & Financial Controller.
 *
 * Implements the 10 primary modules established by Prompt 10 & Centralized Navigation:
 * 1. Finance Home (`home`)
 * 2. Fee Structure (`structure`)
 * 3. Student Accounts (`students`)
 * 4. Payments (`payments`)
 * 5. Pending Dues (`dues`)
 * 6. Receipts (`receipts`)
 * 7. Refunds (`refunds`)
 * 8. Scholarships & Concessions (`scholarships`)
 * 9. Reports (`reports`)
 * 10. Announcements (`announcements`)
 */
export default function FinanceDashboard() {
  const { activeTab, setActiveTab } = useNivara();

  switch (activeTab) {
    case 'structure':
      return <FinanceStructure onNavigate={(tab) => setActiveTab(tab)} />;

    case 'students':
      return <FinanceStudents onNavigate={(tab) => setActiveTab(tab)} />;

    case 'payments':
      return <FinancePayments onNavigate={(tab) => setActiveTab(tab)} />;

    case 'dues':
      return <FinanceDues onNavigate={(tab) => setActiveTab(tab)} />;

    case 'receipts':
      return <FinanceReceipts onNavigate={(tab) => setActiveTab(tab)} />;

    case 'refunds':
      return <FinanceRefunds onNavigate={(tab) => setActiveTab(tab)} />;

    case 'scholarships':
      return <FinanceScholarships onNavigate={(tab) => setActiveTab(tab)} />;

    case 'reports':
      return <FinanceReports onNavigate={(tab) => setActiveTab(tab)} />;

    case 'announcements':
      return <FinanceAnnouncements onNavigate={(tab) => setActiveTab(tab)} />;

    case 'home':
    default:
      return <FinanceHome onNavigate={(tab) => setActiveTab(tab)} />;
  }
}
