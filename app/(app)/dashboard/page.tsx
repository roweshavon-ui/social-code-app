"use client";

import { useEffect, useState } from "react";
import { Users, CalendarDays, TrendingUp, ArrowRight, Inbox, Kanban, CheckSquare } from "lucide-react";
import Link from "next/link";
import type { PipelineStage } from "../../hooks/useClients";

const PIPELINE_STAGES: { key: PipelineStage; label: string; color: string }[] = [
  { key: "lead",      label: "Lead",      color: "#64748b" },
  { key: "prospect",  label: "Prospect",  color: "#00D9C0" },
  { key: "active",    label: "Active",    color: "#FF6B6B" },
  { key: "completed", label: "Completed", color: "#4DE8D4" },
];

const quickLinks = [
  { href: "/submissions", label: "View submissions", desc: "See who took the public assessment", color: "#00D9C0" },
  { href: "/clients", label: "Add a client", desc: "Start tracking a new client", color: "#FF6B6B" },
  { href: "/pipeline", label: "View pipeline", desc: "See clients by stage", color: "#4DE8D4" },
  { href: "/sessions", label: "Log a session", desc: "Record a coaching session", color: "#FF8C8C" },
];

type PipelineCounts = Record<PipelineStage, number>;

export default function Dashboard() {
  const [counts, setCounts] = useState({ clients: 0, sessions: 0, active: 0, submissions: 0, tasksDue: 0 });
  const [pipeline, setPipeline] = useState<PipelineCounts>({ lead: 0, prospect: 0, active: 0, completed: 0 });

  useEffect(() => {
    async function load() {
      const [clientsRes, sessionsRes, submissionsRes, tasksRes] = await Promise.all([
        fetch("/api/clients"),
        fetch("/api/sessions"),
        fetch("/api/assessments"),
        fetch("/api/tasks?today=1"),
      ]);
      const [clients, sessions, submissions, tasks] = await Promise.all([
        clientsRes.json(),
        sessionsRes.json(),
        submissionsRes.json(),
        tasksRes.ok ? tasksRes.json() : [],
      ]);

      const now = new Date();
      const sessionThisMonth = Array.isArray(sessions)
        ? sessions.filter((s: { date: string }) => {
            const d = new Date(s.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          }).length
        : 0;

      const pipelineCounts: PipelineCounts = { lead: 0, prospect: 0, active: 0, completed: 0 };
      if (Array.isArray(clients)) {
        for (const c of clients) {
          const stage = (c.pipeline_stage ?? "lead") as PipelineStage;
          pipelineCounts[stage] = (pipelineCounts[stage] ?? 0) + 1;
        }
      }

      setCounts({
        clients: Array.isArray(clients) ? clients.length : 0,
        sessions: sessionThisMonth,
        active: Array.isArray(clients) ? clients.filter((c: { pipeline_stage: string }) => c.pipeline_stage === "active").length : 0,
        submissions: Array.isArray(submissions) ? submissions.length : 0,
        tasksDue: Array.isArray(tasks) ? tasks.length : 0,
      });
      setPipeline(pipelineCounts);
    }
    load();
  }, []);

  const stats = [
    { label: "Submissions", value: counts.submissions, icon: Inbox, color: "#00D9C0", bg: "rgba(0,217,192,0.1)" },
    { label: "Total Clients", value: counts.clients, icon: Users, color: "#FF6B6B", bg: "rgba(255,107,107,0.1)" },
    { label: "Pipeline: Active", value: counts.active, icon: Kanban, color: "#4DE8D4", bg: "rgba(77,232,212,0.1)" },
    { label: "Tasks Due Today", value: counts.tasksDue, icon: CheckSquare, color: "#FF8C8C", bg: "rgba(255,140,140,0.1)" },
  ];

  return (
    <div className="p-4 md:p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Welcome back. Here&apos;s your overview.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-xl p-5 border border-white/5" style={{ background: "#131E2B" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500">{label}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                <Icon size={14} style={{ color }} strokeWidth={2} />
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{value}</div>
          </div>
        ))}
      </div>

      {/* Pipeline summary */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Pipeline</h2>
          <Link href="/pipeline" className="text-xs font-medium transition-colors hover:opacity-80" style={{ color: "#00D9C0" }}>
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PIPELINE_STAGES.map(({ key, label, color }) => (
            <Link
              key={key}
              href="/pipeline"
              className="rounded-xl border border-white/5 p-4 hover:border-white/10 transition-all"
              style={{ background: "#131E2B" }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                <span className="text-xs font-semibold" style={{ color }}>{label}</span>
              </div>
              <div className="text-2xl font-bold text-white">{pipeline[key]}</div>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {quickLinks.map(({ href, label, desc, color }) => (
            <Link key={href} href={href} className="flex items-center justify-between p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all group" style={{ background: "#131E2B" }}>
              <div>
                <div className="text-sm font-semibold text-white">{label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
              </div>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" style={{ color }} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
