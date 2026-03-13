"use client";

import { useEffect, useState } from "react";
import { usePortalClient } from "../../hooks/usePortalClient";
import PortalShell from "../../components/portal/PortalShell";

type Session = {
  id: string;
  date: string;
  duration: number | null;
  notes: string | null;
  action_items: string | null;
  rating: number | null;
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ color: i < rating ? "#FFB800" : "#1E293B", fontSize: 13 }}>★</span>
      ))}
    </div>
  );
}

export default function PortalSessionsPage() {
  const { client, loading } = usePortalClient();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [fetching, setFetching] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!client) return;
    fetch("/api/portal/sessions")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setSessions(d); })
      .finally(() => setFetching(false));
  }, [client]);

  if (loading || !client) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0D1825" }}>
        <div className="w-5 h-5 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <PortalShell clientName={client.name}>
      <div className="p-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white tracking-tight mb-1">Sessions</h1>
          <p className="text-sm text-slate-500">{sessions.length} session{sessions.length !== 1 ? "s" : ""} logged</p>
        </div>

        {fetching ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : sessions.length === 0 ? (
          <div
            className="rounded-2xl border border-white/5 p-12 text-center"
            style={{ background: "#131E2B" }}
          >
            <p className="text-sm text-slate-500">No sessions logged yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => {
              const open = expanded === s.id;
              return (
                <div
                  key={s.id}
                  className="rounded-xl border border-white/5 overflow-hidden"
                  style={{ background: "#131E2B" }}
                >
                  <button
                    onClick={() => setExpanded(open ? null : s.id)}
                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/[0.02] transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: "rgba(0,217,192,0.08)", color: "#00D9C0" }}
                    >
                      {new Date(s.date).getDate()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">
                        {new Date(s.date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {s.duration ? `${s.duration} min` : ""}
                        {s.duration && s.rating ? " · " : ""}
                        {s.rating ? `${s.rating}/5` : ""}
                      </p>
                    </div>
                    {s.rating && <StarRating rating={s.rating} />}
                    <span className="text-slate-600 text-xs ml-2">{open ? "▲" : "▼"}</span>
                  </button>

                  {open && (
                    <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-4">
                      {s.notes && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                            Notes
                          </p>
                          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {s.notes}
                          </p>
                        </div>
                      )}
                      {s.action_items && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                            Action Items
                          </p>
                          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {s.action_items}
                          </p>
                        </div>
                      )}
                      {!s.notes && !s.action_items && (
                        <p className="text-xs text-slate-600">No notes for this session.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PortalShell>
  );
}
