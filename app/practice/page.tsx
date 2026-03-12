"use client";

import { useState, useRef, useEffect } from "react";
import { Send, MessageSquare, RefreshCw, ChevronLeft } from "lucide-react";
import Link from "next/link";

const BRAND = {
  teal: "#00D9C0",
  coral: "#FF6B6B",
  dark: "#0D1825",
  card: "#131E2B",
  input: "#1A2332",
};

type ScenarioCategory = { label: string; scenarios: string[] };

const SCENARIO_CATEGORIES: ScenarioCategory[] = [
  {
    label: "Meeting People",
    scenarios: [
      "Approaching a stranger at a coffee shop",
      "Starting a conversation at a party where you know nobody",
      "Joining a group conversation already in progress",
      "Introducing yourself to a new neighbor",
      "Talking to someone while waiting in line",
      "Meeting someone at a social club or hobby group for the first time",
      "Reconnecting with someone you've lost touch with",
      "Making small talk with the person next to you on a flight",
      "Meeting someone interesting at a party",
      "Networking event — talking to a stranger",
    ],
  },
  {
    label: "Dating & Romance",
    scenarios: [
      "Asking someone out on a first date",
      "First date conversation — keeping it natural",
      "Talking to someone you find attractive at a bar or event",
      "Expressing your feelings to someone you've been seeing",
      "Gracefully declining someone's romantic interest",
      "Online dating — moving from texting to a first call",
      "Recovering after an awkward moment on a date",
      "Telling someone you're not interested after a first date",
    ],
  },
  {
    label: "Work & Professional",
    scenarios: [
      "Job interview for a role you really want",
      "Speaking up with your idea in a team meeting",
      "Networking at an industry conference",
      "One-on-one meeting with your manager",
      "Disagreeing with a colleague professionally",
      "Asking your boss for a raise or promotion",
      "Making small talk at a work social event",
      "Asking a senior person for advice or mentorship",
      "Handling negative feedback from your manager",
    ],
  },
  {
    label: "Assertiveness",
    scenarios: [
      "Saying no to a request without over-explaining",
      "Sending back food at a restaurant that was wrong",
      "Asking for what you need without apologizing",
      "Confronting someone who crossed a line",
      "Setting a boundary with someone who pushes back",
      "Disagreeing with a group when you're the only dissenting voice",
      "Asking for help without feeling like a burden",
      "Receiving a compliment without deflecting it",
    ],
  },
  {
    label: "Awkward Moments",
    scenarios: [
      "Recovering after saying something awkward",
      "Someone makes a joke at your expense — responding without spiraling",
      "Being introduced to someone and forgetting their name immediately",
      "Running into someone you've been avoiding",
      "Someone asks about something personal you don't want to discuss",
      "Continuing a conversation after a long awkward silence",
      "Going deeper in a conversation beyond surface banter",
    ],
  },
  {
    label: "Friendships",
    scenarios: [
      "Initiating plans with someone you'd like to know better",
      "Joining an established friend group as the new person",
      "Telling a friend something difficult but necessary",
      "Reaching out to an old friend after a long gap",
      "Resolving a conflict with a close friend",
      "Saying no to a friend's invitation without damaging the friendship",
    ],
  },
];

const JUNGIAN_TYPES = [
  "INTJ","INTP","ENTJ","ENTP",
  "INFJ","INFP","ENFJ","ENFP",
  "ISTJ","ISFJ","ESTJ","ESFJ",
  "ISTP","ISFP","ESTP","ESFP",
];

type Message = { role: "user" | "assistant"; content: string };

async function callAI(messages: Message[], system: string): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, system }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "API error");
  return data.content ?? "...";
}

function buildSystem(scenario: string, jungianType: string) {
  return `You are roleplaying as a person in this social scenario: "${scenario}".
The user is a ${jungianType} personality type (Jungian/Myers-Briggs) practicing their social skills.
Respond naturally as the other person in the conversation. Keep your response to 1-3 sentences.
After your response, on a new line add a brief coaching note starting with "💡 Tip:" tailored to the ${jungianType} type — what worked, what to try differently, or a specific technique from the Social Code frameworks.`;
}

