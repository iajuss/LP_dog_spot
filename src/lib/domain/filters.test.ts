import { CATALOG_NEIGHBORHOODS, DOG_SIZES, SPACES, TIME_SLOTS, USE_TYPES, ZONES } from "./catalog";
import { applyFilters, filtersFromSearchParams, filtersToSearchParams, searchSpaces } from "./filters";
import { LEISURE_USES } from "./stay";

test("combina zona, uso, porte e quantidade de cães", () => {
  const matches = applyFilters(SPACES, {
    query: "",
    zone: "Oeste",
    useType: "treino",
    dogSize: "grande",
    dogCount: 2,
  });

  expect(matches.length).toBeGreaterThan(0);

  for (const space of matches) {
    expect(space.zone).toBe("Oeste");
    expect(space.allowedUses).toContain("treino");
    expect(space.dogSizes).toContain("grande");
    expect(space.maxDogs).toBeGreaterThanOrEqual(2);
  }
});

/**
 * O filtro de recursos saiu: era o único que cortava resultados por detalhe de
 * estrutura, e quem marcava dois itens costumava chegar a zero espaço. Os
 * recursos continuam descritos no card e na página do espaço.
 */
test("um recurso na URL antiga não corta mais os resultados", () => {
  const semFiltro = applyFilters(SPACES, filtersFromSearchParams(new URLSearchParams("zona=Oeste")));
  const comRecurso = applyFilters(SPACES, filtersFromSearchParams(new URLSearchParams("zona=Oeste&recursos=cercado,agility")));

  expect(comRecurso.map((space) => space.slug)).toEqual(semFiltro.map((space) => space.slug));
});

test("recursos não voltam para a URL ao reaplicar os filtros", () => {
  const filters = filtersFromSearchParams(new URLSearchParams("zona=Sul&recursos=agua"));

  expect(filtersToSearchParams(filters).toString()).toBe("zona=Sul");
});

test("filtra por período disponível", () => {
  const matches = applyFilters(SPACES, { query: "", timeSlot: "noite" });

  expect(matches.length).toBeGreaterThan(0);
  for (const space of matches) expect(space.availableSlots).toContain("noite");
});

test("não serializa filtros vazios e preserva filtros selecionados", () => {
  const params = filtersToSearchParams({ query: "", zone: "Sul", useType: "hospedagem" });

  expect(params.toString()).toBe("zona=Sul&uso=hospedagem");
  expect(filtersFromSearchParams(params)).toMatchObject({ zone: "Sul", useType: "hospedagem" });
});

test("período percorre a URL de ida e volta", () => {
  const params = filtersToSearchParams({ query: "", timeSlot: "manha" });

  expect(params.toString()).toBe("periodo=manha");
  expect(filtersFromSearchParams(params).timeSlot).toBe("manha");
  expect(filtersFromSearchParams(new URLSearchParams("periodo=meia-noite")).timeSlot).toBeUndefined();
});

test("filtra por bairro escolhido na lista", () => {
  const matches = applyFilters(SPACES, { query: "", neighborhood: "Pinheiros" });

  expect(matches.length).toBeGreaterThan(0);
  for (const space of matches) expect(space.neighborhood).toBe("Pinheiros");
});

test("bairro percorre a URL de ida e volta", () => {
  const params = filtersToSearchParams({ query: "", neighborhood: "Moema" });

  expect(params.toString()).toBe("bairro=Moema");
  expect(filtersFromSearchParams(params).neighborhood).toBe("Moema");
  expect(filtersFromSearchParams(new URLSearchParams("bairro=Narnia")).neighborhood).toBeUndefined();
});

