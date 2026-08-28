import {
  AMENITIES,
  AMENITY_LABELS,
  CATALOG_NEIGHBORHOODS,
  DOG_SIZES,
  DOG_SIZE_LABELS,
  TIME_SLOTS,
  TIME_SLOT_LABELS,
  USE_TYPES,
  USE_TYPE_LABELS,
  ZONES,
} from "@/lib/domain/catalog";
import type { SearchFilters } from "@/lib/domain/filters";
import { ComboBox } from "./combo-box";
import { toComboOptions } from "./combo-options";
import { StyledSelect } from "./styled-select";

type FilterPanelProps = {
  filters: SearchFilters;
};

export function FilterPanel({ filters }: FilterPanelProps) {
  return (
    <details className="group rounded-3xl border border-emerald-950/10 bg-white md:open:block" open>
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-bold text-emerald-950 md:pointer-events-none">
        Filtros
        <span className="rounded-full bg-lime-200 px-3 py-1 text-xs md:hidden">Abrir</span>
      </summary>
      <form action="/espacos" className="grid gap-5 border-t border-stone-100 p-5">
        <ComboBox
          hint="Digite para encontrar mais rápido."
          label="Bairro"
          name="bairro"
          options={toComboOptions(CATALOG_NEIGHBORHOODS)}
          placeholder="Todos os bairros"
          value={filters.neighborhood}
        />
        <StyledSelect label="Zona" name="zona" options={ZONES.map((zone) => ({ label: zone, value: zone }))} placeholder="Todas as zonas" value={filters.zone} />
        <StyledSelect label="Para quê você procura?" name="uso" options={USE_TYPES.map((useType) => ({ label: USE_TYPE_LABELS[useType], value: useType }))} placeholder="Qualquer uso" value={filters.useType} />
        <StyledSelect label="Porte do cão" name="porte" options={DOG_SIZES.map((size) => ({ label: DOG_SIZE_LABELS[size], value: size }))} placeholder="Qualquer porte" value={filters.dogSize} />
        <StyledSelect label="Quantos cães?" name="caes" options={[1, 2, 3, 4, 5, 6, 7, 8].map((count) => ({ label: `${count} ${count === 1 ? "cão" : "cães"}`, value: String(count) }))} placeholder="Não importa" value={filters.dogCount ? String(filters.dogCount) : undefined} />
        <StyledSelect label="Período" name="periodo" options={TIME_SLOTS.map((slot) => ({ label: TIME_SLOT_LABELS[slot], value: slot }))} placeholder="Qualquer período" value={filters.timeSlot} />
        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium text-emerald-950">Recursos desejados</legend>
          {AMENITIES.map((amenity) => (
            <label className="flex items-center gap-2 text-sm text-stone-600" key={amenity}>
              <input defaultChecked={filters.amenities.includes(amenity)} name="recursos" type="checkbox" value={amenity} />
              {AMENITY_LABELS[amenity]}
            </label>
          ))}
        </fieldset>
        <button className="min-h-11 rounded-xl bg-emerald-950 px-4 py-3 text-sm font-bold text-white" type="submit">Aplicar filtros</button>
      </form>
    </details>
  );
}
