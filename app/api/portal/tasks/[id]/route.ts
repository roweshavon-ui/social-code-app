import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/app/lib/supabase";
import { getTokenFromRequest } from "@/app/lib/portalAuth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = getTokenFromRequest(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { completed } = await req.json();

  // Verify the task belongs to this client before updating
  const { data: task } = await getSupabase()
    .from("tasks")
    .select("client_id")
    .eq("id", id)
    .single();

  if (!task || task.client_id !== payload.clientId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { error } = await getSupabase()
    .from("tasks")
    .update({ completed })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
