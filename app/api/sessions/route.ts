import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/app/lib/supabase";

export async function GET() {
  const { data, error } = await getSupabase()
    .from("sessions")
    .select("*")
    .order("date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { clientName, date, duration, notes, actionItems, rating } = body;

  if (!clientName?.trim() || !date) {
    return NextResponse.json({ error: "Client name and date are required" }, { status: 400 });
  }

  const { data, error } = await getSupabase()
    .from("sessions")
    .insert({
      client_name: clientName,
      date,
      duration: duration ?? "60",
      notes,
      action_items: actionItems,
      rating: rating ?? 5,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
