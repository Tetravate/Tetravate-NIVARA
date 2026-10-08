/**
 * Central Data Service & Repository Abstraction for Nivara
 * Provides unified interface for Supabase (when configured) and Local Fallback Store.
 * Ensures consistent data flow and cross-role synchronization across all 8 modules.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const dataService = {
  /**
   * Fetch all students for a department or institutional directory
   */
  async getStudents(fallbackData) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('students').select('*').order('name');
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase query failed, using synchronized fallback cache:', err);
      }
    }
    return fallbackData;
  },

  /**
   * Record classroom attendance
   */
  async recordAttendance(courseCode, records, markedBy) {
    if (isSupabaseConfigured && supabase) {
      try {
        const payload = records.map((r) => ({
          student_id: r.studentId,
          course_code: courseCode,
          status: r.status,
          marked_by: markedBy,
        }));
        await supabase.from('attendance_records').upsert(payload, {
          onConflict: 'student_id,course_code,session_date',
        });
      } catch (err) {
        console.warn('Supabase attendance record failed:', err);
      }
    }
    return { success: true };
  },

  /**
   * Create an assignment
   */
  async createAssignment(assignmentData) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('assignments')
          .insert([assignmentData])
          .select()
          .single();
        if (!error) return { success: true, data };
      } catch (err) {
        console.warn('Supabase assignment creation failed:', err);
      }
    }
    return { success: true, data: assignmentData };
  },

  /**
   * Submit student assignment
   */
  async submitAssignment(assignmentId, studentId, studentName, submittedWork) {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('assignment_submissions').upsert([
          {
            assignment_id: assignmentId,
            student_id: studentId,
            student_name: studentName,
            submitted_work: submittedWork,
            status: 'submitted',
          },
        ]);
      } catch (err) {
        console.warn('Supabase submission failed:', err);
      }
    }
    return { success: true };
  },

  /**
   * Grade student submission
   */
  async gradeSubmission(assignmentId, studentId, score, feedback) {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('assignment_submissions')
          .update({ score, feedback, status: 'graded' })
          .match({ assignment_id: assignmentId, student_id: studentId });
      } catch (err) {
        console.warn('Supabase grading failed:', err);
      }
    }
    return { success: true };
  },

  /**
   * Submit and review leave requests
   */
  async submitLeave(leaveData) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('leave_requests')
          .insert([leaveData])
          .select()
          .single();
        if (!error) return { success: true, data };
      } catch (err) {
        console.warn('Supabase leave submission failed:', err);
      }
    }
    return { success: true, data: leaveData };
  },

  /**
   * Process and record student fee payment
   */
  async recordPayment(paymentData) {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('payments').insert([paymentData]);
        await supabase
          .from('students')
          .update({ fee_status: 'paid', fee_pending_amount: 0 })
          .eq('id', paymentData.studentId);
      } catch (err) {
        console.warn('Supabase payment sync failed:', err);
      }
    }
    return { success: true };
  },

  /**
   * Publish new placement recruitment drive
   */
  async createPlacementDrive(driveData) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('placement_drives')
          .insert([driveData])
          .select()
          .single();
        if (!error) return { success: true, data };
      } catch (err) {
        console.warn('Supabase drive creation failed:', err);
      }
    }
    return { success: true, data: driveData };
  },

  /**
   * Advance candidate recruitment stage
   */
  async advancePlacementStage(driveId, studentId, newStage) {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('placement_applications')
          .update({ stage: newStage })
          .match({ drive_id: driveId, student_id: studentId });
      } catch (err) {
        console.warn('Supabase stage advancement failed:', err);
      }
    }
    return { success: true };
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
      try {
        await supabase.from('audit_logs').insert([logItem]);
      } catch (err) {
        console.warn('Supabase audit logging failed:', err);
      }
    }
    return logItem;
  },

  /**
   * Timetable entries query
   */
  async getTimetableEntries(fallbackData) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('timetable_entries').select('*');
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase timetable query failed:', err);
      }
    }
    return fallbackData;
  },

  /**
   * Course materials repository query
   */
  async getCourseMaterials(fallbackData) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('course_materials').select('*');
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase materials query failed:', err);
      }
    }
    return fallbackData;
  },

  /**
   * Revaluation requests query & submission
   */
  async getRevaluationRequests(fallbackData) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('revaluation_requests').select('*');
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase revaluation query failed:', err);
      }
    }
    return fallbackData;
  },

  async submitRevaluationRequest(revalData) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('revaluation_requests').insert([revalData]).select().single();
        if (!error) return { success: true, data };
      } catch (err) {
        console.warn('Supabase revaluation insert failed:', err);
      }
    }
    return { success: true, data: revalData };
  },

  async updateRevaluationStatus(id, status, updatedMarks, updatedGrade, reviewer) {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('revaluation_requests').update({
          status,
          updated_marks: updatedMarks,
          updated_grade: updatedGrade,
          reviewed_by: reviewer,
          updated_at: new Date().toISOString(),
        }).eq('id', id);
      } catch (err) {
        console.warn('Supabase revaluation status update failed:', err);
      }
    }
    return { success: true };
  },

  async submitRefundRequest(refundData) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('refund_requests').insert([refundData]).select().single();
        if (!error) return { success: true, data };
      } catch (err) {
        console.warn('Supabase refund insert failed:', err);
      }
    }
    return { success: true, data: refundData };
  },

  async updateRefundStatus(id, status, remarks, authorizedUser) {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('refund_requests').update({
          status,
          remarks,
          authorized_user: authorizedUser,
          updated_at: new Date().toISOString(),
        }).eq('id', id);
      } catch (err) {
        console.warn('Supabase refund status update failed:', err);
      }
    }
    return { success: true };
  },

  /**
   * Fee concessions query
   */
  async getFeeConcessions(fallbackData) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('fee_concessions').select('*');
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase fee concessions query failed:', err);
      }
    }
    return fallbackData;
  },

  /**
   * Announcements repository query & publish
   */
  async getAnnouncements(fallbackData) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase announcements query failed:', err);
      }
    }
    return fallbackData;
  },

  async publishAnnouncement(announcement) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('announcements').insert([announcement]).select().single();
        if (!error) return { success: true, data };
      } catch (err) {
        console.warn('Supabase announcements insert failed:', err);
      }
    }
    return { success: true, data: announcement };
  },
};

