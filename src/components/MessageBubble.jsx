import { Check, CheckCheck, Paperclip } from "lucide-react";

export default function MessageBubble({ msg }) {
  const out = msg.direction === "out";
  return (
    <div
      className={`flex ${out ? "justify-end sc-message-send-enter" : "justify-start sc-animate-item-enter"} gap-2.5 group`}
      data-testid="message-bubble"
    >
      {!out && (
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender)}&background=1F2937&color=fff&bold=true`}
          alt={msg.sender}
          className="w-8 h-8 rounded-full shrink-0 mt-1 shadow-sm border border-white/10"
        />
      )}
      <div className={`max-w-[78%] sm:max-w-[70%]`}>
        {!out && <p className="text-xs text-gray-400 mb-1 ml-1 font-medium">{msg.sender}</p>}
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed transition-all duration-200 ${
            out
              ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-br-md shadow-md shadow-indigo-500/15 hover:shadow-indigo-500/25"
              : "bg-white/5 border border-white/10 text-gray-100 rounded-bl-md hover:bg-white/[0.08]"
          }`}
        >
          {msg.text}
        </div>
        <div className={`flex items-center gap-1.5 mt-1 text-[10px] text-gray-400 ${out ? "justify-end mr-1" : "ml-1"}`}>
          <span className="font-mono text-[10px] text-gray-500">{msg.time}</span>
          {out && (
            msg.status === "read" ? (
              <CheckCheck size={13} className="text-indigo-400" />
            ) : msg.status === "delivered" ? (
              <CheckCheck size={13} className="text-gray-400" />
            ) : (
              <Check size={13} className="text-gray-400" />
            )
          )}
        </div>
      </div>
    </div>
  );
}
