import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/app/lib/rateLimit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = rateLimit(`login:${ip}`, 5, 60_000);
  if (!allowed) return rateLimitResponse();

  const { password } = await req.json();

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const token = process.env.ADMIN_TOKEN!;
  const from = req.nextUrl.searchParams.get("from") ?? "/dashboard";

  const res = NextResponse.json({ ok: true, redirect: from });
  res.cookies.set("sc_admin", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return res;
}
