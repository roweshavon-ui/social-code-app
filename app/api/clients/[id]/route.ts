import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/app/lib/supabase";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await getSupabase()
    .from("clients")
    .select("id, name, email, jungian_type, goal, status, portal_access, force_password_change")
    .eq("id", id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { name, email, jungianType, goal, status, notes, observations, socialPatterns, pipelineStage } = body;

  const { data, error } = await getSupabase()
    .from("clients")
    .update({
      name,
      email: email?.trim().toLowerCase() ?? email,
      jungian_type: jungianType,
      goal,
      status,
      notes,
      observations,
      social_patterns: socialPatterns,
      pipeline_stage: pipelineStage,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { error } = await getSupabase().from("clients").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
