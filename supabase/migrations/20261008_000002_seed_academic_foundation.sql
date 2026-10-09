-- ====================================================================
-- NIVARA ERP — Institutional Academic Master Foundation Seed
-- Populates foundational departments, programs, academic years, sections,
-- courses, faculty members, institutional accounts, and core structures.
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

-- 2. ACADEMIC STRUCTURE (Programs, Academic Years, Sections)
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

-- 3. INSTITUTIONAL PROFILES (8 Core Roles)
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

-- 4. FACULTY MEMBERS
INSERT INTO public.faculty (id, name, email, department, dept_code, designation, qualification, workload_hours, ongoing_courses)
VALUES
    ('FAC-CS-108', 'Dr. Priya Raman', 'faculty@nivara.edu', 'Computer Science & Engineering', 'CSE', 'Associate Professor', 'Ph.D in Machine Learning (IIT Madras)', 18, 'CS301, CS302, CS305'),
    ('FAC-AI-102', 'Dr. K. Mohan', 'hod@nivara.edu', 'Artificial Intelligence & Data Science', 'AIDS', 'Professor & HOD', 'Ph.D in Deep Learning', 14, 'AI401, AI502'),
    ('FAC-CS-204', 'Prof. Arvind Swamy', 'arvind.s@nivara.edu', 'Computer Science & Engineering', 'CSE', 'Assistant Professor', 'M.Tech in Cloud Computing', 22, 'CS303, CS304'),
    ('FAC-EC-115', 'Dr. Meenakshi Sundaram', 'meenakshi.s@nivara.edu', 'Electronics & Communication', 'ECE', 'Associate Professor', 'Ph.D in VLSI Design', 20, 'EC201, EC301')
ON CONFLICT (id) DO UPDATE SET
    workload_hours = EXCLUDED.workload_hours;

-- 5. STUDENTS
INSERT INTO public.students (id, roll_no, name, email, department, dept_code, year, semester, cgpa, attendance_pct, backlogs, advisor, fee_status, fee_pending_amount, class_section_code)
VALUES
    ('2024-AIDS-042', '24AD042', 'Aadhi Narayanan', 'student@nivara.edu', 'Artificial Intelligence & Data Science', 'AIDS', '3rd Year', 5, 8.72, 86.80, 0, 'Dr. Priya Raman', 'pending', 45000.00, 'AIDS-3A'),
    ('2024-AIDS-015', '24AD015', 'Kavya S.', 'kavya.s@nivara.edu', 'Artificial Intelligence & Data Science', 'AIDS', '3rd Year', 5, 9.15, 94.20, 0, 'Dr. Priya Raman', 'paid', 0.00, 'AIDS-3A'),
    ('2024-AIDS-089', '24AD089', 'Rohit Verma', 'rohit.v@nivara.edu', 'Artificial Intelligence & Data Science', 'AIDS', '3rd Year', 5, 6.20, 71.50, 2, 'Dr. Priya Raman', 'pending', 60000.00, 'AIDS-3A'),
    ('2024-AIDS-102', '24AD102', 'Ananya Deshmukh', 'ananya.d@nivara.edu', 'Artificial Intelligence & Data Science', 'AIDS', '3rd Year', 5, 7.85, 82.00, 0, 'Dr. Priya Raman', 'paid', 0.00, 'AIDS-3A'),
    ('2024-AIDS-033', '24AD033', 'Deepak Chandran', 'deepak.c@nivara.edu', 'Artificial Intelligence & Data Science', 'AIDS', '3rd Year', 5, 5.80, 68.00, 3, 'Dr. Priya Raman', 'pending', 45000.00, 'AIDS-3A')
ON CONFLICT (id) DO UPDATE SET
    attendance_pct = EXCLUDED.attendance_pct,
    fee_pending_amount = EXCLUDED.fee_pending_amount;

-- 6. COURSES
INSERT INTO public.courses (code, name, department, dept_code, credits, faculty_id, instructor_name, room_default, semester, total_classes, attended_classes, pct)
VALUES
    ('CS301', 'Data Structures & Algorithms', 'Artificial Intelligence & Data Science', 'AIDS', 4, 'FAC-CS-108', 'Dr. Priya Raman', 'Hall B204', 5, 25, 23, 92.00),
    ('CS302', 'Database Management Systems', 'Artificial Intelligence & Data Science', 'AIDS', 4, 'FAC-CS-108', 'Dr. Priya Raman', 'Hall B104', 5, 22, 19, 86.40),
    ('CS303', 'Object-Oriented Programming (OOP)', 'Artificial Intelligence & Data Science', 'AIDS', 3, 'FAC-CS-204', 'Prof. Arvind Swamy', 'Lab 3', 5, 23, 18, 78.30),
    ('MA301', 'Discrete Mathematics & Probability', 'Artificial Intelligence & Data Science', 'AIDS', 4, 'FAC-AI-102', 'Dr. K. Mohan', 'Hall A101', 5, 22, 20, 90.90),
    ('AI301', 'Machine Learning Foundations', 'Artificial Intelligence & Data Science', 'AIDS', 4, 'FAC-CS-108', 'Dr. Priya Raman', 'AI Lab 2', 5, 20, 19, 95.00)
