"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Brain, Printer } from "lucide-react";

const BRAND = { teal: "#00D9C0", coral: "#FF6B6B", purple: "#a78bfa", gold: "#fbbf24" };

const TYPES = [
  // NT — The Architects & Strategists
  {
    code: "INTJ", name: "The Mastermind", group: "NT",
    tagline: "Strategic, private, high standards",
    social_style: "Selective — connects through ideas, not small talk",
    in_group: "Quiet observer at first. Engages when the topic has substance.",
    coach_tip: "Don't force them to open up early. Give them a role or problem to solve.",
    color: BRAND.purple,
  },
  {
    code: "INTP", name: "The Architect", group: "NT",
    tagline: "Analytical, curious, detached",
    social_style: "Ideas over people — gets energized by intellectual sparring",
    in_group: "Will go quiet if they think the convo is surface-level.",
    coach_tip: "Ask them 'why' questions. They love explaining their thinking.",
    color: BRAND.purple,
  },
  {
    code: "ENTJ", name: "The Commander", group: "NT",
    tagline: "Direct, driven, natural leader",
    social_style: "Takes charge — can dominate group conversations",
    in_group: "May steamroll quieter types. Will challenge the coach.",
    coach_tip: "Give them a leadership role in exercises. Channel the energy.",
    color: BRAND.purple,
  },
  {
    code: "ENTP", name: "The Debater", group: "NT",
    tagline: "Quick-witted, playful, contrarian",
    social_style: "Debates for fun — not always to win, but to think",
    in_group: "High energy, can derail focus. Also very funny and warm.",
    coach_tip: "Use them as your demo partner. They love being on the spot.",
    color: BRAND.purple,
  },

  // NF — The Empaths & Visionaries
  {
    code: "INFJ", name: "The Counselor", group: "NF",
    tagline: "Empathetic, private, deeply perceptive",
    social_style: "One-on-one over groups. Reads people well.",
    in_group: "Listens a lot. Will support others but rarely share first.",
    coach_tip: "Ask them directly but gently. Their insight is gold for the group.",
    color: BRAND.teal,
  },
  {
    code: "INFP", name: "The Mediator", group: "NF",
    tagline: "Idealistic, sensitive, authentic",
    social_style: "Avoids conflict — struggles with directness",
    in_group: "Gets uncomfortable with confrontational exercises.",
    coach_tip: "Frame challenges as self-discovery, not performance. They'll open up.",
    color: BRAND.teal,
  },
  {
    code: "ENFJ", name: "The Teacher", group: "NF",
    tagline: "Charismatic, caring, natural connector",
    social_style: "Lights up in groups — makes everyone feel included",
    in_group: "Great ally. May over-facilitate or smother quieter members.",
    coach_tip: "Let them co-facilitate moments. They thrive with responsibility.",
    color: BRAND.teal,
  },
  {
    code: "ENFP", name: "The Champion", group: "NF",
    tagline: "Enthusiastic, creative, people-focused",
    social_style: "High energy, jumps between ideas, deeply warm",
    in_group: "Brings the energy but may lose focus. Loves group bonding.",
    coach_tip: "Use them to warm up the group. Give them a 'connector' role.",
    color: BRAND.teal,
  },

  // SJ — The Guardians & Organizers
  {
    code: "ISTJ", name: "The Inspector", group: "SJ",
    tagline: "Reliable, methodical, private",
    social_style: "Follows the rules — prefers established norms",
    in_group: "Won't push back on the coach. Needs clear structure.",
    coach_tip: "Give them frameworks and checklists. They execute well.",
    color: BRAND.coral,
  },
  {
    code: "ISFJ", name: "The Protector", group: "SJ",
    tagline: "Warm, loyal, conflict-averse",
    social_style: "Gives a lot, struggles to assert needs",
    in_group: "Very supportive of others. May not speak unless asked.",
    coach_tip: "Create low-pressure moments for them to share. They have a lot to say.",
    color: BRAND.coral,
  },
  {
    code: "ESTJ", name: "The Executive", group: "SJ",
    tagline: "Decisive, organized, direct",
    social_style: "Takes charge, opinionated, values efficiency",
    in_group: "Can come across as blunt. May clash with NF types.",
    coach_tip: "Acknowledge their competence. Challenge them to slow down and listen.",
    color: BRAND.coral,
  },
  {
    code: "ESFJ", name: "The Consul", group: "SJ",
    tagline: "Social, caring, approval-seeking",
    social_style: "Warm and inclusive — highly attuned to group harmony",
    in_group: "Keeps the peace. Can be overly agreeable.",
    coach_tip: "Ask them what THEY think, not what others think. Build their directness.",
    color: BRAND.coral,
  },

  // SP — The Performers & Adventurers
  {
    code: "ISTP", name: "The Craftsman", group: "SP",
    tagline: "Observant, practical, independent",
    social_style: "Action over words — shows up when needed",
    in_group: "Low verbal participation but high execution in exercises.",
    coach_tip: "Get them doing, not talking. They shine in role-plays.",
    color: BRAND.gold,
  },
  {
    code: "ISFP", name: "The Adventurer", group: "SP",
    tagline: "Gentle, present, expressive through action",
    social_style: "Warm but private — needs to feel safe before opening up",
    in_group: "Quiet observer. Incredibly kind. May freeze under pressure.",
    coach_tip: "Pair them with an NF. Create moments where they can contribute naturally.",
    color: BRAND.gold,
  },
  {
    code: "ESTP", name: "The Dynamo", group: "SP",
    tagline: "Bold, action-oriented, reads rooms fast",
    social_style: "Natural social performer — thrives on live interaction",
    in_group: "High energy, competitive. Great for demos.",
    coach_tip: "Use them in live practice. Remind them to let others lead sometimes.",
    color: BRAND.gold,
  },
  {
    code: "ESFP", name: "The Performer", group: "SP",
    tagline: "Fun, spontaneous, socially magnetic",
    social_style: "Naturally charming — the energy of any room",
    in_group: "Lifts the whole group's mood. May struggle with deep reflection.",
    coach_tip: "Channel their energy into group warmups. Give them the spotlight early.",
    color: BRAND.gold,
  },
];

