-- UP
begin;

alter table public.generated_reports
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

commit;

-- DOWN
begin;

alter table public.generated_reports
  drop column if exists updated_at;

commit;
