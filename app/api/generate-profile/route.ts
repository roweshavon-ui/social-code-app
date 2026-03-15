import { NextRequest, NextResponse } from "next/server";
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
  const total_ei = (scores.E ?? 0) + (scores.I ?? 0);
  const total_sn = (scores.S ?? 0) + (scores.N ?? 0);
  const total_tf = (scores.T ?? 0) + (scores.F ?? 0);
  const total_jp = (scores.J ?? 0) + (scores.P ?? 0);

  const pct = (a: number, b: number) => (a + b > 0 ? Math.round((a / (a + b)) * 100) : 50);

  return [
    `E ${pct(scores.E, scores.I)}% / I ${pct(scores.I, scores.E)}% (out of ${total_ei} questions)`,
    `S ${pct(scores.S, scores.N)}% / N ${pct(scores.N, scores.S)}% (out of ${total_sn} questions)`,
    `T ${pct(scores.T, scores.F)}% / F ${pct(scores.F, scores.T)}% (out of ${total_tf} questions)`,
    `J ${pct(scores.J, scores.P)}% / P ${pct(scores.P, scores.J)}% (out of ${total_jp} questions)`,
  ].join("\n");
}

export async function POST(req: NextRequest) {
  const { assessment_id } = await req.json();
  if (!assessment_id) return NextResponse.json({ error: "assessment_id required" }, { status: 400 });

  const { data: assessment, error } = await getSupabase()
    .from("assessments")
    .select("*")
    .eq("id", assessment_id)
    .single();

  if (error || !assessment) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
  }

  const scorePercentages = buildScorePercentages(assessment.scores ?? {});
  const behavioralSignals = buildBehavioralSignals(assessment.answer_map ?? {});

  const prompt = `You are an expert behavioral profiler. You have deep knowledge of Chase Hughes' behavioral profiling frameworks including the Six-Minute X-Ray, Human Needs Map, Six-Axis Model, and influence/persuasion methodology.

Analyze this person's assessment data and generate a comprehensive behavioral profile for their coach's private use. This profile is NEVER shown to the client — it is the coach's secret intelligence for every interaction.

PERSON DATA:
Name: ${assessment.name}
Jungian Type: ${assessment.jungian_type}
Goal they stated: ${assessment.goal ?? "Not specified"}

SCORE PERCENTAGES (the calibration matters — 55% vs 92% are very different people):
${scorePercentages}

BEHAVIORAL SIGNALS FROM ASSESSMENT ANSWERS:
${behavioralSignals}

Generate a JSON object with EXACTLY this structure. Be specific, tactical, and genuinely useful for a coach. No generic filler — every sentence should feel like it was written specifically for THIS person based on their data.

{
  "primary_need": "one of: Significance | Approval | Acceptance | Intelligence | Pity | Strength",
  "secondary_need": "one of: Significance | Approval | Acceptance | Intelligence | Pity | Strength | None",
  "need_breakdown": "2-3 sentences: what their primary need means for HOW they show up socially, what they're actually seeking in every interaction, and what this tells you about their core wound or driver",
  "hidden_fear": "the specific fear that lives underneath their primary need — what they're most afraid others will think or see",
  "fear_in_session": "how this fear might show up in your coaching sessions — what it looks like when it gets triggered",
  "locus_of_control": "Internal | External | Mixed-Internal | Mixed-External",
  "locus_description": "1-2 sentences on what their locus of control means for how they take (or avoid) responsibility, and how to frame coaching accountability with them",
  "trust_pattern": "Slow-build | Fast-open | Guarded | Selective",
  "trust_description": "how they build trust, what breaks it, and what you need to do in the first session to earn it",
  "compliance_style": "Authority-responsive | Logic-first | Relationship-first | Resistance-prone | Validation-seeking",
  "compliance_description": "how they respond to being directed or guided — what makes them follow vs. resist",
  "stress_behavior": "how this specific person shows up under pressure — what they do, what they need, and how to coach them through it",
  "sensory_channel": "Visual | Auditory | Kinesthetic | Analytical",
  "communication_approach": "specific tactical advice on how to communicate with THIS person — pacing, language style, what to emphasize, what to avoid",
  "influence_map": {
    "what_works": ["3-5 specific influence approaches that work on this profile — be tactical and specific"],
    "what_doesnt_work": ["2-3 approaches that will shut this person down or create resistance"],
    "decision_making_style": "how this person makes decisions — do they need time, data, emotional safety, social proof, or permission?",
    "motivation_triggers": "the 2-3 deepest motivators that get this person to actually move and take action"
  },
  "sales_handbook": {
    "buyer_profile": "1-2 sentences on what kind of buyer this person is — are they analytical, emotional, impulsive, cautious, social-proof driven, etc.",
    "likely_objections": [
      {
        "objection": "the most likely objection they will raise word-for-word",
        "what_it_really_means": "the real psychological reason behind this objection",
        "reframe": "how to reframe or preempt this objection",
        "language": "exact language or phrasing to use in response"
      },
      {
        "objection": "second most likely objection",
        "what_it_really_means": "the real reason behind it",
        "reframe": "how to handle it",
        "language": "exact response language"
      },
      {
        "objection": "third objection",
        "what_it_really_means": "real reason",
        "reframe": "how to handle",
        "language": "exact language"
      }
    ],
    "close_style": "the closing approach that fits this profile — e.g. Logic-based assumptive | Emotional identity close | Social proof close | Urgency/scarcity | Permission-giving close",
    "what_kills_the_sale": "the specific thing NOT to say or do that will lose this person — be precise",
    "what_gets_them_off_fence": "the single most powerful thing that moves this profile from 'thinking about it' to 'yes'",
    "coaching_close_script": "a 3-5 sentence closing script specifically for pitching your 1:1 Social Code coaching offer to this person — use their need driver, speak to their hidden fear, and frame coaching as the solution. Written in first person as the coach speaking.",
    "anchor_moment": "the emotional or logical anchor to plant early in the call that makes the close easier — something to establish in the first 10 minutes"
  }
}

Return ONLY valid JSON. No markdown, no explanation, no code blocks. Just the JSON object.`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    const profile = JSON.parse(content.text);

    await getSupabase()
      .from("assessments")
      .update({ behavioral_profile: profile })
      .eq("id", assessment_id);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Profile generation failed:", e);
    return NextResponse.json({ error: "Profile generation failed" }, { status: 500 });
  }
}
