import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabase } from "@/app/lib/supabase";

export const maxDuration = 30;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const ALL_FRAMEWORKS = [
  "SPARK",
  "3-Second Social Scan",
  "Fearless Approach System",
  "3-2-1 Send It",
  "Barista Method",
  "TALK Check",
  "DEPTH",
  "GROUND",
  "Pre-Game System",
  "Energy Check",
  "VOICE",
  "BRAVE",
  "SHIELD",
  "Stop Replaying",
].join(" | ");

const BRIEF_SCHEMA = `{
  "focus": "max 20 words: what this session is about and what you're building toward",
  "framework": "one of: ${ALL_FRAMEWORKS} | None",
  "framework_why": "max 15 words: why this framework fits this person right now",
  "q1": "max 15 words: first unlock question to ask today",
  "q2": "max 15 words: second unlock question",
  "q3": "max 15 words: third unlock question",
  "watch_for": "max 20 words: the single most important behavioral signal to notice live in this session",
  "resist_script": "max 20 words: exact word-for-word script if they go quiet, deflect, or push back"
}`;

function repairJson(raw: string): string {
  return raw.replace(/\"((?:[^\"\\]|\\.)*)\"/g, (_, inner) =>
    `"${inner.replace(/\n/g, " ").replace(/\r/g, "")}"`
  );
}

export async function POST(req: NextRequest) {
  const { profile, name, jungian_type, client_id, session_number, coach_note } = await req.json();

  if (!profile || !name) {
    return NextResponse.json({ error: "profile and name required" }, { status: 400 });
  }

  // Fetch last session for continuity
  let lastSessionContext = "";
  if (client_id) {
    const { data: sessions } = await getSupabase()
      .from("sessions")
      .select("session_number, date, notes, homework_assigned, homework_completion, breakthrough_moment")
      .eq("client_id", client_id)
      .order("session_number", { ascending: false })
      .limit(1);

    if (sessions && sessions.length > 0) {
      const last = sessions[0];
      lastSessionContext = [
        `Last session: #${last.session_number} (${last.date})`,
        last.notes ? `What happened: ${last.notes}` : null,
        last.homework_assigned ? `Homework given: ${last.homework_assigned}` : null,
        last.homework_completion && last.homework_completion !== "none"
          ? `Homework completion: ${last.homework_completion}`
          : null,
        last.breakthrough_moment ? `Breakthrough: ${last.breakthrough_moment}` : null,
      ].filter(Boolean).join(" | ");
    }
  }

  const p = profile as Record<string, unknown>;
  const playbook = p.coaching_playbook as Record<string, unknown> | undefined;

  const prompt = `You are a session brief generator for Social Code coaching. Generate a quick-glance pre-session brief that fits on one phone screen.

CLIENT: ${name} | ${jungian_type ?? "Unknown"}
Primary Need: ${(p.primary_need as string) ?? "Unknown"}
Hidden Fear: ${(p.hidden_fear as string) ?? "Unknown"}
Trust Pattern: ${(p.trust_pattern as string) ?? "Unknown"}
Compliance: ${(p.compliance_style as string) ?? "Unknown"}
When Stuck: ${(playbook?.when_stuck as string) ?? "Not set"}
Session Number: ${session_number ?? "Not specified"}${coach_note ? `\nCoach's note: ${coach_note}` : ""}${lastSessionContext ? `\n${lastSessionContext}` : ""}

Return ONLY this JSON (no markdown, no explanation):
${BRIEF_SCHEMA}`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      messages: [
        { role: "user", content: prompt },
        { role: "assistant", content: "{" },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");
    const raw = "{" + content.text;
    const end = raw.lastIndexOf("}");
    if (end === -1) throw new Error("JSON truncated");
    const brief = JSON.parse(repairJson(raw.slice(0, end + 1)));
    return NextResponse.json({ brief, lastSessionContext: lastSessionContext || null });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("Session brief generation failed:", msg);
    return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 500 });
  }
}
