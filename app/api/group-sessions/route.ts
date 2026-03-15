import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/app/lib/supabase";

export async function GET() {
  const { data, error } = await getSupabase()
    .from("group_sessions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    title,
    date,
    duration,
    clientIds,
    clientNames,
    mode,
    framework,
    customTopic,
    sessionGoal,
    notes,
    plan,
  } = body;

  const { data, error } = await getSupabase()
    .from("group_sessions")
    .insert({
      title: title ?? "Group Session",
      date: date ?? null,
      duration: duration ?? "60",
      client_ids: clientIds ?? [],
      client_names: clientNames ?? [],
      mode: mode ?? "none",
      framework: framework ?? null,
      custom_topic: customTopic ?? null,
      session_goal: sessionGoal ?? null,
      notes: notes ?? null,
      plan: plan ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
