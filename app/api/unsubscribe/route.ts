import { NextRequest, NextResponse } from "next/server";

async function kitGet(path: string) {
  const key = process.env.KIT_API_KEY;
  if (!key) return null;
  const res = await fetch(`https://api.kit.com/v4${path}`, {
    headers: { "X-Kit-Api-Key": key },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const key = process.env.KIT_API_KEY;
  if (!key) return NextResponse.json({ ok: true }); // fail silently

  // Find subscriber
  const search = await kitGet(`/subscribers?email_address=${encodeURIComponent(email)}`);
  const subscriber = search?.subscribers?.[0];

  if (subscriber?.id) {
    // Unsubscribe via Kit v4
    await fetch(`https://api.kit.com/v4/subscribers/${subscriber.id}`, {
      method: "DELETE",
      headers: { "X-Kit-Api-Key": key },
    });
  }

  return NextResponse.json({ ok: true });
}
