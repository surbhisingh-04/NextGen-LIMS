-- UP
begin;

alter table public.samples
  add column if not exists barcode text,
  add column if not exists submitted_at timestamptz not null default timezone('utc', now()),
  add column if not exists archived_at timestamptz,
  add column if not exists disposal_at timestamptz;

create index if not exists idx_samples_barcode on public.samples(barcode);

create table if not exists public.sample_lifecycle_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  sample_id uuid not null references public.samples(id) on delete cascade,
  stage text not null,
  actor_id uuid references public.profiles(id) on delete set null,
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.sample_custody_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  sample_id uuid not null references public.samples(id) on delete cascade,
  from_location text not null,
  to_location text not null,
  condition_notes text,
  handed_off_by uuid references public.profiles(id) on delete set null,
  received_by uuid references public.profiles(id) on delete set null,
  handed_off_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.workflow_definitions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, name)
);

create table if not exists public.workflow_steps (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workflow_definition_id uuid not null references public.workflow_definitions(id) on delete cascade,
  name text not null,
  step_order integer not null,
  validation_rule text,
  automation_hint text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.workflow_tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  sample_id uuid references public.samples(id) on delete cascade,
  workflow_step_id uuid references public.workflow_steps(id) on delete set null,
  assignee_id uuid references public.profiles(id) on delete set null,
  title text not null,
  status text not null default 'queued',
  validation_state text not null default 'pending',
  due_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.automation_rules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workflow_definition_id uuid references public.workflow_definitions(id) on delete set null,
  name text not null,
  trigger_event text not null,
  action_config jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.test_definitions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  sample_id uuid not null references public.samples(id) on delete cascade,
  name text not null,
  test_type text not null,
  assignee_id uuid references public.profiles(id) on delete set null,
  status text not null default 'pending',
  validation_rule text,
  form_schema jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.test_attachments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  test_definition_id uuid not null references public.test_definitions(id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.instrument_imports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  sample_id uuid references public.samples(id) on delete set null,
  instrument_name text not null,
  source_type text not null,
  method_name text,
  uploaded_by uuid references public.profiles(id) on delete set null,
  storage_path text,
  status text not null default 'parsed',
  mapped_samples integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.instrument_import_rows (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  instrument_import_id uuid not null references public.instrument_imports(id) on delete cascade,
  row_index integer not null,
  raw_payload jsonb not null default '{}'::jsonb,
  parsed_payload jsonb not null default '{}'::jsonb,
  status text not null default 'parsed'
);

create table if not exists public.qc_samples (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  sample_id uuid references public.samples(id) on delete set null,
  control_name text not null,
  result_value text not null,
  status text not null default 'in_control',
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.qc_chart_points (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  qc_sample_id uuid references public.qc_samples(id) on delete cascade,
  period_label text not null,
  numeric_value numeric(12,4) not null,
  mean_value numeric(12,4),
  lower_limit numeric(12,4),
  upper_limit numeric(12,4),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.generated_reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  sample_id uuid references public.samples(id) on delete set null,
  external_client_id uuid references auth.users(id) on delete set null,
  title text not null,
  report_type text not null,
  file_format text not null,
  status text not null default 'draft',
  storage_path text,
  generated_by uuid references public.profiles(id) on delete set null,
  generated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  category text not null,
  version text not null,
  storage_path text,
  owner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  recipient_user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  body text,
  channel text not null,
  notification_type text not null,
  status text not null default 'queued',
  created_at timestamptz not null default timezone('utc', now()),
  sent_at timestamptz
);

create table if not exists public.user_activity_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  entity_name text,
  entity_id uuid,
  channel text not null default 'application',
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists trg_documents_updated_at on public.documents;
create trigger trg_documents_updated_at
before update on public.documents
for each row
execute function public.set_updated_at();

create index if not exists idx_sample_lifecycle_events_sample_id on public.sample_lifecycle_events(sample_id);
create index if not exists idx_sample_custody_events_sample_id on public.sample_custody_events(sample_id);
create index if not exists idx_workflow_tasks_sample_id on public.workflow_tasks(sample_id);
create index if not exists idx_test_definitions_sample_id on public.test_definitions(sample_id);
create index if not exists idx_instrument_imports_sample_id on public.instrument_imports(sample_id);
create index if not exists idx_qc_samples_sample_id on public.qc_samples(sample_id);
create index if not exists idx_generated_reports_sample_id on public.generated_reports(sample_id);
create index if not exists idx_notifications_recipient_user_id on public.notifications(recipient_user_id);
create index if not exists idx_user_activity_logs_user_id on public.user_activity_logs(user_id);

alter table public.sample_lifecycle_events enable row level security;
alter table public.sample_custody_events enable row level security;
alter table public.workflow_definitions enable row level security;
alter table public.workflow_steps enable row level security;
alter table public.workflow_tasks enable row level security;
alter table public.automation_rules enable row level security;
alter table public.test_definitions enable row level security;
alter table public.test_attachments enable row level security;
alter table public.instrument_imports enable row level security;
alter table public.instrument_import_rows enable row level security;
alter table public.qc_samples enable row level security;
alter table public.qc_chart_points enable row level security;
alter table public.generated_reports enable row level security;
alter table public.documents enable row level security;
alter table public.notifications enable row level security;
alter table public.user_activity_logs enable row level security;

insert into storage.buckets (id, name, public)
values
  ('generated-reports', 'generated-reports', false),
  ('lab-documents', 'lab-documents', false),
  ('instrument-imports', 'instrument-imports', false)
on conflict (id) do nothing;

create policy "sample_lifecycle_events_select_by_role"
on public.sample_lifecycle_events
for select
using (
  exists (
    select 1
    from public.samples s
    where s.id = sample_lifecycle_events.sample_id
      and public.can_access_client_sample(s.organization_id, s.external_client_id)
  )
);

create policy "internal_users_manage_sample_lifecycle_events"
on public.sample_lifecycle_events
for all
using (
  organization_id = public.current_organization_id()
  and public.is_internal_user()
)
with check (
  organization_id = public.current_organization_id()
  and public.is_internal_user()
);

create policy "sample_custody_events_select_by_role"
on public.sample_custody_events
for select
using (
  exists (
    select 1
    from public.samples s
    where s.id = sample_custody_events.sample_id
      and public.can_access_client_sample(s.organization_id, s.external_client_id)
  )
);

create policy "internal_users_manage_sample_custody_events"
on public.sample_custody_events
for all
using (
  organization_id = public.current_organization_id()
  and public.is_internal_user()
)
with check (
  organization_id = public.current_organization_id()
  and public.is_internal_user()
);

create policy "internal_users_view_workflow_definitions"
on public.workflow_definitions
for select
using (
  organization_id = public.current_organization_id()
  and public.is_internal_user()
);

create policy "lab_admins_manage_workflow_definitions"
on public.workflow_definitions
for all
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager'])
)
with check (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager'])
);

create policy "internal_users_view_workflow_steps"
on public.workflow_steps
for select
using (
  organization_id = public.current_organization_id()
  and public.is_internal_user()
);

create policy "lab_admins_manage_workflow_steps"
on public.workflow_steps
for all
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager'])
)
with check (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager'])
);

create policy "workflow_tasks_select_by_role"
on public.workflow_tasks
for select
using (
  exists (
    select 1
    from public.samples s
    where s.id = workflow_tasks.sample_id
      and public.can_access_client_sample(s.organization_id, s.external_client_id)
  )
);

create policy "internal_users_manage_workflow_tasks"
on public.workflow_tasks
for all
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'scientist_technician', 'qa_qc_manager'])
)
with check (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'scientist_technician', 'qa_qc_manager'])
);

