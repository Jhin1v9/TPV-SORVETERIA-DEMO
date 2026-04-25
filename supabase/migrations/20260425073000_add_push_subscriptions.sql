create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete cascade,
  telefone text,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  locale text,
  user_agent text,
  enabled boolean not null default true,
  last_notified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_push_subscriptions_customer on public.push_subscriptions(customer_id);
create index if not exists idx_push_subscriptions_phone on public.push_subscriptions(telefone);
create index if not exists idx_push_subscriptions_enabled on public.push_subscriptions(enabled);

alter table public.push_subscriptions enable row level security;

drop policy if exists push_subscriptions_read on public.push_subscriptions;
create policy push_subscriptions_read on public.push_subscriptions
  for select
  to authenticated
  using (false);

drop policy if exists push_subscriptions_insert on public.push_subscriptions;
create policy push_subscriptions_insert on public.push_subscriptions
  for insert
  to authenticated
  with check (false);

drop policy if exists push_subscriptions_update on public.push_subscriptions;
create policy push_subscriptions_update on public.push_subscriptions
  for update
  to authenticated
  using (false);
