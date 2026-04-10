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
  Smartphone,
} from "lucide-react";

const FRAMEWORKS = [
  "SPARK",
  "3-Second Social Scan",
  "Fearless Approach System",
  "3-2-1 Send It",
  "Barista Method",
  "TALK Check",
  "DEPTH",
  "GROUND",
  "Pre-Game System",
  "Energy Check",
  "VOICE",
  "BRAVE",
  "SHIELD",
  "Stop Replaying",
] as const;

type SessionPlan = {
  session_title: string;
  framework_selected?: string;
  framework_why?: string;
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
  sessions_roadmap?: {
    recommended_total: string;
    rationale: string;
    phase_1: string;
    phase_2: string;
    phase_3: string;
  };
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
  social_style?: string;
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
    session_arc?: string;
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
  observations?: string;
  focus_areas?: string;
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
  const [sessionBriefEntry, setSessionBriefEntry] = useState<ClientEntry | null>(null);

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
      (Array.isArray(clients) ? clients : []).map((c: { id: string; email?: string; observations?: string; focus_areas?: string }) => [
        c.email?.trim().toLowerCase() ?? "",
        { id: c.id, observations: c.observations ?? "", focus_areas: c.focus_areas ?? "" },
      ])
    );
    const assessmentEntries: ClientEntry[] = (Array.isArray(assessments) ? assessments : []).map((a) => {
      const clientMatch = clientsByEmail.get(a.email?.trim().toLowerCase() ?? "");
      return {
        id: a.id,
        clientId: clientMatch?.id,
        name: a.name,
        email: a.email,
        jungian_type: a.jungian_type,
        behavioral_profile: a.behavioral_profile,
        scores: a.scores,
        source: "assessment",
        observations: clientMatch?.observations ?? "",
        focus_areas: clientMatch?.focus_areas ?? "",
      };
    });
    const clientOnlyEntries: ClientEntry[] = (Array.isArray(clients) ? clients : [])
      .filter((c: { email?: string }) => !assessmentEmails.has(c.email?.toLowerCase() ?? ""))
      .map((c: { id: string; name: string; email: string; jungian_type: string; behavioral_profile: BehavioralProfile | null; observations?: string; focus_areas?: string }) => ({
        id: c.id,
        clientId: c.id,
        name: c.name,
        email: c.email,
        jungian_type: c.jungian_type,
        behavioral_profile: c.behavioral_profile,
        source: "client" as const,
        observations: c.observations ?? "",
        focus_areas: c.focus_areas ?? "",
      }));

    setEntries([...assessmentEntries, ...clientOnlyEntries]);
    setLoading(false);
  }

  async function generateProfile(entry: ClientEntry) {
    setGenerating(entry.id);
    try {
      const endpoint = entry.source === "assessment" ? "/api/generate-profile" : "/api/generate-client-profile";
      const body = entry.source === "assessment" ? { assessment_id: entry.id } : { client_id: entry.id };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Profile generation failed");
      }
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Generation failed — try again");
    } finally {
      setGenerating(null);
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
              onGeneratePlaybook={() => generateProfile(entry)}
              generatingPlaybook={generating === entry.id}
              onRemove={() => removeEntry(entry)}
              removing={removing === entry.id}
              confirmingRemove={confirmRemove === entry.id}
              onConfirmRemove={() => setConfirmRemove(entry.id)}
              onCancelRemove={() => setConfirmRemove(null)}
              onBuildSession={() => setSessionBuilderEntry(entry)}
              onSessionBrief={() => setSessionBriefEntry(entry)}
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

      {/* Session Brief Modal */}
      {sessionBriefEntry && (
        <SessionBriefModal
          entry={sessionBriefEntry}
          onClose={() => setSessionBriefEntry(null)}
        />
      )}
    </div>
  );
}

