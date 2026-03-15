import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/app/lib/supabase";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await getSupabase().from("sessions").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const {
    date,
    duration,
    sessionNumber,
    sessionType,
    notes,
    actionItems,
    rating,
    clientEngagement,
    homeworkCompletion,
    homeworkAssigned,
    breakthroughMoment,
    coachObservations,
    frameworksUsed,
  } = body;

  const { data, error } = await getSupabase()
    .from("sessions")
    .update({
      ...(date !== undefined && { date }),
      ...(duration !== undefined && { duration }),
      ...(sessionNumber !== undefined && { session_number: sessionNumber }),
      ...(sessionType !== undefined && { session_type: sessionType }),
      notes,
      action_items: actionItems,
      rating,
      client_engagement: clientEngagement,
      homework_completion: homeworkCompletion,
      homework_assigned: homeworkAssigned,
      breakthrough_moment: breakthroughMoment,
      coach_observations: coachObservations,
      frameworks_used: frameworksUsed,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
