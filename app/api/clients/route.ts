import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/app/lib/supabase";
import { encryptFields, decryptAll } from "@/app/lib/encrypt";

const CLIENT_ENCRYPTED_FIELDS = ["name", "email", "jungian_type", "goal", "notes", "observations", "social_patterns"] as const;

export async function GET() {
  const { data, error } = await getSupabase()
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(decryptAll(data ?? [], CLIENT_ENCRYPTED_FIELDS));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, jungianType, goal, status, notes, observations, socialPatterns } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const raw = {
    name,
    email: email?.trim().toLowerCase() ?? email,
    jungian_type: jungianType,
    goal,
    status: status ?? "active",
    notes,
    observations,
    social_patterns: socialPatterns,
  };

  const { data, error } = await getSupabase()
    .from("clients")
    .insert(encryptFields(raw, CLIENT_ENCRYPTED_FIELDS))
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
