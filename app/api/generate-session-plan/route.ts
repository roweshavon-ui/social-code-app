import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabase } from "@/app/lib/supabase";

export const runtime = "edge";
export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

// ─────────────────────────────────────────────────────────────────────────────
// SOCIAL CODE FRAMEWORK LIBRARY
// Every framework is grounded in Shavi's personal story, Jungian psychology,
// and behavioral science. These are not generic tips — they are a system built
// from 10,000+ door-to-door interactions, Carl Jung's model of the psyche, and
// the lived experience of someone who had to engineer social competence from
// scratch after growing up in one of the hardest environments in Kingston, Jamaica.
//
// Core philosophy: "You're not broken. You're untrained."
// Brand truth: "Still awkward. Still weird. Just competent."
// ─────────────────────────────────────────────────────────────────────────────

export const FRAMEWORKS: Record<string, string> = {

  // ── INITIATION CLUSTER ──────────────────────────────────────────────────

  "SPARK": `SPARK — Starting Conversations
Situation it solves: The freeze before approaching. Waiting for the "perfect" opener that never comes.
How to use:
S — Smile, Read the Room, Break the Ice: Smile first (genuine, not performative). Scan: body language, eye contact, energy level. Are they open or closed? Then break the ice with a real situational comment about something you both share in the room right now. Not a line. Not a compliment. Just honesty about the shared environment. GREEN read = they mirror your smile, make eye contact, turn toward you. YELLOW = polite acknowledgment, minimal engagement — try one more opener before moving on. RED = no eye contact, body angled away, disengaged — do not push.
P — Present Yourself: Once the ice is broken, introduce yourself by name. "I'm [name], by the way." Simple, direct, confident. This creates reciprocity — they'll introduce themselves back. GREEN = they give their name + add something ("I'm here with..."). YELLOW = name only, flat affect. RED = very brief, looks away — graceful exit is near.
A — Ask Open-Ended Questions: Get them talking. Ask about their experience, opinion, or story — not yes/no questions. Use the Echo Question Technique: pick up the last word or phrase they said and reflect it back as a question ("Wait — you've been doing that for 10 years?"). This keeps them talking without effort. GREEN = they expand, ask you a question back, energy rises. YELLOW = short answers, you're doing the work. RED = monosyllabic, phone comes out — prep your exit.
R — Really Listen: Put down your agenda. Eye contact. Nod. Don't interrupt. Don't wait for your turn to talk. Listen for keywords — the topics they return to, the things they get louder about. Those are the threads. Echo Question Technique: mirror a keyword or phrase back as curiosity, not interrogation. The best listeners are the most interesting people in the room.
K — Keep Connected or Kindly Exit: GREEN = exchange contact. Be direct: "You seem like someone worth staying in touch with — can I get your info?" YELLOW = graceful close: "I'll let you get back to it — really good talking to you." RED = exit immediately: "I'll let you go — enjoy the rest of your night." Conversation length guide: coffee shop 3-5 min, networking event 5-10 min, social venue 10-15 min. Exit on a high, never overstay.
Why it works (behavioral science): The situational opener removes identity threat — you're commenting on the environment, not asking to be accepted. The Echo Question Technique triggers reciprocal disclosure. Mirror neurons fire when someone feels genuinely heard, creating instant rapport without performance.
Jungian grounding: Most people never approach because their Persona (the social mask) hasn't been constructed yet — they don't know who to "be." SPARK bypasses that by giving the brain a structure, which quiets the ego long enough for natural connection to happen. The K step (Keep Connected or Kindly Exit) is the Persona's most powerful tool: graceful presence AND graceful exits.
Personal grounding (Shavi): Built after knocking 10,000+ doors in door-to-door sales across five states. The openers that worked every single time were never clever — they were real. A comment about the heat, the neighborhood, what was on their porch. The situational opener isn't a trick. It's just honesty.
Part of the system: SPARK lives inside the Fearless Approach System (FAS) as Step 4 — the conversation framework you use once you've approached. If your client is freezing before they even get to SPARK, start with FAS first.
Key coaching point: The S step doesn't have to be clever — it has to be real. And the K step matters as much as the S step. How you exit is how you're remembered.`,

  "3-Second Social Scan": `3-Second Social Scan — Reading Whether Someone Wants to Be Approached
Situation it solves: Talking yourself out of approaching based on fear, not data.
How to use: Before approaching, read 3 signals in 3 seconds — (1) Eye contact or a glance in your direction (they noticed you), (2) Open body language (facing outward, not locked into a conversation or task), (3) Available (not on phone, not mid-sentence, not clearly rushing). If 2 of 3 are present, the window is open. Move.
Part of the system: This is Step 2 of the Fearless Approach System (FAS). If your client is freezing before they even scan, start with FAS first — the 3-Second Social Scan is the targeting tool inside the broader approach framework.
Why it works (behavioral science): The amygdala processes social threat in milliseconds — it will always default to "danger" without data. The scan gives the prefrontal cortex something real to work with, overriding the fear response with evidence.
Jungian grounding: Approach anxiety is often the Shadow at work — the part of you that was once rejected and vowed to never risk it again. The Scan makes the decision process objective, which quiets the Shadow's veto power.
Personal grounding (Shavi): Developed during door-to-door sales when reading prospect energy became a survival skill. A closed door isn't rejection — it's data. A glance away isn't dismissal — it's information. The scan separates what's real from what the brain invents.
Key coaching point: You're not deciding if they'll like you. You're reading if the window is open. Those are completely different questions.`,

  "Fearless Approach System": `Fearless Approach System (FAS) — End-to-End Approach Anxiety Elimination
Situation it solves: The full cycle — freeze, internal narrative, missed window, post-event replay.
How to use: Five components in order — (1) Permission Slip: internal reframe before approaching ("I'm allowed to talk to people. I don't need a reason."), (2) Target Selection: run the 3-Second Social Scan, (3) Approach Window: move within 3 seconds of deciding — every second of hesitation doubles the anxiety, (4) Opening: use SPARK, (5) Exit Strategy: have a graceful out ready before you approach ("I'll let you get back to it") so you never feel trapped.
Why it works (behavioral science): Hesitation activates the sympathetic nervous system (fight/flight). The 3-second rule interrupts that cascade before it builds. The exit strategy removes the "escape anxiety" that makes people avoid conversations altogether — when you know you can leave, entering feels safe.
Jungian grounding: The Permission Slip is Shadow work made practical. Most approach anxiety isn't fear of rejection — it's the unconscious belief that you don't have the right to take up space. That belief was installed by early experiences. The Permission Slip makes it conscious, which is the first step to dismantling it. Jung: "Until you make the unconscious conscious, it will direct your life and you will call it fate."
Personal grounding (Shavi): Shavi engineered exits around crowds as a child — he would switch sports teams to avoid walking past groups of people. FAS is the system he built to rewire that. Every component came from a real failure first: the missed window because he waited too long, the trapped feeling because he had no exit, the freeze because he never gave himself permission.
Key coaching point: Most approach anxiety is a permission problem, not a skill problem. Fix the permission, the skills follow.`,

  "3-2-1 Send It": `3-2-1 Send It — Stopping Overthinking and Pulling the Trigger
Situation it solves: Paralysis before low-stakes social actions — sending a text, walking over, saying hello, raising your hand.
How to use: When you notice yourself over-analyzing a simple social action — count 3, 2, 1 out loud or in your head and physically move before you finish. No more thinking once you hit 1. The goal isn't to feel ready. The goal is to move before the brain talks you out of it.
Why it works (behavioral science): Overthinking activates the default mode network (the brain's self-referential loop). The countdown interrupts that loop with a motor command — action short-circuits rumination. Mel Robbins' 5-Second Rule methodology demonstrates that counting backward disrupts the habit of hesitation by triggering a physical response before the brain can talk you out of moving.
Jungian grounding: The overthinking is the Persona protecting itself — it would rather miss the moment than risk looking foolish. 3-2-1 Send It is a way to act from the Self instead of the Persona. It's not about being fearless. It's about moving anyway.
Personal grounding (Shavi): The next door was always waiting. In 10,000 doors of sales, the ones he almost didn't knock were often the ones that changed everything. Not because he was ready. Because he moved.
Key coaching point: You're never going to feel ready. Ready is a feeling your brain manufactured to keep you safe. Move at 1.`,

  "Barista Method": `Barista Method — Building Social Reps in Zero-Stakes Environments
Situation it solves: Not having enough real-world practice. Treating every interaction like it matters too much to risk.
How to use: Use service-based interactions (coffee shop, grocery store, rideshare, front desk) as daily low-stakes training grounds. The goal isn't to make a friend — it's to get a rep in. Pick one skill per week to practice (opener, eye contact, asking a follow-up question, using their name). Baristas, cashiers, and front desk staff are the best practice partners because there's a built-in social script, low consequences, and natural exits.
Why it works (behavioral science): Skill acquisition follows spaced repetition — you need volume of reps to build the neural pathways for social fluency. Most people never practice social skills because every interaction feels high-stakes. The Barista Method creates a daily practice environment with zero identity risk.
Jungian grounding: The Persona develops through interaction, not intention. You don't build a social identity by thinking about it — you build it by using it. Every Barista rep is a small act of individuation — you're choosing to engage instead of withdraw.
Personal grounding (Shavi): The door-to-door years were essentially the Barista Method at industrial scale — 20-30 cold interactions per day, every day, until conversation stopped being an event and started being a muscle. You don't need a sales route. You need a coffee order.
Key coaching point: You're not trying to impress the barista. You're training your nervous system to stop treating conversation as a threat.`,

  // ── DELIVERY & PRESENCE CLUSTER ─────────────────────────────────────────

  "TALK Check": `TALK Check — Delivery Layer for Any Interaction
Situation it solves: Saying the right words but still not landing. Coming across as flat, robotic, nervous, or low-energy.
How to use: Run TALK Check before or during any important conversation — T-one (is your tone warm and grounded, or flat and anxious?), A-ttention (are you fully present — real eye contact, body facing them, not scanning the room?), L-anguage (matching their vocabulary, zero filler words, speaking in complete thoughts?), K-inetics (body language, proximity, stillness — open posture, no fidgeting, movement that's intentional).
Why it works (behavioral science): University of Glasgow research: vocal impressions form in 300-500 milliseconds. The amygdala reads attention cues faster than the brain processes words. Research consistently shows that non-verbal signals — tone, eye contact, body language — carry the majority of emotional meaning in social interactions, far outweighing the words themselves. Most social skills training focuses on content — TALK Check focuses on the delivery layer where most of the signal lives.
Jungian grounding: Flat delivery is often a Persona problem — the social mask is performing safety ("don't take up too much space") instead of presence. Warmth requires the ego to step back. TALK Check gives people a concrete checklist for what genuine presence looks like when it's constructed intentionally.
Personal grounding (Shavi): Built through door-to-door sales where a prospect decided if they'd open the door in the first 3 seconds of hearing his voice. Not his pitch — his voice. He learned to lead with tone, not content. The T in TALK comes first for a reason.
Key coaching point: Tone is the first signal. If the tone is off, nothing else matters. Fix T before anything else.`,

  // ── DEPTH & CONTINUITY CLUSTER ──────────────────────────────────────────

  "DEPTH": `DEPTH — Taking Conversations from Surface to Real
Situation it solves: Running out of things to say. Conversations that stay shallow or die after small talk. Not knowing how to go deeper without it feeling forced.
How to use: D-isclose first (before you ask a personal question, give a small piece of yourself — reciprocity pulls them in), E-motion over information (follow the feeling behind what they say, not just the facts — "that sounds like it was a lot" lands deeper than "wow really?"), P-ause with purpose (resist the urge to fill silence — a 2-3 second pause after something meaningful signals you actually heard it), T-hread back (reference something they said earlier — "you mentioned earlier that..." shows you're present, not performing), H-and the ball (add your angle on the topic, then return the question — conversation is tennis, not a press conference). Note: the H step uses the same Echo Question Technique from SPARK — pick up the last keyword they said and reflect it back as curiosity before adding your angle. If they learned SPARK first, they already have this tool.
The Depth Ladder — four levels of conversation depth (teach clients to recognize which level they're on and how to move up deliberately):
Level 1 — Facts & Pleasantries: weather, logistics, safe surface talk. Everyone starts here. The goal is to move through it, not stay.
Level 2 — Opinions & Preferences: what they like, what they think, what they'd choose. "What did you think of that?" opens Level 2.
Level 3 — Values & Experiences: what shaped them, what they care about, what they've been through. This is where real connection starts.
Level 4 — Vulnerabilities & Aspirations: what they're afraid of, what they're working toward, what they haven't told many people. Rare. Never forced. Only reached when the other person feels genuinely safe.
The Bridge Technique — three tools for moving between levels without it feeling like an interview:
(1) Why Follow-Up: after any Level 2 answer, ask "what made you feel that way?" — pulls them toward Level 3 naturally.
(2) Vulnerability Match: disclose at the level you want to reach before asking them to go there. You go first, they follow.
(3) Observation Pivot: instead of a question, name what you noticed. "You light up when you talk about that." This often opens Level 3-4 without a question at all.
Why it works (behavioral science): Reciprocal self-disclosure is one of the most well-documented drivers of intimacy (Jourard, 1971). People don't open up when asked — they open up when they feel safe enough to match your level. The Depth Ladder gives both coach and client a shared map for where conversations are and where they could go.
Jungian grounding: Surface conversation is Persona-to-Persona contact — two masks talking. Real connection happens when the Self makes contact with another Self. DEPTH is the path from mask to person. The E step (emotion over information) is the gateway — emotion is where the Self lives. Level 4 of the Depth Ladder is where individuation shows up in relationship — two people choosing to be real instead of performing.
Personal grounding (Shavi): After his father passed at 16, Shavi realized quality time was his love language — not time in the same room, but time that actually meant something. DEPTH is his answer to conversations that feel like they happened but left nothing behind.
Key coaching point: You don't go deeper by asking deeper questions. You go deeper by disclosing first. The Depth Ladder shows you the levels. The Bridge Technique gets you there. But Vulnerability Match — going first — is the only move that actually works.`,

  // ── CONFIDENCE & INNER GAME CLUSTER ─────────────────────────────────────

  "GROUND": `GROUND — Social Confidence and Inner Game
Situation it solves: Feeling like you shrink in social situations. Needing approval. Performing instead of connecting. Confidence that disappears the moment someone seems unimpressed.
How to use: G-et identity before you enter (before any social situation, name 3 things that are true about you that have nothing to do with how this goes — this is your foundation, not a pre-event ritual; if you need a timed pre-event version, use the Pre-Game System), R-emove the audition (reframe: you're not auditioning to be liked, you're choosing who to spend time with), O-wn the pause (practice one beat of comfortable silence before you respond to anything — it signals confidence that most people never see), U-nderstand the approval loop (your anxiety spikes because your nervous system was trained to read approval as safety — this is not truth, it's conditioning), N-eutralize the story (before you walk in, name the story you're telling about what they'll think, then ask: is this a fact or an assumption?), D-eploy with no agenda (enter with nothing to prove — curiosity, not performance). GROUND is a mindset framework — it builds who you are in social situations. The Pre-Game System is the activation ritual — it uses GROUND as its foundation but adds timing, energy awareness, and a specific intention before high-stakes events.
Why it works (behavioral science): Confidence is a byproduct of competence, not a prerequisite. The brain reads your own behavior as evidence about who you are (self-perception theory, Bem 1972). The pause, the reframe, the "no agenda" entry — these are behaviors that send your nervous system a different signal.
Jungian grounding: Approval-seeking is the Persona overextended — so invested in how it looks that the Self can't get through. GROUND is about re-rooting in the Self before entering the social field. The G step (identity before you enter) is individuation in practice: knowing who you are independent of the room's response.
Personal grounding (Shavi): Grew up without a father from age 16, rebuilt from scratch in a new country, knocked on 30 doors a day getting rejected to his face. Confidence didn't come from affirmations — it came from building competence until the outcomes started changing. "Confidence is the byproduct, not the goal."
Key coaching point: You don't need to feel confident before you walk in. You need to know who you are before you walk in. Those are completely different things.`,

  "Pre-Game System": `Pre-Game System — Confidence Preparation Before Any Social Situation
Situation it solves: Showing up to important social situations already anxious, low-energy, or in the wrong headspace.
How to use: Three-step routine done in the 10-15 minutes before any high-stakes interaction. Built on GROUND as the foundation — if the client hasn't done GROUND yet, teach it first. (1) Energy Audit: check your battery using the Energy Check system — GREEN = present and ready, go deep; YELLOW = functional but running thin, manage your commitments; RED = depleted, do minimum viable engagement or reschedule if possible. Do not enter a high-stakes event in RED without a plan. (2) Identity Lock: activate the G step from GROUND — name 2-3 things that are true about you that have nothing to do with how this goes. Say them out loud, not just in your head. The difference from GROUND is activation: GROUND builds the identity over time; Identity Lock fires it up for right now. (3) Intention Set: decide what you're going for in this interaction — not "make them like me" but something specific and controllable ("ask one good question," "stay present," "make them laugh once"). Walk in with an intention you can actually achieve.
Why it works (behavioral science): Pre-performance routines (used by athletes, surgeons, and musicians) reduce cortisol and improve execution consistency. Setting an achievable intention shifts the brain from threat-detection mode to goal-pursuit mode — a fundamentally different neurological state.
Jungian grounding: The Pre-Game System is preparation for conscious Persona use — you're choosing who to be instead of defaulting to whoever fear makes you. Identity Lock is about accessing the Self before the Persona takes over.
Personal grounding (Shavi): Before the biggest sales days — and later, before coaching client calls — the ritual mattered. Not to feel ready (you never fully feel ready) but to show up intentional instead of reactive.
Key coaching point: Most people walk into social situations hoping for a good outcome. The Pre-Game System is about deciding what you're going to do, not hoping for how it'll go.`,

  "Energy Check": `Energy Check — Social Energy Management and Strategic Engagement
Situation it solves: Burning out socially. Dreading interactions you used to enjoy. Over-committing to social situations and arriving depleted. Introvert exhaustion.
How to use: Two sides to the Energy Check — your battery AND theirs.
Reading YOUR battery — GREEN: fully present, engaged, can initiate and sustain (this is for depth). YELLOW: functional, can respond well but shouldn't initiate high-effort connection (this is for maintenance). RED: depleted, protect your energy, minimum viable engagement only (this is for recovery). Use your battery level to make strategic decisions: who to engage, for how long, and when to exit without guilt.
Reading THEIR energy — before or during any interaction, check three signals: (1) Body Orientation: are they turned toward you (open) or angled away (closed)? Open = GREEN, angled but responsive = YELLOW, fully turned away = RED. (2) Facial Expression: engaged and animated = GREEN, neutral and polite = YELLOW, flat or distracted = RED. (3) Situation Context: are they in a natural pause with nowhere to be = GREEN, mid-task but not rushing = YELLOW, clearly busy or in motion = RED. Combine all three to read the room. 2/3 RED signals = don't initiate or wrap up quickly.
Why it works (behavioral science): Ego depletion research (Baumeister) shows that self-regulation — which social interaction requires — draws from a finite resource that depletes across a day. Introverts especially show cortisol spikes from prolonged social engagement that extroverts don't. The Energy Check is not about avoidance — it's about sustainability.
Jungian grounding: For introverts, energy flows inward — social engagement is energy expenditure, not energy intake. Jungian introversion means the unconscious needs quiet to process. Ignoring this doesn't make you more social — it makes you more reactive and less genuine when you are social. The Energy Check honors the type instead of fighting it.
Personal grounding (Shavi): Coaching 20 clients a week while building a brand taught him fast: you cannot show up for everyone if you show up depleted for everyone. The first time he turned down a social event because he knew his battery was RED, it felt like failure. It was actually intelligence. The Energy Check is what makes selective presence a strategy instead of an excuse.
Key coaching point: You don't build a social life by showing up exhausted everywhere. You build it by being fully present somewhere. And reading THEIR energy is just as important as knowing yours — the scan works both ways.`,

  // ── SPEAKING UP & GROUP DYNAMICS CLUSTER ────────────────────────────────

  "VOICE": `VOICE — Speaking Up in Groups and Claiming Your Space
Situation it solves: Going quiet in group settings. Having thoughts and not saying them. Speaking up and getting talked over. Feeling invisible at tables where you should be contributing.
How to use: V-alidate your thought before you speak (internal permission slip — "this is worth saying" — before you open your mouth, not after), O-pen early (in any group setting, speak once in the first 5 minutes — doesn't have to be profound, just real — after one contribution you've claimed your space), I-nsert with intent (cut in without apologizing — "building on that—" or "quick point—" not "sorry, can I just—"), C-laim the space (match your volume to the room, pause before you start, don't trail off — finish your thought like it matters), E-nd strong (complete your point fully before you hand the thread — never trail off mid-thought because someone looks like they want to talk).
Why it works (behavioral science): Research on group dynamics shows that early contributors are perceived as higher status and more competent — the primacy effect means your first contribution sets your social position at the table. Apology language before speaking ("sorry, can I just—") signals low status before a single word of content lands.
Jungian grounding: Going quiet in groups is often Shadow material — the assertive, opinionated self that was once silenced or dismissed. VOICE is shadow integration work: reclaiming the part of yourself that was trained to shrink. The V step (validate your thought first) is making the permission conscious instead of waiting for the group to grant it.
Personal grounding (Shavi): Grew up in a household where the adults dominated the room. Learned that silence was often the safest option. VOICE is the framework for unlearning that — not becoming someone who talks more, but becoming someone who speaks when they have something real to say, and says it like it counts.
Key coaching point: You're not trying to dominate the room. You're claiming your seat at the table. Those are completely different energy. Validate the thought first — that's the entire system in one step.`,

  // ── DIFFICULT CONVERSATIONS CLUSTER ─────────────────────────────────────

  "BRAVE": `BRAVE — Navigating Difficult Conversations
Situation it solves: Avoiding conversations that need to happen. Letting things fester. Passive-aggressive patterns. Ghosting instead of addressing issues directly.
How to use: B-egin calm (check timing and regulate yourself BEFORE you start — a dysregulated opener poisons the whole conversation), R-egulate (stay regulated throughout — don't let their state hijack yours, if they escalate you slow down), A-sk their perspective (before you state yours — ask what they think or how they experienced it — their answer changes everything), V-alidate (even if you disagree — "I can see why that landed that way" is acknowledgment, not agreement), E-xplore solutions (don't force resolution before they're ready — once both perspectives are on the table and validated, look for what could change).
Reading their state — GREEN: they engage, share their perspective, tone is open — proceed through A, V, E. YELLOW: they go quiet or seem guarded — slow down, deepen A and V, don't push toward E yet. RED: they shut down, escalate, or leave — pause everything, return to R (regulate yourself), use V ("I'm not here to attack you — I genuinely want to understand"), don't move to E until back in YELLOW.
Why it works (behavioral science): Confrontation avoidance is maintained by anticipated pain — the brain predicts the conversation will go worse than it does. The B step (Begin calm) prevents the dysregulated opener that confirms that fear. The A step keeps the other person's prefrontal cortex online — people defend against conclusions, not questions.
Jungian grounding: The confrontation-avoidant person has a dominant Feeling function and an underdeveloped Shadow — the part of them that can hold a boundary. BRAVE gives the Feeling type a structure that lets them have the hard conversation without abandoning empathy. The A step (Ask their perspective) is the Feeling function's power move — it keeps connection alive while still saying what needs to be said.
Personal grounding (Shavi): Built through watching the damage that unsaid things do over time. The conversations people avoid for months are always the ones that, once had, take 20 minutes. BRAVE is the permission structure for having them.
Key coaching point: Begin calm — regulate yourself BEFORE you start. A dysregulated opener poisons the whole conversation before a word of substance is said.`,

  "SHIELD": `SHIELD — Handling Difficult People and Energy Drains
Situation it solves: Feeling powerless around difficult people. Taking the bait. Walking away from interactions feeling worse every single time.
How to use: S-tay calm, assess danger (before anything — are they escalating? name it internally: "this is a difficult moment, not an emergency"), H-old boundary ("that language isn't okay with me" — state it once, calmly, no lecture), I-gray rock (short, bland, non-reactive responses — remove the emotional reward), E-prepare exit strategy (before you need it, know your line — pre-committing means you don't decide in a hot moment), L-eave ("I'm going to end this conversation" — then do it, no JADE: Justify, Argue, Defend, Explain), D-ecompress afterward (you absorbed something — name it, shake it out, don't replay — SHIELD ends here, not at L).
Reading the situation — GREEN: they're venting but not escalating — H and I are enough, stay present. YELLOW: boundary repeated or ignored, tension rising — move toward E, prepare to exit. RED: escalating, aggressive, or you're losing your ground — skip to L immediately, decompress after.
Why it works (behavioral science): Reactivity is the result of the amygdala hijack — the emotional brain fires before the rational brain can respond. The S step (Stay calm, assess) is a pattern interrupt that keeps the prefrontal cortex online. Gray rock (I step) removes intermittent reinforcement — the mechanism that makes difficult behavior persistent.
Jungian grounding: Difficult people often activate our own Shadow — the things about them that bother us most are frequently projections of what we haven't integrated in ourselves. SHIELD isn't about winning against them. It's about staying in contact with yourself while they're doing what they do.
Personal grounding (Shavi): Grew up around people who used volatility as control. Learned early that reacting gave them what they were after. The power move is non-reaction — not coldness, but groundedness. SHIELD was built from that.
Key coaching point: The moment you react emotionally, you've handed them control. Gray rock removes the reward. Every time.`,

  // ── RECOVERY & RESET CLUSTER ─────────────────────────────────────────────

  "Stop Replaying": `Stop Replaying — Breaking the Post-Social Overthink Loop
Situation it solves: Replaying conversations for hours or days afterward. Finding evidence of embarrassment in things that didn't matter. Pre-living future situations as disasters.
How to use: Three subsystems working together — (1) Interrupt: physical pattern break the moment you catch yourself replaying — stand up, say "stop" out loud, change rooms, change tasks. You cannot think your way out of the loop. Break it with your body first. (2) Conversation Audit: 5-step forensic breakdown to get the truth — what actually happened (just facts), what story you're telling about it, what evidence contradicts that story, what you'd tell a friend in the same situation, what you can do differently next time. (3) Redirect Protocol: 3-minute emergency stop for the 2AM spiral — write the thing that's looping, write one sentence of what's true, write one thing you're doing tomorrow. Close it. Don't reopen it.
Why it works (behavioral science): Social rejection activates the same neural pain pathways as physical pain (Eisenberger, 2003). The brain's three-step survival loop — detect rejection, analyze for cause, prevent future occurrence — never fully switches off in people with social anxiety. The Interrupt step physically disrupts this loop before it escalates. The Conversation Audit replaces the emotional story with evidence.
Jungian grounding: The replay loop is the Ego in crisis — trying to manage its public image retroactively. Stop Replaying is a way to call the Ego off and return to the Self. The Redirect Protocol closes the loop the Ego refuses to close on its own.
Personal grounding (Shavi): Built this after watching smart, capable people spiral for days over conversations that the other person forgot in 20 minutes. The replay is never about what happened. It's about what it means about you. That's the only question worth answering — and the Conversation Audit answers it directly.
Key coaching point: The Interrupt has to be physical. You cannot think your way out of the loop. Your body has to move first — then your mind can follow.`,
};

