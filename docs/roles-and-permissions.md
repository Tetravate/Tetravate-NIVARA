# Roles and Permissions Specification — NIVARA
*“One connected college operating system where different roles interact with the same underlying data.”*

---

## 1. The 8 Role Architecture

Nivara implements **8 connected academic and administrative roles** operating on a unified, reactive data store:

```
                          ┌────────────────────────┐
                          │   Shared Campus Grid   │
                          │   (Nivara Central DB)  │
                          └───────────┬────────────┘
         ┌──────────────┬─────────────┼──────────────┬──────────────┐
         ▼              ▼             ▼              ▼              ▼
     1. Student    2. Faculty      3. HOD      4. Principal   5. Admin
         ▲              ▲             ▲              ▲              ▲
         └──────────────┴─────────────┼──────────────┴──────────────┘
                        ┌─────────────┼──────────────┐
                        ▼             ▼              ▼
                   6. Exam Cell   7. Finance    8. Placement
```

---

## 2. Role Capabilities & Operational Boundaries

### 1. Student (Aadhi Narayanan)
- **Mental Model:** Immediate personal academic reality.
- **Can:** View personalized dashboard (Right Now, Next, Needs Attention, Coming Up), view today's timetable stream, check attendance & simulate what-if scenarios, submit assignments, pay tuition fees & download verified receipts, apply for leave, view placement drives & apply, view exam hall tickets and published grade sheets.
- **Cannot:** Modify attendance, modify marks, publish results, create courses, approve leave, or alter official records.

### 2. Faculty (Dr. Priya Raman)
- **Mental Model:** Action-oriented classroom teaching workload.
- **Can:** View assigned courses & classes, execute rapid-fire attendance (1-click "Mark All Present" & toggle absents), create assignments & grade submissions, upload study materials, enter continuous internal assessment (CIA) marks, review student leave requests.
- **Cannot:** Modify official examination results, manage system users, create departments, or alter finance records.

### 3. HOD (Dr. K. Mohan)
- **Mental Model:** Department-level manager & health monitor.
- **Can:** View aggregated department attendance (derived live from faculty markings), identify at-risk students (<75% attendance / backlogs), monitor faculty workload, review & approve duty/medical leaves with attendance credit, dispatch department circulars.
- **Cannot:** Manage unrelated departments, manage system users, or modify finance ledgers.

### 4. Principal / Dean (Dr. Aris Thorne)
- **Mental Model:** College-level executive oversight (MONITOR and APPROVE).
- **Can:** View college-wide metrics (2,482 students, 148 faculty, 89.4% attendance), review department comparison radar, monitor fee recovery totals (₹20.65M collected), monitor campus placement rate (74%), broadcast college-wide circulars.
- **Cannot:** Perform low-level administrative CRUD operations or alter classroom attendance.

### 5. ERP Administrator (System Controller)
- **Mental Model:** Platform structure & master data guardian.
- **Can:** Manage departments, degree programs, classrooms, courses, timetable matrix structure, user role assignments, resolve operational room double-booking collisions, maintain master audit logs.
- **Cannot:** Casually edit academic marks or classroom attendance decisions.

### 6. Exam Cell (Prof. V. Ramanathan)
- **Mental Model:** Assessment schedules, moderation, and result publication.
- **Can:** Configure examination sessions, seating hall tickets, collect and lock faculty continuous assessment marks, moderate grade slates, officially **Publish Semester Results** (which instantly updates Student grade sheets, HOD stats, and Principal reports).

### 7. Finance / Accounts (Mrs. S. Mythili)
- **Mental Model:** Institutional cash flows & fee ledger reconciliation.
- **Can:** Configure fee structures (Semester 5 Tuition, Exam fees), track pending student dues, record manual bank/cash payments, verify online student payments, issue signed receipts, send fee payment reminder notifications.
- **Cannot:** Access unrelated academic or classroom performance records.

### 8. Placement Officer (Dr. S. Kapoor)
- **Mental Model:** Corporate hiring drives & student candidate pipelines.
- **Can:** Create corporate recruitment drives (Google DeepMind, Tetravate Labs, Microsoft), configure eligibility benchmarks (Min CGPA, allowed backlogs), review applicant pipelines, advance candidate stages (Shortlisted, Interview Scheduled, Offer Extended), track campus placement analytics.

---

## 3. Cross-Role Synchronization Flows

1. **Attendance Flow:**  
   Faculty marks lecture attendance ➔ Course attendance logs update ➔ Student attendance percentage recalculates ➔ HOD department attendance updates ➔ Principal college attendance updates ➔ Verifiable entry appended to Audit Trail.

2. **Fee Payment Flow:**  
   Student pays ₹45,000 tuition fee online ➔ Student pending dues cleared & receipt `REC-2026-NIV-xxxx` generated ➔ Finance ledger records transaction ➔ Principal financial recovery metric updates.

3. **Placement Flow:**  
   Placement Officer posts drive (Min CGPA 8.5) ➔ Eligible student (CGPA 8.72) sees drive & applies ➔ Placement Cell receives application & schedules interview ➔ Student notified ➔ HOD & Principal placement rates update.

4. **Duty Leave Flow:**  
   Student applies for Hackathon leave ➔ HOD reviews & approves ➔ Student notified & attendance duty concession granted.
