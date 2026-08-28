import { render, screen } from "@testing-library/react";
import { FEATURED_SPACES, SPACES } from "@/lib/domain/catalog";
import { FeaturedSpaces } from "./featured-spaces";

test("oferece atalhos diretos para espaços em destaque", () => {
  render(<FeaturedSpaces />);

  for (const space of FEATURED_SPACES) {
    expect(screen.getByRole("link", { name: new RegExp(space.name, "i") })).toHaveAttribute(
      "href",
      `/espacos/${space.slug}`,
    );
  }
});

test("os destaques cobrem zonas diferentes da cidade", () => {
  const zones = new Set(FEATURED_SPACES.map((space) => space.zone));

  expect(zones.size).toBeGreaterThanOrEqual(4);
});

test("os destaques falam de acolhimento e apontam o catálogo inteiro", () => {
  render(<FeaturedSpaces />);

  expect(screen.getByRole("heading", { name: /casas para estadia/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: new RegExp(`ver os ${SPACES.length} espaços`, "i") })).toHaveAttribute(
    "href",
    "/espacos",
  );
});