ON CONFLICT (code) DO UPDATE SET
    pct = EXCLUDED.pct;

-- 7. TIMETABLE ENTRIES
INSERT INTO public.timetable_entries (course_code, subject_name, faculty_name, section_code, dept_code, day_of_week, time_slot, start_time, end_time, room, is_lab)
VALUES
    ('CS301', 'Data Structures & Algorithms', 'Dr. Priya Raman', 'AIDS-3A', 'AIDS', 'Monday', '09:00 AM - 10:00 AM', '09:00:00', '10:00:00', 'Hall B204', false),
    ('CS302', 'Database Management Systems', 'Dr. Priya Raman', 'AIDS-3A', 'AIDS', 'Monday', '10:15 AM - 11:15 AM', '10:15:00', '11:15:00', 'Hall B104', false),
    ('CS303', 'Object-Oriented Programming (OOP)', 'Prof. Arvind Swamy', 'AIDS-3A', 'AIDS', 'Tuesday', '11:30 AM - 12:30 PM', '11:30:00', '12:30:00', 'Lab 3', true),
    ('MA301', 'Discrete Mathematics & Probability', 'Dr. K. Mohan', 'AIDS-3A', 'AIDS', 'Wednesday', '09:00 AM - 10:00 AM', '09:00:00', '10:00:00', 'Hall A101', false),
    ('AI301', 'Machine Learning Foundations', 'Dr. Priya Raman', 'AIDS-3A', 'AIDS', 'Thursday', '02:00 PM - 04:00 PM', '14:00:00', '16:00:00', 'AI Lab 2', true)
ON CONFLICT DO NOTHING;

-- 8. FEE STRUCTURES
INSERT INTO public.fee_structures (id, category, amount, frequency, due_date, academic_year)
VALUES
    ('fee-1', 'Annual Tuition & Academic Facilities Fee', 125000.00, 'Annual', '2026-11-15', '2026-2027'),
    ('fee-2', 'High-Performance AI & Cloud Computing Lab Fee', 25000.00, 'Semester', '2026-10-31', '2026-2027'),
    ('fee-3', 'University Examination & Assessment Registration', 6500.00, 'Semester', '2026-11-05', '2026-2027')
ON CONFLICT (id) DO NOTHING;

-- 9. RECRUITING COMPANIES
INSERT INTO public.companies (id, name, category, website, hr_contact, hr_email, active_status)
VALUES
    ('comp-1', 'Google', 'Tier-1 Product', 'https://careers.google.com', 'Sarah Jenkins', 'sjenkins@google.com', 'active'),
    ('comp-2', 'Microsoft', 'Tier-1 Product', 'https://careers.microsoft.com', 'Rohan Mehta', 'rohanm@microsoft.com', 'active'),
    ('comp-3', 'Qualcomm', 'Semiconductor / Embedded', 'https://qualcomm.com', 'Ananya Roy', 'aroy@qualcomm.com', 'active'),
    ('comp-4', 'Amazon AWS', 'Cloud Services', 'https://amazon.jobs', 'David Chen', 'dchen@amazon.com', 'active')
ON CONFLICT (id) DO NOTHING;

-- 10. PLACEMENT DRIVES
INSERT INTO public.placement_drives (id, company, company_name, role, role_title, package_lpa, ctc_lpa, min_cgpa, allowed_backlogs, location, deadline, status, eligible_count, applied_count)
VALUES
    ('drive-1', 'Google', 'Google', 'Associate Software Engineer (SWE)', 'Associate Software Engineer (SWE)', '32.5 LPA', 32.50, 8.50, 0, 'Bangalore / Hybrid', '2026-10-24', 'active', 42, 1),
    ('drive-2', 'Microsoft', 'Microsoft', 'Software Development Engineer I', 'Software Development Engineer I', '28.0 LPA', 28.00, 8.00, 0, 'Hyderabad / Redmond', '2026-10-28', 'active', 68, 0),
    ('drive-3', 'Qualcomm', 'Qualcomm', 'Systems Engineer (Embedded AI)', 'Systems Engineer (Embedded AI)', '18.5 LPA', 18.50, 7.50, 0, 'Bangalore', '2026-11-02', 'active', 85, 0)
ON CONFLICT (id) DO NOTHING;

-- 11. ANNOUNCEMENTS
INSERT INTO public.announcements (id, title, content, scope, target_dept, priority, published_by, published_role)
VALUES
    ('ann-1', 'Autumn End-Semester Examination Schedule Released', 'Controller of Examinations has published the final schedule for theory and laboratory examinations.', 'institutional', NULL, 'important', 'Prof. V. Ramanathan', 'exam_cell'),
    ('ann-2', 'Smart India Hackathon 2026 — On-Duty Leave Sanctioned', 'All shortlisted departmental teams are sanctioned duty leave with full academic attendance credit.', 'department', 'AIDS', 'normal', 'Dr. K. Mohan', 'hod')
ON CONFLICT (id) DO NOTHING;
