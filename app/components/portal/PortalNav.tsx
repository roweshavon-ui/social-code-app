"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, CheckSquare, Calendar, BookOpen, PhoneCall, LogOut } from "lucide-react";

const LINKS = [
  { href: "/portal/home", label: "Home", icon: Home },
  { href: "/portal/tasks", label: "My Tasks", icon: CheckSquare },
  { href: "/portal/sessions", label: "Sessions", icon: Calendar },
  { href: "/portal/resources", label: "Resources", icon: BookOpen },
  { href: "/portal/book", label: "Book a Call", icon: PhoneCall },
];

export default function PortalNav({ clientName }: { clientName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/portal/logout", { method: "POST" });
    router.push("/portal/login");
  }

  return (
    <nav
      className="fixed left-0 top-0 bottom-0 w-56 flex flex-col z-30"
      style={{ background: "#0A1420", borderRight: "1px solid rgba(0,217,192,0.08)" }}
    >
      {/* Brand */}
      <div className="px-5 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <p className="text-base font-black text-white tracking-tight">Social Code</p>
        <p className="text-xs font-medium mt-0.5" style={{ color: "#00D9C0" }}>Client Portal</p>
      </div>

      {/* Client name */}
      <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <p className="text-xs text-slate-500 mb-0.5">Logged in as</p>
        <p className="text-sm font-semibold text-white truncate">{clientName}</p>
      </div>

      {/* Nav links */}
      <div className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                color: active ? "#00D9C0" : "#64748b",
                background: active ? "rgba(0,217,192,0.08)" : "transparent",
              }}
            >
              <Icon size={15} strokeWidth={active ? 2.5 : 1.8} />
              {label}
            </Link>
          );
        })}
      </div>

      {/* Sign out */}
      <div className="px-3 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full transition-colors text-slate-500 hover:text-red-400"
        >
          <LogOut size={15} strokeWidth={1.8} />
          Sign Out
        </button>
      </div>
    </nav>
  );
}
