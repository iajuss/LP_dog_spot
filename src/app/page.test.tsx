import React from "react";
import { render, screen } from "@testing-library/react";
import HomePage from "./page";

test("explica que o catálogo é ilustrativo e não uma reserva", () => {
  render(<HomePage />);

  expect(screen.getByText(/catálogo ilustrativo/i)).toBeInTheDocument();
  expect(screen.getByText(/não é uma reserva/i)).toBeInTheDocument();
});
