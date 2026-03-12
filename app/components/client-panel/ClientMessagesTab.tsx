"use client";

import { useEffect, useState } from "react";
import { Send, AlertCircle } from "lucide-react";
import { useMessages } from "../../hooks/useMessages";

export default function ClientMessagesTab({ clientId }: { clientId: string }) {
  const { messages, loaded, fetchMessages, sendMessage } = useMessages(clientId);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  async function handleSend() {
    if (!subject.trim() || !body.trim()) return;
    setSending(true);
    setWarning(null);
    setError(null);
    const result = await sendMessage(subject.trim(), body.trim());
    setSending(false);
    if (!result) {
      setError("Failed to send. Please try again.");
      return;
    }
    if ("warning" in result && result.warning) {
      setWarning(result.warning as string);
    }
    setSubject("");
    setBody("");
  }

  return (
    <div className="space-y-5">
      {/* Compose */}
      <div className="rounded-xl border border-white/5 p-4 space-y-3" style={{ background: "#131E2B" }}>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">New Message</p>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject…"
          className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-slate-600 border border-white/5 outline-none"
          style={{ background: "#1A2332" }}
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your message…"
          rows={4}
          className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-slate-600 border border-white/5 outline-none resize-none"
          style={{ background: "#1A2332" }}
        />
        {error && (
          <div className="flex items-center gap-2 text-xs text-red-400">
            <AlertCircle size={13} /> {error}
          </div>
        )}
        {warning && (
          <div className="flex items-center gap-2 text-xs text-amber-400">
            <AlertCircle size={13} /> {warning}
          </div>
        )}
        <div className="flex justify-end">
          <button
            onClick={handleSend}
            disabled={sending || !subject.trim() || !body.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: "#FF6B6B", color: "#fff" }}
          >
            <Send size={13} strokeWidth={2.5} />
            {sending ? "Sending…" : "Send Email"}
          </button>
        </div>
      </div>

      {/* History */}
      {!loaded ? (
        <p className="text-xs text-slate-500">Loading…</p>
      ) : messages.length === 0 ? (
        <p className="text-xs text-slate-600 text-center py-4">No messages sent yet.</p>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-600 uppercase tracking-widest">Sent</p>
          {messages.map((m) => (
            <div key={m.id} className="rounded-xl border border-white/5 p-4" style={{ background: "#131E2B" }}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-semibold text-white leading-tight">{m.subject}</p>
                <span className="text-xs text-slate-600 flex-shrink-0">
                  {new Date(m.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap line-clamp-3">{m.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
