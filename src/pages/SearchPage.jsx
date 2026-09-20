import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, MessageSquare } from "lucide-react";
import { api } from "@/lib/api";
import { PlatformBadge } from "@/components/PlatformBadge";
import { platform } from "@/data/platformMeta";
import { Skeleton } from "@/components/ui/skeleton";

export default function SearchPage() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const q = params.get("q") || "";
  const [results, setResults] = useState({ conversations: [], messages: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!q) { setLoading(false); return; }
    setLoading(true);
    api.get("/search", { params: { q } })
      .then((r) => setResults(r.data))
      .finally(() => setLoading(false));
  }, [q]);

  const total = results.conversations.length + results.messages.length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="flex items-center gap-3 mb-1">
        <Search className="text-indigo-400" size={24} />
        <h1 className="font-display text-2xl sm:text-3xl font-bold">Search</h1>
      </div>
      <p className="text-gray-400">{q ? <>Results for <span className="text-white font-medium">"{q}"</span> · {total} found</> : "Type in the top search bar to find people, messages and conversations."}</p>

      {loading ? (
        <div className="space-y-2 mt-6">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl bg-white/5" />)}
        </div>
      ) : total === 0 && q ? (
        <p className="text-sm text-gray-500 mt-10 text-center">No results found. Try another keyword.</p>
      ) : (
        <div className="mt-6 space-y-8">
          {results.conversations.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Conversations</h3>
              <div className="space-y-2">
                {results.conversations.map((c) => (
                  <button key={c.slug} data-testid={`search-conv-${c.slug}`} onClick={() => nav(`/inbox?c=${c.slug}`)} className="w-full flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-4 py-3 hover:bg-white/10 transition-all text-left">
                    <PlatformBadge id={c.platform} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{c.title}</p>
                      <p className="text-xs text-gray-400 truncate">{c.last_message}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {results.messages.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Messages</h3>
              <div className="space-y-2">
                {results.messages.map((m, i) => (
                  <button key={i} data-testid={`search-msg-${i}`} onClick={() => nav(`/inbox?c=${m.slug}`)} className="w-full flex items-start gap-3 rounded-xl bg-white/5 border border-white/10 px-4 py-3 hover:bg-white/10 transition-all text-left">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${platform(m.platform).color}22` }}>
                      <MessageSquare size={15} style={{ color: platform(m.platform).color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{platform(m.platform).name} — {m.conversation}</span>
                        <span>·</span><span>{m.sender}</span><span>· {m.time}</span>
                      </div>
                      <p className="text-sm text-gray-200 mt-0.5">{m.text}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
