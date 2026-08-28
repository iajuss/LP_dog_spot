import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LocationSearch } from "./location-search";

const field = () => screen.getByRole("combobox", { name: /bairro ou zona/i });
const submitted = () => document.querySelector('form input[type="hidden"]') as HTMLInputElement;

beforeEach(() => {
  render(<LocationSearch />);
});

test("oferece zonas e bairros na mesma lista", async () => {
  const user = userEvent.setup();
  await user.click(field());

  const options = screen.getAllByRole("option").map((option) => option.textContent);

  expect(options).toContain("Zona Sul");
  expect(options).toContain("Pinheiros");
});

test("digitar encontra a opção sem depender de acento", async () => {
  const user = userEvent.setup();

  await user.type(field(), "jacana");

  expect(screen.getByRole("option", { name: "Jaçanã" })).toBeInTheDocument();
});

test("escolher um bairro busca por bairro", async () => {
  const user = userEvent.setup();
  await user.click(field());
  await user.click(screen.getByRole("option", { name: "Pinheiros" }));

  expect(submitted().name).toBe("bairro");
  expect(submitted().value).toBe("Pinheiros");
});

test("escolher uma zona busca por zona", async () => {
  const user = userEvent.setup();
  await user.click(field());
  await user.click(screen.getByRole("option", { name: "Zona Sul" }));

  expect(submitted().name).toBe("zona");
  expect(submitted().value).toBe("Sul");
});

test("o formulário leva para o catálogo", () => {
  expect(document.querySelector("form")).toHaveAttribute("action", "/espacos");
  expect(screen.getByRole("button", { name: /explorar/i })).toBeInTheDocument();
});
