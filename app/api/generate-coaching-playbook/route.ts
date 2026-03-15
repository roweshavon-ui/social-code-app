import { NextRequest, NextResponse } from "next/server";
import { generateCoachingPlaybook } from "@/app/lib/generate-profile";
import { getSupabase } from "@/app/lib/supabase";
import Anthropic from "@anthropic-ai/sdk";
import { TYPE_PROFILES } from "@/app/lib/mbtiData";

export const maxDuration = 30;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const SALES_SCHEMA = `{
  "sales_handbook": {
    "buyer_profile": "1 sentence",
    "likely_objections": [
      {"objection": "objection","what_it_really_means": "short reason","reframe": "short reframe","language": "1-sentence script"},
      {"objection": "objection","what_it_really_means": "short reason","reframe": "short reframe","language": "1-sentence script"}
    ],
    "close_style": "1 sentence",
    "what_kills_the_sale": "1 sentence",
    "what_gets_them_off_fence": "1 sentence",
    "coaching_close_script": "2-sentence script",
    "anchor_moment": "1 sentence"
  }
}`;

const COACHING_SCHEMA = `{
  "coaching_playbook": {
    "how_to_open_sessions": "1-sentence opening question",
    "unlock_questions": ["question 1","question 2","question 3","question 4"],
    "session_actions": [
      {"session": "Session 1", "goal": "1 sentence", "do_this": "1-2 sentences", "avoid": "1 sentence"},
      {"session": "Sessions 2-3", "goal": "1 sentence", "do_this": "1-2 sentences", "avoid": "1 sentence"},
      {"session": "Sessions 4-6", "goal": "1 sentence", "do_this": "1-2 sentences", "avoid": "1 sentence"},
      {"session": "Sessions 7+", "goal": "1 sentence", "do_this": "1-2 sentences", "avoid": "1 sentence"}
    ],
    "when_stuck": "1-2 sentence script",
    "when_spiraling": "1-2 sentence script",
    "feedback_delivery": "1 sentence",
    "homework_style": "1 sentence",
    "red_flags": ["flag + action","flag + action","flag + action"]
  }
}`;

async function callHaiku(prompt: string, max_tokens: number) {
  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens,
    messages: [{ role: "user", content: prompt }],
  });
  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");
  const text = content.text;
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON found");
  return JSON.parse(text.slice(start, end + 1));
}

export async function POST(req: NextRequest) {
  const { assessment_id, client_id } = await req.json();

  try {
    if (assessment_id) {
      await generateCoachingPlaybook(assessment_id);
    } else if (client_id) {
      const { data: c, error } = await getSupabase()
        .from("clients")
        .select("*")
        .eq("id", client_id)
        .single();

      if (error || !c) throw new Error("Client not found");

      const tp = TYPE_PROFILES[c.jungian_type];
      const typeExtra = tp ? `Type flags: ${tp.redFlags.join(", ")}` : "";

      const context = `Name: ${c.name} | Type: ${c.jungian_type ?? "Unknown"}
Goal: ${c.goal ?? "Not specified"}
Primary need: ${c.behavioral_profile?.primary_need ?? "Unknown"}
Hidden fear: ${c.behavioral_profile?.hidden_fear ?? "Unknown"}
Trust pattern: ${c.behavioral_profile?.trust_pattern ?? "Unknown"}
${typeExtra}`;

      const base = `You are a coaching strategist. Be specific and tactical — coach's private use only.\n\n${context}\n\nReturn ONLY this JSON (no markdown):\n`;

      // Two small calls instead of one large one — each fits well within token limit
      const [salesResult, coachingResult] = await Promise.all([
        callHaiku(base + SALES_SCHEMA, 800),
        callHaiku(base + COACHING_SCHEMA, 900),
      ]);

      const merged = {
        ...(c.behavioral_profile ?? {}),
        ...salesResult,
        ...coachingResult,
      };

      await getSupabase()
        .from("clients")
        .update({ behavioral_profile: merged })
        .eq("id", client_id);
    } else {
      return NextResponse.json({ error: "assessment_id or client_id required" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("Coaching playbook generation failed:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
