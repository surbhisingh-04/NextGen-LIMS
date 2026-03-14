import type {
  ActivityLog,
  AutomationRule,
  BackupSnapshot,
  BatchRecord,
  BillingRecord,
  ComplianceReport,
  DashboardMetric,
  CustodyEvent,
  DataExchangeJob,
  DocumentRecord,
  EnvironmentalReading,
  ForecastPoint,
  GeneratedReport,
  InventoryItem,
  InstrumentImport,
  KnowledgeGraphRelation,
  NotebookEntry,
  NotificationItem,
  PortalRequest,
  PredictiveForecast,
  QcChartPoint,
  QcSample,
  QualityEvent,
  Sample,
  SampleLifecycleEvent,
  ScheduleItem,
  StabilityStudy,
  TestResult,
  TestDefinition,
  TestMethodRecord,
  ThroughputPoint,
  TurnaroundPoint,
  UserProfile,
  WorkflowTask,
  WorkflowStage
} from "@/lib/types";

export const dashboardMetrics: DashboardMetric[] = [
  {
    label: "Samples in Flight",
    value: "1,284",
    trend: "+12.4%",
    detail: "Across analytical, microbiology, and stability labs"
  },
  {
    label: "On-Time Release",
    value: "97.8%",
    trend: "+2.1%",
    detail: "Compared with the previous 30-day period"
  },
  {
    label: "Inventory Risk",
    value: "18 items",
    trend: "-9.0%",
    detail: "Reagents or standards below reorder threshold"
  },
  {
    label: "Open Deviations",
    value: "6",
    trend: "-3",
    detail: "CAPA-backed investigations still active"
  }
];

export const throughputData: ThroughputPoint[] = [
  { day: "Mon", samples: 148, approvals: 126 },
  { day: "Tue", samples: 172, approvals: 141 },
  { day: "Wed", samples: 165, approvals: 148 },
  { day: "Thu", samples: 184, approvals: 156 },
  { day: "Fri", samples: 196, approvals: 168 },
  { day: "Sat", samples: 112, approvals: 94 },
  { day: "Sun", samples: 87, approvals: 81 }
];

export const turnaroundData: TurnaroundPoint[] = [
  { stage: "Receipt", hours: 3.2 },
  { stage: "Prep", hours: 8.6 },
  { stage: "Analysis", hours: 14.1 },
  { stage: "Review", hours: 6.4 },
  { stage: "Release", hours: 2.3 }
];

export const samples: Sample[] = [
  {
    id: "smp-001",
    sampleCode: "RM-24-00451",
    materialName: "API Blend Alpha",
    batchNumber: "BCH-11872",
    status: "in_progress",
    priority: "critical",
    receivedAt: "2026-03-12T09:10:00Z",
    dueAt: "2026-03-15T12:00:00Z",
    owner: "A. Patel",
    workflow: "Raw Material Release",
    lab: "Chemistry Lab"
  },
  {
    id: "smp-002",
    sampleCode: "FG-24-00913",
    materialName: "Sterile Vial Fill",
    batchNumber: "LOT-55019",
    status: "ready_for_review",
    priority: "high",
    receivedAt: "2026-03-11T11:00:00Z",
    dueAt: "2026-03-14T18:00:00Z",
    owner: "M. Lewis",
    workflow: "Finished Product Release",
    lab: "Microbiology Lab"
  },
  {
    id: "smp-003",
    sampleCode: "STB-24-00088",
    materialName: "Stability 6M Pull",
    batchNumber: "ST-30091",
    status: "registered",
    priority: "medium",
    receivedAt: "2026-03-14T07:30:00Z",
    dueAt: "2026-03-19T16:00:00Z",
    owner: "R. Shah",
    workflow: "Stability Study",
    lab: "Stability Lab"
  },
  {
    id: "smp-004",
    sampleCode: "EM-24-00142",
    materialName: "Grade C Air Plate",
    batchNumber: "ENV-1928",
    status: "approved",
    priority: "low",
    receivedAt: "2026-03-10T08:15:00Z",
    dueAt: "2026-03-13T15:00:00Z",
    owner: "N. Scott",
    workflow: "Environmental Monitoring",
    lab: "QC Micro Lab"
  }
];

