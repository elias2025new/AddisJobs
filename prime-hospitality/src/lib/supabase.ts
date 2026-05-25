import { createClient } from "@supabase/supabase-js";

// Retrieve environment variables safely
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Ensure URL is correctly formatted if present
const baseUrl = supabaseUrl ? supabaseUrl.replace(/\/rest\/v1\/?$/, "") : "";

// Create a single supabase client for interacting with your database
// Fallback to placeholders if variables are not yet provided during Vercel build-time
export const supabase = createClient(
  baseUrl || "https://placeholder-project.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);

