"use client";

import { useId, useMemo, useRef, useState } from "react";

type ComboBoxProps = {
  label: string;
  name: string;
  options: string[];
  placeholder: string;
  value?: string;
  /** Texto de apoio abaixo do campo. */
  hint?: string;
  required?: boolean;
};

/** Compara ignorando acento e caixa, para "sao" encontrar "São". */
const normalize = (text: string) =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("pt-BR");

/**
 * Seleção com a mesma aparência dos outros filtros, mas onde dá para digitar
 * para achar o bairro. Só valores da lista são enviados no formulário.
 */
export function ComboBox({ label, name, options, placeholder, value = "", hint, required = false }: ComboBoxProps) {
  const [query, setQuery] = useState(value);
  const [selected, setSelected] = useState(options.includes(value) ? value : "");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listId = useId();
  const blurTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const matches = useMemo(() => {
    if (!query.trim() || query === selected) return options;
    return options.filter((option) => normalize(option).includes(normalize(query)));
  }, [options, query, selected]);

  function choose(option: string) {
    setSelected(option);
    setQuery(option);
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function clear() {
    setSelected("");
    setQuery("");
    setActiveIndex(-1);
  }

  return (
    <div className="relative grid gap-2 text-sm font-medium text-emerald-950">
      <label className="font-medium" htmlFor={`${listId}-input`}>
        {label}
      </label>

      <input name={name} type="hidden" value={selected} />

      <div className="relative">
        <input
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={isOpen}
          autoComplete="off"
          // Mesmo peso e cor dos StyledSelect ao lado, para a coluna de filtros ficar uniforme.
          className="w-full rounded-2xl border border-emerald-950/10 bg-[#f8f4eb] px-4 py-3 pr-10 font-semibold text-emerald-950 outline-none transition placeholder:font-semibold placeholder:text-emerald-950 hover:border-emerald-800 focus:ring-2 focus:ring-lime-300"
          id={`${listId}-input`}
          onBlur={() => {
            // Espera o clique na opção acontecer antes de fechar a lista.
            blurTimer.current = setTimeout(() => {
              setIsOpen(false);
              setQuery(selected);
            }, 120);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelected("");
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => {
            if (blurTimer.current) clearTimeout(blurTimer.current);
            setIsOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setIsOpen(true);
              setActiveIndex((index) => Math.min(index + 1, matches.length - 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((index) => Math.max(index - 1, 0));
            } else if (event.key === "Enter") {
              if (isOpen && matches[activeIndex]) {
                event.preventDefault();
                choose(matches[activeIndex]);
              }
            } else if (event.key === "Escape") {
              setIsOpen(false);
              setQuery(selected);
            }
          }}
          placeholder={placeholder}
          required={required}
          role="combobox"
          type="text"
          value={query}
        />

        {selected || query ? (
          <button
            aria-label={`Limpar ${label.toLocaleLowerCase("pt-BR")}`}
            className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-stone-500 transition hover:bg-stone-200/70 hover:text-emerald-950"
            onClick={clear}
            type="button"
          >
            ×
          </button>
        ) : (
          <span aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-lg text-stone-500">
            ⌄
          </span>
        )}

        {isOpen ? (
          <div
            className="absolute left-0 right-0 top-full z-30 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-emerald-950/10 bg-white p-1 shadow-xl shadow-emerald-950/10"
            id={listId}
            role="listbox"
          >
            {matches.length ? (
              matches.map((option, index) => (
                <button
                  aria-selected={option === selected}
                  className={`block w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-emerald-950 transition ${
                    index === activeIndex ? "bg-lime-200" : "hover:bg-lime-100"
                  }`}
                  key={option}
                  onClick={() => choose(option)}
                  onMouseEnter={() => setActiveIndex(index)}
                  role="option"
                  type="button"
                >
                  {option}
                </button>
              ))
            ) : (
              <p className="px-3 py-3 text-sm font-normal text-stone-500">Nenhum bairro encontrado.</p>
            )}
          </div>
        ) : null}
      </div>

      {hint ? <p className="text-xs font-normal leading-5 text-stone-500">{hint}</p> : null}
    </div>
  );
}
