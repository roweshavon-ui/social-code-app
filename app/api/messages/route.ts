import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/app/lib/supabase";
import { sendClientMessage } from "@/app/lib/email";

export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get("clientId");

  if (!clientId) {
    return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  }

  const { data, error } = await getSupabase()
    .from("messages")
    .select("*")
    .eq("client_id", clientId)
    .order("sent_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { clientId, subject, body: messageBody } = body;

  if (!clientId || !subject?.trim() || !messageBody?.trim()) {
    return NextResponse.json(
      { error: "clientId, subject, and body are required" },
      { status: 400 }
    );
  }

  // Look up client email
  const { data: client, error: clientError } = await getSupabase()
    .from("clients")
    .select("email, name")
    .eq("id", clientId)
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  // Save to DB first — never lose the record
  const { data, error } = await getSupabase()
    .from("messages")
    .insert({ client_id: clientId, subject, body: messageBody })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send email (non-blocking)
  let emailWarning: string | null = null;
  try {
    await sendClientMessage(client.email, subject, messageBody, client.name);
  } catch (e) {
    console.error("Client message email failed:", e);
    emailWarning = "Message saved but email delivery failed.";
  }

  return NextResponse.json(
    emailWarning ? { ...data, warning: emailWarning } : data,
    { status: 201 }
  );
}
