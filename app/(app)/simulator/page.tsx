"use client";

import { useState, useRef, useEffect } from "react";
import { Send, MessageSquare, RefreshCw } from "lucide-react";

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
      "Introducing yourself at a community or local event",
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
      "Talking to someone you admire",
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
      "Presenting your work to a room you don't know well",
      "Making small talk at a work social event",
      "Asking a senior person for advice or mentorship",
      "Handling negative feedback from your manager",
      "Starting a conversation with a coworker you don't know well",
    ],
  },
  {
    label: "Phone & Digital",
    scenarios: [
      "Calling to make a doctor or dentist appointment",
      "Calling a business to make a complaint",
      "Leaving a voicemail that doesn't sound awkward",
      "Video call where you have to present or lead",
      "Cold-calling someone you've never spoken to",
      "Following up on an unanswered message without seeming needy",
    ],
  },
  {
    label: "Family",
    scenarios: [
      "Large family gathering where everyone asks about your life",
      "Navigating a critical or difficult family member",
      "Holiday dinner with relatives who question your choices",
      "Introducing a partner to your family for the first time",
      "Having an honest conversation with a parent",
      "Setting a boundary with a family member",
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
      "Being vulnerable with a friend about something personal",
      "Saying no to a friend's invitation without damaging the friendship",
      "Reconnecting with an old friend",
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
    label: "Awkward & Uncomfortable",
    scenarios: [
      "Recovering after saying something awkward",
      "Someone makes a joke at your expense — responding without spiraling",
      "Being introduced to someone and forgetting their name immediately",
      "Running into someone you've been avoiding",
      "Someone asks about something personal you don't want to discuss",
      "Being the only one who doesn't get a joke in a group",
      "Continuing a conversation after a long awkward silence",
      "Listening without offering solutions — a friend needs to vent",
      "Going deeper in a conversation beyond surface banter",
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

export default function SimulatorPage() {
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

  // When category changes, reset to first scenario in that category
  function handleCategoryChange(index: number) {
    setCategoryIndex(index);
    setScenario(SCENARIO_CATEGORIES[index].scenarios[0]);
  }

  function buildSystem() {
    return `You are roleplaying as a person in this social scenario: "${scenario}".
The user is a ${jungianType} personality type (Jungian/Myers-Briggs) practicing their social skills.
Respond naturally as the other person in the conversation. Keep your response to 1-3 sentences.
After your response, on a new line add a brief coaching note starting with "💡 Tip:" tailored to the ${jungianType} type — what worked, what to try differently, or a specific technique from the Social Code frameworks.`;
  }

  async function startScenario() {
    setError("");
    setStarted(true);
    setMessages([]);
    setLoading(true);
    const opening: Message = { role: "user", content: "Hi." };
    try {
      const reply = await callAI([opening], buildSystem());
      setMessages([opening, { role: "assistant", content: reply }]);
    } catch (err: unknown) {
      setError(`Connection failed: ${err instanceof Error ? err.message : "Unknown error"}`);
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
      const reply = await callAI(updated, buildSystem());
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
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Simulator</h1>
        <p className="mt-1 text-sm text-slate-500">Practice social scenarios with AI. Get real-time coaching.</p>
      </div>

      {/* Config */}
      {!started && (
        <div className="rounded-xl border border-white/5 p-6 mb-6" style={{ background: "#131E2B" }}>
          <h3 className="text-sm font-semibold text-white mb-5">Setup Scenario</h3>
          <div className="space-y-5">

            {/* Category tabs */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                {SCENARIO_CATEGORIES.map((cat, i) => (
                  <button
                    key={cat.label}
                    onClick={() => handleCategoryChange(i)}
                    className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
                    style={{
                      background: categoryIndex === i ? "rgba(0,217,192,0.15)" : "#1A2332",
                      color: categoryIndex === i ? "#00D9C0" : "#64748b",
                      border: categoryIndex === i ? "1px solid rgba(0,217,192,0.3)" : "1px solid transparent",
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scenario dropdown */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Scenario <span className="text-slate-600">({currentCategory.scenarios.length} available)</span>
              </label>
              <select
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white border border-white/5 outline-none"
                style={{ background: "#1A2332" }}
              >
                {currentCategory.scenarios.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Your Jungian Type</label>
              <select
                value={jungianType}
                onChange={(e) => setJungianType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white border border-white/5 outline-none"
                style={{ background: "#1A2332" }}
              >
                {JUNGIAN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-lg text-xs" style={{ background: "rgba(255,107,107,0.1)", color: "#FF6B6B", border: "1px solid rgba(255,107,107,0.2)" }}>
                {error}
              </div>
            )}
          </div>

          <button
            onClick={startScenario}
            disabled={loading}
            className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: "#00D9C0", color: "#080F18" }}
          >
            <MessageSquare size={15} strokeWidth={2.5} />
            {loading ? "Connecting..." : "Start Simulation"}
          </button>
        </div>
      )}

      {/* Chat */}
      {started && (
        <div className="rounded-xl border border-white/5 overflow-hidden" style={{ background: "#131E2B" }}>
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
            <div>
              <div className="text-xs font-medium text-white">{scenario}</div>
              <div className="text-xs text-slate-500 mt-0.5">You: {jungianType} · {currentCategory.label}</div>
            </div>
            <button onClick={reset} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors">
              <RefreshCw size={12} />
              Reset
            </button>
          </div>

          <div className="h-96 overflow-y-auto p-5 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-sm rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
                  style={{
                    background: msg.role === "user" ? "#FF6B6B" : "#1A2332",
                    color: msg.role === "user" ? "white" : "#cbd5e1",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-xl px-4 py-3 text-sm text-slate-500" style={{ background: "#1A2332" }}>
                  <span className="animate-pulse">Thinking...</span>
                </div>
              </div>
            )}
            {error && (
              <div className="text-xs px-4 py-2 rounded-lg" style={{ background: "rgba(255,107,107,0.1)", color: "#FF6B6B" }}>
                {error}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-white/5 p-4 flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Type your response..."
              className="flex-1 px-4 py-2.5 rounded-lg text-sm text-white placeholder-slate-500 border border-white/5 outline-none transition-colors"
              style={{ background: "#1A2332" }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 rounded-lg transition-all hover:opacity-90 disabled:opacity-40"
              style={{ background: "#00D9C0" }}
            >
              <Send size={15} style={{ color: "#080F18" }} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
