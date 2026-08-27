# Pátio Livre MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir uma vitrine mobile-first de espaços ilustrativos para cães em São Paulo que capta, confirma e qualifica interesse real sem concluir reservas.

**Architecture:** Um catálogo local tipado fornece descoberta rápida e sem dados reais. A camada de domínio mantém filtros, validação e payloads independentes da UI; rotas de servidor encapsulam Supabase para criar interesses pendentes, registrar eventos e confirmar o vínculo seguro entre magic link e lead. As migrações criam o esquema, RLS e a view operacional.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, Vitest, Testing Library, Zod, Supabase JS/SSR, PostgreSQL (Supabase), Vercel.

**Spec:** `docs/superpowers/specs/2026-08-27-patio-livre-mvp-design.md`

## Global Constraints

- Nenhuma tela deve sugerir que uma reserva, disponibilidade ou endereço privado foi confirmado.
- Todo espaço, imagem e localização inicial deve ser explicitamente ilustrativo, sem dados pessoais ou locais reais.
- A interface é em português do Brasil, responsiva e otimizada primeiro para celular.
- O endereço exibido é somente bairro/zona e marcador aproximado; nunca coordenadas ou endereço de propriedade.
- Consentimento de marketing é opcional, desmarcado por padrão e separado da confirmação de interesse.
- O navegador usa apenas as variáveis públicas do Supabase; `SUPABASE_SERVICE_ROLE_KEY` fica exclusivamente no servidor.
- Eventos de funil não carregam e-mail, bairro livre ou outro dado pessoal no `payload`.
- TDD: cada comportamento novo começa por um teste que falha, seguido da implementação mínima e de execução verde.
- Não realizar deploy, push ou merge sem solicitação explícita do usuário.

---

## Estrutura de arquivos alvo

| Caminho | Responsabilidade |
| --- | --- |
| `src/lib/domain/catalog.ts` | Espaços fictícios, enums e tipagem do catálogo ilustrativo. |
| `src/lib/domain/filters.ts` | Normalização, serialização e aplicação de filtros puros. |
| `src/lib/domain/interest.ts` | Schema Zod, normalização de orçamento/UTMs e transição de estado. |
| `src/lib/analytics.ts` | Construção segura de eventos sem PII e ID de sessão anônimo. |
| `src/lib/supabase/server.ts` | Cliente servidor criado a partir de variáveis protegidas. |
| `src/lib/repositories/interest-repository.ts` | Contrato e implementação Supabase das operações de lead. |
| `src/components/*` | Componentes de busca, filtros, cards, mapa, estados e formulário. |
| `src/app/*` | Rotas App Router e endpoints HTTP do produto. |
| `src/app/auth/callback/route.ts` | Troca o código de autenticação do magic link por sessão. |
| `supabase/migrations/202608270001_initial_demand.sql` | Tabelas, RLS, índices e `demand_overview`. |
| `src/**/*.test.ts(x)` | Testes unitários e de componentes, próximos ao código. |

