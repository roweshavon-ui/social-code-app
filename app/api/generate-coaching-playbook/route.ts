import { NextRequest, NextResponse } from "next/server";
import { generateCoachingPlaybook } from "@/app/lib/generate-profile";
import { getSupabase } from "@/app/lib/supabase";
import Anthropic from "@anthropic-ai/sdk";
import { TYPE_PROFILES } from "@/app/lib/mbtiData";

export const maxDuration = 30;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

// Call 1: Sales handbook (~700 tokens)
const SALES_SCHEMA = `{
  "sales_handbook": {
    "buyer_profile": "1-2 sentences on what kind of buyer this person is",
    "likely_objections": [
      {"objection": "most likely objection","what_it_really_means": "real reason","reframe": "how to handle","language": "exact 1-sentence response"},
      {"objection": "second objection","what_it_really_means": "real reason","reframe": "how to handle","language": "exact 1-sentence response"}
    ],
    "close_style": "closing approach for this profile",
    "what_kills_the_sale": "the specific thing NOT to do",
    "what_gets_them_off_fence": "the single most powerful move",
    "coaching_close_script": "2-sentence close script",
    "anchor_moment": "emotional anchor to plant in first 10 minutes"
  }
}`;

// Call 2: Per-session action plan — flat fields, no arrays (arrays cause comma/truncation errors)
const SESSION_ACTIONS_SCHEMA = `{
  "coaching_playbook": {
    "how_to_open_sessions": "exact opening question",
    "unlock_q1": "question 1",
    "unlock_q2": "question 2",
    "unlock_q3": "question 3",
    "s1_goal": "Session 1 goal", "s1_do": "Session 1 exact actions", "s1_avoid": "Session 1 what not to do",
    "s23_goal": "Sessions 2-3 goal", "s23_do": "Sessions 2-3 exact actions", "s23_avoid": "Sessions 2-3 what not to do",
    "s46_goal": "Sessions 4-6 goal", "s46_do": "Sessions 4-6 exact actions", "s46_avoid": "Sessions 4-6 what not to do",
    "s7_goal": "Sessions 7+ goal", "s7_do": "Sessions 7+ exact actions", "s7_avoid": "Sessions 7+ what not to do"
  }
}`;

// Call 3: Coaching tactics — flat fields, no arrays
const COACHING_TACTICS_SCHEMA = `{
  "coaching_playbook_tactics": {
    "when_stuck": "word-for-word script when they go quiet or resist",
    "when_spiraling": "exact script when they are overwhelmed",
    "feedback_delivery": "how to challenge this person without triggering their fear",
    "homework_style": "what assignments work for this profile",
    "red_flag_1": "warning sign 1 + what to do",
    "red_flag_2": "warning sign 2 + what to do",
    "red_flag_3": "warning sign 3 + what to do"
  }
}`;

// Prefill forces model to start with { immediately — no wasted tokens on preamble
async function callHaiku(prompt: string, max_tokens: number) {
  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens,
    messages: [
      { role: "user", content: prompt },
      { role: "assistant", content: "{" },
    ],
  });
  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");
  const text = "{" + content.text;
  const end = text.lastIndexOf("}");
  if (end === -1) throw new Error(`JSON truncated — got: "${text.slice(0, 300)}"`);
  return JSON.parse(text.slice(0, end + 1));
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

      // 3 parallel calls — each small, all finish well within 10s
      const [salesResult, sessionResult, tacticsResult] = await Promise.all([
        callHaiku(base + SALES_SCHEMA, 700),
        callHaiku(base + SESSION_ACTIONS_SCHEMA, 1000),
        callHaiku(base + COACHING_TACTICS_SCHEMA, 700),
      ]);

      // Reconstruct arrays from flat fields, merge everything
      const sp = sessionResult.coaching_playbook ?? {};
      const tact = tacticsResult.coaching_playbook_tactics ?? {};
      const coaching_playbook = {
        how_to_open_sessions: sp.how_to_open_sessions,
        unlock_questions: [sp.unlock_q1, sp.unlock_q2, sp.unlock_q3].filter(Boolean),
        session_actions: [
          { session: "Session 1", goal: sp.s1_goal, do_this: sp.s1_do, avoid: sp.s1_avoid },
          { session: "Sessions 2-3", goal: sp.s23_goal, do_this: sp.s23_do, avoid: sp.s23_avoid },
          { session: "Sessions 4-6", goal: sp.s46_goal, do_this: sp.s46_do, avoid: sp.s46_avoid },
          { session: "Sessions 7+", goal: sp.s7_goal, do_this: sp.s7_do, avoid: sp.s7_avoid },
        ].filter(s => s.goal),
        when_stuck: tact.when_stuck,
        when_spiraling: tact.when_spiraling,
        feedback_delivery: tact.feedback_delivery,
        homework_style: tact.homework_style,
        red_flags: [tact.red_flag_1, tact.red_flag_2, tact.red_flag_3].filter(Boolean),
      };

      const merged = {
        ...(c.behavioral_profile ?? {}),
        ...salesResult,
        coaching_playbook,
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
