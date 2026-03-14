-- UP
begin;

create table if not exists public.lab_notebook_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  sample_id uuid references public.samples(id) on delete set null,
  author_id uuid references public.profiles(id) on delete set null,
  title text not null,
  version text not null default 'v1.0',
  status text not null default 'draft',
  entry_content jsonb not null default '{}'::jsonb,
  recorded_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.batch_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  batch_number text not null,
  product_name text not null,
  genealogy_summary text,
  release_status text not null default 'sampling',
  disposition_due_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, batch_number)
);

create table if not exists public.batch_sample_links (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  batch_record_id uuid not null references public.batch_records(id) on delete cascade,
  sample_id uuid not null references public.samples(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (batch_record_id, sample_id)
);

create table if not exists public.laboratory_schedules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  resource_type text not null,
  resource_name text not null,
  owner_id uuid references public.profiles(id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'planned',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.environmental_readings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  laboratory_id uuid references public.laboratories(id) on delete set null,
  sample_id uuid references public.samples(id) on delete set null,
  parameter_name text not null,
  reading_value text not null,
  threshold text,
  status text not null default 'normal',
  captured_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.test_methods (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  method_code text not null,
  name text not null,
  technique text not null,
  version text not null,
  owner_id uuid references public.profiles(id) on delete set null,
  status text not null default 'draft',
  document_id uuid references public.documents(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, method_code, version)
);

create table if not exists public.client_portal_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  sample_id uuid references public.samples(id) on delete set null,
  external_client_id uuid references auth.users(id) on delete set null,
  request_type text not null,
  status text not null default 'submitted',
  payload jsonb not null default '{}'::jsonb,
  requested_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.stability_studies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  sample_id uuid references public.samples(id) on delete set null,
  protocol_code text not null,
  product_name text not null,
  storage_condition text not null,
  interval_label text not null,
  next_pull_at timestamptz,
  status text not null default 'scheduled',
  created_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, protocol_code)
);

create table if not exists public.billing_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  external_client_id uuid references auth.users(id) on delete set null,
  invoice_number text not null,
  amount numeric(12,2) not null default 0,
  utilization_summary text,
  status text not null default 'draft',
  billed_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, invoice_number)
);

create table if not exists public.data_exchange_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  job_name text not null,
  direction text not null,
  format text not null,
  scope text not null,
  status text not null default 'queued',
  processed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.backup_snapshots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  environment_name text not null,
  region text not null,
  last_backup_at timestamptz not null,
  recovery_objective text not null,
  status text not null default 'healthy',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.predictive_forecasts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  metric_name text not null,
  current_value text not null,
  forecast_value text not null,
  confidence_score numeric(5,2),
  horizon_label text not null,
  recommended_action text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.knowledge_graph_edges (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  source_entity text not null,
  relationship_type text not null,
  target_entity text not null,
  context_notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_lab_notebook_entries_sample_id on public.lab_notebook_entries(sample_id);
create index if not exists idx_batch_records_organization_id on public.batch_records(organization_id);
create index if not exists idx_batch_sample_links_sample_id on public.batch_sample_links(sample_id);
create index if not exists idx_laboratory_schedules_starts_at on public.laboratory_schedules(starts_at);
create index if not exists idx_environmental_readings_laboratory_id on public.environmental_readings(laboratory_id);
create index if not exists idx_test_methods_organization_id on public.test_methods(organization_id);
create index if not exists idx_client_portal_requests_external_client_id on public.client_portal_requests(external_client_id);
create index if not exists idx_stability_studies_next_pull_at on public.stability_studies(next_pull_at);
create index if not exists idx_billing_records_external_client_id on public.billing_records(external_client_id);
create index if not exists idx_data_exchange_jobs_organization_id on public.data_exchange_jobs(organization_id);
create index if not exists idx_backup_snapshots_organization_id on public.backup_snapshots(organization_id);
create index if not exists idx_predictive_forecasts_organization_id on public.predictive_forecasts(organization_id);
create index if not exists idx_knowledge_graph_edges_organization_id on public.knowledge_graph_edges(organization_id);

alter table public.lab_notebook_entries enable row level security;
alter table public.batch_records enable row level security;
alter table public.batch_sample_links enable row level security;
alter table public.laboratory_schedules enable row level security;
alter table public.environmental_readings enable row level security;
alter table public.test_methods enable row level security;
alter table public.client_portal_requests enable row level security;
alter table public.stability_studies enable row level security;
alter table public.billing_records enable row level security;
alter table public.data_exchange_jobs enable row level security;
alter table public.backup_snapshots enable row level security;
alter table public.predictive_forecasts enable row level security;
alter table public.knowledge_graph_edges enable row level security;

create policy "lab_notebook_entries_select_internal"
on public.lab_notebook_entries
for select
using (
  organization_id = public.current_organization_id()
  and public.is_internal_user()
);

create policy "lab_notebook_entries_manage_internal"
on public.lab_notebook_entries
for all
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'scientist_technician', 'qa_qc_manager'])
)
with check (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'scientist_technician', 'qa_qc_manager'])
);

