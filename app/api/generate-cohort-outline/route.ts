import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabase } from "@/app/lib/supabase";

export const maxDuration = 30;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(req: NextRequest) {
  const { cohort_id, clients, total_sessions, cohort_goal } = await req.json();

  if (!cohort_id) {
    return NextResponse.json({ error: "cohort_id required" }, { status: 400 });
  }

  const clientContext =
    clients && clients.length > 0
      ? `Group: ${clients.map((c: { name: string; jungian_type?: string }) => `${c.name} (${c.jungian_type ?? "Unknown"})`).join(", ")}`
      : "No clients enrolled yet — build a general curriculum for a social confidence group.";

  const prompt = `You are a curriculum designer for Social Code, a social skills coaching practice.

Design a ${total_sessions}-session group coaching cohort.

${clientContext}
Goal: ${cohort_goal || "Build social confidence and real-world social skills from the ground up."}

Social Code Frameworks: SPARK (starting conversations), 3-Second Social Scan (reading who to approach), Fearless Approach System (approach anxiety), TALK Check (tone/attention/language/kinetics), BRAVE (difficult conversations), SHIELD (handling difficult people), Stop Replaying (post-social overthink).

RULES:
- Session 1 is ALWAYS "TALK Check" — easy to apply immediately
- Build skills progressively
- Not every session needs a framework

Return a JSON array with EXACTLY ${total_sessions} objects:
[{"session_number":1,"title":"session title","framework":"framework name or null","custom_topic":"topic or null","objectives":"what this session builds toward (1-2 sentences)"}]

Return ONLY valid JSON array. No markdown.`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1200,
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
