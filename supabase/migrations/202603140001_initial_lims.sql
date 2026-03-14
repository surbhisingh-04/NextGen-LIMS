-- UP
begin;

create extension if not exists "pgcrypto";

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  industry text not null default 'life_sciences',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  full_name text not null,
  role text not null default 'analyst',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.laboratories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  site_code text not null,
  type text not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, site_code)
);

create table if not exists public.workflow_stages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  sla_hours integer not null default 0,
  automation_coverage integer not null default 0,
  active_samples integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, name)
);

create table if not exists public.samples (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  laboratory_id uuid not null references public.laboratories(id) on delete restrict,
  workflow_stage_id uuid references public.workflow_stages(id) on delete set null,
  sample_code text not null,
  material_name text not null,
  batch_number text not null,
  workflow_name text not null,
  owner_name text,
  priority text not null default 'medium',
  status text not null default 'registered',
  received_at timestamptz not null default timezone('utc', now()),
  due_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, sample_code)
);

create table if not exists public.test_results (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  sample_id uuid not null references public.samples(id) on delete cascade,
  method_name text not null,
  analyst_name text,
  result_value text not null,
  specification text not null,
  status text not null default 'review',
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  sku text not null,
  name text not null,
  category text not null,
  lot_number text,
  quantity numeric(12,2) not null default 0,
  reorder_level numeric(12,2) not null default 0,
  location text,
  expires_at date,
  created_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, sku)
);

create table if not exists public.quality_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  sample_id uuid references public.samples(id) on delete set null,
  event_type text not null,
  title text not null,
  severity text not null default 'minor',
  owner_name text,
  status text not null default 'open',
  due_at date,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.compliance_reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  framework text not null,
  generated_at timestamptz not null default timezone('utc', now()),
  status text not null default 'draft',
  score integer not null default 0,
  storage_path text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  entity_name text not null,
  entity_id uuid,
  action text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_samples_updated_at on public.samples;
create trigger trg_samples_updated_at
before update on public.samples
for each row
execute function public.set_updated_at();

create index if not exists idx_profiles_organization_id on public.profiles(organization_id);
create index if not exists idx_laboratories_organization_id on public.laboratories(organization_id);
create index if not exists idx_workflow_stages_organization_id on public.workflow_stages(organization_id);
create index if not exists idx_samples_organization_id on public.samples(organization_id);
create index if not exists idx_samples_status on public.samples(status);
create index if not exists idx_test_results_sample_id on public.test_results(sample_id);
create index if not exists idx_inventory_items_organization_id on public.inventory_items(organization_id);
create index if not exists idx_quality_events_organization_id on public.quality_events(organization_id);
create index if not exists idx_compliance_reports_organization_id on public.compliance_reports(organization_id);
create index if not exists idx_audit_events_organization_id on public.audit_events(organization_id);

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.laboratories enable row level security;
alter table public.workflow_stages enable row level security;
alter table public.samples enable row level security;
alter table public.test_results enable row level security;
alter table public.inventory_items enable row level security;
alter table public.quality_events enable row level security;
alter table public.compliance_reports enable row level security;
alter table public.audit_events enable row level security;

create or replace function public.current_organization_id()
returns uuid
language sql
stable
as $$
  select organization_id
  from public.profiles
  where id = auth.uid()
$$;

drop policy if exists "organization_members_can_select_organizations" on public.organizations;
create policy "organization_members_can_select_organizations"
on public.organizations
for select
using (id = public.current_organization_id());

drop policy if exists "profiles_are_visible_within_organization" on public.profiles;
create policy "profiles_are_visible_within_organization"
on public.profiles
for select
using (organization_id = public.current_organization_id());

drop policy if exists "profiles_manage_their_own_record" on public.profiles;
create policy "profiles_manage_their_own_record"
on public.profiles
for all
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "laboratories_scoped_by_organization" on public.laboratories;
create policy "laboratories_scoped_by_organization"
on public.laboratories
for all
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

drop policy if exists "workflow_stages_scoped_by_organization" on public.workflow_stages;
create policy "workflow_stages_scoped_by_organization"
on public.workflow_stages
for all
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

drop policy if exists "samples_scoped_by_organization" on public.samples;
create policy "samples_scoped_by_organization"
on public.samples
for all
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

drop policy if exists "test_results_scoped_by_organization" on public.test_results;
create policy "test_results_scoped_by_organization"
on public.test_results
for all
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

drop policy if exists "inventory_items_scoped_by_organization" on public.inventory_items;
create policy "inventory_items_scoped_by_organization"
on public.inventory_items
for all
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

drop policy if exists "quality_events_scoped_by_organization" on public.quality_events;
create policy "quality_events_scoped_by_organization"
on public.quality_events
for all
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

drop policy if exists "compliance_reports_scoped_by_organization" on public.compliance_reports;
create policy "compliance_reports_scoped_by_organization"
on public.compliance_reports
for all
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

drop policy if exists "audit_events_scoped_by_organization" on public.audit_events;
create policy "audit_events_scoped_by_organization"
on public.audit_events
for all
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

insert into storage.buckets (id, name, public)
values ('compliance-reports', 'compliance-reports', false)
on conflict (id) do nothing;

commit;

/* -- DOWN
begin;

drop policy if exists "audit_events_scoped_by_organization" on public.audit_events;
drop policy if exists "compliance_reports_scoped_by_organization" on public.compliance_reports;
drop policy if exists "quality_events_scoped_by_organization" on public.quality_events;
drop policy if exists "inventory_items_scoped_by_organization" on public.inventory_items;
drop policy if exists "test_results_scoped_by_organization" on public.test_results;
drop policy if exists "samples_scoped_by_organization" on public.samples;
drop policy if exists "workflow_stages_scoped_by_organization" on public.workflow_stages;
drop policy if exists "laboratories_scoped_by_organization" on public.laboratories;
drop policy if exists "profiles_manage_their_own_record" on public.profiles;
drop policy if exists "profiles_are_visible_within_organization" on public.profiles;
drop policy if exists "organization_members_can_select_organizations" on public.organizations;

drop trigger if exists trg_samples_updated_at on public.samples;
drop function if exists public.set_updated_at();
drop function if exists public.current_organization_id();

drop table if exists public.audit_events;
drop table if exists public.compliance_reports;
drop table if exists public.quality_events;
drop table if exists public.inventory_items;
drop table if exists public.test_results;
drop table if exists public.samples;
drop table if exists public.workflow_stages;
drop table if exists public.laboratories;
drop table if exists public.profiles;
drop table if exists public.organizations;

delete from storage.buckets where id = 'compliance-reports';

commit;
*/
