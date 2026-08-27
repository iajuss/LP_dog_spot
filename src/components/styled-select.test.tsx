import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StyledSelect } from "./styled-select";

test("abre opções estilizadas e atualiza o campo do formulário", async () => {
  const user = userEvent.setup();

  render(<StyledSelect label="Zona" name="zona" options={[{ label: "Centro", value: "Centro" }, { label: "Sul", value: "Sul" }]} placeholder="Todas as zonas" />);

  await user.click(screen.getByRole("button", { name: /zona: todas as zonas/i }));
  await user.click(screen.getByRole("option", { name: "Sul" }));

  expect(screen.getByRole("button", { name: /zona: sul/i })).toBeInTheDocument();
  expect(screen.getByDisplayValue("Sul")).toHaveAttribute("name", "zona");
});

test("toda opção informa se está selecionada", async () => {
  const user = userEvent.setup();

  render(<StyledSelect label="Zona" name="zona" options={[{ label: "Centro", value: "Centro" }, { label: "Sul", value: "Sul" }]} placeholder="Todas as zonas" />);

  await user.click(screen.getByRole("button", { name: /zona: todas as zonas/i }));

  for (const option of screen.getAllByRole("option")) {
    expect(option).toHaveAttribute("aria-selected");
  }
  expect(screen.getByRole("option", { name: "Todas as zonas" })).toHaveAttribute("aria-selected", "true");
});
