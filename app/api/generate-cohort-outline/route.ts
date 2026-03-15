import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabase } from "@/app/lib/supabase";

export const maxDuration = 30;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(req: NextRequest) {
  const { cohort_id, clients, total_sessions, cohort_goal } = await req.json();

  if (!cohort_id || !clients || clients.length < 1) {
    return NextResponse.json({ error: "cohort_id and clients required" }, { status: 400 });
  }

  const clientList = clients
    .map((c: { name: string; jungian_type?: string }, i: number) =>
      `${i + 1}. ${c.name} (${c.jungian_type ?? "Unknown"})`
    )
    .join("\n");

  const prompt = `You are an expert curriculum designer for Social Code, a social skills coaching practice.

Plan a ${total_sessions}-session group coaching cohort for this group.

GROUP:
${clientList}

Cohort Goal: ${cohort_goal || "Build social confidence and real-world social skills from the ground up."}

Social Code Frameworks available:
- SPARK (starting conversations)
- 3-Second Social Scan (reading who to approach)
- Fearless Approach System (overcoming approach anxiety — full system)
- TALK Check (delivery: tone, attention, language, kinetics)
- BRAVE (navigating difficult conversations)
- SHIELD (handling difficult people)
- Stop Replaying (breaking post-social overthink)

Design a logical progression across ${total_sessions} sessions. Session 1 is always Intake. Build skills progressively. Not every session needs a framework — some can be practice/application sessions.

Return a JSON array with EXACTLY ${total_sessions} objects:

[
  {
    "session_number": 1,
    "title": "session title",
    "framework": "framework name or null if no framework",
    "custom_topic": "topic description or null",
    "objectives": "1-2 sentences — what this session builds toward"
  }
]

Return ONLY valid JSON array. No markdown, no explanation.`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    const text = content.text;
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");
    if (start === -1 || end === -1) throw new Error("No JSON array found");

    const outline: {
      session_number: number;
      title: string;
      framework: string | null;
      custom_topic: string | null;
      objectives: string;
    }[] = JSON.parse(text.slice(start, end + 1));

    // Insert all cohort sessions
    const rows = outline.map((s) => ({
      cohort_id,
      session_number: s.session_number,
      title: s.title,
      framework: s.framework ?? null,
      custom_topic: s.custom_topic ?? null,
      objectives: s.objectives,
      status: "planned",
    }));

    const { data, error } = await getSupabase()
      .from("cohort_sessions")
      .insert(rows)
      .select();

    if (error) throw new Error(error.message);

    return NextResponse.json({ sessions: data });
  } catch (e) {
    console.error("Cohort outline generation failed:", e);
    return NextResponse.json({ error: "Cohort outline generation failed" }, { status: 500 });
  }
}
