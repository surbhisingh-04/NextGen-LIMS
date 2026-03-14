-- UP
begin;

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  permission_key text not null unique,
  description text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (role_id, permission_id)
);

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete restrict,
  assigned_by uuid references auth.users(id) on delete set null,
  assigned_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.client_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  company_name text not null,
  phone text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_user_roles_role_id on public.user_roles(role_id);
create index if not exists idx_client_profiles_organization_id on public.client_profiles(organization_id);

insert into public.roles (name, description)
values
  ('admin', 'Full system administrators'),
  ('lab_manager', 'Laboratory operations managers'),
  ('scientist_technician', 'Technicians and analysts performing tests'),
  ('qa_qc_manager', 'Quality assurance and quality control reviewers'),
  ('client', 'External client users')
on conflict (name) do update
set description = excluded.description;

insert into public.permissions (permission_key, description)
values
  ('manage_users', 'Create and manage user accounts'),
  ('manage_roles', 'Assign and review user roles'),
  ('configure_workflows', 'Configure workflow stages and routing'),
  ('access_audit_logs', 'Review audit and security logs'),
  ('assign_tests', 'Assign tests and work queues'),
  ('manage_inventory', 'Manage inventory and stock'),
  ('view_analytics', 'Access analytics and forecasting'),
  ('perform_tests', 'Execute assigned tests'),
  ('enter_results', 'Enter test results'),
  ('review_results', 'Review pending results'),
  ('approve_results', 'Approve or reject results'),
  ('create_deviations', 'Create deviation and quality records'),
  ('submit_samples', 'Submit external samples'),
  ('view_own_samples', 'View own client samples'),
  ('download_reports', 'Download released reports'),
  ('manage_account', 'Manage own account and organization profile')
on conflict (permission_key) do update
set description = excluded.description;

with permission_map as (
  select *
  from (
    values
      ('admin', 'manage_users'),
      ('admin', 'manage_roles'),
      ('admin', 'configure_workflows'),
      ('admin', 'access_audit_logs'),
      ('admin', 'assign_tests'),
      ('admin', 'manage_inventory'),
      ('admin', 'view_analytics'),
      ('admin', 'review_results'),
      ('admin', 'approve_results'),
      ('admin', 'create_deviations'),
      ('lab_manager', 'assign_tests'),
      ('lab_manager', 'manage_inventory'),
      ('lab_manager', 'view_analytics'),
      ('lab_manager', 'configure_workflows'),
      ('scientist_technician', 'perform_tests'),
      ('scientist_technician', 'enter_results'),
      ('qa_qc_manager', 'review_results'),
      ('qa_qc_manager', 'approve_results'),
      ('qa_qc_manager', 'create_deviations'),
      ('client', 'submit_samples'),
      ('client', 'view_own_samples'),
      ('client', 'download_reports'),
      ('client', 'manage_account')
  ) as mappings(role_name, permission_key)
)
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from permission_map mappings
join public.roles r on r.name = mappings.role_name
join public.permissions p on p.permission_key = mappings.permission_key
on conflict do nothing;

insert into public.user_roles (user_id, role_id, assigned_by)
select p.id, r.id, p.id
from public.profiles p
join public.roles r on r.name = p.role
on conflict (user_id) do update
set role_id = excluded.role_id;

insert into public.client_profiles (user_id, organization_id, company_name, phone)
select
  p.id,
  p.organization_id,
  o.name,
  null
from public.profiles p
join public.organizations o on o.id = p.organization_id
where p.role = 'client'
on conflict (user_id) do nothing;

create or replace function public.generate_unique_org_slug(base_name text)
returns text
language plpgsql
as $$
declare
  base_slug text;
  candidate_slug text;
  suffix integer := 0;
begin
  base_slug := regexp_replace(lower(coalesce(base_name, 'organization')), '[^a-z0-9]+', '-', 'g');
  base_slug := trim(both '-' from base_slug);

  if base_slug = '' then
    base_slug := 'organization';
  end if;

  candidate_slug := base_slug;

  while exists (
    select 1
    from public.organizations
    where slug = candidate_slug
  ) loop
    suffix := suffix + 1;
    candidate_slug := base_slug || '-' || suffix::text;
  end loop;

  return candidate_slug;
end;
$$;

