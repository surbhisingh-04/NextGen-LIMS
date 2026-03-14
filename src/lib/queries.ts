import {
  complianceReports,
  dashboardMetrics,
  inventoryItems,
  qualityEvents,
  samples,
  testResults,
  throughputData,
  turnaroundData,
  workflowStages
} from "@/lib/demo-data";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  ComplianceReport,
  InventoryItem,
  QualityEvent,
  Sample,
  TestResult,
  WorkflowStage
} from "@/lib/types";

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

  const mappedSamples: Sample[] = (sampleResponse.data ?? []).map((row) => ({
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
  }));

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
