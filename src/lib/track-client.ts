"use client";
import { buildFunnelEvent, funnelContextFromSearchParams, getAnonymousSessionId, type FunnelEventName } from "./analytics";
export function trackEvent(eventName: FunnelEventName, context: Record<string, unknown> = {}) {
  const event = buildFunnelEvent(eventName, context);
  const payload = JSON.stringify({ ...event, context: event.payload, sessionId: getAnonymousSessionId(), landingPath: window.location.pathname });
  void fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true });
}

export function trackFilterEvent(eventName: Extract<FunnelEventName, "search_started" | "filters_changed">, form: HTMLFormElement) {
  const params = new URLSearchParams();
  new FormData(form).forEach((value, key) => {
    if (typeof value === "string") params.set(key, value);
  });
  trackEvent(eventName, funnelContextFromSearchParams(params));
}
