# Pátio Livre Ready Marketplace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar a vitrine em uma experiência de marketplace pronta, com solicitação de reserva confirmada por e-mail e aviso de disponibilidade como ação secundária.

**Architecture:** O catálogo local passa a conter espaços diversos com ponto aproximado para um mapa Leaflet. A UI troca filtros nativos por menus controlados e usa fluxos `reservation_request` e `availability_alert` sobre a mesma infraestrutura Supabase/magic link.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS, Vitest, Testing Library, Zod, Leaflet, React Leaflet, Supabase.

**Spec:** `docs/superpowers/specs/2026-08-27-patio-livre-ready-marketplace-design.md`

## Global Constraints

- Não mostrar na UI pública os termos validação, ilustrativo, acesso antecipado, novidades, demanda ou “não é uma reserva”.
- `Reservar este espaço` registra solicitação confirmada por e-mail; nunca confirma disponibilidade, data ou endereço.
- `Quero ser avisado` é ação secundária de acompanhamento de disponibilidade.
- Exibir apenas localizações aproximadas; nunca endereço exato ou coordenada precisa de propriedade.
- Usar fotos variadas e cartões sem repetição de localização.
- A home e suas seções principais ocupam a janela em desktop e a tela em celular.
- TDD: escrever e executar o teste vermelho antes de código de comportamento novo.

---

### Task 1: Expandir catálogo e dados de solicitação

**Files:**
- Modify: `src/lib/domain/catalog.ts`, `src/lib/domain/filters.ts`, `src/lib/domain/interest.ts`
- Create: `src/lib/domain/reservation.ts`
- Test: `src/lib/domain/catalog.test.ts`, `src/lib/domain/reservation.test.ts`

**Interfaces:**
- Produces: `Space.location: { latitude: number; longitude: number; label: string }`, ao menos 12 `SPACES`, `RequestKind`, `reservationSchema` e `availabilityAlertSchema`.

- [ ] **Step 1: Escrever testes vermelhos de variedade e regras de formulário**

```ts
test("catálogo tem doze espaços e fotos únicas", () => {
  expect(SPACES).toHaveLength(12);
  expect(new Set(SPACES.map((space) => space.imageUrl)).size).toBe(12);
});

test("solicitação exige data e período, alerta não", () => {
  expect(reservationSchema.safeParse(baseRequest({ desiredDate: "", timeSlot: "" })).success).toBe(false);
  expect(availabilityAlertSchema.safeParse(baseRequest({ desiredDate: "", timeSlot: "" })).success).toBe(true);
});
```

- [ ] **Step 2: Executar os testes vermelhos**

Run: `npm test -- src/lib/domain/catalog.test.ts src/lib/domain/reservation.test.ts`

Expected: FAIL porque catálogo, schemas e tipos ainda não contemplam esses contratos.

- [ ] **Step 3: Implementar o catálogo e schemas mínimos**

Adicionar quatro espaços genéricos distribuídos entre zonas, com foto única e coordenada de centro de bairro arredondada. Em `reservation.ts`, definir `RequestKind = "reservation_request" | "availability_alert"`; validar nome, e-mail, região, cães e consentimento de contato; exigir data ISO e `timeSlot` (`manha`, `tarde`, `noite`) só em `reservation_request`.

- [ ] **Step 4: Executar verde**

Run: `npm test -- src/lib/domain/catalog.test.ts src/lib/domain/reservation.test.ts && npm run typecheck`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/domain/catalog.ts src/lib/domain/filters.ts src/lib/domain/interest.ts src/lib/domain/reservation.ts src/lib/domain/catalog.test.ts src/lib/domain/reservation.test.ts
git commit -m "feat: expande catálogo e tipos de solicitação"
```

### Task 2: Refazer home, carrossel e filtros customizados

**Files:**
- Create: `src/components/hero-carousel.tsx`, `src/components/filter-menu.tsx`
- Modify: `src/app/page.tsx`, `src/app/globals.css`, `src/components/filter-panel.tsx`, `src/components/space-card.tsx`, `src/app/espacos/page.tsx`
- Test: `src/components/hero-carousel.test.tsx`, `src/components/filter-menu.test.tsx`, `src/app/page.test.tsx`

**Interfaces:**
- Produces: `HeroCarousel({ slides })` e `FilterMenu({ label, options, selected, name })`; resultados continuam aceitando parâmetros existentes.

- [ ] **Step 1: Escrever testes vermelhos de linguagem, carrossel e menu**

```tsx
test("home mostra imagem do carrossel e não expõe texto interno", () => {
  render(<HomePage />);
  expect(screen.getByRole("img", { name: /cão/i })).toBeInTheDocument();
  expect(screen.queryByText(/validação|acesso antecipado|ilustrativo/i)).not.toBeInTheDocument();
});

