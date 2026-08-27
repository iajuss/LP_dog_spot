import { render, screen } from "@testing-library/react";
import { BrandLogo } from "./brand-logo";

test("a marca aparece como um único link com nome acessível", () => {
  render(<BrandLogo />);

  const link = screen.getByRole("link", { name: /pátio livre/i });

  expect(link).toHaveAttribute("href", "/");
  expect(link).toHaveTextContent("Pátio Livre");
});

test("o símbolo da marca é decorativo e não duplica o nome", () => {
  const { container } = render(<BrandLogo />);
  const svg = container.querySelector("svg");

  expect(svg).not.toBeNull();
  expect(svg).toHaveAttribute("aria-hidden", "true");
});
