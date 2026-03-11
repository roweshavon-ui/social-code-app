"use client";

import { useEffect, useState } from "react";
import { User, ChevronRight, X } from "lucide-react";

type Submission = {
  id: string;
  name: string;
  email: string;
  goal: string | null;
  jungian_type: string;
  scores: { E: number; I: number; S: number; N: number; T: number; F: number; J: number; P: number } | null;
  created_at: string;
};

const TYPE_COLORS: Record<string, string> = {
  INTJ:"#00D9C0",INTP:"#00D9C0",ENTJ:"#4DE8D4",ENTP:"#4DE8D4",
  INFJ:"#FF6B6B",INFP:"#FF6B6B",ENFJ:"#FF8C8C",ENFP:"#FF8C8C",
  ISTJ:"#00A896",ISFJ:"#00A896",ESTJ:"#00D9C0",ESFJ:"#00D9C0",
  ISTP:"#FF6B6B",ISFP:"#FF6B6B",ESTP:"#4DE8D4",ESFP:"#4DE8D4",
};

function typeColor(type: string) {
  return TYPE_COLORS[type] ?? "#00D9C0";
}

function ScoreBar({ a, b, labelA, labelB }: { a: number; b: number; labelA: string; labelB: string }) {
  const total = a + b;
  const pctA = total ? Math.round((a / total) * 100) : 50;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>{labelA} ({a})</span>
        <span>{labelB} ({b})</span>
      </div>
      <div className="h-1.5 rounded-full w-full" style={{ background: "#1A2332" }}>
        <div className="h-1.5 rounded-full" style={{ width: `${pctA}%`, background: "#00D9C0" }} />
      </div>
    </div>
  );
}

function SubmissionPanel({ sub, onClose, onAddToClients }: {
  sub: Submission;
  onClose: () => void;
  onAddToClients: (sub: Submission) => Promise<void>;
}) {
  const color = typeColor(sub.jungian_type);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  async function handleAdd() {
    setAdding(true);
    await onAddToClients(sub);
    setAdded(true);
    setAdding(false);
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <aside
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md overflow-y-auto"
        style={{ background: "#0D1825", borderLeft: "1px solid rgba(0,217,192,0.1)" }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4" style={{ background: "#0D1825", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: `${color}20`, color }}>
              {sub.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{sub.name}</p>
              <p className="text-xs" style={{ color }}>{sub.jungian_type} · {sub.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-6 space-y-5">
          {/* Type */}
          <div className="rounded-xl p-5 border" style={{ background: "#131E2B", borderColor: `${color}25` }}>
            <div className="text-3xl font-black mb-1" style={{ color }}>{sub.jungian_type}</div>
            <p className="text-xs text-slate-500">
              Submitted {new Date(sub.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>

          {/* Scores */}
          {sub.scores && (
            <div className="rounded-xl p-5 border border-white/5" style={{ background: "#131E2B" }}>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Score Breakdown</h4>
              <ScoreBar a={sub.scores.E} b={sub.scores.I} labelA="Extroversion" labelB="Introversion" />
              <ScoreBar a={sub.scores.S} b={sub.scores.N} labelA="Sensing" labelB="Intuition" />
              <ScoreBar a={sub.scores.T} b={sub.scores.F} labelA="Thinking" labelB="Feeling" />
              <ScoreBar a={sub.scores.J} b={sub.scores.P} labelA="Judging" labelB="Perceiving" />
            </div>
          )}

          {/* Goal */}
          {sub.goal && (
            <div className="rounded-xl p-5 border border-white/5" style={{ background: "#131E2B" }}>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">What they want to improve</h4>
              <p className="text-sm text-slate-300 leading-relaxed">{sub.goal}</p>
            </div>
          )}

          {/* Add to clients */}
          {!added ? (
            <button
              onClick={handleAdd}
              disabled={adding}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "#00D9C0", color: "#080F18" }}
            >
              <User size={15} strokeWidth={2.5} />
              {adding ? "Adding..." : "Add to Client CRM"}
            </button>
          ) : (
            <div
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-bold"
              style={{ background: "rgba(0,217,192,0.1)", color: "#00D9C0", border: "1px solid rgba(0,217,192,0.2)" }}
            >
              ✓ Added to Clients
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/assessments")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setSubmissions(data);
        else setError("Could not load submissions — Supabase may not be connected yet.");
      })
      .catch(() => setError("Could not load submissions — Supabase may not be connected yet."))
      .finally(() => setLoaded(true));
  }, []);

  async function handleAddToClients(sub: Submission) {
    await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: sub.name,
        email: sub.email,
        jungianType: sub.jungian_type,
        goal: sub.goal ?? "",
        status: "active",
        notes: sub.scores
          ? `Auto-typed via public assessment. Scores: E${sub.scores.E}/I${sub.scores.I} S${sub.scores.S}/N${sub.scores.N} T${sub.scores.T}/F${sub.scores.F} J${sub.scores.J}/P${sub.scores.P}`
          : "Auto-typed via public assessment.",
        observations: "",
        socialPatterns: "",
      }),
    });
  }

  const selected = submissions.find((s) => s.id === selectedId) ?? null;

  if (!loaded) return null;

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Submissions</h1>
        <p className="mt-1 text-sm text-slate-500">
          {submissions.length} submission{submissions.length !== 1 ? "s" : ""} from the public assessment
        </p>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl text-sm text-amber-400 border border-amber-400/20" style={{ background: "rgba(251,191,36,0.06)" }}>
          {error}
        </div>
      )}

      {submissions.length === 0 && !error ? (
        <div className="rounded-xl border border-white/5 p-16 flex flex-col items-center justify-center text-center" style={{ background: "#131E2B" }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(0,217,192,0.08)", border: "1px dashed rgba(0,217,192,0.2)" }}>
            <User size={20} style={{ color: "#00D9C0" }} strokeWidth={1.5} />
          </div>
          <p className="text-sm text-slate-500">No submissions yet.</p>
          <p className="text-xs text-slate-600 mt-1">Share the assessment link to start collecting results.</p>
          <div className="mt-4 px-4 py-2 rounded-lg text-xs font-mono" style={{ background: "#1A2332", color: "#00D9C0" }}>
            yoursite.com/assess
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {submissions.map((sub) => {
            const color = typeColor(sub.jungian_type);
            return (
              <div
                key={sub.id}
                className="flex items-center gap-4 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
                style={{ background: "#131E2B" }}
                onClick={() => setSelectedId(sub.id)}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: `${color}20`, color }}>
                  {sub.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white">{sub.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: `${color}15`, color }}>
                      {sub.jungian_type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{sub.email}</p>
                  {sub.goal && <p className="text-xs text-slate-600 mt-0.5 truncate">Goal: {sub.goal}</p>}
                </div>
                <span className="text-xs text-slate-600 flex-shrink-0">
                  {new Date(sub.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                <ChevronRight size={14} className="text-slate-700 group-hover:text-slate-400 transition-colors flex-shrink-0" />
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <SubmissionPanel
          sub={selected}
          onClose={() => setSelectedId(null)}
          onAddToClients={handleAddToClients}
        />
      )}
    </div>
  );
}
