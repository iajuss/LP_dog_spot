import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, vi } from "vitest";
import { LocationSearch } from "./location-search";

const field = () => screen.getByRole("combobox", { name: /bairro ou zona/i });
/** O campo escondido que a busca de local envia — o da intenção fica de fora. */
const submitted = () =>
  document.querySelector('form input[type="hidden"]:not([name="intencao"])') as HTMLInputElement;

beforeEach(() => {
  render(<LocationSearch />);
});

afterEach(() => {
  vi.unstubAllGlobals();
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
  expect(screen.getByRole("button", { name: /buscar/i })).toBeInTheDocument();
});

test("a busca da home sai com a intenção escolhida", async () => {
  const user = userEvent.setup();

  await user.click(screen.getByRole("button", { name: /pernoite/i }));
  await user.click(field());
  await user.click(screen.getByRole("option", { name: "Pinheiros" }));

  const form = document.querySelector("form") as HTMLFormElement;
  const data = new FormData(form);

  expect(data.get("intencao")).toBe("pernoite");
  expect(data.get("bairro")).toBe("Pinheiros");
  expect(form).toHaveAttribute("action", "/espacos");
});

test("dá para buscar só pela região, sem escolher intenção", async () => {
  const user = userEvent.setup();

  await user.click(field());
  await user.click(screen.getByRole("option", { name: "Pinheiros" }));

  const data = new FormData(document.querySelector("form") as HTMLFormElement);

  expect(data.get("intencao")).toBeNull();
  expect(data.get("bairro")).toBe("Pinheiros");
});

test("a busca registra os filtros escolhidos no evento de funil", async () => {
  const fetchSpy = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response(null, { status: 204 }));
  vi.stubGlobal("fetch", fetchSpy);
  const user = userEvent.setup();

  await user.click(screen.getByRole("button", { name: /pernoite/i }));
  await user.click(field());
  await user.click(screen.getByRole("option", { name: "Zona Sul" }));
  fireEvent.submit(document.querySelector("form") as HTMLFormElement);

  await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
  const body = JSON.parse(String(fetchSpy.mock.calls[0][1]?.body));

  expect(body).toMatchObject({
    eventName: "search_started",
    context: { zone: "Sul", stayIntent: "pernoite" },
  });
});
