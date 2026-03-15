import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabase } from "@/app/lib/supabase";

export const maxDuration = 30;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(req: NextRequest) {
  const { session_id, title, framework, objectives, cohort_goal } = await req.json();

  if (!session_id || !title) {
    return NextResponse.json({ error: "session_id and title required" }, { status: 400 });
  }

  const topicLine = framework
    ? `Framework: ${framework}`
    : `Topic: ${objectives ?? title}`;

  const isSession1 = title?.toLowerCase().includes("welcome") || title?.toLowerCase().includes("foundation");

  const session1Extra = isSession1
    ? `This is Session 1. It includes: (1) group intro round on Zoom — everyone shares name + one social challenge, (2) the coach teaches the 4 Jungian personality groups (Introverted/Extroverted + Thinking/Feeling) so everyone understands themselves and each other, (3) introduction to TALK Check framework.`
    : "";

  const prompt = `You are a session designer for Social Code, an online social skills coaching practice (all sessions via Zoom/video call).

Create teaching content for ONE online group coaching session.

Session: "${title}"
${topicLine}
Cohort Goal: ${cohort_goal ?? "Build social confidence"}
${session1Extra}

Design all activities for a single Zoom call — coach and all clients together on one call, no breakout rooms. Activities are coach-led discussions, group exercises done verbally, and real-world practice challenges.

Return ONLY this JSON (no markdown):
{
  "teach_points": ["key point 1", "key point 2", "key point 3"],
  "activity": "the online group exercise or drill — what it is and how to run it on Zoom (2-3 sentences)",
  "homework": "specific real-world homework to do before next session (1-2 sentences)",
  "discussion_questions": ["question 1", "question 2", "question 3"]
}`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    const text = content.text;
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("No JSON found");

    const curriculum = JSON.parse(text.slice(start, end + 1));

    const { data, error } = await getSupabase()
      .from("cohort_sessions")
      .update({ curriculum })
      .eq("id", session_id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ session: data });
  } catch (e) {
    console.error("Session curriculum generation failed:", e);
    return NextResponse.json({ error: "Session curriculum generation failed" }, { status: 500 });
  }
}
