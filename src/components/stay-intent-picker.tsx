"use client";

import { useState } from "react";
import {
  STAY_INTENTS,
  STAY_INTENT_LABELS,
  STAY_INTENT_TAGLINES,
  type StayIntent,
} from "@/lib/domain/stay";

/**
 * A pergunta da primeira tela, em três chips iguais soltos sobre a foto — sem
 * caixa, para não competir com o herói.
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
          <IntentChip intent={intent} key={intent} onToggle={toggle} selected={selected === intent} />
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
  selected,
}: {
  intent: StayIntent;
  onToggle: (intent: StayIntent) => void;
  selected: boolean;
}) {
  return (
    <button
      // O chip mostra só o rótulo; a explicação fica no nome acessível.
      aria-label={`${STAY_INTENT_LABELS[intent]} — ${STAY_INTENT_TAGLINES[intent]}`}
      aria-pressed={selected}
      // Os três são idênticos de propósito: qualquer diferença de tamanho ou de
      // opacidade lia como componentes distintos. A prioridade da estadia vem
      // da ordem e do título, não de pesar um chip mais que o outro.
      className={`min-h-11 rounded-full border px-4 text-sm font-bold backdrop-blur-sm transition sm:px-5 ${
        selected
          ? "border-lime-300 bg-lime-300 text-emerald-950 shadow-lg shadow-black/25"
          : "border-white/35 bg-white/15 text-white hover:bg-white/25"
      }`}
      onClick={() => onToggle(intent)}
      type="button"
    >
      {STAY_INTENT_LABELS[intent]}
    </button>
  );
}
