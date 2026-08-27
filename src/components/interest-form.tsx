"use client";

import { useState } from "react";
import { DOG_SIZES, DOG_SIZE_LABELS, USE_TYPES, USE_TYPE_LABELS, ZONES, type Zone } from "@/lib/domain/catalog";

export type InterestContext = { desiredZone?: Zone; desiredNeighborhood?: string; spaceSlug?: string; requestKind: "reservation_request" | "availability_alert"; sourceKind: "space" | "region" | "general" };

export function InterestForm({ context }: { context: InterestContext }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  async function submit(formData: FormData) {
    setStatus("sending"); setError("");
    const payload = {
      ...Object.fromEntries(formData.entries()),
      requestKind: context.requestKind,
      marketingConsent: formData.get("marketingConsent") === "on",
      contactConsent: formData.get("contactConsent") === "on",
      sourceKind: context.sourceKind,
      spaceSlug: context.spaceSlug ?? "",
      landingPath: window.location.pathname,
      utmSource: new URLSearchParams(window.location.search).get("utm_source") ?? "",
      utmMedium: new URLSearchParams(window.location.search).get("utm_medium") ?? "",
      utmCampaign: new URLSearchParams(window.location.search).get("utm_campaign") ?? "",
    };
    const response = await fetch("/api/interests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (response.ok) { setStatus("sent"); return; }
    const body = await response.json().catch(() => ({})); setError(body.error ?? "Não foi possível enviar agora."); setStatus("error");
  }
  if (status === "sent") return <div className="rounded-3xl bg-lime-200 p-6 text-emerald-950"><h2 className="text-2xl font-black">Enviamos um link para seu e-mail.</h2><p className="mt-2 text-sm leading-6">Abra o link para confirmar sua solicitação. Assim, poderemos seguir com os próximos detalhes.</p></div>;
  return <form action={submit} className="grid gap-5 rounded-3xl bg-white p-6 shadow-sm sm:grid-cols-2">
    <label className="grid gap-2 text-sm font-bold text-emerald-950">Seu nome<input className="rounded-xl border border-stone-200 px-3 py-3 font-normal" name="name" required /></label>
    <label className="grid gap-2 text-sm font-bold text-emerald-950">Seu e-mail<input className="rounded-xl border border-stone-200 px-3 py-3 font-normal" name="email" required type="email" /></label>
    <label className="grid gap-2 text-sm font-bold text-emerald-950 sm:col-span-2">Telefone <span className="font-normal text-stone-500">(opcional)</span><input className="rounded-xl border border-stone-200 px-3 py-3 font-normal" name="phone" placeholder="(11) 99999-9999" type="tel" /></label>
    <label className="grid gap-2 text-sm font-bold text-emerald-950">Em que bairro você mora?<input className="rounded-xl border border-stone-200 px-3 py-3 font-normal" name="homeNeighborhood" placeholder="Ex.: Moema" required /></label>
    <label className="grid gap-2 text-sm font-bold text-emerald-950">Bairro onde gostaria de usar<input className="rounded-xl border border-stone-200 px-3 py-3 font-normal" defaultValue={context.desiredNeighborhood} name="desiredNeighborhood" placeholder="Ex.: Vila Mariana" required /></label>
    <label className="grid gap-2 text-sm font-bold text-emerald-950">Zona desejada<select className="rounded-xl border border-stone-200 bg-white px-3 py-3 font-normal" defaultValue={context.desiredZone} name="desiredZone" required>{ZONES.map((zone) => <option key={zone}>{zone}</option>)}</select></label>
    <label className="grid gap-2 text-sm font-bold text-emerald-950">Para qual momento?<select className="rounded-xl border border-stone-200 bg-white px-3 py-3 font-normal" name="useType" required>{USE_TYPES.map((type) => <option key={type} value={type}>{USE_TYPE_LABELS[type]}</option>)}</select></label>
    <label className="grid gap-2 text-sm font-bold text-emerald-950">Porte do cão<select className="rounded-xl border border-stone-200 bg-white px-3 py-3 font-normal" name="dogSize" required>{DOG_SIZES.map((size) => <option key={size} value={size}>{DOG_SIZE_LABELS[size]}</option>)}</select></label>
    <label className="grid gap-2 text-sm font-bold text-emerald-950">Quantos cães?<select className="rounded-xl border border-stone-200 bg-white px-3 py-3 font-normal" defaultValue="1" name="dogCount" required>{[1,2,3,4,5,6,7,8].map((count) => <option key={count} value={count}>{count}</option>)}</select></label>
    <label className="grid gap-2 text-sm font-bold text-emerald-950">Data desejada<input className="rounded-xl border border-stone-200 px-3 py-3 font-normal" name="desiredDate" required={context.requestKind === "reservation_request"} type="date" /></label>
    {context.requestKind === "reservation_request" ? <label className="grid gap-2 text-sm font-bold text-emerald-950">Período desejado<select className="rounded-xl border border-stone-200 bg-white px-3 py-3 font-normal" name="timeSlot" required><option value="manha">Manhã</option><option value="tarde">Tarde</option><option value="noite">Noite</option></select></label> : null}
    <label className="grid gap-2 text-sm font-bold text-emerald-950">Orçamento por visita <span className="font-normal text-stone-500">(opcional)</span><input className="rounded-xl border border-stone-200 px-3 py-3 font-normal" name="budget" placeholder="Ex.: R$ 60" /></label>
    <label className="flex gap-3 text-sm leading-5 text-stone-600 sm:col-span-2"><input className="mt-1" name="contactConsent" required type="checkbox" />Autorizo o Pátio Livre a entrar em contato sobre esta solicitação.</label>
    <label className="flex gap-3 text-sm leading-5 text-stone-600 sm:col-span-2"><input className="mt-1" name="marketingConsent" type="checkbox" />Aceito receber comunicações por e-mail.</label>
    {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 sm:col-span-2">{error}</p>}
    <button className="rounded-xl bg-emerald-950 px-5 py-3 text-sm font-black text-white disabled:opacity-60 sm:col-span-2" disabled={status === "sending"} type="submit">{status === "sending" ? "Enviando…" : context.requestKind === "reservation_request" ? "Enviar solicitação" : "Quero ser avisado"}</button>
    <p className="text-xs leading-5 text-stone-500 sm:col-span-2">Você receberá um e-mail para confirmar esta solicitação.</p>
  </form>;
}
