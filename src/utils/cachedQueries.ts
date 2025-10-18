import { supabase } from "@/integrations/supabase/client";
import { cache } from "./cache";
import { PostgrestError } from "@supabase/supabase-js";

// Define types for query responses
export interface QueryResponse<T> {
  data: T | null;
  error: PostgrestError | null;
}

// Define MentorProfile type
export interface MentorProfile {
  id: string;
  user_id: string;
  air_rank: number;
  exam_type: string;
  exam_year: number;
  current_institution: string;
  verification_status: string;
  specialization: string | null;
  bio: string | null;
  hourly_rate: number | null;
  average_rating: number;
  total_sessions: number;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  } | null;
}

// Cache duration constants
const CACHE_DURATIONS = {
  SHORT: 60 * 1000, // 1 minute
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 30 * 60 * 1000, // 30 minutes
};

// Cached query functions for frequently accessed data
export const cachedQueries = {
  // Get mentor profile with caching
  async getMentorProfile(mentorId: string): Promise<QueryResponse<MentorProfile>> {
    const cacheKey = `mentor_profile:${mentorId}`;
    const cachedData = cache.get<QueryResponse<MentorProfile>>(cacheKey);
    
    if (cachedData) return cachedData;
    
    const { data, error } = await supabase
      .from("mentor_profiles")
      .select(`
        id,
        user_id,
        air_rank,
        exam_type,
        exam_year,
        current_institution,
        verification_status,
        specialization,
        bio,
        hourly_rate,
        average_rating,
        total_sessions,
        profiles (
          full_name,
          avatar_url
        )
      `)
      .eq("user_id", mentorId)
      .eq("verification_status", "verified")
      .single();
      
    const typedData = data as unknown as MentorProfile;
    
    if (!error && typedData) {
      cache.set(cacheKey, { data: typedData, error }, CACHE_DURATIONS.MEDIUM);
    }
    
    return { data: typedData, error };
  },
  
  // Get verified mentors list with caching
  async getVerifiedMentors(): Promise<QueryResponse<MentorProfile[]>> {
    const cacheKey = "verified_mentors";
    const cachedData = cache.get<QueryResponse<MentorProfile[]>>(cacheKey);
    
    if (cachedData) return cachedData;
    
    const { data, error } = await supabase
      .from("mentor_profiles")
      .select(`
        id,
        user_id,
        air_rank,
        exam_type,
        exam_year,
        current_institution,
        verification_status,
        specialization,
        bio,
        hourly_rate,
        average_rating,
        total_sessions,
        profiles (
          full_name,
          avatar_url
        )
      `)
      .eq("verification_status", "verified");
      
    const typedData = data as unknown as MentorProfile[];
    
    if (!error && typedData) {
      cache.set(cacheKey, { data: typedData, error }, CACHE_DURATIONS.MEDIUM);
    }
    
    return { data: typedData, error };
  },
  
  // Clear specific cache entries when data changes
  invalidateCache(key: string) {
    cache.delete(key);
  }
};