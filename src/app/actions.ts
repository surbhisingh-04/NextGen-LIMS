"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getAuthContext } from "@/lib/auth";
import { env, hasSupabaseAdminEnv, hasSupabaseEnv } from "@/lib/env";
import { getRoleDashboardPath, internalInviteRoles, roleLabels } from "@/lib/rbac";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const sampleSchema = z.object({
  sampleCode: z.string().min(3),
  materialName: z.string().min(2),
  batchNumber: z.string().min(2),
  workflow: z.string().min(2),
  lab: z.string().min(2),
  priority: z.enum(["low", "medium", "high", "critical"])
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const signupSchema = loginSchema.extend({
  fullName: z.string().min(2),
  company: z.string().min(2),
  phone: z.string().min(7)
});

const inviteSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["lab_manager", "scientist_technician", "qa_qc_manager"])
});

const setPasswordSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string().min(8)
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"]
  });

function authRedirect(pathname: string, key: "error" | "message", message: string): never {
  const params = new URLSearchParams({ [key]: message });
  redirect(`${pathname}?${params.toString()}`);
}

function getAuthErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (error.message.toLowerCase().includes("fetch failed")) {
      return "Unable to reach Supabase. Check your `.env.local` values and make sure they are real project credentials.";
    }

    return error.message;
  }

  return "Authentication failed. Check your Supabase configuration and try again.";
}

async function getAppBaseUrl() {
  const headerStore = await headers();
  const origin = headerStore.get("origin");

  if (origin) {
    return origin;
  }

  if (env.NEXT_PUBLIC_APP_URL) {
    return env.NEXT_PUBLIC_APP_URL;
  }

  const forwardedProto = headerStore.get("x-forwarded-proto");
  const forwardedHost = headerStore.get("x-forwarded-host") ?? headerStore.get("host");

  if (forwardedHost) {
    return `${forwardedProto ?? "http"}://${forwardedHost}`;
  }

  return "http://127.0.0.1:3000";
}

export async function loginAction(formData: FormData) {
  const payload = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!payload.success) {
    authRedirect("/login", "error", "Enter a valid email and password.");
  }

  const credentials = payload.data;

  if (!hasSupabaseEnv) {
    authRedirect("/login", "error", "Supabase Auth is not configured. Add real project values in `.env.local` to use email and password login.");
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    authRedirect("/login", "error", "Unable to initialize Supabase for authentication.");
  }

  let error: { message: string } | null = null;

  try {
    const result = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    });

    error = result.error;
  } catch (authError) {
    authRedirect("/login", "error", getAuthErrorMessage(authError));
  }

  if (error) {
    authRedirect("/login", "error", error.message);
  }

  const authContext = await getAuthContext();

  if (!authContext.role) {
    await supabase.auth.signOut();
    authRedirect("/login", "error", "Your account authenticated successfully, but no role is assigned yet.");
  }

  redirect(getRoleDashboardPath(authContext.role));
}

export async function signupAction(formData: FormData) {
  const payload = signupSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    company: formData.get("company"),
    phone: formData.get("phone"),
    password: formData.get("password")
  });

  if (!payload.success) {
    authRedirect("/signup", "error", "Enter your name, company, phone, valid email, and a password with at least 8 characters.");
  }

  const account = payload.data;

  if (!hasSupabaseEnv) {
    authRedirect("/signup", "error", "Supabase Auth is not configured. Add real project values in `.env.local` to create accounts with email and password.");
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    authRedirect("/signup", "error", "Unable to initialize Supabase for authentication.");
  }

  const origin = await getAppBaseUrl();
  let data: { session: unknown } | null = null;
  let error: { message: string } | null = null;

  try {
    const result = await supabase.auth.signUp({
      email: account.email,
      password: account.password,
      options: {
        data: {
          full_name: account.fullName,
          role: "client",
          company_name: account.company,
          phone: account.phone
        },
        emailRedirectTo: `${origin}/login`
      }
    });

    data = result.data;
    error = result.error;
  } catch (authError) {
    authRedirect("/signup", "error", getAuthErrorMessage(authError));
  }

  if (error) {
    authRedirect("/signup", "error", error.message);
  }

  if (data?.session) {
    redirect("/client/dashboard");
  }

  authRedirect("/login", "message", "Client account created. Check your email to verify it, then log in with your email and password.");
}

