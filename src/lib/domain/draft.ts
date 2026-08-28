import { z } from "zod";
import { DOG_SIZES, TIME_SLOTS, USE_TYPES, ZONES } from "./catalog";
import { toCents } from "./interest";

/**
 * Um rascunho é um pedido que a pessoa começou e não enviou. Como o
 * consentimento de contato fica no fim do formulário, quem desistiu no meio
 * nunca autorizou nada — então o rascunho guarda o que a pessoa procura, e
 * nunca quem ela é. Serve para entender onde o fluxo perde gente, não para
 * abordagem.
 *
 * Estes campos são recusados de propósito; o schema os descarta em silêncio.
 */
export const CONTACT_FIELDS = ["name", "email", "phone", "contactName", "contactEmail", "contactPhone"] as const;

export const draftSchema = z.object({
  anonymousSessionId: z.string().trim().min(1).max(100),
  requestKind: z.enum(["reservation_request", "availability_alert"]).default("reservation_request"),
  sourceKind: z.enum(["space", "region", "general"]).default("general"),
  spaceSlug: z.string().max(80).optional(),
  homeNeighborhood: z.string().max(80).optional(),
  desiredNeighborhood: z.string().max(80).optional(),
  desiredZone: z.enum(ZONES).optional(),
  useType: z.enum(USE_TYPES).optional(),
  dogSize: z.enum(DOG_SIZES).optional(),
  dogCount: z.coerce.number().int().min(1).max(8).optional(),
  desiredDate: z.string().max(20).optional(),
  timeSlot: z.enum(TIME_SLOTS).optional(),
  budget: z.string().max(40).optional(),
  landingPath: z.string().max(200).optional(),
  utmSource: z.string().max(120).optional(),
  utmMedium: z.string().max(120).optional(),
  utmCampaign: z.string().max(120).optional(),
});

export type DraftInput = z.infer<typeof draftSchema> & { budgetCents: number | null };

export function toDraftInput(input: unknown): DraftInput {
  const parsed = draftSchema.parse(input);
  return { ...parsed, budgetCents: toCents(parsed.budget ?? "") };
}
