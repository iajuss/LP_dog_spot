"use client";

import { CATALOG_NEIGHBORHOODS, ZONES } from "@/lib/domain/catalog";
import { trackFilterEvent } from "@/lib/track-client";
import { ComboBox } from "./combo-box";
import type { ComboOption } from "./combo-options";
import { StayIntentPicker } from "./stay-intent-picker";

/**
 * Zonas primeiro, por serem a busca mais ampla, depois os bairros atendidos.
 * Cada opção sabe em qual filtro do catálogo ela cai.
 */
const OPTIONS: ComboOption[] = [
  ...ZONES.map((zone) => ({ label: `Zona ${zone}`, value: zone, param: "zona" })),
  ...CATALOG_NEIGHBORHOODS.map((neighborhood) => ({ label: neighborhood, value: neighborhood, param: "bairro" })),
];

export function LocationSearch() {
  return (
    <form action="/espacos" className="grid gap-4" onSubmit={(event) => trackFilterEvent("search_started", event.currentTarget)}>
      {/* Os chips ficam soltos sobre a foto; só a busca ganha o bloco de cor. */}
      <StayIntentPicker />
      <div className="rounded-[1.5rem] bg-lime-300 p-1.5 shadow-2xl shadow-black/20 sm:rounded-[1.75rem]">
        <div className="flex items-center gap-2 rounded-[1.15rem] bg-white p-2 sm:rounded-[1.35rem]">
          <ComboBox
            className="min-w-0 grow"
            label="Bairro ou zona em São Paulo"
            labelHidden
            name="bairro"
            options={OPTIONS}
            placeholder="Bairro ou zona"
          />
          <button
            className="shrink-0 rounded-2xl bg-emerald-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
            type="submit"
          >
            Buscar
          </button>
        </div>
        <p className="px-3 pb-1.5 pt-2 text-[0.7rem] font-medium text-emerald-950/70">
          Dá para digitar o bairro ou a zona — e escolher a estadia é opcional.
        </p>
      </div>
    </form>
  );
}
