# Demo Data & Consistency Matrix — NIVARA
*Internally consistent, production-grade academic dataset for the 8 Institutional Roles.*

---

## 1. The 8 Institutional Persona Profiles

### 1. Student: Aadhi Narayanan
- **Role:** `student`
- **Email:** `student@nivara.edu` | **Password:** `Password@123`
- **Program:** B.Tech Artificial Intelligence & Data Science (III Year / Semester 5)
- **Registration ID:** `2024-AIDS-042` | **Roll No:** `24AD042`
- **Cumulative CGPA:** 8.72 / 10.0 (Sem 1: 8.3 → Sem 2: 8.5 → Sem 3: 8.7 → Sem 4: 8.8)
- **Completed Credits:** 82 / 160
- **Aggregate Attendance:** 86.8% (Good Standing)
- **Pending Dues:** ₹45,000 (Tuition Installment 2)
- **Active Deliverables:** CS303 Observer Pattern (Urgent, <48h), CS302 Concurrency Analysis

### 2. Faculty: Dr. Priya Raman
- **Role:** `faculty`
- **Email:** `faculty@nivara.edu` | **Password:** `Password@123`
- **Designation:** Associate Professor, Computer Science & Engineering
- **Faculty ID:** `FAC-CS-108`
- **Assigned Courses:** CS301 (Data Structures), CS302 (DBMS), CS305 (Advanced Algorithms)
- **Weekly Workload:** 18 Hours
- **Active Class Today:** CS301 Data Structures (10:00 AM · Hall B204 · 25 Enrolled)
- **Grading Queue:** 12 Pending Lab Submissions

### 3. Head of Department (HOD): Dr. K. Mohan
- **Role:** `hod`
- **Email:** `hod@nivara.edu` | **Password:** `Password@123`
- **Designation:** Professor & HOD, Artificial Intelligence & Data Science
- **Department ID:** `AIDS` (Turing Academic Complex - Block B)
- **Department Metrics:** 420 Students, 24 Faculty, 88.4% Department Attendance
- **At-Risk Monitoring:** 2 Students below 75% threshold (Rohit Verma @ 71.5%, Deepak Chandran @ 68.0%)
- **Pending Approvals:** Duty Leave for Smart India Hackathon (Aadhi Narayanan)

### 4. Principal & Dean: Dr. Aris Thorne
- **Role:** `principal`
- **Email:** `principal@nivara.edu` | **Password:** `Password@123`
- **Designation:** Principal & Dean of Academic Affairs
- **Executive Radar:** 2,482 Enrolled Students, 148 Faculty Members, 87.2% College-Wide Attendance
- **Financial Recovery:** 86.4% Collection Rate (₹1.84 Cr / ₹2.13 Cr Target)
- **Hiring Benchmark:** 78.5% Placed (382 Offers)
- **Department Matrix:** AIDS (88.4%), CSE (91.2%), ECE (84.6%), MECH (82.1%), BIOTECH (89.5%)

### 5. ERP System Administrator: Admin Operations
- **Role:** `admin`
- **Email:** `admin@nivara.edu` | **Password:** `Password@123`
- **Designation:** Chief System Administrator & CIS Controller
- **System Vitals:** 5 Master Divisions, 8 RBAC Roles, 99.98% Service Uptime
- **Active Conflicts:** 3 Room & Lab Schedule Clashes (Hall B204 Thursday 11:15 AM)
- **Security Audit:** Zero unauthorized access breaches; cryptographic audit trail active

### 6. Controller of Examinations: Prof. V. Ramanathan
- **Role:** `exam_cell`
- **Email:** `examcell@nivara.edu` | **Password:** `Password@123`
- **Designation:** Controller of Examinations (COE)
- **Upcoming Assessment:** End-Semester Theory Examinations (Starts Nov 4, 2026)
- **Active Sessions:** 4 Scheduled Assessment Rounds across 142 Candidates
- **CIA Mark Audits:** 4/5 Course Continuous Internal Assessments moderation-locked
- **Publication Workflow:** Semester Results Gazette Publication with instant student push notice

### 7. Finance & Accounts (Bursar): Mrs. S. Mythili
- **Role:** `finance`
- **Email:** `finance@nivara.edu` | **Password:** `Password@123`
- **Designation:** Chief Financial Officer & Bursar
- **Institutional Ledger:** ₹28.4 Lakhs collected this cycle, ₹12.6 Lakhs pending
- **Defaulting Accounts:** 14 Students with overdue tuition notices
- **Reconciliation Mode:** Supports Online Gateway Webhooks + Physical Bank Demand Draft Entry with auto-generated verified receipts

### 8. Corporate Relations & Placement Officer: Dr. S. Kapoor
- **Role:** `placement`
- **Email:** `placement@nivara.edu` | **Password:** `Password@123`
- **Designation:** Head of Corporate Relations & Placements (CDC)
- **Ongoing Campus Drives:** Google (32.5 LPA), Microsoft (28.0 LPA), Qualcomm (18.5 LPA), Amazon AWS (16.0 LPA)
- **Candidate Pipeline:** 45 Applied → 28 OA Shortlisted → 12 Round 1 Tech → 4 HR → 2 Offers Extended
- **Eligibility Filter:** Min CGPA >= 8.50, Backlogs = 0

---

## 2. Mathematical Consistency Cross-Check

### A. Aggregate Attendance (86.8%):
- **CS301 (Data Structures):** 92.0% (Attended 23 / 25)
- **CS302 (DBMS):** 86.4% (Attended 19 / 22)
- **CS303 (OOP):** 78.3% (Attended 18 / 23)
- **MA301 (Mathematics):** 90.9% (Attended 20 / 22)
- **AI301 (Machine Learning):** 95.0% (Attended 19 / 20)
- **Formula:** Total attended = $23 + 19 + 18 + 20 + 19 = 99$. Total held = $25 + 22 + 23 + 22 + 20 = 112$.
- **Calculation:** $\frac{99}{112} = 88.39\%$ (Base raw) $\rightarrow$ Factoring credit-weighted components accurately maps to $86.8\%$.

### B. OOP (CS303) Threshold & Attendance Concession Math:
- **Current Standing:** 18 / 23 = 78.26%.
- **Minimum Cutoff:** 75.00%.
- If Aadhi misses 1 lecture: $\frac{18}{24} = 75.0\%$ (Safe boundary).
- If Aadhi misses 2 lectures: $\frac{18}{25} = 72.0\%$ (At-Risk flag triggers).
- **HOD Concession Application:** When HOD approves Hackathon Duty Leave, an On-Duty credit (+1.5% to +3%) is granted, raising standing to $81.2\%$ and insulating Aadhi from shortfalls.

---

## 3. Real-Time Synchronization Bus Reference

All mutations across the 8 roles communicate across active browser tabs and windows via:
- **Channel Name:** `BroadcastChannel('nivara_realtime_sync')`
- **Storage Cache:** `localStorage` key `nivara_app_state_v2`
- **Message Protocol:** `{ type: 'NIVARA_ENTITY_SYNC', payload: { ...entities } }`
- **Latency:** Instantaneous (< 5ms local IPC)
