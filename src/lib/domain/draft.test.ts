import { CONTACT_FIELDS, draftSchema, toDraftInput } from "./draft";

const base = {
  anonymousSessionId: "sessao-1",
  requestKind: "reservation_request",
  desiredZone: "Sul",
  desiredNeighborhood: "Moema",
  useType: "passeio",
  dogCount: 2,
};

test("aceita um pedido pela metade, sem exigir os campos que faltam", () => {
  const parsed = draftSchema.parse({ anonymousSessionId: "sessao-1" });

  expect(parsed.anonymousSessionId).toBe("sessao-1");
  expect(parsed.desiredZone).toBeUndefined();
  expect(parsed.sourceKind).toBe("general");
});

test("guarda o conteúdo do pedido", () => {
  const parsed = draftSchema.parse(base);

  expect(parsed).toMatchObject({ desiredZone: "Sul", desiredNeighborhood: "Moema", useType: "passeio", dogCount: 2 });
});

test("descarta dados de contato mesmo se forem enviados", () => {
  const parsed = draftSchema.parse({
    ...base,
    name: "Ana",
    email: "ana@example.com",
    phone: "11999999999",
    contactName: "Ana",
    contactEmail: "ana@example.com",
  }) as Record<string, unknown>;

  for (const field of ["name", "email", "phone", "contactName", "contactEmail"]) {
    expect(parsed[field], `campo de contato vazou: ${field}`).toBeUndefined();
  }
  expect(JSON.stringify(parsed)).not.toContain("ana@example.com");
});

test("a lista de campos proibidos é explícita e cobre contato", () => {
  expect(CONTACT_FIELDS).toEqual(expect.arrayContaining(["name", "email", "phone"]));
});

test("exige uma sessão anônima para poder agrupar o rascunho", () => {
  expect(draftSchema.safeParse({}).success).toBe(false);
  expect(draftSchema.safeParse({ anonymousSessionId: "" }).success).toBe(false);
});

test("recusa valores fora das listas conhecidas", () => {
  expect(draftSchema.safeParse({ ...base, desiredZone: "Narnia" }).success).toBe(false);
  expect(draftSchema.safeParse({ ...base, useType: "voar" }).success).toBe(false);
  expect(draftSchema.safeParse({ ...base, dogCount: 99 }).success).toBe(false);
});

test("converte o orçamento em centavos, como no pedido finalizado", () => {
  expect(toDraftInput({ ...base, budget: "R$ 75,50" }).budgetCents).toBe(7550);
  expect(toDraftInput(base).budgetCents).toBeNull();
});
