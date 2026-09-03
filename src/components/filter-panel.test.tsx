import { fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import { FilterPanel } from "./filter-panel";

afterEach(() => {
  vi.unstubAllGlobals();
});

test("aplicar filtros registra os critérios escolhidos no evento de funil", async () => {
  const fetchSpy = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response(null, { status: 204 }));
  vi.stubGlobal("fetch", fetchSpy);

  render(
    <FilterPanel
      filters={{
        query: "",
        zone: "Sul",
        useType: "hospedagem",
        dogSize: "medio",
        dogCount: 2,
        timeSlot: "noite",
        neighborhood: "Pinheiros",
        stayIntent: "hospedagem",
      }}
    />,
  );
  fireEvent.submit(document.querySelector("form") as HTMLFormElement);

  await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
  const body = JSON.parse(String(fetchSpy.mock.calls[0][1]?.body));

  expect(body).toMatchObject({
    eventName: "filters_changed",
    context: {
      zone: "Sul",
      useType: "hospedagem",
      dogSize: "medio",
      dogCount: 2,
      timeSlot: "noite",
      neighborhood: "Pinheiros",
      stayIntent: "hospedagem",
    },
  });
});

test("aplicar filtros preserva a intenção ampla de lazer no evento", async () => {
  const fetchSpy = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response(null, { status: 204 }));
  vi.stubGlobal("fetch", fetchSpy);

  render(<FilterPanel filters={{ query: "", stayIntent: "lazer" }} />);
  fireEvent.submit(document.querySelector("form") as HTMLFormElement);

  await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
  const body = JSON.parse(String(fetchSpy.mock.calls[0][1]?.body));

  expect(body).toMatchObject({
    eventName: "filters_changed",
    context: { stayIntent: "lazer" },
  });
});
