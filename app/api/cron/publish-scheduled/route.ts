import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function supabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = supabase();
  const now = new Date().toISOString();

  const { data: posts, error: fetchError } = await db
    .from("posts")
    .select("id, title, slug, published_at")
    .eq("published", false)
    .not("published_at", "is", null)
    .lte("published_at", now);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!posts || posts.length === 0) {
    return NextResponse.json({ published: 0, message: "Nothing to publish" });
  }

  const ids = posts.map((p) => p.id);

  const { error: updateError } = await db
    .from("posts")
    .update({ published: true })
    .in("id", ids);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    published: posts.length,
    posts: posts.map((p) => ({ id: p.id, title: p.title, slug: p.slug })),
  });
}
