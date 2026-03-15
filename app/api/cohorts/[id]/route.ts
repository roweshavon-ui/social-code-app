import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/app/lib/supabase";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [cohortRes, sessionsRes] = await Promise.all([
    getSupabase().from("cohorts").select("*").eq("id", id).single(),
    getSupabase()
      .from("cohort_sessions")
      .select("*")
      .eq("cohort_id", id)
      .order("session_number", { ascending: true }),
  ]);

  if (cohortRes.error) {
    return NextResponse.json({ error: cohortRes.error.message }, { status: 404 });
  }

  return NextResponse.json({
    cohort: cohortRes.data,
    sessions: sessionsRes.data ?? [],
  });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { name, description, startDate, totalSessions, status } = body;

  const { data, error } = await getSupabase()
    .from("cohorts")
    .update({
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(startDate !== undefined && { start_date: startDate }),
      ...(totalSessions !== undefined && { total_sessions: totalSessions }),
      ...(status !== undefined && { status }),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await getSupabase().from("cohorts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
