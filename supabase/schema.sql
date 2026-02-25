-- Mission Control Dashboard - Initial Supabase Schema
-- Run in Supabase SQL Editor

create extension if not exists pgcrypto;

-- Task pipeline table
create table if not exists public.task_pipeline (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null check (status in ('draft','review','approved','published')),
  assignee text not null,
  priority text not null check (priority in ('low','medium','high')),
  due_date date,
  progress int not null default 0 check (progress >= 0 and progress <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_task_pipeline_status on public.task_pipeline(status);
create index if not exists idx_task_pipeline_due_date on public.task_pipeline(due_date);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_task_pipeline_updated_at on public.task_pipeline;
create trigger trg_task_pipeline_updated_at
before update on public.task_pipeline
for each row execute function public.set_updated_at();

-- Row Level Security
alter table public.task_pipeline enable row level security;

-- Basic policy (authenticated users can read/write)
drop policy if exists "task_pipeline_select_authenticated" on public.task_pipeline;
create policy "task_pipeline_select_authenticated"
  on public.task_pipeline
  for select
  to authenticated
  using (true);

drop policy if exists "task_pipeline_insert_authenticated" on public.task_pipeline;
create policy "task_pipeline_insert_authenticated"
  on public.task_pipeline
  for insert
  to authenticated
  with check (true);

drop policy if exists "task_pipeline_update_authenticated" on public.task_pipeline;
create policy "task_pipeline_update_authenticated"
  on public.task_pipeline
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "task_pipeline_delete_authenticated" on public.task_pipeline;
create policy "task_pipeline_delete_authenticated"
  on public.task_pipeline
  for delete
  to authenticated
  using (true);

-- Seed data
insert into public.task_pipeline (name, status, assignee, priority, due_date, progress)
values
  ('Mission Control Dashboard', 'review', 'Elia', 'high', current_date + 4, 80),
  ('Tischtennis Tracker', 'published', 'Elia', 'high', current_date + 2, 100),
  ('GitHub Pages Fix', 'review', 'Elia', 'medium', current_date + 1, 60),
  ('Power Platform Spec', 'approved', 'Sara', 'medium', current_date + 7, 90)
on conflict do nothing;
