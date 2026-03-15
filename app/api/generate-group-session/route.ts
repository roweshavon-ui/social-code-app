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

  const prompt = `You are a group session planner for Social Code, an online social skills coaching practice (all sessions via Zoom/video call).

Plan a 45-min online group coaching session for ${clients.length} clients.

CLIENTS: ${clientList}
TYPES: ${typeBreakdown}
GOAL: ${session_goal || "Build social skills for this group."}
${frameworkSection}

Return ONLY this JSON (no markdown, no explanation):

{
  "session_title": "short title",
  "group_dynamics": "1 sentence on this type mix and what to expect on Zoom",
  "opening": "how to open the Zoom call — 2-3 sentences",
  "todays_focus": "what this session builds toward",
  "agenda": [
    { "time": "0-5 min", "block": "Opening", "notes": "brief" },
    { "time": "5-20 min", "block": "Teach", "notes": "brief" },
    { "time": "20-35 min", "block": "Practice", "notes": "brief" },
    { "time": "35-45 min", "block": "Close", "notes": "brief" }
  ],
  "group_exercise": "online exercise via Zoom — what it is and how to run it (breakout rooms, chat, partner video etc.) in 2-3 sentences",
  "watch_for": "1-2 things to watch for with this type mix on a video call",
  "session_close": "how to close the Zoom session — 1-2 sentences",
  "homework": "specific real-world homework for the group",
  "next_session_seed": "one line to plant momentum for next session"
}`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
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
