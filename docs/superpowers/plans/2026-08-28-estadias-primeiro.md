# Estadias em primeiro lugar — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reposicionar o Pátio Livre para que hospedagem e pernoite sejam o cerne da home, com lazer como opção complementar, sem mudar o fluxo de solicitação, confirmação por e-mail, captura de interesse ou analytics.

**Architecture:** Um novo módulo de domínio (`src/lib/domain/stay.ts`) define as três intenções públicas — `hospedagem`, `pernoite`, `lazer` — e as traduz para os `UseType` já existentes. Os filtros passam a aceitar a intenção pela URL (`intencao`) mantendo `uso` como parâmetro canônico, e o catálogo ganha metadados **opcionais** de estadia (`stayFeatures`, `stayNote`). Home, cards, resultados e detalhe consomem a intenção para adaptar título, copy e CTA, sem duplicar o fluxo de solicitação.

**Tech Stack:** Next.js 16 (App Router, Server Components), React 19, TypeScript, Tailwind CSS 4, Vitest + Testing Library, Supabase (não é tocado por este plano).

## Global Constraints

- **Nunca prometer disponibilidade.** Todo CTA leva a uma *solicitação*; a confirmação é feita pela equipe. Os termos "reserva confirmada", "reserva garantida", "disponibilidade confirmada" e "vaga garantida" são proibidos e já verificados por `src/test/public-copy.test.ts`.
- **Sem pessoas no conteúdo público:** nenhuma foto de pessoa, perfil de anfitrião, nome pessoal, avaliação numérica, estrela ou comentário fictício.
- **Linguagem de validação proibida** (já verificada por `src/test/public-copy.test.ts`): "validação", "acesso antecipado", "ilustrativ", "imaginad", "conceitual", "novidades", "não é uma reserva", "pedir acesso", "manifeste interesse", "demanda".
- **Flexibilidade do catálogo:** um mesmo espaço pode atender hospedagem, pernoite, creche e lazer. `allowedUses` continua sendo a única fonte de compatibilidade. Nenhum metadado novo pode ser obrigatório.
- **Fronteira cliente/servidor:** um Server Component só pode importar *componentes* (ou tipos) de um módulo `"use client"`. Funções comuns moram em módulos sem `"use client"`. Verificado por `src/test/client-boundary.test.ts`.
- **Fluxos preservados:** rotas `/api/interests`, `/api/drafts`, `/api/events`, magic link, RLS e nomes de eventos do funil não mudam.
- **Todo texto público em português do Brasil.**
- **Imagens:** só usar ids de foto do Unsplash que já existem no repositório. Não inventar ids novos.
- **Comandos de verificação:** `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`.
- **Baseline antes de começar:** 26 arquivos de teste, 112 testes passando.

---

### Task 1: Domínio das intenções de estadia

**Files:**
- Create: `src/lib/domain/stay.ts`
- Create: `src/lib/domain/stay.test.ts`

**Interfaces:**
- Consumes: `UseType`, `USE_TYPES` de `src/lib/domain/catalog.ts`.
- Produces:
  - `STAY_INTENTS: readonly ["hospedagem", "pernoite", "lazer"]`
  - `type StayIntent = "hospedagem" | "pernoite" | "lazer"`
  - `STAY_INTENT_LABELS: Record<StayIntent, string>`
  - `STAY_INTENT_TAGLINES: Record<StayIntent, string>`
  - `LEISURE_USES: UseType[]`
  - `USE_TYPES_BY_STAY_PRIORITY: UseType[]`
  - `usesForIntent(intent: StayIntent): UseType[]`
  - `intentForUseType(useType: UseType | undefined): StayIntent | undefined`
  - `isOvernightIntent(intent: StayIntent | undefined): boolean`
  - `isStayIntent(value: string | null | undefined): value is StayIntent`

- [ ] **Step 1: Write the failing test**

Create `src/lib/domain/stay.test.ts`:

```ts
import { USE_TYPES } from "./catalog";
import {
  LEISURE_USES,
  STAY_INTENTS,
  STAY_INTENT_LABELS,
  STAY_INTENT_TAGLINES,
  USE_TYPES_BY_STAY_PRIORITY,
  intentForUseType,
  isOvernightIntent,
  isStayIntent,
  usesForIntent,
} from "./stay";

test("a home oferece três intenções, com estadia antes de lazer", () => {
  expect(STAY_INTENTS).toEqual(["hospedagem", "pernoite", "lazer"]);
  for (const intent of STAY_INTENTS) {
    expect(STAY_INTENT_LABELS[intent], `rótulo ausente: ${intent}`).toBeTruthy();
    expect(STAY_INTENT_TAGLINES[intent], `apoio ausente: ${intent}`).toBeTruthy();
  }
});

test("hospedagem e pernoite viram um uso só; lazer agrupa as ocasiões de visita", () => {
  expect(usesForIntent("hospedagem")).toEqual(["hospedagem"]);
  expect(usesForIntent("pernoite")).toEqual(["pernoite"]);
  expect(usesForIntent("lazer")).toEqual(LEISURE_USES);
  expect(LEISURE_USES).not.toContain("hospedagem");
  expect(LEISURE_USES).not.toContain("pernoite");
  // Creche é cão sob cuidado de outra casa, não é lazer junto com o tutor.
  expect(LEISURE_USES).not.toContain("creche");
});

test("o uso da URL indica de volta a intenção que o tutor escolheu", () => {
  expect(intentForUseType("hospedagem")).toBe("hospedagem");
  expect(intentForUseType("pernoite")).toBe("pernoite");
  expect(intentForUseType("brincadeira")).toBe("lazer");
  expect(intentForUseType("passeio")).toBe("lazer");
  expect(intentForUseType("creche")).toBeUndefined();
  expect(intentForUseType(undefined)).toBeUndefined();
});

test("hospedagem e pernoite são as intenções em que o cão dorme fora", () => {
  expect(isOvernightIntent("hospedagem")).toBe(true);
  expect(isOvernightIntent("pernoite")).toBe(true);
  expect(isOvernightIntent("lazer")).toBe(false);
  expect(isOvernightIntent(undefined)).toBe(false);
});

test("só valores conhecidos passam como intenção", () => {
  expect(isStayIntent("hospedagem")).toBe(true);
  expect(isStayIntent("festa")).toBe(false);
  expect(isStayIntent(null)).toBe(false);
  expect(isStayIntent(undefined)).toBe(false);
});

test("a ordem de apresentação das ocasiões começa pelas estadias", () => {
  expect(USE_TYPES_BY_STAY_PRIORITY.slice(0, 3)).toEqual(["hospedagem", "pernoite", "creche"]);
  expect([...USE_TYPES_BY_STAY_PRIORITY].sort()).toEqual([...USE_TYPES].sort());
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/domain/stay.test.ts`
Expected: FAIL — `Failed to resolve import "./stay"`.

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/domain/stay.ts`:

```ts
import type { UseType } from "./catalog";

/**
 * As três portas de entrada da home. Hospedagem e pernoite são o cerne — o cão
 * fica sob os cuidados de outra casa. Lazer é a opção complementar de quem
 * procura um lugar para usar junto com o cão.
 */
export const STAY_INTENTS = ["hospedagem", "pernoite", "lazer"] as const;
export type StayIntent = (typeof STAY_INTENTS)[number];

export const STAY_INTENT_LABELS: Record<StayIntent, string> = {
  hospedagem: "Hospedagem",
  pernoite: "Pernoite",
  lazer: "Lazer",
};

export const STAY_INTENT_TAGLINES: Record<StayIntent, string> = {
  hospedagem: "Vários dias em uma casa que recebe seu cão",
  pernoite: "Uma noite fora, com abrigo e lugar de descanso",
  lazer: "Um tempo em um espaço reservado, junto com seu cão",
};

/** Ocasiões que o tutor vive junto com o cão — o que a intenção "lazer" cobre. */
export const LEISURE_USES: UseType[] = ["passeio", "brincadeira", "treino", "socializacao"];

/** Ordem em que as ocasiões aparecem na home: estadia primeiro, lazer depois. */
export const USE_TYPES_BY_STAY_PRIORITY: UseType[] = [
  "hospedagem",
  "pernoite",
  "creche",
  "passeio",
  "brincadeira",
  "socializacao",
  "treino",
];

export function usesForIntent(intent: StayIntent): UseType[] {
  return intent === "lazer" ? LEISURE_USES : [intent];
}

