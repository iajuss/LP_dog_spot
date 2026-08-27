# Pátio Livre

Marketplace de espaços privados para atividades com cães em São Paulo. O tutor busca um espaço, envia uma solicitação de reserva e confirma o e-mail por magic link. A equipe confirma a disponibilidade e os detalhes depois.

## Rodar localmente

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

Verificações:

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

## Supabase e magic link

Preencha as variáveis de `.env.local` com os valores do projeto Supabase. Em **Authentication → URL Configuration**, autorize `http://localhost:3000/auth/callback` e, no deploy, `https://SEU-DOMINIO/auth/callback`. A chave `SUPABASE_SERVICE_ROLE_KEY` é exclusiva do servidor e nunca deve ser exposta no navegador.

Antes do deploy, aplique as migrações de `supabase/migrations/` em ordem, da mais antiga para a mais recente, no SQL Editor ou com a Supabase CLI.

A view `demand_overview` lista as solicitações pendentes e confirmadas, e o acesso é restrito ao `service_role`. Linhas com `status = 'pending_confirmation'` têm e-mail ainda **não** verificado pelo magic link: sirva-se delas para operação interna, nunca como contato confirmado.

Para acompanhar a fila:

```sql
-- Somente as confirmadas: acrescente `where status = 'confirmed'`.
select status, request_kind, contact_name, contact_email, contact_phone,
       space_slug, source_kind, home_neighborhood, desired_neighborhood,
       desired_zone, use_type, dog_size, dog_count, desired_date, time_slot,
       budget_cents, utm_source, utm_medium, utm_campaign, created_at, confirmed_at
from demand_overview
order by created_at desc;
```
