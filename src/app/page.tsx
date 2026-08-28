import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { FaqSection } from "@/components/faq-section";
import { FeaturedSpaces } from "@/components/featured-spaces";
import { HeroCarousel } from "@/components/hero-carousel";
import { LocationSearch } from "@/components/location-search";
import { USE_TYPE_LABELS, type UseType } from "@/lib/domain/catalog";
import { USE_TYPES_BY_STAY_PRIORITY } from "@/lib/domain/stay";

const USE_ICONS: Record<UseType, string> = {
  passeio: "🌿",
  brincadeira: "🎾",
  treino: "🎯",
  socializacao: "🐕",
  creche: "☀️",
  pernoite: "🌙",
  hospedagem: "🏡",
};

export default function HomePage() {
  return (
    <main className="overflow-x-clip bg-[#f8f4eb] text-emerald-950">
      <section className="relative z-20 flex min-h-[100svh] items-center px-5 py-6 sm:px-8 lg:px-12">
        <HeroCarousel />

        <div className="relative z-10 mx-auto w-full max-w-6xl">
          <nav className="flex items-center justify-between gap-4">
            <BrandLogo tone="light" />
            <Link
              className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              href="/espacos"
            >
              Explorar
            </Link>
          </nav>

          <div className="mt-16 max-w-2xl pb-16 sm:mt-24 sm:pb-20">
            <p className="mb-5 inline-flex rounded-full bg-lime-300 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-emerald-950">
              Estadias para cães em São Paulo
            </p>
            <h1 className="text-[2.6rem] font-black leading-[0.95] tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
              Hospedagem e pernoite em casas que recebem seu cão.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-emerald-50/90 sm:mt-6 sm:text-lg">
              Jardim cercado, área coberta e canto de descanso — e, quando o programa é junto, espaços reservados
              para vocês dois.
            </p>
            <div className="mt-7 rounded-[1.75rem] bg-lime-300 p-2 shadow-2xl shadow-black/20 sm:mt-8 sm:rounded-[2rem]">
              <LocationSearch />
              <p className="px-4 pb-3 pt-2 text-xs font-medium text-emerald-950/70">
                Escolha a estadia e a região — dá para digitar o bairro ou a zona.
              </p>
            </div>
          </div>
        </div>
      </section>

      <FeaturedSpaces />

      {/* Seção 2 do corpo: verde sólido, o contraste forte do meio da página. */}
      <section className="flex min-h-[100svh] flex-col justify-center bg-emerald-950 px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto w-full max-w-6xl">
          <header className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-lime-300">Cada rotina tem um ritmo</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Como seu cão pode ficar
            </h2>
            <p className="mt-3 text-base leading-7 text-emerald-100/75">
              De uma hospedagem de vários dias a uma tarde de brincadeira junto com você. Escolha a ocasião e veja
              quem atende.
            </p>
          </header>
          <div className="mt-8 grid grid-cols-2 items-stretch gap-3 sm:gap-4 lg:grid-cols-4">
            {USE_TYPES_BY_STAY_PRIORITY.map((useType) => (
              <Link
                className="group flex flex-col rounded-3xl border border-white/15 bg-white/[0.07] p-4 transition hover:-translate-y-1 hover:border-lime-300/60 hover:bg-white/[0.14] sm:p-5"
                href={`/espacos?uso=${useType}`}
                key={useType}
              >
                <span className="text-2xl">{USE_ICONS[useType]}</span>
                <h3 className="mt-6 text-base font-black leading-tight text-white transition group-hover:text-lime-300 sm:mt-8 sm:text-lg">
                  {USE_TYPE_LABELS[useType]}
                </h3>
                <p className="mt-1 text-sm text-emerald-100/70">Veja espaços na sua região.</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <FaqSection />

      <footer className="border-t border-emerald-950/10 bg-[#f8f4eb] px-5 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <BrandLogo />
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-stone-600">
            <Link className="hover:text-emerald-900" href="/espacos">Espaços</Link>
            <Link className="hover:text-emerald-900" href="/reservar?kind=availability_alert">Quero ser avisado</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
