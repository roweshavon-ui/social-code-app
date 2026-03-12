"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Eye, EyeOff, ExternalLink } from "lucide-react";
import Link from "next/link";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  keywords: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
};

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/posts");
    if (res.ok) setPosts(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function togglePublish(post: Post) {
    await fetch(`/api/posts/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !post.published }),
    });
    load();
  }

  async function deletePost(id: string) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Blog Posts</h1>
          <p className="text-sm text-slate-500 mt-1">Write and publish posts to boost SEO.</p>
        </div>
        <Link
          href="/posts/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
          style={{ background: "#FF6B6B" }}
        >
          <Plus size={15} strokeWidth={2.5} />
          New Post
        </Link>
      </div>

      {loading ? (
        <div className="text-slate-500 text-sm">Loading…</div>
      ) : posts.length === 0 ? (
        <div
          className="rounded-2xl border border-white/5 p-16 text-center"
          style={{ background: "#131E2B" }}
        >
          <p className="text-slate-400 text-sm mb-4">No posts yet. Write your first one.</p>
          <Link
            href="/posts/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: "#FF6B6B" }}
          >
            <Plus size={14} />
            Write First Post
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="rounded-2xl border border-white/5 p-5 flex items-start justify-between gap-4"
              style={{ background: "#131E2B" }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-1">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: post.published ? "rgba(0,217,192,0.1)" : "rgba(100,116,139,0.15)",
                      color: post.published ? "#00D9C0" : "#64748b",
                    }}
                  >
                    {post.published ? "Published" : "Draft"}
                  </span>
                  {post.published_at && (
                    <span className="text-xs text-slate-600">
                      {new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-white leading-snug">{post.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{post.excerpt}</p>
                {post.keywords && (
                  <p className="text-xs mt-1.5" style={{ color: "#00D9C0" }}>
                    Keywords: {post.keywords}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {post.published && (
                  <a
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-slate-500 hover:text-white transition-colors"
                    title="View post"
                  >
                    <ExternalLink size={15} />
                  </a>
                )}
                <button
                  onClick={() => togglePublish(post)}
                  className="p-2 rounded-lg text-slate-500 hover:text-white transition-colors"
                  title={post.published ? "Unpublish" : "Publish"}
                >
                  {post.published ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <Link
                  href={`/posts/${post.id}/edit`}
                  className="p-2 rounded-lg text-slate-500 hover:text-white transition-colors"
                  title="Edit"
                >
                  <Edit2 size={15} />
                </Link>
                <button
                  onClick={() => deletePost(post.id)}
                  className="p-2 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
