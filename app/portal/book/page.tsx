"use client";

import { usePortalClient } from "../../hooks/usePortalClient";
import PortalNav from "../../components/portal/PortalNav";

export default function PortalBookPage() {
  const { client, loading } = usePortalClient();

  if (loading || !client) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0D1825" }}>
        <div className="w-5 h-5 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: "#0D1825" }}>
      <PortalNav clientName={client.name} />

      <main className="flex-1 ml-56 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white tracking-tight mb-1">Book a Call</h1>
          <p className="text-sm text-slate-500">Schedule your next coaching session with Shavi.</p>
        </div>

        <div
          className="rounded-2xl border border-white/5 overflow-hidden"
          style={{ background: "#131E2B", minHeight: 680 }}
        >
          <iframe
            src="https://calendly.com/roweshavon/30min"
            width="100%"
            height="680"
            frameBorder="0"
            style={{ background: "transparent" }}
          />
        </div>
      </main>
    </div>
  );
}
