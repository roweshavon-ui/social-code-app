"use client";

import { useEffect, useState } from "react";
import { Users, CalendarDays, BookOpen, TrendingUp, ArrowRight, Inbox } from "lucide-react";
import Link from "next/link";

const quickLinks = [
  { href: "/submissions", label: "View submissions", desc: "See who took the public assessment", color: "#00D9C0" },
  { href: "/clients", label: "Add a client", desc: "Start tracking a new client", color: "#FF6B6B" },
  { href: "/sessions", label: "Log a session", desc: "Record a coaching session", color: "#4DE8D4" },
  { href: "/simulator", label: "Run a simulation", desc: "Practice a social scenario with AI", color: "#FF8C8C" },
];

export default function Dashboard() {
  const [counts, setCounts] = useState({ clients: 0, sessions: 0, library: 0, active: 0, submissions: 0 });

  useEffect(() => {
    async function load() {
      const [clientsRes, sessionsRes, libraryRes, submissionsRes] = await Promise.all([
        fetch("/api/clients"),
        fetch("/api/sessions"),
        fetch("/api/library"),
        fetch("/api/assessments"),
      ]);
      const [clients, sessions, library, submissions] = await Promise.all([
        clientsRes.json(),
        sessionsRes.json(),
        libraryRes.json(),
        submissionsRes.json(),
      ]);
      const now = new Date();
      const sessionThisMonth = Array.isArray(sessions)
        ? sessions.filter((s: { date: string }) => {
            const d = new Date(s.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          }).length
        : 0;
      setCounts({
        clients: Array.isArray(clients) ? clients.length : 0,
        sessions: sessionThisMonth,
        library: Array.isArray(library) ? library.length : 0,
        active: Array.isArray(clients) ? clients.filter((c: { status: string }) => c.status === "active").length : 0,
        submissions: Array.isArray(submissions) ? submissions.length : 0,
      });
    }
    load();
  }, []);

  const stats = [
    { label: "Submissions", value: counts.submissions, icon: Inbox, color: "#00D9C0", bg: "rgba(0,217,192,0.1)" },
    { label: "Total Clients", value: counts.clients, icon: Users, color: "#FF6B6B", bg: "rgba(255,107,107,0.1)" },
    { label: "Sessions This Month", value: counts.sessions, icon: CalendarDays, color: "#4DE8D4", bg: "rgba(77,232,212,0.1)" },
    { label: "Active Clients", value: counts.active, icon: TrendingUp, color: "#FF8C8C", bg: "rgba(255,140,140,0.1)" },
  ];

  return (
    <div className="p-8 max-w-5xl">
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

      <div className="mb-8">
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

      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Recent Activity</h2>
        <div className="rounded-xl border border-white/5 p-12 flex flex-col items-center justify-center text-center" style={{ background: "#131E2B" }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(0,217,192,0.08)", border: "1px dashed rgba(0,217,192,0.2)" }}>
            <TrendingUp size={20} style={{ color: "#00D9C0" }} strokeWidth={1.5} />
          </div>
          <p className="text-sm text-slate-500">No activity yet.</p>
          <p className="text-xs text-slate-600 mt-1">Add a client to get started.</p>
        </div>
      </div>
    </div>
  );
}
