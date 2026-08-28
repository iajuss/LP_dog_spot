import { afterEach, beforeEach } from "vitest";
import { getSupabaseAnonKey, getSupabaseServiceKey, getSupabaseUrl } from "./env";

const KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_ANON_KEY",
  "SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_SECRET_KEY",
] as const;

const original: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const key of KEYS) {
    original[key] = process.env[key];
    delete process.env[key];
  }
});

afterEach(() => {
  for (const key of KEYS) {
    if (original[key] === undefined) delete process.env[key];
    else process.env[key] = original[key];
  }
});

test("aceita os nomes clássicos do Supabase", () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://classico.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service";

  expect(getSupabaseUrl()).toBe("https://classico.supabase.co");
  expect(getSupabaseAnonKey()).toBe("anon");
  expect(getSupabaseServiceKey()).toBe("service");
});

test("aceita os nomes novos injetados pela integração com a Vercel", () => {
  process.env.SUPABASE_URL = "https://integracao.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "publishable";
  process.env.SUPABASE_SECRET_KEY = "secret";

  expect(getSupabaseUrl()).toBe("https://integracao.supabase.co");
  expect(getSupabaseAnonKey()).toBe("publishable");
  expect(getSupabaseServiceKey()).toBe("secret");
});

test("o nome clássico tem precedência quando os dois existem", () => {
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "publishable";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service";
  process.env.SUPABASE_SECRET_KEY = "secret";

  expect(getSupabaseAnonKey()).toBe("anon");
  expect(getSupabaseServiceKey()).toBe("service");
});

test("sem nenhuma variável, devolve indefinido em vez de string vazia", () => {
  expect(getSupabaseUrl()).toBeUndefined();
  expect(getSupabaseAnonKey()).toBeUndefined();
  expect(getSupabaseServiceKey()).toBeUndefined();
});

test("a chave pública nunca cai na chave secreta", () => {
  process.env.SUPABASE_SECRET_KEY = "secret";

  expect(getSupabaseAnonKey()).toBeUndefined();
});
