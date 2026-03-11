"use client";

import { useState } from "react";
import Image from "next/image";

const RESOURCES = [
  { id: "Fearless Approach System", label: "Fearless Approach System", desc: "How to approach anyone, anywhere — the full guide", color: "#00D9C0" },
  { id: "Stop Replaying", label: "Stop Replaying E-Book", desc: "End the 2 AM overthink loop — book + workbook", color: "#FF6B6B" },
  { id: "TALK Check", label: "TALK Check", desc: "The 10-second delivery framework", color: "#4DE8D4" },
  { id: "Full Framework Library", label: "Full Framework Library", desc: "All 7 frameworks — SPARK, SHIELD, BRAVE, and more", color: "#00D9C0" },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [selectedResource, setSelectedResource] = useState("Fearless Approach System");
  const [msg, setMsg] = useState<{ text: string; color: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, resource: selectedResource }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ text: "You're in. Check your inbox — your framework is on its way.", color: "#00D9C0" });
        setEmail("");
      } else {
        setMsg({ text: data.error || "Something went wrong. Try again.", color: "#FF6B6B" });
      }
    } catch {
      setMsg({ text: "Could not connect. Try again later.", color: "#FF6B6B" });
    }
    setSubmitting(false);
  }

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  }

  return (
    <div className="antialiased" style={{ fontFamily: "var(--font-outfit), sans-serif", backgroundColor: "#0D1825", color: "#F7F9FC", overflowX: "hidden" }}>
      <style>{`
        .grid-bg {
          background-image: linear-gradient(rgba(0,217,192,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,217,192,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        .text-gradient {
          background: linear-gradient(135deg, #00D9C0 0%, #00A896 50%, #4DE8D4 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .glow-coral { box-shadow: 0 0 35px rgba(255,107,107,0.3); }
        .glow-teal  { box-shadow: 0 0 35px rgba(0,217,192,0.2); }
        .hero-orb { position: absolute; border-radius: 50%; filter: blur(120px); pointer-events: none; z-index: 0; }
        .framework-card { transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease; }
        .framework-card:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,217,192,0.12); border-color: rgba(0,217,192,0.35); }
        .btn-primary { transition: transform 150ms ease, box-shadow 150ms ease, background-color 150ms ease; cursor: pointer; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 40px rgba(255,107,107,0.4); background-color: #E55E5E; }
        .btn-primary:active { transform: translateY(0); }
        .btn-ghost { transition: background-color 150ms ease, color 150ms ease; }
        .btn-ghost:hover { background-color: rgba(0,217,192,0.08); color: #00D9C0; }
        .nav-link { transition: color 150ms ease; }
        .nav-link:hover { color: #00D9C0; }
        .divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(0,217,192,0.12), transparent); }
        .manifesto-line { border-left: 2px solid #00D9C0; padding-left: 1.25rem; margin-bottom: 1rem; }
        .email-input:focus { outline: none; border-color: #00D9C0; box-shadow: 0 0 0 1px #00D9C0; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up    { animation: fadeUp 0.7s ease forwards; }
        .fade-up-d1 { animation: fadeUp 0.7s 0.1s ease both; }
        .fade-up-d2 { animation: fadeUp 0.7s 0.2s ease both; }
        .fade-up-d3 { animation: fadeUp 0.7s 0.35s ease both; }
        .fade-up-d4 { animation: fadeUp 0.7s 0.5s ease both; }
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }
      `}</style>

      {/* NAVBAR */}
      <header className="fixed top-0 left-0 right-0 z-50" style={{ backdropFilter: "blur(16px)", background: "rgba(13,24,37,0.85)", borderBottom: "1px solid rgba(0,217,192,0.08)" }}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => scrollTo("hero")} className="flex items-center gap-2">
              <Image src="/logo.svg" alt="Social Code" width={120} height={32} />
            </button>
            <div className="hidden md:flex items-center gap-8">
              {["origin","about","manifesto","frameworks","resources"].map((s) => (
                <button key={s} onClick={() => scrollTo(s)} className="nav-link text-slate-400 text-sm font-medium capitalize">{s}</button>
              ))}
            </div>
            <div className="hidden md:flex items-center gap-3">
              <button onClick={() => scrollTo("start")} className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: "#FF6B6B" }}>
                START HERE
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7h9M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
            <button className="md:hidden text-slate-400 hover:text-white p-2 rounded-lg" onClick={() => setMenuOpen(!menuOpen)}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </button>
          </div>
          {menuOpen && (
            <div className="flex flex-col gap-2 pb-4 md:hidden">
              {["origin","about","manifesto","frameworks","resources"].map((s) => (
                <button key={s} onClick={() => scrollTo(s)} className="block px-3 py-2.5 text-slate-300 text-sm font-medium text-left capitalize">{s}</button>
              ))}
              <button onClick={() => scrollTo("start")} className="mt-2 px-5 py-3 rounded-lg text-sm font-semibold text-white text-center" style={{ background: "#FF6B6B" }}>START HERE</button>
            </div>
          )}
        </nav>
      </header>

      {/* HERO */}
      <section id="hero" className="relative grid-bg min-h-screen flex items-center pt-16 overflow-hidden">
        <div className="hero-orb w-96 h-96 top-20 left-1/2 -translate-x-1/2" style={{ background: "rgba(0,217,192,0.1)" }}></div>
        <div className="hero-orb w-64 h-64 bottom-20 left-10" style={{ background: "rgba(77,232,212,0.06)" }}></div>
        <div className="hero-orb w-80 h-80 top-40 right-0" style={{ background: "rgba(255,107,107,0.05)" }}></div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="fade-up">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium" style={{ background: "rgba(0,217,192,0.1)", border: "1px solid rgba(0,217,192,0.25)", color: "#00D9C0" }}>
              Jungian Psychology + Systematic Frameworks · Built by an introvert. For introverts.
            </span>
          </div>
          <h1 className="fade-up-d1 mt-8 text-5xl sm:text-6xl lg:text-7xl font-black leading-none tracking-tight">
            Still awkward.<br/>Still weird.<br/>
            <span className="text-gradient">Just competent.</span>
          </h1>
          <p className="fade-up-d2 mt-8 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: "var(--font-work-sans, sans-serif)", color: "#94a3b8" }}>
            Social Code gives introverts the actual mechanics to start conversations, build real connections, and stop overthinking — without pretending to be someone else.
          </p>
          <p className="fade-up-d2 mt-3 text-base max-w-xl mx-auto" style={{ fontFamily: "var(--font-work-sans, sans-serif)", color: "#64748b" }}>
            Not "just be confident." Not affirmations. Frameworks. Reps. Results.
          </p>
          <div className="fade-up-d3 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => scrollTo("start")} className="btn-primary glow-coral inline-flex items-center gap-2.5 px-7 py-4 rounded-xl text-base font-bold text-white" style={{ background: "#FF6B6B", letterSpacing: "0.02em" }}>
              CRACK THE CODE
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button onClick={() => scrollTo("frameworks")} className="btn-ghost inline-flex items-center gap-2 px-6 py-4 rounded-xl text-base font-medium text-slate-400 border border-slate-700">
              See the frameworks
            </button>
          </div>
          <div className="fade-up-d4 mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div className="text-center"><div className="text-4xl font-black text-gradient">10k+</div><div className="mt-2 text-xs text-slate-500 font-medium uppercase tracking-wider">Doors knocked</div></div>
            <div className="text-center border-x border-slate-800"><div className="text-4xl font-black" style={{ color: "#F7F9FC" }}>7</div><div className="mt-2 text-xs text-slate-500 font-medium uppercase tracking-wider">Core frameworks</div></div>
            <div className="text-center"><div className="text-4xl font-black text-gradient">0</div><div className="mt-2 text-xs text-slate-500 font-medium uppercase tracking-wider">Bullshit advice</div></div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent, #0D1825)" }}></div>
      </section>

      <div className="divider"></div>

      {/* ORIGIN */}
      <section id="origin" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium" style={{ background: "rgba(0,217,192,0.1)", border: "1px solid rgba(0,217,192,0.25)", color: "#00D9C0" }}>The Origin</span>
            <h2 className="mt-6 text-4xl sm:text-5xl font-black leading-tight tracking-tight">This wasn&apos;t built in a<br/><span style={{ color: "#FF6B6B" }}>classroom.</span></h2>
            <div className="mt-6 space-y-4 text-slate-400 leading-relaxed" style={{ fontFamily: "var(--font-work-sans, sans-serif)" }}>
              <p>I moved somewhere new knowing absolutely nobody. No network. No safety net. People meant well when they told me to just be confident, just put myself out there, just be myself. I tried that. It didn&apos;t work. Because confidence without skill is just wishful thinking, and being yourself only helps if you already know how to connect.</p>
              <p>Eventually I ended up in door-to-door sales. Pest control, solar, fiber optic. Not because I had a plan. Because I needed money and it was the only thing available. I genuinely hated every second of it at first. Every knock felt like volunteering for rejection.</p>
              <p>But I kept going. Over 10,000 doors. Over 10,000 moments where I had about five seconds to make something work before someone decided to listen or walk away. There was no room for theory out there. You learned or you failed, over and over, until the learning started to stick.</p>
              <p>Somewhere in the middle of all that I found Carl Jung&apos;s work on psychological development. And something clicked. What I had been doing without realizing it had a name. Individuation. Facing the parts of yourself you&apos;ve spent your whole life avoiding, through direct controlled exposure to the exact situations that frighten you most. I wasn&apos;t learning tricks. I was finishing developmental work that most people never start.</p>
              <p className="text-white font-medium">Social Code is the systematic version of everything I built through that process. Every framework, every mechanic, every insight I had to earn the hard way. So you don&apos;t have to start from scratch the way I did.</p>
            </div>
            <div className="mt-8">
              <p className="text-lg font-bold text-white">Shavi, Founder</p>
              <p className="text-sm text-slate-500 mt-0.5">@GetSocialCode</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl p-6 border border-white/5" style={{ background: "#131E2B" }}>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">The Problem With Other Advice</div>
              <div className="space-y-3">
                {[
                  `"Just be confident" — cool. How? They never tell you.`,
                  `"Be yourself" — if that worked, you wouldn't be here.`,
                  `"Work the room" — built by extroverts, for extroverts.`,
                  `"Visualize success" — you need mechanics, not affirmations.`,
                ].map((t) => (
                  <div key={t} className="flex items-start gap-3">
                    <span className="mt-0.5 flex-shrink-0" style={{ color: "#FF6B6B" }}>✗</span>
                    <span className="text-sm text-slate-400">{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl p-6 border glow-teal" style={{ background: "#131E2B", borderColor: "rgba(0,217,192,0.2)" }}>
              <div className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#00D9C0" }}>The Social Code Difference</div>
              <div className="space-y-3">
                {[
                  "Jungian psychology — not pop psychology platitudes",
                  "Systematic frameworks you can study and repeat",
                  "Built for introverts — accounts for your energy",
                  "Fewer conversations, more depth — quality over quantity",
                ].map((t) => (
                  <div key={t} className="flex items-start gap-3">
                    <span className="mt-0.5 flex-shrink-0" style={{ color: "#00D9C0" }}>✓</span>
                    <span className="text-sm text-slate-300">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* ABOUT */}
      <section id="about" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Photo */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl" style={{ background: "linear-gradient(135deg, rgba(0,217,192,0.15), rgba(255,107,107,0.08))", transform: "rotate(-3deg)", borderRadius: "24px" }}></div>
              <Image
                src="/shavi.png"
                alt="Shavi — Founder of Social Code"
                width={420}
                height={520}
                className="relative rounded-3xl object-cover"
                style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }}
              />
            </div>
          </div>

          {/* Text */}
          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium" style={{ background: "rgba(0,217,192,0.1)", border: "1px solid rgba(0,217,192,0.25)", color: "#00D9C0" }}>About Me</span>
            <h2 className="mt-6 text-4xl sm:text-5xl font-black leading-tight tracking-tight">
              Hi, I&apos;m <span className="text-gradient">Shavi.</span>
            </h2>
            <div className="mt-6 space-y-4 text-slate-400 leading-relaxed" style={{ fontFamily: "var(--font-work-sans, sans-serif)" }}>
              <p>
                There&apos;s a specific kind of loneliness that nobody talks about. Not the kind where you have nobody around. The kind where you&apos;re surrounded by people and still feel completely invisible. You watch everyone else move through rooms like they got a manual you never received. Conversations flow for them. Connections happen naturally. And you go home wondering what&apos;s wrong with you.
              </p>
              <p>
                I know that feeling well. I spent years inside it.
              </p>
              <p>
                The thing nobody told me, the thing I had to figure out the long way, is that nothing was wrong with me. What I was experiencing had a name. Carl Jung, the psychologist who first defined introversion, described it simply as drawing your energy from within rather than from the world around you. A way of processing. An orientation. Not a flaw.
              </p>
              <p>
                But somewhere along the way culture turned introversion into a diagnosis. A reason you&apos;re bad at parties. A personality type that comes pre-packaged with social failure. They gave you a label and left you with nothing else. That&apos;s the part I&apos;m here to dismantle.
              </p>
              <p>
                Because the real problem was never who you are. It was that nobody ever sat you down and taught you the actual mechanics of human connection.
              </p>
              <p className="text-white font-medium">
                You&apos;re not broken. You just never got the blueprint.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-4">
              <div>
                <p className="text-lg font-bold text-white">Shavi</p>
                <p className="text-sm mt-0.5" style={{ color: "#00D9C0" }}>Founder, Social Code · @GetSocialCode</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* MANIFESTO */}
      <section id="manifesto" className="py-24" style={{ background: "#101B28" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium" style={{ background: "rgba(0,217,192,0.1)", border: "1px solid rgba(0,217,192,0.25)", color: "#00D9C0" }}>The Manifesto</span>
            <h2 className="mt-6 text-4xl sm:text-5xl font-black tracking-tight">Who we are.<br/><span className="text-gradient">Who we&apos;re not.</span></h2>
          </div>
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-bold text-white mb-4">WHO WE ARE</h3>
              <div className="manifesto-line"><p className="text-slate-300 leading-relaxed" style={{ fontFamily: "var(--font-work-sans, sans-serif)" }}>We&apos;re the introverts who got tired of being lonely. The socially anxious who learned systems instead of waiting for confidence that never came. We stopped sitting with the label and started asking the question nobody else was asking — what if there&apos;s nothing wrong with us, and we just never learned how any of this actually works.</p></div>
              <div className="manifesto-line"><p className="text-slate-300 leading-relaxed" style={{ fontFamily: "var(--font-work-sans, sans-serif)" }}>We don&apos;t do theory. We don&apos;t do affirmations. We don&apos;t do "just be yourself."</p></div>
              <p className="text-xl font-bold text-white">We do frameworks. Reps. Results.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4" style={{ color: "#FF6B6B" }}>WHO WE&apos;RE AGAINST</h3>
              <div className="space-y-5">
                {[
                  { title: "The Confidence Cult", body: `They sell empty platitudes. "Believe in yourself!" "Visualize success!" Cool. How? They never tell you because if they taught you actual systems you wouldn't need them anymore. They keep you dependent. We make you competent.` },
                  { title: "The Extrovert Playbook", body: `"Work the room." "Talk to 50 people at the event." That's their game. Not yours. Your game is fewer conversations, more depth. Strategic energy management, not marathon socializing. Quality connections, not quantity contacts.` },
                  { title: "The Networking Industrial Complex", body: `LinkedIn coaches. Networking events. "Build your personal brand!" They teach you to collect business cards and fake enthusiasm. They don't teach you how to READ people, START conversations, or BUILD genuine connections. We teach the mechanics they're too scared to admit exist.` },
                ].map((item) => (
                  <div key={item.title} className="p-5 rounded-xl" style={{ background: "#131E2B" }}>
                    <h4 className="text-sm font-bold text-white mb-2">{item.title}</h4>
                    <p className="text-sm text-slate-400 leading-relaxed" style={{ fontFamily: "var(--font-work-sans, sans-serif)" }}>{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-8 rounded-2xl text-center glow-teal" style={{ background: "#131E2B", border: "1px solid rgba(0,217,192,0.15)" }}>
              <blockquote className="text-2xl sm:text-3xl font-black text-white leading-tight">
                &ldquo;Until you make the unconscious conscious,<br/>it will direct your life,<br/>and you will call it fate.&rdquo;
              </blockquote>
              <p className="mt-4 text-sm font-medium" style={{ color: "#00D9C0" }}>— Carl Jung</p>
              <p className="mt-3 text-sm text-slate-500" style={{ fontFamily: "var(--font-work-sans, sans-serif)" }}>Social Code is that process applied to social engagement. You&apos;re not performing. You&apos;re consciously developing.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* FRAMEWORKS */}
      <section id="frameworks" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium" style={{ background: "rgba(0,217,192,0.1)", border: "1px solid rgba(0,217,192,0.25)", color: "#00D9C0" }}>The Frameworks</span>
          <h2 className="mt-6 text-4xl sm:text-5xl font-black tracking-tight leading-tight">Seven systems.<br/><span className="text-gradient">Zero fluff.</span></h2>
          <p className="mt-5 text-slate-400 text-lg max-w-xl mx-auto" style={{ fontFamily: "var(--font-work-sans, sans-serif)" }}>Each framework is a distilled, repeatable system. Not a vibe, not a mindset. Study it. Practice it. Use it.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { abbr: "S", name: "SPARK", sub: "Starting Conversations", color: "#00D9C0", bg: "rgba(0,217,192,0.12)", desc: "The system for initiating conversations without freezing up. Know exactly what to say in the first 10 seconds — to anyone, anywhere, without it feeling forced.", tags: ["Openers","Beginner"] },
            { abbr: "3S", name: "3-Second Social Scan", sub: "Reading the Room", color: "#FF6B6B", bg: "rgba(255,107,107,0.12)", desc: "Before you approach anyone, know if they actually want to be talked to. A 3-second read of body language, context, and energy so you stop wasting effort on closed signals.", tags: ["Reading people","Essential"], badge: "Start here" },
            { abbr: "FA", name: "Fearless Approach System", sub: "Overcoming Approach Anxiety", color: "#4DE8D4", bg: "rgba(77,232,212,0.1)", desc: "The full architecture for approaching anyone. When to go, how to go, what to say. Built for introverts who need to know WHO is worth the energy before spending it.", tags: ["Anxiety","Core"] },
            { abbr: "TC", name: "TALK Check", sub: "Tone · Attention · Language · Kinetics", color: "#00D9C0", bg: "rgba(0,217,192,0.12)", desc: "The 10-second delivery layer you run before every conversation. Eliminate the signals that undercut your actual competence — tone, eye contact, language, body language.", tags: ["Delivery","Non-verbal"] },
            { abbr: "B", name: "BRAVE", sub: "Difficult Conversations", color: "#FF6B6B", bg: "rgba(255,107,107,0.12)", desc: "Navigate hard conversations without shutting down or blowing up. The framework for emotional regulation and honest communication even when it's uncomfortable.", tags: ["Conflict","Emotional reg."] },
            { abbr: "SH", name: "SHIELD", sub: "Handling Difficult People", color: "#4DE8D4", bg: "rgba(77,232,212,0.1)", desc: "Not everyone deserves your energy. SHIELD teaches you to identify and handle energy vampires, boundary-pushers, and difficult personalities without being a pushover or a jerk.", tags: ["Boundaries","Advanced"] },
          ].map((f) => (
            <article key={f.name} className="framework-card rounded-2xl p-7 border border-slate-800 relative overflow-hidden" style={{ background: "#131E2B" }}>
              {f.badge && <div className="absolute top-4 right-4 text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "rgba(255,107,107,0.12)", color: "#FF6B6B" }}>{f.badge}</div>}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 text-sm font-black" style={{ background: f.bg, color: f.color }}>{f.abbr}</div>
              <h3 className="text-lg font-bold text-white">{f.name}</h3>
              <p className="text-xs font-medium mt-0.5 mb-3" style={{ color: f.color }}>{f.sub}</p>
              <p className="text-slate-400 text-sm leading-relaxed" style={{ fontFamily: "var(--font-work-sans, sans-serif)" }}>{f.desc}</p>
              <div className="mt-5 flex gap-2 flex-wrap">
                {f.tags.map((t) => <span key={t} className="text-xs px-2.5 py-1 rounded-full" style={{ background: `${f.bg}`, color: f.color }}>{t}</span>)}
              </div>
            </article>
          ))}

          {/* Stop Replaying — full width */}
          <article className="framework-card rounded-2xl p-7 border border-slate-800 sm:col-span-2 lg:col-span-3" style={{ background: "#131E2B" }}>
            <div className="grid sm:grid-cols-2 gap-6 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black" style={{ background: "rgba(255,107,107,0.12)", color: "#FF6B6B" }}>SR</div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Stop Replaying</h3>
                    <p className="text-xs font-medium" style={{ color: "#FF6B6B" }}>End the 2 AM Overthink Loop</p>
                  </div>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed" style={{ fontFamily: "var(--font-work-sans, sans-serif)" }}>
                  For introverts who replay every conversation for days after it happens. Turn 3 days of rumination into 10 minutes of processing. The Conversation Audit, Redirect Protocol, and Pre-Game System combined.
                </p>
              </div>
              <div className="space-y-3">
                {[
                  { n: "1", title: "Conversation Audit", sub: "Separate what happened from the story you invented" },
                  { n: "2", title: "Redirect Protocol", sub: "3-minute emergency stop for 2 AM spirals" },
                  { n: "3", title: "Pre-Game System", sub: "Prep before conversations to stop them from haunting you" },
                ].map((s) => (
                  <div key={s.n} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "#1A2332" }}>
                    <span className="text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,107,107,0.15)", color: "#FF6B6B" }}>{s.n}</span>
                    <div>
                      <div className="text-xs font-semibold text-white">{s.title}</div>
                      <div className="text-xs text-slate-500">{s.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>
      </section>

      <div className="divider"></div>

      {/* RESOURCES */}
      <section id="resources" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium" style={{ background: "rgba(0,217,192,0.1)", border: "1px solid rgba(0,217,192,0.25)", color: "#00D9C0" }}>Free Resources</span>
          <h2 className="mt-6 text-4xl sm:text-5xl font-black tracking-tight">Start with these.<br/><span className="text-gradient">Apply them today.</span></h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {[
            { title: "Fearless Approach System", desc: "The complete guide to approaching anyone, building deep connections, and finding your people. Jungian psychology meets practical frameworks.", color: "#00D9C0" },
            { title: "Stop Replaying — E-Book + Workbook", desc: "Turn 3 days of rumination into 10 minutes of processing. The Conversation Audit, Redirect Protocol, and 30-day implementation plan.", color: "#FF6B6B" },
            { title: "TALK Check", desc: "The 10-second delivery framework you run before any conversation. Tone. Attention. Language. Kinetics. Never undercut your competence again.", color: "#4DE8D4" },
            { title: "Full Framework Library", desc: "SPARK, SHIELD, BRAVE, 3-Second Social Scan + more. All seven frameworks, full content, in one place.", color: "#00D9C0", glow: true },
          ].map((r) => (
            <div key={r.title} className={`rounded-2xl p-7 border hover:border-white/10 transition-all ${r.glow ? "glow-teal" : "border-white/5"}`} style={{ background: "#131E2B", ...(r.glow ? { borderColor: "rgba(0,217,192,0.2)" } : {}) }}>
              <h3 className="text-base font-bold text-white mb-2">{r.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-5" style={{ fontFamily: "var(--font-work-sans, sans-serif)" }}>{r.desc}</p>
              <button onClick={() => scrollTo("start")} className="text-sm font-semibold" style={{ color: r.color }}>Get it free →</button>
            </div>
          ))}
        </div>
      </section>

      <div className="divider"></div>

      {/* SOCIAL PROOF */}
      <section className="py-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium" style={{ background: "rgba(0,217,192,0.1)", border: "1px solid rgba(0,217,192,0.25)", color: "#00D9C0" }}>Real Results</span>
        </div>
        <div className="rounded-2xl p-8 border glow-teal" style={{ background: "#131E2B", borderColor: "rgba(0,217,192,0.15)" }}>
          <svg width="32" height="24" viewBox="0 0 32 24" fill="none" className="mb-6 opacity-40"><path d="M0 24V14.4C0 6.4 4.267 1.6 12.8 0l1.6 2.4C10.133 3.6 7.733 6.267 7.2 10.4H13.6V24H0ZM18.4 24V14.4C18.4 6.4 22.667 1.6 31.2 0l1.6 2.4C28.533 3.6 26.133 6.267 25.6 10.4H32V24H18.4Z" fill="#00D9C0"/></svg>
          <p className="text-lg sm:text-xl text-white leading-relaxed font-medium">
            The system made me realize that social interactions are often a much bigger deal in our imagination than reality, as we apply our own emotions and inferences to the situation.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "rgba(0,217,192,0.12)", color: "#00D9C0" }}>M</div>
            <div>
              <p className="text-sm font-semibold text-white">Matthew A.</p>
              <p className="text-xs text-slate-500">Marketing Manager</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="start" className="py-28 relative overflow-hidden">
        <div className="hero-orb w-96 h-96 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ background: "rgba(0,217,192,0.08)" }}></div>
        <div className="relative z-10 max-w-xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
            Ready to crack<br/><span className="text-gradient">the social code?</span>
          </h2>
          <p className="mt-6 text-lg text-slate-400 max-w-md mx-auto leading-relaxed" style={{ fontFamily: "var(--font-work-sans, sans-serif)" }}>
            Pick a framework. Drop your email. Get it free — straight to your inbox.
          </p>

          {/* Resource picker */}
          <div className="mt-8 grid gap-3 text-left">
            {RESOURCES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedResource(r.id)}
                className="flex items-center gap-4 p-4 rounded-xl border transition-all text-left"
                style={{
                  background: selectedResource === r.id ? "rgba(0,217,192,0.06)" : "#131E2B",
                  borderColor: selectedResource === r.id ? r.color : "rgba(255,255,255,0.06)",
                }}
              >
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{ borderColor: selectedResource === r.id ? r.color : "#334155" }}>
                  {selectedResource === r.id && (
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: r.color }} />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{r.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5" style={{ fontFamily: "var(--font-work-sans, sans-serif)" }}>{r.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <form className="mt-6 flex flex-col sm:flex-row gap-3" onSubmit={handleSubmit}>
            <label htmlFor="email-input" className="sr-only">Email address</label>
            <input
              id="email-input"
              type="email"
              required
              placeholder="Enter your email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="email-input flex-1 px-5 py-4 rounded-xl text-sm text-white placeholder-slate-500 border border-slate-700 transition-colors"
              style={{ background: "#131E2B" }}
            />
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary glow-coral px-6 py-4 rounded-xl text-sm font-bold text-white whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "#FF6B6B", letterSpacing: "0.02em" }}
            >
              {submitting ? "Sending..." : "SEND IT →"}
            </button>
          </form>
          {msg && <p className="mt-4 text-sm" style={{ color: msg.color, fontFamily: "var(--font-work-sans, sans-serif)" }}>{msg.text}</p>}
          <p className="mt-4 text-sm text-slate-600" style={{ fontFamily: "var(--font-work-sans, sans-serif)" }}>Free. No credit card. Unsubscribe anytime.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#080F18", borderTop: "1px solid rgba(0,217,192,0.06)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <Image src="/logo.svg" alt="Social Code" width={120} height={32} className="opacity-75" />
            <nav className="flex items-center gap-6">
              {["origin","about","manifesto","frameworks","resources"].map((s) => (
                <button key={s} onClick={() => scrollTo(s)} className="nav-link text-xs text-slate-600 hover:text-slate-400 capitalize">{s}</button>
              ))}
              <a href="https://www.instagram.com/getsocialcode" target="_blank" rel="noopener noreferrer" className="nav-link text-xs text-slate-600 hover:text-slate-400">@GetSocialCode</a>
            </nav>
            <p className="text-xs text-slate-700" style={{ fontFamily: "var(--font-work-sans, sans-serif)" }}>&copy; 2026 Social Code. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