export const workflowStages: WorkflowStage[] = [
  { id: "wf-1", name: "Sample Login", slaHours: 4, activeSamples: 96, automationCoverage: 88 },
  { id: "wf-2", name: "Preparation", slaHours: 12, activeSamples: 214, automationCoverage: 61 },
  { id: "wf-3", name: "Instrument Analysis", slaHours: 18, activeSamples: 398, automationCoverage: 74 },
  { id: "wf-4", name: "Quality Review", slaHours: 8, activeSamples: 127, automationCoverage: 52 },
  { id: "wf-5", name: "Batch Disposition", slaHours: 6, activeSamples: 44, automationCoverage: 90 }
];

export const testResults: TestResult[] = [
  {
    id: "tr-1",
    sampleCode: "RM-24-00451",
    method: "HPLC Assay",
    analyst: "A. Patel",
    result: "99.2%",
    specification: "98.0% - 102.0%",
    status: "pass",
    completedAt: "2026-03-13T10:40:00Z"
  },
  {
    id: "tr-2",
    sampleCode: "FG-24-00913",
    method: "Bioburden",
    analyst: "M. Lewis",
    result: "Review triggered",
    specification: "< 10 CFU",
    status: "review",
    completedAt: "2026-03-13T18:20:00Z"
  },
  {
    id: "tr-3",
    sampleCode: "EM-24-00142",
    method: "Surface Contact Plate",
    analyst: "N. Scott",
    result: "1 CFU",
    specification: "<= 3 CFU",
    status: "pass",
    completedAt: "2026-03-12T13:05:00Z"
  }
];

export const inventoryItems: InventoryItem[] = [
  {
    id: "inv-1",
    sku: "STD-0004",
    name: "USP Caffeine Standard",
    category: "Reference Standard",
    lotNumber: "RS-4410",
    quantity: 2,
    reorderLevel: 5,
    location: "Freezer A / Shelf 2",
    expiresAt: "2026-06-30"
  },
  {
    id: "inv-2",
    sku: "REG-1042",
    name: "Acetonitrile LC-MS",
    category: "Solvent",
    lotNumber: "SOL-5502",
    quantity: 18,
    reorderLevel: 8,
    location: "Flammables Store",
    expiresAt: "2027-01-15"
  },
  {
    id: "inv-3",
    sku: "MIC-0119",
    name: "Tryptic Soy Agar Plates",
    category: "Media",
    lotNumber: "MED-7801",
    quantity: 6,
    reorderLevel: 10,
    location: "Cold Room 1",
    expiresAt: "2026-04-21"
  }
];

export const qualityEvents: QualityEvent[] = [
  {
    id: "qe-1",
    type: "Deviation",
    title: "Unexpected retention time shift on HPLC-04",
    severity: "major",
    owner: "J. Romero",
    status: "investigating",
    dueAt: "2026-03-18"
  },
  {
    id: "qe-2",
    type: "CAPA",
    title: "Requalification of incubator alarms",
    severity: "minor",
    owner: "P. Nair",
    status: "open",
    dueAt: "2026-03-21"
  },
  {
    id: "qe-3",
    type: "OOS",
    title: "Bioburden result pending phase II review",
    severity: "critical",
    owner: "M. Lewis",
    status: "open",
    dueAt: "2026-03-15"
  }
];

export const complianceReports: ComplianceReport[] = [
  {
    id: "cr-1",
    title: "ALCOA+ Data Integrity Review",
    framework: "21 CFR Part 11",
    generatedAt: "2026-03-13T16:00:00Z",
    status: "published",
    score: 98
  },
  {
    id: "cr-2",
    title: "QC Release Audit Pack",
    framework: "GxP / Annex 11",
    generatedAt: "2026-03-12T12:30:00Z",
    status: "published",
    score: 95
  },
  {
    id: "cr-3",
    title: "Temperature Excursion Trending",
    framework: "ISO 17025",
    generatedAt: "2026-03-14T09:00:00Z",
    status: "draft",
    score: 91
  }
];

