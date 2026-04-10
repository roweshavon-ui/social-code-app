"use client";

import { useState } from "react";
import { usePortalClient } from "../../hooks/usePortalClient";
import PortalShell from "../../components/portal/PortalShell";
import { ExternalLink, ChevronDown, ChevronUp, Zap, Brain, BookOpen, AlertCircle } from "lucide-react";
import { FRAMEWORKS, CLUSTERS, CLUSTER_COLORS, type Framework } from "../../lib/frameworks";

const PDF_RESOURCES = [
  {
    title: "Fearless Approach System — Full PDF",
    description: "The complete system: SPARK, 3-Second Social Scan, and step-by-step approach anxiety elimination.",
    url: "https://app.joinsocialcode.com/Fearless%20Approach%20System%20full.pdf",
    tag: "Free",
    tagColor: "#00D9C0",
  },
  {
    title: "TALK Check — Full PDF",
    description: "Tone · Attention · Language · Kinetics. The delivery layer — how you say it matters as much as what you say.",
    url: "https://app.joinsocialcode.com/TALK%20Check%20full.pdf",
    tag: "Free",
    tagColor: "#00D9C0",
  },
  {
    title: "Stop Replaying — E-Book + 30-Day Workbook",
    description: "End the 2AM overthink loop. The full system for breaking the replay pattern for good.",
    url: "https://app.joinsocialcode.com/Stop%20Replaying%20E-Book.pdf",
    tag: "Included",
    tagColor: "#00D9C0",
  },
];

const TOOL_LINKS = [
  {
    title: "Social Code Blog",
    description: "Articles, breakdowns, and frameworks to keep building between sessions.",
    url: "https://app.joinsocialcode.com/blog",
    tag: "Free",
    tagColor: "#4DE8D4",
  },
  {
    title: "Social Simulator",
    description: "Practice real conversations with AI. Pick a scenario, run it, get coaching feedback tailored to your type.",
    url: "https://app.joinsocialcode.com/practice",
    tag: "Free",
    tagColor: "#4DE8D4",
  },
];