create policy "internal_users_view_automation_rules"
on public.automation_rules
for select
using (
  organization_id = public.current_organization_id()
  and public.is_internal_user()
);

create policy "lab_admins_manage_automation_rules"
on public.automation_rules
for all
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager'])
)
with check (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager'])
);

create policy "test_definitions_select_by_role"
on public.test_definitions
for select
using (
  exists (
    select 1
    from public.samples s
    where s.id = test_definitions.sample_id
      and public.can_access_client_sample(s.organization_id, s.external_client_id)
  )
);

create policy "internal_users_manage_test_definitions"
on public.test_definitions
for all
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'scientist_technician', 'qa_qc_manager'])
)
with check (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'scientist_technician', 'qa_qc_manager'])
);

create policy "test_attachments_select_by_role"
on public.test_attachments
for select
using (
  exists (
    select 1
    from public.test_definitions td
    join public.samples s on s.id = td.sample_id
    where td.id = test_attachments.test_definition_id
      and public.can_access_client_sample(s.organization_id, s.external_client_id)
  )
);

create policy "internal_users_manage_test_attachments"
on public.test_attachments
for all
using (
  organization_id = public.current_organization_id()
  and public.is_internal_user()
)
with check (
  organization_id = public.current_organization_id()
  and public.is_internal_user()
);

create policy "instrument_imports_select_internal"
on public.instrument_imports
for select
using (
  organization_id = public.current_organization_id()
  and public.is_internal_user()
);