export const users: UserProfile[] = [
  {
    id: "usr-1",
    fullName: "Priya Nair",
    email: "priya.nair@nextgenlims.lab",
    role: "admin",
    status: "active",
    authMethods: ["password"],
    lastActiveAt: "2026-03-14T09:32:00Z"
  },
  {
    id: "usr-2",
    fullName: "Marcus Lewis",
    email: "marcus.lewis@nextgenlims.lab",
    role: "lab_manager",
    status: "active",
    authMethods: ["password"],
    lastActiveAt: "2026-03-14T08:50:00Z"
  },
  {
    id: "usr-3",
    fullName: "Asha Patel",
    email: "asha.patel@nextgenlims.lab",
    role: "scientist_technician",
    status: "active",
    authMethods: ["password"],
    lastActiveAt: "2026-03-14T09:10:00Z"
  },
  {
    id: "usr-4",
    fullName: "Jordan Romero",
    email: "jordan.romero@nextgenlims.lab",
    role: "qa_qc_manager",
    status: "active",
    authMethods: ["password"],
    lastActiveAt: "2026-03-14T07:42:00Z"
  },
  {
    id: "usr-5",
    fullName: "Acme Pharma QA",
    email: "qa@acmepharma.com",
    role: "client",
    status: "invited",
    authMethods: ["password"],
    lastActiveAt: "2026-03-13T16:22:00Z"
  }
];

export const activityLogs: ActivityLog[] = [
  {
    id: "act-1",
    actor: "Priya Nair",
    action: "Enforced email and password authentication for all portal users",
    entity: "Auth Policy",
    occurredAt: "2026-03-14T09:00:00Z",
    channel: "admin_console"
  },
  {
    id: "act-2",
    actor: "Marcus Lewis",
    action: "Assigned sterility panel to Microbiology Lab queue",
    entity: "Workflow Task",
    occurredAt: "2026-03-14T08:18:00Z",
    channel: "workflow_engine"
  },
  {
    id: "act-3",
    actor: "Jordan Romero",
    action: "Approved Phase I review for bioburden result",
    entity: "Test Result",
    occurredAt: "2026-03-13T19:02:00Z",
    channel: "qa_review"
  }
];

export const sampleLifecycleEvents: SampleLifecycleEvent[] = [
  {
    id: "sle-1",
    sampleCode: "RM-24-00451",
    stage: "submission",
    owner: "Supplier Portal",
    timestamp: "2026-03-12T08:40:00Z",
    notes: "Submitted with CoA, supplier lot, and expected release timeline."
  },
  {
    id: "sle-2",
    sampleCode: "RM-24-00451",
    stage: "registration",
    owner: "Asha Patel",
    timestamp: "2026-03-12T09:10:00Z",
    notes: "Barcode generated and chemistry intake checklist completed."
  },
  {
    id: "sle-3",
    sampleCode: "RM-24-00451",
    stage: "testing",
    owner: "Asha Patel",
    timestamp: "2026-03-13T08:20:00Z",
    notes: "HPLC assay and identity panel started."
  },
  {
    id: "sle-4",
    sampleCode: "RM-24-00451",
    stage: "validation",
    owner: "Jordan Romero",
    timestamp: "2026-03-13T12:10:00Z",
    notes: "Primary result verified against specification set RM-A-11."
  }
];

export const custodyEvents: CustodyEvent[] = [
  {
    id: "ce-1",
    sampleCode: "RM-24-00451",
    from: "Receiving Dock",
    to: "Chemistry Lab",
    handoffAt: "2026-03-12T09:05:00Z",
    condition: "Sealed, ambient"
  },
  {
    id: "ce-2",
    sampleCode: "FG-24-00913",
    from: "Microbiology Prep",
    to: "QC Review",
    handoffAt: "2026-03-13T18:25:00Z",
    condition: "Incubation complete"
  },
  {
    id: "ce-3",
    sampleCode: "STB-24-00088",
    from: "Stability Chamber 3",
    to: "Stability Lab",
    handoffAt: "2026-03-14T07:15:00Z",
    condition: "2-8C transfer"
  }
];

export const workflowTasks: WorkflowTask[] = [
  {
    id: "wt-1",
    workflow: "Finished Product Release",
    step: "Sample Assigned",
    assignee: "M. Lewis",
    dueAt: "2026-03-14T12:00:00Z",
    status: "active",
    validationState: "valid"
  },
  {
    id: "wt-2",
    workflow: "Raw Material Release",
    step: "Result Entry",
    assignee: "A. Patel",
    dueAt: "2026-03-14T14:30:00Z",
    status: "active",
    validationState: "pending"
  },
  {
    id: "wt-3",
    workflow: "Sterility Panel",
    step: "QC Review",
    assignee: "J. Romero",
    dueAt: "2026-03-15T10:00:00Z",
    status: "queued",
    validationState: "pending"
  }
];

