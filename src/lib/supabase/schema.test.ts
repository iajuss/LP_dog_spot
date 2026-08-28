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

/** A definição vigente da view é sempre a última do conjunto de migrações. */
const currentDemandOverview = () =>
  schemaSql.slice(schemaSql.lastIndexOf("create or replace view public.demand_overview"));

test("demand_overview lista solicitações pendentes junto das confirmadas", () => {
  expect(currentDemandOverview()).not.toContain("where status = 'confirmed'");
});

test("demand_overview continua restrita ao service_role", () => {
  const view = currentDemandOverview();

  expect(view).toContain("revoke all on public.demand_overview from anon, authenticated");
  expect(view).toContain("grant select on public.demand_overview to service_role");
});

test("demand_overview expõe contato, origem, necessidade e status da solicitação", () => {
  const view = currentDemandOverview();
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

test("rascunhos ficam em tabela própria, sem nenhum dado de contato", () => {
  const drafts = schemaSql.slice(schemaSql.indexOf("create table public.request_drafts"));
  const definition = drafts.slice(0, drafts.indexOf(");"));

  expect(definition).toContain("anonymous_session_id");
  expect(definition).toContain("desired_zone");

  for (const forbidden of ["contact_name", "contact_email", "contact_phone"]) {
    expect(definition, `rascunho não pode guardar ${forbidden}`).not.toContain(forbidden);
  }
});

test("a view de desistências ignora quem chegou a enviar o pedido", () => {
  const view = schemaSql.slice(schemaSql.lastIndexOf("create or replace view public.abandoned_requests"));

  expect(view).toContain("not exists");
  expect(view).toContain("interest_leads");
  expect(view).toContain("revoke all on public.abandoned_requests from anon, authenticated");
});
