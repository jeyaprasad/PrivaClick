import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = () => {
  return (
    !!supabaseUrl &&
    supabaseUrl !== "https://your-project-id.supabase.co" &&
    !!supabaseAnonKey &&
    supabaseAnonKey !== "your-anon-public-key"
  );
};

export const supabaseClient = createClient(
  isSupabaseConfigured() ? supabaseUrl : "https://placeholder.supabase.co",
  isSupabaseConfigured() ? supabaseAnonKey : "placeholder-anon-key",
);
