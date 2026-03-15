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
  Trash2,
  ClipboardList,
  CalendarPlus,
  X,
  Clock,
} from "lucide-react";

const FRAMEWORKS = [
  "SPARK",
  "3-Second Social Scan",
  "Fearless Approach System",
  "TALK Check",
  "BRAVE",
  "SHIELD",
  "Stop Replaying",
] as const;

type SessionPlan = {
  session_title: string;
  opening: string;
  check_in: string;
  todays_focus: string;
  agenda: { time: string; block: string; notes: string }[];
  framework_or_topic_approach: string;
  session_questions: string[];
  exercise: string;
  what_to_watch: string[];
  if_they_resist: string;
  session_close: string;
  homework: string;
  next_session_seed: string;
};

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
  coaching_playbook?: {
    how_to_open_sessions: string;
    unlock_questions: string[];
    session_actions?: { session: string; goal: string; do_this: string; avoid: string }[];
    when_stuck: string;
    when_spiraling: string;
    feedback_delivery: string;
    homework_style: string;
    red_flags: string[];
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

type ClientEntry = {
  id: string;
  clientId?: string; // actual client UUID for session history lookup
  name: string;
  email: string;
  jungian_type: string;
  behavioral_profile: BehavioralProfile | null;
  source: "assessment" | "client";
  scores?: Record<string, number>;
};

export default function BehavioralIntelPage() {
  const [entries, setEntries] = useState<ClientEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [backfilling, setBackfilling] = useState(false);
  const [backfillResult, setBackfillResult] = useState<string | null>(null);
  const [sessionBuilderEntry, setSessionBuilderEntry] = useState<ClientEntry | null>(null);
  const [generatingPlaybook, setGeneratingPlaybook] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const [assessRes, clientRes] = await Promise.all([
      fetch("/api/assessments"),
      fetch("/api/clients"),
    ]);
    const assessments: Assessment[] = await assessRes.json();
    const clients = await clientRes.json();

    // Build unified list — assessments first, then clients not in assessments
    const assessmentEmails = new Set(
      (Array.isArray(assessments) ? assessments : []).map((a) => a.email?.toLowerCase())
    );
    const clientsByEmail = new Map(
      (Array.isArray(clients) ? clients : []).map((c: { id: string; email?: string }) => [
        c.email?.toLowerCase() ?? "",
        c.id,
      ])
    );
    const assessmentEntries: ClientEntry[] = (Array.isArray(assessments) ? assessments : []).map((a) => ({
      id: a.id,
      clientId: clientsByEmail.get(a.email?.toLowerCase() ?? ""),
      name: a.name,
      email: a.email,
      jungian_type: a.jungian_type,
      behavioral_profile: a.behavioral_profile,
      scores: a.scores,
      source: "assessment",
    }));
    const clientOnlyEntries: ClientEntry[] = (Array.isArray(clients) ? clients : [])
      .filter((c: { email?: string }) => !assessmentEmails.has(c.email?.toLowerCase() ?? ""))
      .map((c: { id: string; name: string; email: string; jungian_type: string; behavioral_profile: BehavioralProfile | null }) => ({
        id: c.id,
        clientId: c.id,
        name: c.name,
        email: c.email,
        jungian_type: c.jungian_type,
        behavioral_profile: c.behavioral_profile,
        source: "client" as const,
      }));

    setEntries([...assessmentEntries, ...clientOnlyEntries]);
    setLoading(false);
  }

  async function generateProfile(entry: ClientEntry) {
    setGenerating(entry.id);
    try {
      // Step 1: core profile
      const coreEndpoint = entry.source === "assessment" ? "/api/generate-profile" : "/api/generate-client-profile";
      const coreBody = entry.source === "assessment" ? { assessment_id: entry.id } : { client_id: entry.id };
      const r1 = await fetch(coreEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(coreBody),
      });
      if (!r1.ok) {
        const d = await r1.json().catch(() => ({}));
        throw new Error(d.error ?? "Core profile generation failed");
      }

      // Step 2: playbook — auto-chains right after, no extra button needed
      const playbookBody = entry.source === "assessment" ? { assessment_id: entry.id } : { client_id: entry.id };
      const r2 = await fetch("/api/generate-coaching-playbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(playbookBody),
      });
      if (!r2.ok) {
        const d = await r2.json().catch(() => ({}));
        throw new Error(d.error ?? "Playbook generation failed");
      }

      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Generation failed — try again");
    } finally {
      setGenerating(null);
    }
  }

  async function generatePlaybook(entry: ClientEntry) {
    setGeneratingPlaybook(entry.id);
    try {
      const body = entry.source === "assessment" ? { assessment_id: entry.id } : { client_id: entry.id };
      const res = await fetch("/api/generate-coaching-playbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Playbook generation failed");
      }
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Playbook generation failed — try again");
    } finally {
      setGeneratingPlaybook(null);
    }
  }

  async function runBackfill() {
    setBackfilling(true);
    setBackfillResult(null);
    const missing = entries.filter((e) => !e.behavioral_profile);
    if (!missing.length) {
      setBackfillResult("All profiles already generated.");
      setBackfilling(false);
      return;
    }
    let success = 0;
    for (const entry of missing) {
      try {
        const endpoint = entry.source === "assessment" ? "/api/generate-profile" : "/api/generate-client-profile";
        const body = entry.source === "assessment" ? { assessment_id: entry.id } : { client_id: entry.id };
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) success++;
      } catch { /* continue */ }
      setBackfillResult(`Generating... ${success}/${missing.length}`);
    }
    setBackfillResult(`Done — ${success}/${missing.length} profiles generated.`);
    await load();
    setBackfilling(false);
  }

  async function removeEntry(entry: ClientEntry) {
    setRemoving(entry.id);
    try {
      if (entry.source === "assessment") {
        await fetch(`/api/assessments/${entry.id}`, { method: "DELETE" });
      } else {
        await fetch(`/api/clients/${entry.id}`, { method: "DELETE" });
      }
      setEntries((prev) => prev.filter((e) => e.id !== entry.id));
      if (expanded === entry.id) setExpanded(null);
    } finally {
      setRemoving(null);
      setConfirmRemove(null);
    }
  }

  const withProfile = entries.filter((e) => e.behavioral_profile);
  const withoutProfile = entries.filter((e) => !e.behavioral_profile);

  return (
    <div className="p-4 md:p-6 max-w-5xl">
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
        <StatCard label="Total Clients" value={entries.length} />
        <StatCard label="Profiles Generated" value={withProfile.length} color={BRAND.teal} />
        <StatCard label="Awaiting Profile" value={withoutProfile.length} color={withoutProfile.length > 0 ? BRAND.coral : undefined} />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Loader2 size={14} className="animate-spin" />Loading profiles...
        </div>
      ) : entries.length === 0 ? (
        <div className="text-sm text-slate-500">No clients yet.</div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <AssessmentRow
              key={entry.id}
              entry={entry}
              expanded={expanded === entry.id}
              onToggle={() => setExpanded(expanded === entry.id ? null : entry.id)}
              onGenerate={() => generateProfile(entry)}
              generating={generating === entry.id}
              onGeneratePlaybook={() => generatePlaybook(entry)}
              generatingPlaybook={generatingPlaybook === entry.id}
              onRemove={() => removeEntry(entry)}
              removing={removing === entry.id}
              confirmingRemove={confirmRemove === entry.id}
              onConfirmRemove={() => setConfirmRemove(entry.id)}
              onCancelRemove={() => setConfirmRemove(null)}
              onBuildSession={() => setSessionBuilderEntry(entry)}
            />
          ))}
        </div>
      )}

      {/* Session Builder Modal */}
      {sessionBuilderEntry && (
        <SessionBuilderModal
          entry={sessionBuilderEntry}
          onClose={() => setSessionBuilderEntry(null)}
        />
      )}
    </div>
  );
}

