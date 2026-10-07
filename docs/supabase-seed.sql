-- ====================================================================
-- NIVARA — Institutional Database Seed Data
-- Aligned with docs/supabase-schema.sql and src/data/mockData.js
-- Run this in the Supabase SQL Editor to populate all 8 roles and demo data
-- ====================================================================

-- 1. DEPARTMENTS
INSERT INTO public.departments (code, name, building, student_count, faculty_count, avg_attendance, budget_allocated, budget_spent)
VALUES
    ('AIDS', 'Artificial Intelligence & Data Science', 'Turing Academic Complex - Block B', 420, 24, 88.4, 4500000.00, 3120000.00),
    ('CSE', 'Computer Science & Engineering', 'Alan Turing Block - Block A', 780, 42, 91.2, 7200000.00, 5600000.00),
    ('ECE', 'Electronics & Communication', 'Maxwell Electronics Wing', 540, 30, 84.6, 5100000.00, 3950000.00),
    ('MECH', 'Mechanical Engineering', 'Kalam Engineering Pavilion', 410, 26, 82.1, 4800000.00, 3700000.00),
    ('BIOTECH', 'Biotechnology & Bio-Computing', 'Rosalind Franklin Research Center', 332, 26, 89.5, 4200000.00, 2900000.00)
ON CONFLICT (code) DO UPDATE SET
    student_count = EXCLUDED.student_count,
    avg_attendance = EXCLUDED.avg_attendance;

