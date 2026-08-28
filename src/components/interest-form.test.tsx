import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { InterestForm } from "./interest-form";

test("coleta uma solicitação de reserva com confirmação por e-mail", () => {
  render(<InterestForm context={{ desiredZone: "Sul", desiredNeighborhood: "Moema", requestKind: "reservation_request", sourceKind: "general" }} />);
  expect(screen.getByLabelText(/aceito receber comunicações/i)).not.toBeChecked();
  expect(screen.getByLabelText(/seu nome/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/período desejado/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /enviar solicitação/i })).toBeInTheDocument();
});

test("todos os seletores do formulário usam o estilo do site", () => {
  render(<InterestForm context={{ desiredZone: "Sul", desiredNeighborhood: "Moema", requestKind: "reservation_request", sourceKind: "general" }} />);

  expect(document.querySelectorAll("select")).toHaveLength(0);

  for (const name of ["desiredZone", "useType", "dogSize", "dogCount", "timeSlot"]) {
    const field = document.querySelector(`input[name="${name}"]`);
    expect(field, `campo ausente: ${name}`).not.toBeNull();
    expect(field, `campo obrigatório sem valor inicial: ${name}`).not.toHaveValue("");
  }
});

test("o rascunho enviado nunca inclui dados de contato", async () => {
  const enviados: string[] = [];
  vi.stubGlobal("fetch", vi.fn(async (url: string, init: RequestInit) => {
    if (String(url).includes("/api/drafts")) enviados.push(String(init.body));
    return { ok: true, json: async () => ({}) } as unknown as Response;
  }));

  render(<InterestForm context={{ desiredZone: "Sul", desiredNeighborhood: "Moema", requestKind: "reservation_request", sourceKind: "general" }} />);

  await userEvent.type(screen.getByLabelText(/seu nome/i), "Ana");
  await userEvent.type(screen.getByLabelText(/seu e-mail/i), "ana@example.com");
  await userEvent.click(document.body);

  await new Promise((resolve) => setTimeout(resolve, 900));

  // Sem isto o teste passaria mesmo que nenhum rascunho fosse enviado.
  expect(enviados.length).toBeGreaterThan(0);
  expect(enviados[0]).toContain("desiredNeighborhood");

  for (const corpo of enviados) {
    expect(corpo).not.toContain("ana@example.com");
    expect(corpo).not.toContain("Ana");
  }
  vi.unstubAllGlobals();
});
