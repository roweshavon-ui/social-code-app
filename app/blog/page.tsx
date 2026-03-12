import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog — Social Code",
  description: "Practical social skills for introverts. Jungian frameworks, conversation guides, and real strategies for connecting with people.",
};

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  keywords: string | null;
  published_at: string;
};

async function getPosts(): Promise<Post[]> {
  const db = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data } = await db
    .from("posts")
    .select("id, title, slug, excerpt, keywords, published_at")
    .eq("published", true)
    .order("published_at", { ascending: false });
  return data ?? [];
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div
      className="min-h-screen"
      style={{ background: "#0D1825", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
    >
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-5 flex items-center justify-between max-w-4xl mx-auto">
        <Link href="https://joinsocialcode.com" className="text-sm font-black text-white tracking-tight">
          Social Code
        </Link>
        <Link
          href="https://app.joinsocialcode.com/assess"
          className="text-xs font-bold px-4 py-2 rounded-lg text-white"
          style={{ background: "#FF6B6B" }}
        >
          Free Assessment
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#00D9C0" }}>The Blog</p>
          <h1 className="text-4xl font-black text-white tracking-tight leading-tight">
            Crack the Code.
          </h1>
          <p className="mt-4 text-base text-slate-400 max-w-xl" style={{ fontFamily: "'Work Sans', sans-serif" }}>
            Practical social skills for introverts. No fluff, no "just be confident." Real frameworks, real situations.
          </p>
        </div>

        {posts.length === 0 ? (
          <p className="text-slate-500 text-sm">First post coming soon.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group rounded-2xl border border-white/5 p-6 flex flex-col transition-all hover:border-white/10"
                style={{ background: "#131E2B" }}
              >
                <div className="flex-1">
                  <p className="text-xs text-slate-600 mb-3">
                    {new Date(post.published_at).toLocaleDateString("en-US", {
                      month: "long", day: "numeric", year: "numeric",
                    })}
                  </p>
                  <h2 className="text-base font-bold text-white leading-snug group-hover:text-teal-300 transition-colors">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-sm text-slate-400 leading-relaxed line-clamp-3" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                    {post.excerpt}
                  </p>
                </div>
                <p className="mt-4 text-xs font-semibold" style={{ color: "#00D9C0" }}>
                  Read →
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 px-6 py-8 text-center mt-16">
        <p className="text-xs text-slate-600">Social Code · joinsocialcode.com</p>
      </footer>
    </div>
  );
}
