import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "#0D1825" }}
    >
      <p className="text-7xl font-black mb-4" style={{ color: "#00D9C0" }}>
        404
      </p>
      <h1 className="text-2xl font-bold text-white mb-3">Page not found</h1>
      <p className="text-sm text-slate-500 mb-8 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-xl text-sm font-semibold text-black transition-opacity hover:opacity-80"
        style={{ background: "#00D9C0" }}
      >
        Back to home
      </Link>
    </div>
  );
}
