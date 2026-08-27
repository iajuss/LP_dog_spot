import { z } from "zod";
import { DOG_SIZES, USE_TYPES, ZONES } from "./catalog";

export const interestSchema = z.object({
  requestKind: z.enum(["reservation_request", "availability_alert"]).default("availability_alert"),
  name: z.string().trim().min(2, "Informe seu nome").max(100),
  email: z.string().email("Informe um e-mail válido"),
  phone: z.string().trim().max(30).optional().default(""),
  homeNeighborhood: z.string().trim().min(2, "Informe o bairro onde você mora").max(80),
  desiredNeighborhood: z.string().trim().min(2, "Informe o bairro desejado").max(80),
  desiredZone: z.enum(ZONES),
  useType: z.enum(USE_TYPES),
  dogSize: z.enum(DOG_SIZES),
  dogCount: z.coerce.number().int().min(1).max(8),
  desiredDate: z.string().optional().default(""),
  timeSlot: z.enum(["manha", "tarde", "noite"]).optional(),
  budget: z.string().optional().default(""),
  contactConsent: z.literal(true, { errorMap: () => ({ message: "Precisamos da sua autorização para entrar em contato" }) }),
  marketingConsent: z.boolean().default(false),
  spaceSlug: z.string().optional(),
  utmSource: z.string().max(120).optional(), utmMedium: z.string().max(120).optional(), utmCampaign: z.string().max(120).optional(),
  landingPath: z.string().max(200).optional(), anonymousSessionId: z.string().max(100).optional(), sourceKind: z.enum(["space", "region", "general"]).default("general"),
}).superRefine((value, ctx) => {
  if (value.requestKind === "reservation_request" && value.desiredDate.length < 10) ctx.addIssue({ code: "custom", message: "Informe uma data desejada", path: ["desiredDate"] });
  if (value.requestKind === "reservation_request" && !value.timeSlot) ctx.addIssue({ code: "custom", message: "Informe um período desejado", path: ["timeSlot"] });
});

export type InterestInput = z.infer<typeof interestSchema> & { budgetCents: number | null };

export function toCents(value: string): number | null {
  const cleaned = value.replace(/[^0-9,]/g, "").replace(",", ".");
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed * 100) : null;
}

export function toInterestInput(input: unknown): InterestInput {
  const parsed = interestSchema.parse(input);
  return { ...parsed, budgetCents: toCents(parsed.budget) };
}
