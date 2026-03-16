import { readFileSync } from "node:fs";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

const root = process.cwd();
const DEMO_PASSWORD = "DemoPass123!";
const DEMO_ORG_ID = "0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc10001";


const ids = {
  chemistryLab: "0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc10002",
  microLab: "0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc10003",
  sampleLoginStage: "0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc10004",
  testingStage: "0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc10005",
  reviewStage: "0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc10006",
  releaseStage: "0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc10007",
  sampleApi: "0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc10008",
  sampleFinished: "0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc10009",
  inventoryStandard: "0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc1000a",
  qualityEvent: "0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc1000b",
  complianceReport: "0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc1000c",
  qcSample: "0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc1000d",
  document: "0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc1000e",
  report: "0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc1000f",
  portalRequest: "0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc10010",
  billing: "0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc10011",
  activity: "0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc10012",
  notificationClient: "0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc10013",
  notificationTech: "0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc10014",
  resultApi: "0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc10015",
  resultFinished: "0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc10016"
};

const demoUsers = [
  {
    key: "admin",
    email: "admin.demo@nextgenlims.local",
    role: "admin",
    fullName: "Priya Nair",
    companyName: "NextGen Demo Labs",
    phone: "+1-555-0100"
  },
  {
    key: "lab_manager",
    email: "manager.demo@nextgenlims.local",
    role: "lab_manager",
    fullName: "Marcus Lewis",
    companyName: "NextGen Demo Labs",
    phone: "+1-555-0101"
  },
  {
    key: "technician",
    email: "technician.demo@nextgenlims.local",
    role: "scientist_technician",
    fullName: "Asha Patel",
    companyName: "NextGen Demo Labs",
    phone: "+1-555-0102"
  },
  {
    key: "qa",
    email: "qa.demo@nextgenlims.local",
    role: "qa_qc_manager",
    fullName: "Jordan Romero",
    companyName: "NextGen Demo Labs",
    phone: "+1-555-0103"
  },
  {
    key: "client",
    email: "client.demo@nextgenlims.local",
    role: "client",
    fullName: "Acme Pharma QA",
    companyName: "Acme Pharma",
    phone: "+1-555-0104"
  }
];

const roles = [
  { name: "admin", description: "Full system administrators" },
  { name: "lab_manager", description: "Laboratory operations managers" },
  { name: "scientist_technician", description: "Technicians and analysts performing tests" },
  { name: "qa_qc_manager", description: "Quality assurance and quality control reviewers" },
  { name: "client", description: "External client users" }
];

function parseEnvFile(filePath) {
  const raw = readFileSync(filePath, "utf8");
  const values = {};

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const index = trimmed.indexOf("=");
    if (index === -1) {
      continue;
    }

    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
    values[key] = value;
  }

  return values;
}

function getEnv(name) {
  const localEnv = parseEnvFile(path.join(root, ".env.local"));
  const value = process.env[name] ?? localEnv[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

async function findAuthUserByEmail(supabase, email) {
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });

    if (error) {
      throw error;
    }

    const user = data.users.find((entry) => entry.email?.toLowerCase() === email.toLowerCase());

    if (user) {
      return user;
    }

    if (data.users.length < perPage) {
      return null;
    }

    page += 1;
  }
}

async function ensureAuthUser(supabase, definition) {
  const metadata = {
    full_name: definition.fullName,
    role: definition.role,
    company_name: definition.companyName,
    phone: definition.phone,
    organization_id: DEMO_ORG_ID
  };

  const existing = await findAuthUserByEmail(supabase, definition.email);

  if (!existing) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: definition.email,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: metadata
    });

    if (error) {
      throw error;
    }

    return data.user;
  }

  const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: metadata
  });

  if (error) {
    throw error;
  }

  return data.user;
}

async function upsert(supabase, table, rows, onConflict = "id") {
  if (!rows.length) {
    return;
  }

  const { error } = await supabase.from(table).upsert(rows, { onConflict });

  if (error) {
    throw error;
  }
}

