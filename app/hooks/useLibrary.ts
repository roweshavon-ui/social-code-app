"use client";

import { useState, useEffect, useCallback } from "react";

export type LibraryItem = {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string;
  fileUrl?: string;
  createdAt: string;
};

type RawLibraryItem = {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string;
  file_url?: string;
  created_at: string;
};

function toLibraryItem(raw: RawLibraryItem): LibraryItem {
  return {
    id: raw.id,
    title: raw.title,
    category: raw.category,
    content: raw.content,
    tags: raw.tags,
    fileUrl: raw.file_url ?? undefined,
    createdAt: raw.created_at,
  };
}

export function useLibrary() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const fetchItems = useCallback(async () => {
    const res = await fetch("/api/library");
    if (!res.ok) return;
    const data: RawLibraryItem[] = await res.json();
    setItems(data.map(toLibraryItem));
    setLoaded(true);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  async function addItem(item: Omit<LibraryItem, "id" | "createdAt">) {
    const res = await fetch("/api/library", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    if (!res.ok) return;
    const raw: RawLibraryItem = await res.json();
    setItems((prev) => [toLibraryItem(raw), ...prev]);
    return toLibraryItem(raw);
  }

  async function removeItem(id: string) {
    const res = await fetch(`/api/library/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return { items, loaded, addItem, removeItem };
}
