-- ====================================================================
-- NIVARA — Complete PostgreSQL / Supabase Relational Database Schema
-- Architecture: Multi-tenant Institutional Operating System
-- Includes Tables, Constraints, Foreign Keys, Indexes & Row Level Security
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS & DOMAINS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'student',
        'faculty',
        'hod',
        'principal',
        'admin',
        'exam_cell',
        'finance',
        'placement'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE fee_status_type AS ENUM ('paid', 'pending', 'partial', 'waived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE leave_status_type AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE placement_stage_type AS ENUM (
        'Application Received & Screening',
        'Shortlisted for Online Assessment',
        'Technical Interview (Round 1)',
        'Technical Interview (Round 2)',
        'Final HR Evaluation',
        'Offer Extended (Selected)',
        'Application Not Selected'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES (RBAC Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    title VARCHAR(255) DEFAULT '',
    department VARCHAR(255) DEFAULT '',
    dept_code VARCHAR(32) DEFAULT '',
    avatar_url TEXT DEFAULT '',
    status VARCHAR(32) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DEPARTMENTS
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(32) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    building VARCHAR(128) NOT NULL,
    student_count INT DEFAULT 0,
    faculty_count INT DEFAULT 0,
    avg_attendance NUMERIC(5,2) DEFAULT 85.00,
    budget_allocated NUMERIC(12,2) DEFAULT 0,
    budget_spent NUMERIC(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. STUDENTS
CREATE TABLE IF NOT EXISTS public.students (
    id VARCHAR(64) PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    roll_no VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(255) NOT NULL,
    dept_code VARCHAR(32) REFERENCES public.departments(code) ON DELETE RESTRICT,
    year VARCHAR(32) NOT NULL DEFAULT '3rd Year',
    semester INT NOT NULL DEFAULT 5,
    cgpa NUMERIC(4,2) NOT NULL DEFAULT 8.00,
    attendance_pct NUMERIC(5,2) NOT NULL DEFAULT 85.00,
    backlogs INT NOT NULL DEFAULT 0,
    advisor VARCHAR(255) DEFAULT 'Dr. Priya Raman',
    fee_status fee_status_type DEFAULT 'pending',
    fee_pending_amount NUMERIC(10,2) DEFAULT 45000.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. COURSES & TIMETABLE SESSIONS
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(32) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    dept_code VARCHAR(32) REFERENCES public.departments(code),
    credits INT NOT NULL DEFAULT 4,
    semester INT NOT NULL DEFAULT 5,
    instructor_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.class_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_code VARCHAR(32) REFERENCES public.courses(code) ON DELETE CASCADE,
    day VARCHAR(16) NOT NULL,
    time_slot VARCHAR(64) NOT NULL,
    room VARCHAR(64) NOT NULL,
    instructor_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ATTENDANCE LOGS
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_code VARCHAR(32) REFERENCES public.courses(code) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    due_date VARCHAR(64) NOT NULL,
    weightage VARCHAR(64) DEFAULT '10% of Internal Mark',
    brief TEXT DEFAULT '',
    created_by VARCHAR(255) NOT NULL,
    submitted_count INT DEFAULT 0,
    graded_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.assignment_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id VARCHAR(64) REFERENCES public.students(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    submitted_work TEXT DEFAULT '',
    score INT,
    max_score INT DEFAULT 100,
    feedback TEXT DEFAULT '',
    status VARCHAR(32) DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'returned')),
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(assignment_id, student_id)
);

-- 9. CONTINUOUS INTERNAL ASSESSMENT (CIA) MARKS
CREATE TABLE IF NOT EXISTS public.internal_marks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(64) REFERENCES public.students(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    roll_no VARCHAR(64) NOT NULL,
    course_code VARCHAR(32) REFERENCES public.courses(code) ON DELETE CASCADE,
    quiz_score INT DEFAULT 18,
    assignment_score INT DEFAULT 19,
    midterm_score INT DEFAULT 44,
    total_internal INT GENERATED ALWAYS AS (quiz_score + assignment_score + midterm_score) STORED,
    status VARCHAR(32) DEFAULT 'draft' CHECK (status IN ('draft', 'locked')),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, course_code)
);

-- 10. EXAMINATIONS & RESULTS
CREATE TABLE IF NOT EXISTS public.exam_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(32) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    date VARCHAR(64) NOT NULL,
    time_window VARCHAR(64) NOT NULL,
    hall VARCHAR(64) NOT NULL,
    seat_prefix VARCHAR(16) NOT NULL,
    total_seats INT DEFAULT 64,
    allocated_seats INT DEFAULT 62,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(64) REFERENCES public.students(id) ON DELETE CASCADE,
    semester INT NOT NULL,
    gpa NUMERIC(4,2) NOT NULL,
    cgpa NUMERIC(4,2) NOT NULL,
    total_credits INT DEFAULT 24,
    status VARCHAR(32) DEFAULT 'published' CHECK (status IN ('draft', 'moderated', 'published')),
    published_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. FINANCE & PAYMENTS
CREATE TABLE IF NOT EXISTS public.fee_structures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(128) NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    frequency VARCHAR(64) NOT NULL,
    due_date VARCHAR(64) NOT NULL,
    academic_year VARCHAR(32) DEFAULT '2026-2027',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(64) REFERENCES public.students(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    receipt_no VARCHAR(64) UNIQUE NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    mode VARCHAR(32) NOT NULL,
    transaction_id VARCHAR(64) NOT NULL,
    status VARCHAR(32) DEFAULT 'verified',
    paid_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. PLACEMENT & RECRUITMENT
CREATE TABLE IF NOT EXISTS public.placement_drives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    package_lpa VARCHAR(32) NOT NULL,
    min_cgpa NUMERIC(4,2) NOT NULL DEFAULT 7.5,
    location VARCHAR(255) NOT NULL,
    deadline VARCHAR(64) NOT NULL,
    eligible_count INT DEFAULT 0,
    applied_count INT DEFAULT 0,
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.placement_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    drive_id UUID REFERENCES public.placement_drives(id) ON DELETE CASCADE,
    student_id VARCHAR(64) REFERENCES public.students(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    stage placement_stage_type DEFAULT 'Application Received & Screening',
    status VARCHAR(32) DEFAULT 'active',
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(drive_id, student_id)
);

-- 13. LEAVE REQUESTS
CREATE TABLE IF NOT EXISTS public.leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(64) REFERENCES public.students(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    dept_code VARCHAR(32) DEFAULT 'AIDS',
    reason TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days INT NOT NULL DEFAULT 1,
    status leave_status_type DEFAULT 'pending',
    duty_concession BOOLEAN DEFAULT FALSE,
    applied_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. AUDIT LOGS & NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_role VARCHAR(64) NOT NULL,
    actor_name VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_role VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    unread BOOLEAN DEFAULT TRUE,
    tier VARCHAR(32) DEFAULT 'info',
    action_tab VARCHAR(64) DEFAULT 'home',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. ACADEMIC STRUCTURE EXTENSIONS
CREATE TABLE IF NOT EXISTS public.programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(32) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    dept_code VARCHAR(32) REFERENCES public.departments(code) ON DELETE CASCADE,
    degree VARCHAR(64) NOT NULL DEFAULT 'B.Tech',
    total_semesters INT NOT NULL DEFAULT 8,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    year_label VARCHAR(32) UNIQUE NOT NULL,
    is_current BOOLEAN DEFAULT TRUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.classes_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS class_section_code VARCHAR(32) REFERENCES public.classes_sections(code) ON DELETE SET NULL;

-- 16. UNIFIED TIMETABLE ENTRIES
CREATE TABLE IF NOT EXISTS public.timetable_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_code VARCHAR(32) REFERENCES public.courses(code) ON DELETE CASCADE,
    subject_name VARCHAR(255) NOT NULL,
    faculty_name VARCHAR(255) NOT NULL,
    section_code VARCHAR(32) REFERENCES public.classes_sections(code) ON DELETE CASCADE,
    dept_code VARCHAR(32) REFERENCES public.departments(code) ON DELETE CASCADE,
    day_of_week VARCHAR(16) NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
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

-- 17. COURSE MATERIALS & REPOSITORY
CREATE TABLE IF NOT EXISTS public.course_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_code VARCHAR(32) REFERENCES public.courses(code) ON DELETE CASCADE,
    subject_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    faculty_name VARCHAR(255) NOT NULL,
    material_type VARCHAR(64) NOT NULL DEFAULT 'Lecture Notes' CHECK (material_type IN ('Lecture Notes', 'Lab Manual', 'Problem Set', 'Syllabus', 'Reference Paper')),
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT DEFAULT '',
    file_size_kb INT DEFAULT 0,
    visibility VARCHAR(32) DEFAULT 'enrolled' CHECK (visibility IN ('enrolled', 'department', 'public')),
    section_code VARCHAR(32) REFERENCES public.classes_sections(code) ON DELETE SET NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. REVALUATION & GRADE CHALLENGES
DO $$ BEGIN
    CREATE TYPE revaluation_status_type AS ENUM ('submitted', 'under_review', 'approved', 'rejected', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.revaluation_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(64) REFERENCES public.students(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    roll_no VARCHAR(64) NOT NULL,
    course_code VARCHAR(32) REFERENCES public.courses(code) ON DELETE CASCADE,
    subject_name VARCHAR(255) NOT NULL,
    semester INT NOT NULL DEFAULT 5,
    original_grade VARCHAR(8) NOT NULL,
    original_marks INT NOT NULL,
    reason TEXT NOT NULL,
    status revaluation_status_type DEFAULT 'submitted',
    updated_marks INT,
    updated_grade VARCHAR(8),
    reviewed_by VARCHAR(255),
    review_remarks TEXT,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. SCHOLARSHIPS & FEE CONCESSIONS
CREATE TABLE IF NOT EXISTS public.fee_concessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(64) REFERENCES public.students(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    category VARCHAR(128) NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(32) DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    sanctioned_by VARCHAR(255) DEFAULT 'Finance & Accounts',
    academic_year VARCHAR(32) DEFAULT '2026-2027',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. CATEGORIZED ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    scope VARCHAR(32) NOT NULL DEFAULT 'institutional' CHECK (scope IN ('institutional', 'department', 'class', 'role')),
    target_dept VARCHAR(32) REFERENCES public.departments(code) ON DELETE SET NULL,
    target_section VARCHAR(32) REFERENCES public.classes_sections(code) ON DELETE SET NULL,
    target_role user_role,
    priority VARCHAR(32) DEFAULT 'normal' CHECK (priority IN ('urgent', 'important', 'normal')),
    published_by VARCHAR(255) NOT NULL,
    published_role user_role NOT NULL,
    published_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. ATTENDANCE AGGREGATION TRIGGER (Database-Side Consistency)
CREATE OR REPLACE FUNCTION public.fn_recalculate_department_attendance()
RETURNS TRIGGER AS $$
DECLARE
    v_dept_code VARCHAR(32);
    v_avg NUMERIC(5,2);
BEGIN
    SELECT dept_code INTO v_dept_code FROM public.students WHERE id = COALESCE(NEW.student_id, OLD.student_id);
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

-- 22. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revaluation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_concessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Read policies for common academic structures
CREATE POLICY "Academic structure viewable by authenticated users" ON public.programs
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Classes sections viewable by authenticated users" ON public.classes_sections
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Timetable entries viewable by authenticated users" ON public.timetable_entries
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Course materials viewable by authenticated users" ON public.course_materials
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Faculty and admin can manage course materials" ON public.course_materials
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('faculty', 'admin', 'hod')));

CREATE POLICY "Students see own revaluations" ON public.revaluation_requests
    FOR SELECT TO authenticated
    USING (student_id = (SELECT roll_no FROM public.students WHERE user_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('exam_cell', 'admin')));

CREATE POLICY "Announcements viewable by all authenticated" ON public.announcements
    FOR SELECT TO authenticated USING (true);

-- Explicit Student-Specific Ownership & RBAC Guard Policies
CREATE POLICY "Students see own profile" ON public.students
    FOR SELECT TO authenticated
    USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'principal', 'hod', 'faculty', 'finance', 'exam_cell', 'placement')));

CREATE POLICY "Students see own attendance" ON public.attendance_records
    FOR SELECT TO authenticated
    USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'principal', 'hod', 'faculty')));