export const automationRules: AutomationRule[] = [
  {
    id: "ar-1",
    name: "Auto-assign sterility samples to micro lead",
    trigger: "Sample Received + workflow = Sterility",
    action: "Assign task to Microbiology Lab Manager",
    status: "active"
  },
  {
    id: "ar-2",
    name: "Escalate overdue review",
    trigger: "Result Entry pending > 8h",
    action: "Notify QA/QC manager and create review task",
    status: "active"
  },
  {
    id: "ar-3",
    name: "Archive completed stability report",
    trigger: "Report released",
    action: "Move report package to storage and notify client",
    status: "draft"
  }
];

export const testDefinitions: TestDefinition[] = [
  {
    id: "td-1",
    sampleCode: "RM-24-00451",
    testName: "Assay by HPLC",
    type: "numeric",
    assignee: "A. Patel",
    status: "running",
    validationRule: "Must be between 98.0 and 102.0%"
  },
  {
    id: "td-2",
    sampleCode: "FG-24-00913",
    testName: "Bioburden Worksheet",
    type: "attachment",
    assignee: "M. Lewis",
    status: "review",
    validationRule: "Attachment required before QC review"
  },
  {
    id: "td-3",
    sampleCode: "EM-24-00142",
    testName: "Colony Counter Import",
    type: "instrument_import",
    assignee: "N. Scott",
    status: "approved",
    validationRule: "Imported count must map to approved template"
  }
];

export const instrumentImports: InstrumentImport[] = [
  {
    id: "ii-1",
    instrumentName: "Waters HPLC-04",
    method: "Assay API Blend Alpha",
    sourceType: "csv",
    uploadedAt: "2026-03-13T10:22:00Z",
    mappedSamples: 4,
    status: "completed"
  },
  {
    id: "ii-2",
    instrumentName: "Plate Reader BioTek",
    method: "Bioburden Screening",
    sourceType: "api",
    uploadedAt: "2026-03-13T17:58:00Z",
    mappedSamples: 2,
    status: "needs_review"
  },
  {
    id: "ii-3",
    instrumentName: "Colony Counter CC-12",
    method: "EM Surface Plates",
    sourceType: "csv",
    uploadedAt: "2026-03-12T12:50:00Z",
    mappedSamples: 9,
    status: "parsed"
  }
];

export const qcSamples: QcSample[] = [
  {
    id: "qc-1",
    controlName: "Bioburden Positive Control",
    sampleCode: "QC-24-00102",
    result: "9 CFU",
    status: "warning",
    reviewedBy: "J. Romero"
  },
  {
    id: "qc-2",
    controlName: "Assay System Suitability",
    sampleCode: "QC-24-00109",
    result: "Pass",
    status: "in_control",
    reviewedBy: "P. Nair"
  },
  {
    id: "qc-3",
    controlName: "Endotoxin Control",
    sampleCode: "QC-24-00111",
    result: "OOS",
    status: "out_of_spec",
    reviewedBy: "J. Romero"
  }
];

export const qcChartData: QcChartPoint[] = [
  { period: "W1", value: 98.9, lowerLimit: 97.5, upperLimit: 101.0, mean: 99.3 },
  { period: "W2", value: 99.1, lowerLimit: 97.5, upperLimit: 101.0, mean: 99.3 },
  { period: "W3", value: 99.7, lowerLimit: 97.5, upperLimit: 101.0, mean: 99.3 },
  { period: "W4", value: 100.6, lowerLimit: 97.5, upperLimit: 101.0, mean: 99.3 },
  { period: "W5", value: 98.4, lowerLimit: 97.5, upperLimit: 101.0, mean: 99.3 },
  { period: "W6", value: 101.3, lowerLimit: 97.5, upperLimit: 101.0, mean: 99.3 }
];

