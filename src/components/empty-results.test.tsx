import { render, screen } from "@testing-library/react";
import { EMPTY_FILTERS } from "@/lib/domain/filters";
import { EmptyResults } from "./empty-results";

test("encaminha filtros sem resultado para o aviso de disponibilidade", () => {
  render(<EmptyResults filters={{ ...EMPTY_FILTERS, zone: "Leste", useType: "socializacao" }} />);

  const link = screen.getByRole("link", { name: /quero ser avisado/i });

  expect(link).toHaveAttribute("href", expect.stringContaining("kind=availability_alert"));
  expect(link).toHaveAttribute("href", expect.stringContaining("zona=Leste"));
  expect(link).toHaveAttribute("href", expect.stringContaining("uso=socializacao"));
});
