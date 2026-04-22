import { NextRequest, NextResponse } from "next/server";
import { generateClientFullProfile } from "@/app/lib/generate-profile";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const { client_id } = await req.json();
  if (!client_id) return NextResponse.json({ error: "client_id required" }, { status: 400 });

  try {
    await generateClientFullProfile(client_id);
    return NextResponse.json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("Client profile generation failed:", msg);
    return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 500 });
  }
}