export const generatedReports: GeneratedReport[] = [
  {
    id: "gr-1",
    title: "Certificate of Analysis - API Blend Alpha",
    type: "coa",
    format: "pdf",
    generatedAt: "2026-03-14T08:30:00Z",
    status: "released",
    audience: "Client portal"
  },
  {
    id: "gr-2",
    title: "March QC Trend Report",
    type: "qc",
    format: "csv",
    generatedAt: "2026-03-13T16:20:00Z",
    status: "released",
    audience: "Internal QA"
  },
  {
    id: "gr-3",
    title: "Finished Batch Summary - LOT-55019",
    type: "batch",
    format: "pdf",
    generatedAt: "2026-03-13T15:00:00Z",
    status: "draft",
    audience: "Operations"
  }
];

export const documents: DocumentRecord[] = [
  {
    id: "doc-1",
    name: "SOP-CHM-014 HPLC Assay Procedure",
    category: "sop",
    version: "v3.2",
    owner: "QA Document Control",
    updatedAt: "2026-03-11T11:00:00Z"
  },
  {
    id: "doc-2",
    name: "TM-MIC-009 Bioburden Method",
    category: "test_method",
    version: "v5.1",
    owner: "Microbiology Lab",
    updatedAt: "2026-03-10T14:45:00Z"
  },
  {
    id: "doc-3",
    name: "Supplier Certificate - RS-4410",
    category: "certificate",
    version: "v1.0",
    owner: "Warehouse QA",
    updatedAt: "2026-03-08T09:10:00Z"
  }
];

export const notifications: NotificationItem[] = [
  {
    id: "nt-1",
    title: "Sample RM-24-00451 received and registered",
    channel: "in_app",
    type: "sample_received",
    recipient: "A. Patel",
    sentAt: "2026-03-12T09:12:00Z",
    status: "sent"
  },
  {
    id: "nt-2",
    title: "Bioburden test completed and awaiting QC review",
    channel: "email",
    type: "test_completed",
    recipient: "J. Romero",
    sentAt: "2026-03-13T18:24:00Z",
    status: "sent"
  },
  {
    id: "nt-3",
    title: "Tryptic Soy Agar below reorder level",
    channel: "email",
    type: "inventory_alert",
    recipient: "M. Lewis",
    sentAt: "2026-03-14T07:10:00Z",
    status: "queued"
  }
];

export const notebookEntries: NotebookEntry[] = [
  {
    id: "eln-1",
    sampleCode: "RM-24-00451",
    experimentTitle: "Assay prep and standard traceability",
    author: "A. Patel",
    version: "v2.1",
    status: "approved",
    recordedAt: "2026-03-13T09:20:00Z"
  },
  {
    id: "eln-2",
    sampleCode: "FG-24-00913",
    experimentTitle: "Bioburden plate interpretation",
    author: "M. Lewis",
    version: "v1.4",
    status: "review",
    recordedAt: "2026-03-13T18:10:00Z"
  },
  {
    id: "eln-3",
    sampleCode: "STB-24-00088",
    experimentTitle: "6M stability pull sample receipt notes",
    author: "R. Shah",
    version: "v0.9",
    status: "draft",
    recordedAt: "2026-03-14T08:00:00Z"
  }
];

export const batchRecords: BatchRecord[] = [
  {
    id: "bat-1",
    batchNumber: "BCH-11872",
    productName: "API Blend Alpha",
    sampleCount: 6,
    genealogy: "Raw material -> blend -> assay release",
    releaseStatus: "testing",
    dispositionDueAt: "2026-03-16T18:00:00Z"
  },
  {
    id: "bat-2",
    batchNumber: "LOT-55019",
    productName: "Sterile Vial Fill",
    sampleCount: 8,
    genealogy: "Compounding -> fill/finish -> sterility review",
    releaseStatus: "review",
    dispositionDueAt: "2026-03-15T20:00:00Z"
  },
  {
    id: "bat-3",
    batchNumber: "ENV-1928",
    productName: "EM Campaign March Week 2",
    sampleCount: 14,
    genealogy: "Room qualification -> settle plates -> trending",
    releaseStatus: "released",
    dispositionDueAt: "2026-03-13T15:00:00Z"
  }
];

