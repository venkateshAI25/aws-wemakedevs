import { Check, CheckCheck, Paperclip } from "lucide-react";

export default function MessageBubble({ msg }) {
  const out = msg.direction === "out";
  return (
    <div className={`flex ${out ? "justify-end" : "justify-start"} gap-2.5`} data-testid="message-bubble">
      {!out && (
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender)}&background=1F2937&color=fff&bold=true`}
          alt={msg.sender}
          className="w-8 h-8 rounded-full shrink-0 mt-1"
        />
      )}
      <div className={`max-w-[78%] sm:max-w-[70%]`}>
        {!out && <p className="text-xs text-gray-500 mb-1 ml-1">{msg.sender}</p>}
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            out
              ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-br-md"
              : "bg-white/5 border border-white/10 text-gray-100 rounded-bl-md"
          }`}
        >
          {msg.text}
        </div>
        <div className={`flex items-center gap-1 mt-1 text-[10px] text-gray-500 ${out ? "justify-end mr-1" : "ml-1"}`}>
          <span>{msg.time}</span>
          {out && (msg.status === "read" ? <CheckCheck size={12} className="text-indigo-400" /> : msg.status === "delivered" ? <CheckCheck size={12} /> : <Check size={12} />)}
        </div>
      </div>
    </div>
  );
}
