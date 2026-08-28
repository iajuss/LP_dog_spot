import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { FEATURED_SPACES } from "@/lib/domain/catalog";

const srcRoot = path.resolve(__dirname, "..");

/**
 * A confiança do Pátio Livre vem dos atributos reais do espaço. Perfil de
 * pessoa, nome de cuidador, nota e comentário não existem no produto — e não
 * podem entrar pela porta dos fundos numa copy nova.
 */
const FORBIDDEN_TRUST_COPY = ["anfitri", "avaliaç", "depoiment", "estrela", "★", "⭐", "perfil do", "nota média"];

function publicSourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return publicSourceFiles(full);
    if (!/\.tsx?$/.test(entry.name) || /\.test\.tsx?$/.test(entry.name)) return [];
    return [full];
  });
}

test("nenhum texto público inventa pessoas, perfis ou notas", () => {
  const offenders: string[] = [];

  for (const file of publicSourceFiles(srcRoot)) {
    const content = readFileSync(file, "utf8").toLowerCase();
    for (const term of FORBIDDEN_TRUST_COPY) {
      if (content.includes(term)) offenders.push(`${path.relative(srcRoot, file)} → "${term}"`);
    }
  }

  expect(offenders).toEqual([]);
});

test("a primeira janela e os destaques não vendem campo, parque ou chácara", () => {
  const abertos = /campo|parque|chácara|bosque|pastagem/i;

  const carousel = readFileSync(path.join(srcRoot, "components/hero-carousel.tsx"), "utf8");
  const alts = [...carousel.matchAll(/alt:\s*"([^"]+)"/g)].map((match) => match[1]);

  expect(alts.length).toBeGreaterThanOrEqual(3);
  for (const alt of alts) expect(alt, `slide com imagem de espaço aberto: ${alt}`).not.toMatch(abertos);

  for (const space of FEATURED_SPACES) {
    expect(`${space.name} ${space.imageAlt} ${space.description}`).not.toMatch(abertos);
  }
});

test("a home fala de estadia antes de lazer", () => {
  const home = readFileSync(path.join(srcRoot, "app/page.tsx"), "utf8").toLowerCase();
  const estadia = home.indexOf("hospedagem");
  const lazer = home.indexOf("lazer");

  expect(estadia, "a home não menciona hospedagem").toBeGreaterThanOrEqual(0);
  if (lazer >= 0) expect(estadia).toBeLessThan(lazer);
});