// One-liner summaries — used in AI-selection mode so we don't dump all 14 full texts
const FRAMEWORK_SUMMARIES: Record<string, string> = {
  "SPARK": "Starting conversations — situational opener, present yourself, ask open-ended, really listen, keep connected or exit",
  "3-Second Social Scan": "Reading approach windows — 3 signals in 3 seconds before deciding to approach",
  "Fearless Approach System": "End-to-end approach anxiety elimination — permission slip, scan, 3-second rule, SPARK, exit strategy",
  "3-2-1 Send It": "Stopping overthinking for low-stakes social actions — countdown interrupts hesitation loop",
  "Barista Method": "Building social reps in zero-stakes service interactions — daily training ground",
  "TALK Check": "Delivery layer — Tone, Attention, Language, Kinetics — how you say it, not what you say",
  "DEPTH": "Deepening conversations — Dig Deeper, Empathize, Personal Story, Transition, Hook — going from small talk to real connection",
  "Energy Check": "Reading and managing social energy levels — GREEN/YELLOW/RED battery system",
  "Pre-Game System": "Preparation ritual before high-stakes social situations — reduces anticipatory anxiety",
  "VOICE": "Speaking up in groups — Value your input, Own your opening, Include your perspective, Claim the floor, Exit gracefully",
  "BRAVE": "Navigating difficult conversations — Begin calm, Regulate, Ask their perspective, Validate, Explore solutions",
  "SHIELD": "Handling difficult people — Stay calm/assess danger, Hold boundary, Gray rock, Prepare exit, Leave, Decompress",
  "GROUND": "Inner game and confidence foundation — anchoring identity independent of social outcomes",
  "Stop Replaying": "Breaking post-social overthink loop — physical interrupt, conversation audit, redirect protocol",
};

