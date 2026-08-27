import Image from "next/image";
import Link from "next/link";
import { FEATURED_SPACES, SPACE_TYPE_LABELS } from "@/lib/domain/catalog";

export function FeaturedSpaces() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
      {/* 1. Cabeçalho da seção */}
      <header className="max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">Atalho rápido</p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-emerald-950 sm:text-4xl">Espaços em destaque</h2>
        <p className="mt-3 text-base leading-7 text-stone-600">
          Um espaço marcante de cada canto da cidade, para você começar por algum lugar.
        </p>
      </header>

      {/* 2. Os cards, todos com a mesma altura */}
      <ul className="mt-8 flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-5 lg:overflow-visible lg:pb-0">
        {FEATURED_SPACES.map((space) => (
          <li className="flex w-[72vw] shrink-0 snap-start sm:w-[45vw] lg:w-auto" key={space.slug}>
            <Link
              className="group flex w-full flex-col overflow-hidden rounded-3xl border border-emerald-950/10 bg-white transition hover:-translate-y-1 hover:shadow-lg"
              href={`/espacos/${space.slug}`}
            >
              <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-emerald-100">
                <Image
                  alt={space.imageAlt}
                  className="object-cover transition duration-500 group-hover:scale-105"
                  fill
                  sizes="(min-width: 1024px) 20vw, 72vw"
                  src={space.imageUrl}
                />
              </div>
              <div className="flex grow flex-col p-4">
                {/* Uma linha só, para todos os cards começarem na mesma altura. */}
                <p className="truncate text-[0.7rem] font-bold uppercase tracking-[0.12em] text-emerald-700">
                  {SPACE_TYPE_LABELS[space.spaceType]} · {space.zone}
                </p>
                <h3 className="mt-1 text-base font-black leading-tight text-emerald-950">{space.name}</h3>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* 3. A saída para o catálogo completo */}
      <div className="mt-6 flex justify-center border-t border-emerald-950/10 pt-6">
        <Link
          className="inline-flex min-h-11 items-center rounded-full border border-emerald-950/20 px-6 text-sm font-bold text-emerald-900 transition hover:bg-emerald-950 hover:text-white"
          href="/espacos"
        >
          Ver os 30 espaços →
        </Link>
      </div>
    </section>
  );
}
