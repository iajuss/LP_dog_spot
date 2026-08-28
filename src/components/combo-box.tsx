"use client";

import { useId, useMemo, useRef, useState } from "react";
import type { ComboOption } from "./combo-options";

type ComboBoxProps = {
  label: string;
  name: string;
  options: ComboOption[];
  placeholder: string;
  value?: string;
  /** Texto de apoio abaixo do campo. */
  hint?: string;
  required?: boolean;
  /** Esconde o rótulo visualmente, mantendo-o para leitores de tela. */
  labelHidden?: boolean;
  className?: string;
};

/** Compara ignorando acento e caixa, para "sao" encontrar "São". */
const normalize = (text: string) =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("pt-BR");

/**
 * Seleção com a mesma aparência dos outros filtros, mas onde dá para digitar
 * para achar a opção. Só valores da lista são enviados no formulário.
 */
export function ComboBox(props: ComboBoxProps) {
  return <ComboBoxControl key={`${props.name}:${props.value ?? ""}`} {...props} />;
}

function ComboBoxControl({
  label,
  name,
  options,
  placeholder,
  value = "",
  hint,
  required = false,
  labelHidden = false,
  className = "",
}: ComboBoxProps) {
  const initial = options.find((option) => option.value === value);
  const [query, setQuery] = useState(initial?.label ?? "");
  const [selected, setSelected] = useState<ComboOption | undefined>(initial);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listId = useId();
  const inputId = useId();
  const blurTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // O fechamento por blur é adiado, então precisa ler o valor atual — e não o
  // que existia quando o campo perdeu o foco — para não apagar a escolha.
  const selectedRef = useRef(selected);

  const matches = useMemo(() => {
    if (!query.trim() || query === selected?.label) return options;
    return options.filter((option) => normalize(option.label).includes(normalize(query)));
  }, [options, query, selected]);

  function choose(option: ComboOption) {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    selectedRef.current = option;
    setSelected(option);
    setQuery(option.label);
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function clear() {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    selectedRef.current = undefined;
    setSelected(undefined);
    setQuery("");
    setActiveIndex(-1);
  }

  return (
    <div className={`relative grid gap-2 text-sm font-medium text-emerald-950 ${className}`}>
      <label className={labelHidden ? "sr-only" : "font-medium"} htmlFor={inputId}>
        {label}
      </label>

      <input name={selected?.param ?? name} type="hidden" value={selected?.value ?? ""} />

      <div className="relative">
        <input
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={isOpen}
          autoComplete="off"
          // Mesmo peso e cor dos StyledSelect ao lado, para a coluna de filtros ficar uniforme.
          className="w-full rounded-2xl border border-emerald-950/10 bg-[#f8f4eb] px-4 py-3 pr-10 font-semibold text-emerald-950 outline-none transition placeholder:font-semibold placeholder:text-emerald-950 hover:border-emerald-800 focus:ring-2 focus:ring-lime-300"
          id={inputId}
          onBlur={() => {
            // Espera o clique na opção acontecer antes de fechar a lista.
            blurTimer.current = setTimeout(() => {
              setIsOpen(false);
              setQuery(selectedRef.current?.label ?? "");
            }, 120);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelected(undefined);
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
              setQuery(selectedRef.current?.label ?? "");
            }
          }}
          placeholder={placeholder}
          required={required}
          role="combobox"
          type="text"
          value={query}
        />

        {query ? (
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
            <button
              aria-selected={selected === undefined}
              className="block w-full rounded-xl px-3 py-2.5 text-left text-sm text-stone-600 transition hover:bg-lime-100"
              onClick={clear}
              role="option"
              type="button"
            >
              {placeholder}
            </button>
            {matches.length ? (
              matches.map((option, index) => (
                <button
                  aria-selected={selected?.value === option.value}
                  className={`block w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-emerald-950 transition ${
                    index === activeIndex ? "bg-lime-200" : "hover:bg-lime-100"
                  }`}
                  key={`${option.param ?? name}:${option.value}`}
                  onClick={() => choose(option)}
                  onMouseEnter={() => setActiveIndex(index)}
                  role="option"
                  type="button"
                >
                  {option.label}
                </button>
              ))
            ) : (
              <p className="px-3 py-3 text-sm font-normal text-stone-500">Nenhuma opção encontrada.</p>
            )}
          </div>
        ) : null}
      </div>

      {hint ? <p className="text-xs font-normal leading-5 text-stone-500">{hint}</p> : null}
    </div>
  );
}
