"use client";

import { useEffect, useState } from "react";
import { usePortalClient } from "../../hooks/usePortalClient";
import PortalShell from "../../components/portal/PortalShell";
import { CheckSquare, Square } from "lucide-react";

type Task = {
  id: string;
  title: string;
  completed: boolean;
  due_date: string | null;
};

function formatDue(dateStr: string | null): { label: string; overdue: boolean } | null {
  if (!dateStr) return null;
  const due = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdue = due < today;
  const label = due.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return { label, overdue };
}

export default function PortalTasksPage() {
  const { client, loading } = usePortalClient();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!client) return;
    fetch("/api/portal/tasks")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setTasks(d); })
      .finally(() => setFetching(false));
  }, [client]);

  async function toggleTask(task: Task) {
    const updated = { ...task, completed: !task.completed };
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));

    const res = await fetch(`/api/portal/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: updated.completed }),
    });

    if (!res.ok) {
      // Revert on failure
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    }
  }

  if (loading || !client) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0D1825" }}>
        <div className="w-5 h-5 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const pending = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);

  return (
    <PortalShell clientName={client.name}>
      <div className="p-4 md:p-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white tracking-tight mb-1">My Tasks</h1>
          <p className="text-sm text-slate-500">
            {pending.length} pending · {done.length} completed
          </p>
        </div>

        {fetching ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : tasks.length === 0 ? (
          <div
            className="rounded-2xl border border-white/5 p-12 text-center"
            style={{ background: "#131E2B" }}
          >
            <p className="text-sm text-slate-500">No tasks yet. Your coach will add them here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pending */}
            {pending.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                  To Do
                </p>
                {pending.map((task) => {
                  const due = formatDue(task.due_date);
                  return (
                    <button
                      key={task.id}
                      onClick={() => toggleTask(task)}
                      className="w-full flex items-start gap-3 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all text-left group"
                      style={{ background: "#131E2B" }}
                    >
                      <Square
                        size={18}
                        className="mt-0.5 flex-shrink-0 transition-colors group-hover:text-teal-400"
                        style={{ color: "#334155" }}
                        strokeWidth={1.5}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white leading-snug">{task.title}</p>
                        {due && (
                          <p
                            className="text-xs mt-1"
                            style={{ color: due.overdue ? "#FF6B6B" : "#64748b" }}
                          >
                            {due.overdue ? "Overdue · " : "Due "}{due.label}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Completed */}
            {done.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest mb-3">
                  Completed
                </p>
                {done.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => toggleTask(task)}
                    className="w-full flex items-start gap-3 p-4 rounded-xl border border-white/5 transition-all text-left opacity-50 hover:opacity-70"
                    style={{ background: "#131E2B" }}
                  >
                    <CheckSquare
                      size={18}
                      className="mt-0.5 flex-shrink-0"
                      style={{ color: "#00D9C0" }}
                      strokeWidth={1.5}
                    />
                    <p className="text-sm font-medium text-slate-400 line-through leading-snug">
                      {task.title}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </PortalShell>
  );
}