function CoachNotes({ clientId, initial }: { clientId: string; initial: string }) {
  const [text, setText] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    if (text === initial && !saved) return;
    setSaving(true);
    await fetch(`/api/clients/${clientId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ observations: text }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Coach Notes</p>
        <p className="text-xs text-slate-600">Fed into AI on next regeneration</p>
      </div>
      <textarea
        value={text}
        onChange={(e) => { setText(e.target.value); setSaved(false); }}
        onBlur={save}
        rows={3}
        placeholder="What have you noticed? Breakthroughs, resistance patterns, what's working..."
        className="w-full px-3 py-2.5 rounded-lg text-xs text-white placeholder-slate-600 border border-white/5 outline-none focus:border-teal-500/40 resize-none transition-colors"
        style={{ background: "#0D1825" }}
      />
      <div className="flex justify-end mt-1.5">
        <button
          onClick={save}
          disabled={saving}
          className="text-xs px-3 py-1 rounded-lg font-semibold transition-all disabled:opacity-50"
          style={{ background: saved ? "rgba(0,217,192,0.1)" : "rgba(255,255,255,0.05)", color: saved ? "#00D9C0" : "#64748b" }}
        >
          {saving ? "Saving..." : saved ? "✓ Saved" : "Save Notes"}
        </button>
      </div>
    </div>
  );
}

function FocusAreas({ clientId, initial }: { clientId: string; initial: string }) {
  const [text, setText] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    if (text === initial && !saved) return;
    setSaving(true);
    await fetch(`/api/clients/${clientId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ focus_areas: text }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Things to Work On</p>
        <p className="text-xs text-slate-600">Coach-only · not shown to client</p>
      </div>
      <textarea
        value={text}
        onChange={(e) => { setText(e.target.value); setSaved(false); }}
        onBlur={save}
        rows={3}
        placeholder="Areas to focus on, skills to develop, patterns to address..."
        className="w-full px-3 py-2.5 rounded-lg text-xs text-white placeholder-slate-600 border border-white/5 outline-none focus:border-teal-500/40 resize-none transition-colors"
        style={{ background: "#0D1825" }}
      />
      <div className="flex justify-end mt-1.5">
        <button
          onClick={save}
          disabled={saving}
          className="text-xs px-3 py-1 rounded-lg font-semibold transition-all disabled:opacity-50"
          style={{ background: saved ? "rgba(0,217,192,0.1)" : "rgba(255,255,255,0.05)", color: saved ? "#00D9C0" : "#64748b" }}
        >
          {saving ? "Saving..." : saved ? "✓ Saved" : "Save"}
        </button>
      </div>
    </div>
  );
}

type SessionBrief = {
  focus: string;
  framework: string;
  framework_why: string;
  q1: string;
  q2: string;
  q3: string;
  watch_for: string;
  resist_script: string;
};

