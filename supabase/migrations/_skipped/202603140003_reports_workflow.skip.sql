-- UP
begin;

create table if not exists public.generated_reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  approved_by uuid references public.profiles(id) on delete set null,
  title text not null,
  report_type text not null,
  format text not null,
  status text not null default 'draft',
  audience text not null,
  generated_at timestamptz not null default timezone('utc', now()),
  approved_at timestamptz,
  rejected_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.report_activity (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  report_id uuid references public.generated_reports(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  actor_name text not null,
  action text not null,
  detail text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_generated_reports_org on public.generated_reports(organization_id);
create index if not exists idx_generated_reports_status on public.generated_reports(status);
create index if not exists idx_report_activity_org on public.report_activity(organization_id);
create index if not exists idx_report_activity_report on public.report_activity(report_id);

drop trigger if exists trg_generated_reports_updated_at on public.generated_reports;
create trigger trg_generated_reports_updated_at
before update on public.generated_reports
for each row
execute function public.set_updated_at();

alter table public.generated_reports enable row level security;
alter table public.report_activity enable row level security;

drop policy if exists "generated_reports_scoped_by_organization" on public.generated_reports;
create policy "generated_reports_scoped_by_organization"
on public.generated_reports
for all
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

drop policy if exists "report_activity_scoped_by_organization" on public.report_activity;
create policy "report_activity_scoped_by_organization"
on public.report_activity
for all
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

commit;

/* -- DOWN
begin;

drop policy if exists "report_activity_scoped_by_organization" on public.report_activity;
drop policy if exists "generated_reports_scoped_by_organization" on public.generated_reports;

drop trigger if exists trg_generated_reports_updated_at on public.generated_reports;

drop table if exists public.report_activity;
drop table if exists public.generated_reports;

commit;
*/
