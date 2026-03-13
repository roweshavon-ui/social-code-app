import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/app/lib/supabase";
import { hashPassword } from "@/app/lib/portalAuth";

export async function POST(req: NextRequest) {
  const { token, newPassword } = await req.json();

  if (!token || !newPassword || newPassword.length < 8) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { data: client } = await getSupabase()
    .from("clients")
    .select("id, portal_reset_expires")
    .eq("portal_reset_token", token)
    .single();

  if (!client) {
    return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
  }

  if (!client.portal_reset_expires || new Date(client.portal_reset_expires) < new Date()) {
    return NextResponse.json({ error: "This reset link has expired" }, { status: 400 });
  }

  const { error } = await getSupabase()
    .from("clients")
    .update({
      portal_password_hash: hashPassword(newPassword),
      force_password_change: false,
      portal_reset_token: null,
      portal_reset_expires: null,
    })
    .eq("id", client.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
