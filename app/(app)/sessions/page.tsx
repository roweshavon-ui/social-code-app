"use client";

import { useState } from "react";
import { Plus, CalendarDays, X, ChevronDown, ChevronUp, Pencil, CheckSquare } from "lucide-react";
import { useSessions, type Session } from "../../hooks/useSessions";
import { useClients, type Client } from "../../hooks/useClients";

const SOCIAL_CODE_FRAMEWORKS = [
  "SPARK",
  "3-Second Social Scan",
  "Fearless Approach System",
  "TALK Check",
  "BRAVE",
  "SHIELD",
  "Stop Replaying",
];

type FormState = {
  clientId: string | null;
  clientName: string;
  date: string;
  duration: string;
  sessionNumber: number;
  sessionType: string;
  notes: string;
  actionItems: string;
  rating: number;
  clientEngagement: string;
  homeworkCompletion: string;
  homeworkAssigned: string;
  breakthroughMoment: string;
  coachObservations: string;
  frameworksUsed: string[];
  plan: Record<string, unknown> | null;
};

const DEFAULT_FORM: FormState = {
  clientId: null,
  clientName: "",
  date: "",
  duration: "60",
  sessionNumber: 1,
  sessionType: "ongoing",
  notes: "",
  actionItems: "",
  rating: 5,
  clientEngagement: "open",
  homeworkCompletion: "none",
  homeworkAssigned: "",
  breakthroughMoment: "",
  coachObservations: "",
  frameworksUsed: [],
  plan: null,
};

