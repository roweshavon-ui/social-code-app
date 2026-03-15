"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Plus,
  CalendarPlus,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
  Clock,
  Zap,
} from "lucide-react";
import { useClients } from "../../hooks/useClients";

const SOCIAL_CODE_FRAMEWORKS = [
  "SPARK",
  "3-Second Social Scan",
  "Fearless Approach System",
  "TALK Check",
  "BRAVE",
  "SHIELD",
  "Stop Replaying",
] as const;

type GroupSessionPlan = {
  session_title: string;
  group_dynamics: string;
  opening: string;
  check_in_activity: string;
  todays_focus: string;
  agenda: { time: string; block: string; notes: string }[];
  framework_or_topic_approach: string | null;
  group_exercise: string;
  type_callouts: { types: string[]; members: string[]; watch_for: string; how_to_engage: string }[];
  group_friction_points: string;
  how_to_handle_friction: string;
  session_close: string;
  homework: string;
  next_session_seed: string;
};

type SavedGroupSession = {
  id: string;
  created_at: string;
  title: string;
  date: string | null;
  duration: string;
  client_names: string[];
  mode: string;
  framework: string | null;
  custom_topic: string | null;
  session_goal: string | null;
  plan: GroupSessionPlan | null;
};

const BRAND = { teal: "#00D9C0", coral: "#FF6B6B", purple: "#a78bfa" };

