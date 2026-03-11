import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/app/lib/supabase";

export async function GET() {
  const { data, error } = await getSupabase()
    .from("assessments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, goal, type, scores } = body;

  if (!name?.trim() || !email?.trim() || !type) {
    return NextResponse.json({ error: "Name, email, and type are required" }, { status: 400 });
  }

  const { data, error } = await getSupabase()
    .from("assessments")
    .insert({ name, email, goal, jungian_type: type, scores })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
