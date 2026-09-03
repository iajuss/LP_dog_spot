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
      <section className="relative z-20 flex min-h-[100svh] items-center px-5 py-4 sm:px-8 sm:py-6 lg:px-12">
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

          <div className="mt-6 max-w-2xl pb-6 sm:mt-12 sm:pb-12">
            <p className="mb-3 inline-flex rounded-full bg-lime-300 px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.16em] text-emerald-950 sm:text-xs">
              Estadias para cães em São Paulo
            </p>
            <h1 className="text-[1.95rem] font-black leading-[0.95] tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
              Hospedagem e pernoite em casas que recebem seu cão.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50/90 sm:mt-4 sm:text-base">
              Jardim cercado, área coberta e canto de descanso — e espaços reservados para o programa junto.
            </p>
            <div className="mt-6 sm:mt-7">
              <LocationSearch />
            </div>
          </div>
        </div>
      </section>

      <FeaturedSpaces />

      {/* Seção 2 do corpo: verde sólido, o contraste forte do meio da página. */}
      <section className="flex min-h-[100svh] flex-col justify-center bg-emerald-950 px-5 py-12 sm:px-8 sm:py-20 lg:px-12">
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
                <span className="text-xl sm:text-2xl">{USE_ICONS[useType]}</span>
                <h3 className="mt-4 text-sm font-black leading-tight text-white transition group-hover:text-lime-300 sm:mt-8 sm:text-lg">
                  {USE_TYPE_LABELS[useType]}
                </h3>
                <p className="mt-1 text-xs text-emerald-100/70 sm:text-sm">Veja espaços na sua região.</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <FaqSection />

      <section className="bg-lime-300 px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:items-start sm:gap-12">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-950/70">Privacidade</p>
          <div>
            <h2 className="text-3xl font-black tracking-tight text-emerald-950 sm:text-4xl">
              Sua privacidade também tem espaço aqui.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-950/80">
              Usamos seus dados somente para cuidar da sua solicitação, manter contato sobre a estadia e melhorar a
              experiência de vocês. Você continua no controle do que compartilha.
            </p>
          </div>
        </div>
      </section>

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
