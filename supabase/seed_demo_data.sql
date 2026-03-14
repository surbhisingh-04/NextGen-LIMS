-- Run this after the demo auth users already exist in auth.users.
-- Expected emails:
-- admin.demo@nextgenlims.local
-- manager.demo@nextgenlims.local
-- technician.demo@nextgenlims.local
-- qa.demo@nextgenlims.local
-- client.demo@nextgenlims.local

begin;

insert into public.organizations (id, name, slug, industry)
values (
  '0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc10001',
  'NextGen Demo Labs',
  'nextgen-demo-labs',
  'life_sciences'
)
on conflict (id) do update
set
  name = excluded.name,
  slug = excluded.slug,
  industry = excluded.industry;

insert into public.roles (name, description)
values
  ('admin', 'Full system administrators'),
  ('lab_manager', 'Laboratory operations managers'),
  ('scientist_technician', 'Technicians and analysts performing tests'),
  ('qa_qc_manager', 'Quality assurance and quality control reviewers'),
  ('client', 'External client users')
on conflict (name) do update
set description = excluded.description;

with demo_users as (
  select *
  from (
    values
      ('admin.demo@nextgenlims.local', 'Priya Nair', 'admin'),
      ('manager.demo@nextgenlims.local', 'Marcus Lewis', 'lab_manager'),
      ('technician.demo@nextgenlims.local', 'Asha Patel', 'scientist_technician'),
      ('qa.demo@nextgenlims.local', 'Jordan Romero', 'qa_qc_manager'),
      ('client.demo@nextgenlims.local', 'Acme Pharma QA', 'client')
  ) as rows(email, full_name, role_name)
),
auth_lookup as (
  select
    du.email,
    du.full_name,
    du.role_name,
    au.id as user_id
  from demo_users du
  join auth.users au on au.email = du.email
)
insert into public.profiles (id, organization_id, full_name, role)
select
  user_id,
  '0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc10001',
  full_name,
  role_name
from auth_lookup
on conflict (id) do update
set
  organization_id = excluded.organization_id,
  full_name = excluded.full_name,
  role = excluded.role;

with auth_lookup as (
  select
    au.id as user_id,
    case au.email
      when 'admin.demo@nextgenlims.local' then 'admin'
      when 'manager.demo@nextgenlims.local' then 'lab_manager'
      when 'technician.demo@nextgenlims.local' then 'scientist_technician'
      when 'qa.demo@nextgenlims.local' then 'qa_qc_manager'
      when 'client.demo@nextgenlims.local' then 'client'
    end as role_name
  from auth.users au
  where au.email in (
    'admin.demo@nextgenlims.local',
    'manager.demo@nextgenlims.local',
    'technician.demo@nextgenlims.local',
    'qa.demo@nextgenlims.local',
    'client.demo@nextgenlims.local'
  )
)
insert into public.user_roles (user_id, role_id, assigned_by)
select
  a.user_id,
  r.id,
  (select id from auth.users where email = 'admin.demo@nextgenlims.local')
from auth_lookup a
join public.roles r on r.name = a.role_name
on conflict (user_id) do update
set role_id = excluded.role_id;

insert into public.client_profiles (user_id, organization_id, company_name, phone)
select
  au.id,
  '0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc10001',
  'Acme Pharma',
  '+1-555-0104'
from auth.users au
where au.email = 'client.demo@nextgenlims.local'
on conflict (user_id) do update
set
  organization_id = excluded.organization_id,
  company_name = excluded.company_name,
  phone = excluded.phone,
  updated_at = timezone('utc', now());

insert into public.laboratories (id, organization_id, name, site_code, type)
values
  ('0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc10002', '0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc10001', 'Chemistry Lab', 'CHEM-01', 'chemistry'),
  ('0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc10003', '0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc10001', 'Microbiology Lab', 'MICRO-01', 'microbiology')
on conflict (id) do update
set
  name = excluded.name,
  site_code = excluded.site_code,
  type = excluded.type;

insert into public.workflow_stages (id, organization_id, name, sort_order, sla_hours, automation_coverage, active_samples)
values
  ('0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc10004', '0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc10001', 'Sample Login', 1, 4, 88, 18),
  ('0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc10005', '0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc10001', 'Testing', 2, 16, 76, 34),
  ('0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc10006', '0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc10001', 'QC Review', 3, 8, 52, 11),
  ('0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc10007', '0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc10001', 'Release', 4, 6, 93, 7)
on conflict (id) do update
set
  name = excluded.name,
  sort_order = excluded.sort_order,
  sla_hours = excluded.sla_hours,
  automation_coverage = excluded.automation_coverage,
  active_samples = excluded.active_samples;

insert into public.samples (
  id,
  organization_id,
  laboratory_id,
  workflow_stage_id,
  sample_code,
  material_name,
  batch_number,
  workflow_name,
  owner_name,
  priority,
  status,
  barcode,
  received_at,
  due_at,
  submitted_at,
  metadata,
  external_client_id
)
values
(
  '0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc10008',
  '0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc10001',
  '0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc10002',
  '0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc10005',
  'RM-26-0001',
  'API Blend Alpha',
  'BCH-11872',
  'Raw Material Release',
  'Asha Patel',
  'critical',
  'in_progress',
  'BC-RM-26-0001',
  '2026-03-12T09:10:00Z',
  '2026-03-15T12:00:00Z',
  '2026-03-12T08:40:00Z',
  '{"source":"supplier_portal"}'::jsonb,
  (select id from auth.users where email = 'client.demo@nextgenlims.local')
),
(
  '0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc10009',
  '0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc10001',
  '0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc10003',
  '0f9d1d9c-41f2-4d8f-9f3c-7e3b3bc10006',
  'FG-26-0002',
  'Sterile Vial Fill',
  'LOT-55019',
  'Finished Product Release',
  'Marcus Lewis',
  'high',
  'ready_for_review',
  'BC-FG-26-0002',
  '2026-03-11T11:00:00Z',
  '2026-03-14T18:00:00Z',
  '2026-03-11T10:45:00Z',
  '{"source":"manufacturing"}'::jsonb,
  null
)
on conflict (id) do update
set
  workflow_stage_id = excluded.workflow_stage_id,
  owner_name = excluded.owner_name,
  priority = excluded.priority,
  status = excluded.status,
  external_client_id = excluded.external_client_id;

commit;
