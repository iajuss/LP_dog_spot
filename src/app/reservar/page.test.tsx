import { render, screen } from "@testing-library/react";
import { getSpaceBySlug } from "@/lib/domain/catalog";
import ReservationPage from "./page";

const space = getSpaceBySlug("quintal-da-praca")!;

/** Os mesmos parâmetros que o botão "Reservar este espaço" monta na página do espaço. */
const paramsFromSpace = {
  kind: "reservation_request",
  space: space.slug,
  zona: space.zone,
  bairro: space.neighborhood,
  uso: space.allowedUses[0],
  periodo: space.availableSlots[0],
};

test("a solicitação já chega com zona e bairro do espaço preenchidos", async () => {
  render(await ReservationPage({ searchParams: Promise.resolve(paramsFromSpace) }));

  expect(document.querySelector('input[name="desiredNeighborhood"]')).toHaveValue("Pinheiros");
  expect(screen.getByRole("combobox", { name: /bairro onde gostaria de usar/i })).toHaveValue("Pinheiros");
  expect(document.querySelector('input[name="desiredZone"]')).toHaveValue("Oeste");
  expect(screen.getByRole("button", { name: /zona desejada: oeste/i })).toBeInTheDocument();
});

test("também traz o uso e o período sugeridos pelo espaço", async () => {
  render(await ReservationPage({ searchParams: Promise.resolve(paramsFromSpace) }));

  expect(document.querySelector('input[name="useType"]')).toHaveValue(space.allowedUses[0]);
  expect(document.querySelector('input[name="timeSlot"]')).toHaveValue(space.availableSlots[0]);
});

test("mostra para qual espaço é a solicitação", async () => {
  render(await ReservationPage({ searchParams: Promise.resolve(paramsFromSpace) }));

  expect(screen.getByText(new RegExp(space.name, "i"))).toBeInTheDocument();
});

test("sem espaço de origem, o formulário vem vazio", async () => {
  render(await ReservationPage({ searchParams: Promise.resolve({ kind: "availability_alert" }) }));

  expect(document.querySelector('input[name="desiredNeighborhood"]')).toHaveValue("");
});

test("ignora parâmetros fora das listas conhecidas", async () => {
  render(
    await ReservationPage({
      searchParams: Promise.resolve({ kind: "reservation_request", zona: "Narnia", bairro: "Nárnia", uso: "voar" }),
    }),
  );

  expect(document.querySelector('input[name="desiredNeighborhood"]')).toHaveValue("");
});