/**
 * Caminho de volta: a URL carrega `uso`, e é dele que a página descobre com
 * que intenção o tutor chegou. Creche fica de fora das três portas — continua
 * acessível pelo filtro, mas não é nem estadia noturna nem lazer junto.
 */
export function intentForUseType(useType: UseType | undefined): StayIntent | undefined {
  if (!useType) return undefined;
  if (useType === "hospedagem" || useType === "pernoite") return useType;
  return LEISURE_USES.includes(useType) ? "lazer" : undefined;
}

/** Intenções em que o cão dorme fora e a copy fala de acolhimento. */
export function isOvernightIntent(intent: StayIntent | undefined): boolean {
  return intent === "hospedagem" || intent === "pernoite";
}

export function isStayIntent(value: string | null | undefined): value is StayIntent {
  return typeof value === "string" && (STAY_INTENTS as readonly string[]).includes(value);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/domain/stay.test.ts`
Expected: PASS (6 testes).

- [ ] **Step 5: Commit**

```bash
git add src/lib/domain/stay.ts src/lib/domain/stay.test.ts
git commit -m "feat: define as intencoes de estadia da home"
```

---

### Task 2: Filtros aceitam a intenção pela URL

**Files:**
- Modify: `src/lib/domain/filters.ts`
- Modify: `src/lib/domain/filters.test.ts` (acrescentar testes ao fim do arquivo)

**Interfaces:**
- Consumes: `StayIntent`, `isStayIntent`, `intentForUseType`, `usesForIntent` da Task 1.
- Produces:
  - `SearchFilters` ganha o campo opcional `stayIntent?: StayIntent`.
  - `filtersFromSearchParams` passa a ler `intencao`.
  - `filtersToSearchParams` emite `intencao=lazer` quando não há `uso`.

**Regras (decisões travadas):**
- `uso` continua canônico. `intencao=hospedagem` e `intencao=pernoite` são traduzidos para `useType`, então o painel de filtros já chega com o uso pré-selecionado.
- `intencao=lazer` não fixa um `uso` — filtra pelos usos de lazer e deixa o tutor refinar.
- A intenção **nunca** entra em `RELAXABLE`: é o que o tutor veio procurar.

- [ ] **Step 1: Write the failing test**

Acrescentar ao fim de `src/lib/domain/filters.test.ts`:

```ts
test("a home manda hospedagem como intenção e o uso chega pré-selecionado", () => {
  const filters = filtersFromSearchParams(new URLSearchParams("intencao=hospedagem&zona=Sul"));

  expect(filters.useType).toBe("hospedagem");
  expect(filters.stayIntent).toBe("hospedagem");
  expect(filtersToSearchParams(filters).get("uso")).toBe("hospedagem");
});

test("pernoite chega da home do mesmo jeito", () => {
  const filters = filtersFromSearchParams(new URLSearchParams("intencao=pernoite"));

  expect(filters.useType).toBe("pernoite");
  expect(filters.stayIntent).toBe("pernoite");
});

test("lazer filtra pelas ocasiões de visita sem prender um uso só", () => {
  const filters = filtersFromSearchParams(new URLSearchParams("intencao=lazer"));

  expect(filters.useType).toBeUndefined();
  expect(filters.stayIntent).toBe("lazer");

  const matches = applyFilters(SPACES, filters);
  expect(matches.length).toBeGreaterThan(0);
  for (const space of matches) {
    expect(
      space.allowedUses.some((use) => LEISURE_USES.includes(use)),
      `espaço sem ocasião de lazer: ${space.slug}`,
    ).toBe(true);
  }

  expect(filtersToSearchParams(filters).get("intencao")).toBe("lazer");
});

test("um uso na URL basta para saber a intenção, sem parâmetro extra", () => {
  const filters = filtersFromSearchParams(new URLSearchParams("uso=brincadeira"));

  expect(filters.stayIntent).toBe("lazer");
  expect(filtersToSearchParams(filters).toString()).toBe("uso=brincadeira");
});

test("intenção desconhecida na URL é ignorada", () => {
  const filters = filtersFromSearchParams(new URLSearchParams("intencao=festa"));

  expect(filters.stayIntent).toBeUndefined();
  expect(filters.useType).toBeUndefined();
});

test("o uso explícito manda sobre a intenção da URL", () => {
  const filters = filtersFromSearchParams(new URLSearchParams("uso=creche&intencao=lazer"));

  expect(filters.useType).toBe("creche");
  expect(filters.stayIntent).toBeUndefined();
});

/**
 * Afrouxar a busca pode ceder bairro, zona ou período, mas nunca a intenção:
 * quem procura hospedagem não quer ver espaço que só recebe para brincar.
 */
test("a busca ampliada preserva a intenção de estadia", () => {
  const filters = filtersFromSearchParams(
    new URLSearchParams("intencao=hospedagem&bairro=Pinheiros&periodo=noite&caes=8"),
  );
  const { spaces, relaxed } = searchSpaces(SPACES, filters);

  expect(spaces.length).toBeGreaterThan(0);
  expect(relaxed.length).toBeGreaterThan(0);
  for (const space of spaces) expect(space.allowedUses).toContain("hospedagem");
});
```

E acrescentar `LEISURE_USES` ao import de `./stay` no topo do arquivo:

```ts
import { LEISURE_USES } from "./stay";
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/domain/filters.test.ts`
Expected: FAIL — `filters.stayIntent` é `undefined` e o parâmetro `intencao` não é lido.

- [ ] **Step 3: Write minimal implementation**

Em `src/lib/domain/filters.ts`:

1. Acrescentar ao import existente de `./catalog` nada novo, e adicionar o import do domínio de estadia:

```ts
import { intentForUseType, isStayIntent, usesForIntent, type StayIntent } from "./stay";
```

2. Acrescentar o campo ao tipo:

```ts
export type SearchFilters = {
  query: string;
  zone?: Zone;
  useType?: UseType;
  dogSize?: DogSize;
  dogCount?: number;
  timeSlot?: TimeSlot;
  neighborhood?: string;
  /** Intenção com que o tutor chegou. Nunca cede na busca ampliada. */
  stayIntent?: StayIntent;
};
```

3. Em `applyFilters`, calcular os usos da intenção antes do `filter` e acrescentar a condição ao `return` (depois da linha do `useType`):

```ts
  const intentUses = filters.stayIntent ? usesForIntent(filters.stayIntent) : undefined;
```

```ts
      (!intentUses || space.allowedUses.some((use) => intentUses.includes(use))) &&
```

4. Em `filtersToSearchParams`, depois da linha do `uso`:

```ts
  // `uso` é canônico; `intencao` só aparece quando a escolha é ampla (lazer).
  if (!filters.useType && filters.stayIntent) params.set("intencao", filters.stayIntent);
```

5. Em `filtersFromSearchParams`, substituir o cálculo do `useType` e do retorno:

```ts
export function filtersFromSearchParams(params: URLSearchParams): SearchFilters {
  const zone = params.get("zona");
  const rawUseType = params.get("uso");
  const rawIntent = params.get("intencao");
  const dogSize = params.get("porte");
  const rawDogCount = Number(params.get("caes"));
  const timeSlot = params.get("periodo");
  const neighborhood = params.get("bairro");

  // A home manda `intencao`; hospedagem e pernoite viram uso, para o painel de
  // filtros já mostrar a ocasião marcada.
  const intent = isStayIntent(rawIntent) ? rawIntent : undefined;
  const useType = isOneOf(USE_TYPES, rawUseType)
    ? rawUseType
    : intent && intent !== "lazer"
      ? intent
      : undefined;

  return {
    query: params.get("busca") ?? "",
    zone: isOneOf(ZONES, zone) ? zone : undefined,
    useType,
    dogSize: isOneOf(DOG_SIZES, dogSize) ? dogSize : undefined,
    dogCount: Number.isInteger(rawDogCount) && rawDogCount >= 1 && rawDogCount <= 8 ? rawDogCount : undefined,
    timeSlot: isOneOf(TIME_SLOTS, timeSlot) ? timeSlot : undefined,
    neighborhood: neighborhood && CATALOG_NEIGHBORHOODS.includes(neighborhood) ? neighborhood : undefined,
    stayIntent: intentForUseType(useType) ?? (useType ? undefined : intent),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/domain/filters.test.ts`
Expected: PASS — todos os testes do arquivo, novos e antigos.

- [ ] **Step 5: Commit**

```bash
git add src/lib/domain/filters.ts src/lib/domain/filters.test.ts
git commit -m "feat: filtros entendem a intencao de estadia da URL"
```

---

### Task 3: Metadados opcionais de estadia no catálogo

**Files:**
- Modify: `src/lib/domain/catalog.ts`
- Modify: `src/lib/domain/catalog.test.ts` (acrescentar testes ao fim)

**Interfaces:**
- Produces:
  - `STAY_FEATURES: readonly ["ambiente-interno", "area-coberta", "jardim-cercado", "canto-de-descanso", "acompanhamento-noturno"]`
  - `type StayFeature = (typeof STAY_FEATURES)[number]`
  - `STAY_FEATURE_LABELS: Record<StayFeature, string>`
  - `Space.stayFeatures?: StayFeature[]` e `Space.stayNote?: string` (ambos opcionais)
  - `FEATURED_SLUGS` passa a listar espaços que recebem para estadia.

- [ ] **Step 1: Write the failing test**

Acrescentar ao fim de `src/lib/domain/catalog.test.ts` (e acrescentar `FEATURED_SPACES`, `STAY_FEATURES`, `STAY_FEATURE_LABELS` ao import do topo do arquivo):

```ts
test("os sinais de acolhimento têm rótulo e falam de casa, não de quintal alugado", () => {
  expect(STAY_FEATURES.length).toBeGreaterThanOrEqual(4);
  for (const feature of STAY_FEATURES) {
    expect(STAY_FEATURE_LABELS[feature], `rótulo ausente: ${feature}`).toBeTruthy();
  }
});

test("os metadados de estadia são opcionais e só existem em espaço que recebe estadia", () => {
  const comMetadado = SPACES.filter((space) => space.stayFeatures?.length);
  const semMetadado = SPACES.filter((space) => !space.stayFeatures?.length);

  expect(comMetadado.length).toBeGreaterThanOrEqual(10);
  // A ausência precisa continuar existindo: o card não pode depender do dado.
  expect(semMetadado.length).toBeGreaterThan(0);

  for (const space of SPACES) {
    for (const feature of space.stayFeatures ?? []) {
      expect(STAY_FEATURES, `sinal desconhecido em ${space.slug}`).toContain(feature);
    }
    if (space.stayFeatures?.length || space.stayNote) {
      expect(
        space.allowedUses.some((use) => OVERNIGHT_USES.includes(use)),
        `sinal de estadia em espaço que não recebe estadia: ${space.slug}`,
      ).toBe(true);
    }
  }
});

test("todo espaço de hospedagem descreve como acolhe", () => {
  for (const space of SPACES.filter((s) => s.allowedUses.includes("hospedagem"))) {
    expect(space.stayFeatures?.length, `hospedagem sem sinais: ${space.slug}`).toBeGreaterThanOrEqual(2);
    expect(space.stayNote, `hospedagem sem rotina de acolhimento: ${space.slug}`).toBeTruthy();
  }
});

test("os destaques da home são casas que recebem para estadia", () => {
  expect(FEATURED_SPACES.length).toBeGreaterThanOrEqual(4);
  for (const space of FEATURED_SPACES) {
    expect(space.allowedUses, `destaque sem hospedagem: ${space.slug}`).toContain("hospedagem");
    expect(["quintal", "salao", "terraco"], `destaque em espaço aberto: ${space.slug}`).toContain(space.spaceType);
    expect(`${space.imageAlt} ${space.description}`.toLowerCase()).not.toMatch(/campo|parque|chácara|bosque/);
  }
  expect(new Set(FEATURED_SPACES.map((space) => space.zone)).size).toBeGreaterThanOrEqual(4);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/domain/catalog.test.ts`
Expected: FAIL — `STAY_FEATURES` não existe; os destaques atuais incluem `campo-belo-aberto`.

- [ ] **Step 3: Write minimal implementation**

Em `src/lib/domain/catalog.ts`:

1. Depois de `SPACE_TYPES`, acrescentar:

```ts
/**
 * Sinais opcionais de acolhimento. Ficam fora de `AMENITIES` de propósito:
 * amenidade descreve o espaço, isto descreve como a casa recebe o cão. Nenhum
 * registro é obrigado a ter todos — o card usa só o que existe.
 */
export const STAY_FEATURES = [
  "ambiente-interno",
  "area-coberta",
  "jardim-cercado",
  "canto-de-descanso",
  "acompanhamento-noturno",
] as const;
```

2. Depois de `export type SpaceType = ...`:

```ts
export type StayFeature = (typeof STAY_FEATURES)[number];
```

3. No tipo `Space`, depois de `description: string;`:

```ts
  /** Sinais de acolhimento, quando o espaço recebe para estadia. Opcional. */
  stayFeatures?: StayFeature[];
  /** Como é a rotina de acolhimento, em uma frase. Opcional. */
  stayNote?: string;
```

4. Depois de `SPACE_TYPE_LABELS`:

```ts
export const STAY_FEATURE_LABELS: Record<StayFeature, string> = {
  "ambiente-interno": "Ambiente interno",
  "area-coberta": "Área coberta",
  "jardim-cercado": "Jardim cercado",
  "canto-de-descanso": "Canto de descanso",
  "acompanhamento-noturno": "Acompanhamento à noite",
};
```

5. Preencher `stayFeatures` e `stayNote` em **todos** os espaços cujo `allowedUses` inclui `"hospedagem"`, e em pelo menos dois que só têm `"pernoite"` (para provar que a camada é parcial). Deixar sem metadado todos os espaços sem estadia e a maioria dos de pernoite. Padrão a seguir, aplicado a cada registro logo depois de `description`:

```ts
    stayFeatures: ["jardim-cercado", "area-coberta", "canto-de-descanso"],
    stayNote: "Recebe um cão por vez, com o mesmo canto de descanso todas as noites.",
```

Regras de preenchimento (o texto varia por espaço, os sinais seguem o registro):
- `jardim-cercado` só onde `amenities` inclui `cercado` **e** `gramado`.
- `area-coberta` em todo `salao` e `terraco`, e nos `quintal` cuja descrição já menciona abrigo, canto coberto ou casinha.
- `ambiente-interno` em `salao` e nos quintais de casa (`casa-do-tremembe`, `casa-da-serra`, `quintal-do-jabaquara`, `patio-do-ipiranga`, `quintal-do-lago`).
- `canto-de-descanso` em todo espaço com `hospedagem`.
- `acompanhamento-noturno` em todo espaço com `hospedagem` e `maxDogs <= 4`.
- `stayNote` fala de rotina, acolhimento e descanso. Nunca cita pessoas, nomes, notas ou avaliações, e nunca promete disponibilidade.

6. Trocar `FEATURED_SLUGS` por casas de estadia, uma por zona:

```ts
/** Atalhos da home: uma casa que recebe para estadia em cada zona. */
export const FEATURED_SLUGS = [
  "quintal-higienopolis",
  "casa-do-tremembe",
  "quintal-do-jabaquara",
  "quintal-de-itaquera",
  "casa-da-serra",
] as const;
```

7. Revisar `imageAlt` e `description` dos cinco destaques para que falem de casa, jardim residencial, área coberta e descanso — nenhum deles pode conter "campo", "parque", "chácara" ou "bosque". Hoje só `quintal-da-praca` está fora da lista, mas confira os cinco. Exemplo do ajuste em `casa-da-serra`:

```ts
    imageAlt: "Quintal de casa com gramado e cerca alta em toda a volta",
    description: "Quintal de casa fechado por cerca alta, com sombra e canto coberto para o descanso.",
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/domain/catalog.test.ts src/components/featured-spaces.test.tsx`
Expected: PASS — inclusive os testes antigos de cobertura de zonas e verticais.

- [ ] **Step 5: Commit**

```bash
git add src/lib/domain/catalog.ts src/lib/domain/catalog.test.ts
git commit -m "feat: catalogo ganha sinais opcionais de acolhimento"
```

---

### Task 4: Seletor de intenção na primeira janela

**Files:**
- Create: `src/components/stay-intent-picker.tsx`
- Create: `src/components/stay-intent-picker.test.tsx`
- Modify: `src/components/location-search.tsx`
- Modify: `src/components/location-search.test.tsx`

**Interfaces:**
- Consumes: `STAY_INTENTS`, `STAY_INTENT_LABELS`, `STAY_INTENT_TAGLINES`, `isOvernightIntent` da Task 1.
- Produces: `<StayIntentPicker />` — grupo de rádios `name="intencao"`, `hospedagem` marcado por padrão. `LocationSearch` passa a renderizar o seletor dentro do mesmo formulário.

**Decisões travadas:**
- São rádios visíveis, não campos escondidos: `location-search.test.tsx` procura o primeiro `input[type="hidden"]` do formulário para checar o local escolhido, e isso precisa continuar valendo.
- Hospedagem e pernoite ficam lado a lado com peso visual maior; lazer aparece abaixo, menor, como opção complementar.

- [ ] **Step 1: Write the failing test**

Create `src/components/stay-intent-picker.test.tsx`:

```ts
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StayIntentPicker } from "./stay-intent-picker";

test("pergunta onde o cão vai ficar e oferece as três intenções", () => {
  render(<StayIntentPicker />);

  expect(screen.getByRole("group", { name: /onde seu cão vai ficar/i })).toBeInTheDocument();
  for (const label of ["Hospedagem", "Pernoite", "Lazer"]) {
    expect(screen.getByRole("radio", { name: new RegExp(label, "i") })).toBeInTheDocument();
  }
});

test("hospedagem vem marcada e as estadias aparecem antes de lazer", () => {
  render(<StayIntentPicker />);

  const radios = screen.getAllByRole("radio") as HTMLInputElement[];

  expect(radios.map((radio) => radio.value)).toEqual(["hospedagem", "pernoite", "lazer"]);
  expect(radios[0]).toBeChecked();
  for (const radio of radios) expect(radio).toHaveAttribute("name", "intencao");
});

test("trocar a intenção marca só a escolhida", async () => {
  const user = userEvent.setup();
  render(<StayIntentPicker />);

  await user.click(screen.getByRole("radio", { name: /pernoite/i }));

  expect(screen.getByRole("radio", { name: /pernoite/i })).toBeChecked();
  expect(screen.getByRole("radio", { name: /hospedagem/i })).not.toBeChecked();
});
```

Acrescentar a `src/components/location-search.test.tsx`:

```ts
test("a busca da home sai com a intenção escolhida", async () => {
  const user = userEvent.setup();

  await user.click(screen.getByRole("radio", { name: /pernoite/i }));
  await user.click(field());
  await user.click(screen.getByRole("option", { name: "Pinheiros" }));

  const form = document.querySelector("form") as HTMLFormElement;
  const data = new FormData(form);

  expect(data.get("intencao")).toBe("pernoite");
  expect(data.get("bairro")).toBe("Pinheiros");
  expect(form).toHaveAttribute("action", "/espacos");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/stay-intent-picker.test.tsx src/components/location-search.test.tsx`
Expected: FAIL — `Failed to resolve import "./stay-intent-picker"` e, em `location-search`, nenhum rádio encontrado.

- [ ] **Step 3: Write minimal implementation**

Create `src/components/stay-intent-picker.tsx`:

```tsx
"use client";

import { useState } from "react";
import {
  STAY_INTENTS,
  STAY_INTENT_LABELS,
  STAY_INTENT_TAGLINES,
  isOvernightIntent,
  type StayIntent,
} from "@/lib/domain/stay";

/**
 * A primeira pergunta da home. Hospedagem e pernoite ocupam a linha de cima e
 * chegam marcados; lazer fica embaixo, menor, como opção complementar.
 */
export function StayIntentPicker({ defaultIntent = "hospedagem" }: { defaultIntent?: StayIntent }) {
  const [selected, setSelected] = useState<StayIntent>(defaultIntent);

  return (
    <fieldset className="grid gap-2 px-1 pb-3 pt-1">
      <legend className="px-3 pb-2 text-sm font-bold text-emerald-950">
        Onde seu cão vai ficar enquanto você não está?
      </legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {STAY_INTENTS.filter((intent) => isOvernightIntent(intent)).map((intent) => (
          <IntentOption
            checked={selected === intent}
            intent={intent}
            key={intent}
            onSelect={setSelected}
            prominent
          />
        ))}
      </div>
      {STAY_INTENTS.filter((intent) => !isOvernightIntent(intent)).map((intent) => (
        <IntentOption checked={selected === intent} intent={intent} key={intent} onSelect={setSelected} />
      ))}
    </fieldset>
  );
}

function IntentOption({
  checked,
  intent,
  onSelect,
  prominent = false,
}: {
  checked: boolean;
  intent: StayIntent;
  onSelect: (intent: StayIntent) => void;
  prominent?: boolean;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 bg-white transition ${
        prominent ? "p-4" : "p-3"
      } ${checked ? "border-emerald-950 shadow-sm" : "border-transparent hover:border-emerald-950/20"}`}
    >
      <input
        checked={checked}
        className="mt-1 size-4 shrink-0 accent-emerald-950"
        name="intencao"
        onChange={() => onSelect(intent)}
        type="radio"
        value={intent}
      />
      <span className="min-w-0">
        <span className={`block font-black text-emerald-950 ${prominent ? "text-base" : "text-sm"}`}>
          {STAY_INTENT_LABELS[intent]}
        </span>
        <span className="mt-0.5 block text-xs leading-5 text-stone-600">{STAY_INTENT_TAGLINES[intent]}</span>
      </span>
    </label>
  );
}
```

Em `src/components/location-search.tsx`, importar o seletor e renderizá-lo dentro do formulário, antes da linha da busca. O formulário passa a ser uma coluna:

```tsx
import { StayIntentPicker } from "./stay-intent-picker";
```

```tsx
    <form
      action="/espacos"
      className="grid gap-1 rounded-3xl bg-white p-2 shadow-xl shadow-emerald-950/10"
      onSubmit={() => trackEvent("search_started")}
    >
      <StayIntentPicker />
      <div className="flex items-center gap-2 border-t border-stone-100 pt-2">
        <ComboBox
          className="min-w-0 grow"
          label="Bairro ou zona em São Paulo"
          labelHidden
          name="bairro"
          options={OPTIONS}
          placeholder="Bairro ou zona"
        />
        <button
          className="shrink-0 rounded-2xl bg-emerald-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
          type="submit"
        >
          Buscar
        </button>
      </div>
    </form>
```

Atualizar em `location-search.test.tsx` o teste "o formulário leva para o catálogo": o botão agora se chama **Buscar**.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/stay-intent-picker.test.tsx src/components/location-search.test.tsx src/test/client-boundary.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/stay-intent-picker.tsx src/components/stay-intent-picker.test.tsx src/components/location-search.tsx src/components/location-search.test.tsx
git commit -m "feat: primeira janela pergunta onde o cao vai ficar"
```

---

### Task 5: Home, destaques e carrossel falam de estadia

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/page.test.tsx`
- Modify: `src/components/featured-spaces.tsx`
- Modify: `src/components/featured-spaces.test.tsx`
- Modify: `src/components/hero-carousel.tsx`
- Create: `src/test/stay-first-copy.test.ts`

**Interfaces:**
- Consumes: `StayIntentPicker` (via `LocationSearch`, Task 4), `USE_TYPES_BY_STAY_PRIORITY` (Task 1), `FEATURED_SPACES` e `STAY_FEATURE_LABELS` (Task 3).
- Produces: home reordenada; `FeaturedSpaces` com título de estadia e contagem vinda de `SPACES.length`.

**Decisões travadas:**
- Os três slides do carrossel reaproveitam ids de foto **já presentes** em `catalog.ts`: `1576897955702-24ad19680db3` (jardim de casa), `1655109371498-30745747d279` (pátio com casinha de madeira), `1777115617638-5373f021de4f` (gramado ao lado de casa de tijolos). O carrossel mantém seu próprio formato de URL (`w=1800&q=90`).
- A grade de ocasiões usa `USE_TYPES_BY_STAY_PRIORITY`.
- `FeaturedSpaces` deixa de dizer "Ver os 30 espaços" (o catálogo tem 42) e passa a usar `SPACES.length`.

- [ ] **Step 1: Write the failing test**

Substituir o primeiro teste de `src/app/page.test.tsx` e acrescentar os novos:

```tsx
test("a home abre pela pergunta da estadia, com hospedagem e pernoite na frente", () => {
  render(<HomePage />);

  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/hospedagem e pernoite/i);
  expect(screen.getByRole("group", { name: /onde seu cão vai ficar/i })).toBeInTheDocument();

  const radios = screen.getAllByRole("radio") as HTMLInputElement[];
  expect(radios.map((radio) => radio.value)).toEqual(["hospedagem", "pernoite", "lazer"]);
});

test("as ocasiões começam pelas estadias e cada uma leva para a busca filtrada", () => {
  render(<HomePage />);

  const occasions = screen
    .getAllByRole("link")
    .map((link) => link.getAttribute("href"))
    .filter((href): href is string => Boolean(href?.startsWith("/espacos?uso=")));

  expect(occasions[0]).toBe("/espacos?uso=hospedagem");
  expect(occasions[1]).toBe("/espacos?uso=pernoite");
  expect(occasions).toContain("/espacos?uso=brincadeira");
});

test("a home reúne carrossel, destaques e dúvidas sem linguagem interna", () => {
  render(<HomePage />);

  expect(screen.getAllByRole("img").length).toBeGreaterThan(0);
  expect(screen.getByRole("heading", { name: /casas para estadia/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /perguntas frequentes/i })).toBeInTheDocument();
  expect(screen.queryByText(/validação|acesso antecipado|ilustrativo/i)).not.toBeInTheDocument();
});
```

Acrescentar a `src/components/featured-spaces.test.tsx`:

```tsx
test("os destaques falam de acolhimento e apontam o catálogo inteiro", () => {
  render(<FeaturedSpaces />);

  expect(screen.getByRole("link", { name: new RegExp(`ver os ${SPACES.length} espaços`, "i") })).toHaveAttribute(
    "href",
    "/espacos",
  );
  expect(screen.getByRole("heading", { name: /casas para estadia/i })).toBeInTheDocument();
});
```

(acrescentar `SPACES` ao import de `@/lib/domain/catalog` nesse arquivo)

Create `src/test/stay-first-copy.test.ts`:

```ts
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { FEATURED_SPACES } from "@/lib/domain/catalog";

const srcRoot = path.resolve(__dirname, "..");

/**
 * A confiança do Pátio Livre vem dos atributos reais do espaço. Perfil de
 * pessoa, nome de cuidador, nota e comentário não existem no produto — e não
 * podem entrar pela porta dos fundos numa copy nova.
 */
const FORBIDDEN_TRUST_COPY = ["anfitri", "avaliaç", "depoiment", "estrela", "★", "⭐", "perfil do", "nota média"];

function publicSourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return publicSourceFiles(full);
    if (!/\.tsx?$/.test(entry.name) || /\.test\.tsx?$/.test(entry.name)) return [];
    return [full];
  });
}

test("nenhum texto público inventa pessoas, perfis ou notas", () => {
  const offenders: string[] = [];

  for (const file of publicSourceFiles(srcRoot)) {
    const content = readFileSync(file, "utf8").toLowerCase();
    for (const term of FORBIDDEN_TRUST_COPY) {
      if (content.includes(term)) offenders.push(`${path.relative(srcRoot, file)} → "${term}"`);
    }
  }

  expect(offenders).toEqual([]);
});

test("a primeira janela e os destaques não vendem campo, parque ou chácara", () => {
  const abertos = /campo|parque|chácara|bosque|pastagem/i;

  const carousel = readFileSync(path.join(srcRoot, "components/hero-carousel.tsx"), "utf8");
  for (const alt of carousel.matchAll(/alt:\s*"([^"]+)"/g)) {
    expect(alt[1], `slide com imagem de espaço aberto: ${alt[1]}`).not.toMatch(abertos);
  }

  for (const space of FEATURED_SPACES) {
    expect(`${space.name} ${space.imageAlt} ${space.description}`).not.toMatch(abertos);
  }
});

test("a home fala de estadia antes de lazer", () => {
  const home = readFileSync(path.join(srcRoot, "app/page.tsx"), "utf8").toLowerCase();
  const estadia = home.indexOf("hospedagem");
  const lazer = home.indexOf("lazer");

  expect(estadia, "a home não menciona hospedagem").toBeGreaterThanOrEqual(0);
  if (lazer >= 0) expect(estadia).toBeLessThan(lazer);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/page.test.tsx src/components/featured-spaces.test.tsx src/test/stay-first-copy.test.ts`
Expected: FAIL — o H1 atual não fala de hospedagem, os destaques ainda se chamam "Espaços em destaque", e os slides do carrossel citam campo.

- [ ] **Step 3: Write minimal implementation**

Em `src/components/hero-carousel.tsx`, trocar `SLIDES`:

```tsx
const SLIDES: Slide[] = [
  {
    src: "https://images.unsplash.com/photo-1576897955702-24ad19680db3?auto=format&fit=crop&w=1800&q=90",
    alt: "Jardim de casa com caminho de grama entre canteiros",
  },
  {
    src: "https://images.unsplash.com/photo-1655109371498-30745747d279?auto=format&fit=crop&w=1800&q=90",
    alt: "Pátio residencial com casinha de madeira abrigada",
  },
  {
    src: "https://images.unsplash.com/photo-1777115617638-5373f021de4f?auto=format&fit=crop&w=1800&q=90",
    alt: "Gramado cercado ao lado de uma casa de tijolos",
  },
];
```

Em `src/components/featured-spaces.tsx`:
- Importar `SPACES` e `STAY_FEATURE_LABELS` de `@/lib/domain/catalog`.
- Cabeçalho:

```tsx
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">Hospedagem e pernoite</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-emerald-950 sm:text-4xl">Casas para estadia</h2>
          <p className="mt-3 text-base leading-7 text-stone-600">
            Casas com jardim cercado, área coberta e canto de descanso, uma em cada canto da cidade.
          </p>
```

- No corpo do card, trocar a linha de tipo/zona por um sinal de acolhimento quando existir, mantendo o mesmo espaço quando não existir:

```tsx
                  <p className="truncate text-[0.7rem] font-bold uppercase tracking-[0.12em] text-emerald-700">
                    {SPACE_TYPE_LABELS[space.spaceType]} · {space.zone}
                  </p>
                  <h3 className="mt-1 text-base font-black leading-tight text-emerald-950">{space.name}</h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-stone-600">
                    {space.stayFeatures?.length
                      ? space.stayFeatures.map((feature) => STAY_FEATURE_LABELS[feature]).join(" · ")
                      : `Até ${space.maxDogs} ${space.maxDogs === 1 ? "cão" : "cães"}`}
                  </p>
```

- Botão final:

```tsx
            Ver os {SPACES.length} espaços →
```

Em `src/app/page.tsx`:
- Trocar o import de `USE_TYPES` por `USE_TYPES_BY_STAY_PRIORITY` (de `@/lib/domain/stay`), mantendo `USE_TYPE_LABELS` e `type UseType` vindos de `catalog`.
- Copy do herói:

```tsx
            <p className="mb-5 inline-flex rounded-full bg-lime-300 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-emerald-950">
              Estadias para cães em São Paulo
            </p>
            <h1 className="text-[2.6rem] font-black leading-[0.95] tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
              Hospedagem e pernoite em casas que recebem seu cão.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-emerald-50/90 sm:mt-6 sm:text-lg">
              Casas com jardim cercado, área coberta e canto de descanso — e, quando o programa é junto, espaços
              reservados para vocês dois.
            </p>
```

E o texto de apoio abaixo da busca:

```tsx
              <p className="px-4 pb-3 pt-2 text-xs font-medium text-emerald-950/70">
                Escolha a estadia e a região — dá para digitar o bairro ou a zona.
              </p>
```

- Seção das ocasiões:

```tsx
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-lime-300">Cada rotina tem um ritmo</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Como seu cão pode ficar
            </h2>
            <p className="mt-3 text-base leading-7 text-emerald-100/75">
              De uma hospedagem de vários dias a uma tarde de brincadeira junto com você. Escolha a ocasião e veja
              quem atende.
            </p>
```

e o `map` passa a percorrer `USE_TYPES_BY_STAY_PRIORITY`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/page.test.tsx src/components/featured-spaces.test.tsx src/components/hero-carousel.test.tsx src/test/stay-first-copy.test.ts src/test/public-copy.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/app/page.test.tsx src/components/featured-spaces.tsx src/components/featured-spaces.test.tsx src/components/hero-carousel.tsx src/test/stay-first-copy.test.ts
git commit -m "feat: home abre pela estadia e destaca casas que acolhem"
```

---

### Task 6: Card de espaço com foco em acolhimento

**Files:**
- Modify: `src/components/space-card.tsx`
- Create: `src/components/space-card.test.tsx`
- Modify: `src/components/space-results.tsx`
- Modify: `src/components/space-results.test.tsx`

**Interfaces:**
- Consumes: `StayIntent`, `isOvernightIntent` (Task 1); `STAY_FEATURE_LABELS` (Task 3); `SearchFilters.stayIntent` (Task 2).
- Produces: `<SpaceCard space={space} intent={intent} />` com `intent?: StayIntent`. `SpaceResults` repassa `filters.stayIntent`.

- [ ] **Step 1: Write the failing test**

Create `src/components/space-card.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { getSpaceBySlug, type Space } from "@/lib/domain/catalog";
import { SpaceCard } from "./space-card";

const stay = getSpaceBySlug("casa-do-tremembe") as Space;
const leisure = getSpaceBySlug("campo-do-sol") as Space;

test("na intenção de hospedagem o card fala de acolhimento", () => {
  render(<SpaceCard intent="hospedagem" space={stay} />);

  expect(screen.getByText(/recebe para estadia/i)).toBeInTheDocument();
  expect(screen.getByText(new RegExp(stay.stayNote as string, "i"))).toBeInTheDocument();
  expect(screen.getByRole("link", { name: new RegExp(stay.name, "i") })).toHaveAttribute(
    "href",
    `/espacos/${stay.slug}?uso=hospedagem`,
  );
});

test("na intenção de lazer o card mantém o foco em usar o espaço", () => {
  render(<SpaceCard intent="lazer" space={leisure} />);

  expect(screen.queryByText(/recebe para estadia/i)).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: new RegExp(leisure.name, "i") })).toHaveAttribute(
    "href",
    `/espacos/${leisure.slug}`,
  );
});

test("espaço sem metadado de estadia continua renderizando o card inteiro", () => {
  const semMetadados: Space = { ...stay, stayFeatures: undefined, stayNote: undefined };

  render(<SpaceCard intent="hospedagem" space={semMetadados} />);

  expect(screen.getByRole("heading", { name: semMetadados.name })).toBeInTheDocument();
  expect(screen.getByText(new RegExp(`até ${semMetadados.maxDogs}`, "i"))).toBeInTheDocument();
});

test("sem intenção o card não inventa contexto de estadia", () => {
  render(<SpaceCard space={leisure} />);

  expect(screen.getByRole("heading", { name: leisure.name })).toBeInTheDocument();
  expect(screen.queryByText(/recebe para estadia/i)).not.toBeInTheDocument();
});
```

Acrescentar a `src/components/space-results.test.tsx`:

```tsx
test("os resultados de hospedagem passam a intenção para os cards", () => {
  const spaces = SPACES.filter((space) => space.allowedUses.includes("hospedagem")).slice(0, 2);

  render(<SpaceResults filters={{ query: "", useType: "hospedagem", stayIntent: "hospedagem" }} spaces={spaces} />);

  expect(screen.getAllByText(/recebe para estadia/i).length).toBe(spaces.length);
});
```

(garantir que `SPACES` esteja importado nesse arquivo de teste)

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/space-card.test.tsx src/components/space-results.test.tsx`
Expected: FAIL — `SpaceCard` não aceita `intent` e não escreve "Recebe para estadia".

- [ ] **Step 3: Write minimal implementation**

Substituir `src/components/space-card.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";
import {
  AMENITY_LABELS,
  DOG_SIZE_LABELS,
  SPACE_TYPE_LABELS,
  STAY_FEATURE_LABELS,
  TIME_SLOT_LABELS,
  USE_TYPE_LABELS,
  type Space,
} from "@/lib/domain/catalog";
import { isOvernightIntent, type StayIntent } from "@/lib/domain/stay";

type SpaceCardProps = {
  space: Space;
  /** Intenção com que o tutor chegou, para o card falar a língua certa. */
  intent?: StayIntent;
};

export function SpaceCard({ space, intent }: SpaceCardProps) {
  const stayFocus = isOvernightIntent(intent);
  // Só os sinais que este espaço tem: metadado de estadia é opcional.
  const highlights = stayFocus && space.stayFeatures?.length
    ? space.stayFeatures.slice(0, 3).map((feature) => STAY_FEATURE_LABELS[feature])
    : space.amenities.slice(0, 2).map((amenity) => AMENITY_LABELS[amenity]);
  const stayUse = stayFocus && intent ? intent : undefined;
  const uses = stayUse
    ? [stayUse, ...space.allowedUses.filter((use) => use !== stayUse)].slice(0, 2)
    : space.allowedUses.slice(0, 2);
  const href = stayUse ? `/espacos/${space.slug}?uso=${stayUse}` : `/espacos/${space.slug}`;

  return (
    <article className="group overflow-hidden rounded-3xl border border-emerald-950/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link aria-label={`Conhecer ${space.name}`} className="block" href={href}>
        <div className="relative aspect-[4/3] overflow-hidden bg-emerald-100">
          <Image
            alt={space.imageAlt}
            className="object-cover transition duration-500 group-hover:scale-105"
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
            src={space.imageUrl}
          />
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-950">
            {stayFocus ? "Recebe para estadia" : SPACE_TYPE_LABELS[space.spaceType]}
          </span>
        </div>
        <div className="grid gap-3 p-4 sm:p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
              {space.neighborhoodLabel} · {space.zone}
            </p>
            <h2 className="mt-1 text-lg font-black leading-tight text-emerald-950 sm:text-xl">{space.name}</h2>
          </div>
          {stayFocus && space.stayNote ? <p className="text-sm leading-6 text-stone-600">{space.stayNote}</p> : null}
          <div className="flex flex-wrap gap-2">
            {uses.map((useType) => (
              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-700" key={useType}>
                {USE_TYPE_LABELS[useType]}
              </span>
            ))}
          </div>
          <p className="text-sm text-stone-600">
            Até {space.maxDogs} {space.maxDogs === 1 ? "cão" : "cães"} ·{" "}
            {space.dogSizes.map((size) => DOG_SIZE_LABELS[size].replace(" porte", "")).join(", ")}
          </p>
          <p className="text-xs font-medium text-emerald-800">
            {space.availableSlots.map((slot) => TIME_SLOT_LABELS[slot]).join(" · ")}
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 border-t border-stone-100 pt-3 text-xs font-medium text-stone-500">
            {highlights.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </div>
      </Link>
    </article>
  );
}
```

Em `src/components/space-results.tsx`, repassar a intenção:

```tsx
export function SpaceResults({ spaces, filters }: SpaceResultsProps) {
  return (
    <section aria-label="Espaços para cães" className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {spaces.map((space) => <SpaceCard intent={filters.stayIntent} key={space.slug} space={space} />)}
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/space-card.test.tsx src/components/space-results.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/space-card.tsx src/components/space-card.test.tsx src/components/space-results.tsx src/components/space-results.test.tsx
git commit -m "feat: card mostra acolhimento quando a intencao e estadia"
```

---

### Task 7: Resultados guardam a intenção escolhida

**Files:**
- Modify: `src/app/espacos/page.tsx`
- Create: `src/app/espacos/page.test.tsx`

**Interfaces:**
- Consumes: `filtersFromSearchParams` / `searchSpaces` (Task 2), `STAY_INTENT_LABELS`, `isOvernightIntent` (Task 1).
- Produces: título, subtítulo e link de aviso da página de resultados adaptados à intenção; `intencao` preservada no `alertHref`.

- [ ] **Step 1: Write the failing test**

Create `src/app/espacos/page.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import ResultsPage from "./page";

const renderResults = async (query: Record<string, string>) =>
  render(await ResultsPage({ searchParams: Promise.resolve(query) }));

test("chegando por hospedagem, a página fala de estadia e mantém o filtro", async () => {
  await renderResults({ intencao: "hospedagem" });

  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/hospedagem/i);
  expect(screen.getAllByText(/recebe para estadia/i).length).toBeGreaterThan(0);
});

test("chegando por lazer, a página fala de usar o espaço junto", async () => {
  await renderResults({ intencao: "lazer" });

  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/junto com seu cão/i);
  expect(screen.queryByText(/recebe para estadia/i)).not.toBeInTheDocument();
});

test("o aviso de disponibilidade carrega a combinação que o tutor pediu", async () => {
  await renderResults({ intencao: "hospedagem", bairro: "Pinheiros" });

  for (const link of screen.getAllByRole("link", { name: /avisad/i })) {
    expect(link).toHaveAttribute("href", expect.stringContaining("kind=availability_alert"));
    expect(link).toHaveAttribute("href", expect.stringContaining("intencao=hospedagem"));
    expect(link).toHaveAttribute("href", expect.stringContaining("bairro=Pinheiros"));
  }
});

test("sem intenção nenhuma, a busca continua mostrando o catálogo inteiro", async () => {
  await renderResults({});

  expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  expect(screen.queryByText(/recebe para estadia/i)).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/espacos/page.test.tsx`
Expected: FAIL — o H1 atual é fixo ("Encontre um pátio que combine com vocês").

- [ ] **Step 3: Write minimal implementation**

Em `src/app/espacos/page.tsx`:

```tsx
import { isOvernightIntent, STAY_INTENT_LABELS } from "@/lib/domain/stay";
```

Depois de calcular `filters`:

```tsx
  const intent = filters.stayIntent;
  const heading = isOvernightIntent(intent)
    ? `${STAY_INTENT_LABELS[intent!]} para o seu cão`
    : intent === "lazer"
      ? "Espaços para usar junto com seu cão"
      : "Encontre um lugar que combine com vocês";
  const subheading = isOvernightIntent(intent)
    ? "Casas com jardim cercado, área coberta e canto de descanso. Você envia a solicitação e a equipe confirma os detalhes."
    : "Espaços privados e reservados para passear, brincar e treinar perto de você.";
```

Trocar o H1 e o parágrafo:

```tsx
        <h1 className="mt-2 text-4xl font-black tracking-tight text-emerald-950">{heading}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">{subheading}</p>
```

O `alertHref` já reaproveita `params.toString()`, então `intencao` e `bairro` continuam na URL sem mudança.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/espacos/page.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/espacos/page.tsx src/app/espacos/page.test.tsx
git commit -m "feat: resultados falam a lingua da intencao escolhida"
```

---

### Task 8: Detalhe pede estadia quando é estadia

**Files:**
- Modify: `src/app/espacos/[slug]/page.tsx`
- Modify: `src/app/espacos/[slug]/page.test.tsx`

**Interfaces:**
- Consumes: `isStayIntent`, `isOvernightIntent`, `intentForUseType` (Task 1); `STAY_FEATURE_LABELS` (Task 3).
- Produces: `SpaceDetailPage({ params, searchParams? })` — `searchParams` é **opcional**, para os testes poderem renderizar só com `params`.

**Decisões travadas:**
- A intenção vem da URL (`uso` ou `intencao`). Sem nada na URL, o padrão é estadia quando o espaço recebe hospedagem ou pernoite, e lazer quando não recebe — a home prioriza estadia e o detalhe segue.
- O `uso` mandado ao formulário passa a ser o da intenção quando o espaço a atende; senão continua sendo `space.allowedUses[0]`.
- O CTA nunca promete disponibilidade: continua sendo solicitação + confirmação por e-mail.

- [ ] **Step 1: Write the failing test**

Substituir `src/app/espacos/[slug]/page.test.tsx` pelos testes abaixo (mantendo o terceiro teste atual, sobre tipo e períodos):

```tsx
import { render, screen } from "@testing-library/react";
import SpaceDetailPage from "./page";

const renderDetail = async (slug: string, query: Record<string, string> = {}) =>
  render(await SpaceDetailPage({ params: Promise.resolve({ slug }), searchParams: Promise.resolve(query) }));

test("na intenção de hospedagem o detalhe pede uma estadia", async () => {
  await renderDetail("casa-do-tremembe", { uso: "hospedagem" });

  const cta = screen.getByRole("link", { name: /solicitar estadia/i });

  expect(cta).toHaveAttribute("href", expect.stringContaining("kind=reservation_request"));
  expect(cta).toHaveAttribute("href", expect.stringContaining("uso=hospedagem"));
  expect(screen.getByText(/confirma seu e-mail/i)).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: /quero ser avisado/i })).not.toBeInTheDocument();
});

test("na intenção de lazer o detalhe pede o uso do espaço", async () => {
  await renderDetail("campo-do-sol", { intencao: "lazer" });

  const cta = screen.getByRole("link", { name: /solicitar uso do espaço/i });

  expect(cta).toHaveAttribute("href", expect.stringContaining("kind=reservation_request"));
  expect(screen.getByText(/escolha a data e o período/i)).toBeInTheDocument();
});

test("o espaço que recebe estadia mostra como acolhe", async () => {
  await renderDetail("casa-do-tremembe", { uso: "hospedagem" });

  expect(screen.getByText("Como acolhe")).toBeInTheDocument();
  expect(screen.getByText("Canto de descanso")).toBeInTheDocument();
});

test("espaço sem metadado de estadia não mostra a seção de acolhimento", async () => {
  await renderDetail("campo-do-sol");

  expect(screen.queryByText("Como acolhe")).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: /solicitar uso do espaço/i })).toBeInTheDocument();
});