test("menu de zona abre opções estilizadas", async () => {
  render(<FilterMenu label="Zona" name="zona" options={["Centro", "Sul"]} />);
  await userEvent.setup().click(screen.getByRole("button", { name: /zona/i }));
  expect(screen.getByRole("menu")).toHaveTextContent("Centro");
});
```

- [ ] **Step 2: Executar vermelho**

Run: `npm test -- src/components/hero-carousel.test.tsx src/components/filter-menu.test.tsx src/app/page.test.tsx`

Expected: FAIL porque os componentes e a nova linguagem não existem.

- [ ] **Step 3: Implementar experiência de tela cheia**

Instalar `leaflet`, `react-leaflet` e tipos necessários. Criar hero com imagens distintas, botões anterior/próximo, pausa ao foco e overlay legível. Usar `min-h-screen` em hero e seções de descoberta. `FilterMenu` usa botão, `role="menu"`, botões de opção e campo oculto, fechando por Escape e clique de opção. Remover todos os textos públicos proibidos; cards usam selo `Disponível para solicitar`.

- [ ] **Step 4: Executar verde**

Run: `npm test -- src/components/hero-carousel.test.tsx src/components/filter-menu.test.tsx src/app/page.test.tsx && npm run lint && npm run typecheck`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/app/page.tsx src/app/globals.css src/app/espacos/page.tsx src/components
git commit -m "feat: atualiza home e filtros de marketplace"
```

### Task 3: Mapa navegável e detalhes orientados à solicitação

**Files:**
- Create: `src/components/interactive-map.tsx`
- Modify: `src/components/approximate-map.tsx`, `src/app/espacos/[slug]/page.tsx`, `src/app/espacos/[slug]/page.test.tsx`, `next.config.ts`
- Test: `src/components/interactive-map.test.tsx`

**Interfaces:**
- Produces: `InteractiveMap({ location, spaceName })`, com zoom/pan e fallback textual.

- [ ] **Step 1: Escrever teste vermelho de mapa e CTAs**

```tsx
test("mapa apresenta controle navegável e aviso de localização aproximada", () => {
  render(<InteractiveMap location={{ latitude: -23.56, longitude: -46.67, label: "Pinheiros, São Paulo" }} spaceName="Casa Jardim" />);
  expect(screen.getByLabelText(/mapa de casa jardim/i)).toBeInTheDocument();
  expect(screen.getByText(/localização aproximada/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Executar vermelho**

Run: `npm test -- src/components/interactive-map.test.tsx src/app/espacos/[slug]/page.test.tsx`

Expected: FAIL porque o componente e o CTA de solicitação ainda não existem.

- [ ] **Step 3: Implementar mapa e detalhe**

Criar componente cliente com carregamento dinâmico de React Leaflet, `TileLayer` OpenStreetMap, `Marker`, `ZoomControl`, coordenada aproximada e fallback. Remover o mapa gráfico atual. No detalhe, exibir `Reservar este espaço` para `/reservar?space=<slug>` e `Quero ser avisado` para `/reservar?kind=availability_alert&space=<slug>`; copiar o padrão de texto “endereço e disponibilidade são confirmados no atendimento”.

- [ ] **Step 4: Executar verde**

Run: `npm test -- src/components/interactive-map.test.tsx src/app/espacos/[slug]/page.test.tsx && npm run build`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add next.config.ts src/components/interactive-map.tsx src/components/interactive-map.test.tsx src/components/approximate-map.tsx src/app/espacos/[slug]
git commit -m "feat: adiciona mapa navegável e CTAs de solicitação"
```

