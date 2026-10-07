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
PHASE 19 — Final visual/product polish

For EACH module:

1. Inspect what currently exists.
2. Preserve good existing work.
3. Identify broken/placeholder functionality.
4. Implement the complete module.
5. Connect it to shared data/state.
6. Implement loading, empty, success and error states.
7. Implement permissions.
8. Test the module.
9. Only then move to the next module.

Do not declare the project complete until all phases have been integrated and tested together.

============================================================
1. FIRST: FULL PROJECT AUDIT
============================================================

Before writing code, inspect the ENTIRE existing project.

Read:

- AGENTS.md
- package.json
- vite configuration
- source structure
- existing routes
- components
- pages
- data files
- API code
- authentication code
- role-switching code
- state management
- styling
- assets
- existing database integration
- existing Supabase configuration if present
- all existing dashboards
- all existing forms
- all existing modals
- all existing navigation
- all existing mock data

Understand the current architecture before changing it.

Create an internal implementation map:

CURRENT:
- Routes
- Components
- Roles
- Features
- Data models
- APIs
- Auth
- Storage
- Existing dependencies

Then categorize existing implementation:

KEEP
REWORK
REMOVE
ADD

Do not preserve bad architecture merely because it already exists.

Do not remove useful existing functionality unnecessarily.

============================================================
2. EXISTING PROJECT CONSTRAINT
============================================================

This is an existing Vite project.

PRESERVE the existing framework and project architecture unless there is a compelling technical reason to change it.

Do not migrate to Next.js, React, TypeScript, or another framework simply because you prefer it.

If the existing application uses vanilla JavaScript/CSS, continue using it.

Work with the existing codebase.

Reuse existing:

- assets
- design tokens
- components
- data
- routes
- useful utilities
- existing visual language

Improve them rather than replacing everything blindly.

============================================================
3. PRODUCT IDENTITY
============================================================

Product:

NIVARA

Positioning:

A modern college operating system that brings academics, administration, student services, examinations, finance, and placements into one connected experience.

Core principle:

"Don't show everything. Show what matters."

The application must feel:

- Premium
- Modern
- Calm
- Professional
- Reliable
- Highly intentional
- Consumer-grade
- Enterprise-capable
- Easy to understand
- Information-dense without feeling cluttered

It must NOT feel like:

- A generic college ERP
- A CRUD admin panel
- A student project dashboard
- A collection of unrelated screens
- A collection of static mockups

============================================================
4. FINAL ROLE SYSTEM
============================================================

Nivara has EXACTLY these 8 roles:

1. Student
2. Faculty
3. HOD
4. Principal / Dean
5. ERP Administrator
6. Exam Cell
7. Finance & Accounts
8. Placement Officer

Do not add random additional roles.

Do not remove these roles.

Placement Officer is role number 8.

============================================================
5. CRITICAL CHANGE: REMOVE PROFILE SWITCHING AS AUTHENTICATION
============================================================

The current prototype uses a role/profile switcher.

This is NOT acceptable as the final authentication model.

The role switcher may be retained ONLY as an internal development/demo utility if absolutely necessary, and it must not be presented as the real login mechanism.

The production experience must have a REAL LOGIN PAGE.

The login page should NOT ask:

"Choose your role"

The user should not manually select:

Student
Faculty
HOD
Principal
Admin
etc.

Instead:

USER LOGS IN
        ↓
AUTHENTICATION
        ↓
USER RECORD
        ↓
ROLE
        ↓
PERMISSIONS
        ↓
CORRECT APPLICATION EXPERIENCE

The user's role must be determined from the authenticated user's profile/role record.

============================================================
6. LOGIN PAGE
============================================================

Build a proper premium Nivara login experience.

It should feel like a real institutional product.

Include:

- Nivara branding
- Email / institutional ID
- Password
- Show/hide password
- Remember session where appropriate
- Sign in
- Forgot password
- Loading state
- Invalid credentials state
- Network error state
- Account disabled state
- Successful authentication flow