// ─────────────────────────────────────────────────────────────────────────────
// FRAMEWORK SELECTION GUIDE — for the AI to use when deciding which to teach
// ─────────────────────────────────────────────────────────────────────────────
const FRAMEWORK_SELECTION_GUIDE = `
8-SESSION ROADMAP — 14 frameworks across 8 sessions:

Session 1 — Foundation Tools: TALK Check + 3-Second Social Scan
  Both are fast diagnostic tools, immediately applicable in the real world.
  TALK Check is the delivery foundation — if tone/delivery is off, nothing else lands.
  3-Second Scan removes decision paralysis before approaching.
  Teach both in one hour. TALK Check first, Scan second.

Session 2 — The Approach System: Fearless Approach System + 3-2-1 Send It + Barista Method
  FAS is the full architecture. 3-2-1 Send It and Barista Method are tools inside it.
  Teach FAS as the system, position 3-2-1 and Barista as its daily-use tools.
  Barista Method doubles as ongoing homework at any stage of the arc.

Session 3 — Starting Conversations: SPARK
  The core conversation framework. Heavy enough to deserve its own full session.
  Builds directly on the 3-Second Scan from Session 1 — SPARK is what happens after the window opens.

Session 4 — Going Deeper: DEPTH
  Once they can start conversations, teach them to deepen.
  Full hour — D-E-P-T-H steps, Depth Ladder (4 levels), Bridge Technique (3 tools).

Session 5 — Inner Game: GROUND + Pre-Game System + Energy Check
  These three are one connected system — GROUND is the foundation, Pre-Game activates it, Energy Check sustains it.
  Teach all three together. GROUND first, Pre-Game as its practical ritual, Energy Check as the sustainability layer.

Session 6 — Group Dynamics: VOICE
  Speaking up in groups. Distinct enough to stand alone as a full session.

Session 7 — Difficult Conversations: BRAVE
  Hard conversations need the full hour. Don't rush this one.

Session 8 — Protection & Recovery: SHIELD + Stop Replaying
  Both are reactive/protective — handle what goes wrong and recover clean.
  Natural pairing to close out the arc.

FLEXIBILITY RULES:
- Follow this sequence as the default arc. Adjust when a client's immediate situation is urgent (e.g., active difficult conversation crisis → bring BRAVE forward).
- When a session covers multiple frameworks, teach the primary one fully and introduce the secondary as extensions/tools.
- Barista Method can be assigned as homework at any stage regardless of where you are in the arc.
- Jungian type adjustments: Introverts benefit from Energy Check + Pre-Game framing earlier even if taught in Session 5. Feelers connect deepest with BRAVE and DEPTH — lean into emotional logic there.
- Never skip to Sessions 6-8 frameworks before the foundation (Sessions 1-4) is solid.
- Not every client needs exactly 8 sessions — extend when needed. The roadmap is the default arc, not a hard constraint.

Never teach a framework that's already been mastered. Always build on what's worked.
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profile, name, jungian_type, client_id, session_number, coach_note, mode, framework, custom_topic } = body;

    if (!profile || !name) {
      return new Response(JSON.stringify({ error: "profile and name required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch session history
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
          last.homework_completion !== "none" ? `Homework completion: ${last.homework_completion}` : null,
          last.client_engagement ? `Engagement: ${last.client_engagement}` : null,
          last.breakthrough_moment ? `Breakthrough: ${last.breakthrough_moment}` : null,
        ].filter(Boolean).join("\n");
      }
    }

    const isIntake = (session_number ?? 1) === 1 && sessionHistory.length === 0;

    // Build framework section — for ongoing sessions, always pick a framework
    let frameworkSection: string;
    if (isIntake) {
      frameworkSection = `INTAKE SESSION — no framework teaching yet. Focus on discovery, relationship building, and goal alignment. At the close, plant a seed about what Session 2 will introduce (pick the most relevant framework based on their profile and tease it).`;
    } else if (mode === "framework" && framework) {
      frameworkSection = `FRAMEWORK OVERRIDE — teach this specific framework this session:\n\n${framework}\n\n${FRAMEWORKS[framework] ?? ""}`;
    } else if (mode === "custom" && custom_topic) {
      frameworkSection = `CUSTOM TOPIC OVERRIDE: ${custom_topic}\n\nThis is coach-directed. Build the session around this topic. If a Social Code framework partially covers it, integrate it. If not, address it directly using the client's profile.`;
    } else {
      // AI selects — always picks a framework, never leaves it blank
      const usedFrameworks = sessionHistory.flatMap((s) => (s.frameworks_used as string[]) ?? []);
      const unusedFrameworks = Object.keys(FRAMEWORKS).filter((f) => !usedFrameworks.includes(f));
      const summaryList = Object.entries(FRAMEWORK_SUMMARIES)
        .map(([n, summary]) => `- ${n}: ${summary}`)
        .join("\n");
      frameworkSection = `FRAMEWORK SELECTION (AI-decided): You MUST pick one Social Code framework to anchor this session. Use the sequencing logic and the client's profile to select the best next framework.

${FRAMEWORK_SELECTION_GUIDE}

AVAILABLE FRAMEWORKS (name + one-liner):
${summaryList}

Frameworks already covered: ${usedFrameworks.length > 0 ? usedFrameworks.join(", ") : "None yet"}
Frameworks not yet covered: ${unusedFrameworks.join(", ")}

Pick the best framework. In framework_selected put the exact name. In framework_why explain why for this person at this point. In framework_or_topic_approach explain exactly how to teach it for their Jungian type and trust pattern.`;
    }

    const historySection = sessionHistory.length > 0
      ? `\nSESSION HISTORY (${sessionHistory.length} session${sessionHistory.length !== 1 ? "s" : ""} logged):\n${JSON.stringify(sessionHistory, null, 2)}`
      : "\nSESSION HISTORY: No sessions logged yet.";

    const lastSessionSection = lastSessionBrief
      ? `\nSINCE LAST SESSION:\n${lastSessionBrief}`
      : "";

    const prompt = isIntake
      ? buildIntakePrompt(name, jungian_type, profile, frameworkSection)
      : buildOngoingPrompt(name, jungian_type, profile, session_number, coach_note, frameworkSection, historySection, lastSessionSection);

    const encoder = new TextEncoder();
    const stream = new TransformStream<Uint8Array, Uint8Array>();
    const writer = stream.writable.getWriter();

    (async () => {
      try {
        let fullText = "";
        const anthropicStream = await client.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 4000,
          stream: true,
          messages: [{ role: "user", content: prompt }],
        });

        for await (const chunk of anthropicStream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            fullText += chunk.delta.text;
          }
        }

        const start = fullText.indexOf("{");
        const end = fullText.lastIndexOf("}");
        if (start === -1 || end === -1) throw new Error("No JSON in Anthropic response");

        const plan = JSON.parse(fullText.slice(start, end + 1));
        await writer.write(
          encoder.encode(JSON.stringify({ plan, isIntake, lastSessionBrief }))
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        await writer.write(encoder.encode(JSON.stringify({ error: msg })));
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

function buildIntakePrompt(name: string, jungianType: string, profile: Record<string, unknown>, frameworkSection: string): string {
  return `You are the session planner for Social Code — a 1:1 social skills coaching practice built by Shavi, who grew up in Arnett Gardens, Kingston, Jamaica, knocked on 10,000+ doors in door-to-door sales, discovered Carl Jung, and built a complete system for social competence from scratch. The brand truth: "You're not broken. You're untrained." The approach: frameworks, not feelings. Systems, not personality traits.

Generate a complete INTAKE SESSION plan for the first call with this client. This session is about discovery, relationship building, goal alignment, and laying the coaching foundation. Do NOT teach a framework yet — but close with a teaser of what Session 2 will introduce.

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
  "opening": "exactly how to open this first call — set the tone, establish safety, what to say in the first 2 minutes. Keep it human, not clinical.",
  "check_in": "the first question — warm, not clinical, gets them talking immediately",
  "todays_focus": "what this intake accomplishes and why it matters for their specific goal",
  "agenda": [
    { "time": "0-5 min", "block": "Opening & safety", "notes": "what to do and say" },
    { "time": "5-15 min", "block": "Their story — why they're here", "notes": "what to ask and explore" },
    { "time": "15-25 min", "block": "Goal clarification", "notes": "what to nail down specifically" },
    { "time": "25-35 min", "block": "Baseline read", "notes": "what to observe and assess" },
    { "time": "35-45 min", "block": "Expectations + first assignment", "notes": "what to establish" },
    { "time": "45-50 min", "block": "Close + Session 2 teaser", "notes": "how to end and create anticipation" }
  ],
  "framework_or_topic_approach": null,
  "session_questions": ["8-10 intake questions in exact order — their story, goal, history, what they've tried, what they're afraid of, what success looks like. Write them out fully as you would say them."],
  "exercise": "one light baseline activity — low-stakes, gives you real data on where they are",
  "what_to_watch": ["4-5 specific behavioral signals to notice live — their trust pattern showing up, compliance style, hidden fear in action"],
  "if_they_resist": "what to say if they stay surface-level or deflect — specific language",
  "session_close": "how to close — what to summarize, what to commit to, how to set the relationship tone",
  "homework": "first assignment — small, specific, observable. Gives you data for Session 2 and gets them moving immediately.",
  "next_session_seed": "the teaser that creates anticipation for Session 2 — name the framework you're introducing and why it's built for them specifically",
  "sessions_roadmap": {
    "recommended_total": "number — default is 8, adjust up if the client needs more depth",
    "rationale": "1-2 sentences: why this count based on their profile, goal, trust pattern, and compliance style",
    "phase_1": "Sessions 1-2: Foundation — TALK Check, 3-Second Scan, FAS, 3-2-1 Send It, Barista Method",
    "phase_2": "Sessions 3-5: Core Skills — SPARK, DEPTH, GROUND + Pre-Game System + Energy Check",
    "phase_3": "Sessions 6-8: Advanced — VOICE, BRAVE, SHIELD + Stop Replaying"
  }
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
  return `You are the session planner for Social Code — a 1:1 social skills coaching practice built by Shavi, who grew up in Arnett Gardens, Kingston, Jamaica, knocked on 10,000+ doors in door-to-door sales, discovered Carl Jung, and built a complete system for social competence from scratch. Brand truth: "You're not broken. You're untrained." Approach: frameworks not feelings, systems not personality traits. Every session is built around a Social Code framework — not generic coaching advice.

Generate a complete, ready-to-run session plan. Pick up exactly where this client left off. Every session must anchor to a Social Code framework — that framework is the spine of the session.

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
Coach's Note: ${coachNote || "None."}

${frameworkSection}

Generate a JSON object with EXACTLY this structure. The framework_selected and framework_why fields are REQUIRED — never null for ongoing sessions:

{
  "session_title": "short punchy title that references the framework or the shift happening",
  "framework_selected": "the exact name of the Social Code framework anchoring this session",
  "framework_why": "2-3 sentences: why this framework is the right one for this person at this point in their arc — reference their profile, session history, and Jungian type",
  "opening": "exactly how to open this call — specific to where they are now, references last session if applicable",
  "check_in": "specific check-in question — references homework or last session directly",
  "todays_focus": "1-2 sentences: what this session builds and why now in their arc",
  "agenda": [
    { "time": "0-5 min", "block": "Opening & homework debrief", "notes": "what to do" },
    { "time": "5-20 min", "block": "block name", "notes": "what to cover" },
    { "time": "20-35 min", "block": "block name", "notes": "what to cover" },
    { "time": "35-45 min", "block": "block name", "notes": "what to cover" },
    { "time": "45-50 min", "block": "Close & assign", "notes": "what to do" }
  ],
  "framework_or_topic_approach": "exactly how to introduce and teach this framework for THIS specific person — tailored to their Jungian type, trust pattern, and where they are emotionally. What language to use, what resistance to expect, what analogy will land for them.",
  "session_questions": ["6-8 questions in exact order — grounded in the framework being taught, specific to this person's history and block"],
  "exercise": "the specific drill or practice activity — what it is, how to run it live in the session, how to frame it for this person's compliance style",
  "what_to_watch": ["3-4 behavioral signals to notice live — specific to this framework and this person's known patterns"],
  "if_they_resist": "word-for-word script for the most likely resistance this person will have to this framework — based on their trust pattern and hidden fear",
  "session_close": "how to close — what to acknowledge, what to celebrate, what to name as the shift",
  "homework": "exact homework tied to the framework — specific, observable, low enough stakes that they'll actually do it",
  "next_session_seed": "what to plant to create momentum — name what's coming in the next session",
  "sessions_roadmap": {
    "recommended_total": "number — default is 8, adjust up if the client needs more depth",
    "rationale": "1-2 sentences based on their goal, profile, and arc so far",
    "phase_1": "Sessions 1-2: Foundation — TALK Check, 3-Second Scan, FAS, 3-2-1 Send It, Barista Method",
    "phase_2": "Sessions 3-5: Core Skills — SPARK, DEPTH, GROUND + Pre-Game System + Energy Check",
    "phase_3": "Sessions 6-8: Advanced — VOICE, BRAVE, SHIELD + Stop Replaying"
  }
}

Return ONLY valid JSON. No markdown, no explanation, no code blocks.`;
}
