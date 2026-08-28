"use client";

import { useRef, useState } from "react";
import { DOG_SIZES, DOG_SIZE_LABELS, SP_NEIGHBORHOODS, TIME_SLOTS, TIME_SLOT_LABELS, USE_TYPES, USE_TYPE_LABELS, ZONES, type TimeSlot, type UseType, type Zone } from "@/lib/domain/catalog";
import { getAnonymousSessionId } from "@/lib/analytics";
import { ComboBox } from "./combo-box";
import { toComboOptions } from "./combo-options";
import { StyledSelect } from "./styled-select";

export type InterestContext = { desiredZone?: Zone; desiredNeighborhood?: string; useType?: UseType; timeSlot?: TimeSlot; spaceSlug?: string; requestKind: "reservation_request" | "availability_alert"; sourceKind: "space" | "region" | "general" };

/**
 * Campos que o rascunho pode conter. Contato fica de fora de propósito: quem
 * não terminou o formulário não marcou o consentimento. Ver `domain/draft.ts`.
 */
const DRAFT_FIELDS = [
  "homeNeighborhood",
  "desiredNeighborhood",
  "desiredZone",
  "useType",
  "dogSize",
  "dogCount",
  "desiredDate",
  "timeSlot",
  "budget",
] as const;

export function InterestForm({ context }: { context: InterestContext }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const draftTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  /** Guarda o que já foi preenchido, para sabermos onde as pessoas desistem. */
  function saveDraft(form: HTMLFormElement) {
    if (status === "sent" || status === "sending") return;
    if (draftTimer.current) clearTimeout(draftTimer.current);

    draftTimer.current = setTimeout(() => {
      const data = new FormData(form);
      const filled = Object.fromEntries(
        DRAFT_FIELDS.map((field) => [field, String(data.get(field) ?? "")]).filter(([, value]) => value !== ""),
      );
      if (!Object.keys(filled).length) return;

      const search = new URLSearchParams(window.location.search);
      void fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          ...filled,
          anonymousSessionId: getAnonymousSessionId(),
          requestKind: context.requestKind,
          sourceKind: context.sourceKind,
          spaceSlug: context.spaceSlug ?? "",
          landingPath: window.location.pathname,
          utmSource: search.get("utm_source") ?? "",
          utmMedium: search.get("utm_medium") ?? "",
          utmCampaign: search.get("utm_campaign") ?? "",
        }),
      }).catch(() => {});
    }, 700);
  }
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
  return <form action={submit} className="grid gap-5 rounded-3xl bg-white p-6 shadow-sm sm:grid-cols-2" onBlur={(event) => saveDraft(event.currentTarget)}>
    <label className="grid gap-2 text-sm font-bold text-emerald-950">Seu nome<input className="rounded-xl border border-stone-200 px-3 py-3 font-normal" name="name" required /></label>
    <label className="grid gap-2 text-sm font-bold text-emerald-950">Seu e-mail<input className="rounded-xl border border-stone-200 px-3 py-3 font-normal" name="email" required type="email" /></label>
    <label className="grid gap-2 text-sm font-bold text-emerald-950 sm:col-span-2">Telefone <span className="font-normal text-stone-500">(opcional)</span><input className="rounded-xl border border-stone-200 px-3 py-3 font-normal" name="phone" placeholder="(11) 99999-9999" type="tel" /></label>
    <ComboBox label="Em que bairro você mora?" name="homeNeighborhood" options={toComboOptions(SP_NEIGHBORHOODS)} placeholder="Escolha ou digite" required />
    <ComboBox hint="Não achou o seu? Escolha o mais próximo." label="Bairro onde gostaria de usar" name="desiredNeighborhood" options={toComboOptions(SP_NEIGHBORHOODS)} placeholder="Escolha ou digite" required value={context.desiredNeighborhood} />
    <StyledSelect clearable={false} label="Zona desejada" name="desiredZone" options={ZONES.map((zone) => ({ label: zone, value: zone }))} placeholder="Escolha a zona" value={context.desiredZone ?? ZONES[0]} />
    <StyledSelect clearable={false} label="Para qual momento?" name="useType" options={USE_TYPES.map((type) => ({ label: USE_TYPE_LABELS[type], value: type }))} placeholder="Escolha o momento" value={context.useType ?? USE_TYPES[0]} />
    <StyledSelect clearable={false} label="Porte do cão" name="dogSize" options={DOG_SIZES.map((size) => ({ label: DOG_SIZE_LABELS[size], value: size }))} placeholder="Escolha o porte" value={DOG_SIZES[0]} />
    <StyledSelect clearable={false} label="Quantos cães?" name="dogCount" options={[1,2,3,4,5,6,7,8].map((count) => ({ label: `${count} ${count === 1 ? "cão" : "cães"}`, value: String(count) }))} placeholder="Quantos cães" value="1" />
    <label className="grid gap-2 text-sm font-bold text-emerald-950">Data desejada<input className="rounded-xl border border-stone-200 px-3 py-3 font-normal" name="desiredDate" required={context.requestKind === "reservation_request"} type="date" /></label>
    {context.requestKind === "reservation_request" ? <StyledSelect clearable={false} label="Período desejado" name="timeSlot" options={TIME_SLOTS.map((slot) => ({ label: TIME_SLOT_LABELS[slot], value: slot }))} placeholder="Escolha o período" value={context.timeSlot ?? TIME_SLOTS[0]} /> : null}
    <label className="grid gap-2 text-sm font-bold text-emerald-950 sm:col-span-2">Quanto você pretende pagar por visita? <span className="font-normal text-stone-500">(opcional)</span><input className="rounded-xl border border-stone-200 px-3 py-3 font-normal" inputMode="decimal" name="budget" placeholder="Ex.: R$ 60" /><span className="text-xs font-normal leading-5 text-stone-500">Diga o valor que cabe no seu bolso. Serve para acharmos um espaço na sua faixa — nada é cobrado agora.</span></label>
    <label className="flex gap-3 text-sm leading-5 text-stone-600 sm:col-span-2"><input className="mt-1" name="contactConsent" required type="checkbox" />Autorizo o Pátio Livre a entrar em contato sobre esta solicitação.</label>
    <label className="flex gap-3 text-sm leading-5 text-stone-600 sm:col-span-2"><input className="mt-1" name="marketingConsent" type="checkbox" />Aceito receber comunicações por e-mail.</label>
    {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 sm:col-span-2">{error}</p>}
    <button className="rounded-xl bg-emerald-950 px-5 py-3 text-sm font-black text-white disabled:opacity-60 sm:col-span-2" disabled={status === "sending"} type="submit">{status === "sending" ? "Enviando…" : context.requestKind === "reservation_request" ? "Enviar solicitação" : "Quero ser avisado"}</button>
    <p className="text-xs leading-5 text-stone-500 sm:col-span-2">Você receberá um e-mail para confirmar esta solicitação.</p>
  </form>;
}
