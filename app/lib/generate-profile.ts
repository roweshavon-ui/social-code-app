import Anthropic from "@anthropic-ai/sdk";
import { getSupabase } from "@/app/lib/supabase";
import { BEHAVIORAL_QUESTIONS } from "@/app/(app)/questionnaire/questions";

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

export async function generateBehavioralProfile(assessmentId: string): Promise<void> {
  const { data: assessment, error } = await getSupabase()
    .from("assessments")
    .select("*")
    .eq("id", assessmentId)
    .single();

  if (error || !assessment) throw new Error("Assessment not found");

  const scorePercentages = buildScorePercentages(assessment.scores ?? {});
  const behavioralSignals = buildBehavioralSignals(assessment.answer_map ?? {});

  const prompt = `You are an expert behavioral profiler with deep knowledge of Chase Hughes' frameworks including the Six-Minute X-Ray, Human Needs Map, Six-Axis Model, and influence/persuasion methodology.

Analyze this person's assessment data and generate a comprehensive behavioral profile for their coach's private use. This is NEVER shown to the client.

PERSON DATA:
Name: ${assessment.name}
Jungian Type: ${assessment.jungian_type}
Goal they stated: ${assessment.goal ?? "Not specified"}

SCORE PERCENTAGES (calibration matters — 55% vs 92% are very different):
${scorePercentages}

BEHAVIORAL SIGNALS FROM ANSWERS:
${behavioralSignals}

Generate a JSON object with EXACTLY this structure. Be specific and tactical — every sentence written for THIS person, not a generic type.

{
  "primary_need": "one of: Significance | Approval | Acceptance | Intelligence | Pity | Strength",
  "secondary_need": "one of: Significance | Approval | Acceptance | Intelligence | Pity | Strength | None",
  "need_breakdown": "2-3 sentences on what their primary need means for how they show up socially and what they're seeking in every interaction",
  "hidden_fear": "the specific fear underneath their primary need — what they're most afraid others will think or see",
  "fear_in_session": "how this fear might show up in coaching sessions — what it looks like when triggered",
  "locus_of_control": "Internal | External | Mixed-Internal | Mixed-External",
  "locus_description": "1-2 sentences on how to frame coaching accountability with them",
  "trust_pattern": "Slow-build | Fast-open | Guarded | Selective",
  "trust_description": "how they build trust, what breaks it, what you need to do in session one to earn it",
  "compliance_style": "Authority-responsive | Logic-first | Relationship-first | Resistance-prone | Validation-seeking",
  "compliance_description": "how they respond to being guided — what makes them follow vs. resist",
  "stress_behavior": "how this person shows up under pressure — what they do, what they need, how to coach through it",
  "sensory_channel": "Visual | Auditory | Kinesthetic | Analytical",
  "communication_approach": "tactical advice on how to communicate with THIS person — pacing, language, what to emphasize, what to avoid",
  "influence_map": {
    "what_works": ["3-5 specific influence approaches that work on this profile"],
    "what_doesnt_work": ["2-3 approaches that will create resistance"],
    "decision_making_style": "how this person makes decisions — time, data, emotional safety, social proof, or permission?",
    "motivation_triggers": "the 2-3 deepest motivators that get this person to actually move"
  },
  "sales_handbook": {
    "buyer_profile": "1-2 sentences on what kind of buyer this person is",
    "likely_objections": [
      {
        "objection": "most likely objection word-for-word",
        "what_it_really_means": "real psychological reason behind it",
        "reframe": "how to reframe or preempt it",
        "language": "exact language to use in response"
      },
      {
        "objection": "second objection",
        "what_it_really_means": "real reason",
        "reframe": "how to handle",
        "language": "exact response"
      },
      {
        "objection": "third objection",
        "what_it_really_means": "real reason",
        "reframe": "how to handle",
        "language": "exact response"
      }
    ],
    "close_style": "closing approach for this profile — e.g. Logic-based assumptive | Emotional identity close | Social proof close | Urgency/scarcity | Permission-giving close",
    "what_kills_the_sale": "the specific thing NOT to say or do — be precise",
    "what_gets_them_off_fence": "the single most powerful thing that moves this profile from thinking to yes",
    "coaching_close_script": "3-5 sentence closing script for pitching 1:1 Social Code coaching to this person — use their need driver, speak to their hidden fear, frame coaching as the solution. First person as the coach.",
    "anchor_moment": "the emotional or logical anchor to plant in the first 10 minutes that makes the close easier"
  }
}

Return ONLY valid JSON. No markdown, no explanation, no code blocks.`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");

  // Extract just the JSON object — works regardless of markdown fences or extra text
  const text = content.text;
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found in response");
  const raw = text.slice(start, end + 1);
  const profile = JSON.parse(raw);

  await getSupabase()
    .from("assessments")
    .update({ behavioral_profile: profile })
    .eq("id", assessmentId);
}
