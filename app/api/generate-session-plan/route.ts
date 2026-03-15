import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

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
Key coaching point: The Permission Slip is the most important piece. Most approach anxiety is a permission problem, not a skill problem. They're waiting for external permission to talk to another person.`,

  "TALK Check": `TALK Check — Delivery Layer for Any Interaction
How to use: Run this check on your delivery in any social interaction — T-one (is your tone warm and inviting or flat and monotone?), A-ttention (are you actually present — eye contact, body facing them — or are you half-distracted?), L-anguage (are you matching their vocabulary level, avoiding filler words, not over-explaining?), K-inetics (body language, proximity, gestures — are they open and calibrated or closed and stiff?).
Purpose: Most people focus on what to say. TALK Check fixes how they're saying it. Tone and body language carry 70% of the message.
Common block this solves: Saying the right words but still not landing. Coming across as nervous, cold, robotic, or low-energy despite trying.
Key coaching point: Tone is the first signal people receive. If the tone is off, nothing else matters. Start there.`,

  "BRAVE": `BRAVE — Navigating Difficult Conversations
How to use: Five-step sequence for hard conversations — B-reak the pattern (acknowledge the tension upfront: "I want to talk about something that might be a bit awkward"), R-eason (state clearly why you're bringing it up — the intent, not the complaint), A-sk (ask what they think or feel before stating your position), V-alidate (reflect their perspective before responding — "that makes sense" goes a long way), E-nd with action (don't leave it in the air — agree on a concrete next step or at least a shared understanding).
Purpose: Gives a structure for confrontation-avoidant people to have the conversations they've been avoiding without blowing things up.
Common block this solves: Letting things fester, passive-aggressive patterns, ghosting instead of addressing issues, saying nothing and building resentment.
Key coaching point: The Break step is what most people skip. They launch into the content without naming that this is a hard conversation. That pattern-break at the start changes the entire dynamic.`,

  "SHIELD": `SHIELD — Handling Difficult People and Energy Drains
How to use: S-ee it coming (recognize the pattern — this person consistently drains you, pushes your buttons, or manipulates), H-old your frame (don't react emotionally to the bait — your non-reaction is your power), I-solate the behavior (name what's happening without attacking the person: "when you do X, it affects me like Y"), E-xit or engage (make a conscious choice — don't just absorb), L-og it (track patterns so you're not gaslighting yourself), D-etach from outcome (you can't control their behavior, only your response).
Purpose: For clients who consistently find themselves drained, manipulated, or reactive around specific people.
Common block this solves: Feeling powerless around difficult people, taking the bait, over-explaining, and walking away feeling worse every time.
Key coaching point: Most people think SHIELD is about fighting back. It's not. The power move is not reacting. The moment you react emotionally, you've handed them control.`,

  "Stop Replaying": `Stop Replaying — Breaking the Post-Social Overthink Loop
How to use: Three-step loop-breaker for the 2am social replay spiral — (1) Interrupt (a physical pattern break the moment the replay starts — stand up, say "stop" out loud, change environments), (2) Reframe (separate what actually happened from the story you're telling about it — "what did they literally say or do?" vs "what am I assuming it meant?"), (3) Release (a deliberate closure ritual — write it down and close the notebook, say out loud "that conversation is done," then do something that requires present attention).
Purpose: For clients stuck in post-social analysis paralysis. The replay loop is the #1 reason introverts avoid social situations — not the situations themselves.
Common block this solves: Replaying conversations for hours or days, finding evidence that they embarrassed themselves, pre-living future social situations as disasters.
Key coaching point: The Interrupt has to be physical. The loop is neurological. You can't think your way out of it. You have to break the pattern with your body first.`,
};

