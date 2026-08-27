"use client";

import { useEffect, useState } from "react";

type RequestKind = "reservation_request" | "availability_alert";

const CONFIRMED_COPY: Record<RequestKind, { title: string; body: string }> = {
  reservation_request: {
    title: "Solicitação confirmada.",
    body: "Recebemos sua solicitação. Nossa equipe vai confirmar a disponibilidade e os próximos detalhes por e-mail.",
  },
  availability_alert: {
    title: "Aviso confirmado.",
    body: "Vamos avisar você por e-mail assim que um espaço com esse perfil abrir na sua região.",
  },
};

export function ConfirmationStatus({ interest }: { interest?: string }) {
  const [state, setState] = useState<"loading" | "confirmed" | "error">(() => (interest ? "loading" : "error"));
  const [requestKind, setRequestKind] = useState<RequestKind>("reservation_request");
  const [message, setMessage] = useState(() => (interest ? "" : "O link não contém uma solicitação para confirmar."));

  useEffect(() => {
    if (!interest) return;
    fetch("/api/interests/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ interest }) })
      .then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (response.ok) {
          if (body.requestKind === "availability_alert") setRequestKind("availability_alert");
          setState("confirmed");
          return;
        }
        setState("error");
        setMessage(body.error ?? "Não foi possível confirmar.");
      })
      .catch(() => {
        setState("error");
        setMessage("Não foi possível confirmar agora.");
      });
  }, [interest]);

  if (state === "loading") return <p className="text-stone-600">Confirmando sua solicitação…</p>;

  if (state === "confirmed") {
    const copy = CONFIRMED_COPY[requestKind];
    return <div><h1 className="text-4xl font-black text-emerald-950">{copy.title}</h1><p className="mt-3 text-stone-600">{copy.body}</p></div>;
  }

  return <div><h1 className="text-3xl font-black text-emerald-950">Precisamos confirmar seu link.</h1><p className="mt-3 text-stone-600">{message}</p></div>;
}