export const scheduleItems: ScheduleItem[] = [
  {
    id: "sch-1",
    resourceType: "instrument",
    resourceName: "Waters HPLC-04",
    scheduledFor: "2026-03-14T11:00:00Z",
    window: "11:00 - 15:00",
    owner: "A. Patel",
    status: "active"
  },
  {
    id: "sch-2",
    resourceType: "analyst",
    resourceName: "Jordan Romero",
    scheduledFor: "2026-03-14T13:00:00Z",
    window: "13:00 - 17:00",
    owner: "QA Review",
    status: "planned"
  },
  {
    id: "sch-3",
    resourceType: "study",
    resourceName: "6M Stability Pull",
    scheduledFor: "2026-03-15T07:00:00Z",
    window: "07:00 - 09:00",
    owner: "Stability Lab",
    status: "conflict"
  }
];

export const environmentalReadings: EnvironmentalReading[] = [
  {
    id: "env-1",
    location: "QC Micro Lab / Room 2",
    parameter: "temperature",
    value: "21.4 C",
    threshold: "20-22 C",
    status: "normal",
    capturedAt: "2026-03-14T09:12:00Z"
  },
  {
    id: "env-2",
    location: "Stability Chamber 3",
    parameter: "humidity",
    value: "68% RH",
    threshold: "65% RH +/- 5%",
    status: "warning",
    capturedAt: "2026-03-14T09:10:00Z"
  },
  {
    id: "env-3",
    location: "Grade C Filling Suite",
    parameter: "particles",
    value: "3,420 /m3",
    threshold: "<= 3,520 /m3",
    status: "normal",
    capturedAt: "2026-03-14T09:05:00Z"
  }
];

export const testMethods: TestMethodRecord[] = [
  {
    id: "tm-1",
    methodCode: "TM-CHM-014",
    name: "Assay by HPLC",
    technique: "HPLC",
    version: "v5.2",
    owner: "Chemistry QA",
    status: "approved"
  },
  {
    id: "tm-2",
    methodCode: "TM-MIC-009",
    name: "Bioburden Enumeration",
    technique: "Microbiology",
    version: "v4.7",
    owner: "Microbiology Lead",
    status: "approved"
  },
  {
    id: "tm-3",
    methodCode: "TM-STB-003",
    name: "Stability Pull Handling",
    technique: "Stability",
    version: "v1.1",
    owner: "Stability Program",
    status: "draft"
  }
];

export const portalRequests: PortalRequest[] = [
  {
    id: "pr-1",
    clientName: "Acme Pharma QA",
    sampleCode: "FG-24-00913",
    requestType: "result_review",
    status: "in_review",
    requestedAt: "2026-03-13T19:15:00Z"
  },
  {
    id: "pr-2",
    clientName: "Nova Therapeutics",
    sampleCode: "RM-24-00451",
    requestType: "report_download",
    status: "completed",
    requestedAt: "2026-03-14T08:45:00Z"
  },
  {
    id: "pr-3",
    clientName: "Helix Nutrition",
    sampleCode: "NEW-24-00012",
    requestType: "submission",
    status: "submitted",
    requestedAt: "2026-03-14T09:00:00Z"
  }
];

export const stabilityStudies: StabilityStudy[] = [
  {
    id: "ss-1",
    protocolCode: "STB-API-24-002",
    productName: "API Blend Alpha",
    storageCondition: "25 C / 60% RH",
    intervalLabel: "6M Pull",
    nextPullAt: "2026-03-15T07:00:00Z",
    status: "active"
  },
  {
    id: "ss-2",
    protocolCode: "STB-FP-24-014",
    productName: "Sterile Vial Fill",
    storageCondition: "40 C / 75% RH",
    intervalLabel: "3M Accelerated",
    nextPullAt: "2026-03-20T07:30:00Z",
    status: "scheduled"
  },
  {
    id: "ss-3",
    protocolCode: "STB-DEV-24-006",
    productName: "Development Capsule",
    storageCondition: "30 C / 65% RH",
    intervalLabel: "9M Pull",
    nextPullAt: "2026-03-18T08:00:00Z",
    status: "review"
  }
];

