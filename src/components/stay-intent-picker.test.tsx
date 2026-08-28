import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StayIntentPicker } from "./stay-intent-picker";

test("pergunta onde o cão vai ficar e oferece as três intenções", () => {
  render(<StayIntentPicker />);

  expect(screen.getByRole("group", { name: /onde seu cão vai ficar/i })).toBeInTheDocument();
  for (const label of ["Hospedagem", "Pernoite", "Lazer"]) {
    expect(screen.getByRole("radio", { name: new RegExp(label, "i") })).toBeInTheDocument();
  }
});

test("hospedagem vem marcada e as estadias aparecem antes de lazer", () => {
  render(<StayIntentPicker />);

  const radios = screen.getAllByRole("radio") as HTMLInputElement[];

  expect(radios.map((radio) => radio.value)).toEqual(["hospedagem", "pernoite", "lazer"]);
  expect(radios[0]).toBeChecked();
  for (const radio of radios) expect(radio).toHaveAttribute("name", "intencao");
});

test("trocar a intenção marca só a escolhida", async () => {
  const user = userEvent.setup();
  render(<StayIntentPicker />);

  await user.click(screen.getByRole("radio", { name: /pernoite/i }));

  expect(screen.getByRole("radio", { name: /pernoite/i })).toBeChecked();
  expect(screen.getByRole("radio", { name: /hospedagem/i })).not.toBeChecked();
});
