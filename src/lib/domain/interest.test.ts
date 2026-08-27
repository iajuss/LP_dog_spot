import { interestSchema, toCents } from "./interest";

test("converte orçamento brasileiro em centavos", () => {
  expect(toCents("R$ 75,50")).toBe(7550);
  expect(toCents("")).toBeNull();
});

test("rejeita solicitação sem nome, data, período ou consentimento de contato", () => {
  expect(interestSchema.safeParse({ requestKind: "reservation_request", name: "", email: "teste@example.com", homeNeighborhood: "", desiredNeighborhood: "Moema", desiredZone: "Sul", useType: "passeio", dogSize: "medio", dogCount: 1, desiredDate: "", timeSlot: "", contactConsent: false, marketingConsent: false }).success).toBe(false);
});
