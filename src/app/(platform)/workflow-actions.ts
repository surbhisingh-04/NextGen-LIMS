"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getAuthContext } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types";

const assignmentSchema = z.object({
  requestId: z.string().min(1),
  technicianId: z.string().min(1),
  laboratoryName: z.string().min(2),
  workflowName: z.string().min(2),
  dueAt: z.string().optional()
});

const inventorySchema = z.object({
  itemId: z.string().min(1),
  quantity: z.coerce.number().min(0),
  reorderLevel: z.coerce.number().min(0)
});

const resultEntrySchema = z.object({
  testDefinitionId: z.string().min(1),
  methodName: z.string().min(2),
  resultValue: z.string().min(1),
  specification: z.string().min(1)
});

const qcReviewSchema = z.object({
  resultId: z.string().min(1),
  decision: z.enum(["approve", "reject"]),
  reason: z.string().optional()
});

async function getWorkflowContext(allowedRoles: UserRole[]) {
  if (!hasSupabaseEnv) {
    throw new Error("Supabase is not configured.");
  }

  const authContext = await getAuthContext();

  if (!authContext.role || !allowedRoles.includes(authContext.role)) {
    throw new Error("You do not have access to this workflow action.");
  }

  if (!authContext.organizationId) {
    throw new Error("Missing organization.");
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    throw new Error("Unable to initialize Supabase.");
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated.");
  }

  return {
    authContext: {
      ...authContext,
      role: authContext.role as UserRole,
      organizationId: authContext.organizationId as string
    },
    supabase,
    user
  };
}

async function queueNotification(args: {
  organizationId: string;
  recipientUserId: string | null | undefined;
  title: string;
  body: string;
  type: "sample_received" | "test_completed" | "qc_failure" | "inventory_alert" | "workflow_update";
  channel?: "email" | "in_app";
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
}) {
  if (!args.recipientUserId || !args.supabase) {
    return;
  }

  await args.supabase.from("notifications").insert({
    organization_id: args.organizationId,
    recipient_user_id: args.recipientUserId,
    title: args.title,
    body: args.body,
    channel: args.channel ?? "in_app",
    notification_type: args.type,
    status: "queued"
  });
}

