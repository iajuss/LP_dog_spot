import { render, screen } from "@testing-library/react";
import { InterestForm } from "./interest-form";

test("mantém consentimento de marketing desmarcado e explica a confirmação", () => {
  render(<InterestForm context={{ desiredZone: "Sul", desiredNeighborhood: "Moema", sourceKind: "general" }} />);
  expect(screen.getByLabelText(/aceito receber novidades/i)).not.toBeChecked();
  expect(screen.getByText(/não é uma reserva/i)).toBeInTheDocument();
});
