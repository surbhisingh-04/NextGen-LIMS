import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

import { env } from "@/lib/env";

function trySetCookie(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  payload: { name: string; value: string } & CookieOptions
) {
  try {
    cookieStore.set(payload);
  } catch {
    // Server components can read cookies but cannot always mutate them.
    // Middleware handles session refresh persistence for those render paths.
  }
}

export async function createSupabaseServerClient() {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          trySetCookie(cookieStore, { name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          trySetCookie(cookieStore, { name, value: "", ...options });
        }
      }
    }
  );
}
