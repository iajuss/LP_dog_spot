import { render, screen } from "@testing-library/react";
import SpaceDetailPage from "./page";

test("detalhe permite solicitar uma reserva e receber alertas", async () => {
  render(await SpaceDetailPage({ params: Promise.resolve({ slug: "quintal-da-praca" }) }));

  expect(screen.getByRole("link", { name: /reservar este espaço/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /quero ser avisado/i })).toBeInTheDocument();
});

test("as duas ações levam a fluxos diferentes", async () => {
  render(await SpaceDetailPage({ params: Promise.resolve({ slug: "quintal-da-praca" }) }));

  const reserve = screen.getByRole("link", { name: /reservar este espaço/i });
  const alert = screen.getByRole("link", { name: /quero ser avisado/i });

  expect(reserve).toHaveAttribute("href", expect.stringContaining("kind=reservation_request"));
  expect(alert).toHaveAttribute("href", expect.stringContaining("kind=availability_alert"));
  expect(reserve.getAttribute("href")).not.toBe(alert.getAttribute("href"));
});

test("cada ação explica o que acontece depois", async () => {
  render(await SpaceDetailPage({ params: Promise.resolve({ slug: "quintal-da-praca" }) }));

  expect(screen.getByText(/escolha a data e o período/i)).toBeInTheDocument();
  expect(screen.getByText(/ainda não tem uma data/i)).toBeInTheDocument();
});

test("mostra o tipo de espaço e os períodos que ele recebe", async () => {
  render(await SpaceDetailPage({ params: Promise.resolve({ slug: "quintal-da-praca" }) }));

  expect(screen.getByText("Quintal")).toBeInTheDocument();
  expect(screen.getByText("Períodos que recebe")).toBeInTheDocument();
  expect(screen.getByText("Manhã")).toBeInTheDocument();
});