export async function assignClientSubmission(payload: z.infer<typeof assignmentSchema>) {
  const parsed = assignmentSchema.parse(payload);
  const { authContext, supabase } = await getWorkflowContext(["lab_manager", "admin"]);

  const technicianResult = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("id", parsed.technicianId)
    .maybeSingle();

  if (!technicianResult.data) {
    throw new Error("Technician not found.");
  }

  const [requestResult, laboratoryResult, workflowResult] = await Promise.all([
    supabase
      .from("client_portal_requests")
      .select("id, sample_id, external_client_id, status, payload")
      .eq("id", parsed.requestId)
      .maybeSingle(),
    supabase
      .from("laboratories")
      .select("id, name")
      .eq("name", parsed.laboratoryName)
      .maybeSingle(),
    supabase
      .from("workflow_stages")
      .select("id, name")
      .eq("name", parsed.workflowName)
      .maybeSingle()
  ]);

  if (!requestResult.data) {
    throw new Error("Portal request not found.");
  }

  if (!laboratoryResult.data) {
    throw new Error("Selected laboratory was not found.");
  }

  const requestPayload =
    requestResult.data.payload &&
    typeof requestResult.data.payload === "object" &&
    !Array.isArray(requestResult.data.payload)
      ? (requestResult.data.payload as Record<string, unknown>)
      : {};

  let sampleId = requestResult.data.sample_id ?? null;
  const generatedSampleCode =
    typeof requestPayload.generatedSampleCode === "string" && requestPayload.generatedSampleCode.length > 0
      ? requestPayload.generatedSampleCode
      : `INT-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${randomUUID().slice(0, 6).toUpperCase()}`;

  if (!sampleId) {
    const sampleInsert = await supabase
      .from("samples")
      .insert({
        organization_id: authContext.organizationId,
        laboratory_id: laboratoryResult.data.id,
        workflow_stage_id: workflowResult.data?.id ?? null,
        sample_code: generatedSampleCode,
        material_name:
          typeof requestPayload.materialName === "string" ? requestPayload.materialName : "Client sample",
        batch_number:
          typeof requestPayload.batchNumber === "string" ? requestPayload.batchNumber : generatedSampleCode,
        workflow_name: parsed.workflowName,
        owner_name: technicianResult.data.full_name,
        priority:
          requestPayload.priority === "low" ||
          requestPayload.priority === "medium" ||
          requestPayload.priority === "high" ||
          requestPayload.priority === "critical"
            ? requestPayload.priority
            : "medium",
        status: "in_progress",
        due_at: parsed.dueAt || null,
        external_client_id: requestResult.data.external_client_id,
        metadata: {
          source: "client_portal",
          portal_request_id: parsed.requestId,
          notes: typeof requestPayload.notes === "string" ? requestPayload.notes : null
        }
      })
      .select("id")
      .single();

    if (sampleInsert.error || !sampleInsert.data) {
      throw new Error(sampleInsert.error?.message ?? "Unable to create intake sample.");
    }

    sampleId = sampleInsert.data.id;
  } else {
    const updateSample = await supabase
      .from("samples")
      .update({
        laboratory_id: laboratoryResult.data.id,
        workflow_stage_id: workflowResult.data?.id ?? null,
        workflow_name: parsed.workflowName,
        owner_name: technicianResult.data.full_name,
        status: "in_progress",
        due_at: parsed.dueAt || null
      })
      .eq("id", sampleId);

    if (updateSample.error) {
      throw new Error(updateSample.error.message);
    }
  }

  const [requestUpdate, taskInsert, testInsert] = await Promise.all([
    supabase
      .from("client_portal_requests")
      .update({
        sample_id: sampleId,
        status: "in_review",
        payload: {
          ...requestPayload,
          generatedSampleCode,
          assignedLaboratory: parsed.laboratoryName,
          assignedWorkflow: parsed.workflowName,
          assignedTechnician: technicianResult.data.full_name
        }
      })
      .eq("id", parsed.requestId),
    supabase.from("workflow_tasks").insert({
      organization_id: authContext.organizationId,
      sample_id: sampleId,
      assignee_id: parsed.technicianId,
      title: `Run ${parsed.workflowName} workflow`,
      status: "active",
      validation_state: "pending",
      due_at: parsed.dueAt || null
    }),
    supabase.from("test_definitions").insert({
      organization_id: authContext.organizationId,
      sample_id: sampleId,
      name: `${parsed.workflowName} result entry`,
      test_type: "numeric",
      assignee_id: parsed.technicianId,
      status: "running",
      validation_rule: "Record verified result and route to QA/QC review"
    })
  ]);

  if (requestUpdate.error) {
    throw new Error(requestUpdate.error.message);
  }
  if (taskInsert.error) {
    throw new Error(taskInsert.error.message);
  }
  if (testInsert.error) {
    throw new Error(testInsert.error.message);
  }

  await queueNotification({
    organizationId: authContext.organizationId,
    recipientUserId: parsed.technicianId,
    title: "New sample assignment",
    body: `A new sample has been assigned to your queue for ${parsed.workflowName}.`,
    type: "workflow_update",
    supabase
  });

  await queueNotification({
    organizationId: authContext.organizationId,
    recipientUserId: requestResult.data.external_client_id,
    title: "Sample accepted by the lab",
    body: `Your submission is now in review and has been assigned to the laboratory team.`,
    type: "sample_received",
    supabase
  });

  revalidatePath("/lab/dashboard");
  revalidatePath("/portal");
  revalidatePath("/client/dashboard");
  revalidatePath("/samples");
}

export async function updateInventoryLevels(payload: z.infer<typeof inventorySchema>) {
  const parsed = inventorySchema.parse(payload);
  const { supabase } = await getWorkflowContext(["lab_manager", "admin"]);

  const result = await supabase
    .from("inventory_items")
    .update({
      quantity: parsed.quantity,
      reorder_level: parsed.reorderLevel
    })
    .eq("id", parsed.itemId);

  if (result.error) {
    throw new Error(result.error.message);
  }

  revalidatePath("/inventory");
  revalidatePath("/lab/dashboard");
}

