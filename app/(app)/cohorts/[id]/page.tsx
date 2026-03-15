"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  CalendarPlus,
  CheckCircle,
  Clock,
  Users,
  Zap,
  X,
} from "lucide-react";
import { useClients } from "../../../hooks/useClients";

type CohortSession = {
  id: string;
  cohort_id: string;
  session_number: number;
  title: string | null;
  framework: string | null;
  custom_topic: string | null;
  objectives: string | null;
  plan: Record<string, unknown> | null;
  status: string;
  session_date: string | null;
  notes: string | null;
};

type Cohort = {
  id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  total_sessions: number;
  client_ids: string[];
  client_names: string[];
  status: string;
};

type GroupSessionPlan = {
  session_title?: string;
  group_dynamics?: string;
  opening?: string;
  check_in_activity?: string;
  todays_focus?: string;
  agenda?: { time: string; block: string; notes: string }[];
  framework_or_topic_approach?: string | null;
  group_exercise?: string;
  // new compact shape
  watch_for?: string;
  // legacy shape
  type_callouts?: { types: string[]; members: string[]; watch_for: string; how_to_engage: string }[];
  group_friction_points?: string;
  how_to_handle_friction?: string;
  session_close?: string;
  homework?: string;
  next_session_seed?: string;
};

const BRAND = { teal: "#00D9C0", coral: "#FF6B6B", purple: "#a78bfa" };