### Task 4: Fluxos de solicitação, banco e confirmação

**Files:**
- Modify: `src/components/interest-form.tsx`, `src/app/interesse/page.tsx`, `src/app/confirmar/page.tsx`, `src/app/api/interests/route.ts`, `src/app/api/interests/confirm/route.ts`, `supabase/migrations/202608270001_initial_demand.sql`
- Create: `src/app/reservar/page.tsx`, `supabase/migrations/202608270002_reservation_requests.sql`
- Test: `src/components/reservation-form.test.tsx`, `src/app/reservar/page.test.tsx`

**Interfaces:**
- Produces: rota `/reservar`, `ReservationForm({ kind, space })`, persistência de `request_kind`, nome, telefone e período.

- [ ] **Step 1: Escrever testes vermelhos dos dois fluxos**

```tsx
test("solicitação de reserva exige data e período", async () => {
  render(<ReservationForm kind="reservation_request" space={SPACES[0]} />);
  expect(screen.getByLabelText(/data desejada/i)).toBeRequired();
  expect(screen.getByLabelText(/período/i)).toBeInTheDocument();
});

test("aviso não exige data e usa CTA de acompanhamento", () => {
  render(<ReservationForm kind="availability_alert" space={SPACES[0]} />);
  expect(screen.queryByLabelText(/data desejada/i)).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: /quero ser avisado/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Executar vermelho**

Run: `npm test -- src/components/reservation-form.test.tsx src/app/reservar/page.test.tsx`

Expected: FAIL porque rota e formulário não existem.

- [ ] **Step 3: Implementar persistência e confirmação**

Criar migração que adiciona `request_kind`, `contact_name`, `contact_phone` e `time_slot`; atualizar `demand_overview`. Criar `/reservar` e formulário compartilhável; enviar `request_kind` à API atual. O retorno após magic link deve dizer `Solicitação confirmada` e que a equipe confirmará disponibilidade e detalhes. O fluxo de aviso mantém `Quero ser avisado` e dispensa data/período.

- [ ] **Step 4: Executar verde**

Run: `npm test -- src/components/reservation-form.test.tsx src/app/reservar/page.test.tsx && npm run lint && npm run typecheck && npm run build`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/reservar src/app/interesse src/app/confirmar src/app/api/interests src/components supabase/migrations
git commit -m "feat: adiciona solicitação de reserva e aviso"
```

### Task 5: Limpeza de linguagem e verificação de entrega

**Files:**
- Modify: `README.md`, `src/app/layout.tsx`, `src/app/not-found.tsx`, `src/components/empty-results.tsx`, testes afetados
- Test: `src/app/marketplace-smoke.test.tsx`

- [ ] **Step 1: Escrever teste vermelho da jornada pública**

```tsx
test("detalhe oferece reservar e ser avisado sem linguagem de validação", async () => {
  render(await SpaceDetailPage({ params: Promise.resolve({ slug: "quintal-da-praca" }) }));
  expect(screen.getByRole("link", { name: /reservar este espaço/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /quero ser avisado/i })).toBeInTheDocument();
  expect(screen.queryByText(/validação|ilustrativo|acesso antecipado/i)).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Executar vermelho**

Run: `npm test -- src/app/marketplace-smoke.test.tsx`

Expected: FAIL se qualquer página ainda apresentar a linguagem anterior.

- [ ] **Step 3: Atualizar textos e documentação**

Remover a linguagem interna de UI e metadados, substituir estado vazio por `Ainda não encontramos opções nessa combinação` com CTA de aviso, documentar variáveis Supabase, migrações e consulta da view atualizada.

- [ ] **Step 4: Executar verificação final**

Run: `npm test && npm run lint && npm run typecheck && npm run build && git diff --check`

Expected: todos terminam com código 0.

- [ ] **Step 5: Commit e opções de integração**

```bash
git add README.md src/app src/components src/lib supabase package.json package-lock.json
git commit -m "feat: finaliza experiência de marketplace"
```

Apresentar opções para manter commits locais, merge ou push; não enviar ao remoto sem pedido explícito.
