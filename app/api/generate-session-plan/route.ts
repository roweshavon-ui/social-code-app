import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabase } from "@/app/lib/supabase";

export const maxDuration = 30;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const FRAMEWORKS: Record<string, string> = {
  "SPARK": `SPARK — Starting Conversations
How to use: S-tarter (open with a situational observation about your shared environment), P-erson (shift to a light comment about them specifically), A-sk (one open-ended question to hand them the thread), R-eflect (mirror back what they just said to show you were listening), K-eep going (follow the thread wherever it goes, don't pre-plan).
Purpose: Eliminates the freeze before approaching. Gives a repeatable structure so the brain stops stalling on "what do I say."
Common block this solves: Overthinking the opener. Waiting for the "perfect" moment that never comes.
Key coaching point: The Starter doesn't have to be clever. It just has to be real. Situational observations work because they're shared — both people are in the same room.`,

  "3-Second Social Scan": `3-Second Social Scan — Reading Whether Someone Wants to Be Approached
How to use: Before approaching, scan for 3 signals in 3 seconds — (1) Eye contact or glance in your direction, (2) Open body language (facing outward, not deep in conversation), (3) Available/unoccupied (not on phone, not mid-task). If 2 of 3 are present, the window is open.
Purpose: Separates approach anxiety (imagined rejection) from actual social unavailability. Gives permission to act on real signals instead of guessing.
Common block this solves: Convincing yourself "they don't want to talk" when you haven't actually read the room.
Key coaching point: The scan is about data, not mind-reading. You're not deciding if they'll like you. You're reading if the window is open.`,

  "Fearless Approach System": `Fearless Approach System (FAS) — Overcoming Approach Anxiety
How to use: Five-component system run in order — (1) Permission Slip: internal reframe before approaching ("I'm allowed to talk to people, I don't need a reason"), (2) Target Selection: use the 3-Second Social Scan, (3) Approach Window: move within 3 seconds of deciding — hesitation is the enemy, (4) Opening: use SPARK, (5) Exit Strategy: have a graceful out ready ("I'll let you get back to it") so you never feel trapped.
Purpose: Full end-to-end system for people who freeze, avoid, or overthink before any social initiation.
Common block this solves: The full cycle of approach anxiety — the physical freeze, the internal narrative, the missed window, the post-event replay.
Key coaching point: The Permission Slip is the most important piece. Most approach anxiety is a permission problem, not a skill problem.`,

  "TALK Check": `TALK Check — Delivery Layer for Any Interaction
How to use: T-one (is your tone warm and inviting or flat and monotone?), A-ttention (are you actually present — eye contact, body facing them?), L-anguage (matching their vocabulary, avoiding filler words?), K-inetics (body language, proximity, gestures — open and calibrated?).
Purpose: Most people focus on what to say. TALK Check fixes how they're saying it. Tone and body language carry 70% of the message.
Common block this solves: Saying the right words but still not landing. Coming across as nervous, cold, robotic, or low-energy.
Key coaching point: Tone is the first signal people receive. If the tone is off, nothing else matters. Start there.`,

  "BRAVE": `BRAVE — Navigating Difficult Conversations
How to use: B-reak the pattern (acknowledge the tension upfront), R-eason (state why you're bringing it up), A-sk (what they think/feel before stating your position), V-alidate (their perspective before responding), E-nd with action (agree on a concrete next step).
Purpose: Gives a structure for confrontation-avoidant people to have conversations they've been avoiding.
Common block this solves: Letting things fester, passive-aggressive patterns, ghosting instead of addressing issues.
Key coaching point: The Break step is what most people skip. Naming the tension upfront changes the entire dynamic.`,

  "SHIELD": `SHIELD — Handling Difficult People and Energy Drains
How to use: S-ee it coming (recognize the pattern), H-old your frame (don't react emotionally), I-solate the behavior (name what's happening without attacking), E-xit or engage (conscious choice), L-og it (track patterns), D-etach from outcome (control your response, not theirs).
Purpose: For clients who consistently find themselves drained, manipulated, or reactive around specific people.
Common block this solves: Feeling powerless around difficult people, taking the bait, walking away feeling worse every time.
Key coaching point: The power move is not reacting. The moment you react emotionally, you've handed them control.`,

  "Stop Replaying": `Stop Replaying — Breaking the Post-Social Overthink Loop
How to use: (1) Interrupt (physical pattern break — stand up, say "stop" out loud, change environments), (2) Reframe (what actually happened vs. the story you're telling), (3) Release (deliberate closure ritual — write it down and close the notebook, then do something requiring present attention).
Purpose: For clients stuck in post-social analysis paralysis.
Common block this solves: Replaying conversations for hours or days, finding evidence of embarrassment, pre-living future situations as disasters.
Key coaching point: The Interrupt has to be physical. You can't think your way out of the loop. Break the pattern with your body first.`,
};

