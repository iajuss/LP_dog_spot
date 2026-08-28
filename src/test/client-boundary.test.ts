import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const srcRoot = path.resolve(__dirname, "..");

/**
 * Um Server Component só pode importar componentes (ou tipos) de um módulo
 * "use client". Importar uma função comum de lá compila e passa nos testes,
 * mas quebra em tempo de execução — e só na rota que a usa. Este teste fecha
 * essa brecha, que derrubou /espacos em produção.
 */
function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    if (!/\.tsx?$/.test(entry.name) || /\.test\.tsx?$/.test(entry.name)) return [];
    return [full];
  });
}

const files = sourceFiles(srcRoot);
const isClientModule = (file: string) => /^\s*["']use client["']/.test(readFileSync(file, "utf8"));

function resolveImport(fromFile: string, specifier: string): string | undefined {
  const base = specifier.startsWith("@/")
    ? path.join(srcRoot, specifier.slice(2))
    : path.resolve(path.dirname(fromFile), specifier);

  for (const candidate of [`${base}.tsx`, `${base}.ts`, path.join(base, "index.tsx"), path.join(base, "index.ts")]) {
    if (files.includes(candidate)) return candidate;
  }
  return undefined;
}

test("nenhum Server Component importa função de um módulo cliente", () => {
  const offenders: string[] = [];

  for (const file of files.filter((candidate) => !isClientModule(candidate))) {
    const source = readFileSync(file, "utf8");

    for (const match of source.matchAll(/import\s+(type\s+)?\{([^}]+)\}\s+from\s+["']([^"']+)["']/g)) {
      const [, typeOnly, bindings, specifier] = match;
      if (typeOnly || !(specifier.startsWith(".") || specifier.startsWith("@/"))) continue;

      const target = resolveImport(file, specifier);
      if (!target || !isClientModule(target)) continue;

      for (const binding of bindings.split(",")) {
        const name = binding.trim().split(/\s+as\s+/)[0].trim();
        if (!name || name.startsWith("type ")) continue;
        // Componentes começam com maiúscula; o resto é valor comum e quebra em produção.
        if (!/^[A-Z]/.test(name)) {
          offenders.push(`${path.relative(srcRoot, file)} importa "${name}" de ${specifier} ("use client")`);
        }
      }
    }
  }

  expect(offenders).toEqual([]);
});