create policy "batch_records_select_internal"
on public.batch_records
for select
using (
  organization_id = public.current_organization_id()
  and public.is_internal_user()
);

create policy "batch_records_manage_internal"
on public.batch_records
for all
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'qa_qc_manager'])
)
with check (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'qa_qc_manager'])
);

create policy "batch_sample_links_select_internal"
on public.batch_sample_links
for select
using (
  organization_id = public.current_organization_id()
  and public.is_internal_user()
);

create policy "batch_sample_links_manage_internal"
on public.batch_sample_links
for all
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager'])
)
with check (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager'])
);

create policy "laboratory_schedules_select_internal"
on public.laboratory_schedules
for select
using (
  organization_id = public.current_organization_id()
  and public.is_internal_user()
);

create policy "laboratory_schedules_manage_internal"
on public.laboratory_schedules
for all
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager'])
)
with check (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager'])
);

create policy "environmental_readings_select_internal"
on public.environmental_readings
for select
using (
  organization_id = public.current_organization_id()
  and public.is_internal_user()
);

create policy "environmental_readings_manage_internal"
on public.environmental_readings
for all
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'qa_qc_manager'])
)
with check (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'qa_qc_manager'])
);

create policy "test_methods_select_internal"
on public.test_methods
for select
using (
  organization_id = public.current_organization_id()
  and public.is_internal_user()
);

create policy "test_methods_manage_internal"
on public.test_methods
for all
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'qa_qc_manager'])
)
with check (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'qa_qc_manager'])
);

create policy "client_portal_requests_select_by_role"
on public.client_portal_requests
for select
using (
  organization_id = public.current_organization_id()
  and (
    public.is_internal_user()
    or (
      public.current_user_role() = 'client'
      and external_client_id = auth.uid()
    )
  )
);

create policy "client_portal_requests_manage_by_role"
on public.client_portal_requests
for all
using (
  organization_id = public.current_organization_id()
  and (
    public.has_any_role(array['admin', 'lab_manager', 'qa_qc_manager'])
    or (
      public.current_user_role() = 'client'
      and external_client_id = auth.uid()
    )
  )
)
with check (
  organization_id = public.current_organization_id()
  and (
    public.has_any_role(array['admin', 'lab_manager', 'qa_qc_manager'])
    or (
      public.current_user_role() = 'client'
      and external_client_id = auth.uid()
    )
  )
);

create policy "stability_studies_select_internal"
on public.stability_studies
for select
using (
  organization_id = public.current_organization_id()
  and public.is_internal_user()
);

create policy "stability_studies_manage_internal"
on public.stability_studies
for all
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'scientist_technician'])
)
with check (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'scientist_technician'])
);

create policy "billing_records_select_by_role"
on public.billing_records
for select
using (
  organization_id = public.current_organization_id()
  and (
    public.has_any_role(array['admin', 'lab_manager', 'qa_qc_manager'])
    or (
      public.current_user_role() = 'client'
      and external_client_id = auth.uid()
    )
  )
);

create policy "billing_records_manage_internal"
on public.billing_records
for all
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'qa_qc_manager'])
)
with check (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'qa_qc_manager'])
);

