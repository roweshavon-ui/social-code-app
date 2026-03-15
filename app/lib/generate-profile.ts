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

// ── Part 2a: Sales handbook (~800 tokens max) ────────────────────────────────
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

// ── Part 2b: Coaching playbook (~700 tokens max) ──────────────────────────────
const COACHING_SCHEMA = `{
  "coaching_playbook": {
    "how_to_open_sessions": "1-sentence question",
    "unlock_questions": ["q1","q2","q3"],
    "session_actions": [
      {"session": "Session 1", "goal": "short", "do_this": "1 sentence", "avoid": "short"},
      {"session": "Sessions 2-4", "goal": "short", "do_this": "1 sentence", "avoid": "short"},
      {"session": "Sessions 5+", "goal": "short", "do_this": "1 sentence", "avoid": "short"}
    ],
    "when_stuck": "1-sentence script",
    "when_spiraling": "1-sentence script",
    "feedback_delivery": "short",
    "homework_style": "short",
    "red_flags": ["flag 1","flag 2","flag 3"]
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

  async function callHaiku(prompt: string, max_tokens: number) {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens,
      messages: [{ role: "user", content: prompt }],
    });
    const c = msg.content[0];
    if (c.type !== "text") throw new Error("Unexpected response type");
    const start = c.text.indexOf("{");
    const end = c.text.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("No JSON found");
    return JSON.parse(c.text.slice(start, end + 1));
  }

  // Two small parallel calls — each fits well within token + time limits
  const [salesResult, coachingResult] = await Promise.all([
    callHaiku(base + SALES_SCHEMA, 800),
    callHaiku(base + COACHING_SCHEMA, 750),
  ]);

  const merged = { ...(assessment.behavioral_profile ?? {}), ...salesResult, ...coachingResult };

  await getSupabase()
    .from("assessments")
    .update({ behavioral_profile: merged })
    .eq("id", assessmentId);
}
