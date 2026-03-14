# NextGen LIMS

Cloud-native Laboratory Information Management System built with Next.js App Router, TypeScript, Tailwind CSS, shadcn-style UI primitives, React Query, Recharts, and Supabase.

## Scope

This MVP includes:

- Authentication and user management with Supabase Auth using Email + Password
- One shared login flow with role-based dashboard redirects for Admin, Lab Manager, Technician, QA/QC, and Client users
- Client self-signup with organization profile capture, plus admin-driven invitation flow for internal users
- Sample lifecycle management and chain of custody
- Workflow orchestration and task assignment
- Testing, results entry, and validation visibility
- Electronic Lab Notebook (ELN) workspace
- Batch genealogy and release traceability
- Inventory and reagent control
- Laboratory scheduling and environmental monitoring
- Instrument import pipeline for CSV and API ingestion
- Test method management and client portal workflows
- Stability study management
- Quality control tracking and control-chart monitoring
- Reports, certificates, and compliance reporting
- Cost tracking, billing, and data exchange monitoring
- Document management and notification queues
- Backup and recovery tracking
- Predictive analytics and knowledge graph innovation modules
- Supabase-ready PostgreSQL schema with Row Level Security

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- React Query
- Recharts
- Supabase Auth (Email + Password), PostgreSQL, Storage, and RLS

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Add your Supabase project values to `.env.local`.

Set `NEXT_PUBLIC_APP_URL` to the base URL users will open from invite or signup emails. For local development this is usually `http://localhost:3000`.

4. Run the development server:

```bash
npm run dev
```

## Demo seeding

Seed demo Supabase users and dashboard data for every role:

```bash
npm run seed:supabase-demo
```

Seeded roles:

- `admin`
- `lab_manager`
- `scientist_technician`
- `qa_qc_manager`
- `client`

The script is idempotent and prints the demo credentials in the terminal after a successful run.

If the auth users already exist and you only want the relational data query, use [supabase/seed_demo_data.sql](/C:/Users/Bacancy/OneDrive/Documents/NextGen-LIMS/supabase/seed_demo_data.sql).

## Supabase setup

Apply the migration in [supabase/migrations/202603140001_initial_lims.sql](/C:/Users/Bacancy/OneDrive/Documents/NextGen-LIMS/supabase/migrations/202603140001_initial_lims.sql).

The migration creates:

- Multi-tenant organization model
- Laboratory and workflow configuration
- Sample, test, inventory, quality, compliance, and audit tables
- Storage bucket for compliance report artifacts
- Row Level Security policies scoped by the authenticated user's organization

## User roles and RBAC

Role-based access control is implemented with Supabase RLS policies in [supabase/migrations/202603140002_role_based_access_control.sql](/C:/Users/Bacancy/OneDrive/Documents/NextGen-LIMS/supabase/migrations/202603140002_role_based_access_control.sql).

Supported roles:

- `admin`
- `lab_manager`
- `scientist_technician`
- `qa_qc_manager`
- `client`

Access model:

- `admin`: full organization administration, profile management, and destructive operations.
- `lab_manager`: manages laboratories, workflows, samples, test execution, and inventory.
- `scientist_technician`: operational access for samples, test results, inventory updates, and raising quality events.
- `qa_qc_manager`: quality oversight, sample/test review updates, compliance reports, and audit visibility.
- `client`: external portal access only to samples, test results, compliance reports, and report files explicitly assigned to that client user.

## Notes

- The UI uses demo data when Supabase environment variables are not configured.
- Internal user invitations require `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.
- `src/app/actions.ts` is prepared for server-action-based intake flows and can be extended to persist records into Supabase.
- `src/app/api/analytics/route.ts` exposes dashboard, predictive analytics, and knowledge-graph payloads for external dashboards or polling clients.
- Additional platform modules are backed by [supabase/migrations/202603140003_platform_modules.sql](/C:/Users/Bacancy/OneDrive/Documents/NextGen-LIMS/supabase/migrations/202603140003_platform_modules.sql), which adds lifecycle events, custody tracking, workflow tasks, automation rules, test definitions, instrument imports, QC, generated reports, document storage, notifications, and user activity logs.
- Feature-completion coverage for ELN, batches, scheduling, environmental monitoring, methods, portal requests, stability studies, billing, data exchange, backup snapshots, predictive analytics, and knowledge graph relationships is added in [supabase/migrations/202603140004_feature_completion.sql](/C:/Users/Bacancy/OneDrive/Documents/NextGen-LIMS/supabase/migrations/202603140004_feature_completion.sql).
- Normalized RBAC support for `roles`, `permissions`, `user_roles`, client organization profiles, and auth-user provisioning is added in [supabase/migrations/202603140005_auth_rbac.sql](/C:/Users/Bacancy/OneDrive/Documents/NextGen-LIMS/supabase/migrations/202603140005_auth_rbac.sql).
