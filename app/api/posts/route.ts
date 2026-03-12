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

// GET — public gets published only; admin gets all
export async function GET(req: NextRequest) {
  const admin = isAdmin(req);
  const db = supabase();

  let query = db
    .from("posts")
    .select("id, title, slug, excerpt, keywords, published, published_at, created_at")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (!admin) {
    query = query.eq("published", true);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: CORS });
  return NextResponse.json(data, { headers: CORS });
}

// POST — admin only
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, slug, excerpt, content, keywords, published } = body;

  if (!title?.trim() || !slug?.trim() || !excerpt?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "title, slug, excerpt, and content are required" }, { status: 400 });
  }

  const db = supabase();
  const { data, error } = await db
    .from("posts")
    .insert({
      title: title.trim(),
      slug: slug.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      excerpt: excerpt.trim(),
      content: content.trim(),
      keywords: keywords?.trim() || null,
      published: published ?? false,
      published_at: published ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
