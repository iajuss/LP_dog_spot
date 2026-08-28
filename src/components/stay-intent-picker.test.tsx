import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StayIntentPicker } from "./stay-intent-picker";

const options = () => screen.getAllByRole("button");

test("pergunta onde o cão vai ficar e oferece as três intenções", () => {
  render(<StayIntentPicker />);

  expect(screen.getByRole("group", { name: /onde seu cão vai ficar/i })).toBeInTheDocument();
  for (const label of ["Hospedagem", "Pernoite", "Lazer"]) {
    expect(screen.getByRole("button", { name: new RegExp(label, "i") })).toBeInTheDocument();
  }
});

test("nenhuma intenção vem marcada: escolher é opcional", () => {
  render(<StayIntentPicker />);

  expect(options().map((option) => option.textContent)).toEqual([
    expect.stringContaining("Hospedagem"),
    expect.stringContaining("Pernoite"),
    expect.stringContaining("Lazer"),
  ]);
  for (const option of options()) expect(option).toHaveAttribute("aria-pressed", "false");
  expect(document.querySelector('input[name="intencao"]')).toBeNull();
});

test("escolher uma intenção envia o valor no formulário", async () => {
  const user = userEvent.setup();
  render(<StayIntentPicker />);

  await user.click(screen.getByRole("button", { name: /pernoite/i }));

  expect(screen.getByRole("button", { name: /pernoite/i })).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByRole("button", { name: /hospedagem/i })).toHaveAttribute("aria-pressed", "false");
  expect(document.querySelector('input[name="intencao"]')).toHaveValue("pernoite");
});

test("clicar de novo na intenção escolhida desfaz a escolha", async () => {
  const user = userEvent.setup();
  render(<StayIntentPicker />);

  const hospedagem = screen.getByRole("button", { name: /hospedagem/i });

  await user.click(hospedagem);
  expect(hospedagem).toHaveAttribute("aria-pressed", "true");

  await user.click(hospedagem);
  expect(hospedagem).toHaveAttribute("aria-pressed", "false");
  expect(document.querySelector('input[name="intencao"]')).toBeNull();
});
