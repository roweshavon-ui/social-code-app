"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export type PostForm = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  keywords: string;
  published: boolean;
};

type Props = {
  initial?: PostForm;
  postId?: string; // if editing
};

const EMPTY: PostForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  keywords: "",
  published: false,
};

function toSlug(str: string) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function PostEditor({ initial, postId }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<PostForm>(initial ?? EMPTY);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(field: keyof PostForm, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleTitleChange(value: string) {
    setForm((f) => ({
      ...f,
      title: value,
      slug: postId ? f.slug : toSlug(value), // auto-slug only on new posts
    }));
  }

  async function save(publish?: boolean) {
    setError("");
    if (!form.title.trim() || !form.slug.trim() || !form.excerpt.trim() || !form.content.trim()) {
      setError("Title, slug, excerpt, and content are required.");
      return;
    }

    setSaving(true);
    const payload = { ...form };
    if (publish !== undefined) payload.published = publish;

    const res = await fetch(postId ? `/api/posts/${postId}` : "/api/posts", {
      method: postId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong.");
      return;
    }
    router.push("/posts");
  }

  const CARD = "#131E2B";
  const INPUT = "#1A2332";
  const TEAL = "#00D9C0";
  const CORAL = "#FF6B6B";

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/posts" className="p-2 rounded-lg text-slate-500 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {postId ? "Edit Post" : "New Post"}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Write in plain text or markdown.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-white/5 p-6 space-y-4" style={{ background: CARD }}>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="How to Start a Conversation as an Introvert"
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white border border-white/5 outline-none"
                style={{ background: INPUT }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Slug (URL)</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => set("slug", toSlug(e.target.value))}
                placeholder="how-to-start-a-conversation"
                className="w-full px-4 py-2.5 rounded-xl text-sm border border-white/5 outline-none font-mono"
                style={{ background: INPUT, color: TEAL }}
              />
              <p className="text-xs text-slate-600 mt-1">app.joinsocialcode.com/blog/{form.slug || "your-slug"}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Excerpt (for SEO &amp; preview)</label>
              <textarea
                value={form.excerpt}
                onChange={(e) => set("excerpt", e.target.value)}
                rows={2}
                placeholder="A short description that shows up in search results and post previews."
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white border border-white/5 outline-none resize-none"
                style={{ background: INPUT }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: CARD }}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Content</span>
              <button
                onClick={() => setPreview(!preview)}
                className="flex items-center gap-1.5 text-xs font-medium transition-colors"
                style={{ color: preview ? TEAL : "#64748b" }}
              >
                {preview ? <Eye size={13} /> : <EyeOff size={13} />}
                {preview ? "Editing" : "Preview"}
              </button>
            </div>
            {preview ? (
              <div
                className="px-6 py-5 prose prose-sm prose-invert max-w-none text-slate-300 leading-relaxed min-h-[320px]"
                style={{ fontFamily: "'Work Sans', sans-serif" }}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(form.content) }}
              />
            ) : (
              <textarea
                value={form.content}
                onChange={(e) => set("content", e.target.value)}
                rows={20}
                placeholder={`Write your post here. Basic markdown supported:\n\n# Heading 1\n## Heading 2\n\n**Bold text** and *italic text*\n\n- Bullet point\n- Another point\n\nJust write naturally — no coding required.`}
                className="w-full px-6 py-5 text-sm text-white border-0 outline-none resize-none font-mono leading-relaxed"
                style={{ background: INPUT, minHeight: 320 }}
              />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Publish */}
          <div className="rounded-2xl border border-white/5 p-5" style={{ background: CARD }}>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Publish</p>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-slate-300">Status</span>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: form.published ? "rgba(0,217,192,0.1)" : "rgba(100,116,139,0.15)",
                  color: form.published ? TEAL : "#64748b",
                }}
              >
                {form.published ? "Published" : "Draft"}
              </span>
            </div>
            {error && (
              <p className="text-xs mb-3 px-3 py-2 rounded-lg" style={{ background: "rgba(255,107,107,0.1)", color: CORAL }}>
                {error}
              </p>
            )}
            <div className="space-y-2">
              <button
                onClick={() => save(true)}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: CORAL }}
              >
                <Save size={14} strokeWidth={2.5} />
                {saving ? "Saving…" : "Publish"}
              </button>
              <button
                onClick={() => save(false)}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all hover:text-white disabled:opacity-40"
                style={{ background: "rgba(255,255,255,0.05)", color: "#94a3b8" }}
              >
                Save as Draft
              </button>
            </div>
          </div>

          {/* SEO */}
          <div className="rounded-2xl border border-white/5 p-5" style={{ background: CARD }}>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">SEO Keywords</p>
            <textarea
              value={form.keywords}
              onChange={(e) => set("keywords", e.target.value)}
              rows={3}
              placeholder="introvert, social skills, how to start a conversation, social anxiety"
              className="w-full px-3 py-2.5 rounded-xl text-xs text-slate-300 border border-white/5 outline-none resize-none"
              style={{ background: INPUT, fontFamily: "'Work Sans', sans-serif" }}
            />
            <p className="text-xs text-slate-600 mt-2">Comma-separated. These go in the page meta tags.</p>
          </div>

          {/* Tips */}
          <div className="rounded-2xl p-4" style={{ background: "rgba(0,217,192,0.04)", border: "1px solid rgba(0,217,192,0.1)" }}>
            <p className="text-xs font-semibold mb-2" style={{ color: TEAL }}>Writing tips</p>
            <ul className="text-xs text-slate-500 space-y-1.5 leading-relaxed">
              <li>Start with the reader's problem, not the solution.</li>
              <li>Use # for headings, ## for subheadings.</li>
              <li>**bold** and *italic* work for emphasis.</li>
              <li>- for bullet points.</li>
              <li>Aim for 500–1000 words per post.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Minimal markdown renderer — no external dependency needed for basic formatting
function renderMarkdown(md: string): string {
  return md
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/^### (.+)$/gm, "<h3 class=\"text-base font-bold text-white mt-6 mb-2\">$1</h3>")
    .replace(/^## (.+)$/gm, "<h2 class=\"text-lg font-bold text-white mt-8 mb-3\">$1</h2>")
    .replace(/^# (.+)$/gm, "<h1 class=\"text-2xl font-black text-white mt-8 mb-4\">$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong class=\"text-white\">$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, "<li class=\"ml-4 list-disc\">$1</li>")
    .replace(/(<li.*<\/li>\n?)+/g, (m) => `<ul class="space-y-1 my-3">${m}</ul>`)
    .replace(/\n\n/g, "</p><p class=\"mb-4\">")
    .replace(/^(?!<)(.+)$/gm, (m) => m ? m : "")
    .replace(/^/, "<p class=\"mb-4\">")
    .concat("</p>");
}