Optional:

"Continue with institutional SSO"

Only implement this if it can be realistically supported.

Do not create fake OAuth buttons that do nothing.

Login must be responsive.

Desktop:
Elegant split or centered layout.

Tablet:
Balanced layout.

Mobile:
Focused single-column authentication experience.

Do not overcrowd the login page.

============================================================
7. AUTHENTICATION ARCHITECTURE
============================================================

Use Supabase as the primary backend/authentication system.

Use:

Supabase Auth
Supabase PostgreSQL
Supabase Row Level Security
Supabase Storage where appropriate
Supabase Realtime where useful

Never expose a Supabase service-role key in frontend code.

Only use safe client-side credentials such as the public anon/publishable key.

Use environment variables.

Example:

VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY

Never hardcode secrets.

============================================================
8. SUPABASE DATABASE
============================================================

Create a sensible relational data model.

At minimum, model the concepts already used by the application.

Potential entities include:

profiles
roles
departments
programs
courses
subjects
academic_years
semesters
sections
students
faculty
timetables
class_sessions
attendance
assignments
assignment_submissions
study_materials
assessments
marks
exams
exam_schedules
exam_seats
results
leave_requests
fees
payments
receipts
companies
placement_drives
placement_applications
placement_interviews
placement_offers
announcements
notifications
requests
audit_logs

Do NOT create unnecessary tables merely for the sake of having a large schema.

Use the existing prototype's actual data model where possible.

Create relationships correctly.

Avoid duplicated data.

============================================================
9. REAL RBAC
============================================================

This is a major requirement.

Implement REAL role-based access control.

The application must not simply hide sidebar items.

RBAC must exist at multiple levels:

Frontend:
- route protection
- navigation visibility
- action visibility

Backend:
- database permissions
- Supabase Row Level Security

Data:
- users can only access records they are authorized to access

Example:

Student:
Can access their own profile, attendance, assignments, fees, results, placements, leave requests.

Faculty:
Can access assigned subjects/classes/students.

HOD:
Can access their department.

Principal:
Can access college-level information.

ERP Admin:
Can manage system configuration and users according to defined permissions.

Exam Cell:
Can manage examination information.

Finance:
Can access financial information.

Placement Officer:
Can access placement information.

Do not rely on frontend checks alone.

============================================================
10. APPLICATION SHELL
============================================================

Build one consistent application shell.

Include:

- Sidebar
- Top navigation
- Search
- Notifications
- Profile menu
- Breadcrumbs where useful
- Main content area
- Responsive mobile navigation

But the content and navigation must change based on the authenticated role.

Do not create eight completely unrelated applications.

Use one design system with different information hierarchies.

============================================================
11. NAVIGATION
============================================================

Navigation must be REAL.

Every visible:

- sidebar item
- top navigation item
- CTA
- card
- link
- tab
- dropdown
- action
- table row action

must have a meaningful result.

No dead buttons.

No:

onClick={() => {}}

No:

href="#"

No:

console.log("coming soon")

unless it is explicitly a developer-only feature.

If something cannot yet be implemented, don't present it as a finished clickable feature.

Every route must:

- load
- render
- support browser back
- support browser forward
- work on direct navigation
- preserve active navigation state
- handle refresh appropriately

============================================================
12. STUDENT MODULE
============================================================

Build the Student experience based on the existing prototype.

The current prototype already has concepts such as:

- Student Home
- Today's Schedule
- Attendance
- Assignments
- Fees & Dues
- Placement Drives
- Leave Requests
- Exams & Seats
- Results & Journey
- Timetable

Preserve useful existing modules and improve their implementation.

Do NOT randomly invent a completely different student portal.

Student Home should prioritize:

RIGHT NOW
NEXT
NEEDS ATTENTION
COMING UP

Student should be able to:

- View schedule
- View attendance
- View assignments
- Submit assignments
- View fees and dues
- View placement opportunities
- Apply to eligible drives
- Submit leave requests
- View exam schedule
- View exam seat information
- View results
- View academic history
- View timetable
- View notifications
- View relevant announcements

