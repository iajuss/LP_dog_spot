"use client";

import { CATALOG_NEIGHBORHOODS, ZONES } from "@/lib/domain/catalog";
import { trackEvent } from "@/lib/track-client";
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
    <form
      action="/espacos"
      className="grid gap-1 rounded-3xl bg-white p-2 shadow-xl shadow-emerald-950/10"
      onSubmit={() => trackEvent("search_started")}
    >
      <StayIntentPicker />
      <div className="flex items-center gap-2 border-t border-stone-100 pt-2">
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
    </form>
  );
}
