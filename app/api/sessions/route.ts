import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/app/lib/supabase";
import { encryptFields, decryptAll } from "@/app/lib/encrypt";

const SESSION_ENCRYPTED_FIELDS = [
  "client_name",
  "notes",
  "action_items",
  "homework_assigned",
  "breakthrough_moment",
  "coach_observations",
  "plan",
] as const;

export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get("clientId");

  let query = getSupabase().from("sessions").select("*").order("date", { ascending: false });

  if (clientId) {
    query = query.eq("client_id", clientId);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(decryptAll(data ?? [], SESSION_ENCRYPTED_FIELDS));
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

  const raw = {
    client_id: clientId ?? null,
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
  };

  const { data, error } = await getSupabase()
    .from("sessions")
    .insert(encryptFields(raw, SESSION_ENCRYPTED_FIELDS))
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
