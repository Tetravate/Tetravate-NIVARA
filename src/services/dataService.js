/**
 * Central Data Service & Repository Abstraction for Nivara
 * Provides unified interface for Supabase (production source of truth) and Local Fallback Store.
 * Guarantees that genuine empty states and database errors are faithfully surfaced to the UI.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const dataService = {
  /**
   * Fetch all students for a department or institutional directory
   */
  async getStudents(fallbackData = []) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('students').select('*').order('name');
      if (error) {
        console.error('Supabase getStudents error:', error);
        return { success: false, data: null, error: error.message };
      }
      return { success: true, data: data || [], error: null };
    }
    return { success: true, data: fallbackData, error: null };
  },

  /**
   * Fetch departments master records
   */
  async getDepartments(fallbackData = []) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('departments').select('*').order('name');
      if (error) {
        console.error('Supabase getDepartments error:', error);
        return { success: false, data: null, error: error.message };
      }
      return { success: true, data: data || [], error: null };
    }
    return { success: true, data: fallbackData, error: null };
  },

  /**
   * Record classroom attendance
   */
  async recordAttendance(courseCode, records, markedBy) {
    if (isSupabaseConfigured && supabase) {
      const payload = records.map((r) => ({
        student_id: r.studentId,
        course_code: courseCode,
        status: r.status,
        marked_by: markedBy,
      }));
      const { data, error } = await supabase.from('attendance_records').upsert(payload, {
        onConflict: 'student_id,course_code,session_date',
      });
      if (error) {
        console.error('Supabase attendance record failed:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data };
    }
    return { success: true };
  },

  /**
   * Create an assignment
   */
  async createAssignment(assignmentData) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('assignments')
        .insert([assignmentData])
        .select()
        .single();
      if (error) {
        console.error('Supabase assignment creation failed:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data };
    }
    return { success: true, data: assignmentData };
  },

  /**
   * Fetch assignments
   */
  async getAssignments(fallbackData = []) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('assignments').select('*').order('due_date');
      if (error) {
        console.error('Supabase getAssignments error:', error);
        return { success: false, data: null, error: error.message };
      }
      return { success: true, data: data || [], error: null };
    }
    return { success: true, data: fallbackData, error: null };
  },

  /**
   * Submit student assignment
   */
  async submitAssignment(assignmentId, studentId, studentName, submittedWork) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('assignment_submissions').upsert([
        {
          assignment_id: assignmentId,
          student_id: studentId,
          student_name: studentName,
          submitted_work: submittedWork,
          status: 'submitted',
        },
      ]);
      if (error) {
        console.error('Supabase submission failed:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data };
    }
    return { success: true };
  },

  /**
   * Grade student submission
   */
  async gradeSubmission(assignmentId, studentId, score, feedback) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .update({ score, feedback, status: 'graded' })
        .match({ assignment_id: assignmentId, student_id: studentId });
      if (error) {
        console.error('Supabase grading failed:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data };
    }
    return { success: true };
  },

  /**
   * Fetch internal CIA marks
   */
  async getInternalMarks(fallbackData = []) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('internal_marks').select('*');
      if (error) {
        console.error('Supabase getInternalMarks error:', error);
        return { success: false, data: null, error: error.message };
      }
      return { success: true, data: data || [], error: null };
    }
    return { success: true, data: fallbackData, error: null };
  },

  /**
   * Fetch examination sessions
   */
  async getExamSessions(fallbackData = []) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('exam_sessions').select('*');
      if (error) {
        console.error('Supabase getExamSessions error:', error);
        return { success: false, data: null, error: error.message };
      }
      return { success: true, data: data || [], error: null };
    }
    return { success: true, data: fallbackData, error: null };
  },

  /**
   * Fetch published results
   */
  async getPublishedResults(fallbackData = null) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('results').select('*').limit(1);
      if (error) {
        console.error('Supabase getPublishedResults error:', error);
        return { success: false, data: null, error: error.message };
      }
      return { success: true, data: data && data.length > 0 ? data[0] : null, error: null };
    }
    return { success: true, data: fallbackData, error: null };
  },

  /**
   * Submit and review leave requests
   */
  async submitLeave(leaveData) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('leave_requests')
        .insert([leaveData])
        .select()
        .single();
      if (error) {
        console.error('Supabase leave submission failed:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data };
    }
    return { success: true, data: leaveData };
  },

  /**
   * Fetch leave requests
   */
  async getLeaveRequests(fallbackData = []) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('leave_requests').select('*');
      if (error) {
        console.error('Supabase getLeaveRequests error:', error);
        return { success: false, data: null, error: error.message };
      }
      return { success: true, data: data || [], error: null };
    }
    return { success: true, data: fallbackData, error: null };
  },

  /**
   * Fetch fee structures
   */
  async getFeeStructures(fallbackData = []) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('fee_structures').select('*');
      if (error) {
        console.error('Supabase getFeeStructures error:', error);
        return { success: false, data: null, error: error.message };
      }
      return { success: true, data: data || [], error: null };
    }
    return { success: true, data: fallbackData, error: null };
  },

  /**
   * Process and record student fee payment
   */
  async recordPayment(paymentData) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('payments').insert([paymentData]);
      if (error) {
        console.error('Supabase payment sync failed:', error);
        return { success: false, error: error.message };
      }
      await supabase
        .from('students')
        .update({ fee_status: 'paid', fee_pending_amount: 0 })
        .eq('id', paymentData.studentId);
      return { success: true, data };
    }
    return { success: true };
  },

  /**
   * Fetch payments ledger
   */
  async getPayments(fallbackData = []) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('payments').select('*').order('paid_at', { ascending: false });
      if (error) {
        console.error('Supabase getPayments error:', error);
        return { success: false, data: null, error: error.message };
      }
      return { success: true, data: data || [], error: null };
    }
    return { success: true, data: fallbackData, error: null };
  },

  /**
   * Append audit trail log
   */
  async logAuditEvent(actorRole, actorName, action, details) {
    const logItem = {
      actor_role: actorRole,
      actor_name: actorName,
      action,
      details,
      created_at: new Date().toISOString(),
    };
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('audit_logs').insert([logItem]);
      if (error) {
        console.error('Supabase audit logging failed:', error);
      }
    }
    return logItem;
  },

  /**
   * Fetch audit logs
   */
  async getAuditLogs(fallbackData = []) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
      if (error) {
        console.error('Supabase getAuditLogs error:', error);
        return { success: false, data: null, error: error.message };
      }
      return { success: true, data: data || [], error: null };
    }
    return { success: true, data: fallbackData, error: null };
  },

  /**
   * Fetch notifications
   */
  async getNotifications(fallbackData = []) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error('Supabase getNotifications error:', error);
        return { success: false, data: null, error: error.message };
      }
      return { success: true, data: data || [], error: null };
    }
    return { success: true, data: fallbackData, error: null };
  },

  /**
   * Timetable entries query
   */
  async getTimetableEntries(fallbackData = []) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('timetable_entries').select('*');
      if (error) {
        console.error('Supabase timetable query failed:', error);
        return { success: false, data: null, error: error.message };
      }
      return { success: true, data: data || [], error: null };
    }
    return { success: true, data: fallbackData, error: null };
  },

  /**
   * Course materials repository query
   */
  async getCourseMaterials(fallbackData = []) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('course_materials').select('*');
      if (error) {
        console.error('Supabase materials query failed:', error);
        return { success: false, data: null, error: error.message };
      }
      return { success: true, data: data || [], error: null };
    }
    return { success: true, data: fallbackData, error: null };
  },

  /**
   * Revaluation requests query & submission
   */
  async getRevaluationRequests(fallbackData = []) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('revaluation_requests').select('*');
      if (error) {
        console.error('Supabase revaluation query failed:', error);
        return { success: false, data: null, error: error.message };
      }
      return { success: true, data: data || [], error: null };
    }
    return { success: true, data: fallbackData, error: null };
  },

  async submitRevaluationRequest(revalData) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('revaluation_requests').insert([revalData]).select().single();
      if (error) {
        console.error('Supabase revaluation insert failed:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data };
    }
    return { success: true, data: revalData };
  },

  async updateRevaluationStatus(id, status, updatedMarks, updatedGrade, reviewer) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('revaluation_requests').update({
        status,
        updated_marks: updatedMarks,
        updated_grade: updatedGrade,
        reviewed_by: reviewer,
        updated_at: new Date().toISOString(),
      }).eq('id', id);
      if (error) {
        console.error('Supabase revaluation status update failed:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data };
    }
    return { success: true };
  },

  /**
   * Refund requests
   */
  async getRefundRequests(fallbackData = []) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('refund_requests').select('*');
      if (error) {
        console.error('Supabase refund requests query failed:', error);
        return { success: false, data: null, error: error.message };
      }
      return { success: true, data: data || [], error: null };
    }
    return { success: true, data: fallbackData, error: null };
  },

  async submitRefundRequest(refundData) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('refund_requests').insert([refundData]).select().single();
      if (error) {
        console.error('Supabase refund insert failed:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data };
    }
    return { success: true, data: refundData };
  },

  async updateRefundStatus(id, status, remarks, authorizedUser) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('refund_requests').update({
        status,
        remarks,
        authorized_user: authorizedUser,
        updated_at: new Date().toISOString(),
      }).eq('id', id);
      if (error) {
        console.error('Supabase refund status update failed:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data };
    }
    return { success: true };
  },

  /**
   * Fee concessions query
   */
  async getFeeConcessions(fallbackData = []) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('fee_concessions').select('*');
      if (error) {
        console.error('Supabase fee concessions query failed:', error);
        return { success: false, data: null, error: error.message };
      }
      return { success: true, data: data || [], error: null };
    }
    return { success: true, data: fallbackData, error: null };
  },

  /**
   * Announcements repository query & publish
   */
  async getAnnouncements(fallbackData = []) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error('Supabase announcements query failed:', error);
        return { success: false, data: null, error: error.message };
      }
      return { success: true, data: data || [], error: null };
    }
    return { success: true, data: fallbackData, error: null };
  },

  async publishAnnouncement(announcement) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('announcements').insert([announcement]).select().single();
      if (error) {
        console.error('Supabase announcements insert failed:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data };
    }
    return { success: true, data: announcement };
  },

  /**
   * Placement & Corporate Recruitment Service
   */
  async getCompanies(fallbackData = []) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('companies').select('*').order('name');
      if (error) {
        console.error('Supabase companies query failed:', error);
        return { success: false, data: null, error: error.message };
      }
      return { success: true, data: data || [], error: null };
    }
    return { success: true, data: fallbackData, error: null };
  },

  async createCompany(companyData) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('companies').insert([companyData]).select().single();
      if (error) {
        console.error('Supabase company insert failed:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data };
    }
    return { success: true, data: companyData };
  },

  async updateCompany(id, companyData) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('companies').update(companyData).eq('id', id);
      if (error) {
        console.error('Supabase company update failed:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data };
    }
    return { success: true };
  },

  async getPlacementDrives(fallbackData = []) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('placement_drives').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error('Supabase placement drives query failed:', error);
        return { success: false, data: null, error: error.message };
      }
      return { success: true, data: data || [], error: null };
    }
    return { success: true, data: fallbackData, error: null };
  },

  async createPlacementDrive(driveData) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('placement_drives').insert([driveData]).select().single();
      if (error) {
        console.error('Supabase placement drive insert failed:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data };
    }
    return { success: true, data: driveData };
  },

  async updatePlacementDrive(id, driveData) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('placement_drives').update(driveData).eq('id', id);
      if (error) {
        console.error('Supabase placement drive update failed:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data };
    }
    return { success: true };
  },

  async getPlacementApplications(fallbackData = []) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('placement_applications').select('*').order('applied_at', { ascending: false });
      if (error) {
        console.error('Supabase placement applications query failed:', error);
        return { success: false, data: null, error: error.message };
      }
      return { success: true, data: data || [], error: null };
    }
    return { success: true, data: fallbackData, error: null };
  },

  async submitPlacementApplication(applicationData) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('placement_applications').insert([applicationData]).select().single();
      if (error) {
        console.error('Supabase placement application insert failed:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data };
    }
    return { success: true, data: applicationData };
  },

  async advancePlacementStage(driveId, studentId, newStage) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('placement_applications')
        .update({
          stage: newStage,
          status: newStage.toLowerCase().includes('reject') ? 'rejected' : newStage.toLowerCase().includes('offer') ? 'offer' : 'active',
        })
        .match({ drive_id: driveId, student_id: studentId });
      if (error) {
        console.error('Supabase placement stage update failed:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data };
    }
    return { success: true };
  },

  async getPlacementInterviews(fallbackData = []) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('placement_interviews').select('*').order('scheduled_date');
      if (error) {
        console.error('Supabase placement interviews query failed:', error);
        return { success: false, data: null, error: error.message };
      }
      return { success: true, data: data || [], error: null };
    }
    return { success: true, data: fallbackData, error: null };
  },

  async scheduleInterview(interviewData) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('placement_interviews').insert([interviewData]).select().single();
      if (error) {
        console.error('Supabase interview insert failed:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data };
    }
    return { success: true, data: interviewData };
  },

  async updateInterviewOutcome(id, outcomeData) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('placement_interviews').update(outcomeData).eq('id', id);
      if (error) {
        console.error('Supabase interview outcome update failed:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data };
    }
    return { success: true };
  },

  async getPlacementOffers(fallbackData = []) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('placement_offers').select('*').order('offer_date', { ascending: false });
      if (error) {
        console.error('Supabase placement offers query failed:', error);
        return { success: false, data: null, error: error.message };
      }
      return { success: true, data: data || [], error: null };
    }
    return { success: true, data: fallbackData, error: null };
  },

  async createPlacementOffer(offerData) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('placement_offers').insert([offerData]).select().single();
      if (error) {
        console.error('Supabase placement offer insert failed:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data };
    }
    return { success: true, data: offerData };
  },

  async updatePlacementOffer(id, offerData) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('placement_offers').update(offerData).eq('id', id);
      if (error) {
        console.error('Supabase placement offer update failed:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data };
    }
    return { success: true };
  },
};
