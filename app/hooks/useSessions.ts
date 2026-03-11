"use client";

import { useState, useEffect, useCallback } from "react";

export type Session = {
  id: string;
  clientName: string;
  date: string;
  duration: string;
  notes: string;
  actionItems: string;
  rating: number;
};

type RawSession = {
  id: string;
  client_name: string;
  date: string;
  duration: string;
  notes: string;
  action_items: string;
  rating: number;
};

function toSession(raw: RawSession): Session {
  return {
    id: raw.id,
    clientName: raw.client_name,
    date: raw.date,
    duration: raw.duration,
    notes: raw.notes,
    actionItems: raw.action_items,
    rating: raw.rating,
  };
}

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loaded, setLoaded] = useState(false);

  const fetchSessions = useCallback(async () => {
    const res = await fetch("/api/sessions");
    if (!res.ok) return;
    const data: RawSession[] = await res.json();
    setSessions(data.map(toSession));
    setLoaded(true);
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  async function addSession(session: Omit<Session, "id">) {
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(session),
    });
    if (!res.ok) return;
    const raw: RawSession = await res.json();
    setSessions((prev) => [toSession(raw), ...prev]);
    return toSession(raw);
  }

  async function removeSession(id: string) {
    const res = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  return { sessions, loaded, addSession, removeSession };
}