export default function PracticePage() {
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [scenario, setScenario] = useState(SCENARIO_CATEGORIES[0].scenarios[0]);
  const [jungianType, setJungianType] = useState("INFP");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleCategoryChange(index: number) {
    setCategoryIndex(index);
    setScenario(SCENARIO_CATEGORIES[index].scenarios[0]);
  }

  async function startScenario() {
    setError("");
    setStarted(true);
    setMessages([]);
    setLoading(true);
    const opening: Message = { role: "user", content: "Hi." };
    try {
      const reply = await callAI([opening], buildSystem(scenario, jungianType));
      setMessages([opening, { role: "assistant", content: reply }]);
    } catch (err: unknown) {
      setError(`Something went wrong: ${err instanceof Error ? err.message : "Unknown error"}`);
      setStarted(false);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput("");
    setError("");
    const updated: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(updated);
    setLoading(true);
    try {
      const reply = await callAI(updated, buildSystem(scenario, jungianType));
      setMessages([...updated, { role: "assistant", content: reply }]);
    } catch (err: unknown) {
      setError(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStarted(false);
    setMessages([]);
    setInput("");
    setError("");
  }

  const currentCategory = SCENARIO_CATEGORIES[categoryIndex];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: BRAND.dark, fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-white/5">
        <Link href="/" className="text-sm font-black text-white tracking-tight">
          Social Code
        </Link>
        <span
          className="text-xs font-semibold px-3 py-1 rounded-full"
          style={{ background: "rgba(0,217,192,0.1)", color: BRAND.teal }}
        >
          Social Simulator
        </span>
      </header>

      <div className="max-w-2xl w-full mx-auto px-4 pt-10 pb-16 flex-1">

        {/* Hero */}
        {!started && (
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
              style={{ background: "rgba(0,217,192,0.1)", border: "1px solid rgba(0,217,192,0.2)" }}
            >
              <MessageSquare size={22} style={{ color: BRAND.teal }} strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mb-2">
              Practice Real Conversations
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
              Pick a scenario. Set your type. Get real-time coaching tailored to how you&apos;re wired.
            </p>
          </div>
        )}

        {/* Setup */}
        {!started && (
          <div
            className="rounded-2xl border border-white/5 p-6 mb-4"
            style={{ background: BRAND.card }}
          >
            <div className="space-y-5">

              {/* Category pills */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {SCENARIO_CATEGORIES.map((cat, i) => (
                    <button
                      key={cat.label}
                      onClick={() => handleCategoryChange(i)}
                      className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
                      style={{
                        background: categoryIndex === i ? "rgba(0,217,192,0.15)" : BRAND.input,
                        color: categoryIndex === i ? BRAND.teal : "#64748b",
                        border: categoryIndex === i ? "1px solid rgba(0,217,192,0.3)" : "1px solid transparent",
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scenario */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Scenario</label>
                <select
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white border border-white/5 outline-none"
                  style={{ background: BRAND.input }}
                >
                  {currentCategory.scenarios.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                  Your Type{" "}
                  <Link href="/assess" className="normal-case font-normal ml-1" style={{ color: BRAND.teal }}>
                    (don&apos;t know yours? Take the assessment →)
                  </Link>
                </label>
                <select
                  value={jungianType}
                  onChange={(e) => setJungianType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white border border-white/5 outline-none"
                  style={{ background: BRAND.input }}
                >
                  {JUNGIAN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {error && (
                <div
                  className="px-4 py-3 rounded-xl text-xs"
                  style={{ background: "rgba(255,107,107,0.1)", color: BRAND.coral, border: "1px solid rgba(255,107,107,0.2)" }}
                >
                  {error}
                </div>
              )}
            </div>

            <button
              onClick={startScenario}
              disabled={loading}
              className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-40"
              style={{ background: BRAND.coral, color: "white" }}
            >
              <MessageSquare size={15} strokeWidth={2.5} />
              {loading ? "Starting…" : "Start Simulation"}
            </button>
          </div>
        )}

        {/* Chat */}
        {started && (
          <div
            className="rounded-2xl border border-white/5 overflow-hidden"
            style={{ background: BRAND.card }}
          >
            {/* Chat header */}
            <div
              className="flex items-center justify-between px-5 py-4 border-b border-white/5"
            >
              <div>
                <p className="text-xs font-semibold text-white leading-tight">{scenario}</p>
                <p className="text-xs text-slate-500 mt-0.5">You: {jungianType} · {currentCategory.label}</p>
              </div>
              <button
                onClick={reset}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors"
              >
                <ChevronLeft size={12} />
                Change
              </button>
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-5 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className="max-w-sm rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
                    style={{
                      background: msg.role === "user" ? BRAND.coral : BRAND.input,
                      color: msg.role === "user" ? "white" : "#cbd5e1",
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div
                    className="rounded-2xl px-4 py-3 text-sm text-slate-500"
                    style={{ background: BRAND.input }}
                  >
                    <span className="animate-pulse">Thinking…</span>
                  </div>
                </div>
              )}
              {error && (
                <div
                  className="text-xs px-4 py-2 rounded-xl"
                  style={{ background: "rgba(255,107,107,0.1)", color: BRAND.coral }}
                >
                  {error}
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-white/5 p-4 flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Type your response…"
                className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 border border-white/5 outline-none"
                style={{ background: BRAND.input }}
                autoFocus
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="px-4 py-2.5 rounded-xl transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: BRAND.teal }}
              >
                <Send size={15} style={{ color: "#080F18" }} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        {started && (
          <p className="text-center text-xs text-slate-600 mt-4">
            Want a personalized plan?{" "}
            <Link href="/book" style={{ color: BRAND.teal }}>Book a free call with Shavi →</Link>
          </p>
        )}
      </div>
    </div>
  );
}
