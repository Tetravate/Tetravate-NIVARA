# Information Architecture — CAMPUS
*Streamlined academic navigation hierarchy designed for students, faculty, and administration.*

---

## Architecture Overview

Traditional ERPs present an inverted tree with 40+ sub-menus categorized strictly by administrative jurisdiction (e.g. *Office of the Registrar*, *Controller of Examinations*, *Department Library*). 

CAMPUS inverts this model: **Role-Oriented Mental Models** divide functionality into what matters to the specific human logged in.

---

## 1. Student Information Architecture

```
Student Experience
│
├── 01. Home (Personalized Daily Operating Hub)
│   ├── Urgent Banner (Condition-driven: Low attendance / Exam alert / None)
│   ├── Right Now (Active period status, remaining class duration)
│   ├── Next Class (Room number, subject, professor, time)
│   ├── Needs Attention (Assignments due in <48h, fee receipt, verify draft)
│   └── Coming Up (Upcoming exams, internal tests, club events)
│
├── 02. Today (Chronological Day Stream)
│   ├── Timeline View (08:30 Mathematics → 10:30 Data Structures → 01:30 Lunch → 02:30 DBMS)
│   ├── Session Status Badges (✓ Attended, • In Progress, → Upcoming, Free Slot)
│   └── Free Period Insight Card (“Free for 90 Minutes: Study / Break / Library”)
│
├── 03. Academics (Academic Performance & Tracking)
│   ├── Attendance View
│   │   ├── Overall Aggregate Meter (87% · On Track)
│   │   ├── Subject-by-Subject Breakdown (Attended vs Missed)
│   │   └── Dynamic “Can I Miss?” Calculation Simulator
│   ├── Assignments Hub
│   │   ├── Filter by: Due Soon, In Progress, Submitted, Evaluated
│   │   └── Direct Action: Completion checklist & attachment submission
│   ├── Exam Timeline
│   │   ├── Chronological assessment list with hall tickets & seating block
│   │   └── Syllabus & guidelines drawer
│   └── Results & CGPA
│       ├── Semester 1 through 8 Progression
│       ├── CGPA Trend line (8.4 → 8.6 → 8.7)
│       └── Grade sheets with credit weights (A+, A, B+)
│
├── 04. Timetable
│   ├── Mode Switcher: Today (Linear Timeline) | Week (Responsive Matrix)
│   ├── Highlighting for Current Time Slot and Open Recesses
│   └── Export / Sync to Calendar (iCal, Google Calendar format)
│
├── 05. Campus Life & Events
│   ├── Category Pills (Technical, Cultural, Sports, Placement, Workshops)
│   └── Event Cards with Date, Hall, Organizer & 1-Click RSVP
│
├── 06. Bulletins & Announcements
│   ├── Triage Tabs: All, Departmental, Academic, Placement
│   └── Clean Markdown Reader Modal (No raw scans or illegible PDF walls)
│
├── 07. Notifications Center
│   ├── Grouped by Urgency: Needs Action, Important, Updates, Informational
│   └── “Mark all as read” with zero-state calm animation
│
└── 08. Student Profile & Credentials
    ├── Student ID (2024-AD-042), Roll No, Dept of AI & Data Science
    ├── Academic Standing & Credits Audit (82 / 160 completed)
    └── Settings: Light/Dark Theme, Offline cache toggle, Notification preferences
```

---

## 2. Faculty Information Architecture

```
Faculty Experience
│
├── 01. Faculty Home (Action-Centric Dashboard)
│   ├── Faculty Greeting (“Good Morning, Dr. Priya”)
│   ├── Today’s Quick Metrics: 3 Classes, 2 Assignments Pending Review, 1 Attendance Due
│   └── Active Class Hero: Data Structures (10:00 AM · Room B204) → [Take Attendance CTA]
│
├── 02. Attendance Workflow (Rapid-Fire Roster)
│   ├── Class Select (III AI & DS — 28 Students)
│   ├── Instant Quick Action: [Mark All Present]
│   ├── Single-Tap Absent/Late Toggles
│   └── Real-time summary (25 Present, 3 Absent) → [Save & Dispatch Attendance]
│
├── 03. Course & Assignment Management
│   ├── Active Courses: Data Structures (CS301), Algorithm Design (CS305)
│   ├── Assignment Submissions Tracker (24/28 Received)
│   └── Quick Grade & Feedback Entry Drawer
│
├── 04. Timetable & Office Hours
│   ├── Weekly Faculty Teaching Schedule
│   └── Student Consultation Slots configuration
│
└── 05. Announcements Dispatch
    └── Post verified updates to target batches/departments
```

---

## 3. Administrator Information Architecture

```
Administrator Experience
│
├── 01. Executive Overview
│   ├── Institutional Vital Signs (2,482 Students, 148 Faculty, 91.2% Campus Attendance)
│   ├── Action Required Priority Feed:
│   │   ├── 3 Timetable Room Conflicts (Hall B204 double-booked)
│   │   ├── 7 Pending Academic Approvals (Leave requests & elective changes)
│   │   └── 4 Result Moderation Dispatches
│   └── Departmental Attendance Heatmap (AI&DS: 93%, Mech: 86%, ECE: 89%)
│
├── 02. Student & Faculty Directory
│   ├── Instant Global Search with filters by Batch, Department, Status
│   └── Quick Student Profile & Enrollment dossier
│
├── 03. Department & Course Logistics
│   ├── Academic Calendar management
│   └── Course allocation matrix
│
└── 04. Safety-Gated Administrative Controls
    ├── Two-step Confirmation Modals on Destructive Actions (Purge, Archive, Publish Results)
    └── Audit log of administrative state changes
```

---

## Global Cross-Cutting Navigation

- **Global Command Palette (`Ctrl + K` or `⌘ + K`):** Jump to any subject, student, faculty room, or trigger instant actions (*"Mark Attendance"*, *"Open Timetable"*, *"Switch Role"*).
- **Persistent Role Selector:** Instant frictionless switching between *Student Demo (Aadhi)*, *Faculty Demo (Dr. Priya)*, and *Admin Demo (Dean's Office)*.
- **Unified Quick Search:** Filterable by courses, rooms, faculty, documents, and upcoming college events.
