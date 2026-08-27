import { render, screen } from "@testing-library/react";
import { SPACES } from "@/lib/domain/catalog";
import { EMPTY_FILTERS } from "@/lib/domain/filters";
import { SpaceResults } from "./space-results";

test("mostra apenas um resumo de localização no card", () => {
  render(<SpaceResults spaces={[SPACES[0]]} filters={EMPTY_FILTERS} />);

  expect(screen.getAllByText(/Oeste/)).toHaveLength(1);
  expect(screen.getByText(/catálogo ilustrativo/i)).toBeInTheDocument();
});
