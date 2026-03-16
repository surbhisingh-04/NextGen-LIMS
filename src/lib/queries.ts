import {
  complianceReports,
  dashboardMetrics,
  inventoryItems,
  generatedReports,
  notifications,
  portalRequests,
  qualityEvents,
  samples,
  testResults,
  testDefinitions,
  throughputData,
  turnaroundData,
  users,
  workflowStages
} from "@/lib/demo-data";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  ComplianceReport,
  GeneratedReport,
  InventoryItem,
  NotificationItem,
  PortalRequest,
  QualityEvent,
  Sample,
  TestDefinition,
  TestResult,
  UserProfile,
  WorkflowStage
} from "@/lib/types";

function mapSampleRow(row: {
  id: string;
  sample_code: string;
  material_name: string;
  batch_number: string;
  status: Sample["status"];
  priority: Sample["priority"];
  received_at: string;
  due_at?: string | null;
  owner_name?: string | null;
  workflow_name: string;
}) {
  return {
    id: row.id,
    sampleCode: row.sample_code,
    materialName: row.material_name,
    batchNumber: row.batch_number,
    status: row.status,
    priority: row.priority,
    receivedAt: row.received_at,
    dueAt: row.due_at ?? row.received_at,
    owner: row.owner_name ?? "Unassigned",
    workflow: row.workflow_name,
    lab: "Connected lab"
  } satisfies Sample;
}

function fallbackData() {
  return {
    metrics: dashboardMetrics,
    throughputData,
    turnaroundData,
    samples,
    workflowStages,
    testResults,
    inventoryItems,
    qualityEvents,
    complianceReports
  };
}

export async function getDashboardData() {
  if (!hasSupabaseEnv) {
    return fallbackData();
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return fallbackData();
  }

  const [
    sampleResponse,
    workflowResponse,
    testResponse,
    inventoryResponse,
    qualityResponse,
    complianceResponse
  ] = await Promise.all([
    supabase.from("samples").select("*").order("received_at", { ascending: false }).limit(8),
    supabase.from("workflow_stages").select("*").order("sort_order"),
    supabase.from("test_results").select("*").order("completed_at", { ascending: false }).limit(8),
    supabase.from("inventory_items").select("*").order("quantity", { ascending: true }).limit(8),
    supabase.from("quality_events").select("*").order("due_at", { ascending: true }).limit(8),
    supabase.from("compliance_reports").select("*").order("generated_at", { ascending: false }).limit(8)
  ]);

  const mappedSamples: Sample[] = (sampleResponse.data ?? []).map(mapSampleRow);

  const mappedWorkflows: WorkflowStage[] = (workflowResponse.data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slaHours: row.sla_hours,
    activeSamples: row.active_samples,
    automationCoverage: row.automation_coverage
  }));

  const mappedResults: TestResult[] = (testResponse.data ?? []).map((row) => ({
    id: row.id,
    sampleCode: row.sample_id,
    method: row.method_name,
    analyst: row.analyst_name ?? "Unassigned",
    result: row.result_value,
    specification: row.specification,
    status: row.status,
    completedAt: row.completed_at ?? row.created_at
  }));

  const mappedInventory: InventoryItem[] = (inventoryResponse.data ?? []).map((row) => ({
    id: row.id,
    sku: row.sku,
    name: row.name,
    category: row.category,
    lotNumber: row.lot_number ?? "-",
    quantity: Number(row.quantity),
    reorderLevel: Number(row.reorder_level),
    location: row.location ?? "Not assigned",
    expiresAt: row.expires_at ?? "-"
  }));

  const mappedQuality: QualityEvent[] = (qualityResponse.data ?? []).map((row) => ({
    id: row.id,
    type: row.event_type,
    title: row.title,
    severity: row.severity,
    owner: row.owner_name ?? "Unassigned",
    status: row.status,
    dueAt: row.due_at ?? "-"
  }));

  const mappedCompliance: ComplianceReport[] = (complianceResponse.data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    framework: row.framework,
    generatedAt: row.generated_at,
    status: row.status,
    score: row.score
  }));

  return {
    metrics: dashboardMetrics,
    throughputData,
    turnaroundData,
    samples: mappedSamples.length > 0 ? mappedSamples : samples,
    workflowStages: mappedWorkflows.length > 0 ? mappedWorkflows : workflowStages,
    testResults: mappedResults.length > 0 ? mappedResults : testResults,
    inventoryItems: mappedInventory.length > 0 ? mappedInventory : inventoryItems,
    qualityEvents: mappedQuality.length > 0 ? mappedQuality : qualityEvents,
    complianceReports: mappedCompliance.length > 0 ? mappedCompliance : complianceReports
  };
}

export async function getClientSamples() {
  if (!hasSupabaseEnv) {
    return samples.slice(0, 8);
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return samples.slice(0, 8);
  }

  const response = await supabase
    .from("samples")
    .select("*")
    .order("received_at", { ascending: false })
    .limit(8);

  if (!response.data || response.error) {
    return samples.slice(0, 8);
  }

  return response.data.map<Sample>(mapSampleRow);
}

