import { render, screen } from "@testing-library/react";
import { getSpaceBySlug } from "@/lib/domain/catalog";
import { EMPTY_FILTERS } from "@/lib/domain/filters";
import { SpaceResults } from "./space-results";

const space = getSpaceBySlug("quintal-da-praca")!;

test("mostra apenas um resumo de localização no card", () => {
  render(<SpaceResults spaces={[space]} filters={EMPTY_FILTERS} />);

  expect(screen.getAllByText(/Oeste/)).toHaveLength(1);
});

test("o card não exibe selo de catálogo em validação", () => {
  render(<SpaceResults spaces={[space]} filters={EMPTY_FILTERS} />);

  expect(screen.queryByText(/ilustrativ/i)).not.toBeInTheDocument();
});

test("o card informa tipo de espaço e períodos que recebe", () => {
  render(<SpaceResults spaces={[space]} filters={EMPTY_FILTERS} />);

  expect(screen.getByText("Quintal")).toBeInTheDocument();
  expect(screen.getByText(/Manhã · Tarde · Noite/)).toBeInTheDocument();
});
