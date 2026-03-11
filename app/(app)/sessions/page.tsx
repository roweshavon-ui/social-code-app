"use client";

import { useState } from "react";
import { Plus, CalendarDays, X } from "lucide-react";
import { useSessions } from "../../hooks/useSessions";

export default function SessionsPage() {
  const { sessions, loaded, addSession, removeSession } = useSessions();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    clientName: "", date: "", duration: "60", notes: "", actionItems: "", rating: 5,
  });

  async function handleAdd() {
    if (!form.clientName.trim() || !form.date) return;
    await addSession(form);
    setForm({ clientName: "", date: "", duration: "60", notes: "", actionItems: "", rating: 5 });
    setShowForm(false);
  }

  if (!loaded) return null;

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Sessions</h1>
          <p className="mt-1 text-sm text-slate-500">{sessions.length} session{sessions.length !== 1 ? "s" : ""} logged</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: "#FF6B6B" }}
        >
          <Plus size={15} strokeWidth={2.5} />
          Log Session
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-xl border p-6 mb-6" style={{ background: "#131E2B", borderColor: "rgba(255,107,107,0.2)" }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-white">New Session</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Client Name *</label>
              <input
                type="text"
                value={form.clientName}
                onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
                placeholder="Client name"
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 border border-white/5 outline-none transition-colors"
                style={{ background: "#1A2332" }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Date *</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white border border-white/5 outline-none transition-colors"
                style={{ background: "#1A2332", colorScheme: "dark" }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Duration (mins)</label>
              <input
                type="number"
                value={form.duration}
                onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white border border-white/5 outline-none transition-colors"
                style={{ background: "#1A2332" }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Session Rating (1–5)</label>
              <select
                value={form.rating}
                onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))}
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white border border-white/5 outline-none transition-colors"
                style={{ background: "#1A2332" }}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{"★".repeat(n)} {n}/5</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Session Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="What did you cover? Key breakthroughs or observations..."
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 border border-white/5 outline-none transition-colors resize-none"
                style={{ background: "#1A2332" }}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Action Items</label>
              <textarea
                value={form.actionItems}
                onChange={(e) => setForm((f) => ({ ...f, actionItems: e.target.value }))}
                placeholder="What should the client practice before next session?"
                rows={2}
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 border border-white/5 outline-none transition-colors resize-none"
                style={{ background: "#1A2332" }}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white transition-colors">
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: "#00D9C0", color: "#080F18" }}
            >
              Save Session
            </button>
          </div>
        </div>
      )}

      {/* Sessions list */}
      {sessions.length === 0 ? (
        <div className="rounded-xl border border-white/5 p-16 flex flex-col items-center justify-center text-center" style={{ background: "#131E2B" }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(255,107,107,0.08)", border: "1px dashed rgba(255,107,107,0.2)" }}>
            <CalendarDays size={20} style={{ color: "#FF6B6B" }} strokeWidth={1.5} />
          </div>
          <p className="text-sm text-slate-500">No sessions logged yet.</p>
          <p className="text-xs text-slate-600 mt-1">Click &quot;Log Session&quot; to add one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <div key={s.id} className="rounded-xl border border-white/5 p-5 hover:border-white/10 transition-all" style={{ background: "#131E2B" }}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-semibold text-white">{s.clientName}</span>
                    <span className="text-xs text-slate-500">{new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    <span className="text-xs text-slate-500">{s.duration} min</span>
                    <span className="text-xs" style={{ color: "#00D9C0" }}>{"★".repeat(s.rating)}</span>
                  </div>
                  {s.notes && <p className="mt-2 text-xs text-slate-400 leading-relaxed">{s.notes}</p>}
                  {s.actionItems && (
                    <div className="mt-2">
                      <span className="text-xs font-medium" style={{ color: "#FF6B6B" }}>Action items: </span>
                      <span className="text-xs text-slate-500">{s.actionItems}</span>
                    </div>
                  )}
                </div>
                <button onClick={() => removeSession(s.id)} className="text-slate-700 hover:text-coral ml-4 transition-colors">
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
