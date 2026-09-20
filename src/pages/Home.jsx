import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlugZap, Inbox, Sparkles, ScrollText, ArrowRight, MessageSquare, Activity, ShieldCheck, Zap } from "lucide-react";
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
      {/* Hero Section */}
      <section className="sc-mesh relative overflow-hidden rounded-3xl border border-white/10 p-8 sm:p-12 sc-fade-up">
        {/* Background ambient gradient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1.5 text-xs text-indigo-300 mb-6 shadow-[0_0_12px_rgba(99,102,241,0.2)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-Time Sync Active · Multi-Channel Hub</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              All Your Conversations.
              <br />
              <span className="sc-gradient-text">One Smart Space.</span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-gray-300/90 leading-relaxed max-w-xl">
              Connect your communication apps, manage every conversation from one inbox, and use AI to
              understand and organize your messages.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                data-testid="hero-connect-btn"
                onClick={() => nav("/connect")}
                className="sc-glow-btn rounded-xl px-6 py-3.5 text-sm font-semibold text-white flex items-center gap-2.5 shadow-lg shadow-indigo-500/25 active:scale-95 transition-transform"
              >
                <PlugZap size={17} /> Connect Apps <ArrowRight size={16} />
              </button>
              <button
                data-testid="hero-inbox-btn"
                onClick={() => nav("/inbox")}
                className="rounded-xl px-6 py-3.5 text-sm font-semibold text-gray-200 border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all flex items-center gap-2 shadow-sm active:scale-95"
              >
                <Inbox size={17} /> Open Unified Inbox
              </button>
            </div>
          </div>

        {/* Quick Hub Stats strip */}
        <div className="mt-10 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
              <PlugZap size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Connected</p>
              <p className="text-base font-bold text-white font-display">{connected.length} Platforms</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-400">
              <MessageSquare size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Messages</p>
              <p className="text-base font-bold text-white font-display">Live Stream</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400">
              <Zap size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Latency</p>
              <p className="text-base font-bold text-white font-display">&lt; 150ms</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Security</p>
              <p className="text-base font-bold text-white font-display">End-to-End</p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="mt-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">How it works</h2>
          <span className="text-xs text-indigo-400 font-medium">SyncChat Workflow</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s, i) => (
            <button
              key={s.title}
              data-testid={`workflow-step-${i}`}
              onClick={() => nav(s.to)}
              className="sc-card p-6 text-left group sc-fade-up relative overflow-hidden hover:-translate-y-1 hover:border-indigo-500/40 transition-all duration-300"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 shadow-sm" style={{ background: `${s.color}22`, border: `1px solid ${s.color}55` }}>
                <s.icon size={22} style={{ color: s.color }} />
              </div>
              <div className="flex items-center gap-2 text-[11px] text-gray-500 mb-1 font-medium">
                <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-gray-300 font-bold">{i + 1}</span>
                Step {i + 1}
              </div>
              <h3 className="font-display font-semibold text-lg mb-1 text-gray-100 group-hover:text-white transition-colors">{s.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>

              {/* Subtle hover accent arrow */}
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Explore</span> <ArrowRight size={13} />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Connected + recent */}
      <section className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="sc-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-semibold text-lg text-white">Connected Platforms</h3>
            <button onClick={() => nav("/connect")} className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">Manage</button>
          </div>
          <div className="space-y-3">
            {platforms.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.04] transition-colors">
                <PlatformBadge id={p.id} showName />
                {p.connected ? (
                  <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Connected
                  </span>
                ) : (
                  <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">Not connected</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="sc-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-semibold text-lg text-white">Recent Conversations</h3>
            <button onClick={() => nav("/inbox")} className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">Open Inbox <ArrowRight size={13} /></button>
          </div>
          <div className="space-y-2">
            {convs.map((c) => (
              <button
                key={c.slug}
                data-testid={`home-conv-${c.slug}`}
                onClick={() => nav(`/inbox?c=${c.slug}`)}
                className="w-full flex items-center gap-3 rounded-xl p-3 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all text-left group"
              >
                <PlatformBadge id={c.platform} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white group-hover:text-indigo-200 transition-colors truncate">{c.title}</p>
                    <span className="text-xs text-gray-400 shrink-0 font-mono">{c.time}</span>
                  </div>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{c.last_message}</p>
                </div>
                {c.unread > 0 && (
                  <span className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-indigo-500 text-white text-[11px] font-semibold flex items-center justify-center sc-unread-pulse">{c.unread}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

