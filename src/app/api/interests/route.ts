import { NextResponse } from "next/server";
import { interestSchema, toInterestInput } from "@/lib/domain/interest";
import { getSupabasePublic, getSupabaseServer } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const raw = await request.json();
  const checked = interestSchema.safeParse(raw);
  if (!checked.success) return NextResponse.json({ error: "Revise os campos obrigatórios." }, { status: 400 });
  const service = getSupabaseServer(); const auth = getSupabasePublic();
  if (!service || !auth) return NextResponse.json({ error: "A captação por e-mail ainda não foi configurada." }, { status: 503 });
  const input = toInterestInput(checked.data);
  const { data: lead, error } = await service.from("interest_leads").insert({
    contact_email: input.email, home_neighborhood: input.homeNeighborhood, desired_neighborhood: input.desiredNeighborhood,
    desired_zone: input.desiredZone, use_type: input.useType, dog_size: input.dogSize, dog_count: input.dogCount,
    desired_date: input.desiredDate, budget_cents: input.budgetCents, marketing_consent: input.marketingConsent,
    space_slug: input.spaceSlug, source_kind: input.sourceKind, utm_source: input.utmSource, utm_medium: input.utmMedium,
    utm_campaign: input.utmCampaign, landing_path: input.landingPath, anonymous_session_id: input.anonymousSessionId,
  }).select("id").single();
  if (error || !lead) return NextResponse.json({ error: "Não foi possível registrar seu interesse agora." }, { status: 500 });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  const next = encodeURIComponent(`/confirmar?interest=${lead.id}`);
  const { error: otpError } = await auth.auth.signInWithOtp({ email: input.email, options: { emailRedirectTo: `${appUrl}/auth/callback?next=${next}` } });
  if (otpError) return NextResponse.json({ error: "Não foi possível enviar o link de confirmação." }, { status: 502 });
  return NextResponse.json({ id: lead.id }, { status: 201 });
}
