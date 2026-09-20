import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Inbox as InboxIcon, MessageSquare } from "lucide-react";
import { api } from "@/lib/api";
import ConversationList from "@/components/ConversationList";
import ConversationView from "@/components/ConversationView";
import AIPanel from "@/components/AIPanel";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function Inbox() {
  const [params] = useSearchParams();
  const spaceParam = params.get("space");
  const nav = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [activeSlug, setActiveSlug] = useState(params.get("c") || null);
  const [active, setActive] = useState(null);
  const [mobileChat, setMobileChat] = useState(!!params.get("c"));
  const [aiOpen, setAiOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const loadList = useCallback(() => {
    setLoadingList(true);
    api.get("/conversations", { params: { platform: filter, q: debounced || undefined, space: spaceParam || undefined } })
      .then((r) => {
        setConversations(r.data);
        setActiveSlug((cur) => (cur && r.data.some((c) => c.slug === cur)) ? cur : (r.data[0] && r.data[0].slug) || null);
      })
      .finally(() => setLoadingList(false));
  }, [filter, debounced, spaceParam]);

  useEffect(() => { loadList(); }, [loadList]);

  useEffect(() => {
    if (!activeSlug) { setActive(null); return; }
    api.get(`/conversations/${activeSlug}`).then((r) => setActive(r.data)).catch(() => {});
  }, [activeSlug]);

  const select = (slug) => {
    setActiveSlug(slug);
    setMobileChat(true);
  };

  const reply = async (text) => {
    const { data } = await api.post(`/conversations/${activeSlug}/messages`, { text });
    setActive((c) => ({ ...c, messages: [...c.messages, data.message] }));
    setConversations((list) => list.map((c) => c.slug === activeSlug ? { ...c, last_message: text, time: data.message.time, unread: 0 } : c));
  };

  return (
    <div className="h-full flex">
      {/* Left: conversation list */}
      <div className={`w-full lg:w-[340px] shrink-0 h-full ${mobileChat ? "hidden lg:block" : "block"}`}>
        <ConversationList
          conversations={conversations}
          activeSlug={activeSlug}
          onSelect={select}
          filter={filter}
          setFilter={setFilter}
          query={query}
          setQuery={setQuery}
          loading={loadingList}
        />
      </div>

      {/* Center: conversation */}
      <div className={`flex-1 h-full min-w-0 ${mobileChat ? "block" : "hidden lg:block"}`}>
        {active ? (
          <ConversationView
            conversation={active}
            onReply={reply}
            onBack={() => setMobileChat(false)}
            onOpenAI={() => setAiOpen(true)}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
              <MessageSquare className="text-indigo-400" size={28} />
            </div>
            <h3 className="font-display font-semibold text-lg">Select a conversation</h3>
            <p className="text-sm text-gray-400 mt-1 max-w-xs">Choose a chat from the list to view messages, reply, and use AI tools.</p>
          </div>
        )}
      </div>

      {/* Right: AI panel (xl+) */}
      {active && (
        <div className="hidden xl:block w-[360px] shrink-0 h-full">
          <AIPanel
            conversation={active}
            onAsk={() => nav(`/ai/ask?c=${active.slug}`)}
            onReport={() => nav(`/reports?c=${active.slug}`)}
          />
        </div>
      )}

      {/* AI panel sheet (below xl) */}
      <Sheet open={aiOpen} onOpenChange={setAiOpen}>
        <SheetContent side="right" className="p-0 w-full sm:w-[380px] bg-[#0B0F19] border-white/10">
          {active && (
            <AIPanel
              conversation={active}
              onAsk={() => { setAiOpen(false); nav(`/ai/ask?c=${active.slug}`); }}
              onReport={() => { setAiOpen(false); nav(`/reports?c=${active.slug}`); }}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