Student should only see their own information.

============================================================
13. FACULTY MODULE
============================================================

The Faculty experience must NOT feel empty or underdeveloped.

Build a proper Faculty workspace around teaching responsibilities.

Use the existing prototype where applicable.

Faculty should be able to work with:

- Faculty Home
- Today's Schedule
- Assigned Classes
- Attendance
- Assignments
- Course/Subject resources where already supported
- Assessments / Marks
- Students
- Student performance
- Leave requests
- Announcements
- Timetable

Faculty Home should answer:

"What do I need to do today?"

Show:

- Next class
- Classes today
- Attendance pending
- Assignments requiring review
- Marks requiring attention
- Student alerts
- Important announcements

Faculty must be able to:

- Open assigned class
- View students
- Take attendance
- Update attendance where permitted
- Create assignments
- Review submissions
- Grade assignments
- Enter marks
- View student academic information they are authorized to see
- Publish class announcements

============================================================
14. HOD MODULE
============================================================

HOD is the department management role.

Build:

- HOD Home
- Department overview
- Students
- Faculty
- Attendance
- Academic performance
- At-risk students
- Workload where supported by the existing system
- Timetable
- Approvals
- Announcements
- Reports

HOD should see department-level information.

Do not expose unrelated departments.

HOD analytics must be derived from real shared data.

============================================================
15. PRINCIPAL / DEAN MODULE
============================================================

Principal/Dean is an executive oversight role.

Build a high-level experience.

Focus on:

- College overview
- Departments
- Student statistics
- Faculty statistics
- Attendance
- Academic performance
- Examinations/results
- Placements
- Finance summaries
- Important alerts
- Approvals
- Announcements
- Reports

Do NOT turn Principal into an admin user.

Principal should monitor and approve rather than perform low-level data entry.

============================================================
16. ERP ADMINISTRATOR MODULE
============================================================

Admin is the system management role.

Build appropriate management interfaces for:

- Users
- Roles
- Students
- Faculty
- Departments
- Programs/courses
- Subjects
- Classes/sections
- Academic years
- Semesters
- Timetable/rooms
- System configuration
- Announcements
- Audit logs

Admin should manage system structure.

Do not give Admin unrestricted academic editing merely because they are an administrator.

Respect role boundaries.

============================================================
17. EXAM CELL MODULE
============================================================

Build:

- Exam Cell Home
- Exam calendar
- Exam schedules
- Exam management
- Internal assessment information
- Marks/grades
- Results
- Exam seats
- Revaluation where supported
- Student records
- Reports
- Announcements

Connect this with Faculty marks and Student results.

============================================================
18. FINANCE & ACCOUNTS MODULE
============================================================

Build:

- Finance Home
- Fee structure
- Student accounts
- Payments
- Pending dues
- Receipts
- Refunds where supported
- Scholarships/concessions where supported
- Reports
- Announcements

Connect Finance with Student fee information.

============================================================
19. PLACEMENT OFFICER MODULE
============================================================

Build:

- Placement Home
- Companies
- Placement Drives
- Eligibility
- Applications
- Tests/interviews
- Offers/placements
- Students
- Announcements
- Reports

Placement drives should use real student eligibility data.

Students should only see drives they are eligible for where applicable.

Applications should appear to the Placement Officer.

Status changes should appear to students.

============================================================
20. SHARED DATA ARCHITECTURE
============================================================

This is one of the most important requirements.

Do NOT create isolated hardcoded data for every role.

Use a shared data/repository/service layer.

Example:

ONE STUDENT RECORD

Student
Faculty
HOD
Principal
Exam Cell
Finance
Placement

should all reference the same underlying student data where permitted.

ONE ATTENDANCE RECORD

Faculty updates it.

Student sees it.

HOD sees aggregated data.

Principal sees college-level aggregate.

ONE ASSIGNMENT

Faculty creates it.

Student sees it.

Student submits it.

