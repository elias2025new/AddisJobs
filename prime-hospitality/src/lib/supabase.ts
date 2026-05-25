import { createClient } from "@supabase/supabase-js";

// Retrieve environment variables safely
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Strip /rest/v1/ suffix if accidentally included
const baseUrl = supabaseUrl ? supabaseUrl.replace(/\/rest\/v1\/?$/, "") : "";

// Loud warning if env vars are missing — visible in Vercel/browser console
if (!baseUrl || baseUrl.includes("placeholder")) {
  console.error(
    "⛔ [Supabase] NEXT_PUBLIC_SUPABASE_URL is missing or still a placeholder!\n" +
    "  Current value: '" + supabaseUrl + "'\n" +
    "  → Add NEXT_PUBLIC_SUPABASE_URL to your Vercel Environment Variables and Redeploy."
  );
}
if (!supabaseAnonKey || supabaseAnonKey.includes("placeholder")) {
  console.error(
    "⛔ [Supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or still a placeholder!\n" +
    "  → Add NEXT_PUBLIC_SUPABASE_ANON_KEY to your Vercel Environment Variables and Redeploy."
  );
}

console.log("[Supabase] Connecting to:", baseUrl || "⛔ NO URL SET");

export const supabase = createClient(
  baseUrl || "https://placeholder-project.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);

