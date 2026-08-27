-- Operação precisa acompanhar a solicitação desde que ela chega, não só depois
-- da confirmação por magic link. A view passa a listar pendentes e confirmadas.
--
-- Atenção: linhas com status 'pending_confirmation' têm e-mail ainda não
-- verificado. Use-as para operação interna, nunca como contato confirmado.

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
from public.interest_leads;

revoke all on public.demand_overview from anon, authenticated;
grant select on public.demand_overview to service_role;
