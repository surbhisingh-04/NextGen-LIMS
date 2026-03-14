import { hasSupabaseEnv } from "@/lib/env";
import { normalizeUserRole } from "@/lib/rbac";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types";

type AuthContext = {
  isAuthenticated: boolean;
  role: UserRole | null;
  email: string | null;
  fullName: string | null;
  organizationId: string | null;
};

export async function getAuthContext(): Promise<AuthContext> {
  if (!hasSupabaseEnv) {
    return {
      isAuthenticated: false,
      role: null,
      email: null,
      fullName: null,
      organizationId: null
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      isAuthenticated: false,
      role: null,
      email: null,
      fullName: null,
      organizationId: null
    };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      isAuthenticated: false,
      role: null,
      email: null,
      fullName: null,
      organizationId: null
    };
  }

  const [{ data: profile }, roleResponse] = await Promise.all([
    supabase
      .from("profiles")
      .select("role, organization_id, full_name")
      .eq("id", user.id)
      .maybeSingle(),
    supabase.rpc("current_user_role")
  ]);

  return {
    isAuthenticated: true,
    role:
      normalizeUserRole(typeof roleResponse.data === "string" ? roleResponse.data : null) ??
      normalizeUserRole(profile?.role) ??
      normalizeUserRole(
        typeof user.user_metadata?.role === "string"
          ? user.user_metadata.role
          : typeof user.app_metadata?.role === "string"
            ? user.app_metadata.role
            : null
      ),
    email: user.email ?? null,
    fullName:
      profile?.full_name ??
      (typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null),
    organizationId:
      profile?.organization_id ??
      (typeof user.user_metadata?.organization_id === "string"
        ? user.user_metadata.organization_id
        : null)
  };
}