describe("busca com aproximação", () => {
  test("filtro que bate devolve o resultado exato, sem afrouxar nada", () => {
    const resultado = searchSpaces(SPACES, { query: "", zone: "Sul", useType: "hospedagem" });

    expect(resultado.relaxed).toEqual([]);
    expect(resultado.spaces.length).toBeGreaterThan(0);
  });

  test("quando nada bate, afrouxa o detalhe e mantém a ocasião", () => {
    const filtros = { query: "", neighborhood: "Moema", useType: "hospedagem" } as const;

    expect(applyFilters(SPACES, filtros)).toEqual([]);

    const resultado = searchSpaces(SPACES, filtros);

    expect(resultado.spaces.length).toBeGreaterThan(0);
    expect(resultado.relaxed).toContain("o bairro");
    for (const space of resultado.spaces) expect(space.allowedUses).toContain("hospedagem");
  });

  test("cede primeiro o detalhe, depois o lugar", () => {
    const resultado = searchSpaces(SPACES, {
      query: "",
      zone: "Centro",
      useType: "treino",
      neighborhood: "Moema",
      dogCount: 8,
    });

    expect(resultado.spaces.length).toBeGreaterThan(0);
    expect(resultado.relaxed).toEqual(["a quantidade de cães", "o bairro"]);
    for (const space of resultado.spaces) {
      expect(space.zone).toBe("Centro");
      expect(space.allowedUses).toContain("treino");
    }
  });

  test("a zona só cede quando não sobra mais nada para ceder", () => {
    const semCentro = SPACES.filter((space) => space.zone !== "Centro");
    const resultado = searchSpaces(semCentro, { query: "", zone: "Centro", useType: "treino" });

    expect(resultado.relaxed).toEqual(["a zona"]);
    expect(resultado.spaces.length).toBeGreaterThan(0);
    for (const space of resultado.spaces) expect(space.allowedUses).toContain("treino");
  });

  test("afrouxa só o necessário e para no primeiro resultado", () => {
    const resultado = searchSpaces(SPACES, { query: "", neighborhood: "Moema", useType: "pernoite" });

    expect(resultado.relaxed).toEqual(["o bairro"]);
  });
});

/**
 * A garantia que sustenta o funil: nenhuma combinação que o painel de filtros
 * consegue montar pode terminar em lista vazia. Se um dia terminar, este teste
 * aponta exatamente qual combinação quebrou.
 */
test("nenhuma combinação possível de filtros termina sem espaço", () => {
  const vazios: string[] = [];

  for (const zone of [undefined, ...ZONES]) {
    for (const useType of [undefined, ...USE_TYPES]) {
      for (const dogSize of [undefined, ...DOG_SIZES]) {
        for (const timeSlot of [undefined, ...TIME_SLOTS]) {
          for (const dogCount of [undefined, 1, 2, 3, 4, 5, 6, 7, 8]) {
            const filters = { query: "", zone, useType, dogSize, timeSlot, dogCount };
            if (!searchSpaces(SPACES, filters).spaces.length) vazios.push(JSON.stringify(filters));
          }
        }
      }
    }
  }

  expect(vazios).toEqual([]);
});

test("nenhum bairro do painel termina sem espaço, em nenhuma ocasião", () => {
  const vazios: string[] = [];

  for (const neighborhood of CATALOG_NEIGHBORHOODS) {
    for (const useType of USE_TYPES) {
      const filters = { query: "", neighborhood, useType };
      if (!searchSpaces(SPACES, filters).spaces.length) vazios.push(`${neighborhood}/${useType}`);
    }
  }

  expect(vazios).toEqual([]);
});

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
  // Campo Belo só tem um espaço, e ele não recebe estadia: a busca precisa
  // ceder o bairro em vez de devolver o que o tutor não pediu.
  const filters = filtersFromSearchParams(new URLSearchParams("intencao=hospedagem&bairro=Campo Belo&caes=8"));
  const { spaces, relaxed } = searchSpaces(SPACES, filters);

  expect(spaces.length).toBeGreaterThan(0);
  expect(relaxed).toContain("o bairro");
  for (const space of spaces) expect(space.allowedUses).toContain("hospedagem");
});
