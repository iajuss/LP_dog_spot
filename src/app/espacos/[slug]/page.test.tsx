import { render, screen } from "@testing-library/react";
import SpaceDetailPage from "./page";

test("detalhe convida a pedir acesso, não reservar", async () => {
  render(await SpaceDetailPage({ params: Promise.resolve({ slug: "quintal-da-praca" }) }));

  expect(screen.getByRole("link", { name: /quero ser avisado/i })).toBeInTheDocument();
  expect(screen.queryByText(/^reservar$/i)).not.toBeInTheDocument();
});
