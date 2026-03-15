import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/app/lib/supabase";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { title, framework, customTopic, objectives, plan, status, sessionDate, notes } = body;

  const { data, error } = await getSupabase()
    .from("cohort_sessions")
    .update({
      ...(title !== undefined && { title }),
      ...(framework !== undefined && { framework }),
      ...(customTopic !== undefined && { custom_topic: customTopic }),
      ...(objectives !== undefined && { objectives }),
      ...(plan !== undefined && { plan }),
      ...(status !== undefined && { status }),
      ...(sessionDate !== undefined && { session_date: sessionDate }),
      ...(notes !== undefined && { notes }),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await getSupabase().from("cohort_sessions").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
