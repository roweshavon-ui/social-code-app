"use client";

import { useState } from "react";
import { Plus, Search, User, X, ClipboardList, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useClients, type Client } from "../../hooks/useClients";
import { TYPE_ACRONYMS, TYPE_PROFILES } from "../../lib/mbtiData";
import ClientMessagesTab from "../../components/client-panel/ClientMessagesTab";
import ClientTasksTab from "../../components/client-panel/ClientTasksTab";
import ClientSessionsTab from "../../components/client-panel/ClientSessionsTab";
import ClientPortalTab from "../../components/client-panel/ClientPortalTab";

const JUNGIAN_TYPES = [
  "INTJ","INTP","ENTJ","ENTP",
  "INFJ","INFP","ENFJ","ENFP",
  "ISTJ","ISFJ","ESTJ","ESFJ",
  "ISTP","ISFP","ESTP","ESFP",
];

const TYPE_COLORS: Record<string, string> = {
  INTJ:"#00D9C0",INTP:"#00D9C0",ENTJ:"#4DE8D4",ENTP:"#4DE8D4",
  INFJ:"#FF6B6B",INFP:"#FF6B6B",ENFJ:"#FF8C8C",ENFP:"#FF8C8C",
  ISTJ:"#00A896",ISFJ:"#00A896",ESTJ:"#00D9C0",ESFJ:"#00D9C0",
  ISTP:"#FF6B6B",ISFP:"#FF6B6B",ESTP:"#4DE8D4",ESFP:"#4DE8D4",
};

function typeColor(type: string) {
  return TYPE_COLORS[type] ?? "#00D9C0";
}

function TypeBadge({ type }: { type: string }) {
  const color = typeColor(type);
  const acronym = TYPE_ACRONYMS[type];
  return (
    <div>
      <span
        className="text-xs px-2 py-0.5 rounded-full font-bold"
        style={{ background: `${color}15`, color }}
      >
        {type}
      </span>
      {acronym && (
        <p className="text-xs mt-1" style={{ color: `${color}99` }}>
          {acronym.join(" · ")}
        </p>
      )}
    </div>
  );
}

type FormState = {
  name: string;
  email: string;
  jungianType: string;
  goal: string;
  notes: string;
  observations: string;
  socialPatterns: string;
  status: "active" | "inactive";
  pipelineStage: "lead" | "prospect" | "active" | "completed";
};

const EMPTY_FORM: FormState = {
  name: "", email: "", jungianType: "INFP", goal: "",
  notes: "", observations: "", socialPatterns: "", status: "active",
  pipelineStage: "lead",
};

type PanelTab = "profile" | "messages" | "tasks" | "sessions" | "portal";

