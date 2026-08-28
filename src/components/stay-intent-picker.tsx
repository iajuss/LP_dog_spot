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
 * A pergunta da primeira tela, em três chips soltos sobre a foto — sem caixa,
 * para não competir com o herói. Hospedagem e pernoite vêm sólidos; lazer é um
 * contorno leve, do tamanho da sua importância.
 *
 * São botões alternáveis, e não rádios, porque responder é opcional: nada vem
 * marcado, clicar de novo desfaz a escolha e quem só quer olhar a região busca
 * sem responder. Rádio marcado não volta atrás — a escolha vira definitiva.
 */
export function StayIntentPicker({ defaultIntent }: { defaultIntent?: StayIntent }) {
  const [selected, setSelected] = useState<StayIntent | undefined>(defaultIntent);
  const toggle = (intent: StayIntent) => setSelected((current) => (current === intent ? undefined : intent));

  return (
    <div aria-label="Onde seu cão vai ficar enquanto você não está?" role="group">
      <p className="text-sm font-medium text-emerald-50/80">Onde seu cão vai ficar enquanto você não está?</p>
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        {STAY_INTENTS.map((intent) => (
          <IntentChip
            intent={intent}
            key={intent}
            onToggle={toggle}
            prominent={isOvernightIntent(intent)}
            selected={selected === intent}
          />
        ))}
      </div>
      {/* Só viaja na URL quando o tutor escolheu de fato. */}
      {selected ? <input name="intencao" type="hidden" value={selected} /> : null}
    </div>
  );
}

function IntentChip({
  intent,
  onToggle,
  prominent,
  selected,
}: {
  intent: StayIntent;
  onToggle: (intent: StayIntent) => void;
  prominent: boolean;
  selected: boolean;
}) {
  const resting = prominent
    ? "bg-white/90 text-emerald-950 hover:bg-white"
    : "border border-white/40 text-emerald-50 hover:bg-white/10";

  return (
    <button
      // O chip mostra só o rótulo; a explicação fica no nome acessível.
      aria-label={`${STAY_INTENT_LABELS[intent]} — ${STAY_INTENT_TAGLINES[intent]}`}
      aria-pressed={selected}
      className={`min-h-11 rounded-full px-5 text-sm font-bold transition ${
        selected ? "bg-lime-300 text-emerald-950 shadow-lg shadow-black/20" : resting
      }`}
      onClick={() => onToggle(intent)}
      type="button"
    >
      {STAY_INTENT_LABELS[intent]}
    </button>
  );
}
