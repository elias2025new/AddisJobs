-- ==========================================
-- 00001_initial_schema.sql
-- Run this in your Supabase SQL Editor
-- ==========================================

-- Enable the pgcrypto extension for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. TABLES
-- ==========================================

-- USERS Table (Core identity)
CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id bigint UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('job_seeker', 'employer', 'admin')),
  is_banned boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- EMPLOYERS Table
CREATE TABLE public.employers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  business_name text NOT NULL,
  business_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- PROFILES Table (Job Seekers)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  telegram_id bigint UNIQUE NOT NULL, -- kept for convenience during onboarding queries
  full_name text NOT NULL,
  age integer NOT NULL CHECK (age >= 16 AND age <= 60),
  location text NOT NULL,
  willing_to_relocate boolean DEFAULT false NOT NULL,
  phone_number text, -- NULL if contact_shared is false
  contact_shared boolean DEFAULT false NOT NULL,
  selected_categories text[] NOT NULL,
  experience_levels jsonb NOT NULL,
  cv_url text,
  onboarding_completed boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- JOBS Table
CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid REFERENCES public.employers(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  category text NOT NULL,
  location text NOT NULL,
  neighborhood text NOT NULL,
  job_type text NOT NULL,
  salary_min integer NOT NULL,
  salary_max integer NOT NULL,
  currency text DEFAULT 'ETB' NOT NULL,
  description text NOT NULL,
  full_description text NOT NULL,
  requirements jsonb NOT NULL, -- { experience, education, languages, locationPreference }
  deadline timestamp with time zone NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'closed', 'rejected')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- APPLICATIONS Table
CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  telegram_id bigint NOT NULL,
  cover_note text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'rejected')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Prevent duplicate applications per user per job
  UNIQUE(job_id, telegram_id)
);


-- ==========================================
-- 2. ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- USERS Policies
-- --------------------------------------------------------
-- Admin service role bypasses RLS (enabled by default for service_role keys).
-- Users can read their own user record.
CREATE POLICY "Users can view own record"
ON public.users FOR SELECT
USING ( telegram_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'telegram_id')::bigint );

-- --------------------------------------------------------
-- PROFILES Policies
-- --------------------------------------------------------
-- Job seekers can read and update their own profile.
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING ( telegram_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'telegram_id')::bigint );

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING ( telegram_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'telegram_id')::bigint );

-- Note: Profile creation is handled by the Edge Function to ensure secure initData validation, 
-- or we can allow insert if JWT claims match. The edge function using service_role bypasses RLS.

-- --------------------------------------------------------
-- EMPLOYERS Policies
-- --------------------------------------------------------
-- Public read (job seekers need to see employer details on jobs).
CREATE POLICY "Employers are viewable by everyone"
ON public.employers FOR SELECT
USING ( true );

-- --------------------------------------------------------
-- JOBS Policies
-- --------------------------------------------------------
-- Publicly readable.
CREATE POLICY "Jobs are viewable by everyone"
ON public.jobs FOR SELECT
USING ( true );

-- Writable only by the owning employer who is 'approved' and not 'banned'.
-- (Note: Direct INSERT/UPDATE via frontend is blocked by lack of policy.
-- The Edge Function must use the SUPABASE_SERVICE_ROLE_KEY to bypass RLS
-- and securely insert/update jobs on behalf of the employer).

-- --------------------------------------------------------
-- APPLICATIONS Policies
-- --------------------------------------------------------
-- Job seekers can see their own applications.
CREATE POLICY "Seekers can view own applications"
ON public.applications FOR SELECT
USING ( telegram_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'telegram_id')::bigint );

-- Employers can see applications for their own jobs.
CREATE POLICY "Employers can view applications for their jobs"
ON public.applications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.jobs j
    JOIN public.employers e ON j.employer_id = e.id
    JOIN public.users u ON e.user_id = u.id
    WHERE j.id = applications.job_id
    AND u.telegram_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'telegram_id')::bigint
  )
);

-- Note: Application insertion is strictly handled by the Edge Function to enforce rate limiting 
-- and data validation, so no direct INSERT policy is provided here for frontend clients.


-- ==========================================
-- 3. TRIGGERS
-- ==========================================

-- Function to automatically update the 'updated_at' column
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to all tables
CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

CREATE TRIGGER set_employers_updated_at
BEFORE UPDATE ON public.employers
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

CREATE TRIGGER set_jobs_updated_at
BEFORE UPDATE ON public.jobs
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

CREATE TRIGGER set_applications_updated_at
BEFORE UPDATE ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