-- 2. INSTITUTIONAL PROFILES (8 Demo Roles)
INSERT INTO public.profiles (email, full_name, role, title, department, dept_code, avatar_url, status)
VALUES
    ('student@nivara.edu', 'Aadhi Narayanan', 'student', 'Undergraduate Scholar · Sem 5', 'Artificial Intelligence & Data Science', 'AIDS', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'active'),
    ('faculty@nivara.edu', 'Dr. Priya Raman', 'faculty', 'Associate Professor · Dept of CS & AI', 'Computer Science & Engineering', 'CSE', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'active'),
    ('hod@nivara.edu', 'Dr. K. Mohan', 'hod', 'Head of Department & Professor', 'Artificial Intelligence & Data Science', 'AIDS', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'active'),
    ('principal@nivara.edu', 'Dr. Aris Thorne', 'principal', 'Principal & Dean of Academics', 'Executive Academic Council', 'CSE', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'active'),
    ('admin@nivara.edu', 'Admin Operations', 'admin', 'Chief System Administrator', 'Campus Information Systems', 'CSE', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'active'),
    ('examcell@nivara.edu', 'Prof. V. Ramanathan', 'exam_cell', 'Controller of Examinations', 'Academic Evaluation & Exam Cell', 'CSE', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'active'),
    ('finance@nivara.edu', 'Mrs. S. Mythili', 'finance', 'Chief Financial Officer & Bursar', 'Office of the Bursar & Accounts', 'AIDS', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', 'active'),
    ('placement@nivara.edu', 'Dr. S. Kapoor', 'placement', 'Head of Corporate Relations & Placements', 'Career Development Center', 'CSE', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150', 'active')
ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

-- 3. STUDENTS
INSERT INTO public.students (id, roll_no, name, email, department, dept_code, year, semester, cgpa, attendance_pct, backlogs, advisor, fee_status, fee_pending_amount)
VALUES
    ('2024-AIDS-042', '24AD042', 'Aadhi Narayanan', 'student@nivara.edu', 'Artificial Intelligence & Data Science', 'AIDS', '3rd Year', 5, 8.72, 86.80, 0, 'Dr. Priya Raman', 'pending', 45000.00),
    ('2024-AIDS-015', '24AD015', 'Kavya S.', 'kavya.s@nivara.edu', 'Artificial Intelligence & Data Science', 'AIDS', '3rd Year', 5, 9.15, 94.20, 0, 'Dr. Priya Raman', 'paid', 0.00),
    ('2024-AIDS-089', '24AD089', 'Rohit Verma', 'rohit.v@nivara.edu', 'Artificial Intelligence & Data Science', 'AIDS', '3rd Year', 5, 6.20, 71.50, 2, 'Dr. Priya Raman', 'pending', 60000.00),
    ('2024-AIDS-102', '24AD102', 'Ananya Deshmukh', 'ananya.d@nivara.edu', 'Artificial Intelligence & Data Science', 'AIDS', '3rd Year', 5, 7.85, 82.00, 0, 'Dr. Priya Raman', 'paid', 0.00),
    ('2024-AIDS-033', '24AD033', 'Deepak Chandran', 'deepak.c@nivara.edu', 'Artificial Intelligence & Data Science', 'AIDS', '3rd Year', 5, 5.80, 68.00, 3, 'Dr. Priya Raman', 'pending', 45000.00)
ON CONFLICT (id) DO UPDATE SET
    attendance_pct = EXCLUDED.attendance_pct,
    fee_pending_amount = EXCLUDED.fee_pending_amount;

-- 4. FACULTY MEMBERS
INSERT INTO public.faculty (id, name, email, department, dept_code, designation, qualification, workload_hours, ongoing_courses)
VALUES
    ('FAC-CS-108', 'Dr. Priya Raman', 'faculty@nivara.edu', 'Computer Science & Engineering', 'CSE', 'Associate Professor', 'Ph.D in Machine Learning (IIT Madras)', 18, 'CS301, CS302, CS305'),
    ('FAC-AI-102', 'Dr. K. Mohan', 'hod@nivara.edu', 'Artificial Intelligence & Data Science', 'AIDS', 'Professor & HOD', 'Ph.D in Deep Learning', 14, 'AI401, AI502'),
    ('FAC-CS-204', 'Prof. Arvind Swamy', 'arvind.s@nivara.edu', 'Computer Science & Engineering', 'CSE', 'Assistant Professor', 'M.Tech in Cloud Computing', 22, 'CS303, CS304'),
    ('FAC-EC-115', 'Dr. Meenakshi Sundaram', 'meenakshi.s@nivara.edu', 'Electronics & Communication', 'ECE', 'Associate Professor', 'Ph.D in VLSI Design', 20, 'EC201, EC301')
ON CONFLICT (id) DO UPDATE SET
    workload_hours = EXCLUDED.workload_hours;

-- 5. COURSES
INSERT INTO public.courses (code, name, department, dept_code, credits, faculty_id, room_default, semester, total_classes, attended_classes, pct)
VALUES
    ('CS301', 'Data Structures & Algorithms', 'Artificial Intelligence & Data Science', 'AIDS', 4, 'FAC-CS-108', 'Hall B204', 5, 25, 23, 92.00),
    ('CS302', 'Database Management Systems', 'Artificial Intelligence & Data Science', 'AIDS', 4, 'FAC-CS-108', 'Hall B104', 5, 22, 19, 86.40),
    ('CS303', 'Object-Oriented Programming (OOP)', 'Artificial Intelligence & Data Science', 'AIDS', 3, 'FAC-CS-204', 'Lab 3', 5, 23, 18, 78.30),
    ('MA301', 'Discrete Mathematics & Probability', 'Artificial Intelligence & Data Science', 'AIDS', 4, 'FAC-AI-102', 'Hall A101', 5, 22, 20, 90.90),
    ('AI301', 'Machine Learning Foundations', 'Artificial Intelligence & Data Science', 'AIDS', 4, 'FAC-CS-108', 'AI Lab 2', 5, 20, 19, 95.00)
ON CONFLICT (code) DO UPDATE SET
    pct = EXCLUDED.pct;

-- 6. ASSIGNMENTS
INSERT INTO public.assignments (id, course_code, course_name, title, due_date, urgency, submitted_count, total_count, max_score)
VALUES
    ('asg-1', 'CS303', 'Object-Oriented Programming (OOP)', 'Design Pattern Implementation (Observer & Strategy)', '2026-10-18T23:59:00Z', 'urgent', 38, 42, 100),
    ('asg-2', 'CS302', 'Database Management Systems', 'B+ Tree Indexing & Transaction Concurrency Analysis', '2026-10-21T18:00:00Z', 'warning', 28, 42, 50),
    ('asg-3', 'AI301', 'Machine Learning Foundations', 'Gradient Descent Optimization from Scratch in Python', '2026-10-25T23:59:00Z', 'normal', 14, 42, 100)
ON CONFLICT (id) DO NOTHING;

-- 7. PLACEMENT DRIVES
INSERT INTO public.placement_drives (id, company_name, role_title, ctc_lpa, min_cgpa, eligible_branches, deadline, total_applicants, status)
VALUES
    ('drive-1', 'Google', 'Associate Software Engineer (SWE)', 32.5, 8.50, ARRAY['CSE', 'AIDS'], '2026-10-24', 45, 'active'),
    ('drive-2', 'Microsoft', 'Software Development Engineer I', 28.0, 8.00, ARRAY['CSE', 'AIDS', 'ECE'], '2026-10-28', 78, 'active'),
    ('drive-3', 'Qualcomm', 'Systems Engineer (Embedded AI)', 18.5, 7.50, ARRAY['ECE', 'CSE', 'AIDS'], '2026-11-02', 62, 'active'),
    ('drive-4', 'Amazon AWS', 'Cloud Support Associate', 16.0, 7.00, ARRAY['CSE', 'AIDS', 'ECE', 'MECH'], '2026-11-10', 95, 'active')
ON CONFLICT (id) DO NOTHING;

-- 8. ROOM CONFLICTS (Admin & Timetable)
INSERT INTO public.room_conflicts (id, room_name, time_slot, department, day, conflict_details, resolved)
VALUES
    ('conf-1', 'Hall B204', '11:15 AM - 12:15 PM', 'AIDS vs CSE', 'Thursday', 'CS301 (III AIDS) overlapping with CS402 (IV CSE)', false),
    ('conf-2', 'AI Lab 2', '02:00 PM - 04:00 PM', 'AIDS vs ECE', 'Friday', 'ML Lab Session conflicting with Embedded Systems Lab', false),
    ('conf-3', 'Seminar Audi 1', '03:30 PM - 05:00 PM', 'ECE vs MECH', 'Monday', 'Industry Keynote booked simultaneously by two departments', false)
ON CONFLICT (id) DO NOTHING;

-- 9. EXAM SESSIONS (Exam Cell)
INSERT INTO public.exam_sessions (id, subject_code, subject_name, exam_date, time_slot, venue, total_candidates, status)
VALUES
    ('exam-1', 'CS301', 'Data Structures & Algorithms', '2026-11-04', '09:30 AM - 12:30 PM', 'Central Examination Hall - Wing A', 142, 'Scheduled'),
    ('exam-2', 'CS302', 'Database Management Systems', '2026-11-07', '09:30 AM - 12:30 PM', 'Central Examination Hall - Wing B', 142, 'Scheduled'),
    ('exam-3', 'MA301', 'Discrete Mathematics', '2026-11-11', '09:30 AM - 12:30 PM', 'Academic Block A - Halls 101-104', 142, 'Scheduled'),
    ('exam-4', 'AI301', 'Machine Learning Foundations', '2026-11-14', '01:30 PM - 04:30 PM', 'AI Complex - Halls B201-B204', 142, 'Scheduled')
ON CONFLICT (id) DO NOTHING;

-- 10. AUDIT TRAIL LOGS
INSERT INTO public.audit_logs (id, timestamp, actor_name, actor_role, action, target, ip_address, status)
VALUES
    ('log-101', NOW() - INTERVAL '10 minutes', 'Dr. Priya Raman', 'faculty', 'Attendance Session Submission', 'Course CS301 (25 Students Marked)', '192.168.1.104', 'success'),
    ('log-102', NOW() - INTERVAL '25 minutes', 'Dr. K. Mohan', 'hod', 'Duty Leave Sanctioned', 'Student: Aadhi Narayanan (Smart India Hackathon)', '192.168.1.52', 'success'),
    ('log-103', NOW() - INTERVAL '40 minutes', 'Mrs. S. Mythili', 'finance', 'Offline Demand Draft Reconciliation', 'Receipt #NVR-2026-8812 (Rs. 45,000)', '192.168.2.14', 'success'),
    ('log-104', NOW() - INTERVAL '1 hour', 'Prof. V. Ramanathan', 'exam_cell', 'CIA Internal Marks Audit & Lock', 'CS301 Continuous Assessments Approved', '192.168.3.8', 'success')
ON CONFLICT (id) DO NOTHING;

-- 11. ACADEMIC STRUCTURE (Programs, Academic Years, Sections)
INSERT INTO public.programs (code, name, dept_code, degree, total_semesters)
VALUES
    ('PRG-AIDS', 'B.Tech Artificial Intelligence & Data Science', 'AIDS', 'B.Tech', 8),
    ('PRG-CSE', 'B.Tech Computer Science & Engineering', 'CSE', 'B.Tech', 8),
    ('PRG-ECE', 'B.Tech Electronics & Communication', 'ECE', 'B.Tech', 8)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.academic_years (year_label, is_current, start_date, end_date)
VALUES
    ('2026-2027', true, '2026-07-01', '2027-05-30')
ON CONFLICT (year_label) DO NOTHING;

INSERT INTO public.classes_sections (code, dept_code, program_code, year, semester, section_name, room_default, advisor_name)
VALUES
    ('AIDS-3A', 'AIDS', 'PRG-AIDS', '3rd Year', 5, 'A', 'Hall B204', 'Dr. Priya Raman'),
    ('AIDS-3B', 'AIDS', 'PRG-AIDS', '3rd Year', 5, 'B', 'Hall B205', 'Dr. K. Mohan'),
    ('CSE-3A', 'CSE', 'PRG-CSE', '3rd Year', 5, 'A', 'Hall A104', 'Prof. Arvind Swamy')
ON CONFLICT (code) DO NOTHING;

-- 12. UNIFIED TIMETABLE ENTRIES
INSERT INTO public.timetable_entries (course_code, subject_name, faculty_name, section_code, dept_code, day_of_week, time_slot, start_time, end_time, room, is_lab)
VALUES
    ('CS301', 'Data Structures & Algorithms', 'Dr. Priya Raman', 'AIDS-3A', 'AIDS', 'Monday', '09:00 AM - 10:00 AM', '09:00:00', '10:00:00', 'Hall B204', false),
    ('CS302', 'Database Management Systems', 'Dr. Priya Raman', 'AIDS-3A', 'AIDS', 'Monday', '10:15 AM - 11:15 AM', '10:15:00', '11:15:00', 'Hall B104', false),
    ('CS303', 'Object-Oriented Programming (OOP)', 'Prof. Arvind Swamy', 'AIDS-3A', 'AIDS', 'Tuesday', '11:30 AM - 12:30 PM', '11:30:00', '12:30:00', 'Lab 3', true),
    ('MA301', 'Discrete Mathematics & Probability', 'Dr. K. Mohan', 'AIDS-3A', 'AIDS', 'Wednesday', '09:00 AM - 10:00 AM', '09:00:00', '10:00:00', 'Hall A101', false),
    ('AI301', 'Machine Learning Foundations', 'Dr. Priya Raman', 'AIDS-3A', 'AIDS', 'Thursday', '02:00 PM - 04:00 PM', '14:00:00', '16:00:00', 'AI Lab 2', true)
ON CONFLICT DO NOTHING;

-- 13. COURSE MATERIALS
INSERT INTO public.course_materials (course_code, subject_name, title, description, faculty_name, material_type, file_name, file_url, file_size_kb, visibility, section_code)
VALUES
    ('CS301', 'Data Structures & Algorithms', 'Unit 3: Balanced Trees (AVL & Red-Black)', 'Complete lecture slides with rotation complexity analysis', 'Dr. Priya Raman', 'Lecture Notes', 'CS301_Unit3_BalancedTrees.pdf', 'https://storage.nivara.edu/courseware/CS301_Unit3.pdf', 3420, 'enrolled', 'AIDS-3A'),
    ('CS302', 'Database Management Systems', 'ACID Transactions & Two-Phase Locking', 'Concurrency control and isolation levels walkthrough', 'Dr. Priya Raman', 'Lecture Notes', 'CS302_Lec14_Transactions.pdf', 'https://storage.nivara.edu/courseware/CS302_Lec14.pdf', 2150, 'enrolled', 'AIDS-3A'),
    ('CS303', 'Object-Oriented Programming', 'Lab Manual: Structural & Behavioral Design Patterns', 'Observer, Strategy, Factory patterns skeleton code', 'Prof. Arvind Swamy', 'Lab Manual', 'CS303_LabManual_Patterns.pdf', 'https://storage.nivara.edu/courseware/CS303_Manual.pdf', 4890, 'enrolled', 'AIDS-3A')
ON CONFLICT DO NOTHING;

-- 14. REVALUATION & GRADE CHALLENGES
INSERT INTO public.revaluation_requests (student_id, student_name, roll_no, course_code, subject_name, semester, original_grade, original_marks, reason, status)
VALUES
    ('2024-AIDS-042', 'Aadhi Narayanan', '24AD042', 'CS302', 'Database Management Systems', 4, 'B+', 76, 'Question 4b relational algebra calculation was marked uncredited despite correct tuple reduction.', 'submitted')
ON CONFLICT DO NOTHING;

-- 15. SCHOLARSHIPS & FEE CONCESSIONS
INSERT INTO public.fee_concessions (student_id, student_name, category, amount, status, sanctioned_by)
VALUES
    ('2024-AIDS-042', 'Aadhi Narayanan', 'Merit Scholarship (Top 5% CGPA)', 15000.00, 'approved', 'Office of the Bursar'),
    ('2024-AIDS-015', 'Kavya S.', 'Dean Honor Roll Concession', 20000.00, 'approved', 'Office of the Bursar')
ON CONFLICT DO NOTHING;

-- 16. CATEGORIZED ANNOUNCEMENTS
INSERT INTO public.announcements (title, content, scope, target_dept, priority, published_by, published_role)
VALUES
    ('End-Semester Theory Examinations Timetable', 'Detailed examination seating arrangement and hall tickets available in the examination portal.', 'institutional', NULL, 'important', 'Prof. V. Ramanathan', 'exam_cell'),
    ('Hackathon Duty Leave Sanction Circular', 'Students representing the institution at Smart India Hackathon are granted on-duty attendance credit.', 'department', 'AIDS', 'normal', 'Dr. K. Mohan', 'hod'),
    ('Campus Recruitment Drive: Google SWE 2026', 'Online Assessment round scheduled for eligible candidates with CGPA >= 8.5.', 'institutional', NULL, 'urgent', 'Dr. S. Kapoor', 'placement')
ON CONFLICT DO NOTHING;

