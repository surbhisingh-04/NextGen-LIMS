"use server";

import { revalidatePath } from "next/cache";

import { getAuthContext } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { GeneratedReport } from "@/lib/types";

type CreateReportPayload = {
  title: string;
  type: GeneratedReport["type"];
  format: GeneratedReport["format"];
  audience: string;
};

async function getSupabaseWithUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Not authenticated.");
  }
  return { supabase, user };
}

export async function createReportDraft(payload: CreateReportPayload) {
  const authContext = await getAuthContext();
  if (authContext.role !== "scientist_technician") {
    throw new Error("Only technicians can create report drafts.");
  }
  if (!authContext.organizationId) {
    throw new Error("Missing organization.");
  }

  const { supabase, user } = await getSupabaseWithUser();
  const report = {
    organization_id: authContext.organizationId,
    title: payload.title.trim(),
    report_type: payload.type,
    file_format: payload.format,
    status: "draft",
    generated_by: user.id,
    generated_at: new Date().toISOString()
  };

  const { data, error } = await supabase.from("generated_reports").insert(report).select("id").single();
  if (error) {
    throw new Error(error.message);
  }

  await supabase.from("report_activity").insert({
    organization_id: authContext.organizationId,
    report_id: data?.id ?? null,
    actor_id: user.id,
    actor_name: authContext.fullName ?? authContext.email ?? "Technician",
    action: "Draft created",
    detail: `${payload.type.toUpperCase()} · ${payload.format.toUpperCase()} · ${payload.audience.trim() || "Internal QA"}`
  });

  revalidatePath("/reports");
}

export async function approveReport(reportId: string) {
  const authContext = await getAuthContext();
  if (authContext.role !== "qa_qc_manager") {
    throw new Error("Only QA/QC can approve reports.");
  }
  if (!authContext.organizationId) {
    throw new Error("Missing organization.");
  }

  const { supabase, user } = await getSupabaseWithUser();

  const { error } = await supabase
    .from("generated_reports")
    .update({
      status: "released"
    })
    .eq("id", reportId);

  if (error) {
    throw new Error(error.message);
  }

  await supabase.from("report_activity").insert({
    organization_id: authContext.organizationId,
    report_id: reportId,
    actor_id: user.id,
    actor_name: authContext.fullName ?? authContext.email ?? "QA/QC",
    action: "Report approved",
    detail: "Released for distribution"
  });

  revalidatePath("/reports");
}

export async function rejectReport(reportId: string, reason: string) {
  const authContext = await getAuthContext();
  if (authContext.role !== "qa_qc_manager") {
    throw new Error("Only QA/QC can reject reports.");
  }
  if (!authContext.organizationId) {
    throw new Error("Missing organization.");
  }
  if (!reason.trim()) {
    throw new Error("Rejection reason is required.");
  }

  const { supabase, user } = await getSupabaseWithUser();

  const { error } = await supabase
    .from("generated_reports")
    .update({
      status: "rejected"
    })
    .eq("id", reportId);

  if (error) {
    throw new Error(error.message);
  }

  await supabase.from("report_activity").insert({
    organization_id: authContext.organizationId,
    report_id: reportId,
    actor_id: user.id,
    actor_name: authContext.fullName ?? authContext.email ?? "QA/QC",
    action: "Report rejected",
    detail: reason.trim()
  });

  revalidatePath("/reports");
}
