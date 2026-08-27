import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HeroCarousel } from "./hero-carousel";

test("os indicadores trocam a imagem em exibição", async () => {
  const user = userEvent.setup();

  render(<HeroCarousel />);

  const dots = screen.getAllByRole("button", { name: /ver imagem/i });
  expect(dots.length).toBeGreaterThanOrEqual(3);
  expect(dots[0]).toHaveAttribute("aria-current", "true");

  await user.click(dots[2]);

  expect(dots[2]).toHaveAttribute("aria-current", "true");
  expect(dots[0]).toHaveAttribute("aria-current", "false");
});

test("cada imagem do carrossel tem descrição própria", () => {
  render(<HeroCarousel />);

  const images = screen.getAllByRole("img");
  const alts = images.map((image) => image.getAttribute("alt"));

  expect(new Set(alts).size).toBe(alts.length);
  for (const alt of alts) expect(alt).toBeTruthy();
});
