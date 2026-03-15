import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabase } from "@/app/lib/supabase";
import { TYPE_PROFILES } from "@/app/lib/mbtiData";

export const maxDuration = 30;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const CORE_SCHEMA = `{
  "primary_need": "one of: Significance | Approval | Acceptance | Intelligence | Pity | Strength",
  "secondary_need": "one of: Significance | Approval | Acceptance | Intelligence | Pity | Strength | None",
  "need_breakdown": "2 sentences on what their primary need means for how they show up socially",
  "hidden_fear": "the specific fear underneath their primary need",
  "fear_in_session": "how this fear shows up in coaching — what it looks like when triggered",
  "locus_of_control": "Internal | External | Mixed-Internal | Mixed-External",
  "locus_description": "1 sentence on how to frame coaching accountability with them",
  "trust_pattern": "Slow-build | Fast-open | Guarded | Selective",
  "trust_description": "how they build trust and what breaks it",
  "compliance_style": "Authority-responsive | Logic-first | Relationship-first | Resistance-prone | Validation-seeking",
  "compliance_description": "how they respond to being guided — what makes them follow vs. resist",
  "stress_behavior": "how this person shows up under pressure",
  "sensory_channel": "Visual | Auditory | Kinesthetic | Analytical",
  "communication_approach": "tactical advice on how to communicate with this person",
  "influence_map": {
    "what_works": ["3 specific influence approaches that work on this profile"],
    "what_doesnt_work": ["2 approaches that create resistance"],
    "decision_making_style": "how this person makes decisions",
    "motivation_triggers": "the 2 deepest motivators that get this person to move"
  }
}`;

export async function POST(req: NextRequest) {
  const { client_id } = await req.json();
  if (!client_id) return NextResponse.json({ error: "client_id required" }, { status: 400 });

  const { data: c, error } = await getSupabase()
    .from("clients")
    .select("*")
    .eq("id", client_id)
    .single();

  if (error || !c) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const tp = TYPE_PROFILES[c.jungian_type];
  const typeLine = tp
    ? `Type: ${c.jungian_type} — Social Style: ${tp.socialStyle} | Comm Tip: ${tp.communicationTip}`
    : `Type: ${c.jungian_type ?? "Unknown"}`;

  const prompt = `You are a behavioral profiler using Chase Hughes' frameworks.
Analyze this coaching client and return a core behavioral profile. Every field must be specific to THIS person.

Name: ${c.name} | ${typeLine}
Goal: ${c.goal ?? "Not specified"}
Notes: ${c.notes ?? "None"}
No assessment score data — infer from type, goal, and notes.

Return ONLY this JSON (no markdown):
${CORE_SCHEMA}`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1400,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    const text = content.text;
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("No JSON found in response");

    const profile = JSON.parse(text.slice(start, end + 1));

    await getSupabase()
      .from("clients")
      .update({ behavioral_profile: profile })
      .eq("id", client_id);

    return NextResponse.json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("Client profile generation failed:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
