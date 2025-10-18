export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      mentor_availability: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean
          mentor_id: string
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean
          mentor_id: string
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean
          mentor_id?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      mentor_profiles: {
        Row: {
          air_rank: number
          availability_status: string | null
          average_rating: number | null
          bio: string | null
          created_at: string
          current_course: string | null
          current_institution: string
          exam_type: string
          exam_year: number
          experience_years: number | null
          hourly_rate: number | null
          id: string
          specialization: string | null
          total_sessions: number | null
          updated_at: string
          user_id: string
          verification_documents: Json | null
          verification_status: string | null
        }
        Insert: {
          air_rank: number
          availability_status?: string | null
          average_rating?: number | null
          bio?: string | null
          created_at?: string
          current_course?: string | null
          current_institution: string
          exam_type: string
          exam_year: number
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          specialization?: string | null
          total_sessions?: number | null
          updated_at?: string
          user_id: string
          verification_documents?: Json | null
          verification_status?: string | null
        }
        Update: {
          air_rank?: number
          availability_status?: string | null
          average_rating?: number | null
          bio?: string | null
          created_at?: string
          current_course?: string | null
          current_institution?: string
          exam_type?: string
          exam_year?: number
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          specialization?: string | null
          total_sessions?: number | null
          updated_at?: string
          user_id?: string
          verification_documents?: Json | null
          verification_status?: string | null
        }
        Relationships: []
      }
      mentor_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          mentor_id: string
          rating: number
          session_id: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          mentor_id: string
          rating: number
          session_id?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          mentor_id?: string
          rating?: number
          session_id?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          mentor_id: string
          sender_id: string
          student_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          mentor_id: string
          sender_id: string
          student_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          mentor_id?: string
          sender_id?: string
          student_id?: string
        }
        Relationships: []
      }
      onboarding_progress: {
        Row: {
          completed_steps: Json | null
          created_at: string
          current_step: number
          id: string
          is_completed: boolean | null
          role_selected: string | null
          total_steps: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_steps?: Json | null
          created_at?: string
          current_step?: number
          id?: string
          is_completed?: boolean | null
          role_selected?: string | null
          total_steps: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_steps?: Json | null
          created_at?: string
          current_step?: number
          id?: string
          is_completed?: boolean | null
          role_selected?: string | null
          total_steps?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          metadata: Json | null
          payment_method: string
          payment_status: string
          session_id: string | null
          transaction_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          payment_method: string
          payment_status?: string
          session_id?: string | null
          transaction_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          payment_method?: string
          payment_status?: string
          session_id?: string | null
          transaction_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          created_at: string
          duration_minutes: number
          feedback: string | null
          id: string
          meeting_link: string | null
          mentor_id: string
          notes: string | null
          rating: number | null
          scheduled_at: string
          session_type: string
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_minutes: number
          feedback?: string | null
          id?: string
          meeting_link?: string | null
          mentor_id: string
          notes?: string | null
          rating?: number | null
          scheduled_at: string
          session_type: string
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          feedback?: string | null
          id?: string
          meeting_link?: string | null
          mentor_id?: string
          notes?: string | null
          rating?: number | null
          scheduled_at?: string
          session_type?: string
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_profiles: {
        Row: {
          created_at: string
          current_level: string
          current_score: number | null
          id: string
          preferred_mentor_id: string | null
          preferred_subjects: string[] | null
          previous_attempts: number | null
          study_hours_per_day: number | null
          target_exam: string
          target_rank: number | null
          target_year: number
          updated_at: string
          user_id: string
          weak_subjects: string[] | null
        }
        Insert: {
          created_at?: string
          current_level: string
          current_score?: number | null
          id?: string
          preferred_mentor_id?: string | null
          preferred_subjects?: string[] | null
          previous_attempts?: number | null
          study_hours_per_day?: number | null
          target_exam: string
          target_rank?: number | null
          target_year: number
          updated_at?: string
          user_id: string
          weak_subjects?: string[] | null
        }
        Update: {
          created_at?: string
          current_level?: string
          current_score?: number | null
          id?: string
          preferred_mentor_id?: string | null
          preferred_subjects?: string[] | null
          previous_attempts?: number | null
          study_hours_per_day?: number | null
          target_exam?: string
          target_rank?: number | null
          target_year?: number
          updated_at?: string
          user_id?: string
          weak_subjects?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "student_profiles_preferred_mentor_id_fkey"
            columns: ["preferred_mentor_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_trial_status: {
        Row: {
          created_at: string
          has_used_trial: boolean
          id: string
          student_id: string
          trial_used_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          has_used_trial?: boolean
          id?: string
          student_id: string
          trial_used_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          has_used_trial?: boolean
          id?: string
          student_id?: string
          trial_used_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string
          id: string
          mentor_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mentor_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mentor_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "mentor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["student", "mentor"],
    },
  },
} as const
