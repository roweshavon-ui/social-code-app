"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  CalendarPlus,
  CheckCircle,
  Users,
  Zap,
  X,
  Plus,
  UserMinus,
  ChevronDown,
  ChevronUp,
  BookOpen,
  MessageSquare,
  Dumbbell,
  ClipboardList,
} from "lucide-react";
import { useClients } from "../../../hooks/useClients";

type Curriculum = {
  teach_points: string[];
  activity: string;
  homework: string;
  discussion_questions: string[];
};

type CohortSession = {
  id: string;
  cohort_id: string;
  session_number: number;
  title: string | null;
  framework: string | null;
  custom_topic: string | null;
  objectives: string | null;
  curriculum: Curriculum | null;
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
  watch_for?: string;
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
  const [showAddClients, setShowAddClients] = useState(false);
  const [generatingCurriculum, setGeneratingCurriculum] = useState<string | null>(null);

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
      setError("Need at least 2 enrolled clients to build a personalized group plan.");
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

  async function generateCurriculum(session: CohortSession) {
    if (!cohort) return;
    setGeneratingCurriculum(session.id);
    setError(null);
    try {
      const res = await fetch("/api/generate-session-curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: session.id,
          title: session.title,
          framework: session.framework,
          objectives: session.objectives,
          cohort_goal: cohort.description,
        }),
      });
      const text = await res.text();
      let data: { session?: CohortSession; error?: string };
      try { data = JSON.parse(text); } catch { throw new Error("Server error — try again"); }
      if (!res.ok) throw new Error(data.error ?? "Failed");
      if (data.session) {
        setSessions((prev) => prev.map((s) => (s.id === session.id ? data.session! : s)));
        setExpandedSession(session.id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate details");
    } finally {
      setGeneratingCurriculum(null);
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

  async function updateClients(newClientIds: string[]) {
    if (!cohort) return;
    const newClientNames = clients
      .filter((c) => newClientIds.includes(c.id))
      .map((c) => c.name);
    const res = await fetch(`/api/cohorts/${cohort.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientIds: newClientIds, clientNames: newClientNames }),
    });
    if (res.ok) {
      const updated = await res.json();
      setCohort(updated);
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
    return <div className="p-8 text-sm text-slate-500">Cohort not found.</div>;
  }

  const completed = sessions.filter((s) => s.status === "completed").length;
  const enrolledClients = clients.filter((c) => cohort.client_ids.includes(c.id));
  const unenrolledClients = clients.filter((c) => !cohort.client_ids.includes(c.id));

  return (
    <div className="p-4 md:p-8 max-w-5xl">
      <button
        onClick={() => router.push("/cohorts")}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-6"
      >
        <ArrowLeft size={13} /> All Cohorts
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
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
              <span>{enrolledClients.length} enrolled</span>
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

          <button
            onClick={() => setShowAddClients(!showAddClients)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
            style={{ background: "rgba(0,217,192,0.1)", color: BRAND.teal, border: "1px solid rgba(0,217,192,0.2)" }}
          >
            <Users size={13} />
            Manage Clients
          </button>
        </div>

        {/* Client manager */}
        {showAddClients && (
          <div
            className="mt-4 rounded-xl border p-4"
            style={{ background: "#131E2B", borderColor: "rgba(0,217,192,0.2)" }}
          >
            <p className="text-xs font-semibold text-white mb-3">Enrolled Clients</p>
            {enrolledClients.length === 0 ? (
              <p className="text-xs text-slate-500 mb-3">No one enrolled yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2 mb-3">
                {enrolledClients.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg font-medium"
                    style={{ background: "rgba(0,217,192,0.08)", color: BRAND.teal }}
                  >
                    {c.name}
                    {c.jungianType && <span className="text-slate-500">· {c.jungianType}</span>}
                    <button
                      onClick={() => updateClients(cohort.client_ids.filter((cid) => cid !== c.id))}
                      className="ml-1 hover:text-red-400 transition-colors"
                    >
                      <UserMinus size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {unenrolledClients.length > 0 && (
              <>
                <p className="text-xs font-semibold text-slate-500 mb-2">Add to Cohort</p>
                <div className="flex flex-wrap gap-2">
                  {unenrolledClients.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => updateClients([...cohort.client_ids, c.id])}
                      className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg font-medium border transition-all hover:border-teal-500/40"
                      style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)", color: "#94a3b8" }}
                    >
                      <Plus size={10} />
                      {c.name}
                      {c.jungianType && <span className="text-slate-600">· {c.jungianType}</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Enrolled chips (collapsed state) */}
        {!showAddClients && enrolledClients.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {enrolledClients.map((c) => (
              <span
                key={c.id}
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background: "rgba(0,217,192,0.08)", color: BRAND.teal }}
              >
                {c.name}
              </span>
            ))}
          </div>
        )}

        {!showAddClients && enrolledClients.length === 0 && (
          <div
            className="mt-4 rounded-lg px-4 py-3 text-xs flex items-center gap-2"
            style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)", color: "#fbbf24" }}
          >
            <Users size={13} />
            No clients enrolled yet — click "Manage Clients" to add them as people sign up.
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

      {/* Generate curriculum CTA */}
      {sessions.length === 0 && (
        <div
          className="rounded-xl border p-8 flex flex-col items-center justify-center text-center mb-6"
          style={{ background: "#131E2B", borderColor: "rgba(0,217,192,0.15)" }}
        >
          <Zap size={24} style={{ color: BRAND.teal }} className="mb-3" />
          <p className="text-sm font-semibold text-white mb-1">No curriculum yet</p>
          <p className="text-xs text-slate-500 mb-2">
            Generate a full {cohort.total_sessions}-session curriculum — what to teach, activities, homework, and discussion questions.
          </p>
          <p className="text-xs text-slate-600 mb-5">
            Session 1 always starts with TALK Check. Add clients anytime before running sessions.
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
              <><Zap size={14} />Build {cohort.total_sessions}-Session Curriculum</>
            )}
          </button>
        </div>
      )}

      {/* Session list */}
      {sessions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              Curriculum · {sessions.length} Sessions
            </p>
          </div>

          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              expanded={expandedSession === session.id}
              buildingPlan={buildingPlan === session.id}
              generatingCurriculum={generatingCurriculum === session.id}
              canBuildPlan={enrolledClients.length >= 2}
              onToggle={() =>
                setExpandedSession(expandedSession === session.id ? null : session.id)
              }
              onBuildPlan={() => buildSessionPlan(session)}
              onGenerateCurriculum={() => generateCurriculum(session)}
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
  generatingCurriculum,
  canBuildPlan,
  onToggle,
  onBuildPlan,
  onGenerateCurriculum,
  onMarkComplete,
}: {
  session: CohortSession;
  expanded: boolean;
  buildingPlan: boolean;
  generatingCurriculum: boolean;
  canBuildPlan: boolean;
  onToggle: () => void;
  onBuildPlan: () => void;
  onGenerateCurriculum: () => void;
  onMarkComplete: () => void;
}) {
  const hasPlan = !!session.plan;
  const hasCurriculum = !!session.curriculum;
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
            {hasPlan && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: "rgba(0,217,192,0.08)", color: BRAND.teal }}
              >
                Group plan ready
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

          {!hasCurriculum && !hasPlan && (
            <button
              onClick={onGenerateCurriculum}
              disabled={generatingCurriculum}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "rgba(0,217,192,0.08)", color: BRAND.teal }}
            >
              {generatingCurriculum ? <Loader2 size={11} className="animate-spin" /> : <BookOpen size={11} />}
              {generatingCurriculum ? "Generating..." : "Details"}
            </button>
          )}

          {(hasCurriculum || hasPlan) && (
            <button
              onClick={onToggle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors border border-white/5"
            >
              {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              {expanded ? "Hide" : "Details"}
            </button>
          )}

          {canBuildPlan && !hasPlan && (
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
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-white/5 px-5 py-5 space-y-5">
          {/* Pre-built curriculum */}
          {session.curriculum && !hasPlan && (
            <CurriculumView curriculum={session.curriculum} framework={session.framework} />
          )}

          {/* Full AI group session plan */}
          {hasPlan && (
            <>
              {session.curriculum && (
                <CurriculumView curriculum={session.curriculum} framework={session.framework} compact />
              )}
              <GroupPlanSummary plan={session.plan as unknown as GroupSessionPlan} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function CurriculumView({
  curriculum,
  framework,
  compact,
}: {
  curriculum: Curriculum;
  framework: string | null;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "opacity-70" : ""}>
      {!compact && (
        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: BRAND.teal }}>
          {framework ? `${framework} Curriculum` : "Session Curriculum"}
        </p>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {curriculum.teach_points?.length > 0 && (
          <div
            className="rounded-lg p-3 border border-white/5"
            style={{ background: "#0D1825" }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <BookOpen size={11} style={{ color: BRAND.purple }} />
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: BRAND.purple }}>
                Teach
              </p>
            </div>
            <ul className="space-y-1">
              {curriculum.teach_points.map((pt, i) => (
                <li key={i} className="text-xs text-slate-300 flex gap-2">
                  <span style={{ color: BRAND.purple }}>·</span>
                  {pt}
                </li>
              ))}
            </ul>
          </div>
        )}

        {curriculum.activity && (
          <div
            className="rounded-lg p-3 border border-white/5"
            style={{ background: "#0D1825" }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <Dumbbell size={11} style={{ color: "#fbbf24" }} />
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#fbbf24" }}>
                Activity
              </p>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{curriculum.activity}</p>
          </div>
        )}

        {curriculum.homework && (
          <div
            className="rounded-lg p-3 border"
            style={{ background: "rgba(0,217,192,0.04)", borderColor: "rgba(0,217,192,0.15)" }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <ClipboardList size={11} style={{ color: BRAND.teal }} />
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: BRAND.teal }}>
                Homework
              </p>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{curriculum.homework}</p>
          </div>
        )}

        {curriculum.discussion_questions?.length > 0 && (
          <div
            className="rounded-lg p-3 border border-white/5"
            style={{ background: "#0D1825" }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <MessageSquare size={11} style={{ color: BRAND.coral }} />
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: BRAND.coral }}>
                Discussion Questions
              </p>
            </div>
            <ul className="space-y-1">
              {curriculum.discussion_questions.map((q, i) => (
                <li key={i} className="text-xs text-slate-300 flex gap-2">
                  <span style={{ color: BRAND.coral }}>{i + 1}.</span>
                  {q}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function GroupPlanSummary({ plan }: { plan: GroupSessionPlan }) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: BRAND.purple }}>
        Personalized Group Session Plan
      </p>

      {plan.todays_focus && <PlanField label="Focus" value={plan.todays_focus} />}

      {plan.group_dynamics && (
        <div
          className="rounded-lg p-3 border"
          style={{ background: "rgba(251,191,36,0.04)", borderColor: "rgba(251,191,36,0.15)" }}
        >
          <p className="text-xs font-bold mb-1" style={{ color: "#fbbf24" }}>Group Dynamics</p>
          <p className="text-xs text-slate-300 leading-relaxed">{plan.group_dynamics}</p>
        </div>
      )}

      {(plan.agenda?.length ?? 0) > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Agenda</p>
          <div className="space-y-1.5">
            {plan.agenda!.map((a, i) => (
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
      {plan.check_in_activity && <PlanField label="Check-In Activity" value={plan.check_in_activity} highlight />}
      {plan.framework_or_topic_approach && <PlanField label="Framework Approach" value={plan.framework_or_topic_approach} />}
      {plan.group_exercise && <PlanField label="Group Exercise" value={plan.group_exercise} />}

      {plan.watch_for && !(plan.type_callouts?.length) && (
        <div className="rounded-lg p-3 border border-white/5 text-xs" style={{ background: "#0D1825" }}>
          <p className="font-bold text-slate-400 mb-1 uppercase tracking-widest text-xs">Watch For</p>
          <p className="text-slate-300 leading-relaxed">{plan.watch_for}</p>
        </div>
      )}

      {(plan.type_callouts?.length ?? 0) > 0 && (
        <div className="space-y-2">
          {plan.type_callouts!.map((tc, i) => (
            <div key={i} className="rounded-lg p-3 border border-white/5 text-xs" style={{ background: "#0D1825" }}>
              <p className="font-bold text-white mb-1">{tc.members?.join(", ") || tc.types?.join(", ")}</p>
              <p className="text-slate-400"><span className="text-slate-500">Watch:</span> {tc.watch_for}</p>
              <p className="text-slate-400 mt-0.5"><span className="text-slate-500">Engage:</span> {tc.how_to_engage}</p>
            </div>
          ))}
        </div>
      )}

      {plan.group_friction_points && (
        <div className="rounded-lg p-3 border" style={{ background: "rgba(255,107,107,0.04)", borderColor: "rgba(255,107,107,0.15)" }}>
          <p className="text-xs font-bold mb-1" style={{ color: BRAND.coral }}>Friction Points</p>
          <p className="text-xs text-slate-300">{plan.group_friction_points}</p>
          {plan.how_to_handle_friction && (
            <p className="text-xs text-slate-400 mt-1 italic">"{plan.how_to_handle_friction}"</p>
          )}
        </div>
      )}

      {plan.homework && (
        <div className="rounded-lg p-3 border" style={{ background: "rgba(0,217,192,0.04)", borderColor: "rgba(0,217,192,0.15)" }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: BRAND.teal }}>Homework</p>
          <p className="text-xs text-slate-300">{plan.homework}</p>
        </div>
      )}

      {plan.session_close && <PlanField label="How to Close" value={plan.session_close} />}
      {plan.next_session_seed && <PlanField label="Plant This for Next Session" value={plan.next_session_seed} />}
    </div>
  );
}

function PlanField({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-xs leading-relaxed ${highlight ? "text-white font-medium" : "text-slate-300"}`}>
        {value}
      </p>
    </div>
  );
}
