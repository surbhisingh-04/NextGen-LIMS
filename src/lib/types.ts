export type SampleStatus =
  | "registered"
  | "in_progress"
  | "ready_for_review"
  | "approved"
  | "rejected";

export type Priority = "low" | "medium" | "high" | "critical";

export type UserRole =
  | "admin"
  | "lab_manager"
  | "scientist_technician"
  | "qa_qc_manager"
  | "client";

export interface Sample {
  id: string;
  sampleCode: string;
  materialName: string;
  batchNumber: string;
  status: SampleStatus;
  priority: Priority;
  receivedAt: string;
  dueAt: string;
  owner: string;
  workflow: string;
  lab: string;
}

export interface WorkflowStage {
  id: string;
  name: string;
  slaHours: number;
  activeSamples: number;
  automationCoverage: number;
}

export interface TestResult {
  id: string;
  sampleCode: string;
  method: string;
  analyst: string;
  result: string;
  specification: string;
  status: "pass" | "fail" | "review";
  completedAt: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  lotNumber: string;
  quantity: number;
  reorderLevel: number;
  location: string;
  expiresAt: string;
}

export interface QualityEvent {
  id: string;
  type: string;
  title: string;
  severity: "minor" | "major" | "critical";
  owner: string;
  status: "open" | "investigating" | "closed";
  dueAt: string;
}

export interface ComplianceReport {
  id: string;
  title: string;
  framework: string;
  generatedAt: string;
  status: "draft" | "published";
  score: number;
}

export interface DashboardMetric {
  label: string;
  value: string;
  trend: string;
  detail: string;
}

export interface ThroughputPoint {
  day: string;
  samples: number;
  approvals: number;
}

export interface TurnaroundPoint {
  stage: string;
  hours: number;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: "active" | "invited" | "suspended";
  authMethods: string[];
  lastActiveAt: string;
}

export interface ActivityLog {
  id: string;
  actor: string;
  action: string;
  entity: string;
  occurredAt: string;
  channel: string;
}

export interface SampleLifecycleEvent {
  id: string;
  sampleCode: string;
  stage:
    | "submission"
    | "registration"
    | "testing"
    | "result_entry"
    | "validation"
    | "reporting"
    | "archive_disposal";
  owner: string;
  timestamp: string;
  notes: string;
}

export interface CustodyEvent {
  id: string;
  sampleCode: string;
  from: string;
  to: string;
  handoffAt: string;
  condition: string;
}

export interface WorkflowTask {
  id: string;
  workflow: string;
  step: string;
  assignee: string;
  dueAt: string;
  status: "queued" | "active" | "blocked" | "done";
  validationState: "pending" | "valid" | "error";
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  status: "active" | "draft";
}

export interface TestDefinition {
  id: string;
  sampleCode: string;
  testName: string;
  type: "numeric" | "attachment" | "instrument_import";
  assignee: string;
  status: "pending" | "running" | "review" | "approved";
  validationRule: string;
}

export interface InstrumentImport {
  id: string;
  instrumentName: string;
  method: string;
  sourceType: "csv" | "api";
  uploadedAt: string;
  mappedSamples: number;
  status: "parsed" | "needs_review" | "completed";
}

export interface QcChartPoint {
  period: string;
  value: number;
  lowerLimit: number;
  upperLimit: number;
  mean: number;
}

export interface QcSample {
  id: string;
  controlName: string;
  sampleCode: string;
  result: string;
  status: "in_control" | "warning" | "out_of_spec";
  reviewedBy: string;
}

export interface GeneratedReport {
  id: string;
  title: string;
  type: "coa" | "batch" | "qc" | "sample";
  format: "pdf" | "csv";
  generatedAt: string;
  status: "draft" | "released" | "rejected";
  audience: string;
}

export interface ReportActivity {
  id: string;
  action: string;
  actor: string;
  detail?: string | null;
  occurredAt: string;
}

export interface DocumentRecord {
  id: string;
  name: string;
  category: "sop" | "test_method" | "certificate" | "lab_document";
  version: string;
  owner: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  channel: "email" | "in_app";
  type:
    | "sample_received"
    | "test_completed"
    | "qc_failure"
    | "inventory_alert"
    | "workflow_update";
  recipient: string;
  sentAt: string;
  status: "queued" | "sent" | "failed";
}

export interface NotebookEntry {
  id: string;
  sampleCode: string;
  experimentTitle: string;
  author: string;
  version: string;
  status: "draft" | "review" | "approved";
  recordedAt: string;
}

export interface BatchRecord {
  id: string;
  batchNumber: string;
  productName: string;
  sampleCount: number;
  genealogy: string;
  releaseStatus: "sampling" | "testing" | "review" | "released" | "on_hold";
  dispositionDueAt: string;
}

export interface ScheduleItem {
  id: string;
  resourceType: "instrument" | "analyst" | "lab" | "study";
  resourceName: string;
  scheduledFor: string;
  window: string;
  owner: string;
  status: "planned" | "active" | "conflict" | "completed";
}

export interface EnvironmentalReading {
  id: string;
  location: string;
  parameter: "temperature" | "humidity" | "particles" | "microbial";
  value: string;
  threshold: string;
  status: "normal" | "warning" | "action";
  capturedAt: string;
}

export interface TestMethodRecord {
  id: string;
  methodCode: string;
  name: string;
  technique: string;
  version: string;
  owner: string;
  status: "draft" | "approved" | "retired";
}

export interface PortalRequest {
  id: string;
  clientName: string;
  sampleCode: string;
  requestType: "submission" | "result_review" | "report_download" | "status_check";
  status: "submitted" | "in_review" | "completed";
  requestedAt: string;
}

export interface StabilityStudy {
  id: string;
  protocolCode: string;
  productName: string;
  storageCondition: string;
  intervalLabel: string;
  nextPullAt: string;
  status: "scheduled" | "active" | "review" | "completed";
}

export interface BillingRecord {
  id: string;
  clientName: string;
  invoiceNumber: string;
  amount: string;
  utilization: string;
  status: "draft" | "issued" | "paid" | "overdue";
  billedAt: string;
}

export interface DataExchangeJob {
  id: string;
  jobName: string;
  direction: "import" | "export";
  format: "csv" | "json" | "api" | "pdf";
  scope: string;
  status: "queued" | "running" | "completed" | "failed";
  processedAt: string;
}

export interface BackupSnapshot {
  id: string;
  environment: string;
  region: string;
  lastBackupAt: string;
  recoveryObjective: string;
  status: "healthy" | "warning" | "recovering";
}

export interface PredictiveForecast {
  id: string;
  metric: string;
  current: string;
  forecast: string;
  confidence: string;
  horizon: string;
  recommendedAction: string;
}

export interface ForecastPoint {
  period: string;
  demand: number;
  capacity: number;
  turnaround: number;
}

export interface KnowledgeGraphRelation {
  id: string;
  source: string;
  relationship: string;
  target: string;
  context: string;
}
