import Link from "next/link";
import { filtersToSearchParams, type SearchFilters } from "@/lib/domain/filters";

export function EmptyResults({ filters }: { filters: SearchFilters }) {
  const params = filtersToSearchParams(filters);
  const summary = [filters.zone, filters.useType?.replace("socializacao", "socialização")].filter(Boolean).join(" · ");

  return (
    <section className="rounded-3xl border border-dashed border-emerald-950/25 bg-white p-8 text-center sm:p-12">
      <span className="text-4xl" role="img" aria-label="Pegada de cachorro">🐾</span>
      <h2 className="mt-4 text-2xl font-black text-emerald-950">Nenhum espaço com esse perfil por aqui</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-stone-600">
        Conte o que você procura{summary ? ` (${summary})` : ""} e avisamos assim que abrir uma opção que combine com vocês.
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Link className="rounded-xl bg-emerald-950 px-5 py-3 text-sm font-bold text-white" href={`/reservar?kind=availability_alert&${params.toString()}`}>Quero ser avisado nesta região</Link>
        <Link className="rounded-xl border border-emerald-950/15 px-5 py-3 text-sm font-bold text-emerald-950" href="/espacos">Ver todos os espaços</Link>
      </div>
    </section>
  );
}
