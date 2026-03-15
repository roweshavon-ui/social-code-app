import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/app/lib/supabase";
import { generateBehavioralProfile } from "@/app/lib/generate-profile";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("sc_admin")?.value;
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: assessments, error } = await getSupabase()
    .from("assessments")
    .select("id")
    .is("behavioral_profile", null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!assessments?.length) return NextResponse.json({ count: 0, message: "Nothing to backfill" });

  let success = 0;
  let failed = 0;

  for (const a of assessments) {
    try {
      await generateBehavioralProfile(a.id);
      success++;
    } catch {
      failed++;
    }
  }

  return NextResponse.json({ total: assessments.length, success, failed });
}
