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

  expect(matches.map((space) => space.slug)).toEqual(["quintal-da-praca", "casa-da-serra"]);
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
