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

// ── Part 2: Sales + coaching playbook (fast, ~1400 tokens max) ──────────────
const PLAYBOOK_SCHEMA = `{
  "sales_handbook": {
    "buyer_profile": "1-2 sentences on what kind of buyer this person is",
    "likely_objections": [
      {"objection": "most likely objection","what_it_really_means": "real reason","reframe": "how to handle","language": "exact response"},
      {"objection": "second objection","what_it_really_means": "real reason","reframe": "how to handle","language": "exact response"}
    ],
    "close_style": "closing approach for this profile",
    "what_kills_the_sale": "the specific thing NOT to do",
    "what_gets_them_off_fence": "the single most powerful move",
    "coaching_close_script": "3-4 sentence close script — speak to their need and fear",
    "anchor_moment": "emotional anchor to plant in first 10 minutes"
  },
  "coaching_playbook": {
    "session_1_blueprint": "what to do in session 1 — what to establish, probe, avoid",
    "how_to_open_sessions": "best way to open every session with this person",
    "unlock_questions": ["4 exact questions that open this specific person up"],
    "when_stuck_intervention": "word-for-word language when they go quiet or resist",
    "when_spiraling_intervention": "what to say when they are overwhelmed or in their head",
    "feedback_delivery": "how to challenge this person so it lands without triggering their fear",
    "homework_style": "what assignments work for this profile and how to frame them",
    "push_vs_pull": "when to push and when to ease off — the signals to watch for",
    "progress_markers": "what real growth looks like for this person",
    "red_flags": ["3 warning signs this person is about to stall or disengage"],
    "coaching_arc": "the full arc — early sessions, mid-point, endgame for this profile"
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

  const playbookPrompt = `You are a coaching strategist using Chase Hughes' frameworks.
Generate a sales handbook and coaching playbook for this client. Be specific and tactical — this is for the coach's private use.

${context}

Return ONLY this JSON (no markdown):
${PLAYBOOK_SCHEMA}`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1400,
    messages: [{ role: "user", content: playbookPrompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");

  const text = content.text;
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON found");

  const playbook = JSON.parse(text.slice(start, end + 1));

  // Merge playbook into existing profile
  const merged = { ...(assessment.behavioral_profile ?? {}), ...playbook };

  await getSupabase()
    .from("assessments")
    .update({ behavioral_profile: merged })
    .eq("id", assessmentId);
}
