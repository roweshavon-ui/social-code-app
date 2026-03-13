import { NextRequest, NextResponse } from "next/server";

function isAdmin(req: NextRequest) {
  const token = req.cookies.get("sc_admin")?.value;
  return token === process.env.ADMIN_TOKEN;
}

async function kitGet(path: string) {
  const key = process.env.KIT_API_KEY;
  if (!key) throw new Error("Missing KIT_API_KEY");
  const res = await fetch(`https://api.kit.com/v4${path}`, {
    headers: { "X-Kit-Api-Key": key, "Content-Type": "application/json" },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = req.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  // Look up subscriber by email
  const search = await kitGet(`/subscribers?email_address=${encodeURIComponent(email)}`);
  const subscriber = search?.subscribers?.[0] ?? null;

  if (!subscriber) {
    return NextResponse.json({ found: false });
  }

  // Fetch tags and sequences in parallel
  const [tagsData, sequencesData] = await Promise.all([
    kitGet(`/subscribers/${subscriber.id}/tags`),
    kitGet(`/subscribers/${subscriber.id}/sequences`),
  ]);

  return NextResponse.json({
    found: true,
    id: subscriber.id,
    status: subscriber.state,
    subscribedAt: subscriber.created_at,
    tags: tagsData?.tags?.map((t: { name: string }) => t.name) ?? [],
    sequences: sequencesData?.sequences?.map((s: { name: string; hold: boolean }) => ({
      name: s.name,
      paused: s.hold,
    })) ?? [],
  });
}
