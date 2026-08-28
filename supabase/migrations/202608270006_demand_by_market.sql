-- Praça x vertical: onde a demanda se concentra e para qual ocasião.
--
-- Reúne as três fontes de intenção — pedido confirmado, pedido pendente de
-- confirmação e rascunho abandonado — porque quem desistiu no meio também
-- revela praça e vertical. As linhas de rascunho não têm contato, por
-- construção da tabela de origem.

create or replace view public.demand_by_market with (security_invoker = true) as
select zona,
       bairro,
       vertical,
       tipo_de_pedido,
       count(*) filter (where estagio = 'confirmado')  as confirmados,
       count(*) filter (where estagio = 'pendente')    as pendentes,
       count(*) filter (where estagio = 'rascunho')    as rascunhos,
       count(*)                                        as total,
       max(momento)                                    as ultimo_registro
from (
  select desired_zone as zona,
         desired_neighborhood as bairro,
         use_type as vertical,
         request_kind as tipo_de_pedido,
         case when status = 'confirmed' then 'confirmado' else 'pendente' end as estagio,
         created_at as momento
  from public.interest_leads

  union all

  select d.desired_zone,
         d.desired_neighborhood,
         d.use_type,
         d.request_kind,
         'rascunho',
         d.updated_at
  from public.request_drafts d
  where not exists (
    select 1 from public.interest_leads l
    where l.anonymous_session_id = d.anonymous_session_id
  )
) as intencoes
where zona is not null
group by zona, bairro, vertical, tipo_de_pedido;

revoke all on public.demand_by_market from anon, authenticated;
grant select on public.demand_by_market to service_role;
