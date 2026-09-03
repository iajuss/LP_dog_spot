import React from "react";
import { render, screen } from "@testing-library/react";
import HomePage from "./page";

test("a home abre pela pergunta da estadia, com hospedagem e pernoite na frente", () => {
  render(<HomePage />);

  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/hospedagem e pernoite/i);
  expect(screen.getByRole("group", { name: /onde seu cão vai ficar/i })).toBeInTheDocument();

  const intents = screen
    .getAllByRole("button")
    .filter((option) => option.hasAttribute("aria-pressed"))
    .map((option) => option.textContent);
  expect(intents).toEqual([
    expect.stringContaining("Hospedagem"),
    expect.stringContaining("Pernoite"),
    expect.stringContaining("Lazer"),
  ]);
});

test("as ocasiões começam pelas estadias e cada uma leva para a busca filtrada", () => {
  render(<HomePage />);

  const occasions = screen
    .getAllByRole("link")
    .map((link) => link.getAttribute("href"))
    .filter((href): href is string => Boolean(href?.startsWith("/espacos?uso=")));

  expect(occasions[0]).toBe("/espacos?uso=hospedagem");
  expect(occasions[1]).toBe("/espacos?uso=pernoite");
  expect(occasions).toContain("/espacos?uso=brincadeira");
});

test("a home reúne carrossel, destaques e dúvidas sem linguagem interna", () => {
  render(<HomePage />);

  expect(screen.getAllByRole("img").length).toBeGreaterThan(0);
  expect(screen.getByRole("heading", { name: /casas para estadia/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /perguntas frequentes/i })).toBeInTheDocument();
  expect(screen.queryByText(/validação|acesso antecipado|ilustrativo/i)).not.toBeInTheDocument();
});

test("a marca aparece como link para a home", () => {
  render(<HomePage />);

  expect(screen.getAllByRole("link", { name: /pátio livre/i }).length).toBeGreaterThan(0);
});

test("o rodapé leva às informações de privacidade", () => {
  render(<HomePage />);

  expect(screen.getByRole("link", { name: "Privacidade" })).toHaveAttribute("href", "/privacidade");
});
