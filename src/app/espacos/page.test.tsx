import { render, screen } from "@testing-library/react";
import ResultsPage from "./page";

const renderResults = async (query: Record<string, string>) =>
  render(await ResultsPage({ searchParams: Promise.resolve(query) }));

test("chegando por hospedagem, a página fala de estadia e mantém o filtro", async () => {
  await renderResults({ intencao: "hospedagem" });

  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/hospedagem/i);
  expect(screen.getAllByText(/recebe para estadia/i).length).toBeGreaterThan(0);
});

test("chegando por lazer, a página fala de usar o espaço junto", async () => {
  await renderResults({ intencao: "lazer" });

  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/junto com seu cão/i);
  expect(screen.queryByText(/recebe para estadia/i)).not.toBeInTheDocument();
});

test("o aviso de disponibilidade carrega a combinação que o tutor pediu", async () => {
  await renderResults({ intencao: "hospedagem", bairro: "Pinheiros" });

  for (const link of screen.getAllByRole("link", { name: /avisad/i })) {
    expect(link).toHaveAttribute("href", expect.stringContaining("kind=availability_alert"));
    expect(link).toHaveAttribute("href", expect.stringContaining("intencao=hospedagem"));
    expect(link).toHaveAttribute("href", expect.stringContaining("bairro=Pinheiros"));
  }
});

test("sem intenção nenhuma, a busca continua mostrando o catálogo inteiro", async () => {
  await renderResults({});

  expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  expect(screen.queryByText(/recebe para estadia/i)).not.toBeInTheDocument();
});
