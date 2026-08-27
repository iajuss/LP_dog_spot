"use client";

import { useId, useRef, useState } from "react";

type SelectOption = {
  label: string;
  value: string;
};

type StyledSelectProps = {
  label: string;
  name: string;
  options: SelectOption[];
  placeholder: string;
  value?: string;
  /** Quando falso, não oferece a opção vazia — usado em campos obrigatórios. */
  clearable?: boolean;
};

export function StyledSelect({ label, name, options, placeholder, value = "", clearable = true }: StyledSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const [activeIndex, setActiveIndex] = useState(-1);
  const labelId = useId();
  const listId = useId();
  const blurTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const selected = options.find((option) => option.value === selectedValue);

  function choose(optionValue: string) {
    setSelectedValue(optionValue);
    setIsOpen(false);
    setActiveIndex(-1);
  }

  return (
    <div
      className="relative grid gap-2 text-sm font-medium text-emerald-950"
      onBlur={() => {
        blurTimer.current = setTimeout(() => setIsOpen(false), 120);
      }}
      onFocus={() => {
        if (blurTimer.current) clearTimeout(blurTimer.current);
      }}
    >
      <span id={labelId}>{label}</span>
      <input name={name} type="hidden" value={selectedValue} />

      <button
        aria-controls={listId}
        aria-expanded={isOpen}
        aria-label={`${label}: ${selected?.label ?? placeholder}`}
        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-emerald-950/10 bg-[#f8f4eb] px-4 py-3 text-left font-semibold text-emerald-950 transition hover:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-lime-300"
        onClick={() => setIsOpen((open) => !open)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setIsOpen(true);
            setActiveIndex((index) => Math.min(index + 1, options.length - 1));
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((index) => Math.max(index - 1, 0));
          } else if (event.key === "Enter" && isOpen && options[activeIndex]) {
            event.preventDefault();
            choose(options[activeIndex].value);
          } else if (event.key === "Escape") {
            setIsOpen(false);
          }
        }}
        type="button"
      >
        <span className="truncate">{selected?.label ?? placeholder}</span>
        <span aria-hidden className={`shrink-0 text-lg leading-none transition ${isOpen ? "rotate-180" : ""}`}>⌄</span>
      </button>

      {isOpen ? (
        <div
          className="absolute left-0 right-0 top-full z-30 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-emerald-950/10 bg-white p-1 shadow-xl shadow-emerald-950/10"
          id={listId}
          role="listbox"
        >
          {clearable ? (
            <button
              aria-selected={selectedValue === ""}
              className="block w-full rounded-xl px-3 py-2.5 text-left text-sm text-stone-600 transition hover:bg-lime-100"
              onClick={() => choose("")}
              role="option"
              type="button"
            >
              {placeholder}
            </button>
          ) : null}
          {options.map((option, index) => (
            <button
              aria-selected={selectedValue === option.value}
              className={`block w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-emerald-950 transition ${
                index === activeIndex ? "bg-lime-200" : "hover:bg-lime-100"
              }`}
              key={option.value}
              onClick={() => choose(option.value)}
              onMouseEnter={() => setActiveIndex(index)}
              role="option"
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
