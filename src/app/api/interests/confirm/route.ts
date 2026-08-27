import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { interest } = await request.json(); const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; const service = getSupabaseServer();
  if (!url || !key || !service) return NextResponse.json({ error: "A confirmação por e-mail ainda não foi configurada." }, { status: 503 });
  const supabase = createServerClient(url, key, { cookies: { getAll: () => request.headers.get("cookie")?.split("; ").map((item) => { const [name, ...value] = item.split("="); return { name, value: value.join("=") }; }) ?? [], setAll: () => {} } });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email || typeof interest !== "string") return NextResponse.json({ error: "Este link não pôde ser confirmado. Peça um novo link." }, { status: 403 });
  const { data, error } = await service.from("interest_leads").update({ status: "confirmed", user_id: user.id, confirmed_at: new Date().toISOString() }).eq("id", interest).eq("contact_email", user.email).select("id, request_kind").maybeSingle();
  if (error || !data) return NextResponse.json({ error: "Este link não corresponde a uma solicitação pendente." }, { status: 403 });
  return NextResponse.json({ confirmed: true, requestKind: data.request_kind });
}
