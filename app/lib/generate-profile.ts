import Anthropic from "@anthropic-ai/sdk";
import { getSupabase } from "@/app/lib/supabase";
import { BEHAVIORAL_QUESTIONS } from "@/app/(app)/questionnaire/questions";
import { TYPE_PROFILES } from "@/app/lib/mbtiData";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

function buildBehavioralSignals(answerMap: Record<string, "a" | "b">): string {
  const signals: string[] = [];
  for (const q of BEHAVIORAL_QUESTIONS) {
    const answer = answerMap[String(q.id)];
    if (!answer) continue;
    const signal = answer === "a" ? q.a.signal : q.b.signal;
    signals.push(`Q${q.id}: ${signal} ("${answer === "a" ? q.a.label : q.b.label}")`);
  }
  return signals.join("\n");
}

function buildScorePercentages(scores: Record<string, number>): string {
  const pct = (a: number, b: number) => (a + b > 0 ? Math.round((a / (a + b)) * 100) : 50);
  return [
    `E ${pct(scores.E, scores.I)}% / I ${pct(scores.I, scores.E)}%`,
    `S ${pct(scores.S, scores.N)}% / N ${pct(scores.N, scores.S)}%`,
    `T ${pct(scores.T, scores.F)}% / F ${pct(scores.F, scores.T)}%`,
    `J ${pct(scores.J, scores.P)}% / P ${pct(scores.P, scores.J)}%`,
  ].join("\n");
}

function buildTypeContext(jungianType: string): string {
  const tp = TYPE_PROFILES[jungianType];
  if (!tp) return "";
  return `TYPE: ${jungianType} — Social Style: ${tp.socialStyle} | Comm Tip: ${tp.communicationTip}`;
}

// ── Part 1: Core profile (fast, ~1400 tokens max) ──────────────────────────
const CORE_SCHEMA = `{
  "primary_need": "one of: Significance | Approval | Acceptance | Intelligence | Pity | Strength",
  "secondary_need": "one of: Significance | Approval | Acceptance | Intelligence | Pity | Strength | None",
  "need_breakdown": "2 sentences — what their primary need means for how they show up socially",
  "hidden_fear": "the specific fear underneath their primary need",
  "fear_in_session": "how this fear shows up in coaching — what it looks like when triggered",
  "locus_of_control": "Internal | External | Mixed-Internal | Mixed-External",
  "locus_description": "1 sentence on how to frame coaching accountability with them",
  "trust_pattern": "Slow-build | Fast-open | Guarded | Selective",
  "trust_description": "how they build trust and what breaks it",
  "compliance_style": "Authority-responsive | Logic-first | Relationship-first | Resistance-prone | Validation-seeking",
  "compliance_description": "how they respond to being guided — what makes them follow vs. resist",
  "stress_behavior": "how this person shows up under pressure",
  "sensory_channel": "Visual | Auditory | Kinesthetic | Analytical",
  "communication_approach": "tactical advice on how to communicate with this person",
  "influence_map": {
    "what_works": ["3 specific influence approaches that work on this profile"],
    "what_doesnt_work": ["2 approaches that create resistance"],
    "decision_making_style": "how this person makes decisions",
    "motivation_triggers": "the 2 deepest motivators that get this person to actually move"
  }
}`;

// ── Part 2a: Sales handbook (~700 tokens max) ────────────────────────────────
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

// ── Part 2b: Per-session action plan (~700 tokens max) ───────────────────────
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

// ── Part 2c: Coaching tactics (~500 tokens max) ───────────────────────────────
const COACHING_TACTICS_SCHEMA = `{
  "coaching_playbook_tactics": {
    "when_stuck": "word-for-word script when they go quiet, deflect, or resist",
    "when_spiraling": "exact script when they are overwhelmed or in their head",
    "feedback_delivery": "how to challenge this person so it lands without triggering their fear",
    "homework_style": "what assignments work and how to frame them for this profile",
    "red_flags": ["warning sign 1 + what to do","warning sign 2 + what to do","warning sign 3 + what to do"]
  }
}`;

