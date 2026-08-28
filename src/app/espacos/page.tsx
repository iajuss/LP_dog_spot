import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { EmptyResults } from "@/components/empty-results";
import { FilterPanel } from "@/components/filter-panel";
import { RelaxedNotice } from "@/components/relaxed-notice";
import { SpaceResults } from "@/components/space-results";
import { filtersFromSearchParams, searchSpaces } from "@/lib/domain/filters";
import { SPACES } from "@/lib/domain/catalog";
import { STAY_INTENT_LABELS, isOvernightIntent } from "@/lib/domain/stay";

type ResultsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function toSearchParams(values: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (typeof value === "string") params.set(key, value);
    if (Array.isArray(value)) params.set(key, value.join(","));
  }
  return params;
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const params = toSearchParams(await searchParams);
  const filters = filtersFromSearchParams(params);
  const { spaces, relaxed } = searchSpaces(SPACES, filters);
  const alertHref = `/reservar?kind=availability_alert&${params.toString()}`;

  // A intenção com que o tutor chegou continua mandando na leitura da página.
  const intent = filters.stayIntent;
  const heading = isOvernightIntent(intent)
    ? `${STAY_INTENT_LABELS[intent]} para o seu cão`
    : intent === "lazer"
      ? "Espaços para usar junto com seu cão"
      : "Encontre um lugar que combine com vocês";
  const subheading = isOvernightIntent(intent)
    ? "Casas com jardim cercado, área coberta e canto de descanso. Você envia a solicitação e a equipe confirma os detalhes."
    : "Espaços privados e reservados para passear, brincar e treinar perto de você.";

  return (
    <main className="min-h-screen bg-[#f8f4eb] px-5 py-6 sm:px-8 lg:px-12">
      <header className="mx-auto flex max-w-7xl items-center justify-between">
        <BrandLogo />
        <Link className="text-sm font-bold text-emerald-900 underline underline-offset-4" href={alertHref}>Receber avisos</Link>
      </header>
      <div className="mx-auto max-w-7xl py-10">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">São Paulo</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-emerald-950">{heading}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">{subheading}</p>
        <div className="mt-8 grid gap-7 md:grid-cols-[17rem_1fr]">
          <aside><FilterPanel filters={filters} /></aside>
          <section>
            <div className="mb-5 flex items-center justify-between"><p className="text-sm font-medium text-stone-600">{spaces.length} {spaces.length === 1 ? "espaço" : "espaços"}</p><Link className="text-sm font-bold text-emerald-900" href={alertHref}>Não achou? Quero ser avisado →</Link></div>
            <RelaxedNotice filters={filters} relaxed={relaxed} />
            {spaces.length ? <SpaceResults filters={filters} spaces={spaces} /> : <EmptyResults filters={filters} />}
          </section>
        </div>
      </div>
    </main>
  );
}
