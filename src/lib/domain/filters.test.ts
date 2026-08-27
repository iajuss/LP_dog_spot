import { SPACES } from "./catalog";
import { applyFilters, filtersFromSearchParams, filtersToSearchParams } from "./filters";

test("combina zona, uso, porte, cães e recursos", () => {
  const matches = applyFilters(SPACES, {
    query: "",
    zone: "Oeste",
    useType: "treino",
    dogSize: "grande",
    dogCount: 2,
    amenities: ["cercado"],
  });

  expect(matches.length).toBeGreaterThan(0);

  for (const space of matches) {
    expect(space.zone).toBe("Oeste");
    expect(space.allowedUses).toContain("treino");
    expect(space.dogSizes).toContain("grande");
    expect(space.maxDogs).toBeGreaterThanOrEqual(2);
    expect(space.amenities).toContain("cercado");
  }

  // bosque-claro é Oeste e aceita treino, mas não é cercado.
  expect(matches.map((space) => space.slug)).not.toContain("bosque-claro");
});

test("filtra por período disponível", () => {
  const matches = applyFilters(SPACES, { query: "", amenities: [], timeSlot: "noite" });

  expect(matches.length).toBeGreaterThan(0);
  for (const space of matches) expect(space.availableSlots).toContain("noite");
  expect(matches.length).toBeLessThan(SPACES.length);
});

test("não serializa filtros vazios e preserva filtros selecionados", () => {
  const params = filtersToSearchParams({
    query: "",
    zone: "Sul",
    useType: undefined,
    dogSize: undefined,
    dogCount: undefined,
    amenities: ["agua"],
  });

  expect(params.toString()).toBe("zona=Sul&recursos=agua");
  expect(filtersFromSearchParams(params)).toMatchObject({ zone: "Sul", amenities: ["agua"] });
});

test("período percorre a URL de ida e volta", () => {
  const params = filtersToSearchParams({ query: "", amenities: [], timeSlot: "manha" });

  expect(params.toString()).toBe("periodo=manha");
  expect(filtersFromSearchParams(params).timeSlot).toBe("manha");
  expect(filtersFromSearchParams(new URLSearchParams("periodo=meia-noite")).timeSlot).toBeUndefined();
});

test("filtra por bairro escolhido na lista", () => {
  const matches = applyFilters(SPACES, { query: "", amenities: [], neighborhood: "Pinheiros" });

  expect(matches.length).toBeGreaterThan(0);
  for (const space of matches) expect(space.neighborhood).toBe("Pinheiros");
});

test("bairro percorre a URL de ida e volta", () => {
  const params = filtersToSearchParams({ query: "", amenities: [], neighborhood: "Moema" });

  expect(params.toString()).toBe("bairro=Moema");
  expect(filtersFromSearchParams(params).neighborhood).toBe("Moema");
  expect(filtersFromSearchParams(new URLSearchParams("bairro=Narnia")).neighborhood).toBeUndefined();
});
