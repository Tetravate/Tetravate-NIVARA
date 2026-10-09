-- ====================================================================
-- NIVARA ERP — Complete Production PostgreSQL / Supabase Schema Foundation
-- All 8 Roles: Student, Faculty, HOD, Principal, Admin, Exam Cell, Finance, Placement
-- Includes: Tables, Foreign Keys, Unique & Check Constraints, Indexes,
--           Triggers, Row Level Security (RLS) & Realtime Publications
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ACADEMIC STRUCTURE & DEPARTMENTS
CREATE TABLE IF NOT EXISTS public.departments (
    id VARCHAR(64) PRIMARY KEY DEFAULT ('dept_' || substr(md5(random()::text), 1, 8)),
    code VARCHAR(32) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    building VARCHAR(128) NOT NULL DEFAULT 'Academic Block',
    student_count INT DEFAULT 0,
    faculty_count INT DEFAULT 0,
    avg_attendance NUMERIC(5,2) DEFAULT 85.00,
    budget_allocated NUMERIC(12,2) DEFAULT 0,
    budget_spent NUMERIC(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.programs (
    id VARCHAR(64) PRIMARY KEY DEFAULT ('prg_' || substr(md5(random()::text), 1, 8)),
    code VARCHAR(32) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    dept_code VARCHAR(32) REFERENCES public.departments(code) ON DELETE CASCADE,
    degree VARCHAR(64) NOT NULL DEFAULT 'B.Tech',
    total_semesters INT NOT NULL DEFAULT 8,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.academic_years (
    id VARCHAR(64) PRIMARY KEY DEFAULT ('ay_' || substr(md5(random()::text), 1, 8)),
    year_label VARCHAR(32) UNIQUE NOT NULL,
    is_current BOOLEAN DEFAULT TRUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.classes_sections (
    id VARCHAR(64) PRIMARY KEY DEFAULT ('sec_' || substr(md5(random()::text), 1, 8)),
    code VARCHAR(32) UNIQUE NOT NULL,
    dept_code VARCHAR(32) REFERENCES public.departments(code) ON DELETE CASCADE,
    program_code VARCHAR(32) REFERENCES public.programs(code) ON DELETE SET NULL,
    year VARCHAR(32) NOT NULL DEFAULT '3rd Year',
    semester INT NOT NULL DEFAULT 5,
    section_name VARCHAR(16) NOT NULL DEFAULT 'A',
    room_default VARCHAR(64) DEFAULT 'Hall B204',
    advisor_name VARCHAR(255) DEFAULT 'Dr. Priya Raman',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. USER PROFILES & INSTITUTIONAL ACCOUNTS
CREATE TABLE IF NOT EXISTS public.profiles (
    id VARCHAR(64) PRIMARY KEY DEFAULT ('usr_' || substr(md5(random()::text), 1, 8)),
    user_id UUID,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'student',
    title VARCHAR(255) DEFAULT '',
    department VARCHAR(255) DEFAULT '',
    dept_code VARCHAR(32) DEFAULT '',
    avatar_url TEXT DEFAULT '',
    status VARCHAR(32) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FACULTY REGISTRY
CREATE TABLE IF NOT EXISTS public.faculty (
    id VARCHAR(64) PRIMARY KEY DEFAULT ('fac_' || substr(md5(random()::text), 1, 8)),
    user_id VARCHAR(64) REFERENCES public.profiles(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(255) NOT NULL,
    dept_code VARCHAR(32) REFERENCES public.departments(code) ON DELETE RESTRICT,
    designation VARCHAR(128) DEFAULT 'Associate Professor',
    qualification VARCHAR(255) DEFAULT '',
    workload_hours INT DEFAULT 18,
    ongoing_courses VARCHAR(255) DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. STUDENT REGISTRY
CREATE TABLE IF NOT EXISTS public.students (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES public.profiles(id) ON DELETE SET NULL,
    roll_no VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(255) NOT NULL,
    dept_code VARCHAR(32) REFERENCES public.departments(code) ON DELETE RESTRICT,
    class_section_code VARCHAR(32) REFERENCES public.classes_sections(code) ON DELETE SET NULL,
    year VARCHAR(32) NOT NULL DEFAULT '3rd Year',
    semester INT NOT NULL DEFAULT 5,
    cgpa NUMERIC(4,2) NOT NULL DEFAULT 8.00,
    attendance_pct NUMERIC(5,2) NOT NULL DEFAULT 85.00,
    backlogs INT NOT NULL DEFAULT 0,
    advisor VARCHAR(255) DEFAULT 'Dr. Priya Raman',
    fee_status VARCHAR(32) DEFAULT 'pending',
    fee_pending_amount NUMERIC(10,2) DEFAULT 45000.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. COURSES & CURRICULUM
CREATE TABLE IF NOT EXISTS public.courses (
    id VARCHAR(64) PRIMARY KEY DEFAULT ('crs_' || substr(md5(random()::text), 1, 8)),
    code VARCHAR(32) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    dept_code VARCHAR(32) REFERENCES public.departments(code),
    credits INT NOT NULL DEFAULT 4,
    faculty_id VARCHAR(64) REFERENCES public.faculty(id) ON DELETE SET NULL,
    instructor_name VARCHAR(255) DEFAULT '',
    room_default VARCHAR(64) DEFAULT 'Hall B204',
    semester INT NOT NULL DEFAULT 5,
    total_classes INT DEFAULT 25,
    attended_classes INT DEFAULT 22,
    pct NUMERIC(5,2) DEFAULT 88.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ATTENDANCE SESSIONS & RECORDS
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id VARCHAR(64) PRIMARY KEY DEFAULT ('att_' || substr(md5(random()::text), 1, 12)),
    student_id VARCHAR(64) REFERENCES public.students(id) ON DELETE CASCADE,
    course_code VARCHAR(32) REFERENCES public.courses(code) ON DELETE CASCADE,
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(32) NOT NULL CHECK (status IN ('present', 'absent', 'on_duty')),
    marked_by VARCHAR(255) NOT NULL,
    duty_concession_applied BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, course_code, session_date)
);

-- 8. ASSIGNMENTS & SUBMISSIONS
CREATE TABLE IF NOT EXISTS public.assignments (
    id VARCHAR(64) PRIMARY KEY DEFAULT ('asg_' || substr(md5(random()::text), 1, 10)),
    course_code VARCHAR(32) REFERENCES public.courses(code) ON DELETE CASCADE,
    course_name VARCHAR(255) DEFAULT '',
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    due_date VARCHAR(64) NOT NULL,
    weightage VARCHAR(64) DEFAULT '10% of Internal Mark',
    brief TEXT DEFAULT '',
    created_by VARCHAR(255) DEFAULT '',
    submitted_count INT DEFAULT 0,
    total_count INT DEFAULT 0,
    max_score INT DEFAULT 100,
    urgency VARCHAR(32) DEFAULT 'normal',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.assignment_submissions (
    id VARCHAR(64) PRIMARY KEY DEFAULT ('sub_' || substr(md5(random()::text), 1, 10)),
    assignment_id VARCHAR(64) REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id VARCHAR(64) REFERENCES public.students(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    submitted_work TEXT DEFAULT '',
    score INT,
    max_score INT DEFAULT 100,
    feedback TEXT DEFAULT '',
    status VARCHAR(32) DEFAULT 'submitted',
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(assignment_id, student_id)
);

-- 9. CONTINUOUS INTERNAL ASSESSMENT (CIA) MARKS
CREATE TABLE IF NOT EXISTS public.internal_marks (
    id VARCHAR(64) PRIMARY KEY DEFAULT ('mrk_' || substr(md5(random()::text), 1, 10)),
    student_id VARCHAR(64) REFERENCES public.students(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    roll_no VARCHAR(64) NOT NULL,
    course_code VARCHAR(32) REFERENCES public.courses(code) ON DELETE CASCADE,
    quiz_score INT DEFAULT 18,
    assignment_score INT DEFAULT 19,
    midterm_score INT DEFAULT 44,
    total_internal INT GENERATED ALWAYS AS (quiz_score + assignment_score + midterm_score) STORED,
    status VARCHAR(32) DEFAULT 'draft',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, course_code)
);

-- 10. EXAMINATIONS & PUBLISHED RESULTS
CREATE TABLE IF NOT EXISTS public.exam_sessions (
    id VARCHAR(64) PRIMARY KEY DEFAULT ('exam_' || substr(md5(random()::text), 1, 8)),
    code VARCHAR(32),
    subject VARCHAR(255),
    subject_code VARCHAR(32),
    subject_name VARCHAR(255),
    date VARCHAR(64),
    exam_date VARCHAR(64),
    time_slot VARCHAR(64),
    time_window VARCHAR(64),
    hall VARCHAR(64),
    venue VARCHAR(64),
    seat_prefix VARCHAR(16) DEFAULT 'R',
    total_seats INT DEFAULT 64,
    allocated_seats INT DEFAULT 0,
    total_candidates INT DEFAULT 0,
    status VARCHAR(32) DEFAULT 'Scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.results (
    id VARCHAR(64) PRIMARY KEY DEFAULT ('res_' || substr(md5(random()::text), 1, 8)),
    student_id VARCHAR(64) REFERENCES public.students(id) ON DELETE CASCADE,
    semester INT NOT NULL,
    gpa NUMERIC(4,2) NOT NULL,
    cgpa NUMERIC(4,2) NOT NULL,
    total_credits INT DEFAULT 24,
    status VARCHAR(32) DEFAULT 'published',
    published_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, semester)
);

-- 11. FINANCE & PAYMENTS
CREATE TABLE IF NOT EXISTS public.fee_structures (
    id VARCHAR(64) PRIMARY KEY DEFAULT ('fee_' || substr(md5(random()::text), 1, 8)),
    category VARCHAR(128) NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    frequency VARCHAR(64) NOT NULL,
    due_date VARCHAR(64) NOT NULL,
    academic_year VARCHAR(32) DEFAULT '2026-2027',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payments (
    id VARCHAR(64) PRIMARY KEY DEFAULT ('pay_' || substr(md5(random()::text), 1, 8)),
    student_id VARCHAR(64) REFERENCES public.students(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    receipt_no VARCHAR(64) UNIQUE NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    mode VARCHAR(32) NOT NULL,
    transaction_id VARCHAR(64) NOT NULL,
    status VARCHAR(32) DEFAULT 'verified',
    paid_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fee_concessions (
    id VARCHAR(64) PRIMARY KEY DEFAULT ('conc_' || substr(md5(random()::text), 1, 8)),
    student_id VARCHAR(64) REFERENCES public.students(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    category VARCHAR(128) NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(32) DEFAULT 'approved',
    sanctioned_by VARCHAR(255) DEFAULT 'Finance & Accounts',
    academic_year VARCHAR(32) DEFAULT '2026-2027',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.refund_requests (
    id VARCHAR(64) PRIMARY KEY DEFAULT ('ref_' || substr(md5(random()::text), 1, 8)),
    student_id VARCHAR(64) REFERENCES public.students(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    roll_no VARCHAR(64) NOT NULL,
    payment_id VARCHAR(64),
    receipt_no VARCHAR(64) NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'requested',
    requested_date VARCHAR(64) NOT NULL,
    processed_date VARCHAR(64),
    authorized_user VARCHAR(255),
    mode VARCHAR(128) DEFAULT 'Manual Institutional NEFT Reversal',
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. LEAVE MANAGEMENT
CREATE TABLE IF NOT EXISTS public.leave_requests (
    id VARCHAR(64) PRIMARY KEY DEFAULT ('lv_' || substr(md5(random()::text), 1, 8)),
    student_id VARCHAR(64) REFERENCES public.students(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    dept_code VARCHAR(32) DEFAULT 'AIDS',
    reason TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days INT NOT NULL DEFAULT 1,
    status VARCHAR(32) DEFAULT 'pending',
    duty_concession BOOLEAN DEFAULT FALSE,
    applied_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. PLACEMENT & RECRUITMENT
CREATE TABLE IF NOT EXISTS public.companies (
    id VARCHAR(64) PRIMARY KEY DEFAULT ('comp_' || substr(md5(random()::text), 1, 8)),
    name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(128) NOT NULL,
    website VARCHAR(255) DEFAULT '',
    hr_contact VARCHAR(255) DEFAULT '',
    hr_email VARCHAR(255) DEFAULT '',
    hr_phone VARCHAR(64) DEFAULT '',
    active_status VARCHAR(32) DEFAULT 'active',
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.placement_drives (
    id VARCHAR(64) PRIMARY KEY DEFAULT ('drv_' || substr(md5(random()::text), 1, 8)),
    company VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    company_id VARCHAR(64) REFERENCES public.companies(id) ON DELETE SET NULL,
    role VARCHAR(255) NOT NULL,
    role_title VARCHAR(255),
    package_lpa VARCHAR(32),
    ctc_lpa NUMERIC(6,2),
    min_cgpa NUMERIC(4,2) NOT NULL DEFAULT 7.5,
    allowed_backlogs INT DEFAULT 0,
    location VARCHAR(255) DEFAULT 'Campus / Hybrid',
    deadline VARCHAR(64) NOT NULL,
    drive_date VARCHAR(64) DEFAULT '',
    status VARCHAR(32) DEFAULT 'active',
    eligible_count INT DEFAULT 0,
    applied_count INT DEFAULT 0,
    selected_count INT DEFAULT 0,
    total_applicants INT DEFAULT 0,
    department_target TEXT[] DEFAULT ARRAY['AIDS', 'CSE'],
    eligible_branches TEXT[] DEFAULT ARRAY['AIDS', 'CSE'],
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.placement_applications (
    id VARCHAR(64) PRIMARY KEY DEFAULT ('app_' || substr(md5(random()::text), 1, 8)),
    drive_id VARCHAR(64) REFERENCES public.placement_drives(id) ON DELETE CASCADE,
    student_id VARCHAR(64) REFERENCES public.students(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    stage VARCHAR(128) DEFAULT 'Application Received & Screening',
    status VARCHAR(32) DEFAULT 'active',
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(drive_id, student_id)
);

CREATE TABLE IF NOT EXISTS public.placement_interviews (
    id VARCHAR(64) PRIMARY KEY DEFAULT ('int_' || substr(md5(random()::text), 1, 8)),
    drive_id VARCHAR(64) REFERENCES public.placement_drives(id) ON DELETE CASCADE,
    student_id VARCHAR(64) REFERENCES public.students(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    type VARCHAR(32) DEFAULT 'Interview',
    stage VARCHAR(128) NOT NULL,
    scheduled_date VARCHAR(64) NOT NULL,
    time_slot VARCHAR(64) NOT NULL,
    venue VARCHAR(255) NOT NULL,
    panel VARCHAR(255) DEFAULT 'CDC Interview Panel',
    status VARCHAR(32) DEFAULT 'scheduled',
    score_or_notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.placement_offers (
    id VARCHAR(64) PRIMARY KEY DEFAULT ('ofr_' || substr(md5(random()::text), 1, 8)),
    drive_id VARCHAR(64) REFERENCES public.placement_drives(id) ON DELETE SET NULL,
    student_id VARCHAR(64) REFERENCES public.students(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    dept_code VARCHAR(32) REFERENCES public.departments(code) ON DELETE SET NULL,
    company VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    package_lpa VARCHAR(32) NOT NULL,
    offer_date VARCHAR(64) NOT NULL,
    joining_date VARCHAR(64) DEFAULT '',
    offer_status VARCHAR(32) DEFAULT 'extended',
    placement_status VARCHAR(32) DEFAULT 'pending_acceptance',
    letter_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. TIMETABLE ENTRIES
CREATE TABLE IF NOT EXISTS public.timetable_entries (
    id VARCHAR(64) PRIMARY KEY DEFAULT ('tt_' || substr(md5(random()::text), 1, 8)),
    course_code VARCHAR(32) REFERENCES public.courses(code) ON DELETE CASCADE,
    subject_name VARCHAR(255) NOT NULL,
    faculty_name VARCHAR(255) NOT NULL,
    section_code VARCHAR(32) REFERENCES public.classes_sections(code) ON DELETE CASCADE,
    dept_code VARCHAR(32) REFERENCES public.departments(code) ON DELETE CASCADE,
    day_of_week VARCHAR(16) NOT NULL,
    time_slot VARCHAR(64) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room VARCHAR(64) NOT NULL,
    is_lab BOOLEAN DEFAULT FALSE,
    academic_year VARCHAR(32) DEFAULT '2026-2027',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(day_of_week, time_slot, room),
    UNIQUE(day_of_week, time_slot, section_code)
);

CREATE TABLE IF NOT EXISTS public.room_conflicts (
    id VARCHAR(64) PRIMARY KEY DEFAULT ('cnf_' || substr(md5(random()::text), 1, 8)),
    room_name VARCHAR(64) NOT NULL,
    time_slot VARCHAR(64) NOT NULL,
    department VARCHAR(128),
    day VARCHAR(32),
    conflict_details TEXT,
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. COURSE MATERIALS
CREATE TABLE IF NOT EXISTS public.course_materials (
    id VARCHAR(64) PRIMARY KEY DEFAULT ('mat_' || substr(md5(random()::text), 1, 8)),
    course_code VARCHAR(32) REFERENCES public.courses(code) ON DELETE CASCADE,
    subject_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    faculty_name VARCHAR(255) NOT NULL,
    material_type VARCHAR(64) NOT NULL DEFAULT 'Lecture Notes',
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT DEFAULT '',
    file_size_kb INT DEFAULT 0,
    visibility VARCHAR(32) DEFAULT 'enrolled',
    section_code VARCHAR(32) REFERENCES public.classes_sections(code) ON DELETE SET NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. REVALUATION REQUESTS
CREATE TABLE IF NOT EXISTS public.revaluation_requests (
    id VARCHAR(64) PRIMARY KEY DEFAULT ('rev_' || substr(md5(random()::text), 1, 8)),
    student_id VARCHAR(64) REFERENCES public.students(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    roll_no VARCHAR(64) NOT NULL,
    course_code VARCHAR(32) REFERENCES public.courses(code) ON DELETE CASCADE,
    subject_name VARCHAR(255) NOT NULL,
    semester INT NOT NULL DEFAULT 5,
    original_grade VARCHAR(8) NOT NULL,
    original_marks INT NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'submitted',
    updated_marks INT,
    updated_grade VARCHAR(8),
    reviewed_by VARCHAR(255),
    review_remarks TEXT,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS public.announcements (
    id VARCHAR(64) PRIMARY KEY DEFAULT ('ann_' || substr(md5(random()::text), 1, 8)),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    scope VARCHAR(32) NOT NULL DEFAULT 'institutional',
    target_dept VARCHAR(32) REFERENCES public.departments(code) ON DELETE SET NULL,
    target_section VARCHAR(32) REFERENCES public.classes_sections(code) ON DELETE SET NULL,
    target_role VARCHAR(32),
    priority VARCHAR(32) DEFAULT 'normal',
    published_by VARCHAR(255) NOT NULL,
    published_role VARCHAR(32) NOT NULL,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. AUDIT LOGS & NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id VARCHAR(64) PRIMARY KEY DEFAULT ('aud_' || substr(md5(random()::text), 1, 10)),
    actor_role VARCHAR(64) NOT NULL,
    actor_name VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT NOT NULL,
    target VARCHAR(255) DEFAULT '',
    ip_address VARCHAR(64) DEFAULT '127.0.0.1',
    status VARCHAR(32) DEFAULT 'success',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id VARCHAR(64) PRIMARY KEY DEFAULT ('ntf_' || substr(md5(random()::text), 1, 10)),
    recipient_role VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    unread BOOLEAN DEFAULT TRUE,
    tier VARCHAR(32) DEFAULT 'info',
    action_tab VARCHAR(64) DEFAULT 'home',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. RECALCULATION TRIGGER FOR DEPARTMENT ATTENDANCE
CREATE OR REPLACE FUNCTION public.fn_recalculate_department_attendance()
RETURNS TRIGGER AS $$
DECLARE
    v_dept_code VARCHAR(32);
    v_avg NUMERIC(5,2);
BEGIN
    v_dept_code := COALESCE(NEW.dept_code, OLD.dept_code);
    IF v_dept_code IS NOT NULL THEN
        SELECT ROUND(AVG(attendance_pct), 2) INTO v_avg
        FROM public.students
        WHERE dept_code = v_dept_code;
        
        UPDATE public.departments
        SET avg_attendance = COALESCE(v_avg, 85.00)
        WHERE code = v_dept_code;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_student_attendance_dept_sync ON public.students;
CREATE TRIGGER trg_student_attendance_dept_sync
AFTER INSERT OR UPDATE OF attendance_pct ON public.students
FOR EACH ROW
EXECUTE FUNCTION public.fn_recalculate_department_attendance();

-- 20. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_students_dept ON public.students(dept_code);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_course ON public.attendance_records(course_code);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON public.assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_internal_marks_course ON public.internal_marks(course_code);
CREATE INDEX IF NOT EXISTS idx_placement_apps_drive ON public.placement_applications(drive_id);
CREATE INDEX IF NOT EXISTS idx_placement_apps_student ON public.placement_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_placement_interviews_drive ON public.placement_interviews(drive_id);
CREATE INDEX IF NOT EXISTS idx_placement_offers_student ON public.placement_offers(student_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_student ON public.leave_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_timetable_section ON public.timetable_entries(section_code);
CREATE INDEX IF NOT EXISTS idx_timetable_room ON public.timetable_entries(room);
CREATE INDEX IF NOT EXISTS idx_materials_course ON public.course_materials(course_code);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_role, unread);

-- 21. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_concessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_drives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revaluation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 22. RLS POLICIES (Read & Write Rules)
-- Drop existing policies if re-running
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- Academic & Master Structures (Readable by authenticated & anon clients)
CREATE POLICY "Public read departments" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Public write departments" ON public.departments FOR ALL USING (true);

CREATE POLICY "Public read programs" ON public.programs FOR SELECT USING (true);
CREATE POLICY "Public write programs" ON public.programs FOR ALL USING (true);

CREATE POLICY "Public read academic_years" ON public.academic_years FOR SELECT USING (true);
CREATE POLICY "Public write academic_years" ON public.academic_years FOR ALL USING (true);

CREATE POLICY "Public read classes_sections" ON public.classes_sections FOR SELECT USING (true);
CREATE POLICY "Public write classes_sections" ON public.classes_sections FOR ALL USING (true);

CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public write profiles" ON public.profiles FOR ALL USING (true);

CREATE POLICY "Public read faculty" ON public.faculty FOR SELECT USING (true);
CREATE POLICY "Public write faculty" ON public.faculty FOR ALL USING (true);

CREATE POLICY "Public read students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Public write students" ON public.students FOR ALL USING (true);

CREATE POLICY "Public read courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Public write courses" ON public.courses FOR ALL USING (true);

CREATE POLICY "Public read attendance" ON public.attendance_records FOR SELECT USING (true);
CREATE POLICY "Public write attendance" ON public.attendance_records FOR ALL USING (true);

CREATE POLICY "Public read assignments" ON public.assignments FOR SELECT USING (true);
CREATE POLICY "Public write assignments" ON public.assignments FOR ALL USING (true);

CREATE POLICY "Public read submissions" ON public.assignment_submissions FOR SELECT USING (true);
CREATE POLICY "Public write submissions" ON public.assignment_submissions FOR ALL USING (true);

CREATE POLICY "Public read internal_marks" ON public.internal_marks FOR SELECT USING (true);
CREATE POLICY "Public write internal_marks" ON public.internal_marks FOR ALL USING (true);

CREATE POLICY "Public read exam_sessions" ON public.exam_sessions FOR SELECT USING (true);
CREATE POLICY "Public write exam_sessions" ON public.exam_sessions FOR ALL USING (true);

CREATE POLICY "Public read results" ON public.results FOR SELECT USING (true);
CREATE POLICY "Public write results" ON public.results FOR ALL USING (true);

CREATE POLICY "Public read fee_structures" ON public.fee_structures FOR SELECT USING (true);
CREATE POLICY "Public write fee_structures" ON public.fee_structures FOR ALL USING (true);

CREATE POLICY "Public read payments" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Public write payments" ON public.payments FOR ALL USING (true);

CREATE POLICY "Public read fee_concessions" ON public.fee_concessions FOR SELECT USING (true);
CREATE POLICY "Public write fee_concessions" ON public.fee_concessions FOR ALL USING (true);

CREATE POLICY "Public read refund_requests" ON public.refund_requests FOR SELECT USING (true);
CREATE POLICY "Public write refund_requests" ON public.refund_requests FOR ALL USING (true);

CREATE POLICY "Public read leave_requests" ON public.leave_requests FOR SELECT USING (true);
CREATE POLICY "Public write leave_requests" ON public.leave_requests FOR ALL USING (true);

CREATE POLICY "Public read companies" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Public write companies" ON public.companies FOR ALL USING (true);

CREATE POLICY "Public read placement_drives" ON public.placement_drives FOR SELECT USING (true);
CREATE POLICY "Public write placement_drives" ON public.placement_drives FOR ALL USING (true);

CREATE POLICY "Public read placement_applications" ON public.placement_applications FOR SELECT USING (true);
CREATE POLICY "Public write placement_applications" ON public.placement_applications FOR ALL USING (true);

CREATE POLICY "Public read placement_interviews" ON public.placement_interviews FOR SELECT USING (true);
CREATE POLICY "Public write placement_interviews" ON public.placement_interviews FOR ALL USING (true);

CREATE POLICY "Public read placement_offers" ON public.placement_offers FOR SELECT USING (true);
CREATE POLICY "Public write placement_offers" ON public.placement_offers FOR ALL USING (true);

CREATE POLICY "Public read timetable_entries" ON public.timetable_entries FOR SELECT USING (true);
CREATE POLICY "Public write timetable_entries" ON public.timetable_entries FOR ALL USING (true);

CREATE POLICY "Public read room_conflicts" ON public.room_conflicts FOR SELECT USING (true);
CREATE POLICY "Public write room_conflicts" ON public.room_conflicts FOR ALL USING (true);

CREATE POLICY "Public read course_materials" ON public.course_materials FOR SELECT USING (true);
CREATE POLICY "Public write course_materials" ON public.course_materials FOR ALL USING (true);

CREATE POLICY "Public read revaluation_requests" ON public.revaluation_requests FOR SELECT USING (true);
CREATE POLICY "Public write revaluation_requests" ON public.revaluation_requests FOR ALL USING (true);

CREATE POLICY "Public read announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Public write announcements" ON public.announcements FOR ALL USING (true);

CREATE POLICY "Public read audit_logs" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Public write audit_logs" ON public.audit_logs FOR ALL USING (true);

CREATE POLICY "Public read notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Public write notifications" ON public.notifications FOR ALL USING (true);

-- 23. REALTIME PUBLICATION
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE 
        public.notifications,
        public.attendance_records,
        public.assignments,
        public.assignment_submissions,
        public.leave_requests,
        public.placement_applications,
        public.payments,
        public.announcements,
        public.exam_sessions;
EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN undefined_object THEN null;
END $$;