function PdfCard({ title, description, url, tag, tagColor }: {
  title: string; description: string; url: string; tag: string; tagColor: string;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-4 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all group"
      style={{ background: "#131E2B" }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <p className="text-sm font-semibold text-white group-hover:text-teal-300 transition-colors">{title}</p>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
            style={{ background: `${tagColor}15`, color: tagColor }}
          >
            {tag}
          </span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>
      <ExternalLink size={14} className="flex-shrink-0 mt-0.5 text-slate-600 group-hover:text-teal-400 transition-colors" />
    </a>
  );
}

function StepBlock({ title, body }: { title: string; body: string }) {
  const lines = body.split("\n");
  const hasGYR = lines.some((l) => l.startsWith("GREEN:") || l.startsWith("YELLOW:") || l.startsWith("RED:"));
  return (
    <div
      className="rounded-lg p-3"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
    >
      <p className="text-xs font-bold text-white mb-1.5">{title}</p>
      <div className="space-y-1">
        {lines.map((line, i) => {
          if (!line.trim()) return null;
          const isGreen = line.startsWith("GREEN:");
          const isYellow = line.startsWith("YELLOW:");
          const isRed = line.startsWith("RED:");
          if (isGreen || isYellow || isRed) {
            const color = isGreen ? "#00D9C0" : isYellow ? "#FFB347" : "#FF6B6B";
            const label = isGreen ? "GREEN" : isYellow ? "YELLOW" : "RED";
            const rest = line.slice(label.length + 1);
            return (
              <div key={i} className="flex items-start gap-2">
                <span className="text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5" style={{ background: `${color}20`, color }}>
                  {label}
                </span>
                <span className="text-xs text-slate-400 leading-relaxed">{rest}</span>
              </div>
            );
          }
          return <p key={i} className="text-xs text-slate-400 leading-relaxed">{line}</p>;
        })}
      </div>
    </div>
  );
}

function FrameworkCard({ fw, accent }: { fw: Framework; accent: string }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"steps" | "science" | "jungian">("steps");

  return (
    <div
      className="rounded-xl border transition-all duration-200"
      style={{
        background: open ? "#131E2B" : "#0F1A28",
        borderColor: open ? `${accent}30` : "rgba(255,255,255,0.05)",
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start justify-between gap-3 px-4 py-3.5 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-sm font-bold text-white">{fw.name}</span>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ background: `${accent}15`, color: accent }}
            >
              {fw.subtitle}
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">{fw.situation}</p>
        </div>
        <div className="flex-shrink-0 mt-1">
          {open ? <ChevronUp size={15} className="text-slate-500" /> : <ChevronDown size={15} className="text-slate-500" />}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4">
          {/* Key point */}
          <div
            className="flex items-start gap-2 rounded-lg p-3 mb-3"
            style={{ background: `${accent}10`, border: `1px solid ${accent}25` }}
          >
            <Zap size={12} className="flex-shrink-0 mt-0.5" style={{ color: accent }} />
            <p className="text-xs font-semibold leading-relaxed" style={{ color: accent }}>
              {fw.keyPoint}
            </p>
          </div>

          {fw.systemNote && (
            <div
              className="flex items-start gap-2 rounded-lg p-3 mb-3"
              style={{ background: "rgba(255,179,71,0.06)", border: "1px solid rgba(255,179,71,0.2)" }}
            >
              <AlertCircle size={12} className="flex-shrink-0 mt-0.5 text-amber-400" />
              <p className="text-xs text-amber-400/80 leading-relaxed">{fw.systemNote}</p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 mb-3 flex-wrap">
            {(["steps", "science", "jungian"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
                style={
                  tab === t
                    ? { background: `${accent}20`, color: accent }
                    : { background: "rgba(255,255,255,0.04)", color: "#64748b" }
                }
              >
                {t === "steps" ? "How to Use" : t === "science" ? "Why It Works" : "Jungian"}
              </button>
            ))}
          </div>

          {tab === "steps" && (
            <div className="space-y-2">
              {fw.steps.map((step, i) => <StepBlock key={i} title={step.title} body={step.body} />)}
            </div>
          )}
          {tab === "science" && (
            <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex items-center gap-1.5 mb-2">
                <Brain size={12} style={{ color: accent }} />
                <span className="text-xs font-bold text-slate-300">Behavioral Science</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{fw.science}</p>
            </div>
          )}
          {tab === "jungian" && (
            <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex items-center gap-1.5 mb-2">
                <BookOpen size={12} style={{ color: accent }} />
                <span className="text-xs font-bold text-slate-300">Jungian Grounding</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{fw.jungian}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PortalResourcesPage() {
  const { client, loading } = usePortalClient();
  const [activeCluster, setActiveCluster] = useState<string>("All");

  if (loading || !client) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0D1825" }}>
        <div className="w-5 h-5 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const visibleFrameworks = activeCluster === "All"
    ? FRAMEWORKS
    : FRAMEWORKS.filter((fw) => fw.cluster === activeCluster);

  return (
    <PortalShell clientName={client.name}>
      <div className="p-4 md:p-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white tracking-tight mb-1">Resources</h1>
          <p className="text-sm text-slate-500">Your frameworks, tools, and reading.</p>
        </div>

        {/* PDFs + links */}
        <div className="space-y-6 mb-10">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Downloads</p>
            <div className="space-y-2">
              {PDF_RESOURCES.map((r) => <PdfCard key={r.title} {...r} />)}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Practice Tools</p>
            <div className="space-y-2">
              {TOOL_LINKS.map((r) => <PdfCard key={r.title} {...r} />)}
            </div>
          </div>
        </div>

        {/* Framework library */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-black text-white tracking-tight mb-1">Framework Library</h2>
            <p className="text-xs text-slate-500">
              All 14 Social Code frameworks — tap any to see the full breakdown.
            </p>
          </div>

          {/* Cluster filter */}
          <div className="flex gap-2 flex-wrap mb-5">
            {["All", ...CLUSTERS].map((c) => {
              const colors = c === "All"
                ? { accent: "#64748b", bg: "rgba(100,116,139,0.1)" }
                : CLUSTER_COLORS[c] ?? { accent: "#00D9C0", bg: "rgba(0,217,192,0.06)" };
              const active = activeCluster === c;
              return (
                <button
                  key={c}
                  onClick={() => setActiveCluster(c)}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap"
                  style={
                    active
                      ? { background: colors.bg, color: colors.accent, border: `1px solid ${colors.accent}40` }
                      : { background: "rgba(255,255,255,0.03)", color: "#475569", border: "1px solid rgba(255,255,255,0.05)" }
                  }
                >
                  {c === "All" ? "All" : c}
                </button>
              );
            })}
          </div>

          <div className="space-y-2">
            {visibleFrameworks.map((fw) => {
              const colors = CLUSTER_COLORS[fw.cluster] ?? { accent: "#00D9C0" };
              return <FrameworkCard key={fw.name} fw={fw} accent={colors.accent} />;
            })}
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
