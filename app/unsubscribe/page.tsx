"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function UnsubscribeForm() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") ?? "";

  const [email, setEmail] = useState(emailParam);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Auto-submit if email is pre-filled from the link
  useEffect(() => {
    if (emailParam) handleUnsubscribe(emailParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleUnsubscribe(emailToUse = email) {
    if (!emailToUse.trim()) return;
    setLoading(true);
    await fetch("/api/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailToUse.trim().toLowerCase() }),
    });
    setLoading(false);
    setDone(true);
  }

  if (done) {
    return (
      <div className="text-center space-y-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
          style={{ background: "rgba(0,217,192,0.1)" }}
        >
          <span style={{ color: "#00D9C0", fontSize: 22 }}>✓</span>
        </div>
        <div>
          <p className="text-base font-bold text-white mb-1">You&apos;re unsubscribed</p>
          <p className="text-sm text-slate-500 leading-relaxed">
            {email} has been removed from Social Code emails. No hard feelings.
          </p>
        </div>
        <Link
          href="https://joinsocialcode.com"
          className="block text-sm transition-colors"
          style={{ color: "#00D9C0" }}
        >
          ← Back to Social Code
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="w-5 h-5 rounded-full border-2 border-teal-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-sm text-slate-500 mt-3">Unsubscribing…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-white mb-1">Unsubscribe</h1>
        <p className="text-sm text-slate-500">
          Enter your email and we&apos;ll remove you from all Social Code marketing emails.
        </p>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 border border-white/5 outline-none"
          style={{ background: "#1A2332" }}
        />
      </div>
      <button
        onClick={() => handleUnsubscribe()}
        disabled={!email.trim()}
        className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40"
        style={{ background: "#FF6B6B", color: "#fff" }}
      >
        Unsubscribe
      </button>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#0D1825" }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-2xl font-black text-white tracking-tight">Social Code</p>
        </div>
        <div
          className="rounded-2xl border p-8"
          style={{ background: "#131E2B", borderColor: "rgba(255,255,255,0.06)" }}
        >
          <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
            <UnsubscribeForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
