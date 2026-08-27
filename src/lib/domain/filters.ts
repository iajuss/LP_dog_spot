import {
  AMENITIES,
  DOG_SIZES,
  SPACES,
  USE_TYPES,
  ZONES,
  type Amenity,
  type DogSize,
  type Space,
  type UseType,
  type Zone,
} from "./catalog";

export type SearchFilters = {
  query: string;
  zone?: Zone;
  useType?: UseType;
  dogSize?: DogSize;
  dogCount?: number;
  amenities: Amenity[];
};

export const EMPTY_FILTERS: SearchFilters = {
  query: "",
  amenities: [],
};

const isOneOf = <T extends readonly string[]>(values: T, value: string | null): value is T[number] =>
  value !== null && values.includes(value);

export function applyFilters(spaces: Space[], filters: SearchFilters): Space[] {
  const normalizedQuery = filters.query.trim().toLocaleLowerCase("pt-BR");

  return spaces.filter((space) => {
    const searchable = [space.name, space.zone, space.neighborhoodLabel, ...space.allowedUses, ...space.amenities]
      .join(" ")
      .toLocaleLowerCase("pt-BR");

    return (
      (!normalizedQuery || searchable.includes(normalizedQuery)) &&
      (!filters.zone || space.zone === filters.zone) &&
      (!filters.useType || space.allowedUses.includes(filters.useType)) &&
      (!filters.dogSize || space.dogSizes.includes(filters.dogSize)) &&
      (!filters.dogCount || space.maxDogs >= filters.dogCount) &&
      filters.amenities.every((amenity) => space.amenities.includes(amenity))
    );
  });
}

export function filtersToSearchParams(filters: SearchFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.query.trim()) params.set("busca", filters.query.trim());
  if (filters.zone) params.set("zona", filters.zone);
  if (filters.useType) params.set("uso", filters.useType);
  if (filters.dogSize) params.set("porte", filters.dogSize);
  if (filters.dogCount) params.set("caes", String(filters.dogCount));
  if (filters.amenities.length) params.set("recursos", filters.amenities.join(","));

  return params;
}

export function filtersFromSearchParams(params: URLSearchParams): SearchFilters {
  const zone = params.get("zona");
  const useType = params.get("uso");
  const dogSize = params.get("porte");
  const rawDogCount = Number(params.get("caes"));
  const amenities = (params.get("recursos") ?? "")
    .split(",")
    .filter((value): value is Amenity => isOneOf(AMENITIES, value));

  return {
    query: params.get("busca") ?? "",
    zone: isOneOf(ZONES, zone) ? zone : undefined,
    useType: isOneOf(USE_TYPES, useType) ? useType : undefined,
    dogSize: isOneOf(DOG_SIZES, dogSize) ? dogSize : undefined,
    dogCount: Number.isInteger(rawDogCount) && rawDogCount >= 1 && rawDogCount <= 8 ? rawDogCount : undefined,
    amenities,
  };
}

export const DEFAULT_RESULTS = applyFilters(SPACES, EMPTY_FILTERS);
