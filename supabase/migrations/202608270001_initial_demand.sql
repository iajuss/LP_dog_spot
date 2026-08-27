create type public.lead_status as enum ('pending_confirmation', 'confirmed');
create type public.sp_zone as enum ('Centro', 'Norte', 'Sul', 'Leste', 'Oeste');
create type public.use_type as enum ('passeio', 'brincadeira', 'treino', 'socializacao');
create type public.dog_size as enum ('pequeno', 'medio', 'grande');

create table public.interest_leads (
  id uuid primary key default gen_random_uuid(), status public.lead_status not null default 'pending_confirmation',
  contact_email text not null, user_id uuid references auth.users(id), space_slug text, source_kind text not null default 'general',
  home_neighborhood text not null, desired_neighborhood text not null, desired_zone public.sp_zone not null,
  use_type public.use_type not null, dog_size public.dog_size not null, dog_count smallint not null check (dog_count between 1 and 8),
  desired_date date not null, budget_cents integer check (budget_cents is null or budget_cents > 0), marketing_consent boolean not null default false,
  utm_source text, utm_medium text, utm_campaign text, landing_path text, anonymous_session_id text,
  confirmed_at timestamptz, created_at timestamptz not null default now()
);
create index interest_leads_demand_idx on public.interest_leads (status, desired_zone, desired_neighborhood, confirmed_at desc);

create table public.funnel_events (
  id bigint generated always as identity primary key, anonymous_session_id text, event_name text not null,
  payload jsonb not null default '{}'::jsonb, landing_path text, utm_source text, utm_medium text, utm_campaign text,
  created_at timestamptz not null default now()
);
alter table public.interest_leads enable row level security;
alter table public.funnel_events enable row level security;
create policy "service_role manages interest leads" on public.interest_leads for all to service_role using (true) with check (true);
create policy "service_role manages funnel events" on public.funnel_events for all to service_role using (true) with check (true);

create view public.demand_overview with (security_invoker = true) as
select contact_email, home_neighborhood, desired_neighborhood, desired_zone, use_type, dog_size, dog_count,
       desired_date, budget_cents, marketing_consent, utm_source, utm_medium, utm_campaign, confirmed_at, created_at
from public.interest_leads where status = 'confirmed';
revoke all on public.demand_overview from anon, authenticated;
grant select on public.demand_overview to service_role;