export const billingRecords: BillingRecord[] = [
  {
    id: "bill-1",
    clientName: "Acme Pharma QA",
    invoiceNumber: "INV-2026-0314",
    amount: "$14,280",
    utilization: "126 tests / 9 reports",
    status: "issued",
    billedAt: "2026-03-14T06:30:00Z"
  },
  {
    id: "bill-2",
    clientName: "Nova Therapeutics",
    invoiceNumber: "INV-2026-0309",
    amount: "$8,940",
    utilization: "74 tests / 4 reports",
    status: "paid",
    billedAt: "2026-03-09T10:10:00Z"
  },
  {
    id: "bill-3",
    clientName: "Helix Nutrition",
    invoiceNumber: "INV-2026-0301",
    amount: "$3,720",
    utilization: "22 tests / 2 reports",
    status: "overdue",
    billedAt: "2026-03-01T14:40:00Z"
  }
];

export const dataExchangeJobs: DataExchangeJob[] = [
  {
    id: "dx-1",
    jobName: "ERP batch export",
    direction: "export",
    format: "json",
    scope: "Released batches + CoA references",
    status: "completed",
    processedAt: "2026-03-14T08:10:00Z"
  },
  {
    id: "dx-2",
    jobName: "Client sample intake import",
    direction: "import",
    format: "csv",
    scope: "Portal-submitted sample headers",
    status: "running",
    processedAt: "2026-03-14T09:05:00Z"
  },
  {
    id: "dx-3",
    jobName: "Instrument normalization API sync",
    direction: "import",
    format: "api",
    scope: "BioTek run files and parsed metadata",
    status: "queued",
    processedAt: "2026-03-14T09:20:00Z"
  }
];

export const backupSnapshots: BackupSnapshot[] = [
  {
    id: "bk-1",
    environment: "Production",
    region: "ap-south-1",
    lastBackupAt: "2026-03-14T08:55:00Z",
    recoveryObjective: "RPO 15m / RTO 2h",
    status: "healthy"
  },
  {
    id: "bk-2",
    environment: "Validation",
    region: "eu-west-1",
    lastBackupAt: "2026-03-14T07:30:00Z",
    recoveryObjective: "RPO 1h / RTO 4h",
    status: "warning"
  },
  {
    id: "bk-3",
    environment: "Disaster Recovery",
    region: "us-east-1",
    lastBackupAt: "2026-03-14T08:40:00Z",
    recoveryObjective: "Warm standby",
    status: "healthy"
  }
];

export const predictiveForecasts: PredictiveForecast[] = [
  {
    id: "pf-1",
    metric: "Chemistry lab capacity",
    current: "78% utilized",
    forecast: "91% by Wednesday",
    confidence: "93%",
    horizon: "72h",
    recommendedAction: "Shift two assay runs to night queue and preload solvents."
  },
  {
    id: "pf-2",
    metric: "Median sample turnaround",
    current: "34.6 hours",
    forecast: "41.2 hours if current intake continues",
    confidence: "89%",
    horizon: "5 days",
    recommendedAction: "Add one QA review block and prioritize micro release samples."
  },
  {
    id: "pf-3",
    metric: "Analyst utilization",
    current: "Lab team at 84%",
    forecast: "Two analysts exceed 95% load",
    confidence: "87%",
    horizon: "48h",
    recommendedAction: "Reassign stability pull prep to shared support staff."
  }
];

export const forecastTrend: ForecastPoint[] = [
  { period: "Mon", demand: 138, capacity: 152, turnaround: 32 },
  { period: "Tue", demand: 146, capacity: 154, turnaround: 33 },
  { period: "Wed", demand: 161, capacity: 156, turnaround: 36 },
  { period: "Thu", demand: 169, capacity: 158, turnaround: 39 },
  { period: "Fri", demand: 174, capacity: 160, turnaround: 41 }
];

export const knowledgeGraphRelations: KnowledgeGraphRelation[] = [
  {
    id: "kg-1",
    source: "RM-24-00451",
    relationship: "tested_by",
    target: "TM-CHM-014",
    context: "Assay result must meet RM-A-11 specification before release."
  },
  {
    id: "kg-2",
    source: "FG-24-00913",
    relationship: "regulated_under",
    target: "21 CFR Part 11",
    context: "Electronic review and audit evidence required for final release."
  },
  {
    id: "kg-3",
    source: "STB-API-24-002",
    relationship: "depends_on",
    target: "Stability Chamber 3",
    context: "Storage condition drift affects next pull qualification."
  }
];
