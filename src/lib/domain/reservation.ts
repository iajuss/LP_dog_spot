import { z } from "zod";
import { ZONES } from "./catalog";

const sharedRequestSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().email(),
  desiredZone: z.enum(ZONES),
  dogCount: z.coerce.number().int().min(1).max(8),
  contactConsent: z.literal(true),
  phone: z.string().trim().optional(),
  budget: z.string().trim().optional(),
});

export const availabilityAlertSchema = sharedRequestSchema.extend({ desiredDate: z.string().optional(), timeSlot: z.string().optional() });
export const reservationSchema = sharedRequestSchema.extend({ desiredDate: z.string().min(10), timeSlot: z.enum(["manha", "tarde", "noite"]) });
export type RequestKind = "reservation_request" | "availability_alert";
