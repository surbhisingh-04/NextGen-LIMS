-- UP
begin;

alter table public.profiles
  alter column role drop default;

update public.profiles
set role = case
  when role in ('analyst', 'scientist', 'technician') then 'scientist_technician'
  when role in ('qa_manager', 'qc_manager', 'qa_qc') then 'qa_qc_manager'
  when role in ('manager', 'labmanager') then 'lab_manager'
  when role = 'client' then 'client'
  else 'admin'
end
where role not in ('admin', 'lab_manager', 'scientist_technician', 'qa_qc_manager', 'client');

alter table public.profiles
  alter column role set default 'scientist_technician';

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('admin', 'lab_manager', 'scientist_technician', 'qa_qc_manager', 'client'));

alter table public.samples
  add column if not exists external_client_id uuid references auth.users(id) on delete set null;

alter table public.compliance_reports
  add column if not exists external_client_id uuid references auth.users(id) on delete set null;

create index if not exists idx_samples_external_client_id on public.samples(external_client_id);
create index if not exists idx_compliance_reports_external_client_id on public.compliance_reports(external_client_id);

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

drop policy if exists "organization_members_can_select_organizations" on public.organizations;
create policy "organization_members_can_select_organizations"
on public.organizations
for select
using (id = public.current_organization_id());

drop policy if exists "organization_admins_can_update_organizations" on public.organizations;
create policy "organization_admins_can_update_organizations"
on public.organizations
for update
using (
  id = public.current_organization_id()
  and public.has_any_role(array['admin'])
)
with check (
  id = public.current_organization_id()
  and public.has_any_role(array['admin'])
);

drop policy if exists "profiles_are_visible_within_organization" on public.profiles;
drop policy if exists "profiles_manage_their_own_record" on public.profiles;
drop policy if exists "privileged_roles_can_view_profiles" on public.profiles;
drop policy if exists "privileged_roles_can_manage_profiles" on public.profiles;
create policy "privileged_roles_can_view_profiles"
on public.profiles
for select
using (
  organization_id = public.current_organization_id()
  and (
    id = auth.uid()
    or public.has_any_role(array['admin', 'lab_manager', 'qa_qc_manager'])
  )
);

create policy "privileged_roles_can_manage_profiles"
on public.profiles
for all
using (
  organization_id = public.current_organization_id()
  and (
    id = auth.uid()
    or public.has_any_role(array['admin'])
  )
)
with check (
  organization_id = public.current_organization_id()
  and (
    id = auth.uid()
    or public.has_any_role(array['admin'])
  )
);

drop policy if exists "laboratories_scoped_by_organization" on public.laboratories;
drop policy if exists "internal_users_can_view_laboratories" on public.laboratories;
drop policy if exists "lab_admins_can_manage_laboratories" on public.laboratories;
create policy "internal_users_can_view_laboratories"
on public.laboratories
for select
using (
  organization_id = public.current_organization_id()
  and public.is_internal_user()
);

create policy "lab_admins_can_manage_laboratories"
on public.laboratories
for all
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager'])
)
with check (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager'])
);

drop policy if exists "workflow_stages_scoped_by_organization" on public.workflow_stages;
drop policy if exists "internal_users_can_view_workflow_stages" on public.workflow_stages;
drop policy if exists "lab_admins_can_manage_workflow_stages" on public.workflow_stages;
create policy "internal_users_can_view_workflow_stages"
on public.workflow_stages
for select
using (
  organization_id = public.current_organization_id()
  and public.is_internal_user()
);

create policy "lab_admins_can_manage_workflow_stages"
on public.workflow_stages
for all
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager'])
)
with check (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager'])
);

drop policy if exists "samples_scoped_by_organization" on public.samples;
drop policy if exists "samples_select_by_role" on public.samples;
drop policy if exists "operations_roles_can_insert_samples" on public.samples;
drop policy if exists "operations_roles_can_update_samples" on public.samples;
drop policy if exists "admins_and_lab_managers_can_delete_samples" on public.samples;
create policy "samples_select_by_role"
on public.samples
for select
using (public.can_access_client_sample(organization_id, external_client_id));

create policy "operations_roles_can_insert_samples"
on public.samples
for insert
with check (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'scientist_technician'])
);

create policy "operations_roles_can_update_samples"
on public.samples
for update
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'scientist_technician', 'qa_qc_manager'])
)
with check (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'scientist_technician', 'qa_qc_manager'])
);

create policy "admins_and_lab_managers_can_delete_samples"
on public.samples
for delete
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager'])
);

drop policy if exists "test_results_scoped_by_organization" on public.test_results;
drop policy if exists "test_results_select_by_role" on public.test_results;
drop policy if exists "operations_roles_can_insert_test_results" on public.test_results;
drop policy if exists "operations_roles_can_update_test_results" on public.test_results;
drop policy if exists "admins_and_lab_managers_can_delete_test_results" on public.test_results;
create policy "test_results_select_by_role"
on public.test_results
for select
using (
  exists (
    select 1
    from public.samples s
    where s.id = test_results.sample_id
      and public.can_access_client_sample(s.organization_id, s.external_client_id)
  )
);