function SessionBriefModal({ entry, onClose }: { entry: ClientEntry; onClose: () => void }) {
  const [sessionNumber, setSessionNumber] = useState(1);
  const [coachNote, setCoachNote] = useState("");
  const [generating, setGenerating] = useState(false);
  const [brief, setBrief] = useState<SessionBrief | null>(null);
  const [lastSessionContext, setLastSessionContext] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clientId = entry.clientId ?? (entry.source === "client" ? entry.id : null);

  async function generate() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-session-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: entry.behavioral_profile,
          name: entry.name,
          jungian_type: entry.jungian_type,
          client_id: clientId,
          session_number: sessionNumber,
          coach_note: coachNote,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setBrief(data.brief);
      setLastSessionContext(data.lastSessionContext ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-8 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 flex flex-col" style={{ background: "#0D1825" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2">
              <Smartphone size={14} style={{ color: "#fbbf24" }} />
              <span className="text-sm font-bold text-white">Session Brief</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{entry.name} · {entry.jungian_type}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        {!brief ? (
          <div className="px-5 py-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Session #</label>
              <input
                type="number"
                min={1}
                value={sessionNumber}
                onChange={(e) => setSessionNumber(Number(e.target.value))}
                className="w-20 px-3 py-2 rounded-lg text-sm text-white border border-white/10 outline-none focus:border-yellow-500/50"
                style={{ background: "#131E2B" }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Quick Note</label>
              <input
                type="text"
                value={coachNote}
                onChange={(e) => setCoachNote(e.target.value)}
                placeholder="e.g. missed homework, opened up last week..."
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 border border-white/10 outline-none focus:border-yellow-500/50"
                style={{ background: "#131E2B" }}
              />
            </div>

            {error && <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}

            <button
              onClick={generate}
              disabled={generating}
              className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: "#fbbf24", color: "#0D1825" }}
            >
              {generating ? <><Loader2 size={14} className="animate-spin" />Generating...</> : <><Smartphone size={14} />Generate Brief</>}
            </button>
          </div>
        ) : (
          <div className="px-5 py-5 space-y-4">
            {/* Header card */}
            <div className="rounded-xl p-4 border" style={{ background: "rgba(251,191,36,0.06)", borderColor: "rgba(251,191,36,0.2)" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#fbbf24" }}>Session {sessionNumber} · {entry.jungian_type}</p>
              <p className="text-sm font-bold text-white leading-snug">{brief.focus}</p>
            </div>

            {/* Last session context */}
            {lastSessionContext && (
              <div className="rounded-lg px-3 py-2.5 border border-white/5" style={{ background: "#131E2B" }}>
                <p className="text-xs text-slate-500 leading-relaxed">{lastSessionContext}</p>
              </div>
            )}

            {/* Framework */}
            {brief.framework !== "None" && (
              <div className="rounded-lg px-3 py-3 border border-white/5" style={{ background: "#131E2B" }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: BRAND.teal }}>Use This Framework</p>
                <p className="text-sm font-bold text-white">{brief.framework}</p>
                <p className="text-xs text-slate-400 mt-0.5">{brief.framework_why}</p>
              </div>
            )}

            {/* Unlock questions */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Ask These</p>
              <div className="space-y-2">
                {[brief.q1, brief.q2, brief.q3].filter(Boolean).map((q, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-300 rounded-lg px-3 py-2.5 border border-white/5" style={{ background: "#131E2B" }}>
                    <span className="font-black flex-shrink-0" style={{ color: "#fbbf24" }}>{i + 1}</span>
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Watch for */}
            <div className="rounded-lg px-3 py-3 border border-white/5" style={{ background: "#131E2B" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: BRAND.coral }}>Watch For</p>
              <p className="text-xs text-slate-300">{brief.watch_for}</p>
            </div>

            {/* If they resist */}
            <div className="rounded-lg px-3 py-3 border border-white/5" style={{ background: "#131E2B" }}>
              <p className="text-xs font-bold text-slate-500 mb-1">If They Go Quiet</p>
              <p className="text-xs text-slate-300 italic">"{brief.resist_script}"</p>
            </div>

            <button
              onClick={() => { setBrief(null); setError(null); }}
              className="w-full py-2.5 rounded-xl text-xs font-semibold border border-white/10 text-slate-400 hover:text-white transition-colors"
            >
              ← Regenerate
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SessionBuilderModal({ entry, onClose }: { entry: ClientEntry; onClose: () => void }) {
  const [sessionNumber, setSessionNumber] = useState(1);
  const [loadingSessionCount, setLoadingSessionCount] = useState(true);
  const [coachNote, setCoachNote] = useState("");
  const [showOverride, setShowOverride] = useState(false);
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

  // Auto-detect session number from history on mount
  useEffect(() => {
    if (!clientId) { setLoadingSessionCount(false); return; }
    fetch(`/api/sessions?clientId=${clientId}`)
      .then((r) => r.json())
      .then((data: unknown[]) => {
        const count = Array.isArray(data) ? data.length : 0;
        setSessionNumber(count + 1);
      })
      .catch(() => {})
      .finally(() => setLoadingSessionCount(false));
  }, [clientId]);

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
      const raw = await res.text();
      let data: Record<string, unknown>;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(`Server error: ${raw.slice(0, 200)}`);
      }
      if (!res.ok) throw new Error((data.error as string) ?? "Failed");
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
            {loadingSessionCount ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={18} className="animate-spin text-slate-500" />
              </div>
            ) : (
              <>
                {/* Session number — read-only display, editable if needed */}
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Session</label>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-white">#{sessionNumber}</span>
                      {sessionNumber === 1 && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(0,217,192,0.1)", color: "#00D9C0" }}>
                          Intake
                        </span>
                      )}
                      <button
                        onClick={() => setSessionNumber((n) => Math.max(1, n - 1))}
                        className="text-xs px-2 py-1 rounded text-slate-500 hover:text-white border border-white/10 transition-colors"
                      >
                        -
                      </button>
                      <button
                        onClick={() => setSessionNumber((n) => n + 1)}
                        className="text-xs px-2 py-1 rounded text-slate-500 hover:text-white border border-white/10 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Intake: short context note */}
                {sessionNumber === 1 ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                      Any notes before the intake? <span className="text-slate-600 normal-case font-normal">(optional)</span>
                    </label>
                    <textarea
                      value={coachNote}
                      onChange={(e) => setCoachNote(e.target.value)}
                      placeholder="e.g. referred by a friend, said they struggle with networking, seems anxious based on emails..."
                      rows={3}
                      className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 border border-white/10 outline-none focus:border-purple-500/50 resize-none"
                      style={{ background: "#131E2B" }}
                    />
                  </div>
                ) : (
                  /* Ongoing: continuation note + optional override */
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                        Anything new since last session? <span className="text-slate-600 normal-case font-normal">(optional)</span>
                      </label>
                      <textarea
                        value={coachNote}
                        onChange={(e) => setCoachNote(e.target.value)}
                        placeholder="e.g. they texted about skipping homework, had a big moment at work, seem stuck on the same block..."
                        rows={3}
                        className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 border border-white/10 outline-none focus:border-purple-500/50 resize-none"
                        style={{ background: "#131E2B" }}
                      />
                    </div>

                    {/* Override toggle */}
                    <div>
                      <button
                        onClick={() => {
                          setShowOverride((v) => !v);
                          if (showOverride) setMode("none");
                        }}
                        className="flex items-center gap-2 text-xs font-semibold transition-colors"
                        style={{ color: showOverride ? "#a78bfa" : "#475569" }}
                      >
                        <span style={{ fontSize: 10 }}>{showOverride ? "▼" : "▶"}</span>
                        Override — force a specific framework or topic
                      </button>

                      {showOverride && (
                        <div className="mt-3 space-y-3 pl-3 border-l-2 border-purple-500/20">
                          <div className="flex flex-wrap gap-2">
                            {(["framework", "custom"] as const).map((m) => (
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
                                {m === "framework" ? "Specific framework" : "Custom topic"}
                              </button>
                            ))}
                          </div>

                          {mode === "framework" && (
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
                          )}

                          {mode === "custom" && (
                            <input
                              type="text"
                              value={customTopic}
                              onChange={(e) => setCustomTopic(e.target.value)}
                              placeholder="e.g. holding eye contact, handling rejection, reconnecting with old friends..."
                              className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 border border-white/10 outline-none focus:border-purple-500/50"
                              style={{ background: "#131E2B" }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {error && <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}

                <button
                  onClick={generate}
                  disabled={generating || (mode === "custom" && !customTopic.trim())}
                  className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: "#a78bfa", color: "#fff" }}
                >
                  {generating
                    ? <><Loader2 size={14} className="animate-spin" />Building session plan...</>
                    : <><CalendarPlus size={14} />{sessionNumber === 1 ? "Build Intake Plan" : "Build Session Plan"}</>
                  }
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="px-6 py-5 space-y-5 overflow-y-auto">
            {/* Plan header */}
            <div className="rounded-xl p-4 border" style={{ background: "rgba(167,139,250,0.06)", borderColor: "rgba(167,139,250,0.2)" }}>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#a78bfa" }}>Session {sessionNumber}</p>
                {isIntake && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(0,217,192,0.1)", color: "#00D9C0" }}>
                    Intake
                  </span>
                )}
                {plan.framework_selected && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(167,139,250,0.15)", color: "#a78bfa" }}>
                    {plan.framework_selected}
                  </span>
                )}
              </div>
              {plan.framework_why && (
                <p className="text-xs text-slate-500 mt-1 mb-2 italic">{plan.framework_why}</p>
              )}
              <p className="text-lg font-black text-white">{plan.session_title}</p>
              <p className="text-xs text-slate-400 mt-1">{plan.todays_focus}</p>
            </div>

            {/* Sessions roadmap */}
            {plan.sessions_roadmap && (
              <div className="rounded-xl p-4 border border-white/5" style={{ background: "#131E2B" }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Session Roadmap</p>
                  <span className="text-sm font-black" style={{ color: BRAND.teal }}>{plan.sessions_roadmap.recommended_total} sessions</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">{plan.sessions_roadmap.rationale}</p>
                <div className="space-y-2">
                  {[plan.sessions_roadmap.phase_1, plan.sessions_roadmap.phase_2, plan.sessions_roadmap.phase_3].filter(Boolean).map((phase, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span className="font-bold flex-shrink-0 mt-0.5" style={{ color: BRAND.teal }}>P{i + 1}</span>
                      <span className="text-slate-400">{phase}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
  onSessionBrief,
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
  onSessionBrief: () => void;
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

        <div className="flex items-center gap-1.5">
          {p && (
            <button
              onClick={onToggle}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors border border-white/5"
              title={expanded ? "Collapse" : "View Intel"}
            >
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              <span className="hidden sm:inline">{expanded ? "Collapse" : "View Intel"}</span>
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onGenerate(); }}
            disabled={generating}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: "rgba(0,217,192,0.12)", color: BRAND.teal }}
          >
            {generating ? <Loader2 size={11} className="animate-spin" /> : <Brain size={11} />}
            <span className="hidden xs:inline sm:inline">{generating ? "Generating..." : p ? "Regenerate" : "Generate"}</span>
          </button>
          {p && (
            <button
              onClick={(e) => { e.stopPropagation(); onSessionBrief(); }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
              style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24" }}
              title="Session Brief"
            >
              <Smartphone size={11} />
              <span className="hidden sm:inline">Brief</span>
            </button>
          )}
          {p && (
            <button
              onClick={(e) => { e.stopPropagation(); onBuildSession(); }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
              style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa" }}
              title="Build Session"
            >
              <CalendarPlus size={11} />
              <span className="hidden sm:inline">Plan</span>
            </button>
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
        <div className="border-t border-white/5 px-3 sm:px-5 py-4 sm:py-5 space-y-6">
          {/* Coach Notes */}
          {entry.clientId && (
            <CoachNotes clientId={entry.clientId} initial={entry.observations ?? ""} />
          )}

          {/* Things to Work On */}
          {entry.clientId && (
            <FocusAreas clientId={entry.clientId} initial={entry.focus_areas ?? ""} />
          )}

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
              {p.social_style && <div className="sm:col-span-2"><Field label="Social Style" value={p.social_style} /></div>}
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

                {p.coaching_playbook.session_arc && (
                  <div className="rounded-lg p-4 border border-white/5" style={{ background: "#0D1825" }}>
                    <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#a78bfa" }}>Coaching Arc</p>
                    <p className="text-xs text-slate-300 leading-relaxed">{p.coaching_playbook.session_arc}</p>
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
