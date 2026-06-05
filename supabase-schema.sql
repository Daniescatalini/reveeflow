create table if not exists public.reveeflow_workspaces (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.reveeflow_workspaces enable row level security;

drop policy if exists "Users can read their ReveeFlow workspace" on public.reveeflow_workspaces;
create policy "Users can read their ReveeFlow workspace"
  on public.reveeflow_workspaces
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can save their ReveeFlow workspace" on public.reveeflow_workspaces;
create policy "Users can save their ReveeFlow workspace"
  on public.reveeflow_workspaces
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their ReveeFlow workspace" on public.reveeflow_workspaces;
create policy "Users can update their ReveeFlow workspace"
  on public.reveeflow_workspaces
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Flow IA',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_user_memory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  value jsonb not null default '{}'::jsonb,
  confidence numeric not null default 0.5,
  updated_at timestamptz not null default now(),
  unique (user_id, key)
);

create table if not exists public.ai_project_patterns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  service_type text,
  pattern jsonb not null default '{}'::jsonb,
  confidence numeric not null default 0.5,
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_task_patterns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_type text,
  pattern jsonb not null default '{}'::jsonb,
  confidence numeric not null default 0.5,
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_estimation_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id text,
  service_type text,
  estimated_hours numeric,
  actual_hours numeric,
  estimated_delivery date,
  actual_delivery date,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  severity text not null default 'info',
  related_project_id text,
  related_task_id text,
  related_event_id text,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists public.ai_timeline_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  suggestion_payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.ai_user_memory enable row level security;
alter table public.ai_project_patterns enable row level security;
alter table public.ai_task_patterns enable row level security;
alter table public.ai_estimation_history enable row level security;
alter table public.ai_recommendations enable row level security;
alter table public.ai_timeline_suggestions enable row level security;

alter table public.ai_recommendations
  add column if not exists related_event_id text;

drop policy if exists "Users manage own ai conversations" on public.ai_conversations;
create policy "Users manage own ai conversations" on public.ai_conversations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own ai messages" on public.ai_messages;
create policy "Users manage own ai messages" on public.ai_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own ai user memory" on public.ai_user_memory;
create policy "Users manage own ai user memory" on public.ai_user_memory
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own ai project patterns" on public.ai_project_patterns;
create policy "Users manage own ai project patterns" on public.ai_project_patterns
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own ai task patterns" on public.ai_task_patterns;
create policy "Users manage own ai task patterns" on public.ai_task_patterns
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own ai estimation history" on public.ai_estimation_history;
create policy "Users manage own ai estimation history" on public.ai_estimation_history
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own ai recommendations" on public.ai_recommendations;
create policy "Users manage own ai recommendations" on public.ai_recommendations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own ai timeline suggestions" on public.ai_timeline_suggestions;
create policy "Users manage own ai timeline suggestions" on public.ai_timeline_suggestions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.google_calendar_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'google',
  calendar_email text,
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  sync_status text not null default 'pending',
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

create table if not exists public.google_calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  google_event_id text,
  title text not null,
  type text not null default 'evento',
  starts_at timestamptz,
  ends_at timestamptz,
  location text,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, google_event_id)
);

create table if not exists public.reveeflow_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  actor_name text,
  category text not null,
  title text not null,
  message text not null,
  related_task_id text,
  related_project_id text,
  related_event_id text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.google_calendar_connections enable row level security;
alter table public.google_calendar_events enable row level security;
alter table public.reveeflow_notifications enable row level security;

drop policy if exists "Users manage own google calendar connections" on public.google_calendar_connections;
create policy "Users manage own google calendar connections"
  on public.google_calendar_connections
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own google calendar events" on public.google_calendar_events;
create policy "Users manage own google calendar events"
  on public.google_calendar_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own ReveeFlow notifications" on public.reveeflow_notifications;
create policy "Users manage own ReveeFlow notifications"
  on public.reveeflow_notifications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
