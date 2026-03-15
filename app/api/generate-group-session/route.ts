import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 30;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const FRAMEWORKS: Record<string, string> = {
  "SPARK": `SPARK — S-tarter (situational observation), P-erson (light comment about them), A-sk (one open-ended question), R-eflect (mirror back what they said), K-eep going (follow the thread). Purpose: Eliminates the opener freeze with a repeatable structure.`,
  "3-Second Social Scan": `3-Second Social Scan — Before approaching, scan: (1) Eye contact/glance your way, (2) Open body language, (3) Available/unoccupied. 2 of 3 = window is open. Purpose: Separates approach anxiety from actual social unavailability.`,
  "Fearless Approach System": `FAS — (1) Permission Slip (internal reframe), (2) Target Selection (3-Second Scan), (3) Approach Window (move within 3 seconds), (4) Opening (SPARK), (5) Exit Strategy (graceful out ready). Purpose: End-to-end system for approach anxiety.`,
  "TALK Check": `TALK Check — T-one (warm or flat?), A-ttention (eye contact, body facing?), L-anguage (matching vocabulary?), K-inetics (body language, proximity, gestures). Purpose: Fixes how they say it, not just what they say.`,
  "BRAVE": `BRAVE — B-reak the pattern (acknowledge tension), R-eason (why you're bringing it up), A-sk (their view first), V-alidate (their perspective), E-nd with action (agree on next step). Purpose: Structure for difficult conversations.`,
  "SHIELD": `SHIELD — S-ee it coming, H-old your frame, I-solate behavior, E-xit or engage (conscious choice), L-og patterns, D-etach from outcome. Purpose: Handling difficult people without handing them control.`,
  "Stop Replaying": `Stop Replaying — (1) Interrupt (physical pattern break), (2) Reframe (actual event vs. story), (3) Release (deliberate closure ritual). Purpose: Breaking the post-social overthink loop.`,
};

type ClientSummary = {
  name: string;
  jungian_type: string;
  primary_need?: string;
  hidden_fear?: string;
  trust_pattern?: string;
};

export async function POST(req: NextRequest) {
  try {
  const { clients, mode, framework, custom_topic, session_goal } = await req.json();

  if (!clients || clients.length < 2) {
    return NextResponse.json(
      { error: "At least 2 clients required for a group session" },
      { status: 400 }
    );
  }

  const frameworkSection =
    mode === "framework" && framework
      ? `FRAMEWORK TO TEACH THIS SESSION: ${framework}\n\n${FRAMEWORKS[framework] ?? ""}`
      : mode === "custom" && custom_topic
      ? `CUSTOM TOPIC: ${custom_topic}`
      : "No specific framework — build the session based on what this group needs most.";

  const clientList = (clients as ClientSummary[])
    .map(
      (c, i) =>
        `${i + 1}. ${c.name} (${c.jungian_type ?? "Unknown"})${c.primary_need ? ` — Primary Need: ${c.primary_need}` : ""}${c.hidden_fear ? ` | Hidden Fear: ${c.hidden_fear}` : ""}${c.trust_pattern ? ` | Trust: ${c.trust_pattern}` : ""}`
    )
    .join("\n");

  const jungianTypes = (clients as ClientSummary[]).map((c) => c.jungian_type).filter(Boolean);
  const typeBreakdown = [...new Set(jungianTypes)].join(", ");

  const prompt = `You are an expert session planner for Social Code, a 1:1 and group social skills coaching practice.

Generate a complete GROUP SESSION plan for a coaching call with ${clients.length} clients.

GROUP ROSTER:
${clientList}

Type Mix in Room: ${typeBreakdown}
Session Goal: ${session_goal || "No specific goal provided — assess and build for the group's current level."}

${frameworkSection}

Your job: Generate a group session plan that accounts for the TYPE MIX in the room. Different Jungian types will respond differently. Design the session to serve the full group while noting where to individualize.

Generate a JSON object with EXACTLY this structure:

{
  "session_title": "short punchy group session title",
  "group_dynamics": "1-2 sentences on the type mix and what this means for the group dynamic — where will tension come from, who will lead, who will hold back",
  "opening": "exactly how to open this group call — set the tone for the group, create safety",
  "check_in_activity": "a group check-in activity or question — one that works for the type mix and gets everyone talking",
  "todays_focus": "what this group session builds toward and why it matters for this specific group",
  "agenda": [
    { "time": "0-5 min", "block": "Opening & check-in", "notes": "what to do" },
    { "time": "5-20 min", "block": "block name", "notes": "what to cover" },
    { "time": "20-35 min", "block": "block name", "notes": "what to cover" },
    { "time": "35-45 min", "block": "Close & assign", "notes": "what to do" }
  ],
  "framework_or_topic_approach": "how to introduce and teach this framework to a mixed group — or null if AI-decided",
  "group_exercise": "the specific group exercise or drill — what it is, how to run it, how to pair or sequence participants based on their types",
  "type_callouts": [
    {
      "types": ["INTJ", "INFJ"],
      "members": ["name1", "name2"],
      "watch_for": "specific behavior to watch for from these types in the group",
      "how_to_engage": "how to bring them in or manage them specifically"
    }
  ],
  "group_friction_points": "where this group could hit friction — type conflicts, energy clashes, anyone who might dominate or withdraw",
  "how_to_handle_friction": "exact language and moves for managing the friction points — what to say and do",
  "session_close": "how to close the group session — what to summarize, what to acknowledge for the group",
  "homework": "homework assignment — can be the same for everyone or differentiated by type. Be specific.",
  "next_session_seed": "what to plant at the end to create momentum for the next group call"
}

Return ONLY valid JSON. No markdown, no explanation, no code blocks.`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    const text = content.text;
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("No JSON found in response");

    const plan = JSON.parse(text.slice(start, end + 1));
    return NextResponse.json({ plan });
  } catch (e) {
    console.error("Group session plan generation failed:", e);
    return NextResponse.json({ error: "Group session plan generation failed" }, { status: 500 });
  }

  } catch (e) {
    console.error("Unhandled error in generate-group-session:", e);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
