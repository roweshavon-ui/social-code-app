"use client";

import { useState, useCallback } from "react";

export type Message = {
  id: string;
  clientId: string;
  subject: string;
  body: string;
  sentAt: string;
  createdAt: string;
};

type RawMessage = {
  id: string;
  client_id: string;
  subject: string;
  body: string;
  sent_at: string;
  created_at: string;
};

function toMessage(raw: RawMessage): Message {
  return {
    id: raw.id,
    clientId: raw.client_id,
    subject: raw.subject,
    body: raw.body,
    sentAt: raw.sent_at,
    createdAt: raw.created_at,
  };
}

export function useMessages(clientId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loaded, setLoaded] = useState(false);

  const fetchMessages = useCallback(async () => {
    const res = await fetch(`/api/messages?clientId=${clientId}`);
    if (!res.ok) return;
    const data: RawMessage[] = await res.json();
    setMessages(data.map(toMessage));
    setLoaded(true);
  }, [clientId]);

  async function sendMessage(subject: string, body: string) {
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, subject, body }),
    });
    if (!res.ok) return null;
    const raw: RawMessage = await res.json();
    const msg = toMessage(raw);
    setMessages((prev) => [msg, ...prev]);
    return msg;
  }

  async function removeMessage(id: string) {
    const res = await fetch(`/api/messages/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }

  return { messages, loaded, fetchMessages, sendMessage, removeMessage };
}
