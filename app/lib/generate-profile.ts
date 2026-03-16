import Anthropic from "@anthropic-ai/sdk";
import { getSupabase } from "@/app/lib/supabase";
import { BEHAVIORAL_QUESTIONS } from "@/app/(app)/questionnaire/questions";
import { TYPE_PROFILES } from "@/app/lib/mbtiData";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

// ── Single-call full schema — everything flattened, no arrays ────────────────
// Arrays are reconstructed after parsing. All values max 10-15 words to fit
// the entire profile in ~900 output tokens (safe under Vercel 10s limit).
const FULL_SCHEMA = `{
  "primary_need": "one of: Significance | Approval | Acceptance | Intelligence | Pity | Strength",
  "secondary_need": "one of: Significance | Approval | Acceptance | Intelligence | Pity | Strength | None",
  "need_breakdown": "max 15 words on what their primary need means socially",
  "hidden_fear": "max 12 words: the fear underneath their primary need",
  "fear_in_session": "max 12 words: how this fear shows up in coaching",
  "locus_of_control": "Internal | External | Mixed-Internal | Mixed-External",
  "locus_description": "max 12 words: how to frame coaching accountability with them",
  "trust_pattern": "Slow-build | Fast-open | Guarded | Selective",
  "trust_description": "max 12 words: how they build trust and what breaks it",
  "compliance_style": "Authority-responsive | Logic-first | Relationship-first | Resistance-prone | Validation-seeking",
  "compliance_description": "max 12 words: what makes them follow vs resist",
  "stress_behavior": "max 12 words: how this person shows up under pressure",
  "sensory_channel": "Visual | Auditory | Kinesthetic | Analytical",
  "communication_approach": "max 15 words: tactical communication advice for this person",
  "what_works_1": "max 10 words: influence approach that works",
  "what_works_2": "max 10 words: second influence approach",
  "what_works_3": "max 10 words: third influence approach",
  "what_doesnt_1": "max 10 words: approach that creates resistance",
  "what_doesnt_2": "max 10 words: second approach that backfires",
  "decision_making_style": "max 12 words: how this person makes decisions",
  "motivation_triggers": "max 15 words: the 2 deepest motivators",
  "buyer_profile": "max 12 words: buyer type summary",
  "obj1": "max 8 words", "obj1_means": "max 8 words", "obj1_reframe": "max 10 words", "obj1_say": "max 12 words",
  "obj2": "max 8 words", "obj2_means": "max 8 words", "obj2_reframe": "max 10 words", "obj2_say": "max 12 words",
  "close_style": "max 8 words: closing approach",
  "what_kills_the_sale": "max 12 words",
  "what_gets_them_off_fence": "max 12 words",
  "coaching_close_script": "max 20 words: 2-sentence close script",
  "anchor_moment": "max 12 words: emotional anchor for first 10 minutes",
  "how_to_open_sessions": "max 15 words: exact opening question",
  "unlock_q1": "max 12 words", "unlock_q2": "max 12 words", "unlock_q3": "max 12 words",
  "s1_goal": "max 8 words", "s1_do": "max 10 words", "s1_avoid": "max 8 words",
  "s23_goal": "max 8 words", "s23_do": "max 10 words", "s23_avoid": "max 8 words",
  "s46_goal": "max 8 words", "s46_do": "max 10 words", "s46_avoid": "max 8 words",
  "s7_goal": "max 8 words", "s7_do": "max 10 words", "s7_avoid": "max 8 words",
  "when_stuck": "max 20 words: exact script to use",
  "when_spiraling": "max 20 words: exact script to use",
  "feedback_delivery": "max 15 words: how to challenge without triggering fear",
  "homework_style": "max 12 words: what assignments work for this profile",
  "red_flag_1": "max 12 words: warning sign + what to do",
  "red_flag_2": "max 12 words: warning sign + what to do",
  "red_flag_3": "max 12 words: warning sign + what to do"
}`;

function repairJson(raw: string): string {
  return raw.replace(/"((?:[^"\\]|\\.)*)"/g, (_, inner) =>
    `"${inner.replace(/\n/g, " ").replace(/\r/g, "")}"`
  );
}

