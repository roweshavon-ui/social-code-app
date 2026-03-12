import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

function supabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function isAdmin(req: NextRequest) {
  const token = req.cookies.get("sc_admin")?.value;
  return token && token === process.env.ADMIN_TOKEN;
}

// GET — public gets approved comments for a post (?postId=)
//        admin gets pending comments (?pending=true)
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const postId = searchParams.get("postId");
  const pending = searchParams.get("pending");
  const db = supabase();

  if (pending && isAdmin(req)) {
    const { data, error } = await db
      .from("comments")
      .select("*, posts(title, slug)")
      .eq("approved", false)
      .order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: CORS });
    return NextResponse.json(data, { headers: CORS });
  }

  if (!postId) {
    return NextResponse.json({ error: "postId required" }, { status: 400, headers: CORS });
  }

  const { data, error } = await db
    .from("comments")
    .select("id, name, body, created_at")
    .eq("post_id", postId)
    .eq("approved", true)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: CORS });
  return NextResponse.json(data, { headers: CORS });
}

// POST — anyone can submit a comment (goes to pending)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { postId, name, message } = body;

  if (!postId || !name?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "postId, name, and message are required" }, { status: 400, headers: CORS });
  }

  if (message.trim().length > 1000) {
    return NextResponse.json({ error: "Message too long" }, { status: 400, headers: CORS });
  }

  const db = supabase();
  const { error } = await db.from("comments").insert({
    post_id: postId,
    name: name.trim(),
    body: message.trim(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: CORS });
  return NextResponse.json({ success: true }, { headers: CORS });
}
