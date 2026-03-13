"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    setError("");
    setLoading(true);

    const res = await fetch("/api/portal/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword: password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/portal/login"), 2000);
  }

  if (!token) {
    return (
      <div className="text-center space-y-3">
        <p className="text-base font-bold text-white">Invalid link</p>
        <p className="text-sm text-slate-500">This reset link is missing or invalid.</p>
        <Link href="/portal/forgot-password" className="text-sm" style={{ color: "#00D9C0" }}>
          Request a new one →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-white mb-1">Set new password</h1>
        <p className="text-sm text-slate-500">Choose a password that&apos;s at least 8 characters.</p>
      </div>

      {done ? (
        <div className="text-center py-4 space-y-2">
          <p className="text-sm font-semibold" style={{ color: "#00D9C0" }}>Password updated!</p>
          <p className="text-xs text-slate-500">Redirecting to login…</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">New password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Min 8 characters"
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 border border-white/5 outline-none transition-colors"
                style={{ background: "#1A2332" }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="Same as above"
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 border border-white/5 outline-none transition-colors"
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
            {loading ? "Updating…" : "Update Password"}
          </button>
        </>
      )}
    </form>
  );
}

export default function ResetPasswordPage() {
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
          className="rounded-2xl border p-8"
          style={{ background: "#131E2B", borderColor: "rgba(0,217,192,0.12)" }}
        >
          <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
