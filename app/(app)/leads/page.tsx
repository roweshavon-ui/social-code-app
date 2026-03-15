"use client";

import { useEffect, useState } from "react";
import { Mail, Download, Trash2 } from "lucide-react";

interface Lead {
  id: string;
  name: string | null;
  email: string;
  framework: string;
  created_at: string;
}

const FRAMEWORK_LABELS: Record<string, string> = {
  "talk-check": "TALK Check",
  "fearless-approach": "Fearless Approach System",
  "bundle": "Free Bundle",
};

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/leads")
      .then((r) => r.json())
      .then((data) => setLeads(Array.isArray(data) ? data : []))
      .catch(() => setLeads([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    setDeleting(id);
    await fetch(`/api/leads/${id}`, { method: "DELETE" });
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setDeleting(null);
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Leads</h1>
        <p className="mt-1 text-sm text-slate-500">Everyone who downloaded a free framework.</p>
      </div>

      <div className="rounded-xl border border-white/5 overflow-hidden" style={{ background: "#131E2B" }}>
        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500">Loading...</div>
        ) : leads.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(0,217,192,0.08)", border: "1px dashed rgba(0,217,192,0.2)" }}>
              <Mail size={20} style={{ color: "#00D9C0" }} strokeWidth={1.5} />
            </div>
            <p className="text-sm text-slate-500">No leads yet.</p>
            <p className="text-xs text-slate-600 mt-1">They'll appear here when someone downloads a framework.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Email</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Framework</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Date</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {leads.map((lead, i) => (
                <tr key={lead.id} style={{ borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.04)" }}>
                  <td className="px-6 py-4 text-sm text-white">{lead.name ?? <span className="text-slate-600">—</span>}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{lead.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: "rgba(0,217,192,0.1)", color: "#00D9C0" }}>
                      <Download size={10} />
                      {FRAMEWORK_LABELS[lead.framework] ?? lead.framework}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(lead.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(lead.id)}
                      disabled={deleting === lead.id}
                      className="text-slate-600 hover:text-red-400 transition-colors disabled:opacity-30"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
