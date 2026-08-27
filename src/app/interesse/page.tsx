import Link from "next/link";
import { InterestForm } from "@/components/interest-form";
import { ZONES, type Zone } from "@/lib/domain/catalog";
type Props = { searchParams: Promise<Record<string, string | undefined>> };
export default async function InterestPage({ searchParams }: Props) {
  const params = await searchParams; const zone = ZONES.includes(params.zona as Zone) ? params.zona as Zone : undefined;
  return <main className="min-h-screen bg-[#f8f4eb] px-5 py-6 sm:px-8"><div className="mx-auto max-w-2xl"><Link className="text-xl font-black text-emerald-950" href="/">Pátio Livre</Link><p className="mt-10 text-sm font-bold uppercase tracking-[.16em] text-emerald-700">Acesso antecipado</p><h1 className="mt-2 text-4xl font-black tracking-tight text-emerald-950">Conte onde falta espaço para vocês.</h1><p className="mt-3 mb-7 text-stone-600">Usaremos suas respostas para entender a demanda em São Paulo e avisar sobre novidades relevantes.</p><InterestForm context={{ desiredZone: zone, desiredNeighborhood: params.bairro, spaceSlug: params.space, sourceKind: params.space ? "space" : zone ? "region" : "general" }} /></div></main>;
}
