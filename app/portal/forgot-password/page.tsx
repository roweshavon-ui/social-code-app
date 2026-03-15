"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/portal/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setSent(true);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#0D1825" }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-2xl font-black text-white tracking-tight">Social Code</p>
          <p className="text-sm font-medium mt-1" style={{ color: "#00D9C0" }}>Client Portal</p>
        </div>

        <div
          className="rounded-2xl border p-6 md:p-8"
          style={{ background: "#131E2B", borderColor: "rgba(0,217,192,0.12)" }}
        >
          {sent ? (
            <div className="text-center space-y-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
                style={{ background: "rgba(0,217,192,0.1)" }}
              >
                <span style={{ color: "#00D9C0", fontSize: 22 }}>✓</span>
              </div>
              <div>
                <p className="text-base font-bold text-white mb-1">Check your email</p>
                <p className="text-sm text-slate-500 leading-relaxed">
                  If an account with that email exists, we sent a reset link. It expires in 1 hour.
                </p>
              </div>
              <Link
                href="/portal/login"
                className="block text-sm font-medium transition-colors"
                style={{ color: "#00D9C0" }}
              >
                ← Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h1 className="text-lg font-bold text-white mb-1">Forgot password</h1>
                <p className="text-sm text-slate-500">
                  Enter your email and we&apos;ll send you a reset link.
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 border border-white/5 outline-none transition-colors"
                  style={{ background: "#1A2332" }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: "#00D9C0", color: "#080F18" }}
              >
                {loading ? "Sending…" : "Send Reset Link"}
              </button>
              <div className="text-center">
                <Link
                  href="/portal/login"
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  ← Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
