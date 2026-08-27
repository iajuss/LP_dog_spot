import { render, screen } from "@testing-library/react";
import { EMPTY_FILTERS } from "@/lib/domain/filters";
import { EmptyResults } from "./empty-results";

test("encaminha filtros sem resultado para interesse regional", () => {
  render(<EmptyResults filters={{ ...EMPTY_FILTERS, zone: "Leste", useType: "socializacao" }} />);

  expect(screen.getByRole("link", { name: /registrar interesse/i })).toHaveAttribute(
    "href",
    expect.stringContaining("zona=Leste"),
  );
});
