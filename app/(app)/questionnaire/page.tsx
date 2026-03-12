"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, CheckCircle, User } from "lucide-react";
import { QUESTIONS, calculateType } from "./questions";
import { useClients } from "../../hooks/useClients";

type Step = "info" | "quiz" | "result";

export default function QuestionnairePage() {
  const router = useRouter();
  const { addClient } = useClients();

  const [step, setStep] = useState<Step>("info");
  const [info, setInfo] = useState({ name: "", email: "", goal: "" });
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, "a" | "b">>({});
  const [result, setResult] = useState<ReturnType<typeof calculateType> | null>(null);
  const [saved, setSaved] = useState(false);

  const question = QUESTIONS[current];
  const progress = (Object.keys(answers).length / QUESTIONS.length) * 100;
  const allAnswered = Object.keys(answers).length === QUESTIONS.length;

  function handleAnswer(choice: "a" | "b") {
    const updated = { ...answers, [question.id]: choice };
    setAnswers(updated);
    if (current < QUESTIONS.length - 1) {
      setTimeout(() => setCurrent((c) => c + 1), 200);
    }
  }

  function handleFinish() {
    const res = calculateType(answers);
    setResult(res);
    setStep("result");
  }

  function handleSaveTocrm() {
    if (!result) return;
    addClient({
      name: info.name,
      email: info.email,
      jungianType: result.type,
      goal: info.goal,
      status: "active",
      notes: `Auto-typed via questionnaire. Scores: E${result.scores.E}/I${result.scores.I} S${result.scores.S}/N${result.scores.N} T${result.scores.T}/F${result.scores.F} J${result.scores.J}/P${result.scores.P}`,
      observations: "",
      socialPatterns: "",
      pipelineStage: "lead",
    });
    setSaved(true);
  }

  // ── Step: Info ──────────────────────────────────────────────
  if (step === "info") {
    return (
      <div className="p-8 max-w-xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">Type Assessment</h1>
          <p className="mt-1 text-sm text-slate-500">
            20 questions · ~5 minutes · Jungian personality typing
          </p>
        </div>

        <div className="rounded-2xl border border-white/5 p-7" style={{ background: "#131E2B" }}>
          <h2 className="text-base font-semibold text-white mb-5">Client Info</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name *</label>
              <input
                type="text"
                value={info.name}
                onChange={(e) => setInfo((i) => ({ ...i, name: e.target.value }))}
                placeholder="Client's name"
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 border border-white/5 outline-none transition-colors"
                style={{ background: "#1A2332" }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
              <input
                type="email"
                value={info.email}
                onChange={(e) => setInfo((i) => ({ ...i, email: e.target.value }))}
                placeholder="email@example.com"
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 border border-white/5 outline-none transition-colors"
                style={{ background: "#1A2332" }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">What do they want to work on?</label>
              <textarea
                value={info.goal}
                onChange={(e) => setInfo((i) => ({ ...i, goal: e.target.value }))}
                placeholder="e.g. Starting conversations, approach anxiety, networking..."
                rows={2}
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 border border-white/5 outline-none transition-colors resize-none"
                style={{ background: "#1A2332" }}
              />
            </div>
          </div>
          <button
            onClick={() => { if (info.name.trim()) setStep("quiz"); }}
            disabled={!info.name.trim()}
            className="mt-6 w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: "#00D9C0", color: "#080F18" }}
          >
            Start Assessment
            <ChevronRight size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    );
  }

  // ── Step: Quiz ──────────────────────────────────────────────
  if (step === "quiz") {
    const dimensionLabel: Record<string, string> = {
      EI: "Energy · Introversion vs Extroversion",
      SN: "Perception · Sensing vs Intuition",
      TF: "Decisions · Thinking vs Feeling",
      JP: "Lifestyle · Judging vs Perceiving",
    };

    return (
      <div className="p-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-bold text-white">Type Assessment</h1>
            <p className="text-xs text-slate-500 mt-0.5">{info.name}</p>
          </div>
          <span className="text-sm text-slate-500">{current + 1} / {QUESTIONS.length}</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 rounded-full mb-8" style={{ background: "#1A2332" }}>
          <div
            className="h-1 rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, background: "#00D9C0" }}
          />
        </div>

        {/* Dimension label */}
        <p className="text-xs font-medium uppercase tracking-widest mb-4" style={{ color: "#00D9C0" }}>
          {dimensionLabel[question.dimension]}
        </p>

        {/* Question */}
        <h2 className="text-xl font-bold text-white mb-8 leading-snug">{question.text}</h2>

        {/* Answer buttons */}
        <div className="space-y-3 mb-8">
          {(["a", "b"] as const).map((choice) => {
            const opt = question[choice];
            const selected = answers[question.id] === choice;
            return (
              <button
                key={choice}
                onClick={() => handleAnswer(choice)}
                className="w-full text-left p-5 rounded-xl border transition-all duration-150 text-sm leading-relaxed"
                style={{
                  background: selected ? "rgba(0,217,192,0.08)" : "#131E2B",
                  borderColor: selected ? "rgba(0,217,192,0.4)" : "rgba(255,255,255,0.06)",
                  color: selected ? "#F7F9FC" : "#94a3b8",
                }}
              >
                <span className="flex items-start gap-3">
                  <span
                    className="w-5 h-5 rounded-full border flex-shrink-0 mt-0.5 flex items-center justify-center transition-all"
                    style={{
                      borderColor: selected ? "#00D9C0" : "#334155",
                      background: selected ? "#00D9C0" : "transparent",
                    }}
                  >
                    {selected && <span className="w-2 h-2 rounded-full bg-navy-900" style={{ background: "#080F18" }} />}
                  </span>
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Nav */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-slate-500 hover:text-white transition-colors disabled:opacity-30"
          >
            <ChevronLeft size={16} />
            Back
          </button>

          {current < QUESTIONS.length - 1 ? (
            <button
              onClick={() => answers[question.id] && setCurrent((c) => c + 1)}
              disabled={!answers[question.id]}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30"
              style={{ color: "#00D9C0" }}
            >
              Next
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={!allAnswered}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-40"
              style={{ background: "#FF6B6B", color: "white" }}
            >
              See Results
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Jump dots */}
        <div className="flex gap-1.5 justify-center mt-8 flex-wrap">
          {QUESTIONS.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrent(i)}
              className="w-2 h-2 rounded-full transition-all"
              style={{
                background: answers[q.id]
                  ? "#00D9C0"
                  : i === current
                  ? "#334155"
                  : "#1E2D3E",
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── Step: Result ──────────────────────────────────────────────
  if (step === "result" && result) {
    const scoreBar = (a: number, b: number, labelA: string, labelB: string) => {
      const total = a + b;
      const pctA = total ? Math.round((a / total) * 100) : 50;
      return (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5" style={{ fontFamily: "Work Sans" }}>
            <span>{labelA} ({a})</span>
            <span>{labelB} ({b})</span>
          </div>
          <div className="h-2 rounded-full w-full" style={{ background: "#1A2332" }}>
            <div className="h-2 rounded-full" style={{ width: `${pctA}%`, background: "#00D9C0" }} />
          </div>
        </div>
      );
    };

    return (
      <div className="p-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">Results</h1>
          <p className="mt-1 text-sm text-slate-500">{info.name}</p>
        </div>

        {/* Type badge */}
        <div className="rounded-2xl p-7 border mb-5" style={{ background: "#131E2B", borderColor: "rgba(0,217,192,0.2)" }}>
          <div className="flex items-center gap-4 mb-5">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black flex-shrink-0"
              style={{ background: "rgba(0,217,192,0.12)", color: "#00D9C0" }}
            >
              {result.type}
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-1">Jungian Type</div>
              <div className="text-xl font-bold text-white">{result.type}</div>
            </div>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed" style={{ fontFamily: "Work Sans" }}>
            {result.description}
          </p>
        </div>

        {/* Score breakdown */}
        <div className="rounded-2xl p-6 border border-white/5 mb-5" style={{ background: "#131E2B" }}>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Score Breakdown</h3>
          {scoreBar(result.scores.E, result.scores.I, "Extroversion", "Introversion")}
          {scoreBar(result.scores.S, result.scores.N, "Sensing", "Intuition")}
          {scoreBar(result.scores.T, result.scores.F, "Thinking", "Feeling")}
          {scoreBar(result.scores.J, result.scores.P, "Judging", "Perceiving")}
        </div>

        {/* Strengths & challenges */}
        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          <div className="rounded-xl p-5 border border-white/5" style={{ background: "#131E2B" }}>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#00D9C0" }}>Social Strengths</h3>
            <ul className="space-y-2">
              {result.socialStrengths.map((s) => (
                <li key={s} className="flex items-start gap-2 text-xs text-slate-400" style={{ fontFamily: "Work Sans" }}>
                  <span style={{ color: "#00D9C0" }} className="mt-0.5 flex-shrink-0">✓</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl p-5 border border-white/5" style={{ background: "#131E2B" }}>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#FF6B6B" }}>Social Challenges</h3>
            <ul className="space-y-2">
              {result.socialChallenges.map((c) => (
                <li key={c} className="flex items-start gap-2 text-xs text-slate-400" style={{ fontFamily: "Work Sans" }}>
                  <span style={{ color: "#FF6B6B" }} className="mt-0.5 flex-shrink-0">→</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommended frameworks */}
        <div className="rounded-xl p-5 border border-white/5 mb-6" style={{ background: "#131E2B" }}>
          <h3 className="text-xs font-semibold uppercase tracking-widest mb-3 text-slate-500">Recommended Frameworks</h3>
          <div className="flex flex-wrap gap-2">
            {result.recommendedFrameworks.map((f) => (
              <span
                key={f}
                className="text-xs px-3 py-1.5 rounded-full font-medium"
                style={{ background: "rgba(0,217,192,0.1)", color: "#00D9C0" }}
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Practice scenarios */}
        <div className="rounded-xl p-5 border border-white/5 mb-6" style={{ background: "#131E2B" }}>
          <h3 className="text-xs font-semibold uppercase tracking-widest mb-1 text-slate-500">Recommended Practice Scenarios</h3>
          <p className="text-xs text-slate-600 mb-4">Run these in the Simulator — they target this type&apos;s specific gaps.</p>
          <div className="space-y-2">
            {result.practiceScenarios.map((s, i) => (
              <div key={s} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "#1A2332" }}>
                <span className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(0,217,192,0.15)", color: "#00D9C0" }}>{i + 1}</span>
                <span className="text-xs text-slate-300">{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Save to CRM */}
        {!saved ? (
          <button
            onClick={handleSaveTocrm}
            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
            style={{ background: "#FF6B6B", color: "white" }}
          >
            <User size={16} strokeWidth={2.5} />
            Save {info.name} to Client CRM
          </button>
        ) : (
          <div className="space-y-3">
            <div
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-bold"
              style={{ background: "rgba(0,217,192,0.1)", color: "#00D9C0", border: "1px solid rgba(0,217,192,0.2)" }}
            >
              <CheckCircle size={16} strokeWidth={2.5} />
              Saved to CRM as {result.type}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setStep("info"); setInfo({ name: "", email: "", goal: "" }); setAnswers({}); setCurrent(0); setResult(null); setSaved(false); }}
                className="flex-1 px-5 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-white transition-colors border border-white/5"
                style={{ background: "#131E2B" }}
              >
                New Assessment
              </button>
              <button
                onClick={() => router.push("/clients")}
                className="flex-1 px-5 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                style={{ background: "#00D9C0", color: "#080F18" }}
              >
                View in CRM →
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
