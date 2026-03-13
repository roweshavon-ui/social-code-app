"use client";

import { useEffect, useState } from "react";
import { usePortalClient } from "../../hooks/usePortalClient";
import PortalNav from "../../components/portal/PortalNav";
import Link from "next/link";
import { CheckSquare, Calendar, BookOpen, PhoneCall } from "lucide-react";

const TYPE_COLORS: Record<string, string> = {
  INTJ:"#00D9C0",INTP:"#00D9C0",ENTJ:"#4DE8D4",ENTP:"#4DE8D4",
  INFJ:"#FF6B6B",INFP:"#FF6B6B",ENFJ:"#FF8C8C",ENFP:"#FF8C8C",
  ISTJ:"#00A896",ISFJ:"#00A896",ESTJ:"#00D9C0",ESFJ:"#00D9C0",
  ISTP:"#FF6B6B",ISFP:"#FF6B6B",ESTP:"#4DE8D4",ESFP:"#4DE8D4",
};

type Task = { id: string; title: string; completed: boolean; due_date: string | null };
type Session = { id: string; date: string; duration: number; notes: string; rating: number };

export default function PortalHome() {
  const { client, loading } = usePortalClient();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    if (!client) return;
    fetch("/api/portal/tasks").then((r) => r.json()).then((d) => Array.isArray(d) && setTasks(d));
    fetch("/api/portal/sessions").then((r) => r.json()).then((d) => Array.isArray(d) && setSessions(d));
  }, [client]);

  if (loading || !client) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0D1825" }}>
        <div className="w-5 h-5 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const color = TYPE_COLORS[client.jungianType] ?? "#00D9C0";
  const pending = tasks.filter((t) => !t.completed);
  const lastName = sessions[0];

  const quickLinks = [
    { href: "/portal/tasks", label: "My Tasks", icon: CheckSquare, count: pending.length, countLabel: "pending" },
    { href: "/portal/sessions", label: "Sessions", icon: Calendar, count: sessions.length, countLabel: "total" },
    { href: "/portal/resources", label: "Resources", icon: BookOpen },
    { href: "/portal/book", label: "Book a Call", icon: PhoneCall },
  ];

  return (
    <div className="flex min-h-screen" style={{ background: "#0D1825" }}>
      <PortalNav clientName={client.name} />

      <main className="flex-1 ml-56 p-8 max-w-3xl">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white tracking-tight mb-1">
            Hey {client.name.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-slate-500">Here&apos;s your coaching overview.</p>
        </div>

        {/* Type card */}
        <div
          className="rounded-2xl p-6 border mb-6"
          style={{ background: "#131E2B", borderColor: `${color}20` }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black flex-shrink-0"
              style={{ background: `${color}15`, color }}
            >
              {client.jungianType.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-black" style={{ color }}>{client.jungianType}</span>
                <span className="text-xs text-slate-500">Your Jungian Type</span>
              </div>
              {client.goal && (
                <p className="text-sm text-slate-400 leading-relaxed">
                  <span className="text-slate-600 text-xs uppercase tracking-wider font-medium">Goal</span>
                  <br />
                  {client.goal}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Last session callout */}
        {lastName && (
          <div
            className="rounded-xl p-4 border mb-6 flex items-center gap-3"
            style={{ background: "#131E2B", borderColor: "rgba(255,255,255,0.05)" }}
          >
            <Calendar size={16} className="text-slate-500 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Last session</p>
              <p className="text-sm font-medium text-white">
                {new Date(lastName.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                {lastName.duration ? ` · ${lastName.duration} min` : ""}
                {lastName.rating ? ` · ${lastName.rating}/5 ⭐` : ""}
              </p>
            </div>
          </div>
        )}

        {/* Quick links grid */}
        <div className="grid grid-cols-2 gap-3">
          {quickLinks.map(({ href, label, icon: Icon, count, countLabel }) => (
            <Link
              key={href}
              href={href}
              className="rounded-xl p-5 border border-white/5 hover:border-white/10 transition-all group"
              style={{ background: "#131E2B" }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(0,217,192,0.08)" }}
                >
                  <Icon size={16} style={{ color: "#00D9C0" }} strokeWidth={1.8} />
                </div>
                {count !== undefined && (
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(0,217,192,0.1)", color: "#00D9C0" }}
                  >
                    {count} {countLabel}
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-white group-hover:text-teal-300 transition-colors">
                {label}
              </p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
