import Image from "next/image";
import Link from "next/link";
import { FEATURED_SPACES, SPACE_TYPE_LABELS } from "@/lib/domain/catalog";

export function FeaturedSpaces() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">Atalho rápido</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-emerald-950 sm:text-4xl">Espaços em destaque</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600">
            Um espaço marcante de cada canto da cidade, para você começar por algum lugar.
          </p>
        </div>
        <Link className="text-sm font-bold text-emerald-900 underline underline-offset-4" href="/espacos">
          Ver os 30 espaços →
        </Link>
      </div>

      {/* No mobile vira carrossel horizontal; no desktop, grade. */}
      <ul className="mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-5 lg:overflow-visible lg:pb-0">
        {FEATURED_SPACES.map((space) => (
          <li className="w-[72vw] shrink-0 snap-start sm:w-[45vw] lg:w-auto" key={space.slug}>
            <Link
              className="group block overflow-hidden rounded-3xl border border-emerald-950/10 bg-white transition hover:-translate-y-1 hover:shadow-lg"
              href={`/espacos/${space.slug}`}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-emerald-100">
                <Image
                  alt={space.imageAlt}
                  className="object-cover transition duration-500 group-hover:scale-105"
                  fill
                  sizes="(min-width: 1024px) 20vw, 72vw"
                  src={space.imageUrl}
                />
              </div>
              <div className="p-4">
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-emerald-700">
                  {SPACE_TYPE_LABELS[space.spaceType]} · {space.zone}
                </p>
                <h3 className="mt-1 text-base font-black leading-tight text-emerald-950">{space.name}</h3>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
