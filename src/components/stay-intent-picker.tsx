"use client";

import { useState } from "react";
import {
  STAY_INTENTS,
  STAY_INTENT_LABELS,
  STAY_INTENT_TAGLINES,
  isOvernightIntent,
  type StayIntent,
} from "@/lib/domain/stay";

/**
 * A primeira pergunta da home. Hospedagem e pernoite ocupam a linha de cima e
 * chegam marcados; lazer fica embaixo, menor, como opção complementar.
 */
export function StayIntentPicker({ defaultIntent = "hospedagem" }: { defaultIntent?: StayIntent }) {
  const [selected, setSelected] = useState<StayIntent>(defaultIntent);

  return (
    <fieldset className="grid gap-2 px-1 pb-2 pt-1">
      <legend className="px-3 pb-2 text-sm font-bold text-emerald-950">
        Onde seu cão vai ficar enquanto você não está?
      </legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {STAY_INTENTS.filter((intent) => isOvernightIntent(intent)).map((intent) => (
          <IntentOption checked={selected === intent} intent={intent} key={intent} onSelect={setSelected} prominent />
        ))}
      </div>
      {STAY_INTENTS.filter((intent) => !isOvernightIntent(intent)).map((intent) => (
        <IntentOption checked={selected === intent} intent={intent} key={intent} onSelect={setSelected} />
      ))}
    </fieldset>
  );
}

function IntentOption({
  checked,
  intent,
  onSelect,
  prominent = false,
}: {
  checked: boolean;
  intent: StayIntent;
  onSelect: (intent: StayIntent) => void;
  prominent?: boolean;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 bg-white transition ${
        prominent ? "p-4" : "p-3"
      } ${checked ? "border-emerald-950 shadow-sm" : "border-stone-200 hover:border-emerald-950/40"}`}
    >
      <input
        checked={checked}
        className="mt-1 size-4 shrink-0 accent-emerald-950"
        name="intencao"
        onChange={() => onSelect(intent)}
        type="radio"
        value={intent}
      />
      <span className="min-w-0">
        <span className={`block font-black text-emerald-950 ${prominent ? "text-base" : "text-sm"}`}>
          {STAY_INTENT_LABELS[intent]}
        </span>
        <span className="mt-0.5 block text-xs leading-5 text-stone-600">{STAY_INTENT_TAGLINES[intent]}</span>
      </span>
    </label>
  );
}
