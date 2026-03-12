"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, CheckSquare, Square } from "lucide-react";
import { useTasks } from "../../hooks/useTasks";

export default function ClientTasksTab({ clientId }: { clientId: string }) {
  const { tasks, loaded, fetchTasks, addTask, toggleTask, removeTask } = useTasks(clientId);
  const [newTitle, setNewTitle] = useState("");
  const [newDue, setNewDue] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  async function handleAdd() {
    if (!newTitle.trim()) return;
    await addTask(newTitle.trim(), newDue || undefined);
    setNewTitle("");
    setNewDue("");
    setAdding(false);
  }

  if (!loaded) {
    return <p className="text-xs text-slate-500 py-4">Loading tasks…</p>;
  }

  const pending = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);

  return (
    <div className="space-y-4">
      {/* Add task */}
      {adding ? (
        <div className="rounded-xl border border-white/5 p-4 space-y-3" style={{ background: "#131E2B" }}>
          <input
            autoFocus
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Task title…"
            className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-slate-600 border border-white/5 outline-none"
            style={{ background: "#1A2332" }}
          />
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={newDue}
              onChange={(e) => setNewDue(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg text-sm text-white border border-white/5 outline-none"
              style={{ background: "#1A2332", colorScheme: "dark" }}
            />
            <button
              onClick={() => setAdding(false)}
              className="text-xs text-slate-500 hover:text-white px-3 py-2 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="text-xs font-semibold px-3 py-2 rounded-lg transition-all hover:opacity-90"
              style={{ background: "#00D9C0", color: "#080F18" }}
            >
              Add
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 text-xs font-medium transition-colors"
          style={{ color: "#00D9C0" }}
        >
          <Plus size={14} strokeWidth={2.5} /> Add task
        </button>
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <div className="space-y-1.5">
          {pending.map((t) => (
            <div key={t.id} className="flex items-center gap-3 rounded-xl border border-white/5 px-3 py-2.5" style={{ background: "#131E2B" }}>
              <button onClick={() => toggleTask(t.id, true)} className="text-slate-600 hover:text-teal-400 transition-colors flex-shrink-0">
                <Square size={15} />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white leading-tight">{t.title}</p>
                {t.dueDate && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    Due {new Date(t.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                )}
              </div>
              <button onClick={() => removeTask(t.id)} className="text-slate-700 hover:text-red-400 transition-colors flex-shrink-0">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Completed */}
      {done.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-slate-600 uppercase tracking-widest">Completed</p>
          {done.map((t) => (
            <div key={t.id} className="flex items-center gap-3 rounded-xl border border-white/5 px-3 py-2.5 opacity-50" style={{ background: "#131E2B" }}>
              <button onClick={() => toggleTask(t.id, false)} className="text-teal-400 flex-shrink-0">
                <CheckSquare size={15} />
              </button>
              <p className="flex-1 text-sm text-slate-500 line-through">{t.title}</p>
              <button onClick={() => removeTask(t.id)} className="text-slate-700 hover:text-red-400 transition-colors flex-shrink-0">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {tasks.length === 0 && !adding && (
        <p className="text-xs text-slate-600 text-center py-4">No tasks yet. Add one above.</p>
      )}
    </div>
  );
}