### Task 1: Inicializar o projeto e o ambiente de testes

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`, `src/test/setup.ts`
- Create: `vitest.config.ts`, `.env.example`, `.gitignore`
- Modify: `README.md`
- Test: `src/app/page.test.tsx`

**Interfaces:**
- Produces: scripts `test`, `test:watch`, `lint`, `typecheck` and `build`; aliases `@/*`; ambiente jsdom com Testing Library.

- [ ] **Step 1: Criar o teste inicial que descreve o posicionamento do MVP**

```tsx
import { render, screen } from "@testing-library/react";
import HomePage from "./page";

test("explica que o catálogo é ilustrativo e não uma reserva", () => {
  render(<HomePage />);
  expect(screen.getByText(/catálogo ilustrativo/i)).toBeInTheDocument();
  expect(screen.getByText(/não é uma reserva/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Rodar o teste para confirmar que falha antes da aplicação existir**

Run: `npm test -- src/app/page.test.tsx`

Expected: FAIL porque o módulo `./page` ou o ambiente de teste ainda não existe.

- [ ] **Step 3: Criar o esqueleto Next e instalar as dependências mínimas**

Run: `npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm`

Em seguida, instalar somente `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `zod`, `@supabase/supabase-js` e `@supabase/ssr`. Configurar `vitest.config.ts` com `environment: "jsdom"`, `setupFiles: ["./src/test/setup.ts"]` e alias `@` para `./src`.

- [ ] **Step 4: Implementar a home mínima para deixar o teste verde**

```tsx
export default function HomePage() {
  return (
    <main>
      <p>Catálogo ilustrativo durante a validação — pedir interesse não é uma reserva.</p>
    </main>
  );
}
```

Adicionar em `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

Adicionar `.env.example` sem segredos:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- [ ] **Step 5: Rodar o teste e a checagem de tipos**

Run: `npm test -- src/app/page.test.tsx && npm run typecheck`

Expected: PASS; TypeScript termina com código 0.

- [ ] **Step 6: Documentar execução local e criar o commit da fundação**

Adicionar ao README comandos de instalação, `.env.local`, testes e instrução de configurar `http://localhost:3000/auth/callback` e a URL Vercel no Supabase Auth. Commit:

```bash
git add package.json package-lock.json next.config.ts tsconfig.json postcss.config.mjs vitest.config.ts .gitignore .env.example README.md src
git commit -m "chore: inicia app Pátio Livre"
```

### Task 2: Modelar catálogo ilustrativo e filtros puros

**Files:**
- Create: `src/lib/domain/catalog.ts`, `src/lib/domain/filters.ts`
- Test: `src/lib/domain/filters.test.ts`

**Interfaces:**
- Produces: `Space`, `SearchFilters`, `Zone`, `UseType`, `DogSize`, `Amenity`, `SPACES`, `EMPTY_FILTERS`, `applyFilters(spaces, filters): Space[]`, `filtersToSearchParams(filters): URLSearchParams`, `filtersFromSearchParams(params): SearchFilters`.

- [ ] **Step 1: Escrever os testes que definem o filtro e a serialização**

```ts
import { SPACES } from "./catalog";
import { applyFilters, filtersFromSearchParams, filtersToSearchParams } from "./filters";

test("combina zona, uso, porte, cães e recursos", () => {
  const matches = applyFilters(SPACES, {
    query: "", zone: "Oeste", useType: "treino", dogSize: "grande", dogCount: 2, amenities: ["cercado"],
  });
  expect(matches.map((space) => space.slug)).toEqual(["quintal-da-praca"]);
});

test("não serializa filtros vazios e preserva filtros selecionados", () => {
  const params = filtersToSearchParams({ query: "", zone: "Sul", useType: undefined, dogSize: undefined, dogCount: undefined, amenities: ["agua"] });
  expect(params.toString()).toBe("zona=Sul&recursos=agua");
  expect(filtersFromSearchParams(params)).toMatchObject({ zone: "Sul", amenities: ["agua"] });
});
```

- [ ] **Step 2: Rodar os testes para confirmar falha**

Run: `npm test -- src/lib/domain/filters.test.ts`

Expected: FAIL porque os módulos e funções ainda não existem.

- [ ] **Step 3: Implementar tipos, oito espaços fictícios e filtros**

Definir os enums como uniões literais. Criar oito registros com `isIllustrative: true`, nomes não associados a negócios reais (por exemplo `quintal-da-praca`), bairros meramente indicativos, zonas diversas, fotos de URLs diferentes e `approximateMapArea`. Implementar filtro case-insensitive para busca, igualdade para zona/uso/porte, `maxDogs >= dogCount` e inclusão de todos os recursos solicitados. `filtersFromSearchParams` deve descartar valores fora dos enums.

- [ ] **Step 4: Rodar testes verdes e lint do domínio**

Run: `npm test -- src/lib/domain/filters.test.ts && npm run lint -- src/lib/domain`

Expected: PASS; nenhum erro de lint.

- [ ] **Step 5: Criar commit do domínio de descoberta**

```bash
git add src/lib/domain/catalog.ts src/lib/domain/filters.ts src/lib/domain/filters.test.ts
git commit -m "feat: adiciona catálogo ilustrativo e filtros"
```

### Task 3: Construir descoberta, listagem, cards e estado vazio

**Files:**
- Create: `src/components/search-bar.tsx`, `src/components/filter-panel.tsx`, `src/components/space-card.tsx`, `src/components/space-results.tsx`, `src/components/empty-results.tsx`, `src/app/espacos/page.tsx`
- Modify: `src/app/page.tsx`, `src/app/globals.css`
- Test: `src/components/space-results.test.tsx`, `src/components/empty-results.test.tsx`

**Interfaces:**
- Consumes: `SPACES`, `SearchFilters`, `applyFilters`, `filtersToSearchParams`.
- Produces: `/espacos` recebe `searchParams`, renderiza resultado e mantém filtros no link para `/interesse`.

- [ ] **Step 1: Escrever testes para cards sem duplicação e estado vazio contextual**

```tsx
test("mostra apenas um resumo de localização no card", () => {
  render(<SpaceResults spaces={[SPACES[0]]} filters={EMPTY_FILTERS} />);
  expect(screen.getAllByText(/Oeste/)).toHaveLength(1);
  expect(screen.getByText(/catálogo ilustrativo/i)).toBeInTheDocument();
});

test("encaminha filtros sem resultado para interesse regional", () => {
  render(<EmptyResults filters={{ ...EMPTY_FILTERS, zone: "Leste", useType: "socializacao" }} />);
  expect(screen.getByRole("link", { name: /registrar interesse/i })).toHaveAttribute("href", expect.stringContaining("zona=Leste"));
});
```

- [ ] **Step 2: Rodar os testes para confirmar falha**

Run: `npm test -- src/components/space-results.test.tsx src/components/empty-results.test.tsx`

Expected: FAIL porque os componentes ainda não existem.

- [ ] **Step 3: Implementar a experiência responsiva de busca e resultados**

Na home, criar busca que navega para `/espacos` com query. Em `/espacos`, derivar filtros da URL, filtrar `SPACES` e exibir contador. Em celular, `FilterPanel` deve abrir por botão com `aria-expanded`; a partir de `md`, permanecer como coluna lateral. Todos os controles devem ter `<label>` e os recursos devem usar checkboxes. `SpaceCard` mostra imagem, nome, selo ilustrativo, uma única linha de bairro/zona, usos, capacidade e até dois recursos. O estado vazio oferece recomendações curtas e link pré-preenchido para `/interesse`.

- [ ] **Step 4: Rodar testes verdes e testar responsividade por build**

Run: `npm test -- src/components/space-results.test.tsx src/components/empty-results.test.tsx && npm run build`

Expected: PASS; build termina com código 0.

- [ ] **Step 5: Criar commit da descoberta**

```bash
git add src/app src/components src/lib/domain
git commit -m "feat: implementa busca e catálogo ilustrativo"
```

### Task 4: Adicionar detalhe de espaço e mapa de área aproximada

**Files:**
- Create: `src/components/approximate-map.tsx`, `src/app/espacos/[slug]/page.tsx`, `src/app/not-found.tsx`
- Test: `src/components/approximate-map.test.tsx`, `src/app/espacos/[slug]/page.test.tsx`

**Interfaces:**
- Consumes: `SPACES` e `Space`.
- Produces: `ApproximateMap({ zone, areaLabel }: { zone: Zone; areaLabel: string })` e rota de detalhe que retorna `notFound()` para slug inexistente.

- [ ] **Step 1: Escrever testes de privacidade da localização e CTA**

```tsx
test("explica que o mapa não revela endereço", () => {
  render(<ApproximateMap zone="Centro" areaLabel="região central" />);
  expect(screen.getByText(/localização aproximada/i)).toBeInTheDocument();
  expect(screen.queryByText(/Rua|Avenida|CEP/)).not.toBeInTheDocument();
});

test("detalhe convida a pedir acesso, não reservar", async () => {
  render(await SpaceDetailPage({ params: Promise.resolve({ slug: "quintal-da-praca" }) }));
  expect(screen.getByRole("link", { name: /quero ser avisado/i })).toBeInTheDocument();
  expect(screen.queryByText(/^reservar$/i)).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Rodar os testes para confirmar falha**

Run: `npm test -- src/components/approximate-map.test.tsx src/app/espacos/[slug]/page.test.tsx`

Expected: FAIL porque o mapa e a rota ainda não existem.

- [ ] **Step 3: Implementar detalhe e mapa esquemático**

Construir `ApproximateMap` como cartão acessível com cinco áreas posicionadas por CSS e marcador apenas da zona. Não renderizar latitude, longitude, rua ou referência precisa. A página usa dados locais e traz recursos, usos, regra de cães, aviso de catálogo ilustrativo e link `/interesse?space=...&zona=...&bairro=...` com texto “Quero ser avisado quando houver disponibilidade”.

- [ ] **Step 4: Rodar testes e build**

Run: `npm test -- src/components/approximate-map.test.tsx src/app/espacos/[slug]/page.test.tsx && npm run build`

Expected: PASS; build termina com código 0.

- [ ] **Step 5: Criar commit do detalhe**

```bash
git add src/components/approximate-map.tsx src/components/approximate-map.test.tsx src/app/espacos src/app/not-found.tsx
git commit -m "feat: adiciona detalhe e mapa aproximado"
```

### Task 5: Implementar dados de interesse, validação e eventos sem PII

**Files:**
- Create: `src/lib/domain/interest.ts`, `src/lib/analytics.ts`
- Test: `src/lib/domain/interest.test.ts`, `src/lib/analytics.test.ts`

**Interfaces:**
- Produces: `interestSchema`, `toInterestInput(form, context): InterestInput`, `toCents(value): number | null`, `buildFunnelEvent(name, context): FunnelEvent` e `getAnonymousSessionId(): string`.

- [ ] **Step 1: Escrever testes da validação, orçamento, UTM e privacidade de eventos**

```ts
test("normaliza orçamento e inclui UTM no interesse", () => {
  const result = toInterestInput(validForm({ budget: "R$ 75,50" }), { utmSource: "instagram", landingPath: "/espacos" });
  expect(result.budgetCents).toBe(7550);
  expect(result.utmSource).toBe("instagram");
});

test("rejeita interesse sem bairro de moradia, data ou consentimento de contato", () => {
  expect(interestSchema.safeParse(validForm({ homeNeighborhood: "", desiredDate: "", contactConsent: false })).success).toBe(false);
});

test("evento não contém e-mail nem bairro livre", () => {
  const event = buildFunnelEvent("interest_submitted", { email: "teste@example.com", homeNeighborhood: "Moema", zone: "Sul" });
  expect(JSON.stringify(event.payload)).not.toMatch(/teste@example.com|Moema/);
  expect(event.payload).toMatchObject({ zone: "Sul" });
});
```

- [ ] **Step 2: Rodar os testes para confirmar falha**

Run: `npm test -- src/lib/domain/interest.test.ts src/lib/analytics.test.ts`

Expected: FAIL porque os módulos e funções ainda não existem.

- [ ] **Step 3: Implementar schemas e funções puras**

Usar Zod para exigir e-mail válido, bairro de moradia/destino entre 2 e 80 caracteres, zona válida, uso e porte válidos, `dogCount` entre 1 e 8, data não anterior ao dia atual e aceite obrigatório do contato necessário para concluir o interesse. `marketingConsent` permanece opcional. Converter somente valor monetário brasileiro positivo para centavos; campo vazio vira `null`. O evento permite somente zonas, enumerações, contagens, slug, origem e UTMs; remover chaves `email`, `homeNeighborhood`, `desiredNeighborhood`, `budget` e campos desconhecidos.

- [ ] **Step 4: Rodar testes verdes e typecheck**

Run: `npm test -- src/lib/domain/interest.test.ts src/lib/analytics.test.ts && npm run typecheck`

Expected: PASS; TypeScript termina com código 0.

- [ ] **Step 5: Criar commit da camada de dados**

```bash
git add src/lib/domain/interest.ts src/lib/domain/interest.test.ts src/lib/analytics.ts src/lib/analytics.test.ts
git commit -m "feat: adiciona validação de interesse e analytics"
```

### Task 6: Criar schema Supabase, políticas e visão operacional

**Files:**
- Create: `supabase/migrations/202608270001_initial_demand.sql`, `supabase/README.md`
- Test: `supabase/migrations/202608270001_initial_demand.test.sql`

**Interfaces:**
- Produces: tipos `lead_status`, `dog_size`, `use_type`, `sp_zone`; tabelas `interest_leads`, `funnel_events`; view `demand_overview`; funções `create_pending_interest` e `confirm_interest` chamadas apenas com credenciais de serviço.

- [ ] **Step 1: Escrever uma verificação SQL que define isolamento da view**

```sql
begin;
select has_table('public', 'interest_leads');
select has_view('public', 'demand_overview');
select policies_are('public', 'interest_leads', array['service_role manages interest leads']);
select results_eq(
  $$ select count(*)::int from demand_overview where status <> 'confirmed' $$,
  $$ values (0::int) $$,
  'a view operacional não mostra interesse pendente'
);
rollback;
```

- [ ] **Step 2: Executar a verificação para confirmar falha**

Run: `supabase test db`

Expected: FAIL porque a migração e as políticas ainda não existem. Se a CLI não estiver instalada, registrar isso e executar a mesma verificação no SQL Editor de um projeto Supabase temporário antes do commit.

- [ ] **Step 3: Implementar a migração de dados e RLS**

Criar enums e `interest_leads` com todos os campos da especificação (inclusive `space_slug`, `source_kind`, `landing_path`, `anonymous_session_id` e UTMs) e `status default 'pending_confirmation'`. Criar índices em `status`, `desired_zone`, `desired_neighborhood`, `created_at` e `confirmed_at`. Criar `funnel_events` sem coluna de e-mail. Habilitar RLS em ambas, revogar acesso público e permitir somente `service_role` por políticas explicitamente nomeadas. Criar `demand_overview` com `security_invoker = true`, filtrando `status = 'confirmed'`, e conceder select apenas a `service_role`. Escrever `supabase/README.md` com o comando de aplicar a migração e uma query para a view.

- [ ] **Step 4: Rodar testes da migração e revisar segurança**

Run: `supabase test db && supabase db lint`

Expected: PASS; sem avisos de política, privilégio público ou erro de lint. Se for impossível executar sem credenciais/CLI, executar `supabase db lint` quando a CLI estiver disponível e deixar a aplicação pronta, sem alegar que a migração foi aplicada.

- [ ] **Step 5: Criar commit do schema**

```bash
git add supabase/migrations/202608270001_initial_demand.sql supabase/migrations/202608270001_initial_demand.test.sql supabase/README.md
git commit -m "feat: cria schema de demanda no Supabase"
```

### Task 7: Criar repositório Supabase e APIs de interesse/eventos

**Files:**
- Create: `src/lib/supabase/server.ts`, `src/lib/repositories/interest-repository.ts`, `src/app/api/interests/route.ts`, `src/app/api/interests/confirm/route.ts`, `src/app/api/events/route.ts`, `src/app/auth/callback/route.ts`
- Test: `src/app/api/interests/route.test.ts`, `src/app/api/interests/confirm/route.test.ts`, `src/app/api/events/route.test.ts`

**Interfaces:**
- Consumes: `InterestInput`, `FunnelEvent`, `interestSchema`.
- Produces: `InterestRepository.createPending(input): Promise<{ id: string }>`; `InterestRepository.confirm(id, authenticatedEmail, userId): Promise<'confirmed' | 'invalid'>`; POST `/api/interests` com `{ id }`; POST `/api/interests/confirm` com `{ id }`; POST `/api/events` com status 204.

- [ ] **Step 1: Escrever testes HTTP de criação, confirmação e proteção**

```ts
test("cria interesse pendente e solicita magic link", async () => {
  mockRepository.createPending.mockResolvedValue({ id: "lead-1" });
  mockAuth.signInWithOtp.mockResolvedValue({ error: null });
  const response = await POST(requestWith(validInterestPayload()));
  expect(response.status).toBe(201);
  expect(mockAuth.signInWithOtp).toHaveBeenCalledWith(expect.objectContaining({ options: { emailRedirectTo: expect.stringContaining("/auth/callback?next=") } }));
});

test("só confirma quando e-mail autenticado coincide com o lead", async () => {
  mockRepository.confirm.mockResolvedValue("invalid");
  const response = await confirmPOST(requestWith({ id: "lead-1" }));
  expect(response.status).toBe(403);
});

test("recusa evento que contém PII", async () => {
  const response = await eventPOST(requestWith({ eventName: "search_started", payload: { email: "a@b.com" } }));
  expect(response.status).toBe(400);
});
```

- [ ] **Step 2: Rodar testes para confirmar falha**

Run: `npm test -- src/app/api/interests/route.test.ts src/app/api/interests/confirm/route.test.ts src/app/api/events/route.test.ts`

Expected: FAIL porque APIs, repositório e mocks ainda não existem.

- [ ] **Step 3: Implementar clientes, contrato e rotas**

`server.ts` deve falhar em desenvolvimento com mensagem objetiva se faltar variável de ambiente e criar clientes de sessão e serviço somente no servidor. A rota de criação valida Zod, grava `pending_confirmation`, chama `signInWithOtp` com `emailRedirectTo` apontando para `/auth/callback?next=/confirmar?interest=<id>` e devolve `201` apenas sem erro. A callback troca `code` por sessão e redireciona somente para caminhos internos permitidos. A confirmação lê o usuário autenticado, chama `confirm` e responde 403 sem revelar e-mail/lead em caso inválido. A rota de eventos valida nome e payload pela allowlist de `buildFunnelEvent` e responde `204`.

- [ ] **Step 4: Rodar testes verdes e checagens**

Run: `npm test -- src/app/api/interests/route.test.ts src/app/api/interests/confirm/route.test.ts src/app/api/events/route.test.ts && npm run lint && npm run typecheck`

Expected: PASS; lint e TypeScript terminam com código 0.

- [ ] **Step 5: Criar commit da integração de servidor**

```bash
git add src/lib/supabase src/lib/repositories src/app/api src/app/auth src/app/api/**/*.test.ts
git commit -m "feat: adiciona captura e confirmação de interesse"
```

### Task 8: Construir formulário, confirmação e instrumentação de funil

**Files:**
- Create: `src/components/interest-form.tsx`, `src/components/track-event.tsx`, `src/app/interesse/page.tsx`, `src/app/confirmar/page.tsx`
- Modify: `src/app/page.tsx`, `src/app/espacos/page.tsx`, `src/app/espacos/[slug]/page.tsx`
- Test: `src/components/interest-form.test.tsx`, `src/app/confirmar/page.test.tsx`

**Interfaces:**
- Consumes: `interestSchema`, API `/api/interests`, API `/api/interests/confirm`, `buildFunnelEvent`.
- Produces: formulário que envia `InterestInput`, mensagem de magic link e tela confirmada/erro.

- [ ] **Step 1: Escrever testes de preenchimento, consentimento e linguagem de confirmação**

```tsx
test("mantém consentimento de marketing desmarcado e envia interesse pendente", async () => {
  const user = userEvent.setup();
  render(<InterestForm context={defaultContext} />);
  expect(screen.getByLabelText(/aceito receber novidades/i)).not.toBeChecked();
  await user.type(screen.getByLabelText(/seu e-mail/i), "teste@example.com");
  // preencher os demais campos obrigatórios
  await user.click(screen.getByRole("button", { name: /pedir acesso/i }));
  expect(await screen.findByText(/enviamos um link/i)).toBeInTheDocument();
  expect(screen.getByText(/não é uma reserva/i)).toBeInTheDocument();
});

