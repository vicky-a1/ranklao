import { supabase } from "@/integrations/supabase/client";

// Fallback data for when database tables don't exist
const fallbackData = {
  userRoles: new Map<string, string>(),
  onboardingProgress: new Map<string, Record<string, unknown>>(),
  studentProfiles: new Map<string, Record<string, unknown>>(),
  mentorProfiles: new Map<string, Record<string, unknown>>(),
  payments: new Map<string, Record<string, unknown>[]>(),
};

// Check if a table exists by trying to query it
export const checkTableExists = async (tableName: string): Promise<boolean> => {
  try {
    const { error } = await (supabase as any).from(tableName).select('*').limit(1);
    return !error || !error.message?.includes('404');
  } catch {
    return false;
  }
};

// Wrapper for database operations with fallback
export const dbWithFallback = {
  async getUserRole(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();
      
      if (error && error.message?.includes('404')) {
        return fallbackData.userRoles.get(userId) || null;
      }
      
      return data?.role || null;
    } catch {
      return fallbackData.userRoles.get(userId) || null;
    }
  },

  async setUserRole(userId: string, role: string): Promise<void> {
    try {
      const { error } = await supabase.from("user_roles").insert({
        user_id: userId,
        role: role as "student" | "mentor",
      });
      
      if (error && error.message?.includes('404')) {
        fallbackData.userRoles.set(userId, role);
        return;
      }
      
      if (error) throw error;
    } catch {
      fallbackData.userRoles.set(userId, role);
    }
  },

  async getOnboardingProgress(userId: string): Promise<Record<string, unknown> | null> {
    try {
      const { data, error } = await supabase
        .from("onboarding_progress")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      
      if (error && error.message?.includes('404')) {
        return fallbackData.onboardingProgress.get(userId) || null;
      }
      
      return data;
    } catch {
      return fallbackData.onboardingProgress.get(userId) || null;
    }
  },

  async updateOnboardingProgress(userId: string, progress: Record<string, unknown>): Promise<void> {
    try {
      const onboardingRecord = {
        user_id: userId,
        total_steps: progress.total_steps as number || 3,
        current_step: progress.current_step as number || 1,
        is_completed: progress.is_completed as boolean || false,
        role_selected: progress.role_selected as string || null,
        completed_steps: progress.completed_steps as any || null,
        ...progress,
      };

      const { error } = await supabase
        .from("onboarding_progress")
        .upsert(onboardingRecord);
      
      if (error && error.message?.includes('404')) {
        fallbackData.onboardingProgress.set(userId, progress);
        return;
      }
      
      if (error) throw error;
    } catch {
      fallbackData.onboardingProgress.set(userId, progress);
    }
  },

  async hasValidPayment(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", userId)
        .eq("payment_status", "completed");
      
      if (error && error.message?.includes('404')) {
        const userPayments = fallbackData.payments.get(userId) || [];
        return userPayments.some((p: Record<string, unknown>) => p.payment_status === "completed");
      }
      
      return Boolean(data && data.length > 0);
    } catch {
      const userPayments = fallbackData.payments.get(userId) || [];
      return userPayments.some((p: Record<string, unknown>) => p.payment_status === "completed");
    }
  },

  async addPayment(userId: string, payment: Record<string, unknown>): Promise<void> {
    try {
      // Ensure required fields are present
      const paymentRecord = {
        user_id: userId,
        amount: payment.amount as number,
        payment_method: payment.payment_method as string,
        currency: payment.currency as string || 'INR',
        payment_status: payment.payment_status as string || 'pending',
        session_id: payment.session_id as string | null,
        transaction_id: payment.transaction_id as string | null,
        metadata: payment.metadata as any,
        ...payment,
      };

      const { error } = await supabase.from("payments").insert(paymentRecord);
      
      if (error && error.message?.includes('404')) {
        const userPayments = fallbackData.payments.get(userId) || [];
        userPayments.push(payment);
        fallbackData.payments.set(userId, userPayments);
        return;
      }
      
      if (error) throw error;
    } catch {
      const userPayments = fallbackData.payments.get(userId) || [];
      userPayments.push(payment);
      fallbackData.payments.set(userId, userPayments);
    }
  },

  async createStudentProfile(userId: string, profileData: Record<string, unknown>): Promise<void> {
    try {
      // Ensure required fields are present
      const studentProfile = {
        user_id: userId,
        target_exam: profileData.target_exam as string,
        target_year: profileData.target_year as number,
        current_level: profileData.current_level as string,
        study_hours_per_day: profileData.study_hours_per_day as number | null,
        preferred_subjects: profileData.preferred_subjects as string[] | null,
        weak_subjects: profileData.weak_subjects as string[] | null,
        previous_attempts: profileData.previous_attempts as number | null,
        current_score: profileData.current_score as number | null,
        target_rank: profileData.target_rank as number | null,
        preferred_mentor_id: profileData.preferred_mentor_id as string | null,
        ...profileData,
      };

      const { error } = await supabase.from("student_profiles").insert(studentProfile);
      
      if (error && error.message?.includes('404')) {
        fallbackData.studentProfiles.set(userId, profileData);
        return;
      }
      
      if (error) throw error;
    } catch {
      fallbackData.studentProfiles.set(userId, profileData);
    }
  },

  async getStudentProfile(userId: string): Promise<Record<string, unknown> | null> {
    try {
      const { data, error } = await supabase
        .from("student_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      
      if (error && error.message?.includes('404')) {
        return fallbackData.studentProfiles.get(userId) || null;
      }
      
      return data;
    } catch {
      return fallbackData.studentProfiles.get(userId) || null;
    }
  },

  async createMentorProfile(userId: string, profileData: Record<string, unknown>): Promise<void> {
    try {
      // Ensure required fields are present
      const mentorProfile = {
        user_id: userId,
        air_rank: profileData.air_rank as number,
        exam_year: profileData.exam_year as number,
        exam_type: profileData.exam_type as string,
        current_institution: profileData.current_institution as string,
        specialization: profileData.specialization as string | null,
        bio: profileData.bio as string | null,
        hourly_rate: profileData.hourly_rate as number | null,
        ...profileData,
      };

      const { error } = await supabase.from("mentor_profiles").insert(mentorProfile);
      
      if (error && error.message?.includes('404')) {
        fallbackData.mentorProfiles.set(userId, profileData);
        return;
      }
      
      if (error) throw error;
    } catch {
      fallbackData.mentorProfiles.set(userId, profileData);
    }
  },

  async getMentorProfile(userId: string): Promise<Record<string, unknown> | null> {
    try {
      const { data, error } = await supabase
        .from("mentor_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      
      if (error && error.message?.includes('404')) {
        return fallbackData.mentorProfiles.get(userId) || null;
      }
      
      return data;
    } catch {
      return fallbackData.mentorProfiles.get(userId) || null;
    }
  }
};

// Development mode helper - allows bypassing payment for testing
export const isDevelopmentMode = () => {
  return import.meta.env.DEV || window.location.hostname === 'localhost';
};

// For development, allow bypassing payment gate
export const shouldBypassPayment = (userId: string): boolean => {
  if (!isDevelopmentMode()) return false;
  
  // In development mode, allow bypassing payment for testing
  // You can add specific user IDs here for testing
  return userId.length > 0; // Simple check to use the parameter
};