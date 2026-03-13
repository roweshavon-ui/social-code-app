"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [clientName, setClientName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Verify the user is actually logged in and force_password_change is true
  useEffect(() => {
    fetch("/api/portal/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          router.push("/portal/login");
        } else if (!data.forcePasswordChange) {
          router.push("/portal/home");
        } else {
          setClientName(data.name);
        }
      })
      .catch(() => router.push("/portal/login"));
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    setError("");
    setLoading(true);

    const res = await fetch("/api/portal/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword: password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }

    router.push("/portal/home");
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

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border p-8 space-y-5"
          style={{ background: "#131E2B", borderColor: "rgba(0,217,192,0.12)" }}
        >
          <div>
            <div
              className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3"
              style={{ background: "rgba(255,107,107,0.1)", color: "#FF6B6B" }}
            >
              Action required
            </div>
            <h1 className="text-lg font-bold text-white mb-1">
              {clientName ? `Hey ${clientName.split(" ")[0]} —` : "Set your password"}
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              Your coach gave you a temporary password. Set your own now — at least 8 characters.
            </p>
          </div>

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
            {loading ? "Saving…" : "Set My Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
