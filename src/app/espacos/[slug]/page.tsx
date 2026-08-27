import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApproximateMap } from "@/components/approximate-map";
import { BrandLogo } from "@/components/brand-logo";
import {
  AMENITY_LABELS,
  DOG_SIZE_LABELS,
  SPACE_TYPE_LABELS,
  TIME_SLOT_LABELS,
  USE_TYPE_LABELS,
  getSpaceBySlug,
} from "@/lib/domain/catalog";

type SpaceDetailPageProps = { params: Promise<{ slug: string }> };

export default async function SpaceDetailPage({ params }: SpaceDetailPageProps) {
  const space = getSpaceBySlug((await params).slug);
  if (!space) notFound();

  const requestParams = new URLSearchParams({ space: space.slug, zona: space.zone, bairro: space.neighborhoodLabel });
  const reserveHref = `/reservar?kind=reservation_request&${requestParams.toString()}`;
  const alertHref = `/reservar?kind=availability_alert&${requestParams.toString()}`;

  return (
    <main className="min-h-screen bg-[#f8f4eb] px-5 py-6 sm:px-8 lg:px-12">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <BrandLogo />
        <Link className="text-sm font-bold text-emerald-900 underline underline-offset-4" href="/espacos">
          ← Todos os espaços
        </Link>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 py-8 sm:py-10 lg:grid-cols-[1.1fr_.9fr]">
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-emerald-100 sm:rounded-[2rem]">
            <Image alt={space.imageAlt} className="object-cover" fill priority sizes="(min-width: 1024px) 55vw, 100vw" src={space.imageUrl} />
            <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-950">
              {SPACE_TYPE_LABELS[space.spaceType]}
            </span>
          </div>

          <div className="mt-7">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">{space.neighborhoodLabel} · {space.zone}</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-emerald-950 sm:text-5xl">{space.name}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-stone-600">{space.description}</p>
          </div>

          <div className="mt-7 grid gap-5 rounded-3xl bg-white p-5 sm:grid-cols-2 sm:p-6">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-stone-400">Ideal para</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {space.allowedUses.map((useType) => (
                  <span className="rounded-full bg-lime-100 px-3 py-1 text-sm font-medium text-emerald-950" key={useType}>{USE_TYPE_LABELS[useType]}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-stone-400">Cães</p>
              <p className="mt-3 text-sm text-emerald-950">
                Até {space.maxDogs} {space.maxDogs === 1 ? "cão" : "cães"} · {space.dogSizes.map((size) => DOG_SIZE_LABELS[size]).join(", ")}
              </p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-stone-400">Períodos que recebe</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {space.availableSlots.map((slot) => (
                  <span className="rounded-full border border-emerald-950/15 px-3 py-1 text-sm text-emerald-950" key={slot}>{TIME_SLOT_LABELS[slot]}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-stone-400">Recursos</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {space.amenities.map((amenity) => (
                  <span className="rounded-full border border-stone-200 px-3 py-1 text-sm text-stone-700" key={amenity}>{AMENITY_LABELS[amenity]}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="grid content-start gap-5 lg:pt-2">
          <ApproximateMap areaLabel={space.approximateMapArea} zone={space.zone} />

          {/* Ação principal: pedir uma data concreta. */}
          <section className="rounded-3xl bg-emerald-950 p-6 text-white sm:p-7">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-lime-300">Quer usar este espaço?</p>
            <h2 className="mt-3 text-2xl font-black leading-tight">Escolha a data e o período que combinam com vocês.</h2>
            <p className="mt-3 text-sm leading-6 text-emerald-50/75">
              Você envia a solicitação e confirma seu e-mail. Nossa equipe responde confirmando a disponibilidade.
            </p>
            <Link
              className="mt-6 flex w-full items-center justify-center rounded-xl bg-lime-300 px-5 py-4 text-base font-black text-emerald-950 transition hover:bg-lime-200"
              href={reserveHref}
            >
              Reservar este espaço
            </Link>
          </section>

          {/* Ação secundária: separada em outro cartão, com peso visual menor. */}
          <section className="rounded-3xl border border-emerald-950/15 bg-white p-6">
            <h2 className="text-base font-black text-emerald-950">Ainda não tem uma data?</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Deixe seus dados e avisamos por e-mail quando este espaço abrir novos horários.
            </p>
            <Link
              className="mt-2 inline-flex min-h-11 items-center text-sm font-bold text-emerald-900 underline underline-offset-4 hover:text-emerald-700"
              href={alertHref}
            >
              Quero ser avisado
            </Link>
          </section>
        </aside>
      </div>
    </main>
  );
}
