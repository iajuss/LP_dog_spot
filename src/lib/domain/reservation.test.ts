import { availabilityAlertSchema, reservationSchema } from "./reservation";

const baseRequest = { name: "Ana", email: "ana@example.com", desiredZone: "Sul", dogCount: 1, contactConsent: true };

test("solicitação exige data e período, alerta não", () => {
  expect(reservationSchema.safeParse({ ...baseRequest, desiredDate: "", timeSlot: "" }).success).toBe(false);
  expect(availabilityAlertSchema.safeParse({ ...baseRequest, desiredDate: "", timeSlot: "" }).success).toBe(true);
});
