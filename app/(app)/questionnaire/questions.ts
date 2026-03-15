export type Dimension = "EI" | "SN" | "TF" | "JP" | "BH";

export type Question = {
  id: number;
  dimension: Dimension;
  text: string;
  a: { label: string; scores: "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P" };
  b: { label: string; scores: "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P" };
};

export type BehavioralQuestion = {
  id: number;
  dimension: "BH";
  text: string;
  a: { label: string; signal: string };
  b: { label: string; signal: string };
};

export const QUESTIONS: Question[] = [
  // E vs I
  {
    id: 1, dimension: "EI",
    text: "After a draining week, you most want to...",
    a: { label: "See friends or go out — being around people helps you recharge", scores: "E" },
    b: { label: "Have alone time — solitude is how you recover", scores: "I" },
  },
  {
    id: 2, dimension: "EI",
    text: "When you have a problem to solve, you tend to...",
    a: { label: "Talk it out — thinking out loud helps you figure it out", scores: "E" },
    b: { label: "Sit with it — you work things out in your head first", scores: "I" },
  },
  {
    id: 3, dimension: "EI",
    text: "In social situations, you usually...",
    a: { label: "Feel energized — you like meeting new people and getting into conversations", scores: "E" },
    b: { label: "Feel drained over time — you need to manage how long you're 'on'", scores: "I" },
  },
  {
    id: 4, dimension: "EI",
    text: "Your social preference is...",
    a: { label: "A wide circle — you like knowing a lot of people", scores: "E" },
    b: { label: "A few close ones — depth over breadth, always", scores: "I" },
  },
  {
    id: 5, dimension: "EI",
    text: "When you're in a group discussion, you...",
    a: { label: "Jump in — you think by speaking and like the exchange", scores: "E" },
    b: { label: "Observe first — you prefer to have something real to say before you say it", scores: "I" },
  },

  // S vs N
  {
    id: 6, dimension: "SN",
    text: "When learning something new, you prefer...",
    a: { label: "Concrete examples and step-by-step instructions", scores: "S" },
    b: { label: "The big picture first — why it matters and how it fits together", scores: "N" },
  },
  {
    id: 7, dimension: "SN",
    text: "You trust more...",
    a: { label: "Experience and what you can observe and verify", scores: "S" },
    b: { label: "Gut instinct and pattern recognition", scores: "N" },
  },
  {
    id: 8, dimension: "SN",
    text: "In conversations, you tend to notice...",
    a: { label: "The specifics — what was said, the details, the facts", scores: "S" },
    b: { label: "The subtext — what wasn't said, the underlying meaning", scores: "N" },
  },
  {
    id: 9, dimension: "SN",
    text: "You're more energized by...",
    a: { label: "What is — practical, real, tangible things", scores: "S" },
    b: { label: "What could be — possibilities, ideas, what hasn't been done yet", scores: "N" },
  },
  {
    id: 10, dimension: "SN",
    text: "When working on a project, you prefer to...",
    a: { label: "Follow a proven method — what works is what matters", scores: "S" },
    b: { label: "Explore new approaches — standard methods feel limiting", scores: "N" },
  },

  // T vs F
  {
    id: 11, dimension: "TF",
    text: "When making a hard decision, you lead with...",
    a: { label: "Logic — what's most rational and objectively correct", scores: "T" },
    b: { label: "Values — what aligns with what matters to you and the people involved", scores: "F" },
  },
  {
    id: 12, dimension: "TF",
    text: "When a friend comes to you upset, your first instinct is to...",
    a: { label: "Help them solve the problem — fix what's causing the pain", scores: "T" },
    b: { label: "Just be there — they need to feel heard before anything else", scores: "F" },
  },
  {
    id: 13, dimension: "TF",
    text: "In a disagreement, you focus more on...",
    a: { label: "Whether the argument is logically sound", scores: "T" },
    b: { label: "How everyone involved is feeling", scores: "F" },
  },
  {
    id: 14, dimension: "TF",
    text: "You value more...",
    a: { label: "Being honest, even if it's uncomfortable", scores: "T" },
    b: { label: "Being kind — tact matters as much as truth", scores: "F" },
  },
  {
    id: 15, dimension: "TF",
    text: "Critical feedback lands better for you when it's...",
    a: { label: "Direct and specific — just tell me what's wrong", scores: "T" },
    b: { label: "Delivered with care — how it's said matters as much as what's said", scores: "F" },
  },

  // J vs P
  {
    id: 16, dimension: "JP",
    text: "Your approach to plans is...",
    a: { label: "Make them early and stick to them — structure helps you perform", scores: "J" },
    b: { label: "Keep things flexible — you work best when you can adapt", scores: "P" },
  },
  {
    id: 17, dimension: "JP",
    text: "Deadlines feel like...",
    a: { label: "Non-negotiable — you'd rather finish early than late", scores: "J" },
    b: { label: "A general target — you do your best work close to the wire", scores: "P" },
  },
  {
    id: 18, dimension: "JP",
    text: "Your workspace or living space tends to be...",
    a: { label: "Organized — you think more clearly when things are in order", scores: "J" },
    b: { label: "Lived-in — you know where things are, even if it looks chaotic", scores: "P" },
  },
  {
    id: 19, dimension: "JP",
    text: "When given options, you prefer to...",
    a: { label: "Make the call — you feel better once it's decided", scores: "J" },
    b: { label: "Keep them open — committing too early feels limiting", scores: "P" },
  },
  {
    id: 20, dimension: "JP",
    text: "Unfinished tasks...",
    a: { label: "Bother you until they're done — closure matters", scores: "J" },
    b: { label: "Don't stress you out much — things get done when they get done", scores: "P" },
  },
];