create policy "operations_roles_can_insert_test_results"
on public.test_results
for insert
with check (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'scientist_technician', 'qa_qc_manager'])
);

create policy "operations_roles_can_update_test_results"
on public.test_results
for update
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'scientist_technician', 'qa_qc_manager'])
)
with check (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'scientist_technician', 'qa_qc_manager'])
);

create policy "admins_and_lab_managers_can_delete_test_results"
on public.test_results
for delete
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager'])
);

drop policy if exists "inventory_items_scoped_by_organization" on public.inventory_items;
drop policy if exists "internal_users_can_view_inventory_items" on public.inventory_items;
drop policy if exists "operations_roles_can_manage_inventory_items" on public.inventory_items;
drop policy if exists "admins_and_lab_managers_can_delete_inventory_items" on public.inventory_items;
create policy "internal_users_can_view_inventory_items"
on public.inventory_items
for select
using (
  organization_id = public.current_organization_id()
  and public.is_internal_user()
);

create policy "operations_roles_can_manage_inventory_items"
on public.inventory_items
for insert
with check (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'scientist_technician'])
);

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'inventory_items'
      and policyname = 'operations_roles_can_update_inventory_items'
  ) then
    create policy "operations_roles_can_update_inventory_items"
    on public.inventory_items
    for update
    using (
      organization_id = public.current_organization_id()
      and public.has_any_role(array['admin', 'lab_manager', 'scientist_technician'])
    )
    with check (
      organization_id = public.current_organization_id()
      and public.has_any_role(array['admin', 'lab_manager', 'scientist_technician'])
    );
  end if;
end
$$;

create policy "admins_and_lab_managers_can_delete_inventory_items"
on public.inventory_items
for delete
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager'])
);

drop policy if exists "quality_events_scoped_by_organization" on public.quality_events;
drop policy if exists "internal_users_can_view_quality_events" on public.quality_events;
drop policy if exists "operations_roles_can_insert_quality_events" on public.quality_events;
drop policy if exists "quality_roles_can_update_quality_events" on public.quality_events;
drop policy if exists "admins_and_qa_can_delete_quality_events" on public.quality_events;
create policy "internal_users_can_view_quality_events"
on public.quality_events
for select
using (
  organization_id = public.current_organization_id()
  and public.is_internal_user()
);

create policy "operations_roles_can_insert_quality_events"
on public.quality_events
for insert
with check (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'scientist_technician', 'qa_qc_manager'])
);

create policy "quality_roles_can_update_quality_events"
on public.quality_events
for update
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'qa_qc_manager'])
)
with check (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'lab_manager', 'qa_qc_manager'])
);

create policy "admins_and_qa_can_delete_quality_events"
on public.quality_events
for delete
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'qa_qc_manager'])
);

drop policy if exists "compliance_reports_scoped_by_organization" on public.compliance_reports;
drop policy if exists "compliance_reports_select_by_role" on public.compliance_reports;
drop policy if exists "qa_roles_can_insert_compliance_reports" on public.compliance_reports;
drop policy if exists "qa_roles_can_update_compliance_reports" on public.compliance_reports;
drop policy if exists "admins_can_delete_compliance_reports" on public.compliance_reports;
create policy "compliance_reports_select_by_role"
on public.compliance_reports
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

create policy "qa_roles_can_insert_compliance_reports"
on public.compliance_reports
for insert
with check (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'qa_qc_manager'])
);

create policy "qa_roles_can_update_compliance_reports"
on public.compliance_reports
for update
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'qa_qc_manager'])
)
with check (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'qa_qc_manager'])
);

create policy "admins_can_delete_compliance_reports"
on public.compliance_reports
for delete
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin'])
);

drop policy if exists "audit_events_scoped_by_organization" on public.audit_events;
drop policy if exists "quality_roles_can_view_audit_events" on public.audit_events;
drop policy if exists "internal_users_can_insert_audit_events" on public.audit_events;
drop policy if exists "admins_can_delete_audit_events" on public.audit_events;
create policy "quality_roles_can_view_audit_events"
on public.audit_events
for select
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin', 'qa_qc_manager'])
);

create policy "internal_users_can_insert_audit_events"
on public.audit_events
for insert
with check (
  organization_id = public.current_organization_id()
  and public.is_internal_user()
);

create policy "admins_can_delete_audit_events"
on public.audit_events
for delete
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['admin'])
);

drop policy if exists "internal_users_manage_compliance_storage" on storage.objects;
drop policy if exists "authorized_users_read_compliance_storage" on storage.objects;
create policy "authorized_users_read_compliance_storage"
on storage.objects
for select
using (
  bucket_id = 'compliance-reports'
  and exists (
    select 1
    from public.compliance_reports cr
    where cr.storage_path = storage.objects.name
      and cr.organization_id = public.current_organization_id()
      and (
        public.has_any_role(array['admin', 'lab_manager', 'qa_qc_manager'])
        or (
          public.current_user_role() = 'client'
          and cr.external_client_id = auth.uid()
        )
      )
  )
);

