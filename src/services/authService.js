/**
 * Nivara Institutional Authentication Service
 * Supports Supabase Auth (when credentials provided) + Fallback Institutional Auth.
 * Automatically resolves user role from profile records. Never requires manual role picking.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const INSTITUTIONAL_ACCOUNTS = [
  {
    email: 'student@nivara.edu',
    password: 'Password@123',
    role: 'student',
    userName: 'Aadhi Narayanan',
    title: 'B.Tech AI & Data Science (III Year)',
    dept: 'AI & Data Science',
    deptCode: 'AIDS',
    studentId: '2024-AIDS-042',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  },
  {
    email: 'faculty@nivara.edu',
    password: 'Password@123',
    role: 'faculty',
    userName: 'Dr. Priya Raman',
    title: 'Associate Professor, CS & AI',
    dept: 'Computer Science & AI',
    deptCode: 'CS',
    facultyId: 'FAC-CS-082',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
  },
  {
    email: 'hod@nivara.edu',
    password: 'Password@123',
    role: 'hod',
    userName: 'Dr. K. Mohan',
    title: 'Head of Department, AI & DS',
    dept: 'AI & Data Science',
    deptCode: 'AIDS',
    facultyId: 'HOD-AIDS-001',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
  },
  {
    email: 'principal@nivara.edu',
    password: 'Password@123',
    role: 'principal',
    userName: 'Dr. Aris Thorne',
    title: 'Principal & Academic Dean',
    dept: 'Executive Directorate',
    deptCode: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
  },
  {
    email: 'admin@nivara.edu',
    password: 'Password@123',
    role: 'admin',
    userName: 'System Controller',
    title: 'Chief Information Officer & ERP Administrator',
    dept: 'Campus Information Systems',
    deptCode: 'IT',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
  },
  {
    email: 'examcell@nivara.edu',
    password: 'Password@123',
    role: 'exam_cell',
    userName: 'Prof. V. Ramanathan',
    title: 'Controller of Examinations',
    dept: 'Office of the Controller of Examinations',
    deptCode: 'EXAM',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&auto=format&fit=crop&q=80',
  },
  {
    email: 'finance@nivara.edu',
    password: 'Password@123',
    role: 'finance',
    userName: 'Mrs. S. Mythili',
    title: 'Bursar & Chief Accounts Officer',
    dept: 'Finance & Treasury Wing',
    deptCode: 'FIN',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
  },
  {
    email: 'placement@nivara.edu',
    password: 'Password@123',
    role: 'placement',
    userName: 'Dr. S. Kapoor',
    title: 'Dean of Corporate Relations & Placement',
    dept: 'Career Development Center',
    deptCode: 'CDC',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
  },
];

const SESSION_STORAGE_KEY = 'nivara_authenticated_session';

/**
 * Authenticates user via institutional email and password.
 * Resolves role from user profile record.
 */
export async function loginWithCredentials(email, password, remember = true) {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. If Supabase is connected, attempt Supabase Auth
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      // Fetch user profile from database to determine role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('User profile record not found. Please contact ERP Administrator.');
      }

      const sessionObj = {
        token: data.session.access_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          role: profile.role,
          userName: profile.full_name,
          title: profile.title,
          dept: profile.department,
          studentId: profile.student_id || profile.id,
          facultyId: profile.faculty_id || profile.id,
          avatar: profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        },
        provider: 'supabase',
      };

      if (remember) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionObj));
      } else {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionObj));
      }

      return { success: true, session: sessionObj };
    } catch (err) {
      // Return error for Supabase attempt
      return { success: false, error: err.message };
    }
  }

  // 2. Fallback / Local Institutional Directory Authentication
  // Simulated network latency for realistic feel
  await new Promise((resolve) => setTimeout(resolve, 350));

  const matchedAccount = INSTITUTIONAL_ACCOUNTS.find(
    (acc) => acc.email.toLowerCase() === normalizedEmail
  );

  if (!matchedAccount) {
    return {
      success: false,
      error: 'Invalid institutional credentials. Please check your institutional email address.',
    };
  }

  // In demo/fallback mode, accept 'Password@123' or allow matching password
  if (password !== matchedAccount.password && password !== 'Password@123') {
    return {
      success: false,
      error: 'Incorrect password for this institutional account.',
    };
  }

  const sessionObj = {
    token: `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    user: {
      id: `usr-${matchedAccount.role}`,
      email: matchedAccount.email,
      role: matchedAccount.role,
      userName: matchedAccount.userName,
      title: matchedAccount.title,
      dept: matchedAccount.dept,
      avatar: matchedAccount.avatar,
      studentId: matchedAccount.studentId,
      facultyId: matchedAccount.facultyId,
    },
    provider: 'institutional_fallback',
    authenticatedAt: new Date().toISOString(),
  };

  if (remember) {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionObj));
  } else {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionObj));
  }

  return { success: true, session: sessionObj };
}

/**
 * Retrieves the currently active authenticated session.
 */
export function getActiveSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY) || sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Signs out the current session and clears storage.
 */
export async function logoutSession() {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore network errors on signout
    }
  }
  localStorage.removeItem(SESSION_STORAGE_KEY);
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
  return { success: true };
}
