"use client";

import { useState, useEffect, useCallback } from "react";

export type Session = {
  id: string;
  clientId: string | null;
  clientName: string;
  date: string;
  duration: string;
  notes: string;
  actionItems: string;
  rating: number;
  sessionNumber: number;
  sessionType: string;
  clientEngagement: string;
  homeworkCompletion: string;
  homeworkAssigned: string;
  breakthroughMoment: string;
  coachObservations: string;
  frameworksUsed: string[];
};

type RawSession = {
  id: string;
  client_id: string | null;
  client_name: string;
  date: string;
  duration: string;
  notes: string;
  action_items: string;
  rating: number;
  session_number: number;
  session_type: string;
  client_engagement: string;
  homework_completion: string;
  homework_assigned: string;
  breakthrough_moment: string;
  coach_observations: string;
  frameworks_used: string[];
};

function toSession(raw: RawSession): Session {
  return {
    id: raw.id,
    clientId: raw.client_id ?? null,
    clientName: raw.client_name,
    date: raw.date,
    duration: raw.duration,
    notes: raw.notes,
    actionItems: raw.action_items,
    rating: raw.rating,
    sessionNumber: raw.session_number ?? 1,
    sessionType: raw.session_type ?? "ongoing",
    clientEngagement: raw.client_engagement ?? "open",
    homeworkCompletion: raw.homework_completion ?? "none",
    homeworkAssigned: raw.homework_assigned ?? "",
    breakthroughMoment: raw.breakthrough_moment ?? "",
    coachObservations: raw.coach_observations ?? "",
    frameworksUsed: raw.frameworks_used ?? [],
  };
}

export function useSessions(clientId?: string) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loaded, setLoaded] = useState(false);

  const fetchSessions = useCallback(async () => {
    const url = clientId ? `/api/sessions?clientId=${clientId}` : "/api/sessions";
    const res = await fetch(url);
    if (!res.ok) return;
    const data: RawSession[] = await res.json();
    setSessions(data.map(toSession));
    setLoaded(true);
  }, [clientId]);

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

  async function updateSession(id: string, updates: Partial<Omit<Session, "id">>) {
    const res = await fetch(`/api/sessions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) return;
    const raw: RawSession = await res.json();
    const updated = toSession(raw);
    setSessions((prev) => prev.map((s) => (s.id === id ? updated : s)));
    return updated;
  }

  return { sessions, loaded, fetchSessions, addSession, removeSession, updateSession };
}
