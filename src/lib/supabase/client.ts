import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export async function getBrowserSessionUser(client: SupabaseClient): Promise<User | null> {
  const { data, error } = await client.auth.getSession();
  if (error) {
    throw error;
  }

  return data.session?.user ?? null;
}
