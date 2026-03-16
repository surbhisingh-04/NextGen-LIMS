"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
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
  priority: z.enum(["low", "medium", "high", "critical"]),
  dueAt: z.string().optional()
});

const clientSampleSchema = z.object({
  materialName: z.string().min(2),
  batchNumber: z.string().min(2),
  priority: z.enum(["low", "medium", "high", "critical"]),
  dueAt: z.string().optional(),
  notes: z.string().max(2000).optional()
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
  const authContext = await getAuthContext();

  if (!authContext.isAuthenticated || !authContext.role || !authContext.organizationId) {
    redirect("/login?error=Please%20log%20in%20before%20submitting%20a%20sample.");
  }

  if (!hasSupabaseEnv) {
    redirect("/samples/sample-submission?error=Supabase%20is%20not%20configured.%20Client%20submission%20cannot%20be%20saved%20yet.");
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/samples/sample-submission?error=Unable%20to%20initialize%20Supabase%20for%20sample%20submission.");
  }

  if (authContext.role === "client") {
    const payload = clientSampleSchema.safeParse({
      materialName: formData.get("materialName"),
      batchNumber: formData.get("batchNumber"),
      priority: formData.get("priority"),
      dueAt: formData.get("dueAt"),
      notes: formData.get("notes")
    });

    if (!payload.success) {
      redirect("/samples/sample-submission?error=Enter%20the%20material%20name%2C%20batch%20number%2C%20priority%2C%20and%20optional%20notes%20before%20submitting.");
    }

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login?error=Your%20session%20expired.%20Please%20sign%20in%20again.");
    }

    const requestPayload = {
      materialName: payload.data.materialName,
      batchNumber: payload.data.batchNumber,
      priority: payload.data.priority,
      dueAt: payload.data.dueAt || null,
      notes: payload.data.notes?.trim() || null,
      submittedBy: authContext.fullName ?? authContext.email ?? "Client user"
    };

    const portalRequestResult = await supabase
      .from("client_portal_requests")
      .insert({
        organization_id: authContext.organizationId,
        external_client_id: user.id,
        request_type: "submission",
        status: "submitted",
        payload: requestPayload
      })
      .select("id")
      .single();

    if (portalRequestResult.error || !portalRequestResult.data) {
      redirect(
        `/samples/sample-submission?error=${encodeURIComponent(
          portalRequestResult.error?.message ?? "Unable to create the client submission request."
        )}`
      );
    }

    if (hasSupabaseAdminEnv) {
      const supabaseAdmin = createSupabaseAdminClient();

      if (supabaseAdmin) {
        const [laboratoryResult, workflowResult] = await Promise.all([
          supabaseAdmin
            .from("laboratories")
            .select("id, name")
            .eq("organization_id", authContext.organizationId)
            .order("created_at", { ascending: true })
            .limit(1)
            .maybeSingle(),
          supabaseAdmin
            .from("workflow_stages")
            .select("id, name")
            .eq("organization_id", authContext.organizationId)
            .order("sort_order", { ascending: true })
            .limit(1)
            .maybeSingle()
        ]);

        if (laboratoryResult.data) {
          const generatedSampleCode = `CL-${new Date()
            .toISOString()
            .slice(0, 10)
            .replaceAll("-", "")}-${randomUUID().slice(0, 6).toUpperCase()}`;

          const sampleInsertResult = await supabaseAdmin
            .from("samples")
            .insert({
              organization_id: authContext.organizationId,
              laboratory_id: laboratoryResult.data.id,
              workflow_stage_id: workflowResult.data?.id ?? null,
              sample_code: generatedSampleCode,
              material_name: payload.data.materialName,
              batch_number: payload.data.batchNumber,
              workflow_name: workflowResult.data?.name ?? "Client submission intake",
              owner_name: authContext.fullName ?? authContext.email ?? "Client submission",
              priority: payload.data.priority,
              status: "registered",
              due_at: payload.data.dueAt || null,
              external_client_id: user.id,
              metadata: {
                source: "client_portal",
                portal_request_id: portalRequestResult.data.id,
                notes: payload.data.notes?.trim() || null
              }
            })
            .select("id")
            .single();

          if (!sampleInsertResult.error && sampleInsertResult.data) {
            await supabaseAdmin
              .from("client_portal_requests")
              .update({
                sample_id: sampleInsertResult.data.id,
                payload: {
                  ...requestPayload,
                  generatedSampleId: sampleInsertResult.data.id,
                  generatedSampleCode
                }
              })
              .eq("id", portalRequestResult.data.id);
          }
        }
      }
    }

    revalidatePath("/portal");
    revalidatePath("/client/dashboard");
    revalidatePath("/samples");
    revalidatePath("/dashboard");

    redirect("/portal?message=Sample%20submission%20received.%20Your%20request%20is%20now%20visible%20in%20the%20client%20portal.");
  }

  const payload = sampleSchema.safeParse({
    sampleCode: formData.get("sampleCode"),
    materialName: formData.get("materialName"),
    batchNumber: formData.get("batchNumber"),
    workflow: formData.get("workflow"),
    lab: formData.get("lab"),
    priority: formData.get("priority"),
    dueAt: formData.get("dueAt")
  });

  if (!payload.success) {
    redirect("/samples/sample-submission?error=Enter%20the%20sample%20code%2C%20material%20name%2C%20batch%20number%2C%20workflow%2C%20lab%2C%20and%20priority.");
  }

  const [laboratoryResult, workflowResult] = await Promise.all([
    supabase
      .from("laboratories")
      .select("id, name")
      .eq("organization_id", authContext.organizationId)
      .ilike("name", payload.data.lab)
      .maybeSingle(),
    supabase
      .from("workflow_stages")
      .select("id, name")
      .eq("organization_id", authContext.organizationId)
      .ilike("name", payload.data.workflow)
      .maybeSingle()
  ]);

  if (!laboratoryResult.data) {
    redirect("/samples/sample-submission?error=Assigned%20laboratory%20was%20not%20found%20for%20your%20organization.");
  }

  const insertResult = await supabase.from("samples").insert({
    organization_id: authContext.organizationId,
    laboratory_id: laboratoryResult.data.id,
    workflow_stage_id: workflowResult.data?.id ?? null,
    sample_code: payload.data.sampleCode,
    material_name: payload.data.materialName,
    batch_number: payload.data.batchNumber,
    workflow_name: payload.data.workflow,
    owner_name: authContext.fullName ?? authContext.email ?? "Lab user",
    priority: payload.data.priority,
    status: "registered",
    due_at: payload.data.dueAt || null
  });

  if (insertResult.error) {
    redirect(`/samples/sample-submission?error=${encodeURIComponent(insertResult.error.message)}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/samples");
  redirect("/samples/sample-list?message=Sample%20intake%20record%20created%20successfully.");
}
