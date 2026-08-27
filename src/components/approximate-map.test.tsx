import { render, screen } from "@testing-library/react";
import { ApproximateMap } from "./approximate-map";

test("oferece um mapa interativo sem expor endereço", () => {
  render(<ApproximateMap areaLabel="região central" zone="Centro" />);

  expect(screen.getByText(/localização aproximada/i)).toBeInTheDocument();
  expect(screen.getByTitle(/mapa interativo/i)).toHaveAttribute("src", expect.stringContaining("openstreetmap.org"));
  expect(screen.queryByText(/Rua|Avenida|CEP/)).not.toBeInTheDocument();
});
