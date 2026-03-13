import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/app/lib/supabase";
import { verifyPassword, signToken } from "@/app/lib/portalAuth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email?.trim() || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const { data: client, error } = await getSupabase()
    .from("clients")
    .select("id, name, email, portal_access, portal_password_hash, force_password_change")
    .eq("email", email.trim().toLowerCase())
    .single();

  if (error || !client) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  if (!client.portal_access) {
    return NextResponse.json(
      { error: "Portal access is not enabled for this account. Contact your coach." },
      { status: 403 }
    );
  }

  if (!client.portal_password_hash) {
    return NextResponse.json(
      { error: "No password set. Contact your coach to get access." },
      { status: 401 }
    );
  }

  if (!verifyPassword(password, client.portal_password_hash)) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = signToken(client.id, client.email);
  const res = NextResponse.json({
    ok: true,
    forcePasswordChange: client.force_password_change,
    name: client.name,
  });

  res.cookies.set("sc_client", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });

  return res;
}
