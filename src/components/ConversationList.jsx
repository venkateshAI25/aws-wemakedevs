import { Search } from "lucide-react";
import { PlatformBadge } from "@/components/PlatformBadge";
import { PLATFORM_ORDER, platform } from "@/data/platformMeta";
import { Skeleton } from "@/components/ui/skeleton";

const FILTERS = ["all", ...PLATFORM_ORDER];

export default function ConversationList({ conversations, activeSlug, onSelect, filter, setFilter, query, setQuery, loading }) {
  return (
    <div className="h-full flex flex-col bg-[#0B0F19] border-r border-white/10">
      <div className="p-4 border-b border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-semibold text-lg">Inbox</h2>
          <span className="text-xs text-gray-500">{conversations.length} chats</span>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            data-testid="inbox-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search messages, people, or keywords..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto sc-scroll pb-1 -mx-1 px-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              data-testid={`filter-${f}`}
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all border ${
                filter === f
                  ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-200"
                  : "border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {f === "all" ? "All" : platform(f).name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto sc-scroll p-2">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-3 p-3">
              <Skeleton className="w-9 h-9 rounded-xl bg-white/5" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-2/3 bg-white/5" />
                <Skeleton className="h-3 w-full bg-white/5" />
              </div>
            </div>
          ))
        ) : conversations.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-10">No conversations found.</p>
        ) : (
          conversations.map((c) => (
            <button
              key={c.slug}
              data-testid={`conversation-item-${c.slug}`}
              onClick={() => onSelect(c.slug)}
              className={`w-full flex items-start gap-3 rounded-xl p-3 text-left transition-all mb-1 border ${
                activeSlug === c.slug
                  ? "bg-indigo-500/10 border-indigo-500/30"
                  : "border-transparent hover:bg-white/5"
              }`}
            >
              <PlatformBadge id={c.platform} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-white truncate">{c.title}</p>
                  <span className="text-[11px] text-gray-500 shrink-0">{c.time}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-500">{platform(c.platform).name}</span>
                  {c.priority === "high" && <span className="text-[10px] text-amber-400">· High</span>}
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <p className="text-xs text-gray-400 truncate">{c.last_message}</p>
                  {c.unread > 0 && (
                    <span className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-indigo-500 text-white text-[11px] font-semibold flex items-center justify-center">{c.unread}</span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
