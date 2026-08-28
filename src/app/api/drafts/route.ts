import { NextResponse } from "next/server";
import { draftSchema, toDraftInput } from "@/lib/domain/draft";
import { getSupabaseServer } from "@/lib/supabase/server";

/** Salvar rascunho é acessório: nunca deve atrapalhar quem está preenchendo. */
export async function POST(request: Request) {
  const raw = await request.json().catch(() => null);
  const checked = draftSchema.safeParse(raw);
  if (!checked.success) return NextResponse.json({ saved: false }, { status: 400 });

  const service = getSupabaseServer();
  if (!service) return NextResponse.json({ saved: false }, { status: 200 });

  const input = toDraftInput(checked.data);
  const { error } = await service.from("request_drafts").upsert(
    {
      anonymous_session_id: input.anonymousSessionId,
      request_kind: input.requestKind,
      source_kind: input.sourceKind,
      space_slug: input.spaceSlug || null,
      home_neighborhood: input.homeNeighborhood || null,
      desired_neighborhood: input.desiredNeighborhood || null,
      desired_zone: input.desiredZone ?? null,
      use_type: input.useType ?? null,
      dog_size: input.dogSize ?? null,
      dog_count: input.dogCount ?? null,
      desired_date: input.desiredDate || null,
      time_slot: input.timeSlot ?? null,
      budget_cents: input.budgetCents,
      landing_path: input.landingPath || null,
      utm_source: input.utmSource || null,
      utm_medium: input.utmMedium || null,
      utm_campaign: input.utmCampaign || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "anonymous_session_id" },
  );

  return NextResponse.json({ saved: !error }, { status: 200 });
}
