import { render, screen } from "@testing-library/react";
import { ApproximateMap } from "./approximate-map";

test("explica que o mapa não revela endereço", () => {
  render(<ApproximateMap areaLabel="região central" zone="Centro" />);

  expect(screen.getByText(/localização aproximada/i)).toBeInTheDocument();
  expect(screen.queryByText(/Rua|Avenida|CEP/)).not.toBeInTheDocument();
});
