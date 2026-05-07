-- ─── Run this in Supabase SQL Editor ─────────────────────────────────────────

-- 1. API Keys table
create table if not exists api_keys (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  key text unique not null,
  tier text default 'free',
  request_count bigint default 0,
  error_count bigint default 0,
  is_active boolean default true,
  created_at timestamp default now()
);

-- 2. Request logs table
create table if not exists request_logs (
  id uuid default gen_random_uuid() primary key,
  api_key text,
  user_id uuid references auth.users(id) on delete set null,
  method text,
  chain text,
  cache_hit boolean default false,
  status int,
  response_time_ms int,
  created_at timestamp default now()
);

-- 3. Index for fast per-user log queries
create index if not exists idx_request_logs_user_id on request_logs(user_id, created_at desc);
create index if not exists idx_api_keys_key on api_keys(key) where is_active = true;

-- 4. Helper functions called by backend (service role bypasses RLS)
create or replace function increment_key_requests(key_id uuid)
returns void language sql security definer as $$
  update api_keys set request_count = request_count + 1 where id = key_id;
$$;

create or replace function increment_key_errors(key_id uuid)
returns void language sql security definer as $$
  update api_keys set error_count = error_count + 1 where id = key_id;
$$;

-- 5. RLS policies (users can only see their own data)
alter table api_keys enable row level security;
alter table request_logs enable row level security;

create policy "Users see own keys" on api_keys
  for all using (auth.uid() = user_id);

create policy "Users see own logs" on request_logs
  for all using (auth.uid() = user_id);