create or replace function public.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text := coalesce(nullif(new.raw_user_meta_data ->> 'role', ''), 'client');
  assigned_role text;
  requested_org_id_text text := nullif(new.raw_user_meta_data ->> 'organization_id', '');
  requested_org_id uuid;
  resolved_org_id uuid;
  resolved_role_id uuid;
  resolved_full_name text := coalesce(
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'name', ''),
    split_part(coalesce(new.email, 'user'), '@', 1)
  );
  resolved_company text := nullif(new.raw_user_meta_data ->> 'company_name', '');
  resolved_phone text := nullif(new.raw_user_meta_data ->> 'phone', '');
  resolved_org_name text;
begin
  assigned_role := case
    when requested_role in ('admin', 'lab_manager', 'scientist_technician', 'qa_qc_manager', 'client') then requested_role
    else 'client'
  end;

  if requested_org_id_text is not null then
    begin
      requested_org_id := requested_org_id_text::uuid;
    exception
      when invalid_text_representation then
        requested_org_id := null;
    end;
  end if;

  if requested_org_id is not null then
    select id
    into resolved_org_id
    from public.organizations
    where id = requested_org_id;
  end if;

  if resolved_org_id is null then
    resolved_org_name := coalesce(resolved_company, resolved_full_name || ' Organization');

    insert into public.organizations (name, slug)
    values (resolved_org_name, public.generate_unique_org_slug(resolved_org_name))
    returning id into resolved_org_id;
  end if;

  insert into public.profiles (id, organization_id, full_name, role)
  values (new.id, resolved_org_id, resolved_full_name, assigned_role)
  on conflict (id) do update
  set
    organization_id = excluded.organization_id,
    full_name = excluded.full_name,
    role = excluded.role;

  select id
  into resolved_role_id
  from public.roles
  where name = assigned_role;

  if resolved_role_id is not null then
    insert into public.user_roles (user_id, role_id, assigned_by)
    values (new.id, resolved_role_id, new.id)
    on conflict (user_id) do update
    set
      role_id = excluded.role_id,
      assigned_at = timezone('utc', now());
  end if;

  if assigned_role = 'client' then
    insert into public.client_profiles (user_id, organization_id, company_name, phone)
    values (
      new.id,
      resolved_org_id,
      coalesce(resolved_company, resolved_org_name),
      resolved_phone
    )
    on conflict (user_id) do update
    set
      organization_id = excluded.organization_id,
      company_name = excluded.company_name,
      phone = excluded.phone,
      updated_at = timezone('utc', now());
  end if;

  return new;
end;
$$;

drop trigger if exists trg_handle_auth_user_created on auth.users;
create trigger trg_handle_auth_user_created
after insert on auth.users
for each row
execute function public.handle_auth_user_created();

create or replace function public.current_user_role()
returns text
language sql
stable
as $$
  select coalesce(
    (
      select r.name
      from public.user_roles ur
      join public.roles r on r.id = ur.role_id
      where ur.user_id = auth.uid()
      limit 1
    ),
    (
      select p.role
      from public.profiles p
      where p.id = auth.uid()
      limit 1
    )
  )
$$;

create or replace function public.has_permission(permission_name text)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.role_permissions rp on rp.role_id = ur.role_id
    join public.permissions p on p.id = rp.permission_id
    where ur.user_id = auth.uid()
      and p.permission_key = permission_name
  )
$$;

alter table public.client_profiles enable row level security;

drop policy if exists "client_profiles_select_policy" on public.client_profiles;
create policy "client_profiles_select_policy"
on public.client_profiles
for select
using (
  user_id = auth.uid()
  or (
    organization_id = public.current_organization_id()
    and public.has_any_role(array['admin', 'lab_manager', 'qa_qc_manager'])
  )
);

drop policy if exists "client_profiles_update_policy" on public.client_profiles;
create policy "client_profiles_update_policy"
on public.client_profiles
for update
using (
  user_id = auth.uid()
  or (
    organization_id = public.current_organization_id()
    and public.has_any_role(array['admin'])
  )
)
with check (
  user_id = auth.uid()
  or (
    organization_id = public.current_organization_id()
    and public.has_any_role(array['admin'])
  )
);

commit;

/* -- DOWN
begin;

drop policy if exists "client_profiles_update_policy" on public.client_profiles;
drop policy if exists "client_profiles_select_policy" on public.client_profiles;

drop trigger if exists trg_handle_auth_user_created on auth.users;

drop function if exists public.has_permission(text);
drop function if exists public.handle_auth_user_created();
drop function if exists public.generate_unique_org_slug(text);

create or replace function public.current_user_role()
returns text
language sql
stable
as $$
  select role
  from public.profiles
  where id = auth.uid()
$$;

drop table if exists public.client_profiles;
drop table if exists public.user_roles;
drop table if exists public.role_permissions;
drop table if exists public.permissions;
drop table if exists public.roles;

commit;
*/
