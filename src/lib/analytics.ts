export const FUNNEL_EVENTS = ["search_started", "filters_changed", "space_viewed", "region_interest_clicked", "interest_submitted", "interest_confirmed"] as const;
export type FunnelEventName = (typeof FUNNEL_EVENTS)[number];
export type FunnelEvent = { eventName: FunnelEventName; payload: Record<string, string | number | boolean>; createdAt: string };

const allowedKeys = new Set(["zone", "useType", "dogSize", "dogCount", "spaceSlug", "sourceKind", "utmSource", "utmMedium", "utmCampaign"]);

export function buildFunnelEvent(name: FunnelEventName, context: Record<string, unknown>): FunnelEvent {
  const payload = Object.fromEntries(Object.entries(context).filter(([key, value]) => allowedKeys.has(key) && ["string", "number", "boolean"].includes(typeof value))) as FunnelEvent["payload"];
  return { eventName: name, payload, createdAt: new Date().toISOString() };
}

export function getAnonymousSessionId(): string {
  if (typeof window === "undefined") return "server";
  const key = "patio-livre-session";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const value = crypto.randomUUID();
  window.localStorage.setItem(key, value);
  return value;
}