function ClientPanel({
  client,
  onClose,
  onSave,
}: {
  client: Client;
  onClose: () => void;
  onSave: (updates: Partial<Client>) => void;
}) {
  const profile = TYPE_PROFILES[client.jungianType];
  const acronym = TYPE_ACRONYMS[client.jungianType];
  const color = typeColor(client.jungianType);

  const [tab, setTab] = useState<PanelTab>("profile");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    goal: client.goal ?? "",
    notes: client.notes ?? "",
    observations: client.observations ?? "",
    socialPatterns: client.socialPatterns ?? "",
  });

  function handleSave() {
    onSave(draft);
    setEditing(false);
  }

  const tabs: { key: PanelTab; label: string }[] = [
    { key: "profile", label: "Profile" },
    { key: "messages", label: "Messages" },
    { key: "tasks", label: "Tasks" },
    { key: "sessions", label: "Sessions" },
    { key: "portal", label: "Portal" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg overflow-y-auto"
        style={{ background: "#0D1825", borderLeft: "1px solid rgba(0,217,192,0.1)" }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10" style={{ background: "#0D1825", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: `${color}20`, color }}
              >
                {client.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{client.name}</p>
                <p className="text-xs" style={{ color }}>{client.jungianType} · {profile?.nickname}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1">
              <X size={18} />
            </button>
          </div>

          {/* Tab bar */}
          <div className="flex px-6 gap-1">
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className="px-3 py-2 text-xs font-semibold transition-colors border-b-2"
                style={{
                  color: tab === key ? "#00D9C0" : "#64748b",
                  borderColor: tab === key ? "#00D9C0" : "transparent",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 py-6">

          {/* Profile tab */}
          {tab === "profile" && (
            <div className="space-y-6">
              {/* Type breakdown */}
              <div className="rounded-xl p-5 border" style={{ background: "#131E2B", borderColor: `${color}25` }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl font-black" style={{ color }}>{client.jungianType}</span>
                  <span className="text-xs text-slate-500 font-medium">{profile?.nickname}</span>
                </div>
                {acronym && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {acronym.map((word) => (
                      <span key={word} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: `${color}15`, color }}>
                        {word}
                      </span>
                    ))}
                  </div>
                )}
                {profile && (
                  <p className="text-sm text-slate-400 leading-relaxed">{profile.tagline}</p>
                )}
              </div>

              {/* Type profile sections */}
              {profile && (
                <div className="space-y-4">
                  <Section title="Career Paths" color={color}>
                    <ul className="space-y-1">
                      {profile.careers.map((c) => (
                        <li key={c} className="flex items-center gap-2 text-sm text-slate-300">
                          <span style={{ color }} className="text-xs">▸</span> {c}
                        </li>
                      ))}
                    </ul>
                  </Section>

                  <Section title="Strengths" color="#00D9C0">
                    <ul className="space-y-1">
                      {profile.strengths.map((s) => (
                        <li key={s} className="flex items-start gap-2 text-sm text-slate-300">
                          <span className="text-xs mt-0.5 flex-shrink-0" style={{ color: "#00D9C0" }}>✓</span> {s}
                        </li>
                      ))}
                    </ul>
                  </Section>

                  <Section title="Blind Spots" color="#FF6B6B">
                    <ul className="space-y-1">
                      {profile.blindSpots.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-sm text-slate-300">
                          <span className="text-xs mt-0.5 flex-shrink-0" style={{ color: "#FF6B6B" }}>✗</span> {b}
                        </li>
                      ))}
                    </ul>
                  </Section>

                  <Section title="Energy Pattern" color={color}>
                    <p className="text-sm text-slate-300 leading-relaxed">{profile.energyPattern}</p>
                  </Section>

                  <Section title="Social Style" color={color}>
                    <p className="text-sm text-slate-300 leading-relaxed">{profile.socialStyle}</p>
                  </Section>

                  <Section title="Communication Tip" color="#4DE8D4">
                    <p className="text-sm text-slate-300 leading-relaxed">{profile.communicationTip}</p>
                  </Section>

                  <Section title="Recommended Simulator Scenarios" color="#FF6B6B">
                    <p className="text-xs text-slate-500 mb-3">Run these in the Simulator — targeted to this type&apos;s specific gaps.</p>
                    <ul className="space-y-2">
                      {profile.practiceScenarios.map((s, i) => (
                        <li key={s} className="flex items-center gap-2.5">
                          <span className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,107,107,0.15)", color: "#FF6B6B" }}>{i + 1}</span>
                          <span className="text-sm text-slate-300">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </Section>

                  {/* Coaching-only sections */}
                  <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,107,107,0.15), transparent)" }} />
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#FF6B6B" }}>Coaching Intelligence</p>

                  <Section title="How They Process Failure" color="#FF6B6B">
                    <p className="text-sm text-slate-300 leading-relaxed">{profile.failureResponse}</p>
                  </Section>

                  <Section title="Red Flags to Watch in Session" color="#FF6B6B">
                    <ul className="space-y-2">
                      {profile.redFlags.map((flag) => (
                        <li key={flag} className="flex items-start gap-2 text-sm text-slate-300">
                          <span className="text-xs mt-0.5 flex-shrink-0" style={{ color: "#FF6B6B" }}>⚑</span> {flag}
                        </li>
                      ))}
                    </ul>
                  </Section>

                  <Section title="Questions to Ask This Type" color="#4DE8D4">
                    <p className="text-xs text-slate-500 mb-3">Ready-made prompts — use these when the session stalls or needs to go deeper.</p>
                    <ul className="space-y-2.5">
                      {profile.sessionQuestions.map((q, i) => (
                        <li key={q} className="flex items-start gap-2.5">
                          <span className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(77,232,212,0.12)", color: "#4DE8D4" }}>{i + 1}</span>
                          <span className="text-sm text-slate-300 leading-snug">&ldquo;{q}&rdquo;</span>
                        </li>
                      ))}
                    </ul>
                  </Section>

                  <Section title="Quick Win — Assign This First" color="#00D9C0">
                    <p className="text-sm text-slate-300 leading-relaxed">{profile.quickWins}</p>
                  </Section>
                </div>
              )}

              {/* Divider */}
              <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(0,217,192,0.12), transparent)" }} />

              {/* Client notes */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white">Client Notes</h3>
                  {!editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                      style={{ color: "#00D9C0", background: "rgba(0,217,192,0.08)" }}
                    >
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => setEditing(false)} className="text-xs font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors">Cancel</button>
                      <button onClick={handleSave} className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors" style={{ background: "#00D9C0", color: "#080F18" }}>Save</button>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <NoteField label="Goal" value={editing ? draft.goal : client.goal} placeholder="What does this client want to achieve?" editing={editing} onChange={(v) => setDraft((d) => ({ ...d, goal: v }))} />
                  <NoteField label="Session Observations" value={editing ? draft.observations : client.observations} placeholder="What have you noticed about how they show up socially?" editing={editing} onChange={(v) => setDraft((d) => ({ ...d, observations: v }))} />
                  <NoteField label="Social Patterns" value={editing ? draft.socialPatterns : client.socialPatterns} placeholder="Recurring patterns, triggers, or tendencies you've identified..." editing={editing} onChange={(v) => setDraft((d) => ({ ...d, socialPatterns: v }))} />
                  <NoteField label="Additional Notes" value={editing ? draft.notes : client.notes} placeholder="Anything else worth remembering..." editing={editing} onChange={(v) => setDraft((d) => ({ ...d, notes: v }))} />
                </div>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-3 pt-2">
                {client.email && <p className="text-xs text-slate-600">{client.email}</p>}
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: client.status === "active" ? "rgba(0,217,192,0.1)" : "rgba(100,116,139,0.1)", color: client.status === "active" ? "#00D9C0" : "#64748b" }}
                >
                  {client.status}
                </span>
              </div>
            </div>
          )}

          {tab === "messages" && <ClientMessagesTab clientId={client.id} />}
          {tab === "tasks" && <ClientTasksTab clientId={client.id} />}
          {tab === "sessions" && <ClientSessionsTab clientId={client.id} />}
          {tab === "portal" && <ClientPortalTab clientId={client.id} clientEmail={client.email} />}
        </div>
      </aside>
    </>
  );
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-4 border border-white/5" style={{ background: "#131E2B" }}>
      <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color }}>{title}</h4>
      {children}
    </div>
  );
}

