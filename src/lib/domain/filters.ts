import {
  CATALOG_NEIGHBORHOODS,
  DOG_SIZES,
  SPACES,
  TIME_SLOTS,
  USE_TYPES,
  ZONES,
  type DogSize,
  type Space,
  type TimeSlot,
  type UseType,
  type Zone,
} from "./catalog";
import { intentForUseType, isStayIntent, usesForIntent, type StayIntent } from "./stay";

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

export const EMPTY_FILTERS: SearchFilters = {
  query: "",
};

const isOneOf = <T extends readonly string[]>(values: T, value: string | null): value is T[number] =>
  value !== null && values.includes(value);

export function applyFilters(spaces: Space[], filters: SearchFilters): Space[] {
  const normalizedQuery = filters.query.trim().toLocaleLowerCase("pt-BR");
  const intentUses = filters.stayIntent ? usesForIntent(filters.stayIntent) : undefined;

  return spaces.filter((space) => {
    const searchable = [space.name, space.zone, space.neighborhoodLabel, ...space.allowedUses, ...space.amenities]
      .join(" ")
      .toLocaleLowerCase("pt-BR");

    return (
      (!normalizedQuery || searchable.includes(normalizedQuery)) &&
      (!filters.zone || space.zone === filters.zone) &&
      (!filters.useType || space.allowedUses.includes(filters.useType)) &&
      (!intentUses || space.allowedUses.some((use) => intentUses.includes(use))) &&
      (!filters.dogSize || space.dogSizes.includes(filters.dogSize)) &&
      (!filters.dogCount || space.maxDogs >= filters.dogCount) &&
      (!filters.timeSlot || space.availableSlots.includes(filters.timeSlot)) &&
      (!filters.neighborhood || space.neighborhood === filters.neighborhood)
    );
  });
}

export function filtersToSearchParams(filters: SearchFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.query.trim()) params.set("busca", filters.query.trim());
  if (filters.zone) params.set("zona", filters.zone);
  if (filters.useType) params.set("uso", filters.useType);
  // `uso` é canônico; `intencao` só aparece quando a escolha é ampla (lazer).
  if (!filters.useType && filters.stayIntent) params.set("intencao", filters.stayIntent);
  if (filters.dogSize) params.set("porte", filters.dogSize);
  if (filters.dogCount) params.set("caes", String(filters.dogCount));
  if (filters.timeSlot) params.set("periodo", filters.timeSlot);
  if (filters.neighborhood) params.set("bairro", filters.neighborhood);

  return params;
}

export function filtersFromSearchParams(params: URLSearchParams): SearchFilters {
  const zone = params.get("zona");
  const rawUseType = params.get("uso");
  const rawIntent = params.get("intencao");
  const dogSize = params.get("porte");
  const rawDogCount = Number(params.get("caes"));
  const timeSlot = params.get("periodo");
  const neighborhood = params.get("bairro");

  // A home manda `intencao`; hospedagem e pernoite viram uso, para o painel de
  // filtros já chegar com a ocasião marcada.
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

/**
 * Ordem em que os filtros cedem quando nada bate: do detalhe ao essencial. A
 * ocasião nunca cede — é o que o tutor veio procurar, e mostrar espaço que não
 * atende àquela vertical seria trocar o pedido dele por outro.
 */
const RELAXABLE = [
  { key: "query", label: "o texto da busca" },
  { key: "timeSlot", label: "o período" },
  { key: "dogCount", label: "a quantidade de cães" },
  { key: "dogSize", label: "o porte" },
  { key: "neighborhood", label: "o bairro" },
  { key: "zone", label: "a zona" },
] as const satisfies readonly { key: keyof SearchFilters; label: string }[];

export type SearchResult = {
  spaces: Space[];
  /** Filtros que precisaram ser ignorados para haver resultado. */
  relaxed: string[];
};

/**
 * Busca sem beco sem saída: se a combinação exata não devolve nada, afrouxa um
 * filtro de cada vez e para no primeiro que devolve espaço, dizendo o que
 * ignorou. Chegar a uma lista vazia é onde o tutor desiste.
 */
export function searchSpaces(spaces: Space[], filters: SearchFilters): SearchResult {
  const exact = applyFilters(spaces, filters);
  if (exact.length) return { spaces: exact, relaxed: [] };

  let current = filters;
  const relaxed: string[] = [];

  for (const { key, label } of RELAXABLE) {
    if (key === "query" ? !current.query.trim() : current[key] === undefined) continue;

    current = key === "query" ? { ...current, query: "" } : { ...current, [key]: undefined };
    relaxed.push(label);

    const matches = applyFilters(spaces, current);
    if (matches.length) return { spaces: matches, relaxed };
  }

  return { spaces: [], relaxed };
}

export const DEFAULT_RESULTS = applyFilters(SPACES, EMPTY_FILTERS);