// ── Behavioral Signal Questions (IDs 21–30) ─────────────────
// These look like personality questions but capture Chase Hughes behavioral signals.
// Only the answer_map is stored — the AI reads the signals to generate the profile.

export const BEHAVIORAL_QUESTIONS: BehavioralQuestion[] = [
  {
    id: 21, dimension: "BH",
    text: "When meeting someone new, what matters most to you?",
    a: { label: "That they see what you're capable of and respect what you bring to the table", signal: "need_significance" },
    b: { label: "That they like you, feel comfortable around you, and want to be around you", signal: "need_approval" },
  },
  {
    id: 22, dimension: "BH",
    text: "In a new group, your main internal concern is usually...",
    a: { label: "Whether they'll welcome you and you'll naturally fit in", signal: "need_acceptance" },
    b: { label: "Whether they'll take your perspective seriously and see you as sharp", signal: "need_intelligence" },
  },
  {
    id: 23, dimension: "BH",
    text: "When something goes wrong in a social situation, your first thought is...",
    a: { label: "What could I have done differently? You look at your own role first", signal: "locus_internal" },
    b: { label: "The situation or the other person played a big part — context matters", signal: "locus_external" },
  },
  {
    id: 24, dimension: "BH",
    text: "Before making an important personal decision, you typically...",
    a: { label: "Think it through yourself and trust your own judgment", signal: "decision_independent" },
    b: { label: "Talk it through with people you trust before committing", signal: "decision_validation" },
  },
  {
    id: 25, dimension: "BH",
    text: "When faced with real social tension or conflict, your instinct is to...",
    a: { label: "Address it directly — you'd rather deal with it than let it sit", signal: "stress_confront" },
    b: { label: "Step back and get space — you process better when you're not in the heat of it", signal: "stress_retreat" },
  },
  {
    id: 26, dimension: "BH",
    text: "With someone new, your trust...",
    a: { label: "Builds over time — you watch for consistency before you really open up", signal: "trust_slow" },
    b: { label: "Can come quickly — when someone feels right, you know early", signal: "trust_fast" },
  },
  {
    id: 27, dimension: "BH",
    text: "When experts or popular opinion say one thing but your gut says another...",
    a: { label: "You take their view seriously — they likely know something you don't", signal: "authority_responsive" },
    b: { label: "You go with your own read — you'll verify for yourself", signal: "authority_resistant" },
  },
  {
    id: 28, dimension: "BH",
    text: "What drives your personal growth most?",
    a: { label: "Proving to yourself — and maybe others — that you can rise above something", signal: "drive_proving" },
    b: { label: "Simply wanting a better version of your life — no audience needed", signal: "drive_internal" },
  },
  {
    id: 29, dimension: "BH",
    text: "In a group where you're the only one with a different opinion, you...",
    a: { label: "Voice it — you'd rather be honest than go along with something you don't believe", signal: "social_independent" },
    b: { label: "Usually go with the group unless it's really important to you", signal: "social_conformist" },
  },
  {
    id: 30, dimension: "BH",
    text: "When reading a person or situation, you trust most...",
    a: { label: "What you can observe — their actions, patterns, behavior over time", signal: "channel_behavioral" },
    b: { label: "The overall feeling you get — your gut sense of the whole situation", signal: "channel_intuitive" },
  },
];

