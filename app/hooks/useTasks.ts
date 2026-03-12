"use client";

import { useState, useCallback } from "react";

export type Task = {
  id: string;
  clientId: string;
  title: string;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
};

type RawTask = {
  id: string;
  client_id: string;
  title: string;
  due_date: string | null;
  completed: boolean;
  created_at: string;
};

function toTask(raw: RawTask): Task {
  return {
    id: raw.id,
    clientId: raw.client_id,
    title: raw.title,
    dueDate: raw.due_date ?? null,
    completed: raw.completed,
    createdAt: raw.created_at,
  };
}

export function useTasks(clientId: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);

  const fetchTasks = useCallback(async () => {
    const res = await fetch(`/api/tasks?clientId=${clientId}`);
    if (!res.ok) return;
    const data: RawTask[] = await res.json();
    setTasks(data.map(toTask));
    setLoaded(true);
  }, [clientId]);

  async function addTask(title: string, dueDate?: string) {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, title, dueDate: dueDate ?? null }),
    });
    if (!res.ok) return null;
    const raw: RawTask = await res.json();
    const task = toTask(raw);
    setTasks((prev) => [task, ...prev]);
    return task;
  }

  async function toggleTask(id: string, completed: boolean) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    });
    if (!res.ok) return;
    const raw: RawTask = await res.json();
    setTasks((prev) => prev.map((t) => (t.id === id ? toTask(raw) : t)));
  }

  async function removeTask(id: string) {
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  return { tasks, loaded, fetchTasks, addTask, toggleTask, removeTask };
}