create policy "instrument_imports_manage_internal"
on public.instrument_imports
for all
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'scientist_technician'])
)
with check (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'scientist_technician'])
);

create policy "instrument_import_rows_select_internal"
on public.instrument_import_rows
for select
using (
  exists (
    select 1
    from public.instrument_imports ii
    where ii.id = instrument_import_rows.instrument_import_id
      and ii.organization_id = public.current_organization_id()
      and public.is_internal_user()
  )
);

create policy "instrument_import_rows_manage_internal"
on public.instrument_import_rows
for all
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'scientist_technician'])
)
with check (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'scientist_technician'])
);

create policy "qc_samples_select_internal"
on public.qc_samples
for select
using (
  organization_id = public.current_organization_id()
  and public.is_internal_user()
);

create policy "qc_samples_manage_quality_roles"
on public.qc_samples
for all
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'qa_qc_manager'])
)
with check (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'qa_qc_manager'])
);

create policy "qc_chart_points_select_internal"
on public.qc_chart_points
for select
using (
  organization_id = public.current_organization_id()
  and public.is_internal_user()
);

create policy "qc_chart_points_manage_quality_roles"
on public.qc_chart_points
for all
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'qa_qc_manager'])
)
with check (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'qa_qc_manager'])
);

create policy "generated_reports_select_by_role"
on public.generated_reports
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

create policy "internal_users_manage_generated_reports"
on public.generated_reports
for all
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'qa_qc_manager'])
)
with check (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'qa_qc_manager'])
);

create policy "internal_users_view_documents"
on public.documents
for select
using (
  organization_id = public.current_organization_id()
  and public.is_internal_user()
);

create policy "internal_users_manage_documents"
on public.documents
for all
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'qa_qc_manager'])
)
with check (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'qa_qc_manager'])
);

create policy "users_view_own_notifications"
on public.notifications
for select
using (
  organization_id = public.current_organization_id()
  and recipient_user_id = auth.uid()
);

create policy "internal_users_manage_notifications"
on public.notifications
for all
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'qa_qc_manager'])
)
with check (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'qa_qc_manager'])
);

create policy "users_view_activity_logs"
on public.user_activity_logs
for select
using (
  organization_id = public.current_organization_id()
  and (
    user_id = auth.uid()
    or public.has_any_role(array['admin', 'qa_qc_manager'])
  )
);

create policy "internal_users_insert_activity_logs"
on public.user_activity_logs
for insert
with check (
  organization_id = public.current_organization_id()
  and public.is_internal_user()
);

drop policy if exists "internal_users_manage_generated_reports_storage" on storage.objects;
drop policy if exists "authorized_users_read_generated_reports_storage" on storage.objects;
drop policy if exists "internal_users_manage_lab_documents_storage" on storage.objects;
drop policy if exists "internal_users_manage_instrument_import_storage" on storage.objects;
drop policy if exists "internal_users_read_lab_documents_storage" on storage.objects;
drop policy if exists "internal_users_read_instrument_import_storage" on storage.objects;

create policy "authorized_users_read_generated_reports_storage"
on storage.objects
for select
using (
  bucket_id = 'generated-reports'
  and exists (
    select 1
    from public.generated_reports gr
    where gr.storage_path = storage.objects.name
      and gr.organization_id = public.current_organization_id()
      and (
        public.has_any_role(array['admin', 'lab_manager', 'qa_qc_manager'])
        or (
          public.current_user_role() = 'client'
          and gr.external_client_id = auth.uid()
        )
      )
  )
);

create policy "internal_users_manage_generated_reports_storage"
on storage.objects
for all
using (
  bucket_id = 'generated-reports'
  and public.has_any_role(array['admin', 'lab_manager', 'qa_qc_manager'])
)
with check (
  bucket_id = 'generated-reports'
  and public.has_any_role(array['admin', 'lab_manager', 'qa_qc_manager'])
);

create policy "internal_users_read_lab_documents_storage"
on storage.objects
for select
using (
  bucket_id = 'lab-documents'
  and public.is_internal_user()
);

create policy "internal_users_manage_lab_documents_storage"
on storage.objects
for all
using (
  bucket_id = 'lab-documents'
  and public.has_any_role(array['admin', 'lab_manager', 'qa_qc_manager'])
)
with check (
  bucket_id = 'lab-documents'
  and public.has_any_role(array['admin', 'lab_manager', 'qa_qc_manager'])
);

create policy "internal_users_read_instrument_import_storage"
on storage.objects
for select
using (
  bucket_id = 'instrument-imports'
  and public.is_internal_user()
);

