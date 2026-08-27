import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url); const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next")?.startsWith("/") ? requestUrl.searchParams.get("next")! : "/confirmar";
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const response = NextResponse.redirect(new URL(next, requestUrl.origin));
  if (!url || !key || !code) return response;
  const supabase = createServerClient(url, key, { cookies: { getAll: () => request.headers.get("cookie")?.split("; ").map((item) => { const [name, ...value] = item.split("="); return { name, value: value.join("=") }; }) ?? [], setAll: (cookies) => cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options)) } });
  await supabase.auth.exchangeCodeForSession(code);
  return response;
}