async function main() {
  const supabase = createClient(
    getEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  console.log("Seeding Supabase demo users and role-aware data...");

  await upsert(
    supabase,
    "organizations",
    [
      {
        id: DEMO_ORG_ID,
        name: "NextGen Demo Labs",
        slug: "nextgen-demo-labs",
        industry: "life_sciences"
      }
    ],
    "id"
  );

  await upsert(supabase, "roles", roles, "name");

  const authUsers = {};
  for (const definition of demoUsers) {
    authUsers[definition.key] = await ensureAuthUser(supabase, definition);
  }

  await upsert(
    supabase,
    "profiles",
    demoUsers.map((definition) => ({
      id: authUsers[definition.key].id,
      organization_id: DEMO_ORG_ID,
      full_name: definition.fullName,
      role: definition.role
    })),
    "id"
  );

  const { data: roleRows, error: rolesError } = await supabase.from("roles").select("id, name");
  if (rolesError) throw rolesError;
  const roleIdByName = Object.fromEntries(roleRows.map((role) => [role.name, role.id]));

  await upsert(
    supabase,
    "user_roles",
    demoUsers.map((definition) => ({
      user_id: authUsers[definition.key].id,
      role_id: roleIdByName[definition.role],
      assigned_by: authUsers.admin.id
    })),
    "user_id"
  );

  await upsert(
    supabase,
    "client_profiles",
    [
      {
        user_id: authUsers.client.id,
        organization_id: DEMO_ORG_ID,
        company_name: "Acme Pharma",
        phone: "+1-555-0104"
      }
    ],
    "user_id"
  );

  await upsert(
    supabase,
    "laboratories",
    [
      {
        id: ids.chemistryLab,
        organization_id: DEMO_ORG_ID,
        name: "Chemistry Lab",
        site_code: "CHEM-01",
        type: "chemistry"
      },
      {
        id: ids.microLab,
        organization_id: DEMO_ORG_ID,
        name: "Microbiology Lab",
        site_code: "MICRO-01",
        type: "microbiology"
      }
    ]
  );

  await upsert(
    supabase,
    "workflow_stages",
    [
      {
        id: ids.sampleLoginStage,
        organization_id: DEMO_ORG_ID,
        name: "Sample Login",
        sort_order: 1,
        sla_hours: 4,
        automation_coverage: 88,
        active_samples: 18
      },
      {
        id: ids.testingStage,
        organization_id: DEMO_ORG_ID,
        name: "Testing",
        sort_order: 2,
        sla_hours: 16,
        automation_coverage: 76,
        active_samples: 34
      },
      {
        id: ids.reviewStage,
        organization_id: DEMO_ORG_ID,
        name: "QC Review",
        sort_order: 3,
        sla_hours: 8,
        automation_coverage: 52,
        active_samples: 11
      },
      {
        id: ids.releaseStage,
        organization_id: DEMO_ORG_ID,
        name: "Release",
        sort_order: 4,
        sla_hours: 6,
        automation_coverage: 93,
        active_samples: 7
      }
    ]
  );

  await upsert(
    supabase,
    "samples",
    [
      {
        id: ids.sampleApi,
        organization_id: DEMO_ORG_ID,
        laboratory_id: ids.chemistryLab,
        workflow_stage_id: ids.testingStage,
        sample_code: "RM-26-0001",
        material_name: "API Blend Alpha",
        batch_number: "BCH-11872",
        workflow_name: "Raw Material Release",
        owner_name: "Asha Patel",
        priority: "critical",
        status: "in_progress",
        barcode: "BC-RM-26-0001",
        received_at: "2026-03-12T09:10:00Z",
        due_at: "2026-03-15T12:00:00Z",
        submitted_at: "2026-03-12T08:40:00Z",
        external_client_id: authUsers.client.id,
        metadata: { source: "supplier_portal" }
      },
      {
        id: ids.sampleFinished,
        organization_id: DEMO_ORG_ID,
        laboratory_id: ids.microLab,
        workflow_stage_id: ids.reviewStage,
        sample_code: "FG-26-0002",
        material_name: "Sterile Vial Fill",
        batch_number: "LOT-55019",
        workflow_name: "Finished Product Release",
        owner_name: "Marcus Lewis",
        priority: "high",
        status: "ready_for_review",
        barcode: "BC-FG-26-0002",
        received_at: "2026-03-11T11:00:00Z",
        due_at: "2026-03-14T18:00:00Z",
        submitted_at: "2026-03-11T10:45:00Z",
        metadata: { source: "manufacturing" }
      }
    ]
  );

  await upsert(
    supabase,
    "test_results",
    [
      {
        id: ids.resultApi,
        organization_id: DEMO_ORG_ID,
        sample_id: ids.sampleApi,
        method_name: "HPLC Assay",
        analyst_name: "Asha Patel",
        result_value: "99.2%",
        specification: "98.0% - 102.0%",
        status: "pass",
        completed_at: "2026-03-13T10:40:00Z"
      },
      {
        id: ids.resultFinished,
        organization_id: DEMO_ORG_ID,
        sample_id: ids.sampleFinished,
        method_name: "Bioburden",
        analyst_name: "Marcus Lewis",
        result_value: "Review triggered",
        specification: "< 10 CFU",
        status: "review",
        completed_at: "2026-03-13T18:20:00Z"
      }
    ]
  );

  await upsert(
    supabase,
    "inventory_items",
    [
      {
        id: ids.inventoryStandard,
        organization_id: DEMO_ORG_ID,
        sku: "STD-0004",
        name: "USP Caffeine Standard",
        category: "Reference Standard",
        lot_number: "RS-4410",
        quantity: 2,
        reorder_level: 5,
        location: "Freezer A / Shelf 2",
        expires_at: "2026-06-30"
      }
    ]
  );

  await upsert(
    supabase,
    "quality_events",
    [
      {
        id: ids.qualityEvent,
        organization_id: DEMO_ORG_ID,
        sample_id: ids.sampleFinished,
        event_type: "OOS",
        title: "Bioburden result pending phase II review",
        severity: "critical",
        owner_name: "Jordan Romero",
        status: "open",
        due_at: "2026-03-15"
      }
    ]
  );

  await upsert(
    supabase,
    "compliance_reports",
    [
      {
        id: ids.complianceReport,
        organization_id: DEMO_ORG_ID,
        title: "ALCOA+ Data Integrity Review",
        framework: "21 CFR Part 11",
        generated_at: "2026-03-13T16:00:00Z",
        status: "published",
        score: 98,
        storage_path: "compliance/demo-alcoa-pack.pdf",
        external_client_id: authUsers.client.id
      }
    ]
  );

  await upsert(
    supabase,
    "qc_samples",
    [
      {
        id: ids.qcSample,
        organization_id: DEMO_ORG_ID,
        sample_id: ids.sampleFinished,
        control_name: "Bioburden Positive Control",
        result_value: "9 CFU",
        status: "warning",
        reviewed_by: authUsers.qa.id
      }
    ]
  );

  await upsert(
    supabase,
    "documents",
    [
      {
        id: ids.document,
        organization_id: DEMO_ORG_ID,
        name: "SOP-CHM-014 HPLC Assay Procedure",
        category: "sop",
        version: "v3.2",
        storage_path: "lab-documents/demo/sop-chm-014.pdf",
        owner_id: authUsers.qa.id
      }
    ]
  );

  await upsert(
    supabase,
    "generated_reports",
    [
      {
        id: ids.report,
        organization_id: DEMO_ORG_ID,
        sample_id: ids.sampleApi,
        external_client_id: authUsers.client.id,
        title: "Certificate of Analysis - API Blend Alpha",
        report_type: "coa",
        file_format: "pdf",
        status: "released",
        storage_path: "generated-reports/demo/api-blend-alpha.pdf",
        generated_by: authUsers.qa.id,
        generated_at: "2026-03-14T08:30:00Z"
      }
    ]
  );

  await upsert(
    supabase,
    "client_portal_requests",
    [
      {
        id: ids.portalRequest,
        organization_id: DEMO_ORG_ID,
        sample_id: ids.sampleApi,
        external_client_id: authUsers.client.id,
        request_type: "report_download",
        status: "completed",
        payload: { report_title: "Certificate of Analysis - API Blend Alpha" },
        requested_at: "2026-03-14T08:45:00Z"
      }
    ]
  );

  await upsert(
    supabase,
    "billing_records",
    [
      {
        id: ids.billing,
        organization_id: DEMO_ORG_ID,
        external_client_id: authUsers.client.id,
        invoice_number: "INV-2026-0314",
        amount: 14280,
        utilization_summary: "126 tests / 9 reports",
        status: "issued",
        billed_at: "2026-03-14T06:30:00Z"
      }
    ]
  );

  await upsert(
    supabase,
    "notifications",
    [
      {
        id: ids.notificationClient,
        organization_id: DEMO_ORG_ID,
        recipient_user_id: authUsers.client.id,
        title: "Your CoA is available for download",
        body: "Certificate of Analysis for API Blend Alpha has been released.",
        channel: "email",
        notification_type: "report_ready",
        status: "sent",
        sent_at: "2026-03-14T08:32:00Z"
      },
      {
        id: ids.notificationTech,
        organization_id: DEMO_ORG_ID,
        recipient_user_id: authUsers.technician.id,
        title: "New assay run assigned",
        body: "API Blend Alpha assay is now assigned to your queue.",
        channel: "in_app",
        notification_type: "assignment",
        status: "queued"
      }
    ]
  );

  await upsert(
    supabase,
    "user_activity_logs",
    [
      {
        id: ids.activity,
        organization_id: DEMO_ORG_ID,
        user_id: authUsers.admin.id,
        action: "Provisioned demo RBAC users",
        entity_name: "User Management",
        channel: "admin_console",
        user_agent: "seed-script"
      }
    ]
  );

  console.log("");
  console.log("Demo seed complete.");
  console.log("Credentials:");
  for (const definition of demoUsers) {
    console.log(`- ${definition.role}: ${definition.email} / ${DEMO_PASSWORD}`);
  }
}

main().catch((error) => {
  console.error("Demo seed failed.");
  console.error(error);
  process.exitCode = 1;
});
