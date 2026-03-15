"use client";

import { usePortalClient } from "../../hooks/usePortalClient";
import PortalShell from "../../components/portal/PortalShell";
import { ExternalLink } from "lucide-react";

const FREE_RESOURCES = [
  {
    title: "Fearless Approach System",
    description: "The step-by-step system for approaching anyone without freezing up. Includes SPARK and the 3-Second Social Scan.",
    url: "https://app.joinsocialcode.com/Fearless%20Approach%20System%20full.pdf",
    tag: "Free",
    tagColor: "#00D9C0",
  },
  {
    title: "TALK Check",
    description: "Tone · Attention · Language · Kinetics. The delivery layer — how you say it matters as much as what you say.",
    url: "https://app.joinsocialcode.com/TALK%20Check%20full.pdf",
    tag: "Free",
    tagColor: "#00D9C0",
  },
];

const PAID_RESOURCES = [
  {
    title: "Stop Replaying — E-Book + 30-Day Workbook",
    description: "End the 2 AM overthink loop. The full system for breaking the replay pattern for good.",
    url: "https://app.joinsocialcode.com/Stop%20Replaying%20E-Book.pdf",
    tag: "Included",
    tagColor: "#00D9C0",
  },
];

const LINKS = [
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

function ResourceCard({
  title, description, url, tag, tagColor,
}: {
  title: string; description: string; url: string; tag: string; tagColor: string;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-4 p-5 rounded-xl border border-white/5 hover:border-white/10 transition-all group"
      style={{ background: "#131E2B" }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <p className="text-sm font-semibold text-white group-hover:text-teal-300 transition-colors">
            {title}
          </p>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
            style={{ background: `${tagColor}15`, color: tagColor }}
          >
            {tag}
          </span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>
      <ExternalLink
        size={14}
        className="flex-shrink-0 mt-0.5 text-slate-600 group-hover:text-teal-400 transition-colors"
      />
    </a>
  );
}

export default function PortalResourcesPage() {
  const { client, loading } = usePortalClient();

  if (loading || !client) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0D1825" }}>
        <div className="w-5 h-5 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <PortalShell clientName={client.name}>
      <div className="p-4 md:p-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white tracking-tight mb-1">Resources</h1>
          <p className="text-sm text-slate-500">Your frameworks, tools, and reading.</p>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
              Free Frameworks
            </p>
            <div className="space-y-2">
              {FREE_RESOURCES.map((r) => (
                <ResourceCard key={r.title} {...r} />
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
              Included with Coaching
            </p>
            <div className="space-y-2">
              {PAID_RESOURCES.map((r) => (
                <ResourceCard key={r.title} {...r} />
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
              Practice Tools
            </p>
            <div className="space-y-2">
              {LINKS.map((r) => (
                <ResourceCard key={r.title} {...r} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
