"use client";

import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";

type Comment = {
  id: string;
  name: string;
  body: string;
  created_at: string;
};

type Props = {
  postId: string;
  initialComments: Comment[];
};

const TEAL = "#00D9C0";
const CORAL = "#FF6B6B";
const CARD = "#131E2B";
const INPUT = "#1A2332";

export default function CommentSection({ postId, initialComments }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setError("");
    setSubmitting(true);

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, name, message }),
    });

    setSubmitting(false);

    if (!res.ok) {
      setError("Something went wrong. Try again.");
      return;
    }

    setSubmitted(true);
    setName("");
    setMessage("");
  }

  return (
    <div className="mt-16 pt-10 border-t border-white/5">
      <div className="flex items-center gap-2 mb-8">
        <MessageCircle size={16} style={{ color: TEAL }} strokeWidth={2} />
        <h3 className="text-sm font-bold text-white">
          {comments.length > 0 ? `${comments.length} Comment${comments.length !== 1 ? "s" : ""}` : "Comments"}
        </h3>
      </div>

      {/* Existing comments */}
      {comments.length > 0 && (
        <div className="space-y-4 mb-10">
          {comments.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-2xl"
              style={{ background: CARD, border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-white">{c.name}</p>
                <p className="text-xs text-slate-600">
                  {new Date(c.created_at).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                  })}
                </p>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                {c.body}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Comment form */}
      <div
        className="p-6 rounded-2xl"
        style={{ background: CARD, border: "1px solid rgba(255,255,255,0.05)" }}
      >
        <p className="text-sm font-bold text-white mb-5">Leave a comment</p>

        {submitted ? (
          <div
            className="px-4 py-3 rounded-xl text-sm"
            style={{ background: "rgba(0,217,192,0.08)", color: TEAL, border: "1px solid rgba(0,217,192,0.15)" }}
          >
            Thanks for your comment. It will show up once approved.
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={80}
              required
              className="w-full px-4 py-2.5 rounded-xl text-sm text-white border border-white/5 outline-none"
              style={{ background: INPUT, fontFamily: "'Work Sans', sans-serif" }}
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your comment..."
              rows={4}
              maxLength={1000}
              required
              className="w-full px-4 py-2.5 rounded-xl text-sm text-white border border-white/5 outline-none resize-none"
              style={{ background: INPUT, fontFamily: "'Work Sans', sans-serif" }}
            />
            {error && (
              <p className="text-xs px-3 py-2 rounded-lg" style={{ background: "rgba(255,107,107,0.1)", color: CORAL }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting || !name.trim() || !message.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-40"
              style={{ background: CORAL }}
            >
              <Send size={13} strokeWidth={2.5} />
              {submitting ? "Sending..." : "Post Comment"}
            </button>
            <p className="text-xs text-slate-600">Comments are reviewed before going live.</p>
          </form>
        )}
      </div>
    </div>
  );
}
