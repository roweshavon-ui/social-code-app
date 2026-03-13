"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";

type KitData =
  | { found: false }
  | {
      found: true;
      id: string;
      status: string;
      subscribedAt: string;
      tags: string[];
      sequences: { name: string; paused: boolean }[];
    };

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  active:     { label: "Active",       color: "#00D9C0", bg: "rgba(0,217,192,0.1)" },
  inactive:   { label: "Inactive",     color: "#64748b", bg: "rgba(100,116,139,0.1)" },
  cancelled:  { label: "Unsubscribed", color: "#FF6B6B", bg: "rgba(255,107,107,0.1)" },
  bounced:    { label: "Bounced",      color: "#FF6B6B", bg: "rgba(255,107,107,0.1)" },
  complained: { label: "Complained",   color: "#FF6B6B", bg: "rgba(255,107,107,0.1)" },
};

export default function ClientKitTab({ clientEmail }: { clientEmail: string }) {
  const [data, setData] = useState<KitData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientEmail) {
      setLoading(false);
      return;
    }
    fetch(`/api/kit/subscriber?email=${encodeURIComponent(clientEmail)}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ found: false }))
      .finally(() => setLoading(false));
  }, [clientEmail]);

  if (!clientEmail) {
    return (
      <p className="text-xs text-slate-500 py-4">No email on file for this client.</p>
    );
  }

  if (loading) {
    return <p className="text-xs text-slate-500 py-4">Checking Kit…</p>;
  }

  if (!data || !data.found) {
    return (
      <div className="space-y-4">
        <div
          className="rounded-xl p-5 border border-white/5 text-center"
          style={{ background: "#131E2B" }}
        >
          <p className="text-sm font-semibold text-white mb-1">Not in Kit</p>
          <p className="text-xs text-slate-500 leading-relaxed">
            {clientEmail} hasn&apos;t subscribed via the landing page yet. They won&apos;t receive the nurture sequence until they download the free bundle.
          </p>
        </div>
        <a
          href="https://app.kit.com/subscribers"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-slate-500 hover:text-teal-400 transition-colors"
        >
          <ExternalLink size={12} />
          Open Kit dashboard
        </a>
      </div>
    );
  }

  const statusStyle = STATUS_STYLES[data.status] ?? { label: data.status, color: "#64748b", bg: "rgba(100,116,139,0.1)" };
  const subscribedDate = new Date(data.subscribedAt).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div className="space-y-4">
      {/* Status card */}
      <div
        className="rounded-xl p-5 border"
        style={{ background: "#131E2B", borderColor: `${statusStyle.color}20` }}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Kit Status</p>
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: statusStyle.bg, color: statusStyle.color }}
          >
            {statusStyle.label}
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Subscribed <span className="text-slate-300">{subscribedDate}</span>
        </p>
      </div>

      {/* Tags */}
      <div className="rounded-xl p-5 border border-white/5" style={{ background: "#131E2B" }}>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Tags</p>
        {data.tags.length === 0 ? (
          <p className="text-xs text-slate-600">No tags applied.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {data.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background: "rgba(0,217,192,0.08)", color: "#00D9C0" }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Sequences */}
      <div className="rounded-xl p-5 border border-white/5" style={{ background: "#131E2B" }}>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Sequences</p>
        {data.sequences.length === 0 ? (
          <p className="text-xs text-slate-600">Not enrolled in any sequences.</p>
        ) : (
          <div className="space-y-2">
            {data.sequences.map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <p className="text-sm text-slate-300">{s.name}</p>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: s.paused ? "rgba(100,116,139,0.1)" : "rgba(0,217,192,0.1)",
                    color: s.paused ? "#64748b" : "#00D9C0",
                  }}
                >
                  {s.paused ? "Paused" : "Active"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Note + link */}
      <div className="space-y-2">
        <p className="text-xs text-slate-600 leading-relaxed">
          Opens and clicks per email are only available in the Kit dashboard.
        </p>
        <a
          href={`https://app.kit.com/subscribers/${data.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs font-medium transition-colors"
          style={{ color: "#00D9C0" }}
        >
          <ExternalLink size={12} />
          View full activity in Kit →
        </a>
      </div>
    </div>
  );
}
