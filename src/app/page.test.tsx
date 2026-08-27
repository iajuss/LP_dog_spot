import React from "react";
import { render, screen } from "@testing-library/react";
import HomePage from "./page";

test("mostra uma imagem e não expõe linguagem interna", () => {
  render(<HomePage />);

  expect(screen.getByRole("img", { name: /cão/i })).toBeInTheDocument();
  expect(screen.queryByText(/validação|acesso antecipado|ilustrativo/i)).not.toBeInTheDocument();
});
