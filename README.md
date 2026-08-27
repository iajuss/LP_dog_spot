# Pátio Livre

MVP de validação de demanda para espaços privados de atividades com cães em São Paulo. O catálogo é inteiramente ilustrativo: pedir acesso ou novidades não é uma reserva.

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