export default function SessionsPage() {
  const { sessions, loaded, addSession, removeSession, updateSession } = useSessions();
  const { clients } = useClients();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [expanded, setExpanded] = useState<string | null>(null);

  function handleClientSelect(clientId: string) {
    const client = clients.find((c) => c.id === clientId);
    const nextSessionNumber = sessions.filter((s) => s.clientId === clientId).length + 1;
    setForm((f) => ({
      ...f,
      clientId: clientId || null,
      clientName: client?.name ?? "",
      sessionNumber: nextSessionNumber,
    }));
  }

  function toggleFramework(fw: string) {
    setForm((f) => ({
      ...f,
      frameworksUsed: f.frameworksUsed.includes(fw)
        ? f.frameworksUsed.filter((x) => x !== fw)
        : [...f.frameworksUsed, fw],
    }));
  }

  function startEdit(session: Session) {
    setForm({
      clientId: session.clientId,
      clientName: session.clientName,
      date: session.date,
      duration: session.duration,
      sessionNumber: session.sessionNumber,
      sessionType: session.sessionType,
      notes: session.notes,
      actionItems: session.actionItems,
      rating: session.rating,
      clientEngagement: session.clientEngagement,
      homeworkCompletion: session.homeworkCompletion,
      homeworkAssigned: session.homeworkAssigned,
      breakthroughMoment: session.breakthroughMoment,
      coachObservations: session.coachObservations,
      frameworksUsed: session.frameworksUsed ?? [],
      plan: session.plan ?? null,
    });
    setEditId(session.id);
    setShowForm(true);
    setExpanded(null);
  }

  function resetForm() {
    setForm(DEFAULT_FORM);
    setEditId(null);
  }

  async function handleSave() {
    if (!form.clientName.trim() || !form.date) return;
    const data = { ...form, clientId: form.clientId || null };
    if (editId) {
      await updateSession(editId, data);
    } else {
      await addSession(data);
    }
    if (data.clientId) {
      fetch("/api/update-profile-from-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: data.clientId }),
      }).catch(() => {});
    }
    resetForm();
    setShowForm(false);
  }

  if (!loaded) return null;

  return (
    <div className="p-4 md:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Sessions</h1>
          <p className="mt-1 text-sm text-slate-500">
            {sessions.length} session{sessions.length !== 1 ? "s" : ""} logged
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: "#FF6B6B" }}
        >
          <Plus size={15} strokeWidth={2.5} />
          Log Session
        </button>
      </div>

      {showForm && (
        <SessionForm
          form={form}
          setForm={setForm}
          clients={clients}
          isEdit={!!editId}
          onClientSelect={handleClientSelect}
          onToggleFramework={toggleFramework}
          onSave={handleSave}
          onCancel={() => { resetForm(); setShowForm(false); }}
        />
      )}

      {sessions.length === 0 ? (
        <div
          className="rounded-xl border border-white/5 p-16 flex flex-col items-center justify-center text-center"
          style={{ background: "#131E2B" }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
            style={{ background: "rgba(255,107,107,0.08)", border: "1px dashed rgba(255,107,107,0.2)" }}
          >
            <CalendarDays size={20} style={{ color: "#FF6B6B" }} strokeWidth={1.5} />
          </div>
          <p className="text-sm text-slate-500">No sessions logged yet.</p>
          <p className="text-xs text-slate-600 mt-1">Click &quot;Log Session&quot; to add one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <SessionCard
              key={s.id}
              session={s}
              expanded={expanded === s.id}
              onToggle={() => setExpanded(expanded === s.id ? null : s.id)}
              onEdit={() => startEdit(s)}
              onRemove={() => removeSession(s.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SessionForm({
  form,
  setForm,
  clients,
  isEdit,
  onClientSelect,
  onToggleFramework,
  onSave,
  onCancel,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  clients: Client[];
  isEdit: boolean;
  onClientSelect: (id: string) => void;
  onToggleFramework: (fw: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="rounded-xl border p-5 mb-6"
      style={{ background: "#131E2B", borderColor: "rgba(255,107,107,0.2)" }}
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-white">
          {isEdit ? "Edit Session" : "Log New Session"}
        </h3>
        <button onClick={onCancel} className="text-slate-500 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Client */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Client *</label>
          {clients.length > 0 ? (
            <select
              value={form.clientId ?? ""}
              onChange={(e) => onClientSelect(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white border border-white/5 outline-none"
              style={{ background: "#1A2332" }}
            >
              <option value="">Select a client…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={form.clientName}
              onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
              placeholder="Client name"
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 border border-white/5 outline-none"
              style={{ background: "#1A2332" }}
            />
          )}
        </div>

        {/* Date + Duration */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Date *</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg text-sm text-white border border-white/5 outline-none"
            style={{ background: "#1A2332", colorScheme: "dark" }}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Duration (mins)</label>
          <input
            type="number"
            value={form.duration}
            onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg text-sm text-white border border-white/5 outline-none"
            style={{ background: "#1A2332" }}
          />
        </div>

        {/* Session # + Type */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Session #</label>
          <input
            type="number"
            min={1}
            value={form.sessionNumber}
            onChange={(e) => setForm((f) => ({ ...f, sessionNumber: Number(e.target.value) }))}
            className="w-full px-3 py-2.5 rounded-lg text-sm text-white border border-white/5 outline-none"
            style={{ background: "#1A2332" }}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Session Type</label>
          <select
            value={form.sessionType}
            onChange={(e) => setForm((f) => ({ ...f, sessionType: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg text-sm text-white border border-white/5 outline-none"
            style={{ background: "#1A2332" }}
          >
            <option value="intake">Intake</option>
            <option value="ongoing">Ongoing</option>
            <option value="follow-up">Follow-up</option>
          </select>
        </div>

        {/* Engagement + Homework completion */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Client Engagement</label>
          <select
            value={form.clientEngagement}
            onChange={(e) => setForm((f) => ({ ...f, clientEngagement: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg text-sm text-white border border-white/5 outline-none"
            style={{ background: "#1A2332" }}
          >
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="resistant">Resistant</option>
            <option value="breakthrough">Breakthrough</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Homework Completion</label>
          <select
            value={form.homeworkCompletion}
            onChange={(e) => setForm((f) => ({ ...f, homeworkCompletion: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg text-sm text-white border border-white/5 outline-none"
            style={{ background: "#1A2332" }}
          >
            <option value="none">None assigned</option>
            <option value="partial">Partially done</option>
            <option value="complete">Fully complete</option>
          </select>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Session Rating</label>
          <select
            value={form.rating}
            onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))}
            className="w-full px-3 py-2.5 rounded-lg text-sm text-white border border-white/5 outline-none"
            style={{ background: "#1A2332" }}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{"★".repeat(n)} {n}/5</option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Session Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="What did you cover? Key topics, client's state, how the session went..."
            rows={3}
            className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 border border-white/5 outline-none resize-none"
            style={{ background: "#1A2332" }}
          />
        </div>

        {/* Homework assigned */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Homework Assigned</label>
          <input
            type="text"
            value={form.homeworkAssigned}
            onChange={(e) => setForm((f) => ({ ...f, homeworkAssigned: e.target.value }))}
            placeholder="e.g. Approach 2 strangers this week using SPARK..."
            className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 border border-white/5 outline-none"
            style={{ background: "#1A2332" }}
          />
        </div>

        {/* Breakthrough moment */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Breakthrough Moment</label>
          <input
            type="text"
            value={form.breakthroughMoment}
            onChange={(e) => setForm((f) => ({ ...f, breakthroughMoment: e.target.value }))}
            placeholder="Any key insight or shift that happened this session..."
            className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 border border-white/5 outline-none"
            style={{ background: "#1A2332" }}
          />
        </div>

        {/* Coach observations */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Coach Observations (Private)</label>
          <textarea
            value={form.coachObservations}
            onChange={(e) => setForm((f) => ({ ...f, coachObservations: e.target.value }))}
            placeholder="What did you notice about their behavior, energy, resistance, patterns..."
            rows={2}
            className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 border border-white/5 outline-none resize-none"
            style={{ background: "#1A2332" }}
          />
        </div>

        {/* Action items */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Action Items</label>
          <textarea
            value={form.actionItems}
            onChange={(e) => setForm((f) => ({ ...f, actionItems: e.target.value }))}
            placeholder="Specific action steps from this session..."
            rows={2}
            className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 border border-white/5 outline-none resize-none"
            style={{ background: "#1A2332" }}
          />
        </div>

        {/* Frameworks checkboxes */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-400 mb-2">Frameworks Covered This Session</label>
          <div className="flex flex-wrap gap-2">
            {SOCIAL_CODE_FRAMEWORKS.map((fw) => {
              const checked = form.frameworksUsed.includes(fw);
              return (
                <button
                  key={fw}
                  type="button"
                  onClick={() => onToggleFramework(fw)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                  style={{
                    background: checked ? "rgba(167,139,250,0.12)" : "transparent",
                    borderColor: checked ? "rgba(167,139,250,0.4)" : "rgba(255,255,255,0.08)",
                    color: checked ? "#a78bfa" : "#64748b",
                  }}
                >
                  <CheckSquare size={11} />
                  {fw}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-5">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: "#00D9C0", color: "#080F18" }}
        >
          {isEdit ? "Save Changes" : "Log Session"}
        </button>
      </div>
    </div>
  );
}

function SessionCard({
  session,
  expanded,
  onToggle,
  onEdit,
  onRemove,
}: {
  session: Session;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const engagementColor: Record<string, string> = {
    breakthrough: "#fbbf24",
    open: "#00D9C0",
    resistant: "#FF6B6B",
    closed: "#64748b",
  };
  const typeLabel: Record<string, string> = {
    intake: "Intake",
    ongoing: "Ongoing",
    "follow-up": "Follow-up",
    planned: "Plan",
  };

  return (
    <div
      className="rounded-xl border border-white/5 overflow-hidden"
      style={{ background: "#131E2B" }}
    >
      <div className="flex items-start gap-3 px-5 py-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-white">{session.clientName}</span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-bold text-slate-400 border border-white/10"
            >
              S{session.sessionNumber}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{
                background: session.sessionType === "intake"
                  ? "rgba(0,217,192,0.1)"
                  : session.sessionType === "planned"
                  ? "rgba(167,139,250,0.12)"
                  : "rgba(255,255,255,0.05)",
                color: session.sessionType === "intake"
                  ? "#00D9C0"
                  : session.sessionType === "planned"
                  ? "#a78bfa"
                  : "#64748b",
              }}
            >
              {typeLabel[session.sessionType] ?? session.sessionType}
            </span>
            <span
              className="text-xs font-medium"
              style={{ color: engagementColor[session.clientEngagement] ?? "#64748b" }}
            >
              {session.clientEngagement}
            </span>
            <span className="text-xs text-slate-500">
              {new Date(session.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="text-xs text-slate-600">{session.duration}m</span>
            <span className="text-xs" style={{ color: "#00D9C0" }}>
              {"★".repeat(session.rating)}
            </span>
          </div>
          {session.notes && !expanded && (
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed line-clamp-1">
              {session.notes}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onEdit}
            className="p-1.5 rounded text-slate-600 hover:text-slate-300 transition-colors"
            title="Edit session"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={onToggle}
            className="p-1.5 rounded text-slate-600 hover:text-slate-300 transition-colors"
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          <button
            onClick={onRemove}
            className="p-1.5 rounded text-slate-600 hover:text-red-400 transition-colors"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-white/5 px-5 py-4 space-y-3">
          {/* Saved plan view */}
          {session.plan && session.sessionType === "planned" && (
            <FullPlanView plan={session.plan} />
          )}
          {/* Logged session view */}
          {session.sessionType !== "planned" && (
            <>
              {session.notes && <DetailField label="Session Notes" value={session.notes} />}
              {session.frameworksUsed?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                    Frameworks Covered
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {session.frameworksUsed.map((f) => (
                      <span
                        key={f}
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: "rgba(167,139,250,0.1)", color: "#a78bfa" }}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {session.homeworkAssigned && (
                <DetailField label="Homework Assigned" value={session.homeworkAssigned} />
              )}
              {session.homeworkCompletion !== "none" && (
                <DetailField label="Homework Completion" value={session.homeworkCompletion} />
              )}
              {session.breakthroughMoment && (
                <DetailField label="Breakthrough Moment" value={session.breakthroughMoment} highlight />
              )}
              {session.coachObservations && (
                <DetailField label="Coach Observations" value={session.coachObservations} />
              )}
              {session.actionItems && (
                <DetailField label="Action Items" value={session.actionItems} />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function DetailField({
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
      <p className={`text-xs leading-relaxed ${highlight ? "text-white font-semibold" : "text-slate-400"}`}>
        {value}
      </p>
    </div>
  );
}

function FullPlanView({ plan }: { plan: Record<string, unknown> }) {
  const agenda = plan.agenda as { time: string; block: string; notes: string }[] | undefined;
  const questions = plan.session_questions as string[] | undefined;
  const watchFor = plan.what_to_watch as string[] | undefined;

  return (
    <div className="space-y-4">
      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#a78bfa" }}>
        Full Session Plan
      </p>

      {(plan.todays_focus as string) && (
        <DetailField label="Today's Focus" value={plan.todays_focus as string} />
      )}
      {(plan.opening as string) && (
        <DetailField label="How to Open" value={plan.opening as string} />
      )}
      {(plan.check_in as string) && (
        <DetailField label="Check-In Question" value={plan.check_in as string} highlight />
      )}

      {agenda && agenda.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Agenda</p>
          <div className="space-y-1.5">
            {agenda.map((a, i) => (
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

      {(plan.framework_or_topic_approach as string) && (
        <DetailField label="Framework Approach" value={plan.framework_or_topic_approach as string} />
      )}

      {questions && questions.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Questions — In Order</p>
          <ol className="space-y-1.5">
            {questions.map((q, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                <span className="font-bold flex-shrink-0" style={{ color: "#a78bfa" }}>{i + 1}.</span>{q}
              </li>
            ))}
          </ol>
        </div>
      )}

      {(plan.exercise as string) && (
        <DetailField label="Exercise / Drill" value={plan.exercise as string} />
      )}

      {watchFor && watchFor.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">What to Watch For</p>
          <ul className="space-y-1">
            {watchFor.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                <span className="flex-shrink-0" style={{ color: "#00D9C0" }}>→</span>{w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(plan.if_they_resist as string) && (
        <div className="rounded-lg p-3 border border-white/5" style={{ background: "#0D1825" }}>
          <p className="text-xs font-bold text-slate-400 mb-1">If They Resist</p>
          <p className="text-xs text-slate-300 italic">&quot;{plan.if_they_resist as string}&quot;</p>
        </div>
      )}

      {(plan.session_close as string) && (
        <DetailField label="How to Close" value={plan.session_close as string} />
      )}

      {(plan.homework as string) && (
        <div className="rounded-lg p-3 border" style={{ background: "rgba(0,217,192,0.04)", borderColor: "rgba(0,217,192,0.15)" }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#00D9C0" }}>Homework</p>
          <p className="text-xs text-slate-300 leading-relaxed">{plan.homework as string}</p>
        </div>
      )}

      {(plan.next_session_seed as string) && (
        <DetailField label="Plant This for Next Session" value={plan.next_session_seed as string} />
      )}
    </div>
  );
}
