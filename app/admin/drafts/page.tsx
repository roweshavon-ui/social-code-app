import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
};

async function getAllPosts(): Promise<Post[]> {
  const db = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data } = await db
    .from("posts")
    .select("id, title, slug, excerpt, published, published_at, created_at")
    .order("published_at", { ascending: true, nullsFirst: false });
  return data ?? [];
}

function formatDate(str: string | null) {
  if (!str) return "No date set";
  return new Date(str).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
}

function daysUntil(str: string | null) {
  if (!str) return null;
  const diff = new Date(str).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return "overdue";
  if (days === 0) return "today";
  return `in ${days}d`;
}

export default async function DraftsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sc_admin")?.value;
  if (!token || token !== process.env.ADMIN_TOKEN) {
    redirect("/admin");
  }

  const posts = await getAllPosts();
  const drafts = posts.filter((p) => !p.published);
  const published = posts.filter((p) => p.published);

  return (
    <div className="min-h-screen" style={{ background: "#0D1825", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <header className="border-b border-white/5 px-6 py-5 flex items-center justify-between max-w-4xl mx-auto">
        <Link href="https://joinsocialcode.com" className="text-sm font-black text-white tracking-tight">
          Social Code
        </Link>
        <Link href="/blog" className="text-xs text-slate-400 hover:text-white transition-colors">
          ← Public blog
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "#00D9C0" }}>Admin</p>
          <h1 className="text-3xl font-black text-white">Content pipeline</h1>
          <p className="text-sm text-slate-500 mt-1">{drafts.length} scheduled · {published.length} published</p>
        </div>

        {/* Scheduled drafts */}
        <section className="mb-12">
          <h2 className="text-xs font-bold tracking-widest uppercase text-slate-500 mb-4">Scheduled ({drafts.length})</h2>
          <div className="flex flex-col gap-3">
            {drafts.length === 0 && (
              <p className="text-slate-600 text-sm">No drafts queued.</p>
            )}
            {drafts.map((post, i) => {
              const when = daysUntil(post.published_at);
              const isOverdue = when === "overdue";
              return (
                <div
                  key={post.id}
                  className="rounded-xl border p-5 flex items-start gap-4"
                  style={{ background: "#131E2B", borderColor: isOverdue ? "rgba(255,107,107,0.3)" : "rgba(255,255,255,0.06)" }}
                >
                  <div
                    className="text-xs font-black w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "rgba(0,217,192,0.1)", color: "#00D9C0" }}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white leading-snug">{post.title}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                      {post.excerpt}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-xs text-slate-400">{formatDate(post.published_at)}</p>
                    <p
                      className="text-xs font-bold mt-1"
                      style={{ color: isOverdue ? "#FF6B6B" : "#00D9C0" }}
                    >
                      {when}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Published */}
        <section>
          <h2 className="text-xs font-bold tracking-widest uppercase text-slate-500 mb-4">Published ({published.length})</h2>
          <div className="flex flex-col gap-3">
            {published.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="rounded-xl border border-white/5 p-5 flex items-center justify-between hover:border-white/10 transition-colors"
                style={{ background: "#0f1a26" }}
              >
                <div>
                  <p className="text-sm font-semibold text-slate-300 leading-snug">{post.title}</p>
                  <p className="text-xs text-slate-600 mt-1">{formatDate(post.published_at)}</p>
                </div>
                <p className="text-xs text-slate-600 ml-4 flex-shrink-0">View →</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
