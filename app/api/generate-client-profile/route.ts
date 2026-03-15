import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabase } from "@/app/lib/supabase";
import { TYPE_PROFILES } from "@/app/lib/mbtiData";

export const maxDuration = 30;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

function buildTypeContext(jungianType: string): string {
  const tp = TYPE_PROFILES[jungianType];
  if (!tp) return "";
  return `
TYPE-SPECIFIC COACHING DATA (${jungianType} — from your knowledge base):
Social Style: ${tp.socialStyle}
Communication Tip: ${tp.communicationTip}
How They Handle Failure: ${tp.failureResponse}
Quick Win Assignment: ${tp.quickWins}

Red Flags To Watch For:
${tp.redFlags.map((r, i) => `${i + 1}. ${r}`).join("\n")}

Proven Session Questions For This Type:
${tp.sessionQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}
`.trim();
}

const PROFILE_SCHEMA = `{
  "primary_need": "one of: Significance | Approval | Acceptance | Intelligence | Pity | Strength",
  "secondary_need": "one of: Significance | Approval | Acceptance | Intelligence | Pity | Strength | None",
  "need_breakdown": "2-3 sentences on what their primary need means for how they show up socially and what they're seeking in every interaction",
  "hidden_fear": "the specific fear underneath their primary need — what they're most afraid others will think or see",
  "fear_in_session": "how this fear might show up in coaching sessions — what it looks like when triggered",
  "locus_of_control": "Internal | External | Mixed-Internal | Mixed-External",
  "locus_description": "1-2 sentences on how to frame coaching accountability with them",
  "trust_pattern": "Slow-build | Fast-open | Guarded | Selective",
  "trust_description": "how they build trust, what breaks it, what you need to do in session one to earn it",
  "compliance_style": "Authority-responsive | Logic-first | Relationship-first | Resistance-prone | Validation-seeking",
  "compliance_description": "how they respond to being guided — what makes them follow vs. resist",
  "stress_behavior": "how this person shows up under pressure — what they do, what they need, how to coach through it",
  "sensory_channel": "Visual | Auditory | Kinesthetic | Analytical",
  "communication_approach": "tactical advice on how to communicate with THIS person — pacing, language, what to emphasize, what to avoid",
  "influence_map": {
    "what_works": ["3-5 specific influence approaches that work on this profile"],
    "what_doesnt_work": ["2-3 approaches that will create resistance"],
    "decision_making_style": "how this person makes decisions — time, data, emotional safety, social proof, or permission?",
    "motivation_triggers": "the 2-3 deepest motivators that get this person to actually move"
  },
  "sales_handbook": {
    "buyer_profile": "1-2 sentences on what kind of buyer this person is",
    "likely_objections": [
      {
        "objection": "most likely objection word-for-word",
        "what_it_really_means": "real psychological reason behind it",
        "reframe": "how to reframe or preempt it",
        "language": "exact language to use in response"
      },
      {
        "objection": "second objection",
        "what_it_really_means": "real reason",
        "reframe": "how to handle",
        "language": "exact response"
      },
      {
        "objection": "third objection",
        "what_it_really_means": "real reason",
        "reframe": "how to handle",
        "language": "exact response"
      }
    ],
    "close_style": "closing approach for this profile — e.g. Logic-based assumptive | Emotional identity close | Social proof close | Urgency/scarcity | Permission-giving close",
    "what_kills_the_sale": "the specific thing NOT to say or do — be precise",
    "what_gets_them_off_fence": "the single most powerful thing that moves this profile from thinking to yes",
    "coaching_close_script": "3-5 sentence closing script for pitching 1:1 Social Code coaching to this person — use their need driver, speak to their hidden fear, frame coaching as the solution. First person as the coach.",
    "anchor_moment": "the emotional or logical anchor to plant in the first 10 minutes that makes the close easier"
  },
  "coaching_playbook": {
    "session_1_blueprint": "exactly what to do in session 1 — what to establish, what to probe, what to avoid, how to end it. Be specific and tactical.",
    "how_to_open_sessions": "the best way to open ongoing sessions with this person — what question or frame gets them into the right headspace immediately",
    "unlock_questions": ["6-8 exact questions — written out in full — that open this specific person up based on their need driver, fear, and type. Not generic coaching questions."],
    "when_stuck_intervention": "exact word-for-word language to use when they go quiet, deflect, intellectualize, or resist. What to say and how to say it.",
    "when_spiraling_intervention": "what to say and do when they're overwhelmed, in their head, or emotionally flooded. The specific move that brings them back.",
    "feedback_delivery": "how to challenge, correct, or push this person so it lands and doesn't trigger their fear. The exact framing and tone to use.",
    "homework_style": "what kinds of assignments work for this profile — format, difficulty level, how to frame them, and what accountability looks like",
    "push_vs_pull": "when to push harder and when to ease off — the specific signals in their behavior that tell you which gear to use",
    "progress_markers": "what real growth looks like for this person — the behavioral and emotional signs that the coaching is actually working",
    "red_flags": ["3-5 specific warning signs this person is about to stall, disengage, or quit — what it looks like in session and what to do about it"],
    "coaching_arc": "the progression arc for the full coaching relationship — what to focus on in early sessions, what shifts mid-way, and what the endgame looks like for this profile"
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

  const typeContext = buildTypeContext(c.jungian_type);

  const prompt = `You are an expert behavioral profiler and coaching strategist with deep knowledge of Chase Hughes' frameworks including the Six-Minute X-Ray, Human Needs Map, Six-Axis Model, and influence/persuasion methodology.

Generate a comprehensive behavioral profile AND coaching playbook for this coaching client. This is NEVER shown to the client — it is the coach's private intelligence.

PERSON DATA:
Name: ${c.name}
Jungian Type: ${c.jungian_type ?? "Unknown"}
Goal they stated: ${c.goal ?? "Not specified"}
Notes: ${c.notes ?? "None"}

Note: No assessment score data available — infer from Jungian type, stated goal, and notes.

${typeContext ? `${typeContext}\n` : ""}
Generate a JSON object with EXACTLY this structure. Every field must be written specifically for THIS person. The coaching_playbook section must be actionable enough to use live in a session.

${PROFILE_SCHEMA}

Return ONLY valid JSON. No markdown, no explanation, no code blocks.`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 8000,
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
    console.error("Client profile generation failed:", e);
    return NextResponse.json({ error: "Profile generation failed" }, { status: 500 });
  }
}
