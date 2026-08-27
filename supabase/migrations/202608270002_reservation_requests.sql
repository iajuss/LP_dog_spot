-- Solicitações de reserva e avisos de disponibilidade.
-- Uma solicitação é um pedido do tutor; a disponibilidade é confirmada pela equipe depois.

create type public.request_kind as enum ('reservation_request', 'availability_alert');
create type public.time_slot as enum ('manha', 'tarde', 'noite');

alter table public.interest_leads
  add column request_kind public.request_kind not null default 'availability_alert',
  add column contact_name text not null default '',
  add column contact_phone text,
  add column time_slot public.time_slot;

-- O default existe apenas para as linhas já gravadas; novas solicitações precisam informar o nome.
alter table public.interest_leads alter column contact_name drop default;

-- O aviso de disponibilidade não tem data definida; a solicitação de reserva tem.
alter table public.interest_leads alter column desired_date drop not null;

alter table public.interest_leads
  add constraint interest_leads_reservation_requires_schedule check (
    request_kind <> 'reservation_request' or (desired_date is not null and time_slot is not null)
  );

drop index if exists public.interest_leads_demand_idx;
create index interest_leads_demand_idx
  on public.interest_leads (status, request_kind, desired_zone, desired_neighborhood, confirmed_at desc);

drop view if exists public.demand_overview;

create or replace view public.demand_overview with (security_invoker = true) as
select status,
       request_kind,
       contact_name,
       contact_email,
       contact_phone,
       space_slug,
       source_kind,
       home_neighborhood,
       desired_neighborhood,
       desired_zone,
       use_type,
       dog_size,
       dog_count,
       desired_date,
       time_slot,
       budget_cents,
       marketing_consent,
       utm_source,
       utm_medium,
       utm_campaign,
       landing_path,
       confirmed_at,
       created_at
from public.interest_leads
where status = 'confirmed';

revoke all on public.demand_overview from anon, authenticated;
grant select on public.demand_overview to service_role;
