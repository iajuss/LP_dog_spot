import { render, screen } from "@testing-library/react";
import { getSpaceBySlug, type Space } from "@/lib/domain/catalog";
import { SpaceCard } from "./space-card";

const stay = getSpaceBySlug("casa-do-tremembe") as Space;
const leisure = getSpaceBySlug("campo-do-sol") as Space;

test("na intenção de hospedagem o card fala de acolhimento", () => {
  render(<SpaceCard intent="hospedagem" space={stay} />);

  expect(screen.getByText(/recebe para estadia/i)).toBeInTheDocument();
  expect(screen.getByText(stay.stayNote as string)).toBeInTheDocument();
  // O card mostra os três primeiros sinais; a lista completa fica no detalhe.
  expect(screen.getByText("Jardim cercado")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: new RegExp(stay.name, "i") })).toHaveAttribute(
    "href",
    `/espacos/${stay.slug}?uso=hospedagem`,
  );
});

test("na intenção de lazer o card mantém o foco em usar o espaço", () => {
  render(<SpaceCard intent="lazer" space={leisure} />);

  expect(screen.queryByText(/recebe para estadia/i)).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: new RegExp(leisure.name, "i") })).toHaveAttribute(
    "href",
    `/espacos/${leisure.slug}`,
  );
});

test("espaço sem metadado de estadia continua renderizando o card inteiro", () => {
  const semMetadados: Space = { ...stay, stayFeatures: undefined, stayNote: undefined };

  render(<SpaceCard intent="hospedagem" space={semMetadados} />);

  expect(screen.getByRole("heading", { name: semMetadados.name })).toBeInTheDocument();
  expect(screen.getByText(new RegExp(`até ${semMetadados.maxDogs}`, "i"))).toBeInTheDocument();
  expect(screen.getByText("Área cercada")).toBeInTheDocument();
});

test("sem intenção o card não inventa contexto de estadia", () => {
  render(<SpaceCard space={leisure} />);

  expect(screen.getByRole("heading", { name: leisure.name })).toBeInTheDocument();
  expect(screen.queryByText(/recebe para estadia/i)).not.toBeInTheDocument();
});
