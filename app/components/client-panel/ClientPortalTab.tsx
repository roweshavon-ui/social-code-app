"use client";

import { useEffect, useState } from "react";
import { Copy, Check, RefreshCw, ShieldOff, Send } from "lucide-react";

type PortalStatus = {
  portalAccess: boolean;
  forcePasswordChange: boolean;
};

export default function ClientPortalTab({
  clientId,
  clientEmail,
}: {
  clientId: string;
  clientEmail: string;
}) {
  const [status, setStatus] = useState<PortalStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/clients/${clientId}`)
      .then((r) => r.json())
      .then((data) => {
        setStatus({
          portalAccess: data.portal_access ?? false,
          forcePasswordChange: data.force_password_change ?? false,
        });
      })
      .finally(() => setLoading(false));
  }, [clientId]);

  async function grantAccess() {
    setActing(true);
    setMessage(null);
    setTempPassword(null);

    const res = await fetch("/api/portal/grant-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, action: "grant" }),
    });

    const data = await res.json();
    setActing(false);

    if (!res.ok) {
      setMessage("Error: " + (data.error ?? "Failed to grant access"));
      return;
    }

    setStatus({ portalAccess: true, forcePasswordChange: true });
    setTempPassword(data.tempPassword);
    setMessage(clientEmail ? "Invite email sent." : "No email on file — share the password manually.");
  }

  async function resetPassword() {
    setActing(true);
    setMessage(null);
    setTempPassword(null);

    const res = await fetch("/api/portal/grant-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, action: "reset" }),
    });

    const data = await res.json();
    setActing(false);

    if (!res.ok) {
      setMessage("Error: " + (data.error ?? "Failed to reset password"));
      return;
    }

    setStatus((s) => (s ? { ...s, forcePasswordChange: true } : s));
    setTempPassword(data.tempPassword);
    setMessage(clientEmail ? "New password emailed to client." : "No email on file — share the password manually.");
  }

  async function revokeAccess() {
    if (!confirm("Remove portal access for this client?")) return;
    setActing(true);
    setMessage(null);

    const res = await fetch("/api/portal/grant-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, action: "revoke" }),
    });

    setActing(false);
    if (res.ok) {
      setStatus({ portalAccess: false, forcePasswordChange: false });
      setTempPassword(null);
      setMessage("Portal access revoked.");
    }
  }

  function copyPassword() {
    if (!tempPassword) return;
    navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return <p className="text-xs text-slate-500 py-4">Loading…</p>;
  }

  const appUrl = "https://app.joinsocialcode.com";

  return (
    <div className="space-y-5">
      {/* Status card */}
      <div
        className="rounded-xl p-5 border"
        style={{
          background: "#131E2B",
          borderColor: status?.portalAccess ? "rgba(0,217,192,0.15)" : "rgba(255,255,255,0.05)",
        }}
      >
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-bold text-white">Portal Access</p>
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{
              background: status?.portalAccess ? "rgba(0,217,192,0.1)" : "rgba(100,116,139,0.1)",
              color: status?.portalAccess ? "#00D9C0" : "#64748b",
            }}
          >
            {status?.portalAccess ? "Enabled" : "Disabled"}
          </span>
        </div>
        {status?.portalAccess && status.forcePasswordChange && (
          <p className="text-xs text-amber-400 mt-1">Waiting for client to set their password</p>
        )}
        {status?.portalAccess && !status.forcePasswordChange && (
          <p className="text-xs text-slate-500 mt-1">Client has set their own password and is active</p>
        )}
        {!status?.portalAccess && (
          <p className="text-xs text-slate-500 mt-1">
            Client cannot log into the portal yet. Enable to send them an invite.
          </p>
        )}
      </div>

      {/* Portal link */}
      {status?.portalAccess && (
        <div
          className="rounded-xl p-4 border border-white/5 flex items-center gap-3"
          style={{ background: "#131E2B" }}
        >
          <Send size={13} className="text-slate-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 mb-0.5">Portal login URL</p>
            <p className="text-xs font-mono text-slate-300 truncate">{appUrl}/portal/login</p>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(`${appUrl}/portal/login`)}
            className="text-xs text-slate-500 hover:text-teal-400 transition-colors flex-shrink-0"
          >
            Copy
          </button>
        </div>
      )}

      {/* Temp password display */}
      {tempPassword && (
        <div
          className="rounded-xl p-4 border"
          style={{ background: "#1A2332", borderColor: "rgba(0,217,192,0.2)" }}
        >
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
            Temporary Password
          </p>
          <div className="flex items-center gap-3">
            <p className="text-base font-mono font-bold tracking-widest" style={{ color: "#00D9C0" }}>
              {tempPassword}
            </p>
            <button onClick={copyPassword} className="text-slate-500 hover:text-teal-400 transition-colors">
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
          <p className="text-xs text-slate-600 mt-2">
            Client will be prompted to change this on first login.
          </p>
        </div>
      )}

      {/* Message */}
      {message && (
        <p className="text-xs px-3 py-2 rounded-lg" style={{ background: "rgba(0,217,192,0.05)", color: "#94a3b8" }}>
          {message}
        </p>
      )}

      {/* Actions */}
      <div className="space-y-2">
        {!status?.portalAccess ? (
          <button
            onClick={grantAccess}
            disabled={acting}
            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: "#00D9C0", color: "#080F18" }}
          >
            {acting ? "Setting up…" : "Enable Portal Access"}
          </button>
        ) : (
          <>
            <button
              onClick={resetPassword}
              disabled={acting}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50 border border-white/10 text-slate-300"
              style={{ background: "#131E2B" }}
            >
              <RefreshCw size={13} strokeWidth={2.5} />
              {acting ? "Resetting…" : "Reset Password"}
            </button>
            <button
              onClick={revokeAccess}
              disabled={acting}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50 text-red-400 border border-red-500/20"
              style={{ background: "rgba(255,107,107,0.05)" }}
            >
              <ShieldOff size={13} strokeWidth={2.5} />
              Revoke Access
            </button>
          </>
        )}
      </div>
    </div>
  );
}