export async function POST(req: NextRequest) {
  const { profile, name, jungian_type, client_id, session_number, coach_note, mode, framework, custom_topic } = await req.json();

  if (!profile || !name) {
    return NextResponse.json({ error: "profile and name required" }, { status: 400 });
  }

  // Fetch session history if client_id provided
  let sessionHistory: Record<string, unknown>[] = [];
  let lastSessionBrief: string | null = null;

  if (client_id) {
    const { data: sessions } = await getSupabase()
      .from("sessions")
      .select("*")
      .eq("client_id", client_id)
      .order("session_number", { ascending: true });

    if (sessions && sessions.length > 0) {
      sessionHistory = sessions.map((s) => ({
        session: s.session_number,
        type: s.session_type,
        date: s.date,
        engagement: s.client_engagement,
        homework_completion: s.homework_completion,
        homework_assigned: s.homework_assigned,
        frameworks_used: s.frameworks_used,
        overview: s.notes,
        breakthrough: s.breakthrough_moment,
        observations: s.coach_observations,
        rating: s.rating,
      }));

      const last = sessions[sessions.length - 1];
      lastSessionBrief = [
        `Session ${last.session_number} (${last.date}):`,
        last.notes ? `Overview: ${last.notes}` : null,
        last.homework_assigned ? `Homework assigned: ${last.homework_assigned}` : null,
        last.homework_completion !== "none" ? `Homework completion this session: ${last.homework_completion}` : null,
        last.client_engagement ? `Engagement: ${last.client_engagement}` : null,
        last.breakthrough_moment ? `Breakthrough: ${last.breakthrough_moment}` : null,
      ].filter(Boolean).join("\n");
    }
  }

  const isIntake = (session_number ?? 1) === 1 && sessionHistory.length === 0;

  const frameworkSection = mode === "framework" && framework
    ? `FRAMEWORK TO TEACH THIS SESSION: ${framework}\n\n${FRAMEWORKS[framework] ?? ""}`
    : mode === "custom" && custom_topic
    ? `CUSTOM TOPIC FOR THIS SESSION: ${custom_topic}\n\nThis topic is not covered by a specific Social Code framework. Build the session around this specific issue using the client's profile.`
    : isIntake
    ? "This is the INTAKE SESSION — no framework or topic. Focus entirely on discovery, relationship building, goal alignment, and setting the coaching foundation."
    : "No specific framework or topic set — build the session based on where this client is in their arc using their profile and session history.";

  const historySection = sessionHistory.length > 0
    ? `\nSESSION HISTORY (${sessionHistory.length} session${sessionHistory.length !== 1 ? "s" : ""} logged):\n${JSON.stringify(sessionHistory, null, 2)}`
    : "\nSESSION HISTORY: No sessions logged yet — this is the first session.";

  const lastSessionSection = lastSessionBrief
    ? `\nSINCE LAST SESSION:\n${lastSessionBrief}`
    : "";

  const prompt = isIntake
    ? buildIntakePrompt(name, jungian_type, profile, frameworkSection)
    : buildOngoingPrompt(name, jungian_type, profile, session_number, coach_note, frameworkSection, historySection, lastSessionSection);

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 6000,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    const text = content.text;
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("No JSON found in response");

    const plan = JSON.parse(text.slice(start, end + 1));
    return NextResponse.json({ plan, isIntake, lastSessionBrief });
  } catch (e) {
    console.error("Session plan generation failed:", e);
    return NextResponse.json({ error: "Session plan generation failed" }, { status: 500 });
  }
}

