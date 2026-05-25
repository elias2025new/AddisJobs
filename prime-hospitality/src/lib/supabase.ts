import { createClient } from "@supabase/supabase-js";

// Retrieve environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Ensure URL is correctly formatted (remove /rest/v1/ if it was accidentally included in the URL variable)
// The Supabase JS client handles adding /rest/v1 internally.
const baseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, "");

// Create a single supabase client for interacting with your database
export const supabase = createClient(baseUrl, supabaseAnonKey);
