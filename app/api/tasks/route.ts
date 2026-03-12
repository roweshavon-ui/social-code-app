import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/app/lib/supabase";

export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get("clientId");
  const today = req.nextUrl.searchParams.get("today");

  let query = getSupabase()
    .from("tasks")
    .select("*")
    .order("due_date", { ascending: true, nullsFirst: false });

  if (clientId) {
    query = query.eq("client_id", clientId);
  }

  if (today) {
    const todayDate = new Date().toISOString().split("T")[0];
    query = query.lte("due_date", todayDate).eq("completed", false);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { clientId, title, dueDate } = body;

  if (!clientId || !title?.trim()) {
    return NextResponse.json({ error: "clientId and title are required" }, { status: 400 });
  }

  const { data, error } = await getSupabase()
    .from("tasks")
    .insert({ client_id: clientId, title, due_date: dueDate ?? null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
