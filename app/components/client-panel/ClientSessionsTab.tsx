"use client";

import { useEffect } from "react";
import { CalendarDays } from "lucide-react";
import { useSessions } from "../../hooks/useSessions";

export default function ClientSessionsTab({ clientId }: { clientId: string }) {
  const { sessions, loaded, fetchSessions } = useSessions(clientId);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  if (!loaded) {
    return <p className="text-xs text-slate-500 py-4">Loading sessions…</p>;
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
          style={{ background: "rgba(255,107,107,0.08)", border: "1px dashed rgba(255,107,107,0.2)" }}
        >
          <CalendarDays size={16} style={{ color: "#FF6B6B" }} strokeWidth={1.5} />
        </div>
        <p className="text-xs text-slate-500">No sessions logged for this client yet.</p>
        <p className="text-xs text-slate-600 mt-1">Log one from the Sessions page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sessions.map((s) => (
        <div
          key={s.id}
          className="rounded-xl border border-white/5 p-4"
          style={{ background: "#131E2B" }}
        >
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <span className="text-xs font-semibold text-white">
              {new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            <span className="text-xs text-slate-500">{s.duration} min</span>
            <span className="text-xs" style={{ color: "#00D9C0" }}>{"★".repeat(s.rating)}</span>
          </div>
          {s.notes && <p className="text-xs text-slate-400 leading-relaxed">{s.notes}</p>}
          {s.actionItems && (
            <p className="text-xs mt-1">
              <span className="font-medium" style={{ color: "#FF6B6B" }}>Actions: </span>
              <span className="text-slate-500">{s.actionItems}</span>
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
