import Image from "next/image";
import { BrandLogo } from "@/components/brand-logo";
import { InterestForm } from "@/components/interest-form";
import {
  SPACE_TYPE_LABELS,
  SP_NEIGHBORHOODS,
  TIME_SLOTS,
  USE_TYPES,
  ZONES,
  getSpaceBySlug,
  type TimeSlot,
  type UseType,
  type Zone,
} from "@/lib/domain/catalog";

type Props = { searchParams: Promise<Record<string, string | undefined>> };

/** Aceita o parâmetro só quando ele existe na lista conhecida. */
const pick = <T extends readonly string[]>(values: T, value?: string): T[number] | undefined =>
  value !== undefined && values.includes(value) ? (value as T[number]) : undefined;

export default async function ReservationPage({ searchParams }: Props) {
  const params = await searchParams;

  const space = params.space ? getSpaceBySlug(params.space) : undefined;
  const requestKind = params.kind === "availability_alert" ? "availability_alert" : "reservation_request";
  const isReservation = requestKind === "reservation_request";

  // O espaço de origem manda; os parâmetros soltos da URL só entram se forem válidos.
  const desiredZone = (space?.zone ?? pick(ZONES, params.zona)) as Zone | undefined;
  const desiredNeighborhood = space?.neighborhood ?? pick(SP_NEIGHBORHOODS, params.bairro);
  const useType = (space?.allowedUses[0] ?? pick(USE_TYPES, params.uso)) as UseType | undefined;
  const timeSlot = (space?.availableSlots[0] ?? pick(TIME_SLOTS, params.periodo)) as TimeSlot | undefined;

  return (
    <main className="min-h-screen bg-[#f8f4eb] px-5 py-6 sm:px-8">
      <div className="mx-auto max-w-2xl py-4 sm:py-10">
        <BrandLogo />

        <p className="mt-10 text-sm font-bold uppercase tracking-[.16em] text-emerald-700">
          {isReservation ? "Solicitação de reserva" : "Aviso de disponibilidade"}
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-emerald-950">
          {isReservation ? "Vamos encontrar o melhor momento para vocês." : "Conte o que você procura."}
        </h1>
        <p className="mt-3 text-stone-600">
          {isReservation
            ? "Preencha os detalhes e confirme seu e-mail para enviar sua solicitação."
            : "Deixe seus dados para receber um aviso quando houver uma opção que combine com vocês."}
        </p>

        {space ? (
          <section className="mt-6 flex items-center gap-4 rounded-2xl border border-emerald-950/10 bg-white p-3">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-emerald-100">
              <Image alt={space.imageAlt} className="object-cover" fill sizes="64px" src={space.imageUrl} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">
                {isReservation ? "Solicitação para" : "Aviso sobre"}
              </p>
              <p className="truncate text-base font-black text-emerald-950">{space.name}</p>
              <p className="truncate text-sm text-stone-600">
                {SPACE_TYPE_LABELS[space.spaceType]} · {space.neighborhoodLabel}
              </p>
            </div>
          </section>
        ) : null}

        <p className="mb-7 mt-6 text-sm text-stone-500">
          {space
            ? "Já preenchemos o que sabemos deste espaço. Ajuste o que precisar."
            : "Quanto mais detalhes, mais fácil encontrarmos algo que sirva."}
        </p>

        <InterestForm
          context={{
            desiredZone,
            desiredNeighborhood,
            useType,
            timeSlot,
            requestKind,
            spaceSlug: space?.slug,
            sourceKind: space ? "space" : desiredZone ? "region" : "general",
          }}
        />
      </div>
    </main>
  );
}
