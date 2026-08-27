"use client";
import { buildFunnelEvent, getAnonymousSessionId, type FunnelEventName } from "./analytics";
export function trackEvent(eventName: FunnelEventName, context: Record<string, unknown> = {}) {
  const event = buildFunnelEvent(eventName, context);
  const payload = JSON.stringify({ ...event, context: event.payload, sessionId: getAnonymousSessionId(), landingPath: window.location.pathname });
  void fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true });
}
