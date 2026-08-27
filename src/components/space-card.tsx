import Image from "next/image";
import Link from "next/link";
import { AMENITY_LABELS, DOG_SIZE_LABELS, USE_TYPE_LABELS, type Space } from "@/lib/domain/catalog";

export function SpaceCard({ space }: { space: Space }) {
  const highlights = space.amenities.slice(0, 2);

  return (
    <article className="group overflow-hidden rounded-3xl border border-emerald-950/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link aria-label={`Conhecer ${space.name}`} className="block" href={`/espacos/${space.slug}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-emerald-100">
          <Image alt={space.imageAlt} className="object-cover transition duration-500 group-hover:scale-105" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" src={space.imageUrl} />
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-950">Catálogo ilustrativo</span>
        </div>
        <div className="grid gap-4 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">{space.neighborhoodLabel} · {space.zone}</p>
            <h2 className="mt-1 text-xl font-black text-emerald-950">{space.name}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {space.allowedUses.slice(0, 2).map((useType) => <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-700" key={useType}>{USE_TYPE_LABELS[useType]}</span>)}
          </div>
          <p className="text-sm text-stone-600">Até {space.maxDogs} cães · {space.dogSizes.map((size) => DOG_SIZE_LABELS[size].replace(" porte", "")).join(", ")}</p>
          <div className="flex flex-wrap gap-2 border-t border-stone-100 pt-3 text-xs font-medium text-stone-500">
            {highlights.map((amenity) => <span key={amenity}>{AMENITY_LABELS[amenity]}</span>)}
          </div>
        </div>
      </Link>
    </article>
  );
}
