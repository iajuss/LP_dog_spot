import { render, screen } from "@testing-library/react";
import SpaceDetailPage from "./page";

test("detalhe permite solicitar uma reserva e receber alertas", async () => {
  render(await SpaceDetailPage({ params: Promise.resolve({ slug: "quintal-da-praca" }) }));

  expect(screen.getByRole("link", { name: /reservar este espaço/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /quero ser avisado/i })).toBeInTheDocument();
});