create policy "internal_users_manage_instrument_import_storage"
on storage.objects
for all
using (
  bucket_id = 'instrument-imports'
  and public.has_any_role(array['admin', 'lab_manager', 'scientist_technician'])
)
with check (
  bucket_id = 'instrument-imports'
  and public.has_any_role(array['admin', 'lab_manager', 'scientist_technician'])
);

commit;

/* -- DOWN
begin;

drop policy if exists "internal_users_manage_instrument_import_storage" on storage.objects;
drop policy if exists "internal_users_read_instrument_import_storage" on storage.objects;
drop policy if exists "internal_users_manage_lab_documents_storage" on storage.objects;
drop policy if exists "internal_users_read_lab_documents_storage" on storage.objects;
drop policy if exists "internal_users_manage_generated_reports_storage" on storage.objects;
drop policy if exists "authorized_users_read_generated_reports_storage" on storage.objects;

drop policy if exists "internal_users_insert_activity_logs" on public.user_activity_logs;
drop policy if exists "users_view_activity_logs" on public.user_activity_logs;
drop policy if exists "internal_users_manage_notifications" on public.notifications;
drop policy if exists "users_view_own_notifications" on public.notifications;
drop policy if exists "internal_users_manage_documents" on public.documents;
drop policy if exists "internal_users_view_documents" on public.documents;
drop policy if exists "internal_users_manage_generated_reports" on public.generated_reports;
drop policy if exists "generated_reports_select_by_role" on public.generated_reports;
drop policy if exists "qc_chart_points_manage_quality_roles" on public.qc_chart_points;
drop policy if exists "qc_chart_points_select_internal" on public.qc_chart_points;
drop policy if exists "qc_samples_manage_quality_roles" on public.qc_samples;
drop policy if exists "qc_samples_select_internal" on public.qc_samples;
drop policy if exists "instrument_import_rows_manage_internal" on public.instrument_import_rows;
drop policy if exists "instrument_import_rows_select_internal" on public.instrument_import_rows;
drop policy if exists "instrument_imports_manage_internal" on public.instrument_imports;
drop policy if exists "instrument_imports_select_internal" on public.instrument_imports;
drop policy if exists "internal_users_manage_test_attachments" on public.test_attachments;
drop policy if exists "test_attachments_select_by_role" on public.test_attachments;
drop policy if exists "internal_users_manage_test_definitions" on public.test_definitions;
drop policy if exists "test_definitions_select_by_role" on public.test_definitions;
drop policy if exists "lab_admins_manage_automation_rules" on public.automation_rules;
drop policy if exists "internal_users_view_automation_rules" on public.automation_rules;
drop policy if exists "internal_users_manage_workflow_tasks" on public.workflow_tasks;
drop policy if exists "workflow_tasks_select_by_role" on public.workflow_tasks;
drop policy if exists "lab_admins_manage_workflow_steps" on public.workflow_steps;
drop policy if exists "internal_users_view_workflow_steps" on public.workflow_steps;
drop policy if exists "lab_admins_manage_workflow_definitions" on public.workflow_definitions;
drop policy if exists "internal_users_view_workflow_definitions" on public.workflow_definitions;
drop policy if exists "internal_users_manage_sample_custody_events" on public.sample_custody_events;
drop policy if exists "sample_custody_events_select_by_role" on public.sample_custody_events;
drop policy if exists "internal_users_manage_sample_lifecycle_events" on public.sample_lifecycle_events;
drop policy if exists "sample_lifecycle_events_select_by_role" on public.sample_lifecycle_events;

drop trigger if exists trg_documents_updated_at on public.documents;

drop table if exists public.user_activity_logs;
drop table if exists public.notifications;
drop table if exists public.documents;
drop table if exists public.generated_reports;
drop table if exists public.qc_chart_points;
drop table if exists public.qc_samples;
drop table if exists public.instrument_import_rows;
drop table if exists public.instrument_imports;
drop table if exists public.test_attachments;
drop table if exists public.test_definitions;
drop table if exists public.automation_rules;
drop table if exists public.workflow_tasks;
drop table if exists public.workflow_steps;
drop table if exists public.workflow_definitions;
drop table if exists public.sample_custody_events;
drop table if exists public.sample_lifecycle_events;

alter table public.samples
  drop column if exists disposal_at,
  drop column if exists archived_at,
  drop column if exists submitted_at,
  drop column if exists barcode;

delete from storage.buckets where id in ('generated-reports', 'lab-documents', 'instrument-imports');

commit;
*/
