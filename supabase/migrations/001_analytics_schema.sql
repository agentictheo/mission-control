-- Mission Control analytics schema
-- Run this in Supabase SQL Editor for project:
-- https://fywmglfnjkoopcvnzvoy.supabase.co

create extension if not exists pgcrypto;

create table if not exists public.system_health (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  gateway_status text,
  canvas_status text,
  agents_status text,
  cron_status text,
  database_status text,
  database_ping_ms integer
);

create table if not exists public.agent_status (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  agent_id text,
  agent_name text,
  status text,
  session_count integer,
  last_activity timestamptz,
  token_usage_haiku integer,
  token_usage_sonnet integer,
  token_usage_opus integer
);

create table if not exists public.cron_jobs (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  job_id text,
  job_name text,
  schedule text,
  last_run timestamptz,
  next_run timestamptz,
  health_status text,
  run_duration_ms integer
);

create table if not exists public.model_usage (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  bot_name text,
  model text,
  tokens_today integer,
  tokens_total bigint,
  cost_estimate numeric(10,4),
  daily_budget_percent numeric(5,2)
);

create table if not exists public.tasks (
  id bigserial primary key,
  task_id text unique,
  task_name text,
  status text,
  assignee text,
  due_date date,
  priority text,
  progress_percent integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.session_logs (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  session_id text,
  agent_id text,
  model_used text,
  tokens_used integer,
  context_tokens integer,
  cost numeric(10,4)
);

create index if not exists idx_system_health_created_at on public.system_health (created_at desc);
create index if not exists idx_agent_status_created_at on public.agent_status (created_at desc);
create index if not exists idx_cron_jobs_created_at on public.cron_jobs (created_at desc);
create index if not exists idx_model_usage_created_at on public.model_usage (created_at desc);
create index if not exists idx_session_logs_created_at on public.session_logs (created_at desc);
create index if not exists idx_tasks_status on public.tasks (status);

alter table public.system_health enable row level security;
alter table public.agent_status enable row level security;
alter table public.cron_jobs enable row level security;
alter table public.model_usage enable row level security;
alter table public.tasks enable row level security;
alter table public.session_logs enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'system_health' and policyname = 'analytics_insert_system_health'
  ) then
    create policy analytics_insert_system_health on public.system_health for insert to anon with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'agent_status' and policyname = 'analytics_insert_agent_status'
  ) then
    create policy analytics_insert_agent_status on public.agent_status for insert to anon with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'cron_jobs' and policyname = 'analytics_insert_cron_jobs'
  ) then
    create policy analytics_insert_cron_jobs on public.cron_jobs for insert to anon with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'model_usage' and policyname = 'analytics_insert_model_usage'
  ) then
    create policy analytics_insert_model_usage on public.model_usage for insert to anon with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'tasks' and policyname = 'analytics_insert_tasks'
  ) then
    create policy analytics_insert_tasks on public.tasks for insert to anon with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'tasks' and policyname = 'analytics_update_tasks'
  ) then
    create policy analytics_update_tasks on public.tasks for update to anon using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'session_logs' and policyname = 'analytics_insert_session_logs'
  ) then
    create policy analytics_insert_session_logs on public.session_logs for insert to anon with check (true);
  end if;
end
$$;
