"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft, CheckCircle } from "lucide-react";
import { QUESTIONS, calculateType } from "../(app)/questionnaire/questions";

type Step = "info" | "quiz" | "result" | "done";

const BRAND = {
  teal: "#00D9C0",
  coral: "#FF6B6B",
  navy: "#1A2332",
  dark: "#0D1825",
  darker: "#080F18",
};

export default function PublicAssessPage() {
  const [step, setStep] = useState<Step>("info");
  const [info, setInfo] = useState({ name: "", email: "", goal: "" });
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, "a" | "b">>({});
  const [result, setResult] = useState<ReturnType<typeof calculateType> | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  async function handleFinish() {
    const res = calculateType(answers);
    setResult(res);
    setStep("result");
    const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    localStorage.setItem("sc_assessed", String(expiry));
    localStorage.setItem("sc_type", res.type);

    // Save to DB in background
    setSubmitting(true);
    try {
      await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: info.name,
          email: info.email,
          goal: info.goal,
          type: res.type,
          scores: res.scores,
          description: res.description,
          strengths: res.socialStrengths,
          challenges: res.socialChallenges,
        }),
      });
      setSubmitted(true);
    } catch {
      setError("Couldn't save results — but your type is shown below.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Step: Info ───────────────────────────────────────────────
  if (step === "info") {
    return (
      <Page>
        <Header />
        <div className="max-w-md w-full mx-auto px-4">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">
              Free Social Type Assessment
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              20 questions · ~5 minutes · Based on Jungian psychology
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 p-6" style={{ background: "#131E2B" }}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={info.name}
                  onChange={(e) => setInfo((i) => ({ ...i, name: e.target.value }))}
                  placeholder="First name is fine"
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 border border-white/5 outline-none transition-colors focus:border-teal-500/40"
                  style={{ background: BRAND.navy }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  value={info.email}
                  onChange={(e) => setInfo((i) => ({ ...i, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 border border-white/5 outline-none transition-colors focus:border-teal-500/40"
                  style={{ background: BRAND.navy }}
                />
                <p className="text-xs text-slate-600 mt-1.5">
                  We&apos;ll send your results here. No spam, ever.
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                  What do you want to improve? (optional)
                </label>
                <textarea
                  value={info.goal}
                  onChange={(e) => setInfo((i) => ({ ...i, goal: e.target.value }))}
                  placeholder="e.g. Approach anxiety, making friends, networking..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 border border-white/5 outline-none transition-colors resize-none focus:border-teal-500/40"
                  style={{ background: BRAND.navy }}
                />
              </div>
            </div>

            <button
              onClick={() => { if (info.name.trim() && info.email.trim()) setStep("quiz"); }}
              disabled={!info.name.trim() || !info.email.trim()}
              className="mt-6 w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-40"
              style={{ background: BRAND.teal, color: BRAND.darker }}
            >
              Start Assessment
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </div>

          <p className="text-center text-xs text-slate-600 mt-4">
            Free · No account needed · Results shown instantly
          </p>
        </div>
      </Page>
    );
  }

  // ── Step: Quiz ───────────────────────────────────────────────
  if (step === "quiz") {
    const dimensionLabel: Record<string, string> = {
      EI: "Energy",
      SN: "Perception",
      TF: "Decisions",
      JP: "Lifestyle",
    };

    return (
      <Page>
        <Header minimal />
        <div className="max-w-2xl w-full mx-auto px-4">
          {/* Progress */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-500">{info.name}</span>
            <span className="text-xs text-slate-500">{current + 1} / {QUESTIONS.length}</span>
          </div>
          <div className="w-full h-1 rounded-full mb-8" style={{ background: BRAND.navy }}>
            <div
              className="h-1 rounded-full transition-all duration-300"
              style={{ width: `${progress}%`, background: BRAND.teal }}
            />
          </div>

          {/* Dimension */}
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: BRAND.teal }}>
            {dimensionLabel[question.dimension]}
          </p>

          {/* Question */}
          <h2 className="text-xl font-bold text-white mb-8 leading-snug">{question.text}</h2>

          {/* Options */}
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
                        borderColor: selected ? BRAND.teal : "#334155",
                        background: selected ? BRAND.teal : "transparent",
                      }}
                    >
                      {selected && <span className="w-2 h-2 rounded-full" style={{ background: BRAND.darker }} />}
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
                style={{ color: BRAND.teal }}
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={!allAnswered}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: BRAND.coral, color: "white" }}
              >
                See My Results <ChevronRight size={16} strokeWidth={2.5} />
              </button>
            )}
          </div>

          {/* Dot nav */}
          <div className="flex gap-1.5 justify-center mt-8 flex-wrap">
            {QUESTIONS.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setCurrent(i)}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  background: answers[q.id] ? BRAND.teal : i === current ? "#334155" : "#1E2D3E",
                }}
              />
            ))}
          </div>
        </div>
      </Page>
    );
  }

  // ── Step: Result ─────────────────────────────────────────────
  if (step === "result" && result) {
    const scoreBar = (a: number, b: number, labelA: string, labelB: string) => {
      const total = a + b;
      const pctA = total ? Math.round((a / total) * 100) : 50;
      return (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>{labelA} ({a})</span>
            <span>{labelB} ({b})</span>
          </div>
          <div className="h-2 rounded-full w-full" style={{ background: BRAND.navy }}>
            <div className="h-2 rounded-full" style={{ width: `${pctA}%`, background: BRAND.teal }} />
          </div>
        </div>
      );
    };

    return (
      <Page>
        <Header minimal />
        <div className="max-w-2xl w-full mx-auto px-4 pb-16">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-xs text-amber-400 border border-amber-400/20" style={{ background: "rgba(251,191,36,0.06)" }}>
              {error}
            </div>
          )}

          <div className="mb-6 text-center">
            <p className="text-sm text-slate-500 mb-1">Your Social Type</p>
            <div
              className="inline-flex items-center justify-center w-24 h-24 rounded-3xl text-3xl font-black mb-3"
              style={{ background: "rgba(0,217,192,0.12)", color: BRAND.teal }}
            >
              {result.type}
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">{info.name}, you&apos;re an {result.type}</h1>
          </div>

          {/* Description */}
          <div className="rounded-2xl p-6 border mb-4" style={{ background: "#131E2B", borderColor: "rgba(0,217,192,0.2)" }}>
            <p className="text-sm text-slate-300 leading-relaxed">{result.description}</p>
          </div>

          {/* Score breakdown */}
          <div className="rounded-2xl p-6 border border-white/5 mb-4" style={{ background: "#131E2B" }}>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Score Breakdown</h3>
            {scoreBar(result.scores.E, result.scores.I, "Extroversion", "Introversion")}
            {scoreBar(result.scores.S, result.scores.N, "Sensing", "Intuition")}
            {scoreBar(result.scores.T, result.scores.F, "Thinking", "Feeling")}
            {scoreBar(result.scores.J, result.scores.P, "Judging", "Perceiving")}
          </div>

          {/* Strengths & challenges */}
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className="rounded-xl p-5 border border-white/5" style={{ background: "#131E2B" }}>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: BRAND.teal }}>Social Strengths</h3>
              <ul className="space-y-2">
                {result.socialStrengths.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-xs text-slate-400">
                    <span style={{ color: BRAND.teal }} className="mt-0.5 flex-shrink-0">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl p-5 border border-white/5" style={{ background: "#131E2B" }}>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: BRAND.coral }}>Social Challenges</h3>
              <ul className="space-y-2">
                {result.socialChallenges.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-xs text-slate-400">
                    <span style={{ color: BRAND.coral }} className="mt-0.5 flex-shrink-0">→</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommended frameworks */}
          <div className="rounded-xl p-5 border border-white/5 mb-4" style={{ background: "#131E2B" }}>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3 text-slate-500">Recommended Frameworks</h3>
            <div className="flex flex-wrap gap-2">
              {result.recommendedFrameworks.map((f) => (
                <span
                  key={f}
                  className="text-xs px-3 py-1.5 rounded-full font-medium"
                  style={{ background: "rgba(0,217,192,0.1)", color: BRAND.teal }}
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-2xl p-6 border text-center" style={{ background: "#131E2B", borderColor: "rgba(255,107,107,0.2)" }}>
            {submitted ? (
              <div className="flex items-center justify-center gap-2 text-sm font-medium mb-4" style={{ color: BRAND.teal }}>
                <CheckCircle size={16} />
                Results sent to your email.
              </div>
            ) : submitting ? (
              <p className="text-sm text-slate-500 mb-4">Saving your results...</p>
            ) : null}
            <p className="text-sm text-white font-bold mb-1">Know your type. Now do something with it.</p>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Book a free 30-minute call with Shavi. You&apos;ll get a personalized plan based on your {result.type} type — specific frameworks, specific gaps, specific next steps.
            </p>
            <a
              href="/book"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 w-full sm:w-auto"
              style={{ background: BRAND.coral, color: "white" }}
            >
              Book Your Free Call →
            </a>
            <p className="text-xs text-slate-600 mt-3">30 minutes · Free · No pressure</p>
            <div className="mt-5 pt-5 border-t border-white/5">
              <p className="text-xs text-slate-500 mb-3">Want to practice first?</p>
              <a
                href="/practice"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 w-full sm:w-auto border border-white/10"
                style={{ background: "transparent", color: BRAND.teal }}
              >
                Try the Social Simulator →
              </a>
            </div>
          </div>
        </div>
      </Page>
    );
  }

  return null;
}

// ── Layout components ────────────────────────────────────────

function Page({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center py-10 gap-8" style={{ background: BRAND.dark }}>
      {children}
    </div>
  );
}

function Header({ minimal }: { minimal?: boolean }) {
  return (
    <header className="w-full max-w-2xl px-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-lg font-black tracking-tight" style={{ color: BRAND.teal }}>
          Social Code
        </span>
        {!minimal && (
          <span className="text-xs text-slate-600 font-medium">· Free Assessment</span>
        )}
      </div>
      <span className="text-xs text-slate-600">Crack the Code</span>
    </header>
  );
}
