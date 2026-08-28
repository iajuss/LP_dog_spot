-- Pedidos começados e não enviados, guardados fora de interest_leads.
--
-- Quem desiste no meio do formulário não chegou a marcar o consentimento de
-- contato, que fica no fim. Por isso esta tabela NÃO tem nome, e-mail nem
-- telefone: ela responde "onde o fluxo perde gente", e não serve para
-- abordagem. Manter assim é o que separa análise de funil de contato sem
-- autorização.

create table if not exists public.request_drafts (
  id uuid primary key default gen_random_uuid(),
  anonymous_session_id text not null unique,
  request_kind public.request_kind not null default 'reservation_request',
  source_kind text not null default 'general',
  space_slug text,
  home_neighborhood text,
  desired_neighborhood text,
  desired_zone public.sp_zone,
  use_type public.use_type,
  dog_size public.dog_size,
  dog_count smallint check (dog_count is null or dog_count between 1 and 8),
  desired_date date,
  time_slot public.time_slot,
  budget_cents integer check (budget_cents is null or budget_cents > 0),
  landing_path text,
  utm_source text, utm_medium text, utm_campaign text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists request_drafts_recent_idx on public.request_drafts (updated_at desc);
create index if not exists request_drafts_region_idx on public.request_drafts (desired_zone, desired_neighborhood);

alter table public.request_drafts enable row level security;
drop policy if exists "service_role manages request drafts" on public.request_drafts;
create policy "service_role manages request drafts" on public.request_drafts
  for all to service_role using (true) with check (true);

-- Rascunhos cuja sessão nunca gerou um pedido enviado: a desistência real.
create or replace view public.abandoned_requests with (security_invoker = true) as
select d.request_kind,
       d.source_kind,
       d.space_slug,
       d.home_neighborhood,
       d.desired_neighborhood,
       d.desired_zone,
       d.use_type,
       d.dog_size,
       d.dog_count,
       d.desired_date,
       d.time_slot,
       d.budget_cents,
       d.landing_path,
       d.utm_source,
       d.utm_medium,
       d.utm_campaign,
       d.created_at,
       d.updated_at
from public.request_drafts d
where not exists (
  select 1 from public.interest_leads l
  where l.anonymous_session_id = d.anonymous_session_id
);

revoke all on public.abandoned_requests from anon, authenticated;
grant select on public.abandoned_requests to service_role;