export const ALL_QUESTIONS: (Question | BehavioralQuestion)[] = [
  ...QUESTIONS,
  ...BEHAVIORAL_QUESTIONS,
];

export type TypeResult = {
  type: string;
  scores: { E: number; I: number; S: number; N: number; T: number; F: number; J: number; P: number };
  description: string;
  socialStrengths: string[];
  socialChallenges: string[];
  recommendedFrameworks: string[];
  practiceScenarios: string[];
};

export function calculateType(answers: Record<number, "a" | "b">): TypeResult {
  const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

  for (const q of QUESTIONS) {
    const answer = answers[q.id];
    if (!answer) continue;
    const chosen = answer === "a" ? q.a : q.b;
    scores[chosen.scores]++;
  }

  const type =
    (scores.E >= scores.I ? "E" : "I") +
    (scores.S >= scores.N ? "S" : "N") +
    (scores.T >= scores.F ? "T" : "F") +
    (scores.J >= scores.P ? "J" : "P");

  return { type, scores, ...TYPE_PROFILES[type] ?? TYPE_PROFILES["INFP"] };
}

const TYPE_PROFILES: Record<string, Omit<TypeResult, "type" | "scores">> = {
  INTJ: {
    description: "Strategic, independent, and driven by long-term vision. You see patterns others miss and you work best with clear frameworks and minimal social noise.",
    socialStrengths: ["Deep 1-on-1 conversations", "Strategic networking — few but meaningful connections", "Directness that people respect once they know you"],
    socialChallenges: ["Small talk feels pointless and draining", "Can come across as cold or aloof", "Difficulty showing warmth even when you feel it"],
    recommendedFrameworks: ["Fearless Approach System", "TALK Check", "3-Second Social Scan"],
    practiceScenarios: ["Networking at an industry conference", "Making small talk at a work social event", "Starting a conversation at a party where you know nobody", "One-on-one meeting with your manager", "Making small talk with the person next to you on a flight"],
  },
  INTP: {
    description: "Analytical, curious, and deeply internal. You love ideas more than social rituals, but when you find the right person, you can go deep fast.",
    socialStrengths: ["Genuine intellectual depth in conversation", "Not performative — people sense your authenticity", "One high-quality conversation beats 20 surface ones"],
    socialChallenges: ["Small talk feels like a waste of processing power", "Can over-explain or get lost in your own logic", "Difficulty initiating without a clear 'reason'"],
    recommendedFrameworks: ["SPARK", "Fearless Approach System", "Stop Replaying"],
    practiceScenarios: ["Starting a conversation at a party where you know nobody", "Asking someone out on a first date", "Networking at an industry conference", "Joining a group conversation already in progress", "Reaching out to an old friend after a long gap"],
  },
  ENTJ: {
    description: "Commanding, strategic, and naturally assertive. You're not the social problem — but you may steamroll quieter people without meaning to.",
    socialStrengths: ["Natural leadership presence", "Confident initiator — approach anxiety is minimal", "Excellent at rallying people around a vision"],
    socialChallenges: ["Can dominate conversations", "Impatience with emotional processing", "May prioritize efficiency over connection"],
    recommendedFrameworks: ["BRAVE", "SHIELD", "TALK Check"],
    practiceScenarios: ["Listening without offering solutions — a friend needs to vent", "Having a difficult conversation without steamrolling", "Setting a boundary with someone without being harsh", "Recovering after saying something too blunt", "Being vulnerable with a friend about something personal"],
  },
  ENTP: {
    description: "Quick, curious, and energized by debate. You connect easily but can leave people feeling out-debated rather than heard.",
    socialStrengths: ["Natural conversationalist — quick wit and range", "Energized by new people and ideas", "Great at finding common ground through discussion"],
    socialChallenges: ["Can argue for sport and not realize the impact", "Boredom in routine social settings", "Depth sometimes sacrificed for entertainment"],
    recommendedFrameworks: ["BRAVE", "TALK Check", "SHIELD"],
    practiceScenarios: ["Going deeper in a conversation beyond surface banter", "Resolving a conflict with a close friend", "Following up on an unanswered message without seeming needy", "Listening without offering solutions — a friend needs to vent", "Saying no to a request without over-explaining"],
  },
  INFJ: {
    description: "Deeply empathetic, visionary, and intensely private. You see people clearly — often more clearly than they see themselves — but you're selective about who gets to see you.",
    socialStrengths: ["Rare ability to make people feel truly understood", "Deep, meaningful conversations come naturally", "High emotional intelligence"],
    socialChallenges: ["Drained by surface-level interaction", "Selective to the point of isolation", "Tendency to absorb others' emotions"],
    recommendedFrameworks: ["Fearless Approach System", "3-Second Social Scan", "Stop Replaying"],
    practiceScenarios: ["Approaching a stranger at a coffee shop", "Networking at an industry conference", "Making small talk with the person next to you on a flight", "Telling a friend something difficult but necessary", "Starting a conversation at a party where you know nobody"],
  },
  INFP: {
    description: "Values-driven, deeply feeling, and fiercely individual. You want real connection but approach anxiety and fear of rejection can keep you on the sidelines.",
    socialStrengths: ["Genuine warmth that people feel immediately", "Excellent listener — people open up to you naturally", "Values-aligned connections tend to be very deep"],
    socialChallenges: ["Approach anxiety hits hard", "Overthinking after every interaction", "Difficulty setting boundaries with people you care about"],
    recommendedFrameworks: ["SPARK", "Stop Replaying", "Fearless Approach System"],
    practiceScenarios: ["Approaching someone you find attractive at a bar or event", "Asking someone out on a first date", "Speaking up with your idea in a team meeting", "Setting a boundary with someone who pushes back", "Saying no to a friend's invitation without damaging the friendship"],
  },
  ENFJ: {
    description: "Warm, people-focused, and naturally attuned to what others need. You thrive socially but can lose yourself in other people's needs.",
    socialStrengths: ["People naturally gravitate toward you", "Excellent at drawing people out and making them feel seen", "Emotionally intelligent communicator"],
    socialChallenges: ["People-pleasing at the expense of honesty", "Difficulty saying no or setting limits", "Can over-invest in others' problems"],
    recommendedFrameworks: ["SHIELD", "BRAVE", "TALK Check"],
    practiceScenarios: ["Saying no to a request without over-explaining", "Confronting someone who crossed a line", "Setting a boundary with someone who pushes back", "Being honest with a friend about something that hurt you", "Receiving a compliment without deflecting it"],
  },
  ENFP: {
    description: "Enthusiastic, creative, and magnetic. You can connect with almost anyone — but you may leave people feeling like they never got below the surface.",
    socialStrengths: ["High energy that's infectious", "Natural ability to make people feel special and seen", "Effortless conversation across a wide range of topics"],
    socialChallenges: ["Follow-through on relationships can be weak", "May project enthusiasm without real depth", "Scattered energy across too many connections"],
    recommendedFrameworks: ["BRAVE", "Stop Replaying", "SHIELD"],
    practiceScenarios: ["Going deeper in a conversation beyond surface banter", "Being vulnerable with a friend about something personal", "Following up on an unanswered message without seeming needy", "Setting a boundary with a family member", "Reaching out to an old friend after a long gap"],
  },
  ISTJ: {
    description: "Reliable, systematic, and deeply loyal. You don't need many connections — but the ones you have are solid. Social situations outside your comfort zone are the challenge.",
    socialStrengths: ["Trustworthy — people know where they stand with you", "Excellent at maintaining long-term relationships", "Direct and honest communicator"],
    socialChallenges: ["New social situations trigger anxiety", "Can seem cold or indifferent to new people", "Difficulty with emotional expressiveness"],
    recommendedFrameworks: ["Fearless Approach System", "SPARK", "TALK Check"],
    practiceScenarios: ["Starting a conversation at a party where you know nobody", "Networking at an industry conference", "Making small talk at a work social event", "First date conversation — keeping it natural", "Introducing yourself to a new neighbor"],
  },
  ISFJ: {
    description: "Caring, observant, and loyal to the people you've chosen. You're excellent one-on-one but struggle with larger groups and initiating.",
    socialStrengths: ["Remarkable memory for people — you remember what matters to them", "Warmth that builds trust over time", "Exceptional at maintaining relationships"],
    socialChallenges: ["Difficulty initiating with new people", "Tendency to give without asking for anything back", "Avoids conflict to the point of resentment"],
    recommendedFrameworks: ["SPARK", "BRAVE", "SHIELD"],
    practiceScenarios: ["Initiating plans with someone you'd like to know better", "Telling a friend something difficult but necessary", "Setting a boundary with someone who pushes back", "Speaking up with your idea in a team meeting", "Asking for what you need without apologizing"],
  },
  ESTJ: {
    description: "Direct, structured, and decisive. You're comfortable taking charge but may prioritize efficiency over emotional connection.",
    socialStrengths: ["Clear communicator — people always know where they stand", "Natural organizer and leader in social settings", "Dependable — your word means something"],
    socialChallenges: ["Can come across as rigid or blunt", "Difficulty with ambiguity in relationships", "May dismiss emotional concerns as irrational"],
    recommendedFrameworks: ["BRAVE", "TALK Check", "Stop Replaying"],
    practiceScenarios: ["Listening without offering solutions — a friend needs to vent", "Having a difficult conversation without steamrolling", "Being vulnerable with a friend about something personal", "Recovering after saying something too blunt", "Receiving a compliment without deflecting it"],
  },
  ESFJ: {
    description: "Warm, social, and attuned to what people need. You thrive in connection but need others' approval more than is good for you.",
    socialStrengths: ["Genuinely warm — people feel taken care of around you", "Strong at organizing and bringing people together", "Natural nurturer in relationships"],
    socialChallenges: ["Approval-seeking affects your authenticity", "Difficulty with criticism or rejection", "Can prioritize harmony over honesty"],
    recommendedFrameworks: ["BRAVE", "SHIELD", "Stop Replaying"],
    practiceScenarios: ["Saying no to a friend's invitation without damaging the friendship", "Disagreeing with a group when you're the only dissenting voice", "Being honest with a friend about something that hurt you", "Setting a boundary without over-apologizing", "Confronting someone who crossed a line"],
  },
  ISTP: {
    description: "Practical, calm, and observational. You're cool under pressure and rarely say more than necessary — which can read as disinterest even when you're not.",
    socialStrengths: ["Calm presence that people find grounding", "Excellent observer — you notice what others miss", "Low-maintenance friendships with high loyalty"],
    socialChallenges: ["Appears detached or disinterested", "Difficulty expressing emotional availability", "Doesn't initiate — waits for others to come to them"],
    recommendedFrameworks: ["SPARK", "TALK Check", "Fearless Approach System"],
    practiceScenarios: ["Starting a conversation at a party where you know nobody", "First date conversation — keeping it natural", "Asking someone out on a first date", "Initiating plans with someone you'd like to know better", "Reaching out to an old friend after a long gap"],
  },
  ISFP: {
    description: "Gentle, authentic, and quietly creative. You're one of the most genuine people in any room — but your quietness can make you invisible.",
    socialStrengths: ["Deep authenticity — no performance, just you", "Excellent at one-on-one depth", "People feel safe being real around you"],
    socialChallenges: ["Approach anxiety is real", "Invisibility — you don't put yourself forward", "Difficulty with conflict even when necessary"],
    recommendedFrameworks: ["SPARK", "Fearless Approach System", "BRAVE"],
    practiceScenarios: ["Approaching someone you find attractive at a bar or event", "Speaking up with your idea in a team meeting", "Saying no to a request without over-explaining", "Confronting someone who crossed a line", "Disagreeing with a colleague professionally"],
  },
  ESTP: {
    description: "Bold, action-oriented, and quick to engage. You're the one who makes things happen socially — but you can run over people without noticing.",
    socialStrengths: ["High energy and natural confidence in social settings", "Quick to build rapport with almost anyone", "Excellent at reading the immediate moment"],
    socialChallenges: ["Depth sometimes secondary to entertainment", "Can be impulsive in conversations", "Long-term relationship maintenance is harder than initiation"],
    recommendedFrameworks: ["BRAVE", "Stop Replaying", "SHIELD"],
    practiceScenarios: ["Going deeper in a conversation beyond surface banter", "Listening without offering solutions — a friend needs to vent", "Resolving a conflict with a close friend", "Being vulnerable with a friend about something personal", "Following up on an unanswered message without seeming needy"],
  },
  ESFP: {
    description: "Spontaneous, warm, and fun to be around. You make social situations feel easy — for everyone else. Making sure you get what you need from relationships is the challenge.",
    socialStrengths: ["Natural entertainer — people love being around you", "High emotional attunement in the moment", "Easy initiator — approach anxiety is low"],
    socialChallenges: ["Depth can be avoided in favor of fun", "Difficulty with serious emotional conversations", "Can over-invest energy without getting it back"],
    recommendedFrameworks: ["BRAVE", "SHIELD", "Stop Replaying"],
    practiceScenarios: ["Having a difficult conversation you've been avoiding", "Setting a boundary with someone who pushes back", "Resolving a conflict with a close friend", "Being vulnerable with a friend about something personal", "Telling a friend something difficult but necessary"],
  },
};