test("mostra o tipo de espaço e os períodos que ele recebe", async () => {
  render(await SpaceDetailPage({ params: Promise.resolve({ slug: "quintal-da-praca" }) }));

  expect(screen.getByText("Quintal")).toBeInTheDocument();
  expect(screen.getByText("Períodos que recebe")).toBeInTheDocument();
  expect(screen.getByText("Manhã")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run "src/app/espacos/[slug]/page.test.tsx"`
Expected: FAIL — a página não aceita `searchParams` e o CTA se chama "Reservar este espaço".

- [ ] **Step 3: Write minimal implementation**

Em `src/app/espacos/[slug]/page.tsx`:

```tsx
import {
  AMENITY_LABELS,
  DOG_SIZE_LABELS,
  SPACE_TYPE_LABELS,
  STAY_FEATURE_LABELS,
  TIME_SLOT_LABELS,
  USE_TYPES,
  USE_TYPE_LABELS,
  getSpaceBySlug,
  type UseType,
} from "@/lib/domain/catalog";
import { intentForUseType, isOvernightIntent, isStayIntent, type StayIntent } from "@/lib/domain/stay";

type SpaceDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SpaceDetailPage({ params, searchParams }: SpaceDetailPageProps) {
  const space = getSpaceBySlug((await params).slug);
  if (!space) notFound();

  const query = (await searchParams) ?? {};
  const rawUse = typeof query.uso === "string" ? query.uso : undefined;
  const rawIntent = typeof query.intencao === "string" ? query.intencao : undefined;
  const urlUse = (USE_TYPES as readonly string[]).includes(rawUse ?? "") ? (rawUse as UseType) : undefined;

  /**
   * A intenção vem da URL; sem ela, estadia é o padrão de quem recebe estadia.
   * É o cerne do produto — lazer só assume quando o espaço não acolhe à noite.
   */
  const intent: StayIntent =
    intentForUseType(urlUse) ??
    (isStayIntent(rawIntent) ? rawIntent : undefined) ??
    (space.allowedUses.includes("hospedagem")
      ? "hospedagem"
      : space.allowedUses.includes("pernoite")
        ? "pernoite"
        : "lazer");

  const stayFocus = isOvernightIntent(intent) && space.allowedUses.includes(intent);
  const requestedUse = stayFocus ? intent : space.allowedUses[0];

  // O formulário só aceita bairros da lista, então mandamos o nome sem o prefixo.
  const requestParams = new URLSearchParams({
    space: space.slug,
    zona: space.zone,
    bairro: space.neighborhood,
    uso: requestedUse,
    periodo: space.availableSlots[0],
  });
  const reserveHref = `/reservar?kind=reservation_request&${requestParams.toString()}`;
```

No painel de atributos, acrescentar o bloco de acolhimento **antes** de "Recursos", só quando houver metadado:

```tsx
            {space.stayFeatures?.length ? (
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-stone-400">Como acolhe</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {space.stayFeatures.map((feature) => (
                    <span className="rounded-full bg-lime-100 px-3 py-1 text-sm font-medium text-emerald-950" key={feature}>
                      {STAY_FEATURE_LABELS[feature]}
                    </span>
                  ))}
                </div>
                {space.stayNote ? <p className="mt-3 text-sm leading-6 text-stone-600">{space.stayNote}</p> : null}
              </div>
            ) : null}
```

E o CTA:

```tsx
          <section className="rounded-3xl bg-emerald-950 p-6 text-white sm:p-7">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-lime-300">
              {stayFocus ? "Quer deixar seu cão aqui?" : "Quer usar este espaço?"}
            </p>
            <h2 className="mt-3 text-2xl font-black leading-tight">
              {stayFocus
                ? "Conte as datas da estadia e o que seu cão precisa."
                : "Escolha a data e o período que combinam com vocês."}
            </h2>
            <p className="mt-3 text-sm leading-6 text-emerald-50/75">
              Você envia a solicitação e confirma seu e-mail. Nossa equipe responde confirmando a disponibilidade.
            </p>
            <Link
              className="mt-6 flex w-full items-center justify-center rounded-xl bg-lime-300 px-5 py-4 text-base font-black text-emerald-950 transition hover:bg-lime-200"
              href={reserveHref}
            >
              {stayFocus ? "Solicitar estadia" : "Solicitar uso do espaço"}
            </Link>
          </section>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run "src/app/espacos/[slug]/page.test.tsx"`
Expected: PASS (5 testes).

- [ ] **Step 5: Commit**

```bash
git add "src/app/espacos/[slug]/page.tsx" "src/app/espacos/[slug]/page.test.tsx"
git commit -m "feat: detalhe pede estadia quando a intencao e hospedagem ou pernoite"
```

---

### Task 9: Solicitação e dúvidas acompanham a estadia

**Files:**
- Modify: `src/app/reservar/page.tsx`
- Modify: `src/app/reservar/page.test.tsx`
- Modify: `src/components/faq-section.tsx`
- Modify: `src/components/faq-section.test.tsx`

**Interfaces:**
- Consumes: `intentForUseType`, `isOvernightIntent` (Task 1).
- Produces: título e subtítulo de `/reservar` adaptados à estadia. O contrato do `InterestForm` e das rotas de API **não muda**.

**Decisão travada:** o `uso` que chega na URL continua sendo a única fonte da ocasião do formulário. A mudança é de copy, não de dado.

- [ ] **Step 1: Write the failing test**

Acrescentar a `src/app/reservar/page.test.tsx`:

```tsx
test("a solicitação de hospedagem se apresenta como estadia", async () => {
  render(await ReservationPage({ searchParams: Promise.resolve({ kind: "reservation_request", uso: "hospedagem" }) }));

  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/estadia/i);
  expect(screen.getByText(/confirme seu e-mail/i)).toBeInTheDocument();
});

