"use client";

import { useState } from "react";
import { Plus, Search, BookOpen, X, FileText, Upload } from "lucide-react";
import { useLibrary } from "../../hooks/useLibrary";

const CATEGORIES = ["Framework", "Conversation Starter", "Exercise", "Script", "Jungian Concept", "Other"];

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  Framework: { bg: "rgba(0,217,192,0.1)", color: "#00D9C0" },
  "Conversation Starter": { bg: "rgba(255,107,107,0.1)", color: "#FF6B6B" },
  Exercise: { bg: "rgba(77,232,212,0.1)", color: "#4DE8D4" },
  Script: { bg: "rgba(255,140,140,0.1)", color: "#FF8C8C" },
  "Jungian Concept": { bg: "rgba(0,168,150,0.1)", color: "#00A896" },
  Other: { bg: "rgba(100,116,139,0.1)", color: "#64748b" },
};

export default function LibraryPage() {
  const { items, loaded, addItem, removeItem } = useLibrary();
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", category: "Framework", content: "", tags: "" });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const filtered = items.filter((item) => {
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.content.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "All" || item.category === filterCat;
    return matchSearch && matchCat;
  });

  async function handleAdd() {
    if (!form.title.trim()) return;
    setUploading(true);
    setUploadError("");

    let fileUrl: string | undefined;

    if (file) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/library/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json();
        setUploadError(data.error || "Upload failed");
        setUploading(false);
        return;
      }
      const data = await res.json();
      fileUrl = data.url;
    }

    await addItem({ ...form, fileUrl });
    setForm({ title: "", category: "Framework", content: "", tags: "" });
    setFile(null);
    setShowForm(false);
    setUploading(false);
  }

  if (!loaded) return null;

  return (
    <div className="p-4 md:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Library</h1>
          <p className="mt-1 text-sm text-slate-500">{items.length} item{items.length !== 1 ? "s" : ""} saved</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: "#4DE8D4", color: "#080F18" }}
        >
          <Plus size={15} strokeWidth={2.5} />
          Add Item
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search library..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm text-white placeholder-slate-500 border border-white/5 outline-none transition-colors"
            style={{ background: "#131E2B" }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["All", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                background: filterCat === cat ? "rgba(0,217,192,0.15)" : "#131E2B",
                color: filterCat === cat ? "#00D9C0" : "#64748b",
                border: filterCat === cat ? "1px solid rgba(0,217,192,0.3)" : "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="rounded-xl border p-6 mb-6" style={{ background: "#131E2B", borderColor: "rgba(77,232,212,0.2)" }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-white">New Library Item</h3>
            <button onClick={() => { setShowForm(false); setFile(null); setUploadError(""); }} className="text-slate-500 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Fearless Approach System"
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 border border-white/5 outline-none transition-colors"
                style={{ background: "#1A2332" }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white border border-white/5 outline-none transition-colors"
                style={{ background: "#1A2332" }}
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Content</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Describe the framework, script, or exercise..."
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 border border-white/5 outline-none transition-colors resize-none"
                style={{ background: "#1A2332" }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Tags (comma separated)</label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                placeholder="e.g. introvert, INFP, openers"
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 border border-white/5 outline-none transition-colors"
                style={{ background: "#1A2332" }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Attach PDF (optional)</label>
              <label className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-white/5 cursor-pointer hover:border-white/10 transition-colors" style={{ background: "#1A2332" }}>
                <Upload size={14} className="text-slate-500 flex-shrink-0" />
                <span className="text-sm truncate" style={{ color: file ? "#00D9C0" : "#64748b" }}>
                  {file ? file.name : "Choose a PDF..."}
                </span>
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
              {uploadError && <p className="mt-1 text-xs" style={{ color: "#FF6B6B" }}>{uploadError}</p>}
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={() => { setShowForm(false); setFile(null); }} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white transition-colors">Cancel</button>
            <button
              onClick={handleAdd}
              disabled={uploading}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "#00D9C0", color: "#080F18" }}
            >
              {uploading ? "Saving..." : "Save Item"}
            </button>
          </div>
        </div>
      )}

      {/* Items grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-white/5 p-16 flex flex-col items-center justify-center text-center" style={{ background: "#131E2B" }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(77,232,212,0.08)", border: "1px dashed rgba(77,232,212,0.2)" }}>
            <BookOpen size={20} style={{ color: "#4DE8D4" }} strokeWidth={1.5} />
          </div>
          <p className="text-sm text-slate-500">Library is empty.</p>
          <p className="text-xs text-slate-600 mt-1">Add frameworks, scripts, and exercises.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((item) => {
            const { bg, color } = CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.Other;
            return (
              <div key={item.id} className="rounded-xl border border-white/5 p-5 hover:border-white/10 transition-all group relative" style={{ background: "#131E2B" }}>
                <button
                  onClick={() => removeItem(item.id)}
                  className="absolute top-4 right-4 text-slate-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X size={14} />
                </button>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: bg, color }}>{item.category}</span>
                  {item.fileUrl && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1" style={{ background: "rgba(255,107,107,0.1)", color: "#FF6B6B" }}>
                      <FileText size={10} />PDF
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{item.title}</h3>
                {item.content && <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{item.content}</p>}
                {item.tags && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {item.tags.split(",").map((tag) => tag.trim()).filter(Boolean).map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full text-slate-500" style={{ background: "rgba(255,255,255,0.04)" }}>#{tag}</span>
                    ))}
                  </div>
                )}
                {item.fileUrl && (
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
                    style={{ color: "#00D9C0" }}
                  >
                    <FileText size={12} />
                    Download PDF
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
