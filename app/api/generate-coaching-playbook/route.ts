import { NextRequest, NextResponse } from "next/server";
import { generateCoachingPlaybook } from "@/app/lib/generate-profile";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const { assessment_id } = await req.json();
  if (!assessment_id) return NextResponse.json({ error: "assessment_id required" }, { status: 400 });

  try {
    await generateCoachingPlaybook(assessment_id);
    return NextResponse.json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("Coaching playbook generation failed:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
