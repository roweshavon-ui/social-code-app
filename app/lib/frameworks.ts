export type FrameworkStep = {
  title: string;
  body: string;
};

export type Framework = {
  cluster: string;
  name: string;
  subtitle: string;
  situation: string;
  steps: FrameworkStep[];
  science: string;
  jungian: string;
  personal: string;
  keyPoint: string;
  systemNote?: string;
};

export const CLUSTERS = [
  "INITIATION",
  "DELIVERY & PRESENCE",
  "DEPTH & CONTINUITY",
  "CONFIDENCE & INNER GAME",
  "SPEAKING UP & GROUP DYNAMICS",
  "DIFFICULT CONVERSATIONS",
  "DIFFICULT PEOPLE",
  "RECOVERY & RESET",
] as const;

export const CLUSTER_COLORS: Record<string, { accent: string; bg: string }> = {
  "INITIATION":                   { accent: "#00D9C0", bg: "rgba(0,217,192,0.06)" },
  "DELIVERY & PRESENCE":          { accent: "#4DE8D4", bg: "rgba(77,232,212,0.06)" },
  "DEPTH & CONTINUITY":           { accent: "#00A896", bg: "rgba(0,168,150,0.06)" },
  "CONFIDENCE & INNER GAME":      { accent: "#FF6B6B", bg: "rgba(255,107,107,0.06)" },
  "SPEAKING UP & GROUP DYNAMICS": { accent: "#FFB347", bg: "rgba(255,179,71,0.06)" },
  "DIFFICULT CONVERSATIONS":      { accent: "#B388FF", bg: "rgba(179,136,255,0.06)" },
  "DIFFICULT PEOPLE":             { accent: "#FF8C8C", bg: "rgba(255,140,140,0.06)" },
  "RECOVERY & RESET":             { accent: "#64748B", bg: "rgba(100,116,139,0.06)" },
};