function SessionBuilderModal({ entry, onClose }: { entry: ClientEntry; onClose: () => void }) {
  const [sessionNumber, setSessionNumber] = useState(1);
  const [coachNote, setCoachNote] = useState("");
  const [mode, setMode] = useState<"framework" | "custom" | "none">("none");
  const [framework, setFramework] = useState(FRAMEWORKS[0]);
  const [customTopic, setCustomTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [plan, setPlan] = useState<SessionPlan | null>(null);
  const [isIntake, setIsIntake] = useState(false);
  const [lastSessionBrief, setLastSessionBrief] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clientId = entry.clientId ?? (entry.source === "client" ? entry.id : null);

  async function savePlan() {
    if (!plan) return;
    setSaving(true);
    try {
      await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          clientName: entry.name,
          date: new Date().toISOString().split("T")[0],
          duration: "60",
          sessionNumber,
          sessionType: isIntake ? "intake" : "planned",
          notes: "",
          actionItems: "",
          rating: 5,
          clientEngagement: "open",
          homeworkCompletion: "none",
          homeworkAssigned: plan.homework ?? "",
          breakthroughMoment: "",
          coachObservations: "",
          frameworksUsed: [],
          plan,
        }),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  async function generate() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-session-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: entry.behavioral_profile,
          name: entry.name,
          jungian_type: entry.jungian_type,
          client_id: clientId,
          session_number: sessionNumber,
          coach_note: coachNote,
          mode,
          framework: mode === "framework" ? framework : null,
          custom_topic: mode === "custom" ? customTopic : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setPlan(data.plan);
      setIsIntake(data.isIntake ?? false);
      setLastSessionBrief(data.lastSessionBrief ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-8 px-4">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 flex flex-col" style={{ background: "#0D1825" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2">
              <CalendarPlus size={15} style={{ color: "#a78bfa" }} />
              <span className="text-sm font-bold text-white">Session Builder</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{entry.name} · {entry.jungian_type}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        {!plan ? (
          <div className="px-6 py-5 space-y-5">
            {/* Session number */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Session Number</label>
              <input
                type="number"
                min={1}
                value={sessionNumber}
                onChange={(e) => setSessionNumber(Number(e.target.value))}
                className="w-24 px-3 py-2 rounded-lg text-sm text-white border border-white/10 outline-none focus:border-purple-500/50"
                style={{ background: "#131E2B" }}
              />
            </div>

            {/* Coach note */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Where Are They Right Now?</label>
              <textarea
                value={coachNote}
                onChange={(e) => setCoachNote(e.target.value)}
                placeholder="e.g. skipped homework last week, opened up about a specific situation, seems stuck on approach anxiety..."
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 border border-white/10 outline-none focus:border-purple-500/50 resize-none"
                style={{ background: "#131E2B" }}
              />
            </div>

            {/* Mode */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Session Focus</label>
              <div className="flex flex-wrap gap-2">
                {(["none", "framework", "custom"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                    style={{
                      background: mode === m ? "rgba(167,139,250,0.15)" : "transparent",
                      borderColor: mode === m ? "rgba(167,139,250,0.4)" : "rgba(255,255,255,0.08)",
                      color: mode === m ? "#a78bfa" : "#64748b",
                    }}
                  >
                    {m === "none" ? "Let AI decide" : m === "framework" ? "Use a framework" : "Custom topic"}
                  </button>
                ))}
              </div>
            </div>

            {/* Framework picker */}
            {mode === "framework" && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Framework</label>
                <select
                  value={framework}
                  onChange={(e) => setFramework(e.target.value as typeof framework)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-white border border-white/10 outline-none focus:border-purple-500/50"
                  style={{ background: "#131E2B" }}
                >
                  {FRAMEWORKS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Custom topic */}
            {mode === "custom" && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">What Do They Need to Work On?</label>
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="e.g. holding eye contact, handling rejection, reconnecting with old friends..."
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 border border-white/10 outline-none focus:border-purple-500/50"
                  style={{ background: "#131E2B" }}
                />
              </div>
            )}

            {error && <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}

            <button
              onClick={generate}
              disabled={generating || (mode === "custom" && !customTopic.trim())}
              className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: "#a78bfa", color: "#fff" }}
            >
              {generating ? <><Loader2 size={14} className="animate-spin" />Building session plan...</> : <><CalendarPlus size={14} />Generate Session Plan</>}
            </button>
          </div>
        ) : (
          <div className="px-6 py-5 space-y-5 overflow-y-auto">
            {/* Plan header */}
            <div className="rounded-xl p-4 border" style={{ background: "rgba(167,139,250,0.06)", borderColor: "rgba(167,139,250,0.2)" }}>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#a78bfa" }}>Session {sessionNumber}</p>
                {isIntake && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(0,217,192,0.1)", color: "#00D9C0" }}>
                    Intake
                  </span>
                )}
              </div>
              <p className="text-lg font-black text-white">{plan.session_title}</p>
              <p className="text-xs text-slate-400 mt-1">{plan.todays_focus}</p>
            </div>

            {/* Since last session brief */}
            {lastSessionBrief && (
              <div className="rounded-lg p-3 border border-white/5" style={{ background: "#131E2B" }}>
                <p className="text-xs font-bold text-slate-400 mb-1.5">Context: Since Last Session</p>
                <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">{lastSessionBrief}</p>
              </div>
            )}

            {/* Agenda */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Agenda</p>
              <div className="space-y-2">
                {plan.agenda.map((a, i) => (
                  <div key={i} className="flex gap-3 text-xs">
                    <span className="flex items-center gap-1 text-slate-600 flex-shrink-0 w-20">
                      <Clock size={10} />{a.time}
                    </span>
                    <div>
                      <span className="font-semibold text-slate-300">{a.block}</span>
                      <span className="text-slate-500 ml-2">{a.notes}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <PlanField label="How to Open" value={plan.opening} />
            <PlanField label="Check-In Question" value={plan.check_in} highlight />
            {plan.framework_or_topic_approach && (
              <PlanField label="Framework / Topic Approach" value={plan.framework_or_topic_approach} />
            )}

            {/* Session questions */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Questions — In This Order</p>
              <ol className="space-y-2">
                {plan.session_questions.map((q, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="font-bold flex-shrink-0" style={{ color: "#a78bfa" }}>{i + 1}.</span>{q}
                  </li>
                ))}
              </ol>
            </div>

            <PlanField label="Exercise / Drill" value={plan.exercise} />

            {/* Watch for */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">What to Watch For Live</p>
              <ul className="space-y-1.5">
                {plan.what_to_watch.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="flex-shrink-0" style={{ color: BRAND.teal }}>→</span>{w}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg p-4 border border-white/5" style={{ background: "#131E2B" }}>
              <p className="text-xs font-bold text-slate-400 mb-1.5">If They Resist</p>
              <p className="text-xs text-slate-300 italic">"{plan.if_they_resist}"</p>
            </div>

            <PlanField label="How to Close the Session" value={plan.session_close} />

            <div className="rounded-lg p-4 border" style={{ background: "rgba(0,217,192,0.04)", borderColor: "rgba(0,217,192,0.15)" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: BRAND.teal }}>Homework</p>
              <p className="text-xs text-slate-300 leading-relaxed">{plan.homework}</p>
            </div>

            <div className="rounded-lg p-4 border border-white/5" style={{ background: "#131E2B" }}>
              <p className="text-xs font-bold text-slate-400 mb-1.5">Plant This for Next Session</p>
              <p className="text-xs text-slate-300">{plan.next_session_seed}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setPlan(null); setSaved(false); }}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-white/10 text-slate-400 hover:text-white transition-colors"
              >
                ← Build Another
              </button>
              <button
                onClick={savePlan}
                disabled={saving || saved}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: saved ? "rgba(0,217,192,0.15)" : "#a78bfa", color: saved ? "#00D9C0" : "#fff" }}
              >
                {saving ? (
                  <><Loader2 size={13} className="animate-spin" />Saving...</>
                ) : saved ? (
                  "✓ Plan Saved"
                ) : (
                  "Save Plan to Sessions"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PlanField({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">{label}</p>
      <p className={`text-xs leading-relaxed ${highlight ? "text-white font-medium" : "text-slate-300"}`}>{value}</p>
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
  entry,
  expanded,
  onToggle,
  onGenerate,
  generating,
  onGeneratePlaybook,
  generatingPlaybook,
  onRemove,
  removing,
  confirmingRemove,
  onConfirmRemove,
  onCancelRemove,
  onBuildSession,
}: {
  entry: ClientEntry;
  expanded: boolean;
  onToggle: () => void;
  onGenerate: () => void;
  generating: boolean;
  onGeneratePlaybook: () => void;
  generatingPlaybook: boolean;
  onRemove: () => void;
  removing: boolean;
  confirmingRemove: boolean;
  onConfirmRemove: () => void;
  onCancelRemove: () => void;
  onBuildSession: () => void;
}) {
  const p = entry.behavioral_profile;
  const scores = entry.scores ?? {};
  const pct = (a: number, b: number) => (a + b > 0 ? Math.round((a / (a + b)) * 100) : 50);
  const hasScores = entry.source === "assessment" && Object.keys(scores).length > 0;

  return (
    <div className="rounded-xl border border-white/5 overflow-hidden" style={{ background: "#131E2B" }}>
      {/* Row header */}
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-bold text-white">{entry.name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(0,217,192,0.1)", color: BRAND.teal }}>
              {entry.jungian_type ?? "—"}
            </span>
            {entry.source === "client" && (
              <span className="text-xs px-1.5 py-0.5 rounded font-medium text-slate-500 border border-white/5">manual</span>
            )}
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
          <div className="text-xs text-slate-500">{entry.email}</div>
        </div>

        {/* Score bars (compact) — only for assessment entries */}
        {hasScores && (
        <div className="hidden md:flex gap-3 text-xs text-slate-600">
          <ScorePill a="E" b="I" pctA={pct(scores.E, scores.I)} dominant={scores.E >= scores.I ? "E" : "I"} />
          <ScorePill a="S" b="N" pctA={pct(scores.S, scores.N)} dominant={scores.S >= scores.N ? "S" : "N"} />
          <ScorePill a="T" b="F" pctA={pct(scores.T, scores.F)} dominant={scores.T >= scores.F ? "T" : "F"} />
          <ScorePill a="J" b="P" pctA={pct(scores.J, scores.P)} dominant={scores.J >= scores.P ? "J" : "P"} />
        </div>
        )}

        <div className="flex items-center gap-2">
          {!p && (
            <button
              onClick={(e) => { e.stopPropagation(); onGenerate(); }}
              disabled={generating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "rgba(0,217,192,0.12)", color: BRAND.teal }}
            >
              {generating ? <Loader2 size={11} className="animate-spin" /> : <Brain size={11} />}
              {generating ? "Generating full profile..." : "Generate Profile"}
            </button>
          )}
          {p && (
            <>
              <button
                onClick={onToggle}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors border border-white/5"
              >
                {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                {expanded ? "Collapse" : "View Intel"}
              </button>
              {!p.coaching_playbook && (
                <button
                  onClick={(e) => { e.stopPropagation(); onGeneratePlaybook(); }}
                  disabled={generatingPlaybook}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: "rgba(0,217,192,0.12)", color: BRAND.teal }}
                >
                  {generatingPlaybook ? <Loader2 size={11} className="animate-spin" /> : <ClipboardList size={11} />}
                  {generatingPlaybook ? "Building..." : "Add Playbook"}
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onBuildSession(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
                style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa" }}
              >
                <CalendarPlus size={11} />
                Build Session
              </button>
            </>
          )}
          {confirmingRemove ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                disabled={removing}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
                style={{ background: "rgba(255,107,107,0.15)", color: BRAND.coral }}
              >
                {removing ? <Loader2 size={11} className="animate-spin" /> : null}
                Confirm
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onCancelRemove(); }}
                className="px-2.5 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-300 border border-white/5"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onConfirmRemove(); }}
              disabled={removing}
              className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 transition-colors disabled:opacity-50"
              title="Remove from intel"
            >
              <Trash2 size={13} />
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
          {p.influence_map && (
          <Section icon={<Zap size={14} />} title="Influence & Persuasion Map" color="#fbbf24">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">What Works</p>
                <ul className="space-y-1.5">
                  {(p.influence_map.what_works ?? []).map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <span style={{ color: BRAND.teal }} className="mt-0.5 flex-shrink-0">✓</span>{w}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">What Shuts Them Down</p>
                <ul className="space-y-1.5">
                  {(p.influence_map.what_doesnt_work ?? []).map((w, i) => (
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
          )}

          {/* Section 4: Coaching Playbook */}
          {p.coaching_playbook && (
            <Section icon={<ClipboardList size={14} />} title="Coaching Playbook — What to Do" color="#a78bfa">
              <div className="space-y-4">
                <Field label="How to Open Every Session" value={p.coaching_playbook.how_to_open_sessions} />

                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Unlock Questions</p>
                  <ul className="space-y-2">
                    {(p.coaching_playbook.unlock_questions ?? []).map((q, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="mt-0.5 flex-shrink-0 font-bold" style={{ color: "#a78bfa" }}>{i + 1}.</span>{q}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Session-by-session actions */}
                {(p.coaching_playbook.session_actions ?? []).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Per-Session Action Plan</p>
                    <div className="space-y-3">
                      {(p.coaching_playbook.session_actions ?? []).map((sa, i) => (
                        <div key={i} className="rounded-lg p-4 border border-white/5" style={{ background: "#0D1825" }}>
                          <p className="text-xs font-bold mb-2" style={{ color: "#a78bfa" }}>{sa.session}</p>
                          <p className="text-xs text-slate-400 mb-1"><span className="font-semibold text-slate-300">Goal:</span> {sa.goal}</p>
                          <p className="text-xs text-slate-400 mb-1"><span className="font-semibold" style={{ color: BRAND.teal }}>Do this:</span> {sa.do_this}</p>
                          <p className="text-xs text-slate-400"><span className="font-semibold" style={{ color: BRAND.coral }}>Avoid:</span> {sa.avoid}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-lg p-3 border border-white/5" style={{ background: "#0D1825" }}>
                    <p className="text-xs font-bold text-slate-400 mb-1.5">When They Go Quiet / Resist</p>
                    <p className="text-xs text-slate-300 leading-relaxed italic">"{p.coaching_playbook.when_stuck}"</p>
                  </div>
                  <div className="rounded-lg p-3 border border-white/5" style={{ background: "#0D1825" }}>
                    <p className="text-xs font-bold text-slate-400 mb-1.5">When They're Spiraling</p>
                    <p className="text-xs text-slate-300 leading-relaxed italic">"{p.coaching_playbook.when_spiraling}"</p>
                  </div>
                </div>

                <Field label="How to Deliver Feedback" value={p.coaching_playbook.feedback_delivery} />
                <Field label="Homework Style" value={p.coaching_playbook.homework_style} />

                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Red Flags — About to Disengage</p>
                  <ul className="space-y-1.5">
                    {(p.coaching_playbook.red_flags ?? []).map((flag, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <span style={{ color: BRAND.coral }} className="mt-0.5 flex-shrink-0">⚠</span>{flag}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Section>
          )}

          {/* Section 5: Sales Closing Handbook */}
          {p.sales_handbook && (
          <Section icon={<BookOpen size={14} />} title="Sales Closing Handbook" color={BRAND.coral}>
            <div className="space-y-4">
              <Field label="Buyer Profile" value={p.sales_handbook.buyer_profile} />

              {/* Objections */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Likely Objections + How to Handle</p>
                <div className="space-y-3">
                  {(p.sales_handbook.likely_objections ?? []).map((obj, i) => (
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
          )}
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
