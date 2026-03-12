"use client";

import { useState } from "react";
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

function ClientCard({ client, onMove }: { client: Client; onMove: (id: string, stage: PipelineStage) => void }) {
  const [moving, setMoving] = useState(false);

  const otherStages = STAGES.filter((s) => s.key !== client.pipelineStage);

  return (
    <div
      className="rounded-xl border border-white/5 p-4 hover:border-white/10 transition-all"
      style={{ background: "#131E2B" }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="text-sm font-semibold text-white leading-tight">{client.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">{client.email}</p>
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
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">{client.goal}</p>
      )}
      <div className="flex items-center gap-2">
        {moving ? (
          <select
            autoFocus
            onChange={(e) => {
              onMove(client.id, e.target.value as PipelineStage);
              setMoving(false);
            }}
            onBlur={() => setMoving(false)}
            className="flex-1 px-2 py-1.5 rounded-lg text-xs text-white border border-white/10 outline-none"
            style={{ background: "#1A2332" }}
            defaultValue=""
          >
            <option value="" disabled>Move to…</option>
            {otherStages.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        ) : (
          <button
            onClick={() => setMoving(true)}
            className="text-xs text-slate-500 hover:text-white transition-colors"
          >
            Move →
          </button>
        )}
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const { clients, loaded, updateClient } = useClients();

  async function handleMove(id: string, stage: PipelineStage) {
    await updateClient(id, { pipelineStage: stage });
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
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Pipeline</h1>
        <p className="mt-1 text-sm text-slate-500">{clients.length} client{clients.length !== 1 ? "s" : ""} total</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAGES.map((stage) => {
          const stageClients = grouped[stage.key];
          return (
            <div key={stage.key}>
              {/* Column header */}
              <div
                className="flex items-center justify-between px-3 py-2 rounded-lg mb-3"
                style={{ background: stage.bg, border: `1px solid ${stage.color}22` }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: stage.color }} />
                  <span className="text-xs font-semibold" style={{ color: stage.color }}>{stage.label}</span>
                </div>
                <span className="text-xs font-medium text-slate-500">{stageClients.length}</span>
              </div>

              {/* Cards */}
              <div className="space-y-2">
                {stageClients.length === 0 ? (
                  <div
                    className="rounded-xl border border-dashed p-6 text-center"
                    style={{ borderColor: `${stage.color}22` }}
                  >
                    <p className="text-xs text-slate-600">No clients</p>
                  </div>
                ) : (
                  stageClients.map((client) => (
                    <ClientCard key={client.id} client={client} onMove={handleMove} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