test("a solicitação de lazer continua falando de usar o espaço", async () => {
  render(await ReservationPage({ searchParams: Promise.resolve({ kind: "reservation_request", uso: "brincadeira" }) }));

  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/melhor momento/i);
});
```

(conferir o nome do import default usado no arquivo e reaproveitá-lo)

Acrescentar a `src/components/faq-section.test.tsx`:

```tsx
test("as dúvidas explicam como funciona uma estadia", () => {
  render(<FaqSection />);

  expect(screen.getByText(/como funciona uma hospedagem/i)).toBeInTheDocument();
  expect(screen.queryByText(/reserva confirmada|vaga garantida/i)).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/reservar/page.test.tsx src/components/faq-section.test.tsx`
Expected: FAIL — o H1 de `/reservar` é fixo e o FAQ não tem a pergunta de hospedagem.

- [ ] **Step 3: Write minimal implementation**

Em `src/app/reservar/page.tsx`, depois do cálculo de `useType`:

```tsx
  const stayFocus = isOvernightIntent(intentForUseType(useType));
```

com o import:

```tsx
import { intentForUseType, isOvernightIntent } from "@/lib/domain/stay";
```

E a copy do topo:

```tsx
        <p className="mt-10 text-sm font-bold uppercase tracking-[.16em] text-emerald-700">
          {isReservation ? (stayFocus ? "Solicitação de estadia" : "Solicitação de reserva") : "Aviso de disponibilidade"}
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-emerald-950">
          {isReservation
            ? stayFocus
              ? "Vamos organizar a estadia do seu cão."
              : "Vamos encontrar o melhor momento para vocês."
            : "Conte o que você procura."}
        </h1>
        <p className="mt-3 text-stone-600">
          {isReservation
            ? stayFocus
              ? "Conte as datas e o que seu cão precisa, e confirme seu e-mail para enviar a solicitação."
              : "Preencha os detalhes e confirme seu e-mail para enviar sua solicitação."
            : "Deixe seus dados para receber um aviso quando houver uma opção que combine com vocês."}
        </p>
```

Em `src/components/faq-section.tsx`, trocar a primeira pergunta e acrescentar a de hospedagem logo depois:

```ts
  {
    question: "Como funciona uma hospedagem?",
    answer:
      "Você escolhe a casa, envia a solicitação com as datas e confirma seu e-mail pelo link que enviamos. Nossa equipe confirma a disponibilidade e combina com você a rotina do seu cão antes da estadia começar.",
  },
  {
    question: "Pernoite e hospedagem são a mesma coisa?",
    answer:
      "Pernoite é uma noite fora; hospedagem são vários dias seguidos. Cada espaço informa quais ocasiões recebe, e muitos atendem as duas.",
  },
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/reservar/page.test.tsx src/components/faq-section.test.tsx src/test/public-copy.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/reservar/page.tsx src/app/reservar/page.test.tsx src/components/faq-section.tsx src/components/faq-section.test.tsx
git commit -m "feat: solicitacao e duvidas acompanham a estadia"
```

---

### Task 10: Verificação completa antes de integrar

**Files:**
- Modify: nenhum arquivo novo previsto; corrigir o que a verificação apontar.

**Interfaces:**
- Consumes: todas as tasks anteriores.
- Produces: evidência de suíte, lint, tipos e build passando.

- [ ] **Step 1: Rodar a suíte inteira**

Run: `npm test`
Expected: PASS — nenhum teste falhando, incluindo `src/test/public-copy.test.ts`, `src/test/stay-first-copy.test.ts` e `src/test/client-boundary.test.ts`. O total deve ser maior que os 112 do baseline.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: sem erros.

- [ ] **Step 3: Checagem de tipos**

Run: `npm run typecheck`
Expected: sem erros.

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: build concluído. Se o Next reescrever `AGENTS.md`, commitar a mudança junto — removê-la do diff só recria a alteração.

- [ ] **Step 5: Conferência manual do resultado**

Ler o diff completo (`git diff main...HEAD`) procurando:
- Nenhuma foto de pessoa, nome de anfitrião, nota ou comentário.
- Nenhuma promessa de disponibilidade.
- Nenhum metadado de estadia obrigatório.
- Fluxo de solicitação, magic link e eventos intactos (`src/app/api/**` sem alteração).

Se qualquer ponto falhar, usar `superpowers:systematic-debugging` antes de seguir.

- [ ] **Step 6: Commit final**

```bash
git add -A
git commit -m "chore: verifica estadias em primeiro lugar"
```

Não fazer merge nem push: a integração depende de autorização explícita do usuário.

---

## Self-Review

**Cobertura da especificação:**

| Requisito do spec | Task |
|---|---|
| Primeira janela pergunta onde o cão vai ficar | 4, 5 |
| Três escolhas conduzem a resultados pré-filtrados | 1, 2, 4 |
| Hospedagem e pernoite com maior hierarquia; lazer acessível | 4, 5 |
| Seleção não bloqueia a busca (filtros combináveis) | 2, 7 |
| Um espaço atende várias ocasiões; `allowedUses` é a fonte | 2, 3 |
| Metadados opcionais de estadia | 3, 6, 8 |
| Cards e detalhes focam acolhimento | 6, 8 |
| CTA de estadia vs. uso, sem prometer disponibilidade | 8, 9 |
| Imagens de casas, jardins, áreas cobertas e descanso | 3, 5 |
| Sem rostos, perfis, notas ou comentários | 5 (guarda), 10 |
| URL carrega `uso` e demais filtros | 2, 7 |
| Estado vazio guarda a combinação | 7 (o `alertHref` já repassa `params`) |
| Magic link, RLS e eventos inalterados | 10 (conferência do diff) |
| Ausência de metadado não quebra o card | 3, 6 |
| Testes, lint, tipos e build antes de integrar | 10 |