function parseFlat(flat: Record<string, string>) {
  return {
    primary_need: flat.primary_need,
    secondary_need: flat.secondary_need,
    need_breakdown: flat.need_breakdown,
    hidden_fear: flat.hidden_fear,
    fear_in_session: flat.fear_in_session,
    locus_of_control: flat.locus_of_control,
    locus_description: flat.locus_description,
    trust_pattern: flat.trust_pattern,
    trust_description: flat.trust_description,
    compliance_style: flat.compliance_style,
    compliance_description: flat.compliance_description,
    stress_behavior: flat.stress_behavior,
    sensory_channel: flat.sensory_channel,
    communication_approach: flat.communication_approach,
    influence_map: {
      what_works: [flat.what_works_1, flat.what_works_2, flat.what_works_3].filter(Boolean),
      what_doesnt_work: [flat.what_doesnt_1, flat.what_doesnt_2].filter(Boolean),
      decision_making_style: flat.decision_making_style,
      motivation_triggers: flat.motivation_triggers,
    },
    sales_handbook: {
      buyer_profile: flat.buyer_profile,
      likely_objections: [
        { objection: flat.obj1, what_it_really_means: flat.obj1_means, reframe: flat.obj1_reframe, language: flat.obj1_say },
        { objection: flat.obj2, what_it_really_means: flat.obj2_means, reframe: flat.obj2_reframe, language: flat.obj2_say },
      ].filter(o => o.objection),
      close_style: flat.close_style,
      what_kills_the_sale: flat.what_kills_the_sale,
      what_gets_them_off_fence: flat.what_gets_them_off_fence,
      coaching_close_script: flat.coaching_close_script,
      anchor_moment: flat.anchor_moment,
    },
    coaching_playbook: {
      how_to_open_sessions: flat.how_to_open_sessions,
      unlock_questions: [flat.unlock_q1, flat.unlock_q2, flat.unlock_q3].filter(Boolean),
      session_actions: [
        { session: "Session 1", goal: flat.s1_goal, do_this: flat.s1_do, avoid: flat.s1_avoid },
        { session: "Sessions 2-3", goal: flat.s23_goal, do_this: flat.s23_do, avoid: flat.s23_avoid },
        { session: "Sessions 4-6", goal: flat.s46_goal, do_this: flat.s46_do, avoid: flat.s46_avoid },
        { session: "Sessions 7+", goal: flat.s7_goal, do_this: flat.s7_do, avoid: flat.s7_avoid },
      ].filter(s => s.goal),
      when_stuck: flat.when_stuck,
      when_spiraling: flat.when_spiraling,
      feedback_delivery: flat.feedback_delivery,
      homework_style: flat.homework_style,
      red_flags: [flat.red_flag_1, flat.red_flag_2, flat.red_flag_3].filter(Boolean),
    },
  };
}

async function callHaiku(prompt: string): Promise<Record<string, string>> {
  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1400,
    messages: [
      { role: "user", content: prompt },
      { role: "assistant", content: "{" },
    ],
  });
  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");
  const raw = "{" + content.text;
  const end = raw.lastIndexOf("}");
  if (end === -1) throw new Error(`JSON truncated — got: "${raw.slice(0, 300)}"`);
  return JSON.parse(repairJson(raw.slice(0, end + 1)));
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildBehavioralSignals(answerMap: Record<string, "a" | "b">): string {
  const signals: string[] = [];
  for (const q of BEHAVIORAL_QUESTIONS) {
    const answer = answerMap[String(q.id)];
    if (!answer) continue;
    const signal = answer === "a" ? q.a.signal : q.b.signal;
    signals.push(`Q${q.id}: ${signal}`);
  }
  return signals.join(" | ");
}

function buildScorePercentages(scores: Record<string, number>): string {
  const pct = (a: number, b: number) => (a + b > 0 ? Math.round((a / (a + b)) * 100) : 50);
  return `E${pct(scores.E, scores.I)}% I${pct(scores.I, scores.E)}% S${pct(scores.S, scores.N)}% N${pct(scores.N, scores.S)}% T${pct(scores.T, scores.F)}% F${pct(scores.F, scores.T)}% J${pct(scores.J, scores.P)}% P${pct(scores.P, scores.J)}%`;
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function generateBehavioralProfile(assessmentId: string): Promise<void> {
  const { data: assessment, error } = await getSupabase()
    .from("assessments")
    .select("*")
    .eq("id", assessmentId)
    .single();

  if (error || !assessment) throw new Error(`Assessment not found: id=${assessmentId}`);

  const tp = TYPE_PROFILES[assessment.jungian_type];
  const typeExtra = tp ? ` | Social style: ${tp.socialStyle}` : "";
  const scores = buildScorePercentages(assessment.scores ?? {});
  const signals = buildBehavioralSignals(assessment.answer_map ?? {});

  const prompt = `You are a behavioral profiler and coaching strategist using Chase Hughes' frameworks. Coach's private use only — never shown to client. STRICT: every value must obey its word limit exactly. Exceeding limits causes truncation and data loss.

${assessment.name} | ${assessment.jungian_type}${typeExtra}
Goal: ${assessment.goal ?? "Not specified"}
Scores: ${scores}${signals ? `\nSignals: ${signals}` : ""}

Return ONLY this JSON (no markdown, no explanation):
${FULL_SCHEMA}`;

  const flat = await callHaiku(prompt);
  const profile = parseFlat(flat);

  await getSupabase()
    .from("assessments")
    .update({ behavioral_profile: profile })
    .eq("id", assessmentId);
}

export async function generateClientFullProfile(clientId: string): Promise<void> {
  const { data: c, error } = await getSupabase()
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .single();

  if (error || !c) throw new Error("Client not found");

  const tp = TYPE_PROFILES[c.jungian_type];
  const typeExtra = tp ? ` | Social style: ${tp.socialStyle}` : "";

  const prompt = `You are a behavioral profiler and coaching strategist using Chase Hughes' frameworks. Coach's private use only — never shown to client. STRICT: every value must obey its word limit exactly. Exceeding limits causes truncation and data loss.

${c.name} | ${c.jungian_type ?? "Unknown"}${typeExtra}
Goal: ${c.goal ?? "Not specified"}
Notes: ${c.notes ?? "None"}

Return ONLY this JSON (no markdown, no explanation):
${FULL_SCHEMA}`;

  const flat = await callHaiku(prompt);
  const profile = parseFlat(flat);

  await getSupabase()
    .from("clients")
    .update({ behavioral_profile: profile })
    .eq("id", clientId);
}

// Legacy — kept for backward compat, just re-runs full profile generation
export async function generateCoachingPlaybook(assessmentId: string): Promise<void> {
  await generateBehavioralProfile(assessmentId);
}
