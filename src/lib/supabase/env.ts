/**
 * O Supabase renomeou as chaves de API: `anon` virou `publishable` e
 * `service_role` virou `secret`. A integração do Vercel injeta os nomes novos,
 * enquanto `.env.local` e projetos antigos usam os clássicos. Lemos os dois.
 *
 * Cada `process.env.X` precisa ser escrito literalmente: o Next substitui as
 * variáveis `NEXT_PUBLIC_` no build por análise estática, e um acesso dinâmico
 * como `process.env[nome]` não seria substituído.
 */

export function getSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || undefined;
}

/** Chave exposta ao navegador. Nunca deve cair na chave secreta. */
export function getSupabaseAnonKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    undefined
  );
}

/** Chave de serviço: exclusiva do servidor, nunca prefixada com NEXT_PUBLIC_. */
export function getSupabaseServiceKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || undefined;
}