const GROUPS = [
  { key: "NT", label: "NT — Strategists", description: "Logic-driven, future-focused, idea people. Connect through substance and debate. May come across as cold but are deeply engaged.", color: BRAND.purple },
  { key: "NF", label: "NF — Empaths", description: "Values-driven, people-focused, authentic. Connect through meaning and emotion. Struggle with directness but are natural connectors.", color: BRAND.teal },
  { key: "SJ", label: "SJ — Guardians", description: "Structure-driven, reliable, traditional. Connect through shared responsibility and loyalty. Prefer clear expectations.", color: BRAND.coral },
  { key: "SP", label: "SP — Adventurers", description: "Action-driven, present-focused, adaptable. Connect through doing and experiencing together. Learn by trying.", color: BRAND.gold },
];

const TEACHING_SCRIPT = [
  {
    step: "1. The Big Idea",
    content: "Everyone processes the world differently. MBTI gives us a shared language for that. It's not a box — it's a map. Knowing your type helps you understand why social situations feel the way they do for you.",
  },
  {
    step: "2. The 4 Preferences",
    content: "E vs I: Where you get your energy (people vs. alone time). S vs N: How you take in info (concrete facts vs. big picture). T vs F: How you make decisions (logic vs. values). J vs P: How you approach life (structured vs. flexible).",
  },
  {
    step: "3. The 4 Groups (use the grid above)",
    content: "NT = Strategists. NF = Empaths. SJ = Guardians. SP = Adventurers. Each group has a natural social style — and a natural friction point.",
  },
  {
    step: "4. Intro Round",
    content: "Ask each person: What's your type? What's one social situation that felt hard recently? Let the group notice patterns — who's similar, who's different.",
  },
  {
    step: "5. The Key Point to Hammer",
    content: "Your type explains your starting point — not your ceiling. TALK Check, SPARK, and every framework in Social Code works FOR your type, not against it.",
  },
];

export default function TypeGuidePage() {
  const router = useRouter();

  return (
    <div className="p-4 md:p-8 max-w-6xl print:p-4">
      {/* Nav — hidden on print */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <button
          onClick={() => router.push("/cohorts")}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ArrowLeft size={13} /> Back to Cohorts
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
          style={{ background: "rgba(0,217,192,0.1)", color: BRAND.teal, border: "1px solid rgba(0,217,192,0.2)" }}
        >
          <Printer size={13} />
          Print / Save PDF
        </button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Brain size={20} style={{ color: BRAND.teal }} />
          <h1 className="text-2xl font-bold text-white tracking-tight">Personality Type Guide</h1>
        </div>
        <p className="text-sm text-slate-400">
          Social Code facilitator reference — use this during Session 1 to teach types to your group.
        </p>
      </div>

      {/* Teaching Script */}
      <div className="mb-10 rounded-xl border p-5" style={{ background: "#131E2B", borderColor: "rgba(0,217,192,0.2)" }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: BRAND.teal }}>
          Session 1 Teaching Flow
        </p>
        <div className="space-y-3">
          {TEACHING_SCRIPT.map((item) => (
            <div key={item.step} className="flex gap-3">
              <span className="text-xs font-bold flex-shrink-0 w-24" style={{ color: BRAND.teal }}>
                {item.step}
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">{item.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Group Overview */}
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {GROUPS.map((g) => (
          <div
            key={g.key}
            className="rounded-xl border p-4"
            style={{ background: "#131E2B", borderColor: `${g.color}30` }}
          >
            <p className="text-xs font-bold mb-1" style={{ color: g.color }}>{g.label}</p>
            <p className="text-xs text-slate-400 leading-relaxed">{g.description}</p>
          </div>
        ))}
      </div>

      {/* All 16 Types */}
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">All 16 Types</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {TYPES.map((t) => (
          <div
            key={t.code}
            className="rounded-xl border p-4 space-y-2"
            style={{ background: "#131E2B", borderColor: "rgba(255,255,255,0.05)" }}
          >
            <div className="flex items-baseline gap-2">
              <span className="text-base font-black" style={{ color: t.color }}>{t.code}</span>
              <span className="text-xs font-semibold text-white">{t.name}</span>
            </div>
            <p className="text-xs text-slate-400 italic">{t.tagline}</p>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-0.5">Social style</p>
              <p className="text-xs text-slate-300">{t.social_style}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-0.5">In the group</p>
              <p className="text-xs text-slate-300">{t.in_group}</p>
            </div>
            <div className="rounded-lg px-2.5 py-2" style={{ background: `${t.color}10` }}>
              <p className="text-xs font-bold mb-0.5" style={{ color: t.color }}>Coach tip</p>
              <p className="text-xs text-slate-300">{t.coach_tip}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
