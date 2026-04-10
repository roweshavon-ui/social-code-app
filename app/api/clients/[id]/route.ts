import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/app/lib/supabase";
import { encryptFields, decryptFields } from "@/app/lib/encrypt";

const CLIENT_ENCRYPTED_FIELDS = ["name", "email", "jungian_type", "goal", "notes", "observations", "social_patterns"] as const;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await getSupabase()
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(decryptFields(data, CLIENT_ENCRYPTED_FIELDS));
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { name, email, jungianType, goal, status, notes, observations, socialPatterns, pipelineStage } = body;

  const raw = {
    name,
    email: email?.trim().toLowerCase() ?? email,
    jungian_type: jungianType,
    goal,
    status,
    notes,
    observations,
    social_patterns: socialPatterns,
    pipeline_stage: pipelineStage,
  };

  const { data, error } = await getSupabase()
    .from("clients")
    .update(encryptFields(raw, CLIENT_ENCRYPTED_FIELDS))
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(decryptFields(data, CLIENT_ENCRYPTED_FIELDS));
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { error } = await getSupabase().from("clients").update(body).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { error } = await getSupabase().from("clients").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
