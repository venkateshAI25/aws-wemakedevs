import { useState, useEffect } from "react";
import { Sparkles, Loader2, MessageSquareReply, Bot, ScrollText, FileText, ExternalLink, Paperclip } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { platform } from "@/data/platformMeta";
import AISummaryContent from "@/components/AISummaryContent";

export default function AIPanel({ conversation, onAsk, onReport }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const meta = platform(conversation.platform);

  useEffect(() => { setSummary(null); }, [conversation.slug]);

  const generate = async () => {
    setLoading(true);
    setSummary(null);
    try {
      await new Promise((r) => setTimeout(r, 1400)); // "Analyzing conversation..."
      const { data } = await api.post("/ai/summary", { conversation_slug: conversation.slug });
      setSummary(data);
      toast.success("Summary generated");
    } catch {
      toast.error("Could not generate summary");
    } finally {
      setLoading(false);
    }
  };

  const lastMsg = conversation.messages[conversation.messages.length - 1] || {};

  return (
    <div className="h-full flex flex-col bg-[#0B0F19] border-l border-white/10">
      <div className="h-16 shrink-0 flex items-center gap-2 px-4 border-b border-white/10">
        <Sparkles size={18} className="text-indigo-400" />
        <h3 className="font-display font-semibold">AI Tools</h3>
      </div>

      <div className="flex-1 overflow-y-auto sc-scroll p-4 space-y-6">
        {/* AI Summary */}
        <div>
          <h4 className="font-display font-semibold mb-1">AI Summary</h4>
          <p className="text-xs text-gray-400 mb-3">Understand the important points of this conversation in seconds.</p>
          {!summary && !loading && (
            <button data-testid="generate-summary-btn" onClick={generate} className="sc-glow-btn w-full rounded-xl py-2.5 text-sm font-semibold text-white flex items-center justify-center gap-2">
              <Sparkles size={15} /> Generate Summary
            </button>
          )}
          {loading && (
            <div className="rounded-2xl bg-white/[0.04] border border-indigo-500/30 p-5 space-y-3 relative overflow-hidden" data-testid="summary-loading">
              <div className="absolute top-0 left-0 right-0 h-1 sc-signal-beam" />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
                  <Sparkles size={16} className="animate-spin" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Synthesizing Conversation</p>
                  <p className="text-xs text-indigo-300/80">Identifying decisions, owners & action items...</p>
                </div>
              </div>
              <div className="space-y-1.5 pt-1">
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full animate-[sc-beam-travel_2s_linear_infinite]" />
                </div>
              </div>
            </div>
          )}
          {summary && (
            <div className="sc-fade-up">
              <AISummaryContent data={summary} />
              <button onClick={generate} className="mt-3 text-xs text-indigo-400 hover:text-indigo-300">Regenerate</button>
            </div>
          )}
        </div>

        {/* Message Source */}
        <div>
          <h4 className="font-display font-semibold mb-2">Message Source</h4>
          <div className="rounded-xl bg-white/5 border border-white/10 p-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
              <span className="text-gray-200">{meta.name} — {conversation.title}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Message from {lastMsg.sender} — {lastMsg.time}</p>
            <button className="mt-2 inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300">
              <ExternalLink size={12} /> View Original
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h4 className="font-display font-semibold mb-2">Quick Actions</h4>
          <div className="space-y-2">
            <button data-testid="qa-ask" onClick={onAsk} className="w-full flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-gray-200 hover:bg-white/10 transition-all">
              <Bot size={16} className="text-violet-400" /> Ask SyncChat
            </button>
            <button data-testid="qa-report" onClick={onReport} className="w-full flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-gray-200 hover:bg-white/10 transition-all">
              <ScrollText size={16} className="text-emerald-400" /> Generate Report
            </button>
          </div>
        </div>

        {/* Attachments */}
        <div>
          <h4 className="font-display font-semibold mb-2">Attachments</h4>
          {conversation.attachments && conversation.attachments.length > 0 ? (
            <div className="space-y-2">
              {conversation.attachments.map((a, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-3 py-2.5">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/15 flex items-center justify-center shrink-0">
                    <FileText size={16} className="text-indigo-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-200 truncate">{a.name}</p>
                    <p className="text-xs text-gray-500">{a.size}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 flex items-center gap-2"><Paperclip size={13} /> No attachments in this conversation.</p>
          )}
        </div>
      </div>
    </div>
  );
}
