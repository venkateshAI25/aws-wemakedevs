import { useState, useRef, useEffect } from "react";
import { Phone, Video, MoreVertical, Smile, Paperclip, Send, ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";
import MessageBubble from "@/components/MessageBubble";
import { PlatformBadge } from "@/components/PlatformBadge";
import { platform } from "@/data/platformMeta";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const EMOJIS = ["👍", "🎉", "🔥", "✅", "🙌", "😄", "🚀", "💡", "❤️", "👀", "🙏", "💪"];

export default function ConversationView({ conversation, onReply, onBack, onOpenAI }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const meta = platform(conversation.platform);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.messages.length, conversation.slug]);

  const send = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    const sentText = text.trim();
    setText("");
    await onReply(sentText);
    setSending(false);
  };

  const handleAttachMock = () => {
    toast.info("Attachment ready: documents, PDFs, or images can be attached to replies.");
  };

  return (
    <div className="h-full flex flex-col bg-[#07090E]">
      {/* Header */}
      <div className="h-16 shrink-0 flex items-center gap-3 px-4 border-b border-white/10 bg-[#07090E]/60 backdrop-blur-md">
        <button onClick={onBack} data-testid="conv-back" className="lg:hidden text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <PlatformBadge id={conversation.platform} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-white truncate text-base">{conversation.title}</h2>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: `${meta.color}22`, color: meta.color }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} /> {meta.name}
            </span>
          </div>
          <p className="text-xs text-gray-400 truncate mt-0.5">
            {conversation.participants.map((p) => p.name).join(", ")}
          </p>
        </div>
        <button className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-all hidden sm:flex"><Phone size={17} /></button>
        <button className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-all hidden sm:flex"><Video size={17} /></button>
        <button onClick={onOpenAI} data-testid="open-ai-panel" className="xl:hidden w-9 h-9 rounded-xl flex items-center justify-center text-indigo-400 hover:bg-white/5 transition-all"><Sparkles size={17} /></button>
        <button className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-all"><MoreVertical size={17} /></button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto sc-scroll px-4 py-6 space-y-4">
        {conversation.messages.map((m, i) => (
          <MessageBubble key={i} msg={m} />
        ))}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <div className="shrink-0 border-t border-white/10 p-3.5 bg-[#0B0F19]/40 backdrop-blur-md">
        <div className="flex items-center justify-between gap-1.5 text-xs text-gray-400 mb-2 px-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
            Reply via <strong className="text-gray-300 font-semibold">{meta.name}</strong>
          </span>
          <span className="text-[11px] text-gray-400 font-mono hidden sm:inline">Press Enter ↵ to send</span>
        </div>
        <div className="flex items-end gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <button data-testid="emoji-btn" className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-all shrink-0"><Smile size={19} /></button>
            </PopoverTrigger>
            <PopoverContent className="w-56 bg-[#111827] border-white/10 p-2 shadow-xl" align="start">
              <div className="grid grid-cols-6 gap-1">
                {EMOJIS.map((e) => (
                  <button key={e} onClick={() => setText((t) => t + e)} className="text-xl rounded-lg p-1.5 hover:bg-white/10 transition-all hover:scale-110 active:scale-95">{e}</button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <button data-testid="attach-btn" onClick={handleAttachMock} className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-all shrink-0"><Paperclip size={18} /></button>
          <input
            ref={inputRef}
            data-testid="message-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
            placeholder={`Message ${conversation.title}...`}
            className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/40 transition-all"
          />
          <button
            data-testid="send-btn"
            onClick={send}
            disabled={!text.trim() || sending}
            className={`sc-glow-btn w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 disabled:opacity-40 hover:scale-105 active:scale-95 transition-all duration-150 shadow-md shadow-indigo-500/20 ${
              sending ? "sc-send-active" : ""
            }`}
          >
            <Send size={17} className={sending ? "sc-send-active" : ""} />
          </button>
        </div>
      </div>
    </div>
  );
}
