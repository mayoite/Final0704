import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
  process.env.SUPABASE_URL?.trim() ||
  "";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  process.env.SUPABASE_ANON_KEY?.trim() ||
  process.env.SUPABASE_PUBLISHABLE_KEY?.trim() ||
  "";
const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey);

if (!hasSupabaseEnv) {
  console.warn(
    "[supabase] Missing Supabase URL/public key env. Expected NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and NEXT_PUBLIC_SUPABASE_ANON_KEY/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Using stub client.",
  );
}

const stubFetch: typeof fetch = async () =>
  new Response(
    JSON.stringify({
      message:
        "Missing Supabase runtime env vars: NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and NEXT_PUBLIC_SUPABASE_ANON_KEY/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    }),
    {
      status: 503,
      headers: { "Content-Type": "application/json" },
    },
  );

export const supabase = createClient(
  hasSupabaseEnv ? supabaseUrl! : "https://supabase.invalid",
  hasSupabaseEnv ? supabaseAnonKey! : "stub-anon-key",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: hasSupabaseEnv ? undefined : { fetch: stubFetch },
  },
);