CREATE POLICY "Students view own submissions" ON public.assignment_submissions
    FOR SELECT TO authenticated
    USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('faculty', 'hod', 'admin')));

CREATE POLICY "Students submit own assignments" ON public.assignment_submissions
    FOR INSERT TO authenticated
    WITH CHECK (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));

CREATE POLICY "Students see own payments" ON public.payments
    FOR SELECT TO authenticated
    USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('finance', 'admin')));

CREATE POLICY "Students see own placement applications" ON public.placement_applications
    FOR SELECT TO authenticated
    USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('placement', 'admin')));

CREATE POLICY "Students submit own placement applications" ON public.placement_applications
    FOR INSERT TO authenticated
    WITH CHECK (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));

CREATE POLICY "Students see own leave requests" ON public.leave_requests
    FOR SELECT TO authenticated
    USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('hod', 'faculty', 'admin', 'principal')));

CREATE POLICY "Students create own leave requests" ON public.leave_requests
    FOR INSERT TO authenticated
    WITH CHECK (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_students_dept ON public.students(dept_code);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON public.assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_internal_marks_course ON public.internal_marks(course_code);
CREATE INDEX IF NOT EXISTS idx_placement_apps_drive ON public.placement_applications(drive_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_student ON public.leave_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_timetable_section ON public.timetable_entries(section_code);
CREATE INDEX IF NOT EXISTS idx_timetable_room ON public.timetable_entries(room);
CREATE INDEX IF NOT EXISTS idx_materials_course ON public.course_materials(course_code);
CREATE INDEX IF NOT EXISTS idx_reval_student ON public.revaluation_requests(student_id);

