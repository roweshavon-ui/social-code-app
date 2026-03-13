"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PortalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/portal/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }

    if (data.forcePasswordChange) {
      router.push("/portal/change-password");
    } else {
      router.push("/portal/home");
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#0D1825" }}
    >
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <p className="text-2xl font-black text-white tracking-tight">Social Code</p>
          <p className="text-sm font-medium mt-1" style={{ color: "#00D9C0" }}>
            Client Portal
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border p-8 space-y-5"
          style={{ background: "#131E2B", borderColor: "rgba(0,217,192,0.12)" }}
        >
          <div>
            <h1 className="text-lg font-bold text-white mb-1">Welcome back</h1>
            <p className="text-sm text-slate-500">Sign in to your coaching portal</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 border border-white/5 outline-none focus:border-teal-500/40 transition-colors"
                style={{ background: "#1A2332" }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 border border-white/5 outline-none focus:border-teal-500/40 transition-colors"
                style={{ background: "#1A2332" }}
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2.5">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: "#FF6B6B", color: "#fff" }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>

          <div className="text-center">
            <Link
              href="/portal/forgot-password"
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Forgot your password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
