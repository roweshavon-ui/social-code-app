import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

function getSecret() {
  return process.env.JWT_SECRET ?? process.env.ADMIN_TOKEN ?? "";
}

export function signUnsubscribeToken(email: string): string {
  return createHmac("sha256", getSecret()).update(email).digest("hex");
}

function verifyToken(email: string, token: string): boolean {
  try {
    const expected = signUnsubscribeToken(email);
    return timingSafeEqual(Buffer.from(token, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

async function kitDelete(email: string) {
  const key = process.env.KIT_API_KEY;
  if (!key) return;
  const res = await fetch(`https://api.kit.com/v4/subscribers?email_address=${encodeURIComponent(email)}`, {
    headers: { "X-Kit-Api-Key": key },
  });
  if (!res.ok) return;
  const data = await res.json();
  const id = data?.subscribers?.[0]?.id;
  if (id) {
    await fetch(`https://api.kit.com/v4/subscribers/${id}`, {
      method: "DELETE",
      headers: { "X-Kit-Api-Key": key },
    });
  }
}

export async function POST(req: NextRequest) {
  const { email, token } = await req.json();

  if (!email || !token) {
    return NextResponse.json({ error: "Email and token required" }, { status: 400 });
  }

  if (!verifyToken(email, token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  await kitDelete(email);
  return NextResponse.json({ ok: true });
}
