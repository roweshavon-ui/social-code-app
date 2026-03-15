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

  const prompt = `You are a session designer for Social Code, a social skills coaching practice.

Create teaching content for ONE group coaching session.

Session: "${title}"
${topicLine}
Cohort Goal: ${cohort_goal ?? "Build social confidence"}

Return ONLY this JSON (no markdown):
{
  "teach_points": ["key point 1", "key point 2", "key point 3"],
  "activity": "the group exercise or drill for this session (2-3 sentences)",
  "homework": "specific homework before next session (1-2 sentences)",
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
