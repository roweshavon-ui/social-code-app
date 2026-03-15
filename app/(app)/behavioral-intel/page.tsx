"use client";

import { useEffect, useState } from "react";
import {
  Brain,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader2,
  Target,
  Shield,
  Zap,
  BookOpen,
} from "lucide-react";

const BRAND = {
  teal: "#00D9C0",
  coral: "#FF6B6B",
  navy: "#1A2332",
  dark: "#0D1825",
  darker: "#080F18",
};

type Objection = {
  objection: string;
  what_it_really_means: string;
  reframe: string;
  language: string;
};

type BehavioralProfile = {
  primary_need: string;
  secondary_need: string;
  need_breakdown: string;
  hidden_fear: string;
  fear_in_session: string;
  locus_of_control: string;
  locus_description: string;
  trust_pattern: string;
  trust_description: string;
  compliance_style: string;
  compliance_description: string;
  stress_behavior: string;
  sensory_channel: string;
  communication_approach: string;
  influence_map: {
    what_works: string[];
    what_doesnt_work: string[];
    decision_making_style: string;
    motivation_triggers: string;
  };
  sales_handbook: {
    buyer_profile: string;
    likely_objections: Objection[];
    close_style: string;
    what_kills_the_sale: string;
    what_gets_them_off_fence: string;
    coaching_close_script: string;
    anchor_moment: string;
  };
};

type Assessment = {
  id: string;
  name: string;
  email: string;
  jungian_type: string;
  goal: string;
  scores: Record<string, number>;
  answer_map: Record<string, string> | null;
  behavioral_profile: BehavioralProfile | null;
  created_at: string;
};

