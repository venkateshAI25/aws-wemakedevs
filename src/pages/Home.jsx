import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlugZap, Inbox, Sparkles, ScrollText, ArrowRight, MessageSquare } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { PlatformBadge } from "@/components/PlatformBadge";
import { platform } from "@/data/platformMeta";

const steps = [
  { icon: PlugZap, title: "Connect Apps", desc: "Connect your communication platforms.", to: "/connect", color: "#6366F1" },
  { icon: Inbox, title: "Unified Inbox", desc: "View all conversations in one place.", to: "/inbox", color: "#8B5CF6" },
  { icon: Sparkles, title: "AI Summary", desc: "Understand conversations instantly.", to: "/ai/summary", color: "#3B82F6" },
  { icon: ScrollText, title: "Reports", desc: "Generate useful reports from your messages.", to: "/reports", color: "#10B981" },
];

export default function Home() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [platforms, setPlatforms] = useState([]);
  const [convs, setConvs] = useState([]);

  useEffect(() => {
    api.get("/platforms").then((r) => setPlatforms(r.data)).catch(() => {});
    api.get("/conversations").then((r) => setConvs(r.data.slice(0, 5))).catch(() => {});
  }, []);

  const connected = platforms.filter((p) => p.connected);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Hero */}
      <section className="sc-mesh rounded-3xl border border-white/10 p-8 sm:p-12 sc-fade-up">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 sc-pulse" /> Demo Mode · simulated integrations
        </div>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none">
          All Your Conversations.
          <br />
          <span className="sc-gradient-text">One Smart Space.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-base sm:text-lg text-gray-400 leading-relaxed">
          Connect your communication apps, manage every conversation from one inbox, and use AI to
          understand and organize your messages.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button data-testid="hero-connect-btn" onClick={() => nav("/connect")} className="sc-glow-btn rounded-xl px-6 py-3 text-sm font-semibold text-white flex items-center gap-2">
            Connect Apps <ArrowRight size={16} />
          </button>
          <button data-testid="hero-inbox-btn" onClick={() => nav("/inbox")} className="rounded-xl px-6 py-3 text-sm font-semibold text-gray-200 border border-white/15 hover:bg-white/5 transition-all flex items-center gap-2">
            Open Unified Inbox
          </button>
        </div>
      </section>

      {/* Workflow */}
      <section className="mt-12">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s, i) => (
            <button
              key={s.title}
              data-testid={`workflow-step-${i}`}
              onClick={() => nav(s.to)}
              className="sc-card p-6 text-left group sc-fade-up"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${s.color}22`, border: `1px solid ${s.color}55` }}>
                <s.icon size={22} style={{ color: s.color }} />
              </div>
              <div className="flex items-center gap-2 text-[11px] text-gray-500 mb-1">Step {i + 1}</div>
              <h3 className="font-display font-semibold text-lg mb-1 group-hover:text-white">{s.title}</h3>
              <p className="text-sm text-gray-400">{s.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Connected + recent */}
      <section className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="sc-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-semibold text-lg">Connected Platforms</h3>
            <button onClick={() => nav("/connect")} className="text-xs text-indigo-400 hover:text-indigo-300">Manage</button>
          </div>
          <div className="space-y-3">
            {platforms.map((p) => (
              <div key={p.id} className="flex items-center justify-between">
                <PlatformBadge id={p.id} showName />
                {p.connected ? (
                  <span className="text-xs text-emerald-400 flex items-center gap-1">Connected ✓</span>
                ) : (
                  <span className="text-xs text-gray-600">Not connected</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="sc-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-semibold text-lg">Recent Conversations</h3>
            <button onClick={() => nav("/inbox")} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">Open Inbox <ArrowRight size={13} /></button>
          </div>
          <div className="space-y-2">
            {convs.map((c) => (
              <button
                key={c.slug}
                data-testid={`home-conv-${c.slug}`}
                onClick={() => nav(`/inbox?c=${c.slug}`)}
                className="w-full flex items-center gap-3 rounded-xl p-3 hover:bg-white/5 transition-all text-left"
              >
                <PlatformBadge id={c.platform} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-white truncate">{c.title}</p>
                    <span className="text-xs text-gray-500 shrink-0">{c.time}</span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{c.last_message}</p>
                </div>
                {c.unread > 0 && (
                  <span className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-indigo-500 text-white text-[11px] font-semibold flex items-center justify-center">{c.unread}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
