"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  BookOpen,
  MessageSquare,
  ClipboardList,
  Inbox,
  Mail,
  Kanban,
  LogOut,
  Newspaper,
  Brain,
  Menu,
  X,
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
  { href: "/comments", label: "Comments", icon: MessageSquare },
  { href: "/behavioral-intel", label: "Behavioral Intel", icon: Brain },
];

function NavLinks({ onClick }: { onClick?: () => void }) {
  const pathname = usePathname();
  return (
    <>
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            onClick={onClick}
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
    </>
  );
}

async function handleLogout() {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "/login";
}

export default function Sidebar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex fixed left-0 top-0 h-screen w-60 flex-col border-r border-white/5 z-30"
        style={{ background: "#080F18" }}
      >
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/5">
          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
            <Image src="/logo.svg" alt="Social Code" width={32} height={32} />
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-tight">Social Code</div>
            <div className="text-xs" style={{ color: "#00D9C0" }}>Admin</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <NavLinks />
        </nav>

        <div className="px-4 py-4 mx-3 mb-3 rounded-xl" style={{ background: "rgba(0,217,192,0.06)", border: "1px solid rgba(0,217,192,0.1)" }}>
          <p className="text-xs text-slate-500 leading-relaxed">
            Run the <span style={{ color: "#00D9C0" }}>Assessment</span> with a new client — their type auto-saves to the CRM.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 mx-3 mb-4 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-400 transition-colors w-[calc(100%-24px)]"
        >
          <LogOut size={14} strokeWidth={2} />
          Sign out
        </button>
      </aside>

      {/* Mobile top bar */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 border-b"
        style={{ background: "#080F18", borderColor: "rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-center gap-2.5">
          <Image src="/logo.svg" alt="Social Code" width={26} height={26} />
          <div>
            <div className="text-sm font-bold text-white tracking-tight leading-none">Social Code</div>
            <div className="text-xs leading-none mt-0.5" style={{ color: "#00D9C0" }}>Admin</div>
          </div>
        </div>
        <button
          onClick={() => setMenuOpen(true)}
          className="text-slate-400 hover:text-white transition-colors p-1"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <div
            className="md:hidden fixed left-0 top-0 bottom-0 z-50 w-72 flex flex-col"
            style={{ background: "#080F18" }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <Image src="/logo.svg" alt="Social Code" width={28} height={28} />
                <div>
                  <div className="text-sm font-bold text-white tracking-tight">Social Code</div>
                  <div className="text-xs" style={{ color: "#00D9C0" }}>Admin</div>
                </div>
              </div>
              <button onClick={() => setMenuOpen(false)} className="text-slate-500 hover:text-white transition-colors p-1">
                <X size={18} />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
              <NavLinks onClick={() => setMenuOpen(false)} />
            </nav>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 mx-3 mb-6 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-400 transition-colors"
            >
              <LogOut size={14} strokeWidth={2} />
              Sign out
            </button>
          </div>
        </>
      )}
    </>
  );
}
