import { NextRequest, NextResponse } from "next/server";
import { generateBehavioralProfile, generateClientFullProfile } from "@/app/lib/generate-profile";

export const maxDuration = 30;

// Full profile (core + sales + playbook) is now generated in a single call
// by generate-profile / generate-client-profile. This route exists for
// backward compat and for the "Add Playbook" button on clients without one.
export async function POST(req: NextRequest) {
  const { assessment_id, client_id } = await req.json();

  try {
    if (assessment_id) {
      await generateBehavioralProfile(assessment_id);
    } else if (client_id) {
      await generateClientFullProfile(client_id);
    } else {
      return NextResponse.json({ error: "assessment_id or client_id required" }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("Profile generation failed:", msg);
    return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 500 });
  }
}
