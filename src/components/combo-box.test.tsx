import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComboBox, toComboOptions } from "./combo-box";

const OPTIONS = ["Moema", "Mooca", "Pinheiros", "Santana", "São Miguel Paulista", "Jaçanã"];

function renderComboBox(value?: string) {
  render(<ComboBox label="Bairro" name="bairro" options={toComboOptions(OPTIONS)} placeholder="Todos os bairros" value={value} />);
  return screen.getByRole("combobox", { name: /bairro/i });
}

test("digitar filtra as opções disponíveis", async () => {
  const user = userEvent.setup();
  const input = renderComboBox();

  await user.click(input);
  await user.type(input, "moo");

  expect(screen.getByRole("option", { name: "Mooca" })).toBeInTheDocument();
  expect(screen.queryByRole("option", { name: "Pinheiros" })).not.toBeInTheDocument();
});

test("ignora acento e caixa ao filtrar", async () => {
  const user = userEvent.setup();
  const input = renderComboBox();

  await user.type(input, "SANTANA");
  expect(screen.getByRole("option", { name: "Santana" })).toBeInTheDocument();

  await user.clear(input);
  await user.type(input, "sao miguel");
  expect(screen.getByRole("option", { name: "São Miguel Paulista" })).toBeInTheDocument();

  await user.clear(input);
  await user.type(input, "jacana");
  expect(screen.getByRole("option", { name: "Jaçanã" })).toBeInTheDocument();
});

test("escolher uma opção preenche o campo enviado no formulário", async () => {
  const user = userEvent.setup();
  const input = renderComboBox();

  await user.click(input);
  await user.click(screen.getByRole("option", { name: "Pinheiros" }));

  expect(input).toHaveValue("Pinheiros");
  expect(document.querySelector('input[name="bairro"]')).toHaveValue("Pinheiros");
});

test("só envia bairros da lista: texto solto não vira valor", async () => {
  const user = userEvent.setup();
  const input = renderComboBox();

  await user.type(input, "Bairro Inexistente");

  expect(document.querySelector('input[name="bairro"]')).toHaveValue("");
  expect(screen.getByText(/nenhuma opção encontrada/i)).toBeInTheDocument();
});

test("navega com o teclado e seleciona com Enter", async () => {
  const user = userEvent.setup();
  const input = renderComboBox();

  await user.click(input);
  await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");

  expect(document.querySelector('input[name="bairro"]')).toHaveValue("Mooca");
});

test("parte do valor já escolhido quando existe", () => {
  const input = renderComboBox("Santana");

  expect(input).toHaveValue("Santana");
  expect(document.querySelector('input[name="bairro"]')).toHaveValue("Santana");
});

test("o bairro escolhido continua visível depois que o campo perde o foco", async () => {
  const user = userEvent.setup();
  const input = renderComboBox();

  await user.click(input);
  await user.click(screen.getByRole("option", { name: "Pinheiros" }));

  // O fechamento por blur é adiado; ele não pode apagar a escolha recém-feita.
  await new Promise((resolve) => setTimeout(resolve, 300));

  expect(input).toHaveValue("Pinheiros");
  expect(document.querySelector('input[name="bairro"]')).toHaveValue("Pinheiros");
});

test("a lista oferece a opção de voltar para todos os bairros", async () => {
  const user = userEvent.setup();
  const input = renderComboBox("Santana");

  await user.click(input);

  const limpar = screen.getByRole("option", { name: "Todos os bairros" });
  await user.click(limpar);
  await new Promise((resolve) => setTimeout(resolve, 300));

  expect(document.querySelector('input[name="bairro"]')).toHaveValue("");
  expect(input).toHaveValue("");
});
