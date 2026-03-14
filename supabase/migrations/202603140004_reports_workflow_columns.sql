-- UP
begin;

alter table public.generated_reports
  add column if not exists approved_by uuid references public.profiles(id) on delete set null,
  add column if not exists approved_at timestamptz,
  add column if not exists rejected_at timestamptz,
  add column if not exists rejection_reason text;

commit;

-- DOWN
begin;

alter table public.generated_reports
  drop column if exists rejection_reason,
  drop column if exists rejected_at,
  drop column if exists approved_at,
  drop column if exists approved_by;

commit;
