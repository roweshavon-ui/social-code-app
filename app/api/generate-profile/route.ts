import { NextRequest, NextResponse } from "next/server";
import { generateBehavioralProfile } from "@/app/lib/generate-profile";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const { assessment_id } = await req.json();
  if (!assessment_id) return NextResponse.json({ error: "assessment_id required" }, { status: 400 });

  try {
    await generateBehavioralProfile(assessment_id);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Profile generation failed:", e);
    const msg = e instanceof Error ? e.message : String(e);
    console.error("Profile generation failed:", msg);
    return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 500 });
  }
}
