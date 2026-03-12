import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  keywords: string | null;
  published_at: string;
};

async function getPost(slug: string): Promise<Post | null> {
  const db = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data } = await db
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();
  return data ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post not found" };

  return {
    title: `${post.title} — Social Code`,
    description: post.excerpt,
    keywords: post.keywords ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://app.joinsocialcode.com/blog/${post.slug}`,
      siteName: "Social Code",
      type: "article",
    },
  };
}

function renderMarkdown(md: string): string {
  return md
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .split("\n\n")
    .map((block) => {
      if (block.startsWith("<h") || block.startsWith("<ul")) return block;
      return `<p>${block.replace(/\n/g, "<br/>")}</p>`;
    })
    .join("\n");
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

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

      <main className="max-w-2xl mx-auto px-6 py-16">
        {/* Back */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-medium mb-10 transition-colors"
          style={{ color: "#64748b" }}
        >
          ← All posts
        </Link>

        {/* Meta */}
        <p className="text-xs text-slate-600 mb-4">
          {new Date(post.published_at).toLocaleDateString("en-US", {
            month: "long", day: "numeric", year: "numeric",
          })}
        </p>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-4">
          {post.title}
        </h1>

        <p className="text-base text-slate-400 leading-relaxed mb-10 pb-10 border-b border-white/5" style={{ fontFamily: "'Work Sans', sans-serif" }}>
          {post.excerpt}
        </p>

        {/* Content */}
        <div
          className="blog-content text-slate-300 leading-relaxed"
          style={{ fontFamily: "'Work Sans', sans-serif" }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
        />

        {/* CTA */}
        <div
          className="mt-16 p-8 rounded-2xl text-center"
          style={{ background: "#131E2B", border: "1px solid rgba(0,217,192,0.12)" }}
        >
          <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "#00D9C0" }}>Ready to start?</p>
          <h3 className="text-xl font-black text-white mb-3">Find your Jungian type. Free.</h3>
          <p className="text-sm text-slate-400 mb-6" style={{ fontFamily: "'Work Sans', sans-serif" }}>
            20 questions. Your type, your strengths, and the exact frameworks built for how you're wired.
          </p>
          <Link
            href="https://app.joinsocialcode.com/assess"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white"
            style={{ background: "#FF6B6B" }}
          >
            Take the Free Assessment →
          </Link>
        </div>
      </main>

      <style>{`
        .blog-content p { margin-bottom: 1.25rem; font-size: 0.9375rem; line-height: 1.75; }
        .blog-content h1 { font-size: 1.75rem; font-weight: 900; color: #F7F9FC; margin: 2.5rem 0 1rem; }
        .blog-content h2 { font-size: 1.375rem; font-weight: 800; color: #F7F9FC; margin: 2rem 0 0.75rem; }
        .blog-content h3 { font-size: 1.125rem; font-weight: 700; color: #F7F9FC; margin: 1.5rem 0 0.5rem; }
        .blog-content strong { color: #F7F9FC; font-weight: 700; }
        .blog-content ul { margin: 1rem 0 1.25rem; padding-left: 1.5rem; list-style: disc; }
        .blog-content li { margin-bottom: 0.5rem; line-height: 1.65; }
      `}</style>

      <footer className="border-t border-white/5 px-6 py-8 text-center mt-16">
        <p className="text-xs text-slate-600">Social Code · joinsocialcode.com</p>
      </footer>
    </div>
  );
}
