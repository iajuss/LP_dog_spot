import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const srcRoot = path.resolve(__dirname, "..");

/** Linguagem de fase de validação que não deve aparecer no produto. */
const FORBIDDEN_COPY = [
  "validação",
  "em validação",
  "acesso antecipado",
  "ilustrativ",
  "imaginad",
  "conceitual",
  "novidades",
  "não é uma reserva",
  "não é reserva",
  "pedir acesso",
  "manifeste interesse",
  "demanda",
];

function publicSourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return publicSourceFiles(full);
    if (!/\.tsx?$/.test(entry.name)) return [];
    if (/\.test\.tsx?$/.test(entry.name)) return [];
    return [full];
  });
}

test("nenhum texto público usa linguagem de validação", () => {
  const offenders: string[] = [];

  for (const file of publicSourceFiles(srcRoot)) {
    const content = readFileSync(file, "utf8").toLowerCase();
    for (const term of FORBIDDEN_COPY) {
      if (content.includes(term)) offenders.push(`${path.relative(srcRoot, file)} → "${term}"`);
    }
  }

  expect(offenders).toEqual([]);
});

test("o produto nunca promete disponibilidade já confirmada", () => {
  const offenders: string[] = [];

  for (const file of publicSourceFiles(srcRoot)) {
    const content = readFileSync(file, "utf8").toLowerCase();
    for (const term of ["reserva confirmada", "reserva garantida", "disponibilidade confirmada", "vaga garantida"]) {
      if (content.includes(term)) offenders.push(`${path.relative(srcRoot, file)} → "${term}"`);
    }
  }

  expect(offenders).toEqual([]);
});
