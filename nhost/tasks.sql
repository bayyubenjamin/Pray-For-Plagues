-- Social / extra tasks. Edit name, link, points in Hasura.

create table if not exists public.tasks (
  id text primary key,
  label text not null,
  href text not null,
  points integer not null default 25,
  category text not null default 'social',
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.tasks enable row level security;
drop policy if exists "tasks_select" on public.tasks;
create policy "tasks_select" on public.tasks for select using (true);

insert into public.tasks (id, label, href, points, category, sort_order) values
  ('follow_x', 'FOLLOW', 'https://x.com/pfphood', 50, 'social', 10),
  ('like_post', 'LIKE', 'https://x.com/pfphood/status/2087962447110148558', 25, 'social', 20),
  ('repost_post', 'REPOST', 'https://x.com/pfphood/status/2087962447110148558', 25, 'social', 30),
  ('comment_post', 'COMMENT', 'https://x.com/pfphood/status/2087962447110148558', 25, 'social', 40)
on conflict (id) do update set
  label = excluded.label,
  href = excluded.href,
  points = excluded.points,
  category = excluded.category,
  sort_order = excluded.sort_order,
  active = true;
