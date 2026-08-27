"use client";

import { trackEvent } from "@/lib/track-client";

type SearchBarProps = {
  defaultValue?: string;
  compact?: boolean;
};

export function SearchBar({ defaultValue = "", compact = false }: SearchBarProps) {
  return (
    <form action="/espacos" className={compact ? "flex gap-2" : "rounded-3xl bg-white p-2 shadow-xl shadow-emerald-950/10"} onSubmit={() => trackEvent("search_started")}>
      <label className="sr-only" htmlFor="busca">
        Bairro ou região em São Paulo
      </label>
      <input
        className="min-w-0 flex-1 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none ring-lime-300 placeholder:text-stone-400 focus:ring-2"
        defaultValue={defaultValue}
        id="busca"
        name="busca"
        placeholder="Bairro ou zona"
        type="search"
      />
      <button className="rounded-2xl bg-emerald-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800" type="submit">
        Explorar
      </button>
    </form>
  );
}