Faculty reviews it.

The system must behave like ONE application.

============================================================
21. FRONTEND / BACKEND SEPARATION
============================================================

Create a clean separation between:

UI
↓
Application/service layer
↓
Repository/data layer
↓
Supabase / fallback implementation

Do not scatter database calls throughout random UI components.

Use reusable service/repository functions.

Example conceptual structure:

components/
pages/
services/
repositories/
lib/
auth/
data/
types/
utils/

Adapt this to the existing project architecture instead of blindly restructuring everything.

============================================================
22. SUPABASE + FALLBACK MODEL
============================================================

Implement two data modes.

PRIMARY:

Supabase

FALLBACK:

Local/mock persistent data layer

The application must not completely break if Supabase is unavailable.

Create a repository abstraction.

Conceptually:

Data Repository
        │
        ├── Supabase Repository
        │
        └── Local/Fallback Repository

The UI should not care which implementation is being used.

If Supabase is configured and available:

Use Supabase.

If Supabase is unavailable or configuration is missing:

Use the fallback implementation.

The fallback should preserve realistic data relationships and interactions.

Do NOT silently hide real backend failures forever.

Clearly indicate development/fallback mode where appropriate.

============================================================
23. OFFLINE / FALLBACK BEHAVIOR
============================================================

Fallback mode should support:

- Login/demo authentication
- Role resolution
- Navigation
- CRUD operations where appropriate
- Attendance
- Assignments
- Marks
- Leave
- Fees
- Placements
- Exams
- Notifications
- Search
- Basic persistence

Use localStorage/IndexedDB or the project's appropriate existing mechanism.

Keep fallback data structured similarly to Supabase data.

============================================================
24. CROSS-ROLE SYNCHRONIZATION
============================================================

This must be implemented and tested.

ATTENDANCE:

Faculty marks attendance
↓
Student attendance changes
↓
HOD statistics change
↓
Principal statistics change

ASSIGNMENT:

Faculty creates assignment
↓
Student sees assignment
↓
Student submits
↓
Faculty sees submission
↓
Faculty grades
↓
Student sees grade

LEAVE:

Student submits leave
↓
Authorized Faculty/HOD sees request
↓
Approve/reject
↓
Student sees updated status

FEES:

Finance creates fee due
↓
Student sees due
↓
Student completes payment/fallback payment
↓
Payment status updates
↓
Receipt available
↓
Finance sees payment

EXAM:

Faculty/appropriate academic workflow provides marks
↓
Exam Cell processes results
↓
Student sees published result
↓
HOD sees department performance
↓
Principal sees college performance

PLACEMENT:

Placement Officer creates drive
↓
Eligibility calculated
↓
Eligible student sees drive
↓
Student applies
↓
Placement Officer sees application
↓
Status changes
↓
Student sees updated status
↓
HOD/Principal placement statistics update

============================================================
25. SEARCH
============================================================

The global search must be functional.

It should search data relevant to the authenticated role.

Examples:

Student:
subjects, faculty, rooms, assignments, announcements

Faculty:
students, classes, subjects, assignments

HOD:
students, faculty, department information

Principal:
departments, students, faculty, reports

Admin:
users, departments, subjects, courses

Exam Cell:
students, exams, subjects, results

Finance:
students, accounts, payments

Placement:
students, companies, drives, applications

Include:

- instant results
- categories
- empty state
- no results
- keyboard interaction
- proper navigation

============================================================
26. NOTIFICATIONS
============================================================

Notifications must be real application events.

Examples:

New assignment
Fee due
Leave approved
Exam schedule published
Result published
Placement drive available
Placement status changed
Class announcement

Notification panel must support:

- unread state
- read state
- mark as read
- navigation to related item
- empty state

============================================================
27. PROFILE
============================================================

Profile menu must be functional.

Include appropriate:

- Profile
- Account settings
- Notification preferences where supported
- Sign out

Do not use profile switching as authentication.

Sign out must actually end the authenticated session.

