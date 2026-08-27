import Image from "next/image";
import Link from "next/link";
import { SearchBar } from "@/components/search-bar";
import { USE_TYPES, USE_TYPE_LABELS } from "@/lib/domain/catalog";

const heroImages = [
  "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=1800&q=90",
  "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=1800&q=90",
  "https://images.unsplash.com/photo-1494947665470-20322015e3a8?auto=format&fit=crop&w=1800&q=90",
];

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-[#f8f4eb] text-emerald-950">
      <section className="relative flex min-h-screen items-center overflow-hidden px-5 py-6 sm:px-8 lg:px-12">
        <Image
          alt="Cão brincando ao ar livre"
          className="object-cover"
          fill
          priority
          sizes="100vw"
          src={heroImages[0]}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-950/80 to-emerald-950/20" />
        <div className="relative mx-auto w-full max-w-6xl">
          <nav className="flex items-center justify-between text-white">
            <Link className="flex items-center gap-2 text-xl font-black tracking-tight" href="/"><span className="grid size-9 place-items-center rounded-full bg-lime-300 text-emerald-950">P</span>Pátio Livre</Link>
            <Link className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold transition hover:bg-white/10" href="/espacos">Explorar espaços</Link>
          </nav>
          <div className="mt-24 max-w-2xl sm:mt-32">
            <p className="mb-5 inline-flex rounded-full bg-lime-300 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-emerald-950">Espaços para cães em São Paulo</p>
            <h1 className="text-5xl font-black leading-[.95] tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl">O próximo passeio favorito do seu cão começa aqui.</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-emerald-50/90 sm:text-lg">Encontre quintais, jardins e áreas cercadas para brincar, treinar ou passar um tempo juntos.</p>
            <div className="mt-8 rounded-[2rem] bg-lime-300 p-2 shadow-2xl shadow-black/20">
              <SearchBar />
              <p className="px-4 pb-3 pt-2 text-xs font-medium text-emerald-950/70">Busque por bairro, zona ou pelo que seu cão precisa.</p>
            </div>
          </div>
          <div className="mt-12 flex gap-2" aria-label="Galeria de destaques">
            {heroImages.map((image, index) => <span aria-label={`Imagem ${index + 1}`} className={`h-1.5 rounded-full ${index === 0 ? "w-10 bg-lime-300" : "w-4 bg-white/50"}`} key={image} />)}
          </div>
        </div>
      </section>
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-5 py-16 sm:px-8 lg:px-12">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">Seu momento, seu ritmo</p><h2 className="mt-2 text-3xl font-black tracking-tight text-emerald-950">Para que seu cão precisa de espaço?</h2></div>
          <Link className="text-sm font-bold text-emerald-900 underline underline-offset-4" href="/espacos">Explorar catálogo →</Link>
        </div>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {USE_TYPES.map((useType, index) => <Link className="group rounded-3xl border border-emerald-950/10 bg-white p-5 transition hover:bg-lime-200" href={`/espacos?uso=${useType}`} key={useType}><span className="text-2xl">{["🌿", "🎾", "✨", "🐕"][index]}</span><h3 className="mt-8 text-lg font-black text-emerald-950">{USE_TYPE_LABELS[useType]}</h3><p className="mt-1 text-sm text-stone-600">Veja espaços na sua região.</p></Link>)}
        </div>
      </section>
    </main>
  );
}
