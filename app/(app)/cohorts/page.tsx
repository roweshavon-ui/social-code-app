"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Users, Loader2, X, ChevronRight } from "lucide-react";
import { useClients } from "../../hooks/useClients";

type Cohort = {
  id: string;
  created_at: string;
  name: string;
  description: string | null;
  start_date: string | null;
  total_sessions: number;
  client_ids: string[];
  client_names: string[];
  status: string;
};

const BRAND = { teal: "#00D9C0", coral: "#FF6B6B", purple: "#a78bfa" };

export default function CohortsPage() {
  const router = useRouter();
  const { clients, loaded: clientsLoaded } = useClients();
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchCohorts();
  }, []);

  async function fetchCohorts() {
    setLoading(true);
    const res = await fetch("/api/cohorts");
    if (res.ok) {
      const data = await res.json();
      setCohorts(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  }

  async function handleCreate(cohort: Omit<Cohort, "id" | "created_at" | "status">) {
    const res = await fetch("/api/cohorts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: cohort.name,
        description: cohort.description,
        startDate: cohort.start_date,
        totalSessions: cohort.total_sessions,
        clientIds: cohort.client_ids,
        clientNames: cohort.client_names,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setCohorts((prev) => [data, ...prev]);
      setShowForm(false);
      router.push(`/cohorts/${data.id}`);
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users size={20} style={{ color: BRAND.teal }} />
            <h1 className="text-2xl font-bold text-white tracking-tight">Cohorts</h1>
          </div>
          <p className="mt-0.5 text-sm text-slate-500">
            Pre-built group programs — add clients anytime
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: BRAND.teal }}
        >
          <Plus size={15} strokeWidth={2.5} />
          New Cohort
        </button>
      </div>

      {showForm && clientsLoaded && (
        <CreateCohortForm
          clients={clients}
          onCreate={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Loader2 size={14} className="animate-spin" /> Loading cohorts...
        </div>
      ) : cohorts.length === 0 ? (
        <div
          className="rounded-xl border border-white/5 p-16 flex flex-col items-center justify-center text-center"
          style={{ background: "#131E2B" }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
            style={{
              background: "rgba(0,217,192,0.08)",
              border: "1px dashed rgba(0,217,192,0.2)",
            }}
          >
            <Users size={20} style={{ color: BRAND.teal }} strokeWidth={1.5} />
          </div>
          <p className="text-sm text-slate-500">No cohorts yet.</p>
          <p className="text-xs text-slate-600 mt-1">
            Click &quot;New Cohort&quot; to create your first group program.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {cohorts.map((c) => (
            <div
              key={c.id}
              onClick={() => router.push(`/cohorts/${c.id}`)}
              className="rounded-xl border border-white/5 px-5 py-4 flex items-center justify-between cursor-pointer hover:border-white/10 transition-all"
              style={{ background: "#131E2B" }}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-white">{c.name}</span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{
                      background: c.status === "active" ? "rgba(0,217,192,0.1)" : "rgba(255,255,255,0.05)",
                      color: c.status === "active" ? BRAND.teal : "#64748b",
                    }}
                  >
                    {c.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>{c.client_names?.length ?? 0} clients</span>
                  <span>{c.total_sessions} sessions</span>
                  {c.start_date && (
                    <span>
                      Starts{" "}
                      {new Date(c.start_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>
                {c.description && (
                  <p className="text-xs text-slate-500 mt-1">{c.description}</p>
                )}
              </div>
              <ChevronRight size={16} className="text-slate-600 flex-shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateCohortForm({
  clients,
  onCreate,
  onCancel,
}: {
  clients: ReturnType<typeof useClients>["clients"];
  onCreate: (cohort: {
    name: string;
    description: string | null;
    start_date: string | null;
    total_sessions: number;
    client_ids: string[];
    client_names: string[];
  }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [totalSessions, setTotalSessions] = useState(8);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  function toggleClient(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleSubmit() {
    if (!name.trim()) return;
    const selectedClients = clients.filter((c) => selectedIds.includes(c.id));
    onCreate({
      name,
      description: description || null,
      start_date: startDate || null,
      total_sessions: totalSessions,
      client_ids: selectedIds,
      client_names: selectedClients.map((c) => c.name),
    });
  }

  return (
    <div
      className="rounded-xl border p-5 mb-6"
      style={{ background: "#131E2B", borderColor: "rgba(0,217,192,0.2)" }}
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-white">New Cohort</h3>
        <button onClick={onCancel} className="text-slate-500 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Cohort Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Spring 2026 Social Confidence Group"
            className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 border border-white/5 outline-none"
            style={{ background: "#1A2332" }}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Goal / Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this cohort working toward?"
            rows={2}
            className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 border border-white/5 outline-none resize-none"
            style={{ background: "#1A2332" }}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-sm text-white border border-white/5 outline-none"
            style={{ background: "#1A2332", colorScheme: "dark" }}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Number of Sessions</label>
          <input
            type="number"
            min={2}
            max={20}
            value={totalSessions}
            onChange={(e) => setTotalSessions(Number(e.target.value))}
            className="w-full px-3 py-2.5 rounded-lg text-sm text-white border border-white/5 outline-none"
            style={{ background: "#1A2332" }}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-400 mb-1">Select Clients <span className="text-slate-600 font-normal">(optional — add them later as people enroll)</span></label>
          {clients.length === 0 ? (
            <p className="text-xs text-slate-600 italic">No clients in CRM yet — you can add them to the cohort after creating it.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {clients.map((c) => {
                const selected = selectedIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleClient(c.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border text-left transition-all"
                    style={{
                      background: selected ? "rgba(0,217,192,0.08)" : "rgba(255,255,255,0.02)",
                      borderColor: selected ? "rgba(0,217,192,0.3)" : "rgba(255,255,255,0.08)",
                      color: selected ? BRAND.teal : "#94a3b8",
                    }}
                  >
                    <span
                      className="w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{
                        borderColor: selected ? BRAND.teal : "#475569",
                        background: selected ? BRAND.teal : "transparent",
                        color: selected ? "#000" : "transparent",
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
      </div>

      <div className="flex justify-end gap-3 mt-5">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: BRAND.teal, color: "#080F18" }}
        >
          Create Cohort
        </button>
      </div>
    </div>
  );
}
