import React from "react";
import { render, screen } from "@testing-library/react";
import HomePage from "./page";

test("a home reúne carrossel, destaques e dúvidas sem linguagem interna", () => {
  render(<HomePage />);

  expect(screen.getByRole("heading", { name: "Encontre o espaço ideal para o seu cão." })).toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: /próximo passeio favorito/i })).not.toBeInTheDocument();
  expect(screen.getAllByRole("img").length).toBeGreaterThan(0);
  expect(screen.getByRole("heading", { name: /espaços em destaque/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /perguntas frequentes/i })).toBeInTheDocument();
  expect(screen.queryByText(/validação|acesso antecipado|ilustrativo/i)).not.toBeInTheDocument();
});

test("a marca aparece como link para a home", () => {
  render(<HomePage />);

  expect(screen.getAllByRole("link", { name: /pátio livre/i }).length).toBeGreaterThan(0);
});
