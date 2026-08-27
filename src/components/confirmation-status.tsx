"use client";
import { useEffect, useState } from "react";
export function ConfirmationStatus({ interest }: { interest?: string }) {
  const [state, setState] = useState<"loading" | "confirmed" | "error">(() => interest ? "loading" : "error");
  const [message, setMessage] = useState(() => interest ? "" : "O link não contém um interesse para confirmar.");
  useEffect(() => { if (!interest) return; fetch("/api/interests/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ interest }) }).then(async (response) => { if (response.ok) setState("confirmed"); else { setState("error"); setMessage((await response.json()).error ?? "Não foi possível confirmar."); } }).catch(() => { setState("error"); setMessage("Não foi possível confirmar agora."); }); }, [interest]);
  if (state === "loading") return <p className="text-stone-600">Confirmando seu interesse…</p>;
  if (state === "confirmed") return <div><h1 className="text-4xl font-black text-emerald-950">Interesse confirmado.</h1><p className="mt-3 text-stone-600">Obrigado — avisaremos quando houver novidades relevantes. Isso não é uma reserva.</p></div>;
  return <div><h1 className="text-3xl font-black text-emerald-950">Precisamos confirmar seu link.</h1><p className="mt-3 text-stone-600">{message}</p></div>;
}
