import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApproximateMap } from "@/components/approximate-map";
import { AMENITY_LABELS, DOG_SIZE_LABELS, USE_TYPE_LABELS, getSpaceBySlug } from "@/lib/domain/catalog";

type SpaceDetailPageProps = { params: Promise<{ slug: string }> };

export default async function SpaceDetailPage({ params }: SpaceDetailPageProps) {
  const space = getSpaceBySlug((await params).slug);
  if (!space) notFound();

  const interestParams = new URLSearchParams({ space: space.slug, zona: space.zone, bairro: space.neighborhoodLabel });

  return (
    <main className="min-h-screen bg-[#f8f4eb] px-5 py-6 sm:px-8 lg:px-12">
      <header className="mx-auto flex max-w-6xl items-center justify-between"><Link className="text-xl font-black text-emerald-950" href="/">Pátio Livre</Link><Link className="text-sm font-bold text-emerald-900 underline underline-offset-4" href="/espacos">← Todos os espaços</Link></header>
      <div className="mx-auto grid max-w-6xl gap-8 py-10 lg:grid-cols-[1.1fr_.9fr]">
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-emerald-100"><Image alt={space.imageAlt} className="object-cover" fill priority sizes="(min-width: 1024px) 55vw, 100vw" src={space.imageUrl} /><span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-950">Catálogo ilustrativo</span></div>
          <div className="mt-8"><p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">{space.neighborhoodLabel} · {space.zone}</p><h1 className="mt-2 text-5xl font-black tracking-tight text-emerald-950">{space.name}</h1><p className="mt-4 max-w-2xl text-base leading-7 text-stone-600">{space.description} Este é um cenário ilustrativo, criado para entender quais espaços fariam diferença na sua rotina.</p></div>
          <div className="mt-8 grid gap-4 rounded-3xl bg-white p-6 sm:grid-cols-2"><div><p className="text-xs font-black uppercase tracking-widest text-stone-400">Ideal para</p><div className="mt-3 flex flex-wrap gap-2">{space.allowedUses.map((useType) => <span className="rounded-full bg-lime-100 px-3 py-1 text-sm font-medium text-emerald-950" key={useType}>{USE_TYPE_LABELS[useType]}</span>)}</div></div><div><p className="text-xs font-black uppercase tracking-widest text-stone-400">Cães</p><p className="mt-3 text-sm text-emerald-950">Até {space.maxDogs} cães · {space.dogSizes.map((size) => DOG_SIZE_LABELS[size]).join(", ")}</p></div><div className="sm:col-span-2"><p className="text-xs font-black uppercase tracking-widest text-stone-400">Recursos imaginados</p><div className="mt-3 flex flex-wrap gap-2">{space.amenities.map((amenity) => <span className="rounded-full border border-stone-200 px-3 py-1 text-sm text-stone-700" key={amenity}>{AMENITY_LABELS[amenity]}</span>)}</div></div></div>
        </div>
        <aside className="grid content-start gap-5 lg:pt-2"><ApproximateMap areaLabel={space.approximateMapArea} zone={space.zone} /><section className="rounded-3xl bg-emerald-950 p-7 text-white"><p className="text-sm font-bold uppercase tracking-[0.14em] text-lime-300">Quer algo assim?</p><h2 className="mt-3 text-2xl font-black">Ajude a trazer espaços para a sua região.</h2><p className="mt-3 text-sm leading-6 text-emerald-50/75">Conte a necessidade do seu cão. Vamos avisar se abrirmos acesso ou novidades por perto.</p><Link className="mt-6 inline-flex rounded-xl bg-lime-300 px-5 py-3 text-sm font-black text-emerald-950" href={`/interesse?${interestParams.toString()}`}>Quero ser avisado</Link><p className="mt-4 text-xs text-emerald-50/60">Isso não é uma reserva nem indica disponibilidade.</p></section></aside>
      </div>
    </main>
  );
}