create policy "data_exchange_jobs_select_internal"
on public.data_exchange_jobs
for select
using (
  organization_id = public.current_organization_id()
  and public.is_internal_user()
);

create policy "data_exchange_jobs_manage_internal"
on public.data_exchange_jobs
for all
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'scientist_technician'])
)
with check (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'scientist_technician'])
);

create policy "backup_snapshots_select_internal"
on public.backup_snapshots
for select
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'qa_qc_manager'])
);

create policy "backup_snapshots_manage_internal"
on public.backup_snapshots
for all
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin'])
)
with check (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin'])
);

create policy "predictive_forecasts_select_internal"
on public.predictive_forecasts
for select
using (
  organization_id = public.current_organization_id()
  and public.is_internal_user()
);

create policy "predictive_forecasts_manage_internal"
on public.predictive_forecasts
for all
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager'])
)
with check (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager'])
);

create policy "knowledge_graph_edges_select_internal"
on public.knowledge_graph_edges
for select
using (
  organization_id = public.current_organization_id()
  and public.is_internal_user()
);

create policy "knowledge_graph_edges_manage_internal"
on public.knowledge_graph_edges
for all
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'qa_qc_manager'])
)
with check (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'qa_qc_manager'])
);

commit;

/* -- DOWN
begin;

drop policy if exists "knowledge_graph_edges_manage_internal" on public.knowledge_graph_edges;
drop policy if exists "knowledge_graph_edges_select_internal" on public.knowledge_graph_edges;
drop policy if exists "predictive_forecasts_manage_internal" on public.predictive_forecasts;
drop policy if exists "predictive_forecasts_select_internal" on public.predictive_forecasts;
drop policy if exists "backup_snapshots_manage_internal" on public.backup_snapshots;
drop policy if exists "backup_snapshots_select_internal" on public.backup_snapshots;
drop policy if exists "data_exchange_jobs_manage_internal" on public.data_exchange_jobs;
drop policy if exists "data_exchange_jobs_select_internal" on public.data_exchange_jobs;
drop policy if exists "billing_records_manage_internal" on public.billing_records;
drop policy if exists "billing_records_select_by_role" on public.billing_records;
drop policy if exists "stability_studies_manage_internal" on public.stability_studies;
drop policy if exists "stability_studies_select_internal" on public.stability_studies;
drop policy if exists "client_portal_requests_manage_by_role" on public.client_portal_requests;
drop policy if exists "client_portal_requests_select_by_role" on public.client_portal_requests;
drop policy if exists "test_methods_manage_internal" on public.test_methods;
drop policy if exists "test_methods_select_internal" on public.test_methods;
drop policy if exists "environmental_readings_manage_internal" on public.environmental_readings;
drop policy if exists "environmental_readings_select_internal" on public.environmental_readings;
drop policy if exists "laboratory_schedules_manage_internal" on public.laboratory_schedules;
drop policy if exists "laboratory_schedules_select_internal" on public.laboratory_schedules;
drop policy if exists "batch_sample_links_manage_internal" on public.batch_sample_links;
drop policy if exists "batch_sample_links_select_internal" on public.batch_sample_links;
drop policy if exists "batch_records_manage_internal" on public.batch_records;
drop policy if exists "batch_records_select_internal" on public.batch_records;
drop policy if exists "lab_notebook_entries_manage_internal" on public.lab_notebook_entries;
drop policy if exists "lab_notebook_entries_select_internal" on public.lab_notebook_entries;

drop table if exists public.knowledge_graph_edges;
drop table if exists public.predictive_forecasts;
drop table if exists public.backup_snapshots;
drop table if exists public.data_exchange_jobs;
drop table if exists public.billing_records;
drop table if exists public.stability_studies;
drop table if exists public.client_portal_requests;
drop table if exists public.test_methods;
drop table if exists public.environmental_readings;
drop table if exists public.laboratory_schedules;
drop table if exists public.batch_sample_links;
drop table if exists public.batch_records;
drop table if exists public.lab_notebook_entries;

commit;
*/
