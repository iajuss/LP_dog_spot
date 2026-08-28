import { render, screen } from "@testing-library/react";
import { FaqSection } from "./faq-section";

test("apresenta perguntas frequentes com resposta", () => {
  render(<FaqSection />);

  expect(screen.getByRole("heading", { name: /perguntas frequentes/i })).toBeInTheDocument();
  expect(screen.getAllByRole("group").length).toBeGreaterThanOrEqual(4);
  expect(screen.getByText("Como funciona uma hospedagem?")).toBeInTheDocument();
});

test("explica que a equipe confirma a disponibilidade antes da visita", () => {
  render(<FaqSection />);

  expect(screen.getByText(/equipe confirma a disponibilidade/i)).toBeInTheDocument();
});

test("explica que o endereço só é combinado depois", () => {
  render(<FaqSection />);

  expect(screen.getByText("O endereço aparece antes da visita?")).toBeInTheDocument();
  expect(screen.getByText(/região aproximada no mapa/i)).toBeInTheDocument();
});

test("as dúvidas explicam como funciona uma estadia", () => {
  render(<FaqSection />);

  expect(screen.getByText(/como funciona uma hospedagem/i)).toBeInTheDocument();
  expect(screen.getByText(/pernoite e hospedagem/i)).toBeInTheDocument();
  expect(screen.queryByText(/reserva confirmada|vaga garantida/i)).not.toBeInTheDocument();
});
