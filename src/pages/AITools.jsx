import { useNavigate } from "react-router-dom";
import { Sparkles, Bot, ScrollText, ArrowRight } from "lucide-react";

const tools = [
  { icon: Sparkles, title: "AI Summary", desc: "Understand conversations quickly. Generate concise summaries with key points, decisions and action items.", to: "/ai/summary", color: "#6366F1" },
  { icon: Bot, title: "Ask SyncChat", desc: "Ask AI questions about your conversations and get instant answers with sources.", to: "/ai/ask", color: "#8B5CF6" },
  { icon: ScrollText, title: "Reports", desc: "Turn conversations into structured reports and useful insights you can download.", to: "/reports", color: "#10B981" },
];

export default function AITools() {
  const nav = useNavigate();
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex items-center gap-3 mb-2">
        <Sparkles className="text-indigo-400" size={24} />
        <h1 className="font-display text-2xl sm:text-3xl font-bold">AI Tools</h1>
      </div>
      <p className="text-gray-400 max-w-2xl">Use AI to understand, question, and report on your conversations — all in one place.</p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
        {tools.map((t, i) => (
          <button
            key={t.title}
            data-testid={`ai-tool-${t.title.toLowerCase().replace(/\s/g, "-")}`}
            onClick={() => nav(t.to)}
            className="sc-card p-7 text-left group sc-fade-up flex flex-col"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ background: `${t.color}22`, border: `1px solid ${t.color}55` }}>
              <t.icon size={26} style={{ color: t.color }} />
            </div>
            <h3 className="font-display font-semibold text-xl mb-2">{t.title}</h3>
            <p className="text-sm text-gray-400 flex-1">{t.desc}</p>
            <span className="mt-5 inline-flex items-center gap-1 text-sm text-indigo-400 group-hover:gap-2 transition-all">Open <ArrowRight size={15} /></span>
          </button>
        ))}
      </div>
    </div>
  );
}
