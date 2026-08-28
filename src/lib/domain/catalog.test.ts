import { CATALOG_NEIGHBORHOODS, OVERNIGHT_USES, SPACES, SPACE_TYPES, SP_NEIGHBORHOODS, USE_TYPES, USE_TYPE_LABELS, ZONES } from "./catalog";

test("catálogo cobre São Paulo com quarenta e dois espaços e fotos únicas", () => {
  expect(SPACES).toHaveLength(42);
  expect(new Set(SPACES.map((space) => space.imageUrl)).size).toBe(42);
});

test("toda zona da cidade tem pelo menos oito espaços", () => {
  for (const zone of ZONES) {
    expect(SPACES.filter((space) => space.zone === zone).length, `zona sem espaços suficientes: ${zone}`).toBeGreaterThanOrEqual(8);
  }
});

/**
 * Um espaço que só abre num período, só aceita um cão ou serve a dois usos
 * some do resultado assim que o tutor mexe em qualquer filtro. Piso de
 * flexibilidade para que a busca continue devolvendo opção.
 */
test("nenhum espaço é restrito a ponto de sumir do resultado", () => {
  for (const space of SPACES) {
    expect(space.availableSlots.length, `período restrito demais: ${space.slug}`).toBeGreaterThanOrEqual(2);
    expect(space.maxDogs, `capacidade restrita demais: ${space.slug}`).toBeGreaterThanOrEqual(2);
    expect(space.allowedUses.length, `uso restrito demais: ${space.slug}`).toBeGreaterThanOrEqual(3);
  }

  const emTodosOsPeriodos = SPACES.filter((space) => space.availableSlots.length === 3);
  expect(emTodosOsPeriodos.length).toBeGreaterThan(SPACES.length / 2);
});

test("o catálogo mistura tipos de espaço diferentes", () => {
  expect(new Set(SPACES.map((space) => space.spaceType)).size).toBeGreaterThanOrEqual(5);
  expect(SPACE_TYPES.length).toBeGreaterThanOrEqual(5);
});

test("todo espaço aceita cães de qualquer porte", () => {
  for (const space of SPACES) {
    expect(space.dogSizes, `porte faltando em ${space.slug}`).toEqual(["pequeno", "medio", "grande"]);
  }
});

test("a maioria dos espaços atende a quatro ou mais ocasiões", () => {
  const comQuatroOuMais = SPACES.filter((space) => space.allowedUses.length >= 4);
  expect(comQuatroOuMais.length).toBeGreaterThan(SPACES.length * 0.75);
});

test("oferece também as ocasiões de estadia, não só de visita curta", () => {
  for (const use of ["creche", "pernoite", "hospedagem", "evento"] as const) {
    expect(USE_TYPES, `vertical ausente: ${use}`).toContain(use);
    expect(USE_TYPE_LABELS[use], `rótulo ausente: ${use}`).toBeTruthy();
  }
});

test("toda vertical tem espaço em mais de uma zona, para comparar praças", () => {
  for (const use of USE_TYPES) {
    const zonas = new Set(SPACES.filter((space) => space.allowedUses.includes(use)).map((space) => space.zone));
    expect(zonas.size, `vertical concentrada numa praça só: ${use}`).toBeGreaterThanOrEqual(2);
  }
});

/**
 * A combinação praça + vertical é a primeira escolha de quem chega. Se alguma
 * delas devolvesse zero, o tutor pararia no vazio logo no começo do fluxo.
 */
test("toda zona atende a todas as verticais", () => {
  for (const zone of ZONES) {
    const verticais = new Set(SPACES.filter((space) => space.zone === zone).flatMap((space) => space.allowedUses));
    for (const use of USE_TYPES) {
      expect(verticais, `praça ${zone} sem a vertical ${use}`).toContain(use);
    }
  }
});

test("toda vertical acontece nos três períodos do dia", () => {
  for (const use of USE_TYPES) {
    const periodos = new Set(SPACES.filter((space) => space.allowedUses.includes(use)).flatMap((space) => space.availableSlots));
    expect(periodos.size, `vertical presa a um horário: ${use}`).toBe(3);
  }
});

test("toda vertical cabe em turma, não só em cão sozinho", () => {
  for (const use of USE_TYPES) {
    const capacidade = Math.max(...SPACES.filter((space) => space.allowedUses.includes(use)).map((space) => space.maxDogs));
    expect(capacidade, `vertical sem espaço para mais de dois cães: ${use}`).toBeGreaterThanOrEqual(4);
  }
});

test("estadia só em espaço com abrigo, nunca em campo aberto", () => {
  for (const space of SPACES) {
    const temEstadia = space.allowedUses.some((use) => OVERNIGHT_USES.includes(use));
    if (temEstadia) {
      expect(["quintal", "salao", "terraco"], `estadia em espaço inadequado: ${space.slug}`).toContain(space.spaceType);
    }
  }
  expect(SPACES.filter((space) => space.allowedUses.includes("hospedagem")).length).toBeGreaterThanOrEqual(4);
});

test("o catálogo varia a capacidade", () => {
  expect(new Set(SPACES.map((space) => space.maxDogs)).size).toBeGreaterThanOrEqual(4);
});

test("nenhum bairro se repete dentro da mesma zona", () => {
  for (const zone of ZONES) {
    const labels = SPACES.filter((space) => space.zone === zone).map((space) => space.neighborhoodLabel);
    expect(new Set(labels).size, `bairro repetido na zona ${zone}`).toBe(labels.length);
  }
});

test("todo espaço expõe o bairro sem o prefixo de região", () => {
  for (const space of SPACES) {
    expect(space.neighborhood, `bairro ausente: ${space.slug}`).toBeTruthy();
    expect(space.neighborhood).not.toMatch(/^Região/);
    expect(space.neighborhoodLabel).toContain(space.neighborhood);
  }
});

test("os bairros do catálogo saem ordenados e sem repetição", () => {
  expect(CATALOG_NEIGHBORHOODS.length).toBe(new Set(CATALOG_NEIGHBORHOODS).size);
  expect(CATALOG_NEIGHBORHOODS).toEqual([...CATALOG_NEIGHBORHOODS].sort((a, b) => a.localeCompare(b, "pt-BR")));
  expect(CATALOG_NEIGHBORHOODS).toContain("Pinheiros");
});

test("a lista do formulário cobre bairros além dos que já têm espaço", () => {
  for (const neighborhood of CATALOG_NEIGHBORHOODS) expect(SP_NEIGHBORHOODS).toContain(neighborhood);
  expect(SP_NEIGHBORHOODS.length).toBeGreaterThan(CATALOG_NEIGHBORHOODS.length);
  expect(SP_NEIGHBORHOODS.length).toBe(new Set(SP_NEIGHBORHOODS).size);
});
