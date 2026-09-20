import { useState, useEffect } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { platform } from "@/data/platformMeta";
import AISummaryContent from "@/components/AISummaryContent";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export default function AISummaryPage() {
  const [convs, setConvs] = useState([]);
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/conversations").then((r) => {
      setConvs(r.data);
      if (r.data[0]) setSlug(r.data[0].slug);
    });
  }, []);

  const generate = async () => {
    if (!slug) return;
    setLoading(true);
    setSummary(null);
    try {
      await new Promise((r) => setTimeout(r, 1400));
      const { data } = await api.post("/ai/summary", { conversation_slug: slug });
      setSummary(data);
      toast.success("Summary generated");
    } catch {
      toast.error("Could not generate summary");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="flex items-center gap-3 mb-2">
        <Sparkles className="text-indigo-400" size={24} />
        <h1 className="font-display text-2xl sm:text-3xl font-bold">AI Summary</h1>
      </div>
      <p className="text-gray-400">Understand the important points of any conversation in seconds.</p>

      <div className="sc-card p-6 mt-6">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Select conversation</label>
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <Select value={slug} onValueChange={setSlug}>
            <SelectTrigger data-testid="summary-conv-select" className="flex-1 bg-white/5 border-white/10 text-gray-200">
              <SelectValue placeholder="Choose a conversation" />
            </SelectTrigger>
            <SelectContent className="bg-[#111827] border-white/10 text-gray-200">
              {convs.map((c) => (
                <SelectItem key={c.slug} value={c.slug} className="focus:bg-white/5">
                  {platform(c.platform).name} — {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button data-testid="summary-generate-btn" onClick={generate} disabled={loading || !slug} className="sc-glow-btn rounded-xl px-6 py-2.5 text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <><Loader2 size={15} className="animate-spin" /> Analyzing...</> : <><Sparkles size={15} /> Generate Summary</>}
          </button>
        </div>
      </div>

      {loading && (
        <div className="sc-card p-6 mt-6 flex items-center gap-3" data-testid="summary-page-loading">
          <Loader2 size={18} className="animate-spin text-indigo-400" />
          <span className="text-sm text-gray-300">Analyzing conversation...</span>
        </div>
      )}

      {summary && (
        <div className="sc-card p-6 mt-6 sc-fade-up">
          <AISummaryContent data={summary} />
        </div>
      )}
    </div>
  );
}
