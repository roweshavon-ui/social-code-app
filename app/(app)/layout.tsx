import Sidebar from "../components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-60 pt-14 md:pt-0 min-h-screen" style={{ background: "#0D1825" }}>
        {children}
      </main>
    </div>
  );
}
