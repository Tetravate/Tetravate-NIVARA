<USER_REQUEST>
# Nivara — MASTER PRODUCT BUILD & RE-ARCHITECTURE PROMPT

You are working on an EXISTING project called Nivara.

Nivara is a modern college management / campus operating system designed around the principle:

"Don't show everything. Show what matters."

The current implementation is only a partial prototype. It contains some visually polished screens, but the architecture, navigation, authentication, role handling, responsiveness, functionality, data flow, and overall management-system experience are not yet at production quality.

Your task is to transform the EXISTING Nivara project into a complete, responsive, functional, role-based college management system.

DO NOT create a separate project.

DO NOT throw away the entire existing project blindly.

DO NOT make another static prototype.

DO NOT create disconnected dashboards.

DO NOT stop after creating UI screens.

The final result must feel like a real product that a college could actually use.

============================================================
0. NON-NEGOTIABLE EXECUTION RULE
============================================================

Work MODULE BY MODULE.

Do not attempt to superficially modify the entire application in one pass.

Follow this order:

PHASE 0 — Audit existing project
PHASE 1 — Architecture and foundation
PHASE 2 — Authentication + RBAC
PHASE 3 — Application shell + navigation
PHASE 4 — Student module
PHASE 5 — Faculty module
PHASE 6 — HOD module
PHASE 7 — Principal / Dean module
PHASE 8 — ERP Administrator module
PHASE 9 — Exam Cell module
PHASE 10 — Finance & Accounts module
PHASE 11 — Placement Officer module
PHASE 12 — Shared services + notifications + search
PHASE 13 — Backend + Supabase integration
PHASE 14 — Fallback/offline data layer
PHASE 15 — Cross-role synchronization
PHASE 16 — Responsive/mobile redesign pass
PHASE 17 — Accessibility + performance + security
PHASE 18 — Complete integration testing
PHASE 19 
<truncated 35717 bytes>
urity
- Duplicate prevention
- Validation
- Conflict handling
- Consistent status transitions
- Server-side data validation where appropriate

Do not rely on frontend state as the source of truth.

When multiple users modify related data simultaneously, preserve database consistency.

Examples:

Faculty A marks attendance while Student B views attendance.

Finance updates a student's fee status while the Student is viewing their dues.

Placement Officer updates an application while the Student is viewing application status.

Faculty submits marks while Exam Cell processes examination data.

Admin updates a user's role while that user attempts to access the system.

These operations must remain consistent.

Use the database as the source of truth.

After mutations, refresh/revalidate relevant data so other authenticated users see the updated state.

Where realtime updates are appropriate, use Supabase Realtime.

Do not claim "concurrent user support" merely because multiple browser tabs can open the application.

Actually test the application with multiple authenticated sessions and verify that simultaneous operations do not corrupt or incorrectly overwrite data.
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-10-07T19:49:24+05:30.

The user's current state is as follows:
Active Document: c:\Users\aswin\OneDrive\Documents\Nivara-Tetravate\PROJECT_STATUS.md (LANGUAGE_MARKDOWN)
Cursor is on line: 1
Other open documents:
- c:\Users\aswin\OneDrive\Documents\Nivara-Tetravate\src\services\dataService.js (LANGUAGE_JAVASCRIPT)
- c:\Users\aswin\OneDrive\Documents\Nivara-Tetravate\src\components\TodayTimeline.jsx (LANGUAGE_JAVASCRIPT)
- c:\Users\aswin\OneDrive\Documents\Nivara-Tetravate\PROJECT_STATUS.md (LANGUAGE_MARKDOWN)
- c:\Users\aswin\OneDrive\Documents\Nivara-Tetravate\src\components\AccountSettingsModal.jsx (LANGUAGE_JAVASCRIPT)
- c:\Users\aswin\OneDrive\Documents\Nivara-Tetravate\src\components\roles\HODDashboard.jsx (LANGUAGE_JAVASCRIPT)
</ADDITIONAL_METADATA>