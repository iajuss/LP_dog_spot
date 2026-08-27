"use client";

import { useState } from "react";

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
};

export function StyledSelect({ label, name, options, placeholder, value = "" }: StyledSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const selected = options.find((option) => option.value === selectedValue);

  return (
    <div className="relative grid gap-2 text-sm font-medium text-emerald-950">
      <span>{label}</span>
      <input name={name} type="hidden" value={selectedValue} />
      <button
        aria-expanded={isOpen}
        aria-label={`${label}: ${selected?.label ?? placeholder}`}
        className="flex w-full items-center justify-between rounded-2xl border border-emerald-950/10 bg-[#f8f4eb] px-4 py-3 text-left font-semibold transition hover:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-lime-300"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        <span>{selected?.label ?? placeholder}</span>
        <span aria-hidden className={`text-lg transition ${isOpen ? "rotate-180" : ""}`}>⌄</span>
      </button>
      {isOpen ? (
        <div className="absolute left-0 right-0 top-[4.8rem] z-20 overflow-hidden rounded-2xl border border-emerald-950/10 bg-white p-1 shadow-xl shadow-emerald-950/10" role="listbox">
          <button aria-selected={selectedValue === ""} className="block w-full rounded-xl px-3 py-2 text-left text-sm text-stone-600 transition hover:bg-lime-100" onClick={() => { setSelectedValue(""); setIsOpen(false); }} role="option" type="button">{placeholder}</button>
          {options.map((option) => (
            <button
              aria-selected={selectedValue === option.value}
              className="block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-emerald-950 transition hover:bg-lime-100"
              key={option.value}
              onClick={() => { setSelectedValue(option.value); setIsOpen(false); }}
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
