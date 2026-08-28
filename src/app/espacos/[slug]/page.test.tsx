import { render, screen } from "@testing-library/react";
import SpaceDetailPage from "./page";

test("detalhe direciona somente para a solicitação de reserva", async () => {
  render(await SpaceDetailPage({ params: Promise.resolve({ slug: "quintal-da-praca" }) }));

  expect(screen.getByRole("link", { name: /reservar este espaço/i })).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: /quero ser avisado/i })).not.toBeInTheDocument();
});

test("a reserva mantém a explicação e o fluxo de solicitação", async () => {
  render(await SpaceDetailPage({ params: Promise.resolve({ slug: "quintal-da-praca" }) }));

  const reserve = screen.getByRole("link", { name: /reservar este espaço/i });

  expect(reserve).toHaveAttribute("href", expect.stringContaining("kind=reservation_request"));
  expect(screen.getByText(/escolha a data e o período/i)).toBeInTheDocument();
});

test("mostra o tipo de espaço e os períodos que ele recebe", async () => {
  render(await SpaceDetailPage({ params: Promise.resolve({ slug: "quintal-da-praca" }) }));

  expect(screen.getByText("Quintal")).toBeInTheDocument();
  expect(screen.getByText("Períodos que recebe")).toBeInTheDocument();
  expect(screen.getByText("Manhã")).toBeInTheDocument();
});
