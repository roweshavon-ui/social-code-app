"use client";

import { useState, useEffect, useCallback } from "react";

export type PipelineStage = "lead" | "prospect" | "active" | "completed";

export type Client = {
  id: string;
  name: string;
  email: string;
  jungianType: string;
  goal: string;
  status: "active" | "inactive";
  notes: string;
  observations: string;
  socialPatterns: string;
  createdAt: string;
  pipelineStage: PipelineStage;
  portalAccess?: boolean;
};

type RawClient = {
  id: string;
  name: string;
  email: string;
  jungian_type: string;
  goal: string;
  status: "active" | "inactive";
  notes: string;
  observations: string;
  social_patterns: string;
  created_at: string;
  pipeline_stage: PipelineStage;
  portal_access: boolean;
};

function toClient(raw: RawClient): Client {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    jungianType: raw.jungian_type,
    goal: raw.goal,
    status: raw.status,
    notes: raw.notes,
    observations: raw.observations ?? "",
    socialPatterns: raw.social_patterns ?? "",
    createdAt: raw.created_at,
    pipelineStage: raw.pipeline_stage ?? "lead",
    portalAccess: raw.portal_access ?? false,
  };
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loaded, setLoaded] = useState(false);

  const fetchClients = useCallback(async () => {
    const res = await fetch("/api/clients");
    if (!res.ok) return;
    const data: RawClient[] = await res.json();
    setClients(data.map(toClient));
    setLoaded(true);
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  async function addClient(client: Omit<Client, "id" | "createdAt">) {
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(client),
    });
    if (!res.ok) return;
    const raw: RawClient = await res.json();
    setClients((prev) => [toClient(raw), ...prev]);
    return toClient(raw);
  }

  async function removeClient(id: string) {
    const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setClients((prev) => prev.filter((c) => c.id !== id));
  }

  async function updateClient(id: string, updates: Partial<Client>) {
    const current = clients.find((c) => c.id === id);
    if (!current) return;
    const merged = { ...current, ...updates };
    const res = await fetch(`/api/clients/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(merged),
    });
    if (!res.ok) return;
    const raw: RawClient = await res.json();
    setClients((prev) => prev.map((c) => (c.id === id ? toClient(raw) : c)));
  }

  return { clients, loaded, addClient, removeClient, updateClient };
}
