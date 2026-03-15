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

// Call 2: Per-session action plan (~700 tokens)
const SESSION_ACTIONS_SCHEMA = `{
  "coaching_playbook": {
    "how_to_open_sessions": "exact opening question to use at the start of every session",
    "unlock_questions": ["exact question 1","exact question 2","exact question 3","exact question 4"],
    "session_actions": [
      {"session": "Session 1", "goal": "what to establish", "do_this": "exact things to do and say", "avoid": "what not to do"},
      {"session": "Sessions 2-3", "goal": "what to build", "do_this": "exact things to do and say", "avoid": "what not to do"},
      {"session": "Sessions 4-6", "goal": "what to push on", "do_this": "exact things to do and say", "avoid": "what not to do"},
      {"session": "Sessions 7+", "goal": "endgame", "do_this": "exact things to do and say", "avoid": "what not to do"}
    ]
  }
}`;

// Call 3: Coaching tactics (~500 tokens)
const COACHING_TACTICS_SCHEMA = `{
  "coaching_playbook_tactics": {
    "when_stuck": "word-for-word script when they go quiet, deflect, or resist",
    "when_spiraling": "exact script when they are overwhelmed or in their head",
    "feedback_delivery": "how to challenge this person so it lands without triggering their fear",
    "homework_style": "what assignments work and how to frame them for this profile",
    "red_flags": ["warning sign 1 + what to do","warning sign 2 + what to do","warning sign 3 + what to do"]
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

      // Merge tactics into coaching_playbook object
      const coaching_playbook = {
        ...sessionResult.coaching_playbook,
        ...tacticsResult.coaching_playbook_tactics,
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
