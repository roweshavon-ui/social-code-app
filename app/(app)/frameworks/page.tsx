"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Search, Zap, Brain, BookOpen, AlertCircle } from "lucide-react";
import { FRAMEWORKS, CLUSTERS, CLUSTER_COLORS, type Framework } from "../../lib/frameworks";

const BRAND = {
  teal: "#00D9C0",
  coral: "#FF6B6B",
  navy: "#1A2332",
  dark: "#0D1825",
  darker: "#080F18",
};

function GreenYellowRedBadge({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const isGreen = line.startsWith("GREEN");
        const isYellow = line.startsWith("YELLOW");
        const isRed = line.startsWith("RED");
        if (isGreen || isYellow || isRed) {
          const color = isGreen ? "#00D9C0" : isYellow ? "#FFB347" : "#FF6B6B";
          const label = isGreen ? "GREEN" : isYellow ? "YELLOW" : "RED";
          const rest = line.slice(label.length + 2);
          return (
            <div key={i} className="flex items-start gap-2">
              <span
                className="text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5"
                style={{ background: `${color}20`, color }}
              >
                {label}
              </span>
              <span className="text-xs text-slate-400 leading-relaxed">{rest}</span>
            </div>
          );
        }
        if (line.trim() === "") return null;
        return (
          <p key={i} className="text-xs text-slate-400 leading-relaxed">{line}</p>
        );
      })}
    </div>
  );
}

