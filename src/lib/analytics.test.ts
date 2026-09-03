import { buildFunnelEvent } from "./analytics";

test("evento não contém e-mail nem bairro livre", () => {
  const event = buildFunnelEvent("interest_submitted", { email: "teste@example.com", homeNeighborhood: "Moema", zone: "Sul" });
  expect(JSON.stringify(event.payload)).not.toMatch(/teste@example.com|Moema/);
  expect(event.payload).toMatchObject({ zone: "Sul" });
});

test("evento não aceita bairro ou intenção fora do catálogo", () => {
  const event = buildFunnelEvent("filters_changed", {
    neighborhood: "email@exemplo.com",
    stayIntent: "qualquer coisa",
    zone: "Sul",
  });

  expect(event.payload).toEqual({ zone: "Sul" });
});
