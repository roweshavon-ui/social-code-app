"use client";

import { useEffect, useState } from "react";
import { usePortalClient } from "../../hooks/usePortalClient";
import PortalNav from "../../components/portal/PortalNav";
import Link from "next/link";
import { CheckSquare, Calendar, BookOpen, PhoneCall } from "lucide-react";
import { TYPE_PROFILES, TYPE_ACRONYMS } from "../../lib/mbtiData";

const TYPE_COLORS: Record<string, string> = {
  INTJ:"#00D9C0",INTP:"#00D9C0",ENTJ:"#4DE8D4",ENTP:"#4DE8D4",
  INFJ:"#FF6B6B",INFP:"#FF6B6B",ENFJ:"#FF8C8C",ENFP:"#FF8C8C",
  ISTJ:"#00A896",ISFJ:"#00A896",ESTJ:"#00D9C0",ESFJ:"#00D9C0",
  ISTP:"#FF6B6B",ISFP:"#FF6B6B",ESTP:"#4DE8D4",ESFP:"#4DE8D4",
};

type Task = { id: string; title: string; completed: boolean; due_date: string | null };
type Session = { id: string; date: string; duration: number; notes: string; rating: number };

function ProfileSection({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-5 border border-white/5" style={{ background: "#131E2B" }}>
      <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color }}>{title}</h3>
      {children}
    </div>
  );
}

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
  const profile = TYPE_PROFILES[client.jungianType];
  const acronym = TYPE_ACRONYMS[client.jungianType];
  const pending = tasks.filter((t) => !t.completed);
  const lastSession = sessions[0];

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

        {/* Quick links grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
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

        {/* Last session */}
        {lastSession && (
          <div
            className="rounded-xl p-4 border mb-8 flex items-center gap-3"
            style={{ background: "#131E2B", borderColor: "rgba(255,255,255,0.05)" }}
          >
            <Calendar size={16} className="text-slate-500 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Last session</p>
              <p className="text-sm font-medium text-white">
                {new Date(lastSession.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                {lastSession.duration ? ` · ${lastSession.duration} min` : ""}
                {lastSession.rating ? ` · ${lastSession.rating}/5 ⭐` : ""}
              </p>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Your Type Results</p>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
        </div>

        {/* Type header */}
        {profile && (
          <div
            className="rounded-2xl p-6 border mb-5"
            style={{ background: "#131E2B", borderColor: `${color}20` }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-black flex-shrink-0"
                style={{ background: `${color}15`, color }}
              >
                {client.jungianType.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl font-black" style={{ color }}>{client.jungianType}</span>
                  <span className="text-sm text-slate-400 font-medium">{profile.nickname}</span>
                </div>
                {acronym && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {acronym.map((word) => (
                      <span
                        key={word}
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: `${color}12`, color }}
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-sm text-slate-400 leading-relaxed">{profile.tagline}</p>
              </div>
            </div>
          </div>
        )}

        {profile && (
          <div className="space-y-4">
            {/* Strengths */}
            <ProfileSection title="Your Strengths" color="#00D9C0">
              <ul className="space-y-2">
                {profile.strengths.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-xs mt-0.5 flex-shrink-0" style={{ color: "#00D9C0" }}>✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </ProfileSection>

            {/* Blind Spots */}
            <ProfileSection title="Blind Spots to Watch" color="#FF6B6B">
              <p className="text-xs text-slate-500 mb-3">These aren&apos;t flaws — they&apos;re patterns. Knowing them is how you start beating them.</p>
              <ul className="space-y-2">
                {profile.blindSpots.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-xs mt-0.5 flex-shrink-0" style={{ color: "#FF6B6B" }}>▸</span>
                    {b}
                  </li>
                ))}
              </ul>
            </ProfileSection>

            {/* Energy Pattern */}
            <ProfileSection title="Your Energy Pattern" color={color}>
              <p className="text-sm text-slate-300 leading-relaxed">{profile.energyPattern}</p>
            </ProfileSection>

            {/* Social Style */}
            <ProfileSection title="Your Social Style" color={color}>
              <p className="text-sm text-slate-300 leading-relaxed">{profile.socialStyle}</p>
            </ProfileSection>

            {/* Careers */}
            <ProfileSection title="Career Paths That Fit Your Wiring" color="#4DE8D4">
              <p className="text-xs text-slate-500 mb-3">These roles tend to align with how your brain naturally works.</p>
              <div className="flex flex-wrap gap-2">
                {profile.careers.map((c) => (
                  <span
                    key={c}
                    className="text-xs px-3 py-1.5 rounded-full font-medium"
                    style={{ background: "rgba(77,232,212,0.08)", color: "#4DE8D4" }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </ProfileSection>

            {/* Simulator scenarios */}
            <ProfileSection title="Scenarios to Practice in the Simulator" color="#FF6B6B">
              <p className="text-xs text-slate-500 mb-3">
                These are the specific situations your type tends to struggle with most. Run these in the{" "}
                <a href="/practice" target="_blank" className="underline" style={{ color: "#FF6B6B" }}>
                  Social Simulator
                </a>{" "}
                to build the reps.
              </p>
              <ul className="space-y-2">
                {profile.practiceScenarios.map((s, i) => (
                  <li key={s} className="flex items-center gap-3">
                    <span
                      className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(255,107,107,0.12)", color: "#FF6B6B" }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm text-slate-300">{s}</span>
                  </li>
                ))}
              </ul>
            </ProfileSection>
          </div>
        )}
      </main>
    </div>
  );
}
