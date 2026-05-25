"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Job, JobCategory, JobType, ExperienceLevel } from "@/data/jobs";

// ---------------------------------------------------------------------------
// Types — mirrors the `jobs` table columns returned from Supabase
// ---------------------------------------------------------------------------
export interface SupabaseJob {
  id: string;
  employer_id: string;
  title: string;
  category: string;
  location: string;
  neighborhood: string;
  job_type: string;
  salary_min: number;
  salary_max: number;
  currency: string;
  description: string;
  full_description: string;
  requirements: {
    experience: string;
    education: string;
    languages: string[];
    locationPreference: string | null;
  };
  deadline: string;
  status: "pending" | "active" | "closed" | "rejected";
  created_at: string;
  employers?:
    | {
        business_name: string;
        business_type: string;
      }
    | {
        business_name: string;
        business_type: string;
      }[];
}

interface UseJobsReturn {
  jobs: Job[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// ---------------------------------------------------------------------------
// Helper: Map Supabase DB Job to Frontend UI Job
// ---------------------------------------------------------------------------
export function mapSupabaseJobToJob(sj: SupabaseJob): Job {
  const categoryEmojiMap: Record<string, string> = {
    Waiter: "💁",
    Chef: "🍳",
    Receptionist: "🛎️",
    Barista: "☕",
    Housekeeper: "🧹",
    Security: "🛡️",
    Cashier: "💵",
    Manager: "💼",
  };

  const emp = Array.isArray(sj.employers) ? sj.employers[0] : sj.employers;

  return {
    id: sj.id,
    businessName: emp?.business_name ?? "Hiring Partner",
    businessLogo: categoryEmojiMap[sj.category] ?? "🏨",
    businessType: emp?.business_type ?? "Hospitality Business",
    title: sj.title,
    category: sj.category as JobCategory,
    location: sj.location,
    neighborhood: sj.neighborhood,
    jobType: sj.job_type as JobType,
    salaryMin: sj.salary_min,
    salaryMax: sj.salary_max,
    currency: sj.currency,
    postedDaysAgo: Math.max(
      0,
      Math.floor((Date.now() - new Date(sj.created_at).getTime()) / (1000 * 60 * 60 * 24))
    ),
    description: sj.description,
    fullDescription: sj.full_description,
    requirements: {
      experience: sj.requirements.experience as ExperienceLevel,
      education: sj.requirements.education,
      languages: sj.requirements.languages,
      locationPreference: sj.requirements.locationPreference,
    },
    deadline: sj.deadline,
    qualificationsMet: true, // simplified or resolved per-profile in checking screens
    locationMismatch: false,
  };
}

// ---------------------------------------------------------------------------
// Hook: useJobs
// Loads only active jobs from Supabase, ordered by most recently posted.
// ---------------------------------------------------------------------------
export function useJobs(category?: string | null): UseJobsReturn {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("jobs")
        .select(
          `
          id,
          employer_id,
          title,
          category,
          location,
          neighborhood,
          job_type,
          salary_min,
          salary_max,
          currency,
          description,
          full_description,
          requirements,
          deadline,
          status,
          created_at,
          employers (
            business_name,
            business_type
          )
        `
        )
        .eq("status", "active") // Only show approved, live jobs
        .order("created_at", { ascending: false });

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      const mappedJobs = ((data ?? []) as unknown as SupabaseJob[]).map(mapSupabaseJobToJob);
      setJobs(mappedJobs);
    } catch (err: unknown) {
      console.error("Failed to fetch jobs:", err);
      setError("Could not load jobs. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return { jobs, isLoading, error, refetch: fetchJobs };
}
