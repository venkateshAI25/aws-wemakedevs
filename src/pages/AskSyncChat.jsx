import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Bot, Send, Sparkles, ExternalLink } from "lucide-react";
import { api } from "@/lib/api";
import { platform } from "@/data/platformMeta";

const SUGGESTIONS = [
  "What did the team decide?",
  "Who is responsible for the next task?",
  "What are the pending issues?",
  "Summarize today's conversations.",
  "What deadlines were mentioned?",
  "What did the client request?",
];

function Sources({ sources }) {
  if (!sources || !sources.length) return null;
  return (
    <div className="mt-3 space-y-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Sources</p>
      {sources.map((s, i) => (
        <div key={i} className="rounded-lg bg-white/5 border border-white/10 px-3 py-2" data-testid={`ask-source-${i}`}>
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: platform(s.platform).color }} />
            {platform(s.platform).name} — {s.conversation}
          </div>
          <p className="text-[11px] text-gray-500 mt-0.5">Message from {s.sender} — {s.time}</p>
        </div>
      ))}
    </div>
  );
}

export default function AskSyncChat() {
  const [params] = useSearchParams();
  const convSlug = params.get("c");
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! I'm SyncChat AI. Ask me anything about your conversations — decisions, owners, deadlines, or a summary of today." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const ask = async (q) => {
    const question = (q ?? input).trim();
    if (!question || loading) return;
    setMessages((m) => [...m, { role: "user", text: question }]);
    setInput("");
    setLoading(true);
    try {
      const { data } = await api.post("/ai/ask", { question, conversation_slug: convSlug || undefined });
      setMessages((m) => [...m, { role: "ai", text: data.answer, sources: data.sources }]);
    } catch {
      setMessages((m) => [...m, { role: "ai", text: "Sorry, I couldn't process that right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center"><Bot size={20} className="text-white" /></div>
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold leading-tight">Ask SyncChat</h1>
          <p className="text-xs text-gray-400">Ask AI questions about your conversations and get instant answers.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto sc-scroll mt-4 space-y-4 pr-1">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] ${m.role === "user" ? "" : "w-full"}`}>
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-br-md"
                  : "bg-white/5 border border-white/10 text-gray-100 rounded-bl-md"
              }`} data-testid={`ask-message-${m.role}`}>
                {m.role === "ai" && <div className="flex items-center gap-1.5 text-[11px] text-indigo-300 mb-1.5"><Sparkles size={12} /> SyncChat AI</div>}
                {m.text}
                {m.role === "ai" && <Sources sources={m.sources} />}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md bg-white/5 border border-white/10 px-4 py-3 flex items-center gap-1.5" data-testid="ask-loading">
              <span className="sc-dot w-2 h-2 rounded-full bg-indigo-400" />
              <span className="sc-dot w-2 h-2 rounded-full bg-violet-400" />
              <span className="sc-dot w-2 h-2 rounded-full bg-blue-400" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {SUGGESTIONS.map((s) => (
            <button key={s} data-testid="ask-suggestion" onClick={() => ask(s)} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/10 hover:text-white transition-all">
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-end gap-2">
        <input
          data-testid="ask-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), ask())}
          placeholder="Ask about your conversations..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all"
        />
        <button data-testid="ask-send-btn" onClick={() => ask()} disabled={!input.trim() || loading} className="sc-glow-btn w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 disabled:opacity-40">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
