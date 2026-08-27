import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "../../..");

const schemaSql = readdirSync(path.join(root, "supabase/migrations"))
  .filter((file) => file.endsWith(".sql"))
  .sort()
  .map((file) => readFileSync(path.join(root, "supabase/migrations", file), "utf8"))
  .join("\n");

/** Identificadores presentes no SQL, para comparar colunas como palavras inteiras. */
const identifiersIn = (sql: string) => new Set(sql.toLowerCase().split(/[^a-z0-9_]+/));

const schemaIdentifiers = identifiersIn(schemaSql);

const insertedColumns = (() => {
  const source = readFileSync(path.join(root, "src/app/api/interests/route.ts"), "utf8");
  const insertBlock = source.slice(source.indexOf(".insert({"), source.indexOf("}).select("));
  return [...insertBlock.matchAll(/([a-z][a-z0-9_]*):\s/g)].map((match) => match[1]);
})();

test("a migração declara todas as colunas gravadas pela API de solicitações", () => {
  expect(insertedColumns).toContain("request_kind");
  expect(insertedColumns).toContain("contact_name");
  expect(insertedColumns).toContain("contact_phone");
  expect(insertedColumns).toContain("time_slot");

  for (const column of insertedColumns) {
    expect(schemaIdentifiers, `coluna ausente na migração: ${column}`).toContain(column);
  }
});

test("desired_date aceita nulo para o aviso de disponibilidade", () => {
  expect(schemaSql).toContain("alter column desired_date drop not null");
});

test("uma solicitação de reserva exige data e período no banco", () => {
  expect(schemaSql).toContain("interest_leads_reservation_requires_schedule");
});

test("demand_overview expõe contato, origem, necessidade e status da solicitação", () => {
  const view = schemaSql.slice(schemaSql.lastIndexOf("create or replace view public.demand_overview"));
  const viewIdentifiers = identifiersIn(view);

  for (const column of [
    "status",
    "request_kind",
    "contact_name",
    "contact_email",
    "contact_phone",
    "space_slug",
    "source_kind",
    "home_neighborhood",
    "desired_neighborhood",
    "desired_zone",
    "use_type",
    "dog_size",
    "dog_count",
    "desired_date",
    "time_slot",
  ]) {
    expect(viewIdentifiers, `coluna ausente em demand_overview: ${column}`).toContain(column);
  }
});
