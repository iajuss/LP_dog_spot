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
 * A primeira pergunta da home. Hospedagem e pernoite ocupam a linha de cima;
 * lazer fica embaixo, menor, como opção complementar.
 *
 * São botões alternáveis, e não rádios, porque responder é opcional: nada vem
 * marcado, clicar de novo desfaz a escolha e quem só quer olhar a região busca
 * sem responder. Rádio marcado não volta atrás — a escolha vira definitiva.
 */
export function StayIntentPicker({ defaultIntent }: { defaultIntent?: StayIntent }) {
  const [selected, setSelected] = useState<StayIntent | undefined>(defaultIntent);
  const toggle = (intent: StayIntent) => setSelected((current) => (current === intent ? undefined : intent));

  return (
    <div
      aria-label="Onde seu cão vai ficar enquanto você não está?"
      className="grid gap-1.5 px-1 pb-1.5 pt-1"
      role="group"
    >
      <p className="px-2 pb-1.5 text-sm font-bold text-emerald-950">Onde seu cão vai ficar enquanto você não está?</p>
      <div className="grid grid-cols-2 gap-1.5">
        {STAY_INTENTS.filter((intent) => isOvernightIntent(intent)).map((intent) => (
          <IntentOption intent={intent} key={intent} onToggle={toggle} prominent selected={selected === intent} />
        ))}
      </div>
      {STAY_INTENTS.filter((intent) => !isOvernightIntent(intent)).map((intent) => (
        <IntentOption intent={intent} key={intent} onToggle={toggle} selected={selected === intent} />
      ))}
      {/* Só viaja na URL quando o tutor escolheu de fato. */}
      {selected ? <input name="intencao" type="hidden" value={selected} /> : null}
    </div>
  );
}

function IntentOption({
  intent,
  onToggle,
  prominent = false,
  selected,
}: {
  intent: StayIntent;
  onToggle: (intent: StayIntent) => void;
  prominent?: boolean;
  selected: boolean;
}) {
  return (
    <button
      aria-pressed={selected}
      className={`flex items-start gap-2.5 rounded-2xl border-2 bg-white px-3 text-left transition ${
        prominent ? "py-2.5" : "py-2"
      } ${selected ? "border-emerald-950 shadow-sm" : "border-stone-200 hover:border-emerald-950/40"}`}
      onClick={() => onToggle(intent)}
      type="button"
    >
      <span
        aria-hidden="true"
        className={`mt-1 grid size-4 shrink-0 place-items-center rounded-full border-2 transition ${
          selected ? "border-emerald-950" : "border-stone-300"
        }`}
      >
        <span className={`size-2 rounded-full transition ${selected ? "bg-emerald-950" : "bg-transparent"}`} />
      </span>
      <span className="min-w-0">
        <span className={`block font-black leading-tight text-emerald-950 ${prominent ? "text-[0.95rem]" : "text-sm"}`}>
          {STAY_INTENT_LABELS[intent]}
        </span>
        {/* No celular o rótulo basta; a explicação aparece quando há largura. */}
        <span className="mt-0.5 hidden text-[0.7rem] leading-4 text-stone-600 sm:block">
          {STAY_INTENT_TAGLINES[intent]}
        </span>
      </span>
    </button>
  );
}