function StepBlock({ title, body }: { title: string; body: string }) {
  const hasGYR = body.includes("GREEN:") || body.includes("YELLOW:") || body.includes("RED:");
  return (
    <div
      className="rounded-lg p-3.5"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <p className="text-xs font-bold text-white mb-2">{title}</p>
      {hasGYR ? (
        <GreenYellowRedBadge text={body} />
      ) : (
        <div className="space-y-1">
          {body.split("\n").map((line, i) =>
            line.trim() ? (
              <p key={i} className="text-xs text-slate-400 leading-relaxed">{line}</p>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}

function FrameworkCard({ fw, accent }: { fw: Framework; accent: string }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"steps" | "science" | "jungian" | "personal">("steps");

  return (
    <div
      className="rounded-xl border transition-all duration-200"
      style={{
        background: open ? "#131E2B" : "#0F1A28",
        borderColor: open ? `${accent}30` : "rgba(255,255,255,0.06)",
      }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1">
            <span className="text-base font-black text-white tracking-tight">{fw.name}</span>
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
          {open ? (
            <ChevronUp size={16} className="text-slate-500" />
          ) : (
            <ChevronDown size={16} className="text-slate-500" />
          )}
        </div>
      </button>

      {/* Expanded */}
      {open && (
        <div className="px-5 pb-5">
          {/* Key point callout */}
          <div
            className="flex items-start gap-2.5 rounded-lg p-3 mb-4"
            style={{ background: `${accent}10`, border: `1px solid ${accent}25` }}
          >
            <Zap size={13} className="flex-shrink-0 mt-0.5" style={{ color: accent }} />
            <p className="text-xs font-semibold leading-relaxed" style={{ color: accent }}>
              {fw.keyPoint}
            </p>
          </div>

          {/* System note */}
          {fw.systemNote && (
            <div
              className="flex items-start gap-2.5 rounded-lg p-3 mb-4"
              style={{ background: "rgba(255,179,71,0.06)", border: "1px solid rgba(255,179,71,0.2)" }}
            >
              <AlertCircle size={13} className="flex-shrink-0 mt-0.5 text-amber-400" />
              <p className="text-xs text-amber-400/80 leading-relaxed">{fw.systemNote}</p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 mb-4 flex-wrap">
            {(["steps", "science", "jungian", "personal"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                style={
                  tab === t
                    ? { background: `${accent}20`, color: accent }
                    : { background: "rgba(255,255,255,0.04)", color: "#64748b" }
                }
              >
                {t === "steps" ? "How to Use" : t === "science" ? "Why It Works" : t === "jungian" ? "Jungian" : "Shavi's Story"}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {tab === "steps" && (
            <div className="space-y-2">
              {fw.steps.map((step, i) => (
                <StepBlock key={i} title={step.title} body={step.body} />
              ))}
            </div>
          )}

          {tab === "science" && (
            <div
              className="rounded-lg p-4"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Brain size={13} style={{ color: accent }} />
                <span className="text-xs font-bold text-slate-300">Behavioral Science</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{fw.science}</p>
            </div>
          )}

          {tab === "jungian" && (
            <div
              className="rounded-lg p-4"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={13} style={{ color: accent }} />
                <span className="text-xs font-bold text-slate-300">Jungian Grounding</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{fw.jungian}</p>
            </div>
          )}

          {tab === "personal" && (
            <div
              className="rounded-lg p-4"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-slate-300">Personal Grounding</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed italic">{fw.personal}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ClusterSection({ cluster, frameworks }: { cluster: string; frameworks: Framework[] }) {
  const colors = CLUSTER_COLORS[cluster] ?? { accent: "#00D9C0", bg: "rgba(0,217,192,0.06)" };
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="h-px flex-1"
          style={{ background: `linear-gradient(to right, ${colors.accent}40, transparent)` }}
        />
        <span
          className="text-xs font-black tracking-widest px-3 py-1 rounded-full"
          style={{ background: colors.bg, color: colors.accent, border: `1px solid ${colors.accent}25` }}
        >
          {cluster}
        </span>
        <div
          className="h-px flex-1"
          style={{ background: `linear-gradient(to left, ${colors.accent}40, transparent)` }}
        />
      </div>
      <div className="space-y-2">
        {frameworks.map((fw) => (
          <FrameworkCard key={fw.name} fw={fw} accent={colors.accent} />
        ))}
      </div>
    </div>
  );
}

export default function FrameworksPage() {
  const [search, setSearch] = useState("");
  const [clusterFilter, setClusterFilter] = useState<string>("All");

  const filtered = FRAMEWORKS.filter((fw) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      fw.name.toLowerCase().includes(q) ||
      fw.subtitle.toLowerCase().includes(q) ||
      fw.situation.toLowerCase().includes(q) ||
      fw.keyPoint.toLowerCase().includes(q) ||
      fw.steps.some((s) => s.title.toLowerCase().includes(q) || s.body.toLowerCase().includes(q));
    const matchesCluster = clusterFilter === "All" || fw.cluster === clusterFilter;
    return matchesSearch && matchesCluster;
  });

  const grouped = CLUSTERS.reduce<Record<string, Framework[]>>((acc, cluster) => {
    const fws = filtered.filter((fw) => fw.cluster === cluster);
    if (fws.length > 0) acc[cluster] = fws;
    return acc;
  }, {});

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: BRAND.dark }}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-black text-white tracking-tight">Framework Library</h1>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(0,217,192,0.1)", color: "#00D9C0" }}
          >
            {FRAMEWORKS.length} frameworks
          </span>
        </div>
        <p className="text-sm text-slate-500">
          Every framework grounded in Jungian psychology, behavioral science, and 10,000+ real interactions.
        </p>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search frameworks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm text-white placeholder-slate-500 outline-none focus:ring-1"
            style={{
              background: "#131E2B",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["All", ...CLUSTERS].map((c) => {
            const colors = c === "All"
              ? { accent: "#64748b", bg: "rgba(100,116,139,0.1)" }
              : CLUSTER_COLORS[c] ?? { accent: "#00D9C0", bg: "rgba(0,217,192,0.06)" };
            const active = clusterFilter === c;
            return (
              <button
                key={c}
                onClick={() => setClusterFilter(c)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
                style={
                  active
                    ? { background: colors.bg, color: colors.accent, border: `1px solid ${colors.accent}40` }
                    : { background: "rgba(255,255,255,0.03)", color: "#475569", border: "1px solid rgba(255,255,255,0.06)" }
                }
              >
                {c === "All" ? "All Clusters" : c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-slate-500 text-sm">No frameworks match your search.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([cluster, fws]) => (
          <ClusterSection key={cluster} cluster={cluster} frameworks={fws} />
        ))
      )}
    </div>
  );
}
