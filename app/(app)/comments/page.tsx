"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Trash2, MessageCircle } from "lucide-react";

type Comment = {
  id: string;
  name: string;
  body: string;
  created_at: string;
  posts: { title: string; slug: string };
};

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/comments?pending=true");
    if (res.ok) setComments(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function approve(id: string) {
    await fetch(`/api/comments/${id}`, { method: "PUT" });
    setComments((prev) => prev.filter((c) => c.id !== id));
  }

  async function remove(id: string) {
    await fetch(`/api/comments/${id}`, { method: "DELETE" });
    setComments((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <MessageCircle size={20} style={{ color: "#00D9C0" }} strokeWidth={2} />
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Pending Comments</h1>
          <p className="text-sm text-slate-500 mt-0.5">Approve or delete before they go live.</p>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500 text-sm">Loading...</p>
      ) : comments.length === 0 ? (
        <div
          className="rounded-2xl border border-white/5 p-16 text-center"
          style={{ background: "#131E2B" }}
        >
          <p className="text-slate-500 text-sm">No pending comments.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-white/5 p-5"
              style={{ background: "#131E2B" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-white">{c.name}</p>
                    <span className="text-xs text-slate-600">
                      on{" "}
                      <span style={{ color: "#00D9C0" }}>{c.posts?.title}</span>
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                    {c.body}
                  </p>
                  <p className="text-xs text-slate-600 mt-2">
                    {new Date(c.created_at).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => approve(c.id)}
                    className="p-2 rounded-lg transition-colors hover:text-teal-400"
                    style={{ color: "#64748b" }}
                    title="Approve"
                  >
                    <CheckCircle size={16} />
                  </button>
                  <button
                    onClick={() => remove(c.id)}
                    className="p-2 rounded-lg transition-colors hover:text-red-400"
                    style={{ color: "#64748b" }}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
