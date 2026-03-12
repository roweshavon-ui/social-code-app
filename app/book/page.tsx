"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function BookPage() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#080F18", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-white/5">
        <Link href="/" className="text-sm font-black text-white tracking-tight">
          Social Code
        </Link>
        <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "rgba(0,217,192,0.1)", color: "#00D9C0" }}>
          Free Strategy Call
        </span>
      </header>

      {/* Hero text */}
      <div className="max-w-xl mx-auto w-full px-6 pt-10 pb-4 text-center">
        <h1 className="text-2xl font-black text-white tracking-tight mb-2">
          Book Your Free 30-Minute Call
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          You got your type. Now let&apos;s build the actual plan. Pick a time that works for you — no pitch, no pressure.
        </p>
      </div>

      {/* Calendly inline embed */}
      <div className="flex-1 w-full max-w-3xl mx-auto px-4 pb-12">
        <div
          className="calendly-inline-widget w-full rounded-2xl overflow-hidden"
          data-url="https://calendly.com/roweshavon/30min?hide_landing_page_details=1&hide_gdpr_banner=1&background_color=0D1825&text_color=F7F9FC&primary_color=00D9C0"
          style={{ minWidth: "320px", height: "700px" }}
        />
      </div>
    </div>
  );
}
