"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, CheckSquare, Calendar, BookOpen, PhoneCall, LogOut, Menu, X } from "lucide-react";

const LINKS = [
  { href: "/portal/home", label: "Home", icon: Home },
  { href: "/portal/tasks", label: "My Tasks", icon: CheckSquare },
  { href: "/portal/sessions", label: "Sessions", icon: Calendar },
  { href: "/portal/resources", label: "Resources", icon: BookOpen },
  { href: "/portal/book", label: "Book a Call", icon: PhoneCall },
];

function NavLinks({ onClick }: { onClick?: () => void }) {
  const pathname = usePathname();
  return (
    <>
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={onClick}
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
    </>
  );
}

export default function PortalShell({
  clientName,
  children,
}: {
  clientName: string;
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/portal/logout", { method: "POST" });
    router.push("/portal/login");
  }

  return (
    <div className="flex min-h-screen" style={{ background: "#0D1825" }}>

      {/* Desktop sidebar */}
      <nav
        className="hidden md:flex fixed left-0 top-0 bottom-0 w-56 flex-col z-30"
        style={{ background: "#0A1420", borderRight: "1px solid rgba(0,217,192,0.08)" }}
      >
        <div className="px-5 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <p className="text-base font-black text-white tracking-tight">Social Code</p>
          <p className="text-xs font-medium mt-0.5" style={{ color: "#00D9C0" }}>Client Portal</p>
        </div>
        <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <p className="text-xs text-slate-500 mb-0.5">Logged in as</p>
          <p className="text-sm font-semibold text-white truncate">{clientName}</p>
        </div>
        <div className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <NavLinks />
        </div>
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

      {/* Mobile top bar */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 border-b"
        style={{ background: "#0A1420", borderColor: "rgba(0,217,192,0.08)" }}
      >
        <div>
          <p className="text-sm font-black text-white tracking-tight">Social Code</p>
          <p className="text-xs" style={{ color: "#00D9C0" }}>Client Portal</p>
        </div>
        <button
          onClick={() => setMenuOpen(true)}
          className="text-slate-400 hover:text-white transition-colors p-1"
        >
          <Menu size={20} />
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
            style={{ background: "#0A1420" }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              <div>
                <p className="text-base font-black text-white">Social Code</p>
                <p className="text-xs" style={{ color: "#00D9C0" }}>Client Portal</p>
              </div>
              <button onClick={() => setMenuOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              <p className="text-xs text-slate-500 mb-0.5">Logged in as</p>
              <p className="text-sm font-semibold text-white">{clientName}</p>
            </div>
            <div className="flex-1 px-3 py-4 space-y-0.5">
              <NavLinks onClick={() => setMenuOpen(false)} />
            </div>
            <div className="px-3 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-slate-500 hover:text-red-400 transition-colors"
              >
                <LogOut size={15} strokeWidth={1.8} />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-56 pt-16 md:pt-0">
        {children}
      </main>
    </div>
  );
}