function buildIntakePrompt(name: string, jungianType: string, profile: Record<string, unknown>, frameworkSection: string): string {
  return `You are an expert session planner for Social Code, a 1:1 social skills coaching practice.

Generate a complete INTAKE SESSION plan for the first call with this client. The intake session is about discovery, relationship building, goal alignment, and setting the coaching foundation — not teaching frameworks yet.

CLIENT:
Name: ${name}
Jungian Type: ${jungianType ?? "Unknown"}
Primary Need: ${(profile as Record<string, string>).primary_need ?? "Unknown"}
Hidden Fear: ${(profile as Record<string, string>).hidden_fear ?? "Unknown"}
Trust Pattern: ${(profile as Record<string, string>).trust_pattern ?? "Unknown"}
Compliance Style: ${(profile as Record<string, string>).compliance_style ?? "Unknown"}

${frameworkSection}

Generate a JSON object with EXACTLY this structure:

{
  "session_title": "Intake — Getting the Full Picture",
  "opening": "exactly how to open this first call — set the tone, establish safety, what to say in the first 2 minutes",
  "check_in": "the first question to ask to break the ice and get them talking — warm, not clinical",
  "todays_focus": "what this intake session accomplishes and why it matters",
  "agenda": [
    { "time": "0-5 min", "block": "Opening & rapport", "notes": "what to do" },
    { "time": "5-15 min", "block": "Their story — why they're here", "notes": "what to ask and explore" },
    { "time": "15-25 min", "block": "Goal clarification", "notes": "what to nail down" },
    { "time": "25-35 min", "block": "Baseline assessment", "notes": "what to observe and ask" },
    { "time": "35-45 min", "block": "Expectations + first assignment", "notes": "what to establish" },
    { "time": "45-50 min", "block": "Close", "notes": "how to end it" }
  ],
  "framework_or_topic_approach": null,
  "session_questions": ["8-10 intake questions in order — written out fully. Mix: their story, their goal, their history, what they've tried, what they're afraid of, what success looks like"],
  "exercise": "one light baseline exercise for this first session — something low-stakes that gives you data on where they actually are",
  "what_to_watch": ["4-5 specific behavioral signals to notice live in the intake — signs of their trust pattern, compliance style, hidden fear showing up"],
  "if_they_resist": "what to say if they deflect, keep things surface-level, or seem guarded in the intake",
  "session_close": "how to close the intake — what to summarize, what to commit to, how to set the tone for the coaching relationship",
  "homework": "first homework assignment — small, specific, low-stakes. Something that gives you data for session 2 and gets them moving immediately",
  "next_session_seed": "what to plant at the end of the intake to create anticipation for session 2"
}

Return ONLY valid JSON. No markdown, no explanation, no code blocks.`;
}

function buildOngoingPrompt(
  name: string,
  jungianType: string,
  profile: Record<string, unknown>,
  sessionNumber: number,
  coachNote: string,
  frameworkSection: string,
  historySection: string,
  lastSessionSection: string,
): string {
  const playbook = profile.coaching_playbook as Record<string, unknown> | undefined;
  return `You are an expert session planner for Social Code, a 1:1 social skills coaching practice.

Generate a complete, ready-to-run session plan for this client's upcoming coaching call. Use their full session history to pick up exactly where you left off.

CLIENT:
Name: ${name}
Jungian Type: ${jungianType ?? "Unknown"}
Primary Need: ${(profile as Record<string, string>).primary_need ?? "Unknown"}
Hidden Fear: ${(profile as Record<string, string>).hidden_fear ?? "Unknown"}
Trust Pattern: ${(profile as Record<string, string>).trust_pattern ?? "Unknown"}
Compliance Style: ${(profile as Record<string, string>).compliance_style ?? "Unknown"}
Locus of Control: ${(profile as Record<string, string>).locus_of_control ?? "Unknown"}
Communication Approach: ${(profile as Record<string, string>).communication_approach ?? "Unknown"}

COACHING PLAYBOOK:
Unlock Questions: ${(playbook?.unlock_questions as string[] | undefined)?.join(" | ") ?? "Not available"}
When Stuck: ${playbook?.when_stuck_intervention ?? "Not available"}
When Spiraling: ${playbook?.when_spiraling_intervention ?? "Not available"}
Feedback Delivery: ${playbook?.feedback_delivery ?? "Not available"}
Push vs Pull: ${playbook?.push_vs_pull ?? "Not available"}
${historySection}
${lastSessionSection}

SESSION INFO:
Session Number: ${sessionNumber ?? 1}
Coach's Note: ${coachNote || "No note provided."}

${frameworkSection}

Generate a JSON object with EXACTLY this structure:

{
  "session_title": "short punchy title for this session",
  "opening": "exactly how to open this call — what to say in the first 2 minutes based on where they are now",
  "check_in": "a specific check-in question — references last session or homework if applicable",
  "todays_focus": "1-2 sentences on what this session builds toward and why now",
  "agenda": [
    { "time": "0-5 min", "block": "Opening & check-in", "notes": "what to do" },
    { "time": "5-20 min", "block": "block name", "notes": "what to cover" },
    { "time": "20-35 min", "block": "block name", "notes": "what to cover" },
    { "time": "35-45 min", "block": "block name", "notes": "what to cover" },
    { "time": "45-50 min", "block": "Close & assign", "notes": "what to do" }
  ],
  "framework_or_topic_approach": "how to introduce and teach this framework or approach this topic for THIS person — or null if AI-decided",
  "session_questions": ["6-8 questions in exact order — specific to where they are now, referencing session history"],
  "exercise": "the specific practice exercise or drill — what it is, how to run it, how to frame it for this person",
  "what_to_watch": ["3-4 behavioral signals to notice live in this session"],
  "if_they_resist": "what to say and do if they push back or disengage — word-for-word if possible",
  "session_close": "how to close this session — what to summarize, what to acknowledge",
  "homework": "exact homework assignment tailored to this person and this session",
  "next_session_seed": "what to plant at the end to create momentum for the next call"
}

Return ONLY valid JSON. No markdown, no explanation, no code blocks.`;
}
