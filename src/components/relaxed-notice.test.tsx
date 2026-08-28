import { render, screen } from "@testing-library/react";
import { EMPTY_FILTERS } from "@/lib/domain/filters";
import { RelaxedNotice } from "./relaxed-notice";

const filters = { ...EMPTY_FILTERS, zone: "Sul" as const, useType: "hospedagem" as const };

test("não aparece quando a busca bateu exatamente", () => {
  const { container } = render(<RelaxedNotice filters={filters} relaxed={[]} />);

  expect(container).toBeEmptyDOMElement();
});

test("diz o que foi ignorado para haver resultado", () => {
  render(<RelaxedNotice filters={filters} relaxed={["o bairro", "o período"]} />);

  expect(screen.getByRole("status")).toHaveTextContent(/o bairro e o período/i);
});

test("mantém a ocasião no aviso de disponibilidade, para registrar o pedido original", () => {
  render(<RelaxedNotice filters={filters} relaxed={["o bairro"]} />);

  const link = screen.getByRole("link", { name: /avisado/i });

  expect(link).toHaveAttribute("href", expect.stringContaining("kind=availability_alert"));
  expect(link).toHaveAttribute("href", expect.stringContaining("uso=hospedagem"));
  expect(link).toHaveAttribute("href", expect.stringContaining("zona=Sul"));
});
