import { createClient } from "@supabase/supabase-js";

// These are public client-side settings, not service-role secrets.
// Prefer Vercel environment variables; fallbacks allow preview builds to prerender
// when NEXT_PUBLIC_* variables have not been configured for the preview environment.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://dpudeffqfwtoeockdsih.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "sb_publishable_MpjksDaTOwc1SPxL13t5Zg_33zpxxbs";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);