export async function getClientPortalRequests() {
  if (!hasSupabaseEnv) {
    return portalRequests.slice(0, 8);
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return portalRequests.slice(0, 8);
  }

  const response = await supabase
    .from("client_portal_requests")
    .select("id, request_type, status, requested_at, payload")
    .order("requested_at", { ascending: false })
    .limit(8);

  if (!response.data || response.error) {
    return portalRequests.slice(0, 8);
  }

  return response.data.map<PortalRequest>((row) => {
    const payload =
      row.payload && typeof row.payload === "object" && !Array.isArray(row.payload)
        ? (row.payload as Record<string, unknown>)
        : {};

    return {
      id: row.id,
      clientName:
        typeof payload.submittedBy === "string" && payload.submittedBy.length > 0
          ? payload.submittedBy
          : "Client portal user",
      sampleCode:
        typeof payload.generatedSampleCode === "string" && payload.generatedSampleCode.length > 0
          ? payload.generatedSampleCode
          : typeof payload.batchNumber === "string" && payload.batchNumber.length > 0
            ? payload.batchNumber
            : "Pending assignment",
      requestType: row.request_type,
      status: row.status,
      requestedAt: row.requested_at
    };
  });
}

export async function getClientReports() {
  if (!hasSupabaseEnv) {
    return generatedReports.filter((report) => report.audience === "Client portal");
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return generatedReports.filter((report) => report.audience === "Client portal");
  }

  const response = await supabase
    .from("generated_reports")
    .select("id, title, report_type, file_format, generated_at, status, external_client_id")
    .order("generated_at", { ascending: false })
    .limit(8);

  if (!response.data || response.error) {
    return generatedReports.filter((report) => report.audience === "Client portal");
  }

  return response.data.map<GeneratedReport>((row) => ({
    id: row.id,
    title: row.title,
    type: row.report_type,
    format: row.file_format,
    generatedAt: row.generated_at,
    status: row.status,
    audience: row.external_client_id ? "Client portal" : "Internal"
  }));
}

