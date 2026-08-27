import { z } from "zod";
import { DOG_SIZES, USE_TYPES, ZONES } from "./catalog";

export const interestSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  homeNeighborhood: z.string().trim().min(2, "Informe o bairro onde você mora").max(80),
  desiredNeighborhood: z.string().trim().min(2, "Informe o bairro desejado").max(80),
  desiredZone: z.enum(ZONES),
  useType: z.enum(USE_TYPES),
  dogSize: z.enum(DOG_SIZES),
  dogCount: z.coerce.number().int().min(1).max(8),
  desiredDate: z.string().min(10, "Informe uma data desejada"),
  budget: z.string().optional().default(""),
  contactConsent: z.literal(true, { errorMap: () => ({ message: "Precisamos da sua autorização para entrar em contato" }) }),
  marketingConsent: z.boolean().default(false),
  spaceSlug: z.string().optional(),
  utmSource: z.string().max(120).optional(), utmMedium: z.string().max(120).optional(), utmCampaign: z.string().max(120).optional(),
  landingPath: z.string().max(200).optional(), anonymousSessionId: z.string().max(100).optional(), sourceKind: z.enum(["space", "region", "general"]).default("general"),
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
