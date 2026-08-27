import { AMENITIES, AMENITY_LABELS, DOG_SIZES, DOG_SIZE_LABELS, USE_TYPES, USE_TYPE_LABELS, ZONES } from "@/lib/domain/catalog";
import type { SearchFilters } from "@/lib/domain/filters";

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
        <label className="grid gap-2 text-sm font-medium text-emerald-950">
          Buscar por bairro
          <input className="rounded-xl border border-stone-200 px-3 py-2" defaultValue={filters.query} name="busca" placeholder="Ex.: Moema" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-emerald-950">
          Zona
          <select className="rounded-xl border border-stone-200 bg-white px-3 py-2" defaultValue={filters.zone ?? ""} name="zona">
            <option value="">Todas as zonas</option>
            {ZONES.map((zone) => <option key={zone} value={zone}>{zone}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-emerald-950">
          Para quê você procura?
          <select className="rounded-xl border border-stone-200 bg-white px-3 py-2" defaultValue={filters.useType ?? ""} name="uso">
            <option value="">Qualquer uso</option>
            {USE_TYPES.map((useType) => <option key={useType} value={useType}>{USE_TYPE_LABELS[useType]}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-emerald-950">
          Porte do cão
          <select className="rounded-xl border border-stone-200 bg-white px-3 py-2" defaultValue={filters.dogSize ?? ""} name="porte">
            <option value="">Qualquer porte</option>
            {DOG_SIZES.map((size) => <option key={size} value={size}>{DOG_SIZE_LABELS[size]}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-emerald-950">
          Quantos cães?
          <select className="rounded-xl border border-stone-200 bg-white px-3 py-2" defaultValue={filters.dogCount ?? ""} name="caes">
            <option value="">Não importa</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => <option key={count} value={count}>{count} {count === 1 ? "cão" : "cães"}</option>)}
          </select>
        </label>
        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium text-emerald-950">Recursos desejados</legend>
          {AMENITIES.map((amenity) => (
            <label className="flex items-center gap-2 text-sm text-stone-600" key={amenity}>
              <input defaultChecked={filters.amenities.includes(amenity)} name="recursos" type="checkbox" value={amenity} />
              {AMENITY_LABELS[amenity]}
            </label>
          ))}
        </fieldset>
        <button className="rounded-xl bg-emerald-950 px-4 py-3 text-sm font-bold text-white" type="submit">Aplicar filtros</button>
      </form>
    </details>
  );
}