export default function CohortDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { clients } = useClients();
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [sessions, setSessions] = useState<CohortSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingOutline, setGeneratingOutline] = useState(false);
  const [buildingPlan, setBuildingPlan] = useState<string | null>(null);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    setLoading(true);
    const res = await fetch(`/api/cohorts/${id}`);
    if (res.ok) {
      const data = await res.json();
      setCohort(data.cohort);
      setSessions(data.sessions);
    }
    setLoading(false);
  }

  async function generateOutline() {
    if (!cohort) return;
    setGeneratingOutline(true);
    setError(null);
    try {
      const cohortClients = clients.filter((c) => cohort.client_ids.includes(c.id));
      const res = await fetch("/api/generate-cohort-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cohort_id: cohort.id,
          clients: cohortClients.map((c) => ({ name: c.name, jungian_type: c.jungianType })),
          total_sessions: cohort.total_sessions,
          cohort_goal: cohort.description,
        }),
      });
      const text = await res.text();
      let data: { sessions?: CohortSession[]; error?: string };
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server error — check Vercel logs");
      }
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setSessions(data.sessions ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate outline");
    } finally {
      setGeneratingOutline(false);
    }
  }

  async function buildSessionPlan(session: CohortSession) {
    if (!cohort) return;
    const cohortClients = clients.filter((c) => cohort.client_ids.includes(c.id));
    if (cohortClients.length < 2) {
      setError("Need at least 2 clients in this cohort to build a group plan. Make sure clients are added.");
      return;
    }
    setBuildingPlan(session.id);
    setError(null);
    try {
      const res = await fetch("/api/generate-group-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clients: cohortClients.map((c) => ({ name: c.name, jungian_type: c.jungianType })),
          mode: session.framework ? "framework" : session.custom_topic ? "custom" : "none",
          framework: session.framework ?? null,
          custom_topic: session.custom_topic ?? null,
          session_goal: session.objectives ?? cohort.description,
        }),
      });
      const text = await res.text();
      let data: { plan?: GroupSessionPlan; error?: string };
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server error — try again in a moment");
      }
      if (!res.ok) throw new Error(data.error ?? "Failed");

      if (!data.plan) throw new Error("No plan returned from AI");
      // Save plan to session
      const updateRes = await fetch(`/api/cohort-sessions/${session.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: data.plan }),
      });
      if (updateRes.ok) {
        const updated = await updateRes.json();
        setSessions((prev) => prev.map((s) => (s.id === session.id ? updated : s)));
        setExpandedSession(session.id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to build plan");
    } finally {
      setBuildingPlan(null);
    }
  }

  async function markComplete(session: CohortSession) {
    const newStatus = session.status === "completed" ? "planned" : "completed";
    const res = await fetch(`/api/cohort-sessions/${session.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      const updated = await res.json();
      setSessions((prev) => prev.map((s) => (s.id === session.id ? updated : s)));
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-2 text-slate-500 text-sm">
        <Loader2 size={14} className="animate-spin" /> Loading cohort...
      </div>
    );
  }

  if (!cohort) {
    return (
      <div className="p-8 text-sm text-slate-500">Cohort not found.</div>
    );
  }

  const completed = sessions.filter((s) => s.status === "completed").length;

  return (
    <div className="p-4 md:p-8 max-w-5xl">
      {/* Back */}
      <button
        onClick={() => router.push("/cohorts")}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-6"
      >
        <ArrowLeft size={13} /> All Cohorts
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users size={18} style={{ color: BRAND.teal }} />
              <h1 className="text-2xl font-bold text-white">{cohort.name}</h1>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{
                  background: cohort.status === "active" ? "rgba(0,217,192,0.1)" : "rgba(255,255,255,0.05)",
                  color: cohort.status === "active" ? BRAND.teal : "#64748b",
                }}
              >
                {cohort.status}
              </span>
            </div>
            {cohort.description && (
              <p className="text-sm text-slate-400 mt-1">{cohort.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
              <span>{cohort.client_names?.length ?? 0} clients</span>
              <span>{completed}/{cohort.total_sessions} sessions done</span>
              {cohort.start_date && (
                <span>
                  Started{" "}
                  {new Date(cohort.start_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Client list */}
        {cohort.client_names?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {cohort.client_names.map((name) => (
              <span
                key={name}
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background: "rgba(0,217,192,0.08)", color: BRAND.teal }}
              >
                {name}
              </span>
            ))}
          </div>
        )}

        {/* Progress bar */}
        <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${cohort.total_sessions > 0 ? (completed / cohort.total_sessions) * 100 : 0}%`,
              background: BRAND.teal,
            }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg px-4 py-3 text-xs text-red-400 bg-red-500/10 flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)}>
            <X size={13} />
          </button>
        </div>
      )}

      {/* Generate outline CTA */}
      {sessions.length === 0 && (
        <div
          className="rounded-xl border p-8 flex flex-col items-center justify-center text-center mb-6"
          style={{ background: "#131E2B", borderColor: "rgba(0,217,192,0.15)" }}
        >
          <Zap size={24} style={{ color: BRAND.teal }} className="mb-3" />
          <p className="text-sm font-semibold text-white mb-1">No session plan yet</p>
          <p className="text-xs text-slate-500 mb-5">
            Generate a full {cohort.total_sessions}-session curriculum tailored to your group.
          </p>
          <button
            onClick={generateOutline}
            disabled={generatingOutline}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: BRAND.teal, color: "#080F18" }}
          >
            {generatingOutline ? (
              <><Loader2 size={14} className="animate-spin" />Generating curriculum...</>
            ) : (
              <><Zap size={14} />Generate {cohort.total_sessions}-Session Curriculum</>
            )}
          </button>
        </div>
      )}

      {/* Session grid */}
      {sessions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              Session Curriculum
            </p>
          </div>

          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              expanded={expandedSession === session.id}
              buildingPlan={buildingPlan === session.id}
              onToggle={() =>
                setExpandedSession(expandedSession === session.id ? null : session.id)
              }
              onBuildPlan={() => buildSessionPlan(session)}
              onMarkComplete={() => markComplete(session)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SessionCard({
  session,
  expanded,
  buildingPlan,
  onToggle,
  onBuildPlan,
  onMarkComplete,
}: {
  session: CohortSession;
  expanded: boolean;
  buildingPlan: boolean;
  onToggle: () => void;
  onBuildPlan: () => void;
  onMarkComplete: () => void;
}) {
  const hasPlan = !!session.plan;
  const isCompleted = session.status === "completed";

  return (
    <div
      className="rounded-xl border overflow-hidden transition-all"
      style={{
        background: "#131E2B",
        borderColor: isCompleted ? "rgba(0,217,192,0.2)" : "rgba(255,255,255,0.05)",
      }}
    >
      <div className="flex items-start gap-4 px-5 py-4">
        {/* Session number */}
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black flex-shrink-0 mt-0.5"
          style={{
            background: isCompleted ? "rgba(0,217,192,0.12)" : "rgba(255,255,255,0.04)",
            color: isCompleted ? BRAND.teal : "#64748b",
          }}
        >
          {isCompleted ? <CheckCircle size={16} /> : session.session_number}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-sm font-bold text-white">
              {session.title ?? `Session ${session.session_number}`}
            </span>
            {session.framework && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: "rgba(167,139,250,0.1)", color: "#a78bfa" }}
              >
                {session.framework}
              </span>
            )}
            {session.custom_topic && !session.framework && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: "rgba(251,191,36,0.1)", color: "#fbbf24" }}
              >
                {session.custom_topic}
              </span>
            )}
            {hasPlan && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: "rgba(0,217,192,0.08)", color: BRAND.teal }}
              >
                Plan ready
              </span>
            )}
          </div>
          {session.objectives && (
            <p className="text-xs text-slate-500 leading-relaxed">{session.objectives}</p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onMarkComplete}
            className="p-1.5 rounded transition-colors"
            style={{ color: isCompleted ? BRAND.teal : "#475569" }}
            title={isCompleted ? "Mark as planned" : "Mark as complete"}
          >
            <CheckCircle size={15} />
          </button>

          {!hasPlan ? (
            <button
              onClick={onBuildPlan}
              disabled={buildingPlan}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa" }}
            >
              {buildingPlan ? (
                <Loader2 size={11} className="animate-spin" />
              ) : (
                <CalendarPlus size={11} />
              )}
              {buildingPlan ? "Building..." : "Build Plan"}
            </button>
          ) : (
            <button
              onClick={onToggle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors border border-white/5"
            >
              <Clock size={11} />
              {expanded ? "Hide" : "View Plan"}
            </button>
          )}
        </div>
      </div>

      {expanded && session.plan && (
        <div className="border-t border-white/5 px-5 py-4 space-y-4">
          <GroupPlanSummary plan={session.plan as unknown as GroupSessionPlan} />
        </div>
      )}
    </div>
  );
}

function GroupPlanSummary({ plan }: { plan: GroupSessionPlan }) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: BRAND.purple }}>
        Full Group Session Plan
      </p>

      {plan.todays_focus && (
        <PlanField label="Focus" value={plan.todays_focus} />
      )}

      {plan.group_dynamics && (
        <div
          className="rounded-lg p-3 border"
          style={{ background: "rgba(251,191,36,0.04)", borderColor: "rgba(251,191,36,0.15)" }}
        >
          <p className="text-xs font-bold mb-1" style={{ color: "#fbbf24" }}>Group Dynamics</p>
          <p className="text-xs text-slate-300 leading-relaxed">{plan.group_dynamics}</p>
        </div>
      )}

      {plan.agenda?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Agenda</p>
          <div className="space-y-1.5">
            {plan.agenda.map((a, i) => (
              <div key={i} className="flex gap-3 text-xs">
                <span className="text-slate-600 flex-shrink-0 w-16">{a.time}</span>
                <div>
                  <span className="font-semibold text-slate-300">{a.block}</span>
                  {a.notes && <span className="text-slate-500 ml-2">{a.notes}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {plan.opening && <PlanField label="How to Open" value={plan.opening} />}
      {plan.check_in_activity && (
        <PlanField label="Check-In Activity" value={plan.check_in_activity} highlight />
      )}
      {plan.framework_or_topic_approach && (
        <PlanField label="Framework Approach" value={plan.framework_or_topic_approach} />
      )}
      {plan.group_exercise && <PlanField label="Group Exercise" value={plan.group_exercise} />}

      {/* New compact shape: watch_for as a string */}
      {plan.watch_for && !plan.type_callouts?.length && (
        <div
          className="rounded-lg p-3 border border-white/5 text-xs"
          style={{ background: "#0D1825" }}
        >
          <p className="font-bold text-slate-400 mb-1 uppercase tracking-widest text-xs">Watch For</p>
          <p className="text-slate-300 leading-relaxed">{plan.watch_for}</p>
        </div>
      )}

      {/* Legacy shape: type_callouts array */}
      {(plan.type_callouts?.length ?? 0) > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
            Type-Specific Notes
          </p>
          <div className="space-y-2">
            {plan.type_callouts!.map((tc, i) => (
              <div
                key={i}
                className="rounded-lg p-3 border border-white/5 text-xs"
                style={{ background: "#0D1825" }}
              >
                <p className="font-bold text-white mb-1">
                  {tc.members?.join(", ") || tc.types?.join(", ")}
                </p>
                <p className="text-slate-400">
                  <span className="text-slate-500">Watch:</span> {tc.watch_for}
                </p>
                <p className="text-slate-400 mt-0.5">
                  <span className="text-slate-500">Engage:</span> {tc.how_to_engage}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {plan.group_friction_points && (
        <div
          className="rounded-lg p-3 border"
          style={{ background: "rgba(255,107,107,0.04)", borderColor: "rgba(255,107,107,0.15)" }}
        >
          <p className="text-xs font-bold mb-1" style={{ color: BRAND.coral }}>Friction Points</p>
          <p className="text-xs text-slate-300">{plan.group_friction_points}</p>
          {plan.how_to_handle_friction && (
            <p className="text-xs text-slate-400 mt-1 italic">"{plan.how_to_handle_friction}"</p>
          )}
        </div>
      )}

      {plan.homework && (
        <div
          className="rounded-lg p-3 border"
          style={{ background: "rgba(0,217,192,0.04)", borderColor: "rgba(0,217,192,0.15)" }}
        >
          <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: BRAND.teal }}>
            Homework
          </p>
          <p className="text-xs text-slate-300">{plan.homework}</p>
        </div>
      )}

      {plan.session_close && <PlanField label="How to Close" value={plan.session_close} />}

      {plan.next_session_seed && (
        <PlanField label="Plant This for Next Session" value={plan.next_session_seed} />
      )}
    </div>
  );
}

function PlanField({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-xs leading-relaxed ${highlight ? "text-white font-medium" : "text-slate-300"}`}>
        {value}
      </p>
    </div>
  );
}