============================================================
28. RESPONSIVE DESIGN — VERY IMPORTANT
============================================================

The final product must be properly responsive.

Do NOT simply make desktop layouts shrink.

Design and test:

Mobile:
320px
360px
375px
390px
414px

Tablet:
768px
820px
1024px

Laptop:
1280px
1366px
1440px

Desktop:
1600px
1920px
2560px

The UI must remain usable at all sizes.

============================================================
29. MOBILE EXPERIENCE
============================================================

On mobile:

Sidebar should become a proper mobile navigation/drawer/bottom navigation depending on context.

Do NOT squeeze a desktop sidebar into 320px.

Top navigation should adapt.

Search should adapt.

Tables should become:

- cards
- horizontal scroll where appropriate
- stacked information

Forms should become single-column where appropriate.

Cards should resize naturally.

Modals should fit mobile screens.

Buttons should have proper touch targets.

No horizontal overflow.

No clipped content.

No microscopic text.

No unusable tables.

============================================================
30. DESKTOP EXPERIENCE
============================================================

On large screens:

Use available space intelligently.

Do not create giant empty areas.

Do not stretch content unnecessarily.

Use sensible maximum content widths.

Dashboards should feel balanced.

Tables and analytics can use wider layouts where appropriate.

============================================================
31. RESPONSIVE QA
============================================================

Test every major route at:

320
375
390
768
1024
1280
1440
1920

Check:

- overflow
- clipping
- sidebar
- navigation
- tables
- forms
- cards
- modals
- charts
- typography
- spacing
- buttons
- touch targets

Fix actual responsive issues rather than adding arbitrary CSS hacks.

============================================================
32. VISUAL DESIGN
============================================================

Use the installed Taste Skill capabilities as a visual quality layer.

The UI should feel:

Premium
Minimal
Professional
Calm
Intentional
Modern
Human

Use strong:

- typography
- hierarchy
- spacing
- alignment
- grid
- component consistency
- micro-interactions
- hover states
- focus states
- transitions

Avoid:

- excessive gradients
- excessive glassmorphism
- excessive shadows
- generic dashboard cards
- random decorative elements
- excessive animations
- neon styling
- AI-generated-looking SaaS UI
- unnecessary charts
- unnecessary cards

Information hierarchy is more important than decoration.

============================================================
33. NAVIGATION QUALITY
============================================================

Navigation must feel like a mature management system.

Use:

- clear active state
- breadcrumbs where helpful
- logical hierarchy
- back navigation where appropriate
- contextual actions
- consistent page headers
- meaningful empty states
- clear page titles
- consistent sidebar behavior

Do not make every page look like a separate landing page.

============================================================
34. FORMS
============================================================

Every form must actually work.

Implement:

- validation
- required fields
- inline errors
- loading state
- success state
- failure state
- cancel
- reset where appropriate
- persistence
- permission checks

Never show fake "Saved successfully" without actually saving.

============================================================
35. TABLES
============================================================

Tables should support appropriate:

- search
- filtering
- sorting
- pagination
- row details
- actions
- status
- empty states

Do not add every feature to every table.

Only add interactions that make sense.

============================================================
36. LOADING / ERROR / EMPTY STATES
============================================================

Every data-driven page needs:

Loading state
Empty state
Error state
Success feedback

Do not leave blank areas.

Examples:

"No assignments yet"

"No upcoming exams"

"No pending fee dues"

"No placement applications"

These should feel intentional and useful.

============================================================
37. ACCESSIBILITY
============================================================

Implement:

- semantic HTML
- keyboard navigation
- visible focus states
- accessible labels
- appropriate ARIA where needed
- sufficient contrast
- accessible forms
- logical heading hierarchy
- usable touch targets

Do not use clickable divs when buttons/links are appropriate.

============================================================
38. SECURITY
============================================================

Never:

- expose service-role keys
- trust frontend role checks
- allow unauthorized database access
- expose another student's private data
- allow unauthorized record modification

Use Supabase RLS properly.

