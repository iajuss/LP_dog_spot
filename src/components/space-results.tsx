import type { SearchFilters } from "@/lib/domain/filters";
import type { Space } from "@/lib/domain/catalog";
import { SpaceCard } from "./space-card";

type SpaceResultsProps = {
  spaces: Space[];
  filters: SearchFilters;
};

export function SpaceResults({ spaces }: SpaceResultsProps) {
  return (
    <section aria-label="Espaços ilustrativos" className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {spaces.map((space) => <SpaceCard key={space.slug} space={space} />)}
    </section>
  );
}
