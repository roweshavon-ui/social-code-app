import { NextRequest, NextResponse } from "next/server";
import { generateCoachingPlaybook } from "@/app/lib/generate-profile";
import { getSupabase } from "@/app/lib/supabase";
import Anthropic from "@anthropic-ai/sdk";
import { TYPE_PROFILES } from "@/app/lib/mbtiData";

export const maxDuration = 30;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const PLAYBOOK_SCHEMA = `{
  "sales_handbook": {
    "buyer_profile": "1 sentence on what kind of buyer this person is",
    "likely_objections": [
      {"objection": "objection","what_it_really_means": "real reason (short)","reframe": "how to handle (short)","language": "exact 1-sentence response"},
      {"objection": "objection","what_it_really_means": "real reason (short)","reframe": "how to handle (short)","language": "exact 1-sentence response"}
    ],
    "close_style": "1 sentence closing approach",
    "what_kills_the_sale": "1 sentence",
    "what_gets_them_off_fence": "1 sentence",
    "coaching_close_script": "2-sentence close script",
    "anchor_moment": "1 sentence"
  },
  "coaching_playbook": {
    "how_to_open_sessions": "exact opening question (1 sentence)",
    "unlock_questions": ["question 1","question 2","question 3","question 4"],
    "session_actions": [
      {"session": "Session 1", "goal": "1 sentence", "do_this": "1-2 sentences", "avoid": "1 sentence"},
      {"session": "Sessions 2-3", "goal": "1 sentence", "do_this": "1-2 sentences", "avoid": "1 sentence"},
      {"session": "Sessions 4-6", "goal": "1 sentence", "do_this": "1-2 sentences", "avoid": "1 sentence"},
      {"session": "Sessions 7+", "goal": "1 sentence", "do_this": "1-2 sentences", "avoid": "1 sentence"}
    ],
    "when_stuck": "exact 1-2 sentence script",
    "when_spiraling": "exact 1-2 sentence script",
    "feedback_delivery": "1 sentence",
    "homework_style": "1 sentence",
    "red_flags": ["flag + action (1 sentence each) x3"]
  }
}`;

export async function POST(req: NextRequest) {
  const { assessment_id, client_id } = await req.json();

  try {
    if (assessment_id) {
      // Assessment-based entry
      await generateCoachingPlaybook(assessment_id);
    } else if (client_id) {
      // Client-only entry — fetch from clients table
      const { data: c, error } = await getSupabase()
        .from("clients")
        .select("*")
        .eq("id", client_id)
        .single();

      if (error || !c) throw new Error("Client not found");

      const tp = TYPE_PROFILES[c.jungian_type];
      const typeExtra = tp
        ? `Red flags for this type: ${tp.redFlags.join(", ")}`
        : "";

      const context = `Name: ${c.name} | Type: ${c.jungian_type ?? "Unknown"}
Goal: ${c.goal ?? "Not specified"}
Primary need: ${c.behavioral_profile?.primary_need ?? "Unknown"}
Hidden fear: ${c.behavioral_profile?.hidden_fear ?? "Unknown"}
Trust pattern: ${c.behavioral_profile?.trust_pattern ?? "Unknown"}
${typeExtra}`;

      const playbookPrompt = `You are a coaching strategist. Generate a sales handbook and actionable coaching playbook for this client. Be specific and tactical — this is the coach's private use only.

${context}

Return ONLY this JSON (no markdown):
${PLAYBOOK_SCHEMA}`;

      const message = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1600,
        messages: [{ role: "user", content: playbookPrompt }],
      });

      const content = message.content[0];
      if (content.type !== "text") throw new Error("Unexpected response type");

      const text = content.text;
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      if (start === -1 || end === -1) throw new Error("No JSON found");

      const playbook = JSON.parse(text.slice(start, end + 1));
      const merged = { ...(c.behavioral_profile ?? {}), ...playbook };

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