export default function GroupSessionsPage() {
  const { clients, loaded: clientsLoaded } = useClients();
  const [savedSessions, setSavedSessions] = useState<SavedGroupSession[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetchSaved();
  }, []);

  async function fetchSaved() {
    setLoadingSaved(true);
    const res = await fetch("/api/group-sessions");
    if (res.ok) {
      const data = await res.json();
      setSavedSessions(Array.isArray(data) ? data : []);
    }
    setLoadingSaved(false);
  }

  async function handleSave(session: {
    title: string;
    clientIds: string[];
    clientNames: string[];
    mode: string;
    framework: string | null;
    customTopic: string | null;
    sessionGoal: string;
    plan: GroupSessionPlan;
  }) {
    const res = await fetch("/api/group-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(session),
    });
    if (res.ok) {
      const data = await res.json();
      setSavedSessions((prev) => [data, ...prev]);
    }
    setShowBuilder(false);
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users size={20} style={{ color: BRAND.teal }} />
            <h1 className="text-2xl font-bold text-white tracking-tight">Group Sessions</h1>
          </div>
          <p className="mt-0.5 text-sm text-slate-500">
            AI-built session plans for group coaching calls
          </p>
        </div>
        <button
          onClick={() => setShowBuilder(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: BRAND.purple }}
        >
          <Plus size={15} strokeWidth={2.5} />
          Build Group Session
        </button>
      </div>

      {showBuilder && clientsLoaded && (
        <GroupSessionBuilder
          clients={clients}
          onSave={handleSave}
          onClose={() => setShowBuilder(false)}
        />
      )}

      {loadingSaved ? (
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Loader2 size={14} className="animate-spin" /> Loading sessions...
        </div>
      ) : savedSessions.length === 0 ? (
        <div
          className="rounded-xl border border-white/5 p-16 flex flex-col items-center justify-center text-center"
          style={{ background: "#131E2B" }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
            style={{
              background: "rgba(167,139,250,0.08)",
              border: "1px dashed rgba(167,139,250,0.2)",
            }}
          >
            <Users size={20} style={{ color: BRAND.purple }} strokeWidth={1.5} />
          </div>
          <p className="text-sm text-slate-500">No group sessions yet.</p>
          <p className="text-xs text-slate-600 mt-1">
            Click &quot;Build Group Session&quot; to create your first one.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {savedSessions.map((s) => (
            <SavedSessionCard
              key={s.id}
              session={s}
              expanded={expanded === s.id}
              onToggle={() => setExpanded(expanded === s.id ? null : s.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GroupSessionBuilder({
  clients,
  onSave,
  onClose,
}: {
  clients: ReturnType<typeof useClients>["clients"];
  onSave: (session: {
    title: string;
    clientIds: string[];
    clientNames: string[];
    mode: string;
    framework: string | null;
    customTopic: string | null;
    sessionGoal: string;
    plan: GroupSessionPlan;
  }) => void;
  onClose: () => void;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sessionGoal, setSessionGoal] = useState("");
  const [mode, setMode] = useState<"framework" | "custom" | "none">("none");
  const [framework, setFramework] = useState<string>(SOCIAL_CODE_FRAMEWORKS[0]);
  const [customTopic, setCustomTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState<GroupSessionPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggleClient(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  const selectedClients = clients.filter((c) => selectedIds.includes(c.id));

  async function generate() {
    if (selectedIds.length < 2) {
      setError("Select at least 2 clients for a group session.");
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-group-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clients: selectedClients.map((c) => ({
            name: c.name,
            jungian_type: c.jungianType,
          })),
          mode,
          framework: mode === "framework" ? framework : null,
          custom_topic: mode === "custom" ? customTopic : null,
          session_goal: sessionGoal,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setPlan(data.plan);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setGenerating(false);
    }
  }

  function handleSave() {
    if (!plan) return;
    onSave({
      title: plan.session_title,
      clientIds: selectedIds,
      clientNames: selectedClients.map((c) => c.name),
      mode,
      framework: mode === "framework" ? framework : null,
      customTopic: mode === "custom" ? customTopic : null,
      sessionGoal,
      plan,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-8 px-4">
      <div
        className="w-full max-w-2xl rounded-2xl border border-white/10 flex flex-col"
        style={{ background: "#0D1825" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2">
              <Users size={15} style={{ color: BRAND.purple }} />
              <span className="text-sm font-bold text-white">Group Session Builder</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {selectedIds.length === 0
                ? "Select clients to build a group plan"
                : `${selectedIds.length} client${selectedIds.length !== 1 ? "s" : ""} selected`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>

        {!plan ? (
          <div className="px-6 py-5 space-y-5">
            {/* Client selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                Select Clients (min 2)
              </label>
              {clients.length === 0 ? (
                <p className="text-xs text-slate-500">No clients yet. Add clients first.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {clients.map((c) => {
                    const selected = selectedIds.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        onClick={() => toggleClient(c.id)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium border text-left transition-all"
                        style={{
                          background: selected ? "rgba(167,139,250,0.12)" : "rgba(255,255,255,0.02)",
                          borderColor: selected
                            ? "rgba(167,139,250,0.4)"
                            : "rgba(255,255,255,0.08)",
                          color: selected ? BRAND.purple : "#94a3b8",
                        }}
                      >
                        <span
                          className="w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 text-xs font-bold"
                          style={{
                            borderColor: selected ? BRAND.purple : "#475569",
                            background: selected ? BRAND.purple : "transparent",
                            color: selected ? "#fff" : "transparent",
                          }}
                        >
                          ✓
                        </span>
                        <span className="truncate">{c.name}</span>
                        {c.jungianType && (
                          <span className="flex-shrink-0 text-slate-500">{c.jungianType}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Session goal */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                Session Goal (Optional)
              </label>
              <textarea
                value={sessionGoal}
                onChange={(e) => setSessionGoal(e.target.value)}
                placeholder="e.g. Help the group practice real-time conversation initiation and manage anxiety..."
                rows={2}
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 border border-white/10 outline-none focus:border-purple-500/50 resize-none"
                style={{ background: "#131E2B" }}
              />
            </div>

            {/* Mode toggle */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                Session Focus
              </label>
              <div className="flex flex-wrap gap-2">
                {(["none", "framework", "custom"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                    style={{
                      background: mode === m ? "rgba(167,139,250,0.15)" : "transparent",
                      borderColor:
                        mode === m ? "rgba(167,139,250,0.4)" : "rgba(255,255,255,0.08)",
                      color: mode === m ? BRAND.purple : "#64748b",
                    }}
                  >
                    {m === "none"
                      ? "Let AI decide"
                      : m === "framework"
                      ? "Use a framework"
                      : "Custom topic"}
                  </button>
                ))}
              </div>
            </div>

            {mode === "framework" && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                  Framework
                </label>
                <select
                  value={framework}
                  onChange={(e) => setFramework(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-white border border-white/10 outline-none focus:border-purple-500/50"
                  style={{ background: "#131E2B" }}
                >
                  {SOCIAL_CODE_FRAMEWORKS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {mode === "custom" && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                  Topic
                </label>
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="e.g. handling rejection in social situations..."
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 border border-white/10 outline-none focus:border-purple-500/50"
                  style={{ background: "#131E2B" }}
                />
              </div>
            )}

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              onClick={generate}
              disabled={generating || selectedIds.length < 2 || (mode === "custom" && !customTopic.trim())}
              className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: BRAND.purple, color: "#fff" }}
            >
              {generating ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Building group plan...
                </>
              ) : (
                <>
                  <CalendarPlus size={14} />
                  Generate Group Session Plan
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="px-6 py-5 space-y-5 overflow-y-auto">
            {/* Plan header */}
            <div
              className="rounded-xl p-4 border"
              style={{
                background: "rgba(167,139,250,0.06)",
                borderColor: "rgba(167,139,250,0.2)",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Users size={12} style={{ color: BRAND.purple }} />
                <p
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: BRAND.purple }}
                >
                  Group · {selectedClients.map((c) => c.name).join(", ")}
                </p>
              </div>
              <p className="text-lg font-black text-white">{plan.session_title}</p>
              <p className="text-xs text-slate-400 mt-1">{plan.todays_focus}</p>
            </div>

            {/* Group dynamics */}
            <div
              className="rounded-lg p-3 border"
              style={{ background: "rgba(251,191,36,0.04)", borderColor: "rgba(251,191,36,0.15)" }}
            >
              <p className="text-xs font-bold mb-1" style={{ color: "#fbbf24" }}>
                Group Dynamics
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">{plan.group_dynamics}</p>
            </div>

            {/* Agenda */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
                Agenda
              </p>
              <div className="space-y-2">
                {plan.agenda.map((a, i) => (
                  <div key={i} className="flex gap-3 text-xs">
                    <span className="flex items-center gap-1 text-slate-600 flex-shrink-0 w-20">
                      <Clock size={10} />
                      {a.time}
                    </span>
                    <div>
                      <span className="font-semibold text-slate-300">{a.block}</span>
                      <span className="text-slate-500 ml-2">{a.notes}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <PlanBlock label="How to Open" value={plan.opening} />
            <PlanBlock label="Check-In Activity" value={plan.check_in_activity} highlight />

            {plan.framework_or_topic_approach && (
              <PlanBlock
                label="Framework / Topic Approach for This Group"
                value={plan.framework_or_topic_approach}
              />
            )}

            <PlanBlock label="Group Exercise" value={plan.group_exercise} />

            {/* Type callouts */}
            {plan.type_callouts?.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
                  Type-Specific Watch Points
                </p>
                <div className="space-y-2">
                  {plan.type_callouts.map((tc, i) => (
                    <div
                      key={i}
                      className="rounded-lg p-3 border border-white/5"
                      style={{ background: "#131E2B" }}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold text-white">
                          {tc.members?.join(", ") || tc.types?.join(", ")}
                        </span>
                        {tc.types?.map((t) => (
                          <span
                            key={t}
                            className="text-xs px-1.5 py-0.5 rounded font-bold"
                            style={{ background: "rgba(0,217,192,0.1)", color: BRAND.teal }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-slate-400 mb-1">
                        <span className="text-slate-500 font-medium">Watch for:</span>{" "}
                        {tc.watch_for}
                      </p>
                      <p className="text-xs text-slate-400">
                        <span className="text-slate-500 font-medium">Engage:</span>{" "}
                        {tc.how_to_engage}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Friction */}
            <div
              className="rounded-lg p-4 border"
              style={{
                background: "rgba(255,107,107,0.04)",
                borderColor: "rgba(255,107,107,0.15)",
              }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <Zap size={12} style={{ color: BRAND.coral }} />
                <p className="text-xs font-bold" style={{ color: BRAND.coral }}>
                  Friction Points
                </p>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-2">
                {plan.group_friction_points}
              </p>
              <p className="text-xs text-slate-400 italic">"{plan.how_to_handle_friction}"</p>
            </div>

            <PlanBlock label="How to Close" value={plan.session_close} />

            <div
              className="rounded-lg p-4 border"
              style={{
                background: "rgba(0,217,192,0.04)",
                borderColor: "rgba(0,217,192,0.15)",
              }}
            >
              <p
                className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: BRAND.teal }}
              >
                Homework
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">{plan.homework}</p>
            </div>

            <div
              className="rounded-lg p-3 border border-white/5"
              style={{ background: "#131E2B" }}
            >
              <p className="text-xs font-bold text-slate-400 mb-1.5">Plant This for Next Session</p>
              <p className="text-xs text-slate-300">{plan.next_session_seed}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setPlan(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-white/10 text-slate-400 hover:text-white transition-colors"
              >
                ← Rebuild
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-90"
                style={{ background: BRAND.teal, color: "#080F18" }}
              >
                Save Session Plan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PlanBlock({
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
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">{label}</p>
      <p
        className={`text-xs leading-relaxed ${
          highlight ? "text-white font-medium" : "text-slate-300"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function SavedSessionCard({
  session,
  expanded,
  onToggle,
}: {
  session: SavedGroupSession;
  expanded: boolean;
  onToggle: () => void;
}) {
  const p = session.plan;

  return (
    <div
      className="rounded-xl border border-white/5 overflow-hidden"
      style={{ background: "#131E2B" }}
    >
      <div
        className="flex items-start justify-between px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={onToggle}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Users size={13} style={{ color: BRAND.purple }} />
            <span className="text-sm font-bold text-white">{session.title}</span>
            {session.framework && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: "rgba(167,139,250,0.1)", color: BRAND.purple }}
              >
                {session.framework}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>{session.client_names?.join(", ")}</span>
            {session.date && (
              <span>
                {new Date(session.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
            <span>
              {new Date(session.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
        <button className="text-slate-600 hover:text-slate-300 transition-colors ml-3 flex-shrink-0">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {expanded && p && (
        <div className="border-t border-white/5 px-5 py-5 space-y-4">
          <div
            className="rounded-lg p-3 border"
            style={{
              background: "rgba(251,191,36,0.04)",
              borderColor: "rgba(251,191,36,0.15)",
            }}
          >
            <p className="text-xs font-bold mb-1" style={{ color: "#fbbf24" }}>
              Group Dynamics
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">{p.group_dynamics}</p>
          </div>

          <PlanBlock label="Opening" value={p.opening} />
          <PlanBlock label="Check-In Activity" value={p.check_in_activity} highlight />
          <PlanBlock label="Group Exercise" value={p.group_exercise} />

          <div
            className="rounded-lg p-3 border"
            style={{
              background: "rgba(0,217,192,0.04)",
              borderColor: "rgba(0,217,192,0.15)",
            }}
          >
            <p
              className="text-xs font-bold uppercase tracking-widest mb-1.5"
              style={{ color: BRAND.teal }}
            >
              Homework
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">{p.homework}</p>
          </div>
        </div>
      )}
    </div>
  );
}