create policy "internal_users_manage_compliance_storage"
on storage.objects
for all
using (
  bucket_id = 'compliance-reports'
  and public.has_any_role(array['admin', 'qa_qc_manager'])
)
with check (
  bucket_id = 'compliance-reports'
  and public.has_any_role(array['admin', 'qa_qc_manager'])
);

commit;

/* -- DOWN
begin;

drop policy if exists "internal_users_manage_compliance_storage" on storage.objects;
drop policy if exists "authorized_users_read_compliance_storage" on storage.objects;

drop policy if exists "admins_can_delete_audit_events" on public.audit_events;
drop policy if exists "internal_users_can_insert_audit_events" on public.audit_events;
drop policy if exists "quality_roles_can_view_audit_events" on public.audit_events;

drop policy if exists "admins_can_delete_compliance_reports" on public.compliance_reports;
drop policy if exists "qa_roles_can_update_compliance_reports" on public.compliance_reports;
drop policy if exists "qa_roles_can_insert_compliance_reports" on public.compliance_reports;
drop policy if exists "compliance_reports_select_by_role" on public.compliance_reports;

drop policy if exists "admins_and_qa_can_delete_quality_events" on public.quality_events;
drop policy if exists "quality_roles_can_update_quality_events" on public.quality_events;
drop policy if exists "operations_roles_can_insert_quality_events" on public.quality_events;
drop policy if exists "internal_users_can_view_quality_events" on public.quality_events;

drop policy if exists "admins_and_lab_managers_can_delete_inventory_items" on public.inventory_items;
drop policy if exists "operations_roles_can_update_inventory_items" on public.inventory_items;
drop policy if exists "operations_roles_can_manage_inventory_items" on public.inventory_items;
drop policy if exists "internal_users_can_view_inventory_items" on public.inventory_items;

drop policy if exists "admins_and_lab_managers_can_delete_test_results" on public.test_results;
drop policy if exists "operations_roles_can_update_test_results" on public.test_results;
drop policy if exists "operations_roles_can_insert_test_results" on public.test_results;
drop policy if exists "test_results_select_by_role" on public.test_results;

drop policy if exists "admins_and_lab_managers_can_delete_samples" on public.samples;
drop policy if exists "operations_roles_can_update_samples" on public.samples;
drop policy if exists "operations_roles_can_insert_samples" on public.samples;
drop policy if exists "samples_select_by_role" on public.samples;

drop policy if exists "lab_admins_can_manage_workflow_stages" on public.workflow_stages;
drop policy if exists "internal_users_can_view_workflow_stages" on public.workflow_stages;

drop policy if exists "lab_admins_can_manage_laboratories" on public.laboratories;
drop policy if exists "internal_users_can_view_laboratories" on public.laboratories;

drop policy if exists "privileged_roles_can_manage_profiles" on public.profiles;
drop policy if exists "privileged_roles_can_view_profiles" on public.profiles;

drop policy if exists "organization_admins_can_update_organizations" on public.organizations;
drop policy if exists "organization_members_can_select_organizations" on public.organizations;

drop function if exists public.can_access_client_sample(uuid, uuid);
drop function if exists public.has_any_role(text[]);
drop function if exists public.is_internal_user();
drop function if exists public.current_user_role();

alter table public.compliance_reports
  drop column if exists external_client_id;

alter table public.samples
  drop column if exists external_client_id;

alter table public.profiles
  drop constraint if exists profiles_role_check;

update public.profiles
set role = 'analyst'
where role in ('scientist_technician', 'client');

update public.profiles
set role = 'manager'
where role = 'lab_manager';

update public.profiles
set role = 'qa_manager'
where role = 'qa_qc_manager';

update public.profiles
set role = 'admin'
where role = 'admin';

alter table public.profiles
  alter column role set default 'analyst';

create policy "organization_members_can_select_organizations"
on public.organizations
for select
using (id = public.current_organization_id());

create policy "profiles_are_visible_within_organization"
on public.profiles
for select
using (organization_id = public.current_organization_id());

create policy "profiles_manage_their_own_record"
on public.profiles
for all
using (id = auth.uid())
with check (id = auth.uid());

create policy "laboratories_scoped_by_organization"
on public.laboratories
for all
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "workflow_stages_scoped_by_organization"
on public.workflow_stages
for all
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "samples_scoped_by_organization"
on public.samples
for all
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "test_results_scoped_by_organization"
on public.test_results
for all
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "inventory_items_scoped_by_organization"
on public.inventory_items
for all
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "quality_events_scoped_by_organization"
on public.quality_events
for all
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "compliance_reports_scoped_by_organization"
on public.compliance_reports
for all
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "audit_events_scoped_by_organization"
on public.audit_events
for all
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

commit;
*/
