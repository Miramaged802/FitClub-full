-- Enable pgcrypto for gen_random_uuid
create extension if not exists pgcrypto;

-- Create table to store users' favorite gyms
create table if not exists public.user_favorite_gyms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  gym_id uuid not null references public.gyms(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, gym_id)
);

-- Enable RLS
alter table public.user_favorite_gyms enable row level security;

-- Policies (DROP first to avoid duplicates)
drop policy if exists "Allow select own favorites" on public.user_favorite_gyms;
create policy "Allow select own favorites"
  on public.user_favorite_gyms for select
  using (auth.uid() = user_id);

drop policy if exists "Allow insert own favorites" on public.user_favorite_gyms;
create policy "Allow insert own favorites"
  on public.user_favorite_gyms for insert
  with check (auth.uid() = user_id);

drop policy if exists "Allow delete own favorites" on public.user_favorite_gyms;
create policy "Allow delete own favorites"
  on public.user_favorite_gyms for delete
  using (auth.uid() = user_id);

-- Helpful indexes
create index if not exists idx_user_favorite_gyms_user_id on public.user_favorite_gyms(user_id);
create index if not exists idx_user_favorite_gyms_gym_id on public.user_favorite_gyms(gym_id);