Validate important operations server/data layer side where appropriate.

============================================================
39. PERFORMANCE
============================================================

Optimize:

- unnecessary re-renders
- large lists
- images
- data fetching
- route loading
- duplicate requests

Use lazy loading where appropriate.

Do not sacrifice UX just to optimize prematurely.

============================================================
40. AUDIT LOGGING
============================================================

Important operations should create audit records.

Examples:

Admin created user
Faculty marked attendance
Faculty entered marks
Exam Cell published results
Finance verified payment
Placement Officer created drive
HOD approved request

Audit logs should be visible only to appropriate roles.

============================================================
41. DATA CONSISTENCY
============================================================

Avoid hardcoded numbers such as:

"89.4% attendance"

if the number is supposed to represent actual application data.

Calculate statistics from the shared dataset.

Examples:

Attendance percentage
Assignment completion
Fee dues
Placement statistics
Department performance
Exam results

Use derived values.

============================================================
42. DEMO DATA
============================================================

Create realistic demo data for all 8 roles.

Demo data should be internally consistent.

For example:

A student belongs to a department.

That student belongs to a class/section.

That class has faculty.

That faculty teaches subjects.

Those subjects appear in timetable.

Attendance belongs to those classes.

Assignments belong to those subjects.

Marks belong to those assessments.

Exam results belong to those subjects.

Fees belong to that student.

Placement eligibility is based on student information.

Do not generate random disconnected data.

============================================================
43. LOGIN / DEMO ENVIRONMENT
============================================================

For local development/fallback mode, provide a convenient way to test each role without compromising the production login architecture.

Possible development-only demo accounts:

Student
Faculty
HOD
Principal
ERP Admin
Exam Cell
Finance
Placement

The production UI must still use normal authentication.

Do not display "switch role" as the primary login experience.

If demo login shortcuts are provided, clearly identify them as development/demo functionality.

============================================================
44. CURRENT ROLE SWITCHER
============================================================

The existing "Switch Operating Role" UI must NOT remain as the main way to use Nivara.

Replace it in the real authenticated application with:

Profile
→ account information
→ actual authenticated role

If you retain the role switcher for development/demo purposes, isolate it behind a clearly marked development/demo mode.

Do not allow normal users to arbitrarily switch roles.

============================================================
45. MODULE COMPLETION RULE
============================================================

Before moving from one module to the next:

VERIFY:

✓ Page exists
✓ Route works
✓ Navigation works
✓ UI is responsive
✓ Data loads
✓ Data saves
✓ Permissions work
✓ Loading state works
✓ Empty state works
✓ Error state works
✓ Relevant notifications work
✓ Shared data updates correctly
✓ No dead buttons remain

Then move to the next module.

============================================================
46. INTEGRATION PHASE
============================================================

After ALL 8 role modules are implemented, perform a dedicated integration phase.

Do NOT assume integration works because individual modules work.

Test complete workflows across roles.

At minimum:

WORKFLOW 1:
Faculty → Attendance → Student → HOD → Principal

WORKFLOW 2:
Faculty → Assignment → Student → Submission → Faculty grading

WORKFLOW 3:
Student → Leave → Faculty/HOD approval → Student

WORKFLOW 4:
Finance → Fee → Student → Payment → Receipt → Finance

WORKFLOW 5:
Faculty/Exam workflow → Exam Cell → Result → Student → HOD → Principal

WORKFLOW 6:
Placement Officer → Drive → Student eligibility → Application → Placement Officer → Status → Student

WORKFLOW 7:
Admin → User creation → Role assignment → User login → Correct dashboard

WORKFLOW 8:
Admin → Academic structure → Faculty assignment → Student timetable → Faculty timetable

All should use the same underlying data.

============================================================
47. FINAL DESIGN AUDIT
============================================================

After functionality is complete, perform a final visual audit.

Check:

- spacing
- alignment
- typography
- colors
- hierarchy
- component consistency
- button states
- hover states
- focus states
- loading states
- empty states
- responsive behavior
- mobile navigation
- tables
- forms
- charts
- modals
- notifications

