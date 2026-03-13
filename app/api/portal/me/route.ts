import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/app/lib/supabase";
import { getTokenFromRequest } from "@/app/lib/portalAuth";

export async function GET(req: NextRequest) {
  const payload = getTokenFromRequest(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: client, error } = await getSupabase()
    .from("clients")
    .select("id, name, email, jungian_type, goal, status, force_password_change, portal_access")
    .eq("id", payload.clientId)
    .single();

  if (error || !client) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!client.portal_access) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    id: client.id,
    name: client.name,
    email: client.email,
    jungianType: client.jungian_type,
    goal: client.goal,
    status: client.status,
    forcePasswordChange: client.force_password_change,
  });
}