export async function inviteUserAction(formData: FormData) {
  const payload = inviteSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    role: formData.get("role")
  });

  if (!payload.success) {
    authRedirect("/admin", "error", "Enter a valid name, email, and internal role before sending the invite.");
  }

  if (!hasSupabaseEnv || !hasSupabaseAdminEnv) {
    authRedirect("/admin", "error", "Supabase admin credentials are required to send user invitations.");
  }

  const authContext = await getAuthContext();

  if (authContext.role !== "admin" || !authContext.organizationId) {
    authRedirect("/admin", "error", "Only admins with an assigned organization can invite internal users.");
  }

  const supabaseAdmin = createSupabaseAdminClient();

  if (!supabaseAdmin) {
    authRedirect("/admin", "error", "Unable to initialize the Supabase admin client.");
  }

  const origin = await getAppBaseUrl();
  let error: { message: string } | null = null;

  try {
    const result = await supabaseAdmin.auth.admin.inviteUserByEmail(payload.data.email, {
      redirectTo: `${origin}/auth/callback?next=/auth/set-password`,
      data: {
        full_name: payload.data.fullName,
        role: payload.data.role,
        organization_id: authContext.organizationId
      }
    });

    error = result.error;
  } catch (inviteError) {
    authRedirect("/admin", "error", getAuthErrorMessage(inviteError));
  }

  if (error) {
    const linkResult = await supabaseAdmin.auth.admin.generateLink({
      type: "invite",
      email: payload.data.email,
      options: {
        redirectTo: `${origin}/auth/callback?next=/auth/set-password`,
        data: {
          full_name: payload.data.fullName,
          role: payload.data.role,
          organization_id: authContext.organizationId
        }
      }
    });

    const actionLink =
      linkResult.data && "action_link" in linkResult.data
        ? (linkResult.data as { action_link?: string }).action_link
        : linkResult.data?.properties?.action_link;

    if (!linkResult.error && actionLink) {
      const params = new URLSearchParams({
        message: "Invite email failed. Share the link below.",
        inviteLink: actionLink,
        inviteError: error.message
      });
      redirect(`/admin?${params.toString()}`);
    }

    authRedirect("/admin", "error", error.message);
  }

  authRedirect(
    "/admin",
    "message",
    `Invitation sent to ${payload.data.email} for the ${roleLabels[payload.data.role]} role.`
  );
}

export async function setPasswordAction(formData: FormData) {
  const payload = setPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword")
  });

  if (!payload.success) {
    authRedirect("/auth/set-password", "error", "Enter a password with at least 8 characters and make sure both fields match.");
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    authRedirect("/login", "error", "Unable to initialize Supabase for password setup.");
  }

  let error: { message: string } | null = null;

  try {
    const result = await supabase.auth.updateUser({
      password: payload.data.password
    });

    error = result.error;
  } catch (authError) {
    authRedirect("/auth/set-password", "error", getAuthErrorMessage(authError));
  }

  if (error) {
    authRedirect("/auth/set-password", "error", error.message);
  }

  const authContext = await getAuthContext();

  if (!authContext.role) {
    authRedirect("/login", "error", "Password updated, but your application role is still missing. Contact an administrator.");
  }

  redirect(`${getRoleDashboardPath(authContext.role)}?message=${encodeURIComponent("Password created successfully. Welcome to your workspace.")}`);
}

export async function updatePasswordAction(formData: FormData) {
  const payload = setPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword")
  });

  if (!payload.success) {
    authRedirect("/account-settings", "error", "Enter a password with at least 8 characters and make sure both fields match.");
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    authRedirect("/account-settings", "error", "Unable to initialize Supabase for password update.");
  }

  let error: { message: string } | null = null;

  try {
    const result = await supabase.auth.updateUser({
      password: payload.data.password
    });

    error = result.error;
  } catch (authError) {
    authRedirect("/account-settings", "error", getAuthErrorMessage(authError));
  }

  if (error) {
    authRedirect("/account-settings", "error", error.message);
  }

  authRedirect("/account-settings", "message", "Password updated successfully.");
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/login?message=You%20have%20been%20logged%20out.");
}

export async function registerSampleAction(formData: FormData) {
  const payload = sampleSchema.parse({
    sampleCode: formData.get("sampleCode"),
    materialName: formData.get("materialName"),
    batchNumber: formData.get("batchNumber"),
    workflow: formData.get("workflow"),
    lab: formData.get("lab"),
    priority: formData.get("priority")
  });

  console.info("Register sample", payload);

  revalidatePath("/dashboard");
  revalidatePath("/samples");
}
