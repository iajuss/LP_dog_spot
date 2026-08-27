import { interestSchema, toCents } from "./interest";

test("converte orçamento brasileiro em centavos", () => {
  expect(toCents("R$ 75,50")).toBe(7550);
  expect(toCents("")).toBeNull();
});

test("rejeita interesse sem bairro, data ou consentimento de contato", () => {
  expect(interestSchema.safeParse({ email: "teste@example.com", homeNeighborhood: "", desiredNeighborhood: "Moema", desiredZone: "Sul", useType: "passeio", dogSize: "medio", dogCount: 1, desiredDate: "", contactConsent: false, marketingConsent: false }).success).toBe(false);
});
