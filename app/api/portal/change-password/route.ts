import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/app/lib/supabase";
import { getTokenFromRequest, hashPassword, verifyPassword } from "@/app/lib/portalAuth";

export async function POST(req: NextRequest) {
  const payload = getTokenFromRequest(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { currentPassword, newPassword } = await req.json();

  if (!newPassword || newPassword.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const { data: client } = await getSupabase()
    .from("clients")
    .select("portal_password_hash, force_password_change")
    .eq("id", payload.clientId)
    .single();

  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // If not a forced first-login change, verify current password
  if (!client.force_password_change) {
    if (!currentPassword || !verifyPassword(currentPassword, client.portal_password_hash)) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
    }
  }

  const { error } = await getSupabase()
    .from("clients")
    .update({
      portal_password_hash: hashPassword(newPassword),
      force_password_change: false,
    })
    .eq("id", payload.clientId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
