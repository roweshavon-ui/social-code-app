import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/app/lib/supabase";

export async function POST(req: NextRequest) {
  // Only callable from admin (check cookie)
  const token = req.cookies.get("sc_admin")?.value;
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: assessments, error } = await getSupabase()
    .from("assessments")
    .select("id, answer_map, scores")
    .is("behavioral_profile", null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!assessments?.length) return NextResponse.json({ count: 0, message: "Nothing to backfill" });

  const baseUrl = req.nextUrl.origin;
  let success = 0;
  let failed = 0;

  for (const a of assessments) {
    try {
      const res = await fetch(`${baseUrl}/api/generate-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessment_id: a.id }),
      });
      if (res.ok) success++;
      else failed++;
    } catch {
      failed++;
    }
  }

  return NextResponse.json({ total: assessments.length, success, failed });
}