export async function submitTechnicianResult(payload: z.infer<typeof resultEntrySchema>) {
  const parsed = resultEntrySchema.parse(payload);
  const { authContext, supabase, user } = await getWorkflowContext(["scientist_technician"]);

  const definitionResult = await supabase
    .from("test_definitions")
    .select("id, sample_id, name")
    .eq("id", parsed.testDefinitionId)
    .maybeSingle();

  if (!definitionResult.data) {
    throw new Error("Assigned test definition not found.");
  }

  const sampleResult = await supabase
    .from("samples")
    .select("id, sample_code")
    .eq("id", definitionResult.data.sample_id)
    .maybeSingle();

  if (!sampleResult.data) {
    throw new Error("Sample not found for this assignment.");
  }

  const [insertResult] = await Promise.all([
    supabase.from("test_results").insert({
      organization_id: authContext.organizationId,
      sample_id: definitionResult.data.sample_id,
      method_name: parsed.methodName,
      analyst_name: authContext.fullName ?? authContext.email ?? "Technician",
      result_value: parsed.resultValue,
      specification: parsed.specification,
      status: "review",
      completed_at: new Date().toISOString()
    }),
    supabase
      .from("test_definitions")
      .update({ status: "review" })
      .eq("id", parsed.testDefinitionId),
    supabase
      .from("samples")
      .update({
        status: "ready_for_review",
        owner_name: authContext.fullName ?? authContext.email ?? "Technician"
      })
      .eq("id", definitionResult.data.sample_id),
    supabase
      .from("workflow_tasks")
      .update({ status: "done", validation_state: "valid" })
      .eq("sample_id", definitionResult.data.sample_id)
      .eq("assignee_id", user.id)
  ]);

  if (insertResult.error) {
    throw new Error(insertResult.error.message);
  }

  const qaProfile = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "qa_qc_manager")
    .limit(1)
    .maybeSingle();

  await queueNotification({
    organizationId: authContext.organizationId,
    recipientUserId: qaProfile.data?.id,
    title: "Result ready for QA/QC review",
    body: `Sample ${sampleResult.data.sample_code} has a completed result awaiting review.`,
    type: "test_completed",
    supabase
  });

  revalidatePath("/technician/dashboard");
  revalidatePath("/testing");
  revalidatePath("/testing/result-entry");
  revalidatePath("/qc/dashboard");
}

export async function reviewQcResult(payload: z.infer<typeof qcReviewSchema>) {
  const parsed = qcReviewSchema.parse(payload);
  const { authContext, supabase, user } = await getWorkflowContext(["qa_qc_manager"]);

  if (parsed.decision === "reject" && !parsed.reason?.trim()) {
    throw new Error("Add a reason before rejecting a result.");
  }

  const resultResponse = await supabase
    .from("test_results")
    .select("id, sample_id, method_name")
    .eq("id", parsed.resultId)
    .maybeSingle();

  if (!resultResponse.data) {
    throw new Error("Test result not found.");
  }

  const sampleResponse = await supabase
    .from("samples")
    .select("id, sample_code, external_client_id")
    .eq("id", resultResponse.data.sample_id)
    .maybeSingle();

  if (!sampleResponse.data) {
    throw new Error("Sample not found for this result.");
  }

  const approved = parsed.decision === "approve";
  const updateResult = await supabase
    .from("test_results")
    .update({
      status: approved ? "pass" : "fail"
    })
    .eq("id", parsed.resultId);

  if (updateResult.error) {
    throw new Error(updateResult.error.message);
  }

  const sampleUpdate = await supabase
    .from("samples")
    .update({
      status: approved ? "approved" : "rejected",
      owner_name: authContext.fullName ?? authContext.email ?? "QA/QC"
    })
    .eq("id", sampleResponse.data.id);

  if (sampleUpdate.error) {
    throw new Error(sampleUpdate.error.message);
  }

  if (approved) {
    await supabase.from("generated_reports").insert({
      organization_id: authContext.organizationId,
      sample_id: sampleResponse.data.id,
      external_client_id: sampleResponse.data.external_client_id,
      title: `Final report for ${sampleResponse.data.sample_code}`,
      report_type: "sample",
      file_format: "pdf",
      status: "released",
      generated_by: user.id,
      generated_at: new Date().toISOString()
    });
  } else {
    await supabase.from("quality_events").insert({
      organization_id: authContext.organizationId,
      sample_id: sampleResponse.data.id,
      event_type: "deviation",
      title: `Result rejected for ${sampleResponse.data.sample_code}`,
      severity: "major",
      owner_name: authContext.fullName ?? authContext.email ?? "QA/QC",
      status: "open"
    });
  }

  await supabase
    .from("client_portal_requests")
    .update({ status: approved ? "completed" : "in_review" })
    .eq("sample_id", sampleResponse.data.id);

  await queueNotification({
    organizationId: authContext.organizationId,
    recipientUserId: sampleResponse.data.external_client_id,
    title: approved ? "Final report is ready" : "Sample review requires follow-up",
    body: approved
      ? `Your sample ${sampleResponse.data.sample_code} has been approved and the final report is available.`
      : `Your sample ${sampleResponse.data.sample_code} needs follow-up after QA/QC review: ${parsed.reason?.trim()}.`,
    type: approved ? "workflow_update" : "qc_failure",
    supabase
  });

  revalidatePath("/qc/dashboard");
  revalidatePath("/quality");
  revalidatePath("/portal");
  revalidatePath("/client/dashboard");
  revalidatePath("/reports");
}