export async function generateBehavioralProfile(assessmentId: string): Promise<void> {
  const { data: assessment, error } = await getSupabase()
    .from("assessments")
    .select("*")
    .eq("id", assessmentId)
    .single();

  if (error || !assessment) {
    throw new Error(`Assessment not found: id=${assessmentId}`);
  }

  const scorePercentages = buildScorePercentages(assessment.scores ?? {});
  const behavioralSignals = buildBehavioralSignals(assessment.answer_map ?? {});
  const typeContext = buildTypeContext(assessment.jungian_type);

  const context = `Name: ${assessment.name} | Type: ${assessment.jungian_type}
Goal: ${assessment.goal ?? "Not specified"}
Scores: ${scorePercentages}
${typeContext}
${behavioralSignals ? `Behavioral signals:\n${behavioralSignals}` : ""}`;

  const corePrompt = `You are a behavioral profiler using Chase Hughes' frameworks.
Analyze this assessment and return a core behavioral profile. Every field must be specific to THIS person.

${context}

Return ONLY this JSON (no markdown):
${CORE_SCHEMA}`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1400,
    messages: [{ role: "user", content: corePrompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");

  const text = content.text;
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON found in response");

  const profile = JSON.parse(text.slice(start, end + 1));

  await getSupabase()
    .from("assessments")
    .update({ behavioral_profile: profile })
    .eq("id", assessmentId);
}

export async function generateCoachingPlaybook(assessmentId: string): Promise<void> {
  const { data: assessment, error } = await getSupabase()
    .from("assessments")
    .select("*")
    .eq("id", assessmentId)
    .single();

  if (error || !assessment) throw new Error(`Assessment not found: id=${assessmentId}`);

  const tp = TYPE_PROFILES[assessment.jungian_type];
  const typeExtra = tp
    ? `Red flags for this type: ${tp.redFlags.join(", ")}\nSession questions: ${tp.sessionQuestions.slice(0, 3).join(" | ")}`
    : "";

  const context = `Name: ${assessment.name} | Type: ${assessment.jungian_type}
Goal: ${assessment.goal ?? "Not specified"}
Primary need: ${assessment.behavioral_profile?.primary_need ?? "Unknown"}
Hidden fear: ${assessment.behavioral_profile?.hidden_fear ?? "Unknown"}
Trust pattern: ${assessment.behavioral_profile?.trust_pattern ?? "Unknown"}
${typeExtra}`;

  const base = `You are a coaching strategist using Chase Hughes' frameworks. Be specific and tactical — coach's private use only.\n\n${context}\n\nReturn ONLY this JSON (no markdown):\n`;

  // Prefill forces model to start with { immediately — no wasted tokens on preamble
  async function callHaiku(prompt: string, max_tokens: number) {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens,
      messages: [
        { role: "user", content: prompt },
        { role: "assistant", content: "{" },
      ],
    });
    const c = msg.content[0];
    if (c.type !== "text") throw new Error("Unexpected response type");
    const text = "{" + c.text;
    const end = text.lastIndexOf("}");
    if (end === -1) throw new Error(`JSON truncated — got: "${text.slice(0, 300)}"`);
    return JSON.parse(text.slice(0, end + 1));
  }

  // 3 parallel calls — each capped small, run simultaneously (~3-5s wall time)
  const [salesResult, sessionResult, tacticsResult] = await Promise.all([
    callHaiku(base + SALES_SCHEMA, 700),
    callHaiku(base + SESSION_ACTIONS_SCHEMA, 1000),
    callHaiku(base + COACHING_TACTICS_SCHEMA, 700),
  ]);

  const coaching_playbook = {
    ...sessionResult.coaching_playbook,
    ...tacticsResult.coaching_playbook_tactics,
  };

  const merged = { ...(assessment.behavioral_profile ?? {}), ...salesResult, coaching_playbook };

  await getSupabase()
    .from("assessments")
    .update({ behavioral_profile: merged })
    .eq("id", assessmentId);
}