export async function POST(req: NextRequest) {
  const { profile, name, jungian_type, session_number, coach_note, mode, framework, custom_topic } = await req.json();

  if (!profile || !name) {
    return NextResponse.json({ error: "profile and name required" }, { status: 400 });
  }

  const frameworkSection = mode === "framework" && framework
    ? `FRAMEWORK TO TEACH THIS SESSION: ${framework}\n\n${FRAMEWORKS[framework] ?? ""}`
    : mode === "custom" && custom_topic
    ? `CUSTOM TOPIC FOR THIS SESSION: ${custom_topic}\n\nThis topic is not covered by a specific Social Code framework. Build the session around this specific issue using the client's profile to guide the approach.`
    : "No specific framework or topic set — build the session based on where this client is in their coaching arc.";

  const prompt = `You are an expert session planner for Social Code, a 1:1 social skills coaching practice.

Generate a complete, ready-to-run session plan for this client's upcoming coaching call.

CLIENT:
Name: ${name}
Jungian Type: ${jungian_type ?? "Unknown"}
Primary Need: ${profile.primary_need ?? "Unknown"}
Hidden Fear: ${profile.hidden_fear ?? "Unknown"}
Trust Pattern: ${profile.trust_pattern ?? "Unknown"}
Compliance Style: ${profile.compliance_style ?? "Unknown"}
Locus of Control: ${profile.locus_of_control ?? "Unknown"}
Communication Approach: ${profile.communication_approach ?? "Unknown"}

COACHING PLAYBOOK:
Unlock Questions: ${profile.coaching_playbook?.unlock_questions?.join(" | ") ?? "Not available"}
When Stuck: ${profile.coaching_playbook?.when_stuck_intervention ?? "Not available"}
When Spiraling: ${profile.coaching_playbook?.when_spiraling_intervention ?? "Not available"}
Feedback Delivery: ${profile.coaching_playbook?.feedback_delivery ?? "Not available"}
Push vs Pull: ${profile.coaching_playbook?.push_vs_pull ?? "Not available"}
Progress Markers: ${profile.coaching_playbook?.progress_markers ?? "Not available"}

SESSION INFO:
Session Number: ${session_number ?? 1}
Coach's Note (what's happening with this client right now): ${coach_note || "No note provided."}

${frameworkSection}

Generate a JSON object with EXACTLY this structure. Every field must be specific and actionable — written for THIS person and THIS session.

{
  "session_title": "short punchy title for this session (e.g. 'Breaking the Freeze' or 'Learning to Read the Room')",
  "opening": "exactly how to open this call — what to say in the first 2 minutes, what tone to set, what question to lead with",
  "check_in": "a specific check-in question tailored to this person — not 'how are you?' but something that reveals where they actually are",
  "todays_focus": "1-2 sentences on what this session is building toward and why it matters for THIS person right now",
  "agenda": [
    { "time": "0-5 min", "block": "Opening & check-in", "notes": "what to do and say" },
    { "time": "5-20 min", "block": "block name", "notes": "what to cover and how" },
    { "time": "20-35 min", "block": "block name", "notes": "what to cover and how" },
    { "time": "35-45 min", "block": "block name", "notes": "what to cover and how" },
    { "time": "45-50 min", "block": "Close & assign", "notes": "what to do and say" }
  ],
  "framework_or_topic_approach": "if framework session: how to introduce and teach this framework to THIS person given their profile — exact framing, which part to lead with, what to watch for. If custom topic: how to approach this topic given their need driver, fear, and compliance style.",
  "session_questions": ["6-8 questions in the exact order to ask them this session — written out in full, specific to them"],
  "exercise": "the specific practice exercise or drill for this session — what it is, how to run it, how to frame it for this person, what to observe",
  "what_to_watch": ["3-4 specific behavioral signals to notice live in this session — what resistance, progress, or discomfort looks like for this person"],
  "if_they_resist": "what to say and do if they push back, disengage, or deflect in this specific session — word-for-word if possible",
  "session_close": "how to close this session — what to summarize, what to acknowledge, how to set them up for the homework",
  "homework": "exact homework assignment — what it is, how to frame it specifically for this person, what accountability looks like",
  "next_session_seed": "the one thing to plant at the end of this session to create anticipation and momentum for the next call"
}

Return ONLY valid JSON. No markdown, no explanation, no code blocks.`;

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
    return NextResponse.json({ plan });
  } catch (e) {
    console.error("Session plan generation failed:", e);
    return NextResponse.json({ error: "Session plan generation failed" }, { status: 500 });
  }
}