export const FRAMEWORKS: Framework[] = [
  // ── INITIATION ──────────────────────────────────────────────────────────
  {
    cluster: "INITIATION",
    name: "SPARK",
    subtitle: "Starting Conversations",
    situation: "The freeze before approaching. Waiting for the 'perfect' opener that never comes.",
    systemNote: "SPARK lives inside the Fearless Approach System (FAS) as Step 4. If your client is freezing before they even get to SPARK, start with FAS first.",
    steps: [
      {
        title: "S — Smile, Read the Room, Break the Ice",
        body: "Smile first (genuine, not performative). Scan body language, eye contact, energy level. Then break the ice with a real situational comment — something you both share in the room right now. Not a line. Not a compliment. Just honesty about the shared environment.\n\nGREEN: They mirror your smile, make eye contact, turn toward you.\nYELLOW: Polite acknowledgment, minimal engagement — try one more opener before moving on.\nRED: No eye contact, body angled away, disengaged — do not push.",
      },
      {
        title: "P — Present Yourself",
        body: "'I'm [name], by the way.' Simple, direct, confident. This creates reciprocity — they'll introduce themselves back.\n\nGREEN: They give their name + add something.\nYELLOW: Name only, flat affect — keep going.\nRED: Very brief, looks away — graceful exit is near.",
      },
      {
        title: "A — Ask Open-Ended Questions",
        body: "Get them talking. Ask about their experience, opinion, or story — not yes/no questions. Use the Echo Question Technique: pick up the last word or phrase they said and reflect it back as a question. ('Wait — you've been doing that for 10 years?')\n\nGREEN: They expand, ask you back, energy rises.\nYELLOW: Short answers, you're doing the work.\nRED: Monosyllabic, phone comes out — prep your exit.",
      },
      {
        title: "R — Really Listen",
        body: "Put down your agenda. Eye contact. Nod. Don't interrupt. Don't wait for your turn to talk. Listen for keywords — the topics they return to, the things they get louder about. Those are the threads.\n\nEcho Question Technique: mirror a keyword or phrase back as curiosity, not interrogation. The best listeners are the most interesting people in the room.",
      },
      {
        title: "K — Keep Connected or Kindly Exit",
        body: "GREEN: Exchange contact. Be direct: 'You seem like someone worth staying in touch with — can I get your info?'\nYELLOW: Graceful close: 'I'll let you get back to it — really good talking to you.'\nRED: Exit immediately: 'I'll let you go — enjoy the rest of your night.'\n\nConversation length guide: coffee shop 3-5 min, networking event 5-10 min, social venue 10-15 min. Exit on a high, never overstay.",
      },
    ],
    science: "The situational opener removes identity threat — you're commenting on the environment, not asking to be accepted. The Echo Question Technique triggers reciprocal disclosure. Mirror neurons fire when someone feels genuinely heard, creating instant rapport without performance.",
    jungian: "Most people never approach because their Persona (the social mask) hasn't been constructed yet — they don't know who to 'be.' SPARK bypasses that by giving the brain a structure, which quiets the ego long enough for natural connection to happen. The K step is the Persona's most powerful tool: graceful presence AND graceful exits.",
    personal: "Built after knocking 10,000+ doors in door-to-door sales across five states. The openers that worked every single time were never clever — they were real. A comment about the heat, the neighborhood, what was on their porch. The situational opener isn't a trick. It's just honesty.",
    keyPoint: "The S step doesn't have to be clever — it has to be real. And the K step matters as much as the S step. How you exit is how you're remembered.",
  },
  {
    cluster: "INITIATION",
    name: "3-Second Social Scan",
    subtitle: "Reading Whether Someone Wants to Be Approached",
    situation: "Talking yourself out of approaching based on fear, not data.",
    systemNote: "Step 2 of the Fearless Approach System (FAS). If your client is freezing before they even scan, start with FAS first.",
    steps: [
      {
        title: "Read 3 signals in 3 seconds",
        body: "(1) Eye contact or a glance in your direction — they noticed you.\n(2) Open body language — facing outward, not locked into a conversation or task.\n(3) Available — not on phone, not mid-sentence, not clearly rushing.\n\nIf 2 of 3 are present, the window is open. Move.",
      },
    ],
    science: "The amygdala processes social threat in milliseconds — it will always default to 'danger' without data. The scan gives the prefrontal cortex something real to work with, overriding the fear response with evidence.",
    jungian: "Approach anxiety is often the Shadow at work — the part of you that was once rejected and vowed to never risk it again. The Scan makes the decision process objective, which quiets the Shadow's veto power.",
    personal: "Developed during door-to-door sales when reading prospect energy became a survival skill. A closed door isn't rejection — it's data. A glance away isn't dismissal — it's information. The scan separates what's real from what the brain invents.",
    keyPoint: "You're not deciding if they'll like you. You're reading if the window is open. Those are completely different questions.",
  },
  {
    cluster: "INITIATION",
    name: "Fearless Approach System",
    subtitle: "End-to-End Approach Anxiety Elimination",
    situation: "The full cycle — freeze, internal narrative, missed window, post-event replay.",
    steps: [
      { title: "1. Permission Slip", body: "Internal reframe before approaching: 'I'm allowed to talk to people. I don't need a reason.'" },
      { title: "2. Target Selection", body: "Run the 3-Second Social Scan." },
      { title: "3. Approach Window", body: "Move within 3 seconds of deciding — every second of hesitation doubles the anxiety." },
      { title: "4. Opening", body: "Use SPARK." },
      { title: "5. Exit Strategy", body: "Have a graceful out ready before you approach ('I'll let you get back to it') so you never feel trapped. When you know you can leave, entering feels safe." },
    ],
    science: "Hesitation activates the sympathetic nervous system (fight/flight). The 3-second rule interrupts that cascade before it builds. The exit strategy removes 'escape anxiety' — when you know you can leave, entering feels safe.",
    jungian: "The Permission Slip is Shadow work made practical. Most approach anxiety isn't fear of rejection — it's the unconscious belief that you don't have the right to take up space. Jung: 'Until you make the unconscious conscious, it will direct your life and you will call it fate.'",
    personal: "Shavi engineered exits around crowds as a child — switching sports teams to avoid walking past groups of people. FAS is the system he built to rewire that. Every component came from a real failure first: the missed window, the trapped feeling, the freeze.",
    keyPoint: "Most approach anxiety is a permission problem, not a skill problem. Fix the permission, the skills follow.",
  },
  {
    cluster: "INITIATION",
    name: "3-2-1 Send It",
    subtitle: "Stopping Overthinking and Pulling the Trigger",
    situation: "Paralysis before low-stakes social actions — sending a text, walking over, saying hello, raising your hand.",
    steps: [
      {
        title: "Count 3, 2, 1 — then move",
        body: "When you notice yourself over-analyzing a simple social action — count 3, 2, 1 out loud or in your head and physically move before you finish. No more thinking once you hit 1. The goal isn't to feel ready. The goal is to move before the brain talks you out of it.",
      },
    ],
    science: "Overthinking activates the default mode network (the brain's self-referential loop). The countdown interrupts that loop with a motor command — action short-circuits rumination. Mel Robbins' 5-Second Rule methodology demonstrates that counting backward disrupts the habit of hesitation.",
    jungian: "The overthinking is the Persona protecting itself — it would rather miss the moment than risk looking foolish. 3-2-1 Send It is a way to act from the Self instead of the Persona. It's not about being fearless. It's about moving anyway.",
    personal: "The next door was always waiting. In 10,000 doors of sales, the ones he almost didn't knock were often the ones that changed everything. Not because he was ready. Because he moved.",
    keyPoint: "You're never going to feel ready. Ready is a feeling your brain manufactured to keep you safe. Move at 1.",
  },
  {
    cluster: "INITIATION",
    name: "Barista Method",
    subtitle: "Building Social Reps in Zero-Stakes Environments",
    situation: "Not having enough real-world practice. Treating every interaction like it matters too much to risk.",
    steps: [
      {
        title: "Use service interactions as daily training",
        body: "Use service-based interactions (coffee shop, grocery store, rideshare, front desk) as daily low-stakes training grounds. Pick one skill per week to practice (opener, eye contact, asking a follow-up question, using their name). The goal isn't to make a friend — it's to get a rep in.",
      },
    ],
    science: "Skill acquisition follows spaced repetition — you need volume of reps to build the neural pathways for social fluency. Most people never practice because every interaction feels high-stakes. The Barista Method creates a daily practice environment with zero identity risk.",
    jungian: "The Persona develops through interaction, not intention. You don't build a social identity by thinking about it — you build it by using it. Every Barista rep is a small act of individuation — you're choosing to engage instead of withdraw.",
    personal: "The door-to-door years were essentially the Barista Method at industrial scale — 20-30 cold interactions per day, every day, until conversation stopped being an event and started being a muscle. You don't need a sales route. You need a coffee order.",
    keyPoint: "You're not trying to impress the barista. You're training your nervous system to stop treating conversation as a threat.",
  },

  // ── DELIVERY & PRESENCE ─────────────────────────────────────────────────
  {
    cluster: "DELIVERY & PRESENCE",
    name: "TALK Check",
    subtitle: "Delivery Layer for Any Interaction",
    situation: "Saying the right words but still not landing. Coming across as flat, robotic, nervous, or low-energy.",
    steps: [
      { title: "T — Tone", body: "Is your tone warm and grounded, or flat and anxious? Take one conscious breath before you speak. That single breath shifts you from anxious to grounded." },
      { title: "A — Attention", body: "Are you fully present — real eye contact, body facing them, not scanning the room? Eye contact triggers oxytocin. Breaking it during key moments signals insecurity." },
      { title: "L — Language", body: "Are you matching their vocabulary, using zero filler words, speaking in complete thoughts? Filler words ('um', 'like', 'you know') bleed confidence before the content lands." },
      { title: "K — Kinetics", body: "Body language, proximity, stillness — open posture, no fidgeting, movement that's intentional. Closed posture and fidgeting send 'I don't belong here' before you say a word." },
    ],
    science: "University of Glasgow research: vocal impressions form in 300-500 milliseconds. The amygdala reads attention cues faster than the brain processes words. Research consistently shows that non-verbal signals carry the majority of emotional meaning in social interactions, far outweighing the words themselves.",
    jungian: "Flat delivery is often a Persona problem — the social mask is performing safety ('don't take up too much space') instead of presence. Warmth requires the ego to step back. TALK Check gives people a concrete checklist for what genuine presence looks like when it's constructed intentionally.",
    personal: "Built through door-to-door sales where a prospect decided if they'd open the door in the first 3 seconds of hearing his voice. Not his pitch — his voice. He learned to lead with tone, not content. The T in TALK comes first for a reason.",
    keyPoint: "Tone is the first signal. If the tone is off, nothing else matters. Fix T before anything else.",
  },

  // ── DEPTH & CONTINUITY ──────────────────────────────────────────────────
  {
    cluster: "DEPTH & CONTINUITY",
    name: "DEPTH",
    subtitle: "Taking Conversations from Surface to Real",
    situation: "Running out of things to say. Conversations that stay shallow or die after small talk. Not knowing how to go deeper without it feeling forced.",
    steps: [
      { title: "D — Disclose First", body: "Before you ask a personal question, give a small piece of yourself — reciprocity pulls them in. You go first, they follow." },
      { title: "E — Emotion Over Information", body: "Follow the feeling behind what they say, not just the facts. 'That sounds like it was a lot' lands deeper than 'wow really?'" },
      { title: "P — Pause with Purpose", body: "Resist the urge to fill silence — a 2-3 second pause after something meaningful signals you actually heard it." },
      { title: "T — Thread Back", body: "Reference something they said earlier: 'you mentioned earlier that...' — shows you're present, not performing." },
      { title: "H — Hand the Ball", body: "Add your angle on the topic, then return the question using the Echo Question Technique from SPARK. Conversation is tennis, not a press conference." },
      {
        title: "The Depth Ladder — 4 levels of conversation",
        body: "Level 1 — Facts & Pleasantries: weather, logistics, safe surface talk. Everyone starts here. Move through it, don't stay.\nLevel 2 — Opinions & Preferences: what they like, think, or would choose. 'What did you think of that?' opens Level 2.\nLevel 3 — Values & Experiences: what shaped them, what they care about, what they've been through. This is where real connection starts.\nLevel 4 — Vulnerabilities & Aspirations: what they're afraid of, what they're working toward, what they haven't told many people. Rare. Never forced.",
      },
      {
        title: "The Bridge Technique — 3 tools for moving between levels",
        body: "(1) Why Follow-Up: after any Level 2 answer, ask 'what made you feel that way?' — pulls them to Level 3 naturally.\n(2) Vulnerability Match: disclose at the level you want to reach before asking them to go there. You go first, they follow.\n(3) Observation Pivot: instead of a question, name what you noticed. 'You light up when you talk about that.' Often opens Level 3-4 without a question at all.",
      },
    ],
    science: "Reciprocal self-disclosure is one of the most well-documented drivers of intimacy (Jourard, 1971). People don't open up when asked — they open up when they feel safe enough to match your level. The Depth Ladder gives both coach and client a shared map for where conversations are and where they could go.",
    jungian: "Surface conversation is Persona-to-Persona contact — two masks talking. Real connection happens when the Self makes contact with another Self. DEPTH is the path from mask to person. Level 4 of the Depth Ladder is where individuation shows up in relationship — two people choosing to be real instead of performing.",
    personal: "After his father passed at 16, Shavi realized quality time was his love language — not time in the same room, but time that actually meant something. DEPTH is his answer to conversations that feel like they happened but left nothing behind.",
    keyPoint: "You don't go deeper by asking deeper questions. You go deeper by disclosing first. The Depth Ladder shows you the levels. The Bridge Technique gets you there. But Vulnerability Match — going first — is the only move that actually works.",
  },

  // ── CONFIDENCE & INNER GAME ─────────────────────────────────────────────
  {
    cluster: "CONFIDENCE & INNER GAME",
    name: "GROUND",
    subtitle: "Social Confidence and Inner Game",
    situation: "Feeling like you shrink in social situations. Needing approval. Performing instead of connecting. Confidence that disappears the moment someone seems unimpressed.",
    systemNote: "GROUND is the mindset framework — it builds who you are over time. The Pre-Game System is the activation ritual built on top of it.",
    steps: [
      { title: "G — Get Identity Before You Enter", body: "Name 3 things that are true about you that have nothing to do with how this goes. This is your foundation, not a pre-event ritual. For the timed version before high-stakes events, use the Pre-Game System — it activates this step." },
      { title: "R — Remove the Audition", body: "Reframe: you're not auditioning to be liked, you're choosing who to spend time with. You have a vote too." },
      { title: "O — Own the Pause", body: "Practice one beat of comfortable silence before you respond to anything — it signals confidence that most people never see." },
      { title: "U — Understand the Approval Loop", body: "Your anxiety spikes because your nervous system was trained to read approval as safety. This is not truth, it's conditioning." },
      { title: "N — Neutralize the Story", body: "Before you walk in, name the story you're telling about what they'll think. Then ask: is this a fact or an assumption?" },
      { title: "D — Deploy with No Agenda", body: "Enter with nothing to prove — curiosity, not performance." },
    ],
    science: "Confidence is a byproduct of competence, not a prerequisite. The brain reads your own behavior as evidence about who you are (self-perception theory, Bem 1972). The pause, the reframe, the 'no agenda' entry — these send your nervous system a different signal.",
    jungian: "Approval-seeking is the Persona overextended — so invested in how it looks that the Self can't get through. GROUND is about re-rooting in the Self before entering the social field. The G step is individuation in practice: knowing who you are independent of the room's response.",
    personal: "Grew up without a father from age 16, rebuilt from scratch in a new country, knocked on 30 doors a day getting rejected to his face. Confidence didn't come from affirmations — it came from building competence until the outcomes started changing. 'Confidence is the byproduct, not the goal.'",
    keyPoint: "You don't need to feel confident before you walk in. You need to know who you are before you walk in. Those are completely different things.",
  },
  {
    cluster: "CONFIDENCE & INNER GAME",
    name: "Pre-Game System",
    subtitle: "Confidence Preparation Before Any Social Situation",
    situation: "Showing up to important social situations already anxious, low-energy, or in the wrong headspace.",
    systemNote: "Built on GROUND as the foundation. Teach GROUND first — the Pre-Game System activates it for specific events.",
    steps: [
      { title: "1. Energy Audit", body: "Check your battery using the Energy Check system — GREEN = present and ready, go deep; YELLOW = functional but running thin, manage commitments; RED = depleted, minimum viable engagement or reschedule. Do not enter a high-stakes event in RED without a plan." },
      { title: "2. Identity Lock", body: "Activate the G step from GROUND — name 2-3 things that are true about you independent of how this goes. Say them out loud, not just in your head. GROUND builds the identity over time; Identity Lock fires it up for right now." },
      { title: "3. Intention Set", body: "Decide what you're going for — not 'make them like me' but something specific and controllable: 'ask one good question,' 'stay present,' 'make them laugh once.' Walk in with an intention you can actually achieve." },
    ],
    science: "Pre-performance routines (used by athletes, surgeons, and musicians) reduce cortisol and improve execution consistency. Setting an achievable intention shifts the brain from threat-detection mode to goal-pursuit mode — a fundamentally different neurological state.",
    jungian: "The Pre-Game System is preparation for conscious Persona use — you're choosing who to be instead of defaulting to whoever fear makes you. Identity Lock is about accessing the Self before the Persona takes over.",
    personal: "Before the biggest sales days — and later, before coaching client calls — the ritual mattered. Not to feel ready (you never fully feel ready) but to show up intentional instead of reactive.",
    keyPoint: "Most people walk into social situations hoping for a good outcome. The Pre-Game System is about deciding what you're going to do, not hoping for how it'll go.",
  },
  {
    cluster: "CONFIDENCE & INNER GAME",
    name: "Energy Check",
    subtitle: "Social Energy Management and Strategic Engagement",
    situation: "Burning out socially. Dreading interactions you used to enjoy. Over-committing and arriving depleted. Introvert exhaustion.",
    steps: [
      {
        title: "Reading YOUR battery",
        body: "GREEN: Fully present, engaged, can initiate and sustain — this is for depth.\nYELLOW: Functional, can respond well but shouldn't initiate high-effort connection — maintenance only.\nRED: Depleted, protect your energy, minimum viable engagement only — this is for recovery.",
      },
      {
        title: "Reading THEIR energy — 3 signals",
        body: "(1) Body Orientation: turned toward you = GREEN. Angled but responsive = YELLOW. Fully turned away = RED.\n(2) Facial Expression: engaged and animated = GREEN. Neutral and polite = YELLOW. Flat or distracted = RED.\n(3) Situation Context: natural pause, nowhere to be = GREEN. Mid-task but not rushing = YELLOW. Clearly busy or in motion = RED.\n\nCombine all three. 2/3 RED signals = don't initiate, or wrap up quickly.",
      },
    ],
    science: "Ego depletion research (Baumeister) shows that self-regulation — which social interaction requires — draws from a finite resource that depletes across a day. Introverts especially show cortisol spikes from prolonged social engagement. The Energy Check is not about avoidance — it's about sustainability.",
    jungian: "For introverts, energy flows inward — social engagement is energy expenditure, not energy intake. Jungian introversion means the unconscious needs quiet to process. Ignoring this doesn't make you more social — it makes you more reactive and less genuine when you are social.",
    personal: "Coaching 20 clients a week while building a brand taught him fast: you cannot show up for everyone if you show up depleted for everyone. The first time he turned down a social event because he knew his battery was RED, it felt like failure. It was actually intelligence.",
    keyPoint: "You don't build a social life by showing up exhausted everywhere. You build it by being fully present somewhere. And reading THEIR energy is just as important as knowing yours.",
  },

  // ── SPEAKING UP & GROUP DYNAMICS ────────────────────────────────────────
  {
    cluster: "SPEAKING UP & GROUP DYNAMICS",
    name: "VOICE",
    subtitle: "Speaking Up in Groups and Claiming Your Space",
    situation: "Going quiet in group settings. Having thoughts and not saying them. Speaking up and getting talked over. Feeling invisible at tables where you should be contributing.",
    steps: [
      { title: "V — Validate Your Thought Before You Speak", body: "Internal permission slip: 'this is worth saying' — before you open your mouth, not after. The permission has to come from you." },
      { title: "O — Open Early", body: "In any group setting, speak once in the first 5 minutes — doesn't have to be profound, just real. After one contribution you've claimed your space at the table." },
      { title: "I — Insert with Intent", body: "Cut in without apologizing — 'building on that—' or 'quick point—' not 'sorry, can I just—'. Apology language signals low status before a single word of content lands." },
      { title: "C — Claim the Space", body: "Match your volume to the room. Pause before you start. Don't trail off — finish your thought like it matters." },
      { title: "E — End Strong", body: "Complete your point fully before you hand the thread. Never trail off mid-thought because someone looks like they want to talk." },
    ],
    science: "Early contributors are perceived as higher status and more competent — the primacy effect means your first contribution sets your social position at the table. Research on group dynamics confirms that apology language before speaking signals low status before a single word of content lands.",
    jungian: "Going quiet in groups is often Shadow material — the assertive, opinionated self that was once silenced or dismissed. VOICE is shadow integration work: reclaiming the part of yourself that was trained to shrink. The V step makes the permission conscious instead of waiting for the group to grant it.",
    personal: "Grew up in a household where the adults dominated the room. Learned that silence was often the safest option. VOICE is the framework for unlearning that — not becoming someone who talks more, but becoming someone who speaks when they have something real to say, and says it like it counts.",
    keyPoint: "You're not trying to dominate the room. You're claiming your seat at the table. Those are completely different energy. Validate the thought first — that's the entire system in one step.",
  },

  // ── DIFFICULT CONVERSATIONS ─────────────────────────────────────────────
  {
    cluster: "DIFFICULT CONVERSATIONS",
    name: "BRAVE",
    subtitle: "Navigating Difficult Conversations",
    situation: "Avoiding conversations that need to happen. Letting things fester. Passive-aggressive patterns. Ghosting instead of addressing issues directly.",
    steps: [
      { title: "B — Begin Calm", body: "Check timing and regulate yourself BEFORE you start. Ask: is this the right moment? Are you regulated enough to have this? A dysregulated opener poisons the whole conversation." },
      { title: "R — Regulate", body: "Stay regulated throughout — don't let their state hijack yours. If they escalate, you slow down. You are the anchor, not the mirror." },
      { title: "A — Ask Their Perspective", body: "Before you state yours — ask what they think or how they experienced it. Their answer changes everything. Most people skip this step and wonder why the other person gets defensive." },
      { title: "V — Validate", body: "Even if you disagree with them. 'I can see why that landed that way' is not agreement — it's acknowledgment. Validation opens the door; judgment closes it." },
      { title: "E — Explore Solutions", body: "Don't force resolution before they're ready. Once both perspectives are on the table and validated, look for what could change — but only when they're ready to move there." },
      {
        title: "Reading their state",
        body: "GREEN: They engage, share their perspective, tone is open — proceed through A, V, E.\nYELLOW: They go quiet or seem guarded — slow down, deepen A and V, don't push toward E yet.\nRED: They shut down, escalate, or leave — pause everything, return to R (regulate yourself), use V ('I'm not here to attack you — I genuinely want to understand'), don't move to E until you're back in YELLOW.",
      },
    ],
    science: "Confrontation avoidance is maintained by anticipated pain — the brain predicts the conversation will go worse than it does. The B step (Begin calm) prevents the dysregulated opener that confirms that fear. The A step keeps the other person's prefrontal cortex online — people defend against conclusions, not questions.",
    jungian: "The confrontation-avoidant person has a dominant Feeling function and an underdeveloped Shadow — the part of them that can hold a boundary. BRAVE gives the Feeling type a structure to have the hard conversation without abandoning empathy. The A step is the Feeling function's power move — it keeps connection alive while still saying what needs to be said.",
    personal: "Built through watching the damage that unsaid things do over time. The conversations people avoid for months are always the ones that, once had, take 20 minutes. BRAVE is the permission structure for having them.",
    keyPoint: "Begin calm — regulate yourself BEFORE you start. A dysregulated opener poisons the whole conversation before a word of substance is said.",
  },

  // ── DIFFICULT PEOPLE ─────────────────────────────────────────────────────
  {
    cluster: "DIFFICULT PEOPLE",
    name: "SHIELD",
    subtitle: "Handling Difficult People and Energy Drains",
    situation: "Feeling powerless around difficult people. Taking the bait. Walking away from interactions feeling worse every single time.",
    steps: [
      { title: "S — Stay Calm, Assess Danger", body: "Before anything else — are they escalating? Is this venting, provocation, or a genuine threat? Name it internally: 'This is a difficult moment, not an emergency.' Your threat response fires first; this step keeps your prefrontal cortex online." },
      { title: "H — Hold Boundary", body: "Name what's not okay, calmly and directly: 'That language isn't okay with me.' No lecture, no escalation, no softening. State it once. You don't need them to agree — you need to have said it." },
      { title: "I — Gray Rock", body: "Short, bland, non-reactive responses if they continue. You become uninteresting. Difficult behavior is often rewarded by reaction — remove the reward. 'Okay.' 'I hear you.' 'Mm.' No emotional fuel." },
      { title: "E — Prepare Exit Strategy", body: "Before you need it, know what you'll do if this escalates. What's your line? What do you say? Where do you go? Pre-committing means you don't have to decide in a hot moment — you just execute." },
      { title: "L — Leave", body: "'I'm going to end this conversation.' Then do it. No lengthy explanation. No JADE (Justify, Argue, Defend, Explain). The sentence is complete as stated. Leaving is not losing — it's choosing your energy." },
      { title: "D — Decompress Afterward", body: "You absorbed something. You don't just walk it off. Name what happened, shake it out physically, don't replay — decompress deliberately. SHIELD ends here, not at L." },
      {
        title: "Reading the situation",
        body: "GREEN: They're venting but not escalating — H and I are enough, stay present.\nYELLOW: Boundary repeated or ignored, tension rising — move toward E, prepare to exit.\nRED: Escalating, aggressive, or you're losing your ground — skip to L immediately, decompress after.",
      },
    ],
    science: "Reactivity is the result of the amygdala hijack — the emotional brain fires before the rational brain can respond. The S step (Stay calm, assess) is a pattern interrupt that keeps the prefrontal cortex online. Gray rock (I step) removes intermittent reinforcement — the mechanism that makes difficult behavior persistent.",
    jungian: "Difficult people often activate our own Shadow — the things about them that bother us most are frequently projections of what we haven't integrated in ourselves. SHIELD isn't about winning against them. It's about staying in contact with yourself while they're doing what they do.",
    personal: "Grew up around people who used volatility as control. Learned early that reacting gave them what they were after. The power move is non-reaction — not coldness, but groundedness. SHIELD was built from that.",
    keyPoint: "The moment you react emotionally, you've handed them control. Gray rock removes the reward. Every time.",
  },

  // ── RECOVERY & RESET ─────────────────────────────────────────────────────
  {
    cluster: "RECOVERY & RESET",
    name: "Stop Replaying",
    subtitle: "Breaking the Post-Social Overthink Loop",
    situation: "Replaying conversations for hours or days afterward. Finding evidence of embarrassment in things that didn't matter. Pre-living future situations as disasters.",
    steps: [
      { title: "1. Interrupt", body: "Physical pattern break the moment you catch yourself replaying — stand up, say 'stop' out loud, change rooms, change tasks. You cannot think your way out of the loop. Break it with your body first." },
      { title: "2. Conversation Audit", body: "(1) What actually happened — just facts.\n(2) What story you're telling about it.\n(3) What evidence contradicts that story.\n(4) What you'd tell a friend in the same situation.\n(5) What you can do differently next time." },
      { title: "3. Redirect Protocol", body: "3-minute emergency stop for the 2AM spiral — write the thing that's looping, write one sentence of what's true, write one thing you're doing tomorrow. Close it. Don't reopen it." },
    ],
    science: "Social rejection activates the same neural pain pathways as physical pain (Eisenberger, 2003). The brain's three-step survival loop — detect rejection, analyze for cause, prevent future occurrence — never fully switches off in people with social anxiety. The Interrupt step physically disrupts this loop before it escalates.",
    jungian: "The replay loop is the Ego in crisis — trying to manage its public image retroactively. Stop Replaying is a way to call the Ego off and return to the Self. The Redirect Protocol closes the loop the Ego refuses to close on its own.",
    personal: "Built after watching smart, capable people spiral for days over conversations that the other person forgot in 20 minutes. The replay is never about what happened. It's about what it means about you. That's the only question worth answering — and the Conversation Audit answers it directly.",
    keyPoint: "The Interrupt has to be physical. You cannot think your way out of the loop. Your body has to move first — then your mind can follow.",
  },
];

export const FRAMEWORK_NAMES = FRAMEWORKS.map((f) => f.name);

export function getFramework(name: string): Framework | undefined {
  return FRAMEWORKS.find((f) => f.name === name);
}

export function getFrameworksByCluster(cluster: string): Framework[] {
  return FRAMEWORKS.filter((f) => f.cluster === cluster);
}
