import { CATALOG_NEIGHBORHOODS, SPACES, SPACE_TYPES, SP_NEIGHBORHOODS, ZONES } from "./catalog";

test("catálogo cobre São Paulo com trinta espaços e fotos únicas", () => {
  expect(SPACES).toHaveLength(30);
  expect(new Set(SPACES.map((space) => space.imageUrl)).size).toBe(30);
});

test("toda zona da cidade tem pelo menos quatro espaços", () => {
  for (const zone of ZONES) {
    expect(SPACES.filter((space) => space.zone === zone).length, `zona sem espaços suficientes: ${zone}`).toBeGreaterThanOrEqual(4);
  }
});

test("cada espaço declara em quais períodos recebe visita", () => {
  for (const space of SPACES) {
    expect(space.availableSlots.length, `espaço sem período: ${space.slug}`).toBeGreaterThan(0);
  }
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

test("todo espaço atende a pelo menos dois usos, e a maioria a três", () => {
  for (const space of SPACES) {
    expect(space.allowedUses.length, `uso restrito demais em ${space.slug}`).toBeGreaterThanOrEqual(2);
  }

  const comTresOuMais = SPACES.filter((space) => space.allowedUses.length >= 3);
  expect(comTresOuMais.length).toBeGreaterThan(SPACES.length / 2);
});

test("cada tipo de uso tem espaço em toda zona da cidade", () => {
  for (const zone of ZONES) {
    const naZona = SPACES.filter((space) => space.zone === zone);
    for (const use of ["passeio", "brincadeira", "treino", "socializacao"] as const) {
      expect(naZona.some((space) => space.allowedUses.includes(use)), `${zone} sem espaço para ${use}`).toBe(true);
    }
  }
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