export default function BehavioralIntelPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);
  const [backfilling, setBackfilling] = useState(false);
  const [backfillResult, setBackfillResult] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/assessments");
    const data = await res.json();
    setAssessments(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function generateProfile(id: string) {
    setGenerating(id);
    try {
      await fetch("/api/generate-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessment_id: id }),
      });
      await load();
    } finally {
      setGenerating(null);
    }
  }

  async function runBackfill() {
    setBackfilling(true);
    setBackfillResult(null);
    try {
      const res = await fetch("/api/assessments/backfill", { method: "POST" });
      const data = await res.json();
      if (data.count === 0 || data.message) {
        setBackfillResult("All assessments already have profiles.");
      } else {
        setBackfillResult(`Backfill complete: ${data.success} generated, ${data.failed} failed.`);
      }
      await load();
    } finally {
      setBackfilling(false);
    }
  }

  const withProfile = assessments.filter((a) => a.behavioral_profile);
  const withoutProfile = assessments.filter((a) => !a.behavioral_profile);

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Brain size={20} style={{ color: BRAND.teal }} />
            <h1 className="text-xl font-black text-white tracking-tight">Behavioral Intel</h1>
          </div>
          <p className="text-xs text-slate-500">
            Private behavioral profiles · Never shown to clients
          </p>
        </div>
        <div className="flex items-center gap-3">
          {withoutProfile.length > 0 && (
            <button
              onClick={runBackfill}
              disabled={backfilling}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-white/10 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
            >
              {backfilling ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
              Backfill {withoutProfile.length} missing
            </button>
          )}
          {backfillResult && (
            <span className="text-xs" style={{ color: BRAND.teal }}>{backfillResult}</span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard label="Total Assessments" value={assessments.length} />
        <StatCard label="Profiles Generated" value={withProfile.length} color={BRAND.teal} />
        <StatCard label="Awaiting Profile" value={withoutProfile.length} color={withoutProfile.length > 0 ? BRAND.coral : undefined} />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Loader2 size={14} className="animate-spin" />Loading assessments...
        </div>
      ) : assessments.length === 0 ? (
        <div className="text-sm text-slate-500">No assessments yet.</div>
      ) : (
        <div className="space-y-3">
          {assessments.map((a) => (
            <AssessmentRow
              key={a.id}
              assessment={a}
              expanded={expanded === a.id}
              onToggle={() => setExpanded(expanded === a.id ? null : a.id)}
              onGenerate={() => generateProfile(a.id)}
              generating={generating === a.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded-xl p-4 border border-white/5" style={{ background: "#131E2B" }}>
      <div className="text-2xl font-black text-white mb-0.5" style={color ? { color } : {}}>{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}

function AssessmentRow({
  assessment: a,
  expanded,
  onToggle,
  onGenerate,
  generating,
}: {
  assessment: Assessment;
  expanded: boolean;
  onToggle: () => void;
  onGenerate: () => void;
  generating: boolean;
}) {
  const p = a.behavioral_profile;
  const scores = a.scores ?? {};
  const total_ei = (scores.E ?? 0) + (scores.I ?? 0);
  const total_sn = (scores.S ?? 0) + (scores.N ?? 0);
  const total_tf = (scores.T ?? 0) + (scores.F ?? 0);
  const total_jp = (scores.J ?? 0) + (scores.P ?? 0);
  const pct = (a: number, b: number) => (a + b > 0 ? Math.round((a / (a + b)) * 100) : 50);

  return (
    <div className="rounded-xl border border-white/5 overflow-hidden" style={{ background: "#131E2B" }}>
      {/* Row header */}
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-bold text-white">{a.name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(0,217,192,0.1)", color: BRAND.teal }}>
              {a.jungian_type}
            </span>
            {p ? (
              <span className="text-xs flex items-center gap-1" style={{ color: BRAND.teal }}>
                <CheckCircle size={11} /> Profile ready
              </span>
            ) : (
              <span className="text-xs flex items-center gap-1 text-slate-600">
                <AlertCircle size={11} /> No profile
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500">{a.email}</div>
        </div>

        {/* Score bars (compact) */}
        <div className="hidden md:flex gap-3 text-xs text-slate-600">
          <ScorePill a="E" b="I" pctA={pct(scores.E, scores.I)} dominant={scores.E >= scores.I ? "E" : "I"} />
          <ScorePill a="S" b="N" pctA={pct(scores.S, scores.N)} dominant={scores.S >= scores.N ? "S" : "N"} />
          <ScorePill a="T" b="F" pctA={pct(scores.T, scores.F)} dominant={scores.T >= scores.F ? "T" : "F"} />
          <ScorePill a="J" b="P" pctA={pct(scores.J, scores.P)} dominant={scores.J >= scores.P ? "J" : "P"} />
        </div>

        <div className="flex items-center gap-2">
          {!p && (
            <button
              onClick={(e) => { e.stopPropagation(); onGenerate(); }}
              disabled={generating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "rgba(0,217,192,0.12)", color: BRAND.teal }}
            >
              {generating ? <Loader2 size={11} className="animate-spin" /> : <Brain size={11} />}
              Generate
            </button>
          )}
          {p && (
            <button
              onClick={onToggle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors border border-white/5"
            >
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {expanded ? "Collapse" : "View Intel"}
            </button>
          )}
        </div>
      </div>

      {/* Expanded profile */}
      {expanded && p && (
        <div className="border-t border-white/5 px-5 py-5 space-y-6">
          {/* Section 1: Needs */}
          <Section icon={<Target size={14} />} title="Needs & Core Driver" color={BRAND.teal}>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Primary Need" value={p.primary_need} highlight />
              <Field label="Secondary Need" value={p.secondary_need} />
              <div className="sm:col-span-2">
                <Field label="Need Breakdown" value={p.need_breakdown} />
              </div>
              <Field label="Hidden Fear" value={p.hidden_fear} color={BRAND.coral} />
              <Field label="How Fear Shows in Session" value={p.fear_in_session} />
            </div>
          </Section>

          {/* Section 2: Behavioral Profile */}
          <Section icon={<Brain size={14} />} title="Behavioral Profile" color="#a78bfa">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Locus of Control" value={`${p.locus_of_control}`} />
              <Field label="Trust Pattern" value={p.trust_pattern} />
              <Field label="Compliance Style" value={p.compliance_style} />
              <Field label="Sensory Channel" value={p.sensory_channel} />
              <div className="sm:col-span-2"><Field label="LOC — What This Means" value={p.locus_description} /></div>
              <div className="sm:col-span-2"><Field label="Trust — How to Earn It" value={p.trust_description} /></div>
              <div className="sm:col-span-2"><Field label="Compliance — How They Follow" value={p.compliance_description} /></div>
              <div className="sm:col-span-2"><Field label="Under Pressure" value={p.stress_behavior} /></div>
              <div className="sm:col-span-2"><Field label="Communication Approach" value={p.communication_approach} /></div>
            </div>
          </Section>

          {/* Section 3: Influence Map */}
          <Section icon={<Zap size={14} />} title="Influence & Persuasion Map" color="#fbbf24">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">What Works</p>
                <ul className="space-y-1.5">
                  {p.influence_map.what_works.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <span style={{ color: BRAND.teal }} className="mt-0.5 flex-shrink-0">✓</span>{w}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">What Shuts Them Down</p>
                <ul className="space-y-1.5">
                  {p.influence_map.what_doesnt_work.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <span style={{ color: BRAND.coral }} className="mt-0.5 flex-shrink-0">✗</span>{w}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="sm:col-span-2"><Field label="How They Make Decisions" value={p.influence_map.decision_making_style} /></div>
              <div className="sm:col-span-2"><Field label="What Actually Moves Them" value={p.influence_map.motivation_triggers} /></div>
            </div>
          </Section>

          {/* Section 4: Sales Closing Handbook */}
          <Section icon={<BookOpen size={14} />} title="Sales Closing Handbook" color={BRAND.coral}>
            <div className="space-y-4">
              <Field label="Buyer Profile" value={p.sales_handbook.buyer_profile} />

              {/* Objections */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Likely Objections + How to Handle</p>
                <div className="space-y-3">
                  {p.sales_handbook.likely_objections.map((obj, i) => (
                    <div key={i} className="rounded-lg p-4 border border-white/5" style={{ background: "#0D1825" }}>
                      <p className="text-xs font-bold text-white mb-1">"{obj.objection}"</p>
                      <p className="text-xs text-slate-500 mb-2"><span className="text-slate-400 font-medium">Real meaning:</span> {obj.what_it_really_means}</p>
                      <p className="text-xs text-slate-500 mb-2"><span className="text-slate-400 font-medium">Reframe:</span> {obj.reframe}</p>
                      <p className="text-xs rounded p-2" style={{ background: "rgba(0,217,192,0.06)", color: BRAND.teal }}>
                        <span className="font-semibold">Say: </span>{obj.language}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <Field label="Close Style" value={p.sales_handbook.close_style} highlight />
              <Field label="What Kills the Sale" value={p.sales_handbook.what_kills_the_sale} color={BRAND.coral} />
              <Field label="What Gets Them Off the Fence" value={p.sales_handbook.what_gets_them_off_fence} />

              {/* Anchor moment */}
              <div className="rounded-lg p-4 border" style={{ background: "rgba(0,217,192,0.04)", borderColor: "rgba(0,217,192,0.15)" }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: BRAND.teal }}>Anchor — Plant This in the First 10 Min</p>
                <p className="text-xs text-slate-300 leading-relaxed">{p.sales_handbook.anchor_moment}</p>
              </div>

              {/* Closing script */}
              <div className="rounded-lg p-4 border" style={{ background: "rgba(255,107,107,0.04)", borderColor: "rgba(255,107,107,0.2)" }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: BRAND.coral }}>Closing Script for This Person</p>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{p.sales_handbook.coaching_close_script}</p>
              </div>
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}

function ScorePill({ a, b, pctA, dominant }: { a: string; b: string; pctA: number; dominant: string }) {
  return (
    <span className="text-xs">
      <span style={{ color: dominant === a ? BRAND.teal : "#64748b" }}>{a}</span>
      <span className="text-slate-700 mx-0.5">/</span>
      <span style={{ color: dominant === b ? BRAND.teal : "#64748b" }}>{b}</span>
      <span className="ml-1 text-slate-600">{dominant === a ? pctA : 100 - pctA}%</span>
    </span>
  );
}

function Section({
  icon,
  title,
  color,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span style={{ color }}>{icon}</span>
        <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  highlight,
  color,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  color?: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <p
        className="text-xs leading-relaxed"
        style={{ color: color ?? (highlight ? "#F7F9FC" : "#94a3b8"), fontWeight: highlight ? 600 : 400 }}
      >
        {value}
      </p>
    </div>
  );
}
