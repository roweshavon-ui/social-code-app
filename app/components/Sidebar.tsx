"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  BookOpen,
  MessageSquare,
  ClipboardList,
  Zap,
  Inbox,
  Mail,
  Kanban,
  LogOut,
  Newspaper,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/submissions", label: "Submissions", icon: Inbox },
  { href: "/leads", label: "Leads", icon: Mail },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/questionnaire", label: "Assessment", icon: ClipboardList },
  { href: "/sessions", label: "Sessions", icon: CalendarDays },
  { href: "/library", label: "Library", icon: BookOpen },
  { href: "/simulator", label: "Simulator", icon: MessageSquare },
  { href: "/posts", label: "Blog", icon: Newspaper },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-60 flex flex-col border-r border-white/5"
      style={{ background: "#080F18" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #00D9C0, #00A896)" }}
        >
          <Zap size={14} className="text-white" strokeWidth={2.5} />
        </div>
        <div>
          <div className="text-sm font-bold text-white tracking-tight">Social Code</div>
          <div className="text-xs" style={{ color: "#00D9C0" }}>Admin</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
              style={{
                background: active ? "rgba(0,217,192,0.1)" : "transparent",
                color: active ? "#00D9C0" : "#94a3b8",
                borderLeft: active ? "2px solid #00D9C0" : "2px solid transparent",
              }}
            >
              <Icon size={16} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Tip */}
      <div className="px-4 py-4 mx-3 mb-3 rounded-xl" style={{ background: "rgba(0,217,192,0.06)", border: "1px solid rgba(0,217,192,0.1)" }}>
        <p className="text-xs text-slate-500 leading-relaxed">
          Run the <span style={{ color: "#00D9C0" }}>Assessment</span> with a new client — their type auto-saves to the CRM.
        </p>
      </div>

      {/* Logout */}
      <button
        onClick={async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          window.location.href = "/login";
        }}
        className="flex items-center gap-2.5 mx-3 mb-4 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-400 transition-colors w-[calc(100%-24px)]"
      >
        <LogOut size={14} strokeWidth={2} />
        Sign out
      </button>
    </aside>
  );
}
