-- Primary user table. Waitlist is temporary event data.

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  x_handle text not null,
  email text,
  wallet text,
  connected_wallet text,
  points integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_x_handle_key unique (x_handle)
);

alter table public.profiles add column if not exists connected_wallet text;
alter table public.profiles add column if not exists points integer not null default 0;

alter table public.profiles enable row level security;
drop policy if exists "profiles_all" on public.profiles;
create policy "profiles_all" on public.profiles for all using (true) with check (true);

-- copy current waitlist rows into profiles
insert into public.profiles (x_handle, email, wallet, points)
select x_handle, email, wallet, coalesce(points, 0)
from public.waitlist
on conflict (x_handle) do update set
  email = excluded.email,
  wallet = excluded.wallet,
  points = excluded.points,
  updated_at = now();
