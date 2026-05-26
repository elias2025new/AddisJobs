/**
 * api.ts — Secure API layer for Prime Hospitality
 *
 * ALL mutating requests (application submission, profile creation, job posting)
 * MUST go through this module. It automatically attaches the raw Telegram
 * initData as the `x-telegram-init-data` header, which the Edge Function
 * validates via HMAC-SHA256 before processing any action.
 *
 * Never call Supabase client-side for writes — always use these functions.
 */

const EDGE_FUNCTION_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co"}/functions/v1/validate-telegram-auth`;


// ---------------------------------------------------------------------------
// Internal request helper
// ---------------------------------------------------------------------------
async function callEdgeFunction<T = unknown>(
  initData: string | null,
  body: Record<string, unknown>
): Promise<T> {
  if (!initData) {
    // In development (outside Telegram) there is no real initData.
    // We still make the call but the Edge Function will reject non-dev requests.
    console.warn(
      "[api] No initData available. This request will fail in production."
    );
  }

  const res = await fetch(EDGE_FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Supabase Edge Functions require the anon key in the Authorization header
      // to pass through the API gateway, even though our custom logic validates
      // the x-telegram-init-data header.
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""}`,
      // This header is the security gate for our custom Telegram validation
      "x-telegram-init-data": initData ?? "",
    },
    body: JSON.stringify(body),
  });

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new Error("Server returned an invalid response.");
  }

  if (!res.ok) {
    const errData = data as { error?: string; message?: string };
    const errorMsg =
      errData?.error ||
      errData?.message ||
      `Unknown error (${res.status}): ${JSON.stringify(data).substring(0, 100)}`;
    throw new ApiError(errorMsg, res.status);
  }

  return data as T;
}

// ---------------------------------------------------------------------------
// Custom error class for structured error handling in the UI
// ---------------------------------------------------------------------------
export class ApiError extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message);
    this.name = "ApiError";
  }

  /** Returns true if the error is a rate-limit response (429) */
  get isRateLimit() {
    return this.statusCode === 429;
  }

  /** Returns true if the auth signature was rejected (401) */
  get isUnauthorized() {
    return this.statusCode === 401;
  }

  /** Returns true if this was a duplicate submission (409) */
  get isDuplicate() {
    return this.statusCode === 409;
  }
}

// ---------------------------------------------------------------------------
// Action: Submit a job application
// ---------------------------------------------------------------------------
export interface SubmitApplicationParams {
  initData: string | null;
  jobId: string;
  coverNote?: string;
}

export async function submitApplication({
  initData,
  jobId,
  coverNote,
}: SubmitApplicationParams): Promise<{ success: boolean; message: string }> {
  return callEdgeFunction(initData, {
    action: "submit_application",
    jobId,
    coverNote: coverNote ?? "",
  });
}

// ---------------------------------------------------------------------------
// Action: Create job seeker profile (onboarding completion)
// ---------------------------------------------------------------------------
export interface CreateProfileParams {
  initData: string | null;
  profileData: {
    fullName: string;
    age: number | "";
    location: string;
    willingToRelocate: boolean;
    contactShared: boolean | null;
    phoneNumber: string;
    selectedCategories: string[];
    experienceLevels: Record<string, string>;
  };
  cvUrl: string | null;
}

export async function createProfile({
  initData,
  profileData,
  cvUrl,
}: CreateProfileParams): Promise<{ success: boolean; message: string }> {
  return callEdgeFunction(initData, {
    action: "create_profile",
    profileData,
    cvUrl,
  });
}

// ---------------------------------------------------------------------------
// Action: Fetch job seeker profile (profile tab + onboarding check)
// ---------------------------------------------------------------------------
export interface FetchProfileResult {
  success: boolean;
  profile: Record<string, unknown> | null;
  onboarding_completed: boolean;
}

export async function fetchProfile(
  initData: string | null
): Promise<FetchProfileResult> {
  return callEdgeFunction<FetchProfileResult>(initData, {
    action: "get_profile",
  });
}

// ---------------------------------------------------------------------------
// Action: Fetch job seeker applications list
// ---------------------------------------------------------------------------
export interface FetchApplicationsResult {
  success: boolean;
  applications: Array<Record<string, any>>;
}

export async function fetchApplications(
  initData: string | null
): Promise<FetchApplicationsResult> {
  return callEdgeFunction<FetchApplicationsResult>(initData, {
    action: "get_applications",
  });
}

// ---------------------------------------------------------------------------
// Action: Fetch employer dashboard data
// ---------------------------------------------------------------------------
export interface FetchEmployerDashboardResult {
  success: boolean;
  employer: {
    id: string;
    business_name: string;
    status: "pending" | "approved" | "rejected";
  };
  jobs: Array<Record<string, any>>;
  stats: {
    totalJobs: number;
    activeJobs: number;
    totalApplicants: number;
    pendingReview: number;
  };
}

export async function fetchEmployerDashboard(
  initData: string | null
): Promise<FetchEmployerDashboardResult> {
  return callEdgeFunction<FetchEmployerDashboardResult>(initData, {
    action: "get_employer_dashboard",
  });
}

// ---------------------------------------------------------------------------
// Action: Post a new job listing
// ---------------------------------------------------------------------------
export interface PostJobParams {
  initData: string | null;
  jobData: {
    title: string;
    category: string;
    jobType: string;
    salaryMin: string;
    salaryMax: string;
    neighborhood: string;
    description: string;
    deadline: string;
    experience: string;
  };
}

export async function postJob({
  initData,
  jobData,
}: PostJobParams): Promise<{ success: boolean; message: string }> {
  return callEdgeFunction(initData, {
    action: "post_job",
    jobData,
  });
}