test("tela de confirmação não sugere disponibilidade", async () => {
  render(await ConfirmPage({ searchParams: Promise.resolve({ interest: "lead-1" }) }));
  expect(screen.getByText(/interesse confirmado/i)).toBeInTheDocument();
  expect(screen.queryByText(/reserva confirmada/i)).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Rodar testes para confirmar falha**

Run: `npm test -- src/components/interest-form.test.tsx src/app/confirmar/page.test.tsx`

Expected: FAIL porque o formulário e a tela de confirmação ainda não existem.

- [ ] **Step 3: Implementar fluxo visual e eventos**

`InterestForm` lê contextos de URL e usa labels claros. Deve exibir campos de bairro livre, zona selecionável, bairro desejado livre, uso, porte, quantidade, data, orçamento, consentimento de contato obrigatório e marketing opcional. Após `201`, substituir o botão por mensagem “Enviamos um link para confirmar seu interesse. Isso não é uma reserva.” Ao carregar `/confirmar?interest=`, chamar a API de confirmação, renderizar sucesso ou instrução segura para pedir novo link e registrar somente após sucesso `interest_confirmed`. Registrar `search_started` quando a busca for submetida, `filters_changed` ao aplicar filtro, `space_viewed` no detalhe, `region_interest_clicked` no CTA contextual e `interest_submitted` após resposta 201.

- [ ] **Step 4: Rodar testes verdes, lint e build**

Run: `npm test -- src/components/interest-form.test.tsx src/app/confirmar/page.test.tsx && npm run lint && npm run typecheck && npm run build`

Expected: PASS; todas as verificações terminam com código 0.

- [ ] **Step 5: Criar commit do fluxo completo**

```bash
git add src/components/interest-form.tsx src/components/interest-form.test.tsx src/components/track-event.tsx src/app/interesse src/app/confirmar src/app/page.tsx src/app/espacos
git commit -m "feat: finaliza captação de demanda confirmada"
```

### Task 9: Verificação final, acessibilidade e preparação de deploy

**Files:**
- Modify: `README.md`, `.env.example`
- Test: `src/app/e2e-smoke.test.tsx`

**Interfaces:**
- Consumes: todas as rotas e contratos anteriores.
- Produces: checklist operacional verificável, instruções Vercel/Supabase e teste de jornada essencial.

- [ ] **Step 1: Escrever teste de jornada que falha antes de ajustes finais**

```tsx
test("a jornada de demanda oferece saída tanto com quanto sem resultado", async () => {
  render(<ResultsPage searchParams={Promise.resolve({ zona: "Leste", uso: "socializacao" })} />);
  expect(await screen.findByRole("link", { name: /registrar interesse/i })).toBeInTheDocument();
  expect(screen.getByText(/catálogo ilustrativo/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Rodar o teste para confirmar falha ou revelar a lacuna de integração**

Run: `npm test -- src/app/e2e-smoke.test.tsx`

Expected: FAIL se a página não expõe o CTA e o aviso na composição real; documentar a mensagem de erro antes de qualquer correção.

- [ ] **Step 3: Corrigir somente as lacunas verificadas e documentar operação**

Ajustar a composição real para satisfazer o teste sem duplicar localização em cards. No README, incluir configuração de variáveis na Vercel, autorização de URLs de callback no Supabase Auth, aplicação de migrações, e consulta operacional:

```sql
select contact_email, home_neighborhood, desired_neighborhood, desired_zone,
       use_type, dog_size, dog_count, desired_date, budget_cents,
       marketing_consent, utm_source, utm_medium, utm_campaign, confirmed_at
from demand_overview
order by confirmed_at desc;
```

- [ ] **Step 4: Executar a verificação completa com evidência fresca**

Run: `npm test && npm run lint && npm run typecheck && npm run build && git diff --check`

Expected: todos os comandos terminam com código 0. Se a CLI Supabase estiver disponível e houver projeto configurado, executar adicionalmente `supabase test db && supabase db lint`; caso não, declarar explicitamente que a migração não foi aplicada nem validada remotamente.

- [ ] **Step 5: Inspecionar requisitos e criar o commit final local**

Revisar item a item a especificação: catálogo ilustrativo, filtros, estados vazios, mapa aproximado, formulário, magic link, RLS, view, eventos, responsividade e linguagem sem reserva. Só então:

```bash
git add README.md .env.example src/app src/components src/lib supabase
git commit -m "docs: prepara operação e deploy do MVP"
```

Depois, apresentar ao usuário as opções de manter commits locais, criar merge para a branch principal ou enviar ao remoto; não executar merge/push sem pedido.
