import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/app/lib/supabase";

export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get("clientId");

  let query = getSupabase().from("sessions").select("*").order("date", { ascending: false });

  if (clientId) {
    // Match by client_id OR by client_name (for sessions saved without an ID)
    const { data: clientData } = await getSupabase()
      .from("clients")
      .select("name")
      .eq("id", clientId)
      .maybeSingle();
    if (clientData?.name) {
      query = query.or(`client_id.eq.${clientId},client_name.ilike.${clientData.name}`);
    } else {
      query = query.eq("client_id", clientId);
    }
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    clientId,
    clientName,
    date,
    duration,
    notes,
    actionItems,
    rating,
    sessionNumber,
    sessionType,
    clientEngagement,
    homeworkCompletion,
    homeworkAssigned,
    breakthroughMoment,
    coachObservations,
    frameworksUsed,
    plan,
  } = body;

  if (!clientName?.trim() || !date) {
    return NextResponse.json({ error: "Client name and date are required" }, { status: 400 });
  }

  // Auto-resolve clientId by name if not provided
  let resolvedClientId = clientId ?? null;
  if (!resolvedClientId && clientName?.trim()) {
    const { data: match } = await getSupabase()
      .from("clients")
      .select("id")
      .ilike("name", clientName.trim())
      .maybeSingle();
    if (match) resolvedClientId = match.id;
  }

  const { data, error } = await getSupabase()
    .from("sessions")
    .insert({
      client_id: resolvedClientId,
      client_name: clientName,
      date,
      duration: duration ?? "60",
      notes,
      action_items: actionItems,
      rating: rating ?? 5,
      session_number: sessionNumber ?? 1,
      session_type: sessionType ?? "ongoing",
      client_engagement: clientEngagement ?? "open",
      homework_completion: homeworkCompletion ?? "none",
      homework_assigned: homeworkAssigned ?? null,
      breakthrough_moment: breakthroughMoment ?? null,
      coach_observations: coachObservations ?? null,
      frameworks_used: frameworksUsed ?? [],
      plan: plan ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
