import { z } from "zod";

const trimmedString = z.string().trim().optional();
const trimmedUrl = z.string().trim().url().optional();

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: trimmedUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: trimmedString,
  NEXT_PUBLIC_APP_URL: trimmedUrl,
  SUPABASE_SERVICE_ROLE_KEY: trimmedString
});

export const env = envSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
});

function isPlaceholderValue(value?: string) {
  if (!value) return true;

  const normalized = value.trim().toLowerCase();

  return [
    "https://your-project.supabase.co",
    "your-anon-key",
    "your-service-role-key"
  ].includes(normalized);
}

export const hasSupabaseEnv = Boolean(
  env.NEXT_PUBLIC_SUPABASE_URL &&
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !isPlaceholderValue(env.NEXT_PUBLIC_SUPABASE_URL) &&
    !isPlaceholderValue(env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
);

export const hasSupabaseAdminEnv = Boolean(
  hasSupabaseEnv &&
    env.SUPABASE_SERVICE_ROLE_KEY &&
    !isPlaceholderValue(env.SUPABASE_SERVICE_ROLE_KEY)
);
