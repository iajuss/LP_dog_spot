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
