import Link from "next/link";
import { InterestForm } from "@/components/interest-form";
import { ZONES, type Zone } from "@/lib/domain/catalog";

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function ReservationPage({ searchParams }: Props) {
  const params = await searchParams;
  const desiredZone = ZONES.includes(params.zona as Zone) ? params.zona as Zone : undefined;
  const requestKind = params.kind === "availability_alert" ? "availability_alert" : "reservation_request";
  const isReservation = requestKind === "reservation_request";

  return (
    <main className="min-h-screen bg-[#f8f4eb] px-5 py-6 sm:px-8">
      <div className="mx-auto max-w-2xl py-4 sm:py-10">
        <Link className="text-xl font-black text-emerald-950" href="/">Pátio Livre</Link>
        <p className="mt-10 text-sm font-bold uppercase tracking-[.16em] text-emerald-700">{isReservation ? "Solicitação de reserva" : "Aviso de disponibilidade"}</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-emerald-950">{isReservation ? "Vamos encontrar o melhor momento para vocês." : "Conte o que você procura."}</h1>
        <p className="mb-7 mt-3 text-stone-600">{isReservation ? "Preencha os detalhes e confirme seu e-mail para enviar sua solicitação." : "Deixe seus dados para receber um aviso quando houver uma opção que combine com vocês."}</p>
        <InterestForm context={{ desiredZone, desiredNeighborhood: params.bairro, requestKind, spaceSlug: params.space, sourceKind: params.space ? "space" : desiredZone ? "region" : "general" }} />
      </div>
    </main>
  );
}
