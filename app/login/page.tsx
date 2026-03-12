"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") ?? "/dashboard";

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch(`/api/auth/login?from=${encodeURIComponent(from)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError("Incorrect password.");
      return;
    }

    router.push(data.redirect ?? "/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter admin password"
          autoFocus
          className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 border border-white/5 outline-none transition-colors"
          style={{ background: "#1A2332" }}
        />
      </div>
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading || !password}
        className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-40"
        style={{ background: "#00D9C0", color: "#080F18" }}
      >
        {loading ? "Checking…" : "Sign In"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#080F18", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(0,217,192,0.1)", border: "1px solid rgba(0,217,192,0.2)" }}
          >
            <Lock size={20} style={{ color: "#00D9C0" }} strokeWidth={1.5} />
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">Social Code</h1>
          <p className="text-xs text-slate-500 mt-1">Admin Access</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border border-white/5 p-6"
          style={{ background: "#131E2B" }}
        >
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
