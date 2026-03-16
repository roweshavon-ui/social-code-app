"use client";

import { useRef, useState } from "react";
import { useClients } from "../../hooks/useClients";
import type { Client, PipelineStage } from "../../hooks/useClients";

const STAGES: { key: PipelineStage; label: string; color: string; bg: string }[] = [
  { key: "lead",      label: "Lead",      color: "#64748b", bg: "rgba(100,116,139,0.08)" },
  { key: "prospect",  label: "Prospect",  color: "#00D9C0", bg: "rgba(0,217,192,0.08)"  },
  { key: "active",    label: "Active",    color: "#FF6B6B", bg: "rgba(255,107,107,0.08)" },
  { key: "completed", label: "Completed", color: "#4DE8D4", bg: "rgba(77,232,212,0.08)" },
];

const TYPE_COLORS: Record<string, string> = {
  E: "#00D9C0", I: "#64748b",
  N: "#a78bfa", S: "#f59e0b",
  T: "#60a5fa", F: "#f472b6",
  J: "#34d399", P: "#fb923c",
};

function typeColor(type: string) {
  return TYPE_COLORS[type?.[0]] ?? "#64748b";
}

function ClientCard({
  client,
  onDragStart,
}: {
  client: Client;
  onDragStart: (id: string) => void;
}) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(client.id)}
      className="rounded-xl border border-white/5 p-4 hover:border-white/10 transition-all cursor-grab active:cursor-grabbing active:opacity-60 active:scale-95"
      style={{ background: "#131E2B" }}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white leading-tight truncate">{client.name}</p>
          <p className="text-xs text-slate-500 mt-0.5 truncate">{client.email}</p>
        </div>
        {client.jungianType && (
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-md shrink-0"
            style={{ color: typeColor(client.jungianType), background: `${typeColor(client.jungianType)}18` }}
          >
            {client.jungianType}
          </span>
        )}
      </div>
      {client.goal && (
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mt-2">{client.goal}</p>
      )}
    </div>
  );
}

function DropColumn({
  stage,
  clients,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStart,
}: {
  stage: typeof STAGES[number];
  clients: Client[];
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: () => void;
  onDragStart: (id: string) => void;
}) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className="flex flex-col min-h-40 rounded-xl transition-all"
      style={{
        outline: isDragOver ? `2px dashed ${stage.color}` : "2px dashed transparent",
        background: isDragOver ? `${stage.color}08` : "transparent",
      }}
    >
      {/* Column header */}
      <div
        className="flex items-center justify-between px-3 py-2 rounded-lg mb-3"
        style={{ background: stage.bg, border: `1px solid ${stage.color}22` }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: stage.color }} />
          <span className="text-xs font-semibold" style={{ color: stage.color }}>{stage.label}</span>
        </div>
        <span className="text-xs font-medium text-slate-500">{clients.length}</span>
      </div>

      {/* Cards */}
      <div className="space-y-2 flex-1 p-1">
        {clients.length === 0 ? (
          <div
            className="rounded-xl border border-dashed p-6 text-center transition-all"
            style={{ borderColor: isDragOver ? stage.color : `${stage.color}22` }}
          >
            <p className="text-xs" style={{ color: isDragOver ? stage.color : "#475569" }}>
              {isDragOver ? "Drop here" : "No clients"}
            </p>
          </div>
        ) : (
          clients.map((client) => (
            <ClientCard key={client.id} client={client} onDragStart={onDragStart} />
          ))
        )}
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const { clients, loaded, updateClient } = useClients();
  const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null);
  const draggingId = useRef<string | null>(null);

  async function handleDrop(stage: PipelineStage) {
    const id = draggingId.current;
    if (!id) return;
    const client = clients.find((c) => c.id === id);
    if (!client || client.pipelineStage === stage) return;
    await updateClient(id, { pipelineStage: stage });
    draggingId.current = null;
    setDragOverStage(null);
  }

  if (!loaded) return null;

  const grouped = STAGES.reduce<Record<PipelineStage, Client[]>>(
    (acc, s) => ({ ...acc, [s.key]: [] }),
    {} as Record<PipelineStage, Client[]>
  );
  for (const client of clients) {
    const stage = client.pipelineStage ?? "lead";
    grouped[stage].push(client);
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Pipeline</h1>
        <p className="mt-1 text-sm text-slate-500">{clients.length} client{clients.length !== 1 ? "s" : ""} total · drag cards to move</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAGES.map((stage) => (
          <DropColumn
            key={stage.key}
            stage={stage}
            clients={grouped[stage.key]}
            isDragOver={dragOverStage === stage.key}
            onDragOver={(e) => { e.preventDefault(); setDragOverStage(stage.key); }}
            onDragLeave={() => setDragOverStage(null)}
            onDrop={() => handleDrop(stage.key)}
            onDragStart={(id) => { draggingId.current = id; }}
          />
        ))}
      </div>
    </div>
  );
}