export async function getUserNotifications() {
  if (!hasSupabaseEnv) {
    return notifications.slice(0, 8);
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return notifications.slice(0, 8);
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return notifications.slice(0, 8);
  }

  const response = await supabase
    .from("notifications")
    .select("id, title, body, channel, notification_type, status, created_at, sent_at, recipient_user_id")
    .eq("recipient_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(8);

  if (!response.data || response.error) {
    return notifications.slice(0, 8);
  }

  return response.data.map<NotificationItem>((row) => ({
    id: row.id,
    title: row.title,
    channel: row.channel,
    type: row.notification_type,
    recipient: "You",
    sentAt: row.sent_at ?? row.created_at,
    status: row.status
  }));
}

export async function getManagerSubmissionQueue() {
  if (!hasSupabaseEnv) {
    return portalRequests
      .filter((request) => request.requestType === "submission")
      .slice(0, 6)
      .map((request) => ({
        id: request.id,
        clientName: request.clientName,
        sampleCode: request.sampleCode,
        batchNumber: request.sampleCode,
        priority: "medium" as const,
        notes: "Demo portal submission awaiting intake.",
        status: request.status,
        requestedAt: request.requestedAt
      }));
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const response = await supabase
    .from("client_portal_requests")
    .select("id, sample_id, status, requested_at, payload")
    .eq("request_type", "submission")
    .order("requested_at", { ascending: false })
    .limit(8);

  if (!response.data || response.error) {
    return [];
  }

  return response.data.map<{
    id: string;
    sampleId: string | null;
    clientName: string;
    sampleCode: string;
    batchNumber: string;
    priority: "low" | "medium" | "high" | "critical";
    notes: string;
    status: "submitted" | "in_review" | "completed";
    requestedAt: string;
  }>((row) => {
    const payload =
      row.payload && typeof row.payload === "object" && !Array.isArray(row.payload)
        ? (row.payload as Record<string, unknown>)
        : {};

    return {
      id: row.id,
      sampleId: row.sample_id ?? null,
      clientName:
        typeof payload.submittedBy === "string" && payload.submittedBy.length > 0
          ? payload.submittedBy
          : "Client portal user",
      sampleCode:
        typeof payload.generatedSampleCode === "string" && payload.generatedSampleCode.length > 0
          ? payload.generatedSampleCode
          : "Pending assignment",
      batchNumber: typeof payload.batchNumber === "string" ? payload.batchNumber : "-",
      priority: (
        payload.priority === "low" ||
        payload.priority === "medium" ||
        payload.priority === "high" ||
        payload.priority === "critical"
          ? payload.priority
          : "medium"
      ) as "low" | "medium" | "high" | "critical",
      notes: typeof payload.notes === "string" ? payload.notes : "",
      status: row.status as "submitted" | "in_review" | "completed",
      requestedAt: row.requested_at
    };
  });
}

export async function getTechnicianProfiles() {
  if (!hasSupabaseEnv) {
    return users.filter((user) => user.role === "scientist_technician");
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const response = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .order("full_name");

  if (!response.data || response.error) {
    return users.filter((user) => user.role === "scientist_technician");
  }

  return response.data
    .filter((row) => row.role === "scientist_technician")
    .map<UserProfile>((row) => ({
      id: row.id,
      fullName: row.full_name,
      email: "",
      role: "scientist_technician",
      status: "active",
      authMethods: ["password"],
      lastActiveAt: new Date().toISOString()
    }));
}

export async function getLabCatalog() {
  if (!hasSupabaseEnv) {
    return {
      laboratories: ["Chemistry Lab", "Microbiology Lab", "Stability Lab"],
      workflows: workflowStages.map((stage) => stage.name)
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      laboratories: [],
      workflows: []
    };
  }

  const [labsResponse, workflowsResponse] = await Promise.all([
    supabase.from("laboratories").select("name").order("name"),
    supabase.from("workflow_stages").select("name").order("sort_order")
  ]);

  return {
    laboratories:
      labsResponse.data?.map((row) => row.name) ?? ["Chemistry Lab", "Microbiology Lab", "Stability Lab"],
    workflows: workflowsResponse.data?.map((row) => row.name) ?? workflowStages.map((stage) => stage.name)
  };
}

export async function getTechnicianAssignments() {
  if (!hasSupabaseEnv) {
    return testDefinitions.slice(0, 6);
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return testDefinitions.slice(0, 6);
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return testDefinitions.slice(0, 6);
  }

  const response = await supabase
    .from("test_definitions")
    .select("id, sample_id, name, test_type, status, validation_rule")
    .eq("assignee_id", user.id)
    .order("created_at", { ascending: false })
    .limit(8);

  if (!response.data || response.error) {
    return testDefinitions.slice(0, 6);
  }

  const sampleIds = response.data.map((row) => row.sample_id);
  const sampleResponse = await supabase
    .from("samples")
    .select("id, sample_code")
    .in("id", sampleIds);

  const sampleMap = new Map((sampleResponse.data ?? []).map((row) => [row.id, row.sample_code]));

  return response.data.map<TestDefinition>((row) => ({
    id: row.id,
    sampleCode: sampleMap.get(row.sample_id) ?? row.sample_id,
    testName: row.name,
    type: row.test_type,
    assignee: "Assigned to you",
    status: row.status,
    validationRule: row.validation_rule ?? "Follow approved method"
  }));
}

export async function getTechnicianAssignedSamples() {
  if (!hasSupabaseEnv) {
    return samples.filter((sample) => sample.owner === "A. Patel" || sample.owner === "M. Lewis");
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return samples.filter((sample) => sample.owner === "A. Patel" || sample.owner === "M. Lewis");
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return samples.filter((sample) => sample.owner === "A. Patel" || sample.owner === "M. Lewis");
  }

  const definitionResponse = await supabase
    .from("test_definitions")
    .select("sample_id")
    .eq("assignee_id", user.id)
    .order("created_at", { ascending: false })
    .limit(8);

  const sampleIds = [...new Set((definitionResponse.data ?? []).map((row) => row.sample_id))];

  if (sampleIds.length === 0) {
    return [];
  }

  const sampleResponse = await supabase
    .from("samples")
    .select("*")
    .in("id", sampleIds)
    .order("received_at", { ascending: false });

  if (!sampleResponse.data || sampleResponse.error) {
    return [];
  }

  return sampleResponse.data.map<Sample>(mapSampleRow);
}

export async function getQcReviewResults() {
  if (!hasSupabaseEnv) {
    return testResults.filter((result) => result.status === "review").slice(0, 6);
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return testResults.filter((result) => result.status === "review").slice(0, 6);
  }

  const response = await supabase
    .from("test_results")
    .select("id, sample_id, method_name, analyst_name, result_value, specification, status, completed_at, created_at")
    .eq("status", "review")
    .order("created_at", { ascending: false })
    .limit(8);

  if (!response.data || response.error) {
    return testResults.filter((result) => result.status === "review").slice(0, 6);
  }

  const sampleIds = response.data.map((row) => row.sample_id);
  const sampleResponse = await supabase
    .from("samples")
    .select("id, sample_code")
    .in("id", sampleIds);

  const sampleMap = new Map((sampleResponse.data ?? []).map((row) => [row.id, row.sample_code]));

  return response.data.map<TestResult>((row) => ({
    id: row.id,
    sampleCode: sampleMap.get(row.sample_id) ?? row.sample_id,
    method: row.method_name,
    analyst: row.analyst_name ?? "Technician",
    result: row.result_value,
    specification: row.specification,
    status: row.status,
    completedAt: row.completed_at ?? row.created_at
  }));
}
