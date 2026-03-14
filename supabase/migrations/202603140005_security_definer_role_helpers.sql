-- UP
begin;

create or replace function public.current_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id
  from public.profiles
  where id = auth.uid()
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid()
$$;

create or replace function public.is_internal_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() <> 'client', false)
$$;

create or replace function public.has_any_role(roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = any(roles), false)
$$;

create or replace function public.can_access_client_sample(
  record_organization_id uuid,
  record_client_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    record_organization_id = public.current_organization_id()
    and (
      public.is_internal_user()
      or (
        public.current_user_role() = 'client'
        and record_client_id = auth.uid()
      )
    )
$$;

commit;

-- DOWN
begin;

create or replace function public.current_organization_id()
returns uuid
language sql
stable
as $$
  select organization_id
  from public.profiles
  where id = auth.uid()
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
as $$
  select role
  from public.profiles
  where id = auth.uid()
$$;

create or replace function public.is_internal_user()
returns boolean
language sql
stable
as $$
  select coalesce(public.current_user_role() <> 'client', false)
$$;

create or replace function public.has_any_role(roles text[])
returns boolean
language sql
stable
as $$
  select coalesce(public.current_user_role() = any(roles), false)
$$;

create or replace function public.can_access_client_sample(
  record_organization_id uuid,
  record_client_id uuid
)
returns boolean
language sql
stable
as $$
  select
    record_organization_id = public.current_organization_id()
    and (
      public.is_internal_user()
      or (
        public.current_user_role() = 'client'
        and record_client_id = auth.uid()
      )
    )
$$;

commit;
