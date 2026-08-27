import Link from "next/link";
import { SearchBar } from "@/components/search-bar";
import { USE_TYPES, USE_TYPE_LABELS } from "@/lib/domain/catalog";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f8f4eb]">
      <section className="relative isolate px-5 pb-16 pt-5 sm:px-8 lg:px-12 lg:pb-28">
        <div className="absolute inset-x-0 top-0 -z-10 h-[36rem] bg-emerald-950" />
        <nav className="mx-auto flex max-w-6xl items-center justify-between text-white">
          <Link className="flex items-center gap-2 text-xl font-black tracking-tight" href="/"><span className="grid size-9 place-items-center rounded-full bg-lime-300 text-emerald-950">P</span>Pátio Livre</Link>
          <Link className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold hover:bg-white/10" href="/interesse">Quero novidades</Link>
        </nav>
        <div className="mx-auto grid max-w-6xl gap-10 pt-16 lg:grid-cols-[1.1fr_.9fr] lg:items-end lg:pt-24">
          <div>
            <p className="mb-5 inline-flex rounded-full bg-lime-300 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-emerald-950">São Paulo · validação antecipada</p>
            <h1 className="max-w-3xl text-5xl font-black leading-[.95] tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl">Mais espaço para a vida boa do seu cão.</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-emerald-50/80 sm:text-lg">Explore lugares imaginados para passeio, brincadeira, treino e socialização. Diga onde você gostaria de ter um — nós estamos medindo essa demanda.</p>
          </div>
          <div className="rounded-[2rem] bg-lime-300 p-2 shadow-2xl shadow-black/20">
            <SearchBar />
            <p className="px-4 pb-3 pt-2 text-xs font-medium text-emerald-950/70">Busque por bairro, zona ou comece por uma necessidade.</p>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-12">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">Seu momento, seu ritmo</p><h2 className="mt-2 text-3xl font-black tracking-tight text-emerald-950">Para que seu cão precisa de espaço?</h2></div>
          <Link className="text-sm font-bold text-emerald-900 underline underline-offset-4" href="/espacos">Explorar catálogo →</Link>
        </div>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {USE_TYPES.map((useType, index) => <Link className="group rounded-3xl border border-emerald-950/10 bg-white p-5 transition hover:bg-lime-200" href={`/espacos?uso=${useType}`} key={useType}><span className="text-2xl">{["🌿", "🎾", "✨", "🐕"][index]}</span><h3 className="mt-8 text-lg font-black text-emerald-950">{USE_TYPE_LABELS[useType]}</h3><p className="mt-1 text-sm text-stone-600">Ver espaços e contar o que você procura.</p></Link>)}
        </div>
      </section>
      <section className="border-y border-emerald-950/10 bg-white px-5 py-7 text-center text-sm text-stone-600">
        <strong className="text-emerald-950">Catálogo ilustrativo durante a validação.</strong> Pedir interesse não é uma reserva e não revela endereços privados.
      </section>
    </main>
  );
}