function NoteField({
  label, value, placeholder, editing, onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  editing: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
      {editing ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 border border-white/5 outline-none resize-none"
          style={{ background: "#1A2332" }}
        />
      ) : (
        <p className="text-sm leading-relaxed" style={{ color: value ? "#cbd5e1" : "#334155" }}>
          {value || placeholder}
        </p>
      )}
    </div>
  );
}

export default function ClientsPage() {
  const { clients, loaded, addClient, removeClient, updateClient } = useClients();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.jungianType.includes(search.toUpperCase())
  );

  const selectedClient = clients.find((c) => c.id === selectedId) ?? null;

  function handleAdd() {
    if (!form.name.trim()) return;
    addClient(form);
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  function handlePanelSave(updates: Partial<Client>) {
    if (!selectedId) return;
    updateClient(selectedId, updates);
  }

  if (!loaded) return null;

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Clients</h1>
          <p className="mt-1 text-sm text-slate-500">{clients.length} client{clients.length !== 1 ? "s" : ""} total</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/questionnaire"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 border border-white/10 text-slate-300 hover:text-white"
            style={{ background: "#131E2B" }}
          >
            <ClipboardList size={15} strokeWidth={2} />
            Run Assessment
          </Link>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "#FF6B6B" }}
          >
            <Plus size={15} strokeWidth={2.5} />
            Add Manually
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search by name, email, or type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm text-white placeholder-slate-500 border border-white/5 outline-none transition-colors"
          style={{ background: "#131E2B" }}
        />
      </div>

      {/* Manual form */}
      {showForm && (
        <div className="rounded-xl border p-6 mb-6" style={{ background: "#131E2B", borderColor: "rgba(255,107,107,0.2)" }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-white">Add Client Manually</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white transition-colors"><X size={16} /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Full name" className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 border border-white/5 outline-none" style={{ background: "#1A2332" }} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="email@example.com" className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 border border-white/5 outline-none" style={{ background: "#1A2332" }} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Jungian Type</label>
              <select value={form.jungianType} onChange={(e) => setForm((f) => ({ ...f, jungianType: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg text-sm text-white border border-white/5 outline-none" style={{ background: "#1A2332" }}>
                {JUNGIAN_TYPES.map((t) => <option key={t} value={t}>{t} — {TYPE_PROFILES[t]?.nickname}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as "active" | "inactive" }))} className="w-full px-3 py-2.5 rounded-lg text-sm text-white border border-white/5 outline-none" style={{ background: "#1A2332" }}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Goal</label>
              <textarea value={form.goal} onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))} placeholder="What does this client want to achieve?" rows={2} className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 border border-white/5 outline-none resize-none" style={{ background: "#1A2332" }} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Session Observations</label>
              <textarea value={form.observations} onChange={(e) => setForm((f) => ({ ...f, observations: e.target.value }))} placeholder="What have you noticed about how they show up socially?" rows={2} className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 border border-white/5 outline-none resize-none" style={{ background: "#1A2332" }} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Social Patterns</label>
              <textarea value={form.socialPatterns} onChange={(e) => setForm((f) => ({ ...f, socialPatterns: e.target.value }))} placeholder="Recurring patterns, triggers, or tendencies you've identified..." rows={2} className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 border border-white/5 outline-none resize-none" style={{ background: "#1A2332" }} />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white transition-colors">Cancel</button>
            <button onClick={handleAdd} className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90" style={{ background: "#00D9C0", color: "#080F18" }}>Save Client</button>
          </div>
        </div>
      )}

      {/* Client list */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-white/5 p-16 flex flex-col items-center justify-center text-center" style={{ background: "#131E2B" }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(0,217,192,0.08)", border: "1px dashed rgba(0,217,192,0.2)" }}>
            <User size={20} style={{ color: "#00D9C0" }} strokeWidth={1.5} />
          </div>
          <p className="text-sm text-slate-500">No clients yet.</p>
          <p className="text-xs text-slate-600 mt-1">Run an Assessment or add one manually.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((client) => {
            const color = typeColor(client.jungianType);
            const profile = TYPE_PROFILES[client.jungianType];
            const acronym = TYPE_ACRONYMS[client.jungianType];
            return (
              <div
                key={client.id}
                className="flex items-center gap-4 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
                style={{ background: "#131E2B" }}
                onClick={() => setSelectedId(client.id)}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: `${color}20`, color }}
                >
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white">{client.name}</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ background: `${color}15`, color }}
                    >
                      {client.jungianType}
                    </span>
                    {profile && (
                      <span className="text-xs text-slate-600">{profile.nickname}</span>
                    )}
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: client.status === "active" ? "rgba(0,217,192,0.1)" : "rgba(100,116,139,0.1)", color: client.status === "active" ? "#00D9C0" : "#64748b" }}
                    >
                      {client.status}
                    </span>
                  </div>
                  {acronym && (
                    <p className="text-xs mt-0.5" style={{ color: `${color}70` }}>{acronym.join(" · ")}</p>
                  )}
                  {client.email && <p className="text-xs text-slate-500 mt-0.5 truncate">{client.email}</p>}
                  {client.goal && <p className="text-xs text-slate-600 mt-0.5 truncate">Goal: {client.goal}</p>}
                </div>
                <ChevronRight size={14} className="text-slate-700 group-hover:text-slate-400 transition-colors flex-shrink-0" />
                <button
                  onClick={(e) => { e.stopPropagation(); removeClient(client.id); }}
                  className="text-slate-700 hover:text-red-400 transition-colors"
                  aria-label="Remove"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Side panel */}
      {selectedClient && (
        <ClientPanel
          client={selectedClient}
          onClose={() => setSelectedId(null)}
          onSave={handlePanelSave}
        />
      )}
    </div>
  );
}
