import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { rateLimit, rateLimitResponse } from "@/app/lib/rateLimit";

function checkPassword(submitted: string): boolean {
  const stored = process.env.ADMIN_PASSWORD ?? "";
  // HMAC both to equalise length before timingSafeEqual
  const key = process.env.ADMIN_TOKEN ?? "fallback";
  const a = createHmac("sha256", key).update(submitted).digest();
  const b = createHmac("sha256", key).update(stored).digest();
  return timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = rateLimit(`login:${ip}`, 5, 60_000);
  if (!allowed) return rateLimitResponse();

  const { password } = await req.json();

  if (!password || !checkPassword(password)) {
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
