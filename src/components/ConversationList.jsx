import { Search, SlidersHorizontal } from "lucide-react";
import { PlatformBadge } from "@/components/PlatformBadge";
import { PLATFORM_ORDER, platform } from "@/data/platformMeta";
import { Skeleton } from "@/components/ui/skeleton";

const FILTERS = ["all", ...PLATFORM_ORDER];

export default function ConversationList({ conversations, activeSlug, onSelect, filter, setFilter, query, setQuery, loading }) {
  return (
    <div className="h-full flex flex-col bg-[#0B0F19] border-r border-white/10">
      <div className="p-4 border-b border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-display font-semibold text-lg text-white">Unified Inbox</h2>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <span className="text-xs font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">{conversations.length} chats</span>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            data-testid="inbox-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search messages, people, or keywords..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/40 transition-all"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto sc-scroll pb-1 -mx-1 px-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              data-testid={`filter-${f}`}
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 border ${
                filter === f
                  ? "bg-indigo-500/25 border-indigo-500/50 text-white shadow-sm shadow-indigo-500/20"
                  : "border-white/10 text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/20"
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
          <div className="text-center py-12 px-4">
            <p className="text-sm text-gray-400 font-medium">No conversations found</p>
            <p className="text-xs text-gray-500 mt-1">Try clearing your search query or filter</p>
          </div>
        ) : (
          conversations.map((c, idx) => (
            <button
              key={c.slug}
              data-testid={`conversation-item-${c.slug}`}
              onClick={() => onSelect(c.slug)}
              style={{ animationDelay: `${Math.min(idx * 35, 200)}ms` }}
              className={`w-full flex items-start gap-3 rounded-xl p-3 text-left sc-conv-item sc-animate-item-enter mb-1.5 border transition-all duration-200 group relative ${
                activeSlug === c.slug
                  ? "bg-indigo-500/15 border-indigo-500/40 shadow-sm shadow-indigo-500/10"
                  : "border-transparent hover:bg-white/5 hover:border-white/10"
              }`}
            >
              {activeSlug === c.slug && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-indigo-400" />
              )}
              <PlatformBadge id={c.platform} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-white group-hover:text-indigo-200 transition-colors truncate">{c.title}</p>
                  <span className="text-[11px] text-gray-400 shrink-0 font-mono">{c.time}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-medium text-gray-400">{platform(c.platform).name}</span>
                  {c.priority === "high" && (
                    <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-1.5 rounded border border-amber-500/20">
                      High
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <p className="text-xs text-gray-400 truncate">{c.last_message}</p>
                  {c.unread > 0 && (
                    <span className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-indigo-500 text-white text-[11px] font-bold flex items-center justify-center sc-unread-pulse shadow-sm shadow-indigo-500/50">
                      {c.unread}
                    </span>
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