Do not redesign randomly.

Improve what is weak while preserving the Nivara visual identity.

============================================================
48. FINAL PRODUCT FEEL
============================================================

When the application is finished, a user should feel:

"This is a complete college management system."

Not:

"This is a collection of dashboard mockups."

The experience should communicate:

ONE SYSTEM
        ↓
ONE DATA MODEL
        ↓
8 ROLES
        ↓
ROLE-SPECIFIC PERMISSIONS
        ↓
ROLE-SPECIFIC INFORMATION
        ↓
CONNECTED WORKFLOWS
        ↓
REAL DATA
        ↓
REAL INTERACTIONS

============================================================
49. FINAL TESTING CHECKLIST
============================================================

Before declaring completion:

AUTHENTICATION
[ ] Login works
[ ] Logout works
[ ] Session persistence works
[ ] Invalid credentials handled
[ ] Password visibility works
[ ] Forgot password flow handled
[ ] Role automatically resolved
[ ] Unauthorized users blocked

RBAC
[ ] Student permissions work
[ ] Faculty permissions work
[ ] HOD permissions work
[ ] Principal permissions work
[ ] Admin permissions work
[ ] Exam Cell permissions work
[ ] Finance permissions work
[ ] Placement permissions work

NAVIGATION
[ ] Every sidebar item works
[ ] Every important CTA works
[ ] Browser back works
[ ] Browser forward works
[ ] Refresh works
[ ] Direct routes work
[ ] Active navigation works

DATA
[ ] Supabase works
[ ] Fallback works
[ ] Data relationships work
[ ] CRUD works where appropriate
[ ] Shared state works
[ ] Derived statistics work

INTEGRATION
[ ] Attendance flow works
[ ] Assignment flow works
[ ] Leave flow works
[ ] Fee flow works
[ ] Exam flow works
[ ] Placement flow works
[ ] Admin/user flow works

RESPONSIVE
[ ] 320px
[ ] 375px
[ ] 390px
[ ] 768px
[ ] 1024px
[ ] 1280px
[ ] 1440px
[ ] 1920px

UX
[ ] Loading states
[ ] Empty states
[ ] Error states
[ ] Success feedback
[ ] Notifications
[ ] Search
[ ] Profile
[ ] Forms
[ ] Tables
[ ] Modals

QUALITY
[ ] No dead buttons
[ ] No fake interactions
[ ] No console errors
[ ] No broken routes
[ ] No unauthorized access
[ ] No exposed secrets
[ ] No obvious overflow
[ ] No duplicated fake data
[ ] No random placeholder content

============================================================
50. FINAL INSTRUCTION
============================================================

Take ownership of the implementation.

Do not stop at a plan.

Do not only generate components.

Do not only make the UI look good.

Do not declare success because the build compiles.

Implement the system module by module.

Test each module.

Then integrate all modules.

Then test cross-role workflows.

Then perform the responsive pass.

Then perform the accessibility/security/performance pass.

Then perform the final visual polish.

The final Nivara application must be:

FUNCTIONAL
RESPONSIVE
SECURE
ROLE-AWARE
DATA-CONNECTED
SUPABASE-READY
FALLBACK-CAPABLE
ACCESSIBLE
POLISHED
AND INTERNALLY CONSISTENT.

Most importantly:

Nivara should feel like ONE REAL COLLEGE MANAGEMENT SYSTEM, not eight unrelated dashboards.

============================================================
CONCURRENT USERS & DATA INTEGRITY
============================================================

Nivara is a multi-user management system, not a single-user prototype.

All CRUD and business operations must work correctly with multiple users simultaneously.

The system must support at least 10 concurrent authenticated users for the intended demo/development deployment.

All users must operate against the same underlying database when Supabase mode is enabled.

Implement proper:

- Database transactions where required
- Foreign-key constraints
- Unique constraints
- Referential integrity
- Atomic updates
- Authorization checks
- Row Level Security
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