import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import { ScrollText, Loader2, Download, Copy, Share2, FileText, Calendar, Users, CheckSquare, Gavel, ListTodo, Lightbulb } from "lucide-react";
import { api } from "@/lib/api";
import { platform } from "@/data/platformMeta";
import { Checkbox } from "@/components/ui/checkbox";

const REPORT_TYPES = [
  "Conversation Summary", "Team Activity Report", "Client Communication Report",
  "Action Items Report", "Daily Communication Report", "Custom Report",
];

function reportToText(r) {
  const line = (t) => t + "\n";
  const list = (arr) => arr.map((x) => "  • " + x).join("\n");
  return [
    r.title.toUpperCase(),
    "Date: " + r.date,
    "Platforms: " + (r.platforms.map((p) => platform(p).name).join(", ") || "All"),
    "Conversations analyzed: " + r.conversations_analyzed.join(", "),
    "",
    "SUMMARY", r.summary, "",
    "KEY DISCUSSIONS", list(r.key_discussions), "",
    "DECISIONS", list(r.decisions), "",
    "ACTION ITEMS", list(r.action_items), "",
    "PEOPLE INVOLVED", list(r.people.length ? r.people : ["—"]), "",
    "PENDING TASKS", list(r.pending_tasks), "",
    "RECOMMENDATIONS", list(r.recommendations),
  ].map(line).join("");
}

function Block({ icon: Icon, title, items, color }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2"><Icon size={15} style={{ color }} /><h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</h4></div>
      <ul className="space-y-1.5">
        {(items.length ? items : ["—"]).map((it, i) => (
          <li key={i} className="flex gap-2 text-sm text-gray-300"><span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />{it}</li>
        ))}
      </ul>
    </div>
  );
}

export default function Reports() {
  const [params] = useSearchParams();
  const preConv = params.get("c");
  const [convs, setConvs] = useState([]);
  const [selected, setSelected] = useState(preConv ? [preConv] : []);
  const [type, setType] = useState(REPORT_TYPES[0]);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);

  const loadHistory = () => api.get("/reports").then((r) => setHistory(r.data)).catch(() => {});
  useEffect(() => {
    api.get("/conversations").then((r) => setConvs(r.data));
    loadHistory();
  }, []);

  const toggle = (slug) => setSelected((s) => s.includes(slug) ? s.filter((x) => x !== slug) : [...s, slug]);

  const generate = async () => {
    setLoading(true);
    setReport(null);
    try {
      await new Promise((r) => setTimeout(r, 1600));
      const { data } = await api.post("/reports", {
        title: type, type,
        conversation_slugs: selected,
      });
      setReport(data);
      loadHistory();
      toast.success("Report generated");
    } catch {
      toast.error("Could not generate report");
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 48, width = 515;
    let y = 60;
    doc.setFontSize(20); doc.setTextColor(30, 30, 60);
    doc.text(report.title, margin, y); y += 24;
    doc.setFontSize(10); doc.setTextColor(120);
    doc.text(`${report.date}  ·  ${report.platforms.map((p) => platform(p).name).join(", ") || "All platforms"}`, margin, y); y += 24;
    doc.setTextColor(40);
    const lines = doc.splitTextToSize(reportToText(report).replace(report.title.toUpperCase() + "\n", ""), width);
    doc.setFontSize(11);
    lines.forEach((ln) => {
      if (y > 780) { doc.addPage(); y = 60; }
      doc.text(ln, margin, y); y += 16;
    });
    doc.save(`${report.title.replace(/\s/g, "_")}.pdf`);
    toast.success("Report downloaded as PDF");
  };

  const copy = () => { navigator.clipboard.writeText(reportToText(report)); toast.success("Report copied to clipboard"); };
  const share = async () => {
    try {
      if (navigator.share) { await navigator.share({ title: report.title, text: report.summary }); }
      else { navigator.clipboard.writeText(reportToText(report)); toast.success("Report copied — ready to share"); }
    } catch { /* cancelled */ }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="flex items-center gap-3 mb-2">
        <ScrollText className="text-emerald-400" size={24} />
        <h1 className="font-display text-2xl sm:text-3xl font-bold">Reports</h1>
      </div>
      <p className="text-gray-400">Turn conversations into structured reports and useful insights.</p>

      {/* Builder */}
      <div className="sc-card p-6 mt-6">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Report type</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {REPORT_TYPES.map((t) => (
            <button key={t} data-testid={`report-type-${t.toLowerCase().replace(/\s/g, "-")}`} onClick={() => setType(t)} className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${type === t ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200" : "border-white/10 text-gray-400 hover:bg-white/5 hover:text-white"}`}>
              {t}
            </button>
          ))}
        </div>

        <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mt-6">Select conversations {selected.length > 0 && `(${selected.length})`}</label>
        <p className="text-xs text-gray-500 mt-1">Leave empty to include all conversations.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 max-h-52 overflow-y-auto sc-scroll">
          {convs.map((c) => (
            <label key={c.slug} data-testid={`report-conv-${c.slug}`} className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 cursor-pointer hover:bg-white/10 transition-all">
              <Checkbox checked={selected.includes(c.slug)} onCheckedChange={() => toggle(c.slug)} className="border-white/30 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500" />
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: platform(c.platform).color }} />
              <span className="text-sm text-gray-200 truncate">{c.title}</span>
            </label>
          ))}
        </div>

        <button data-testid="generate-report-btn" onClick={generate} disabled={loading} className="sc-glow-btn mt-6 rounded-xl px-6 py-3 text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60 w-full sm:w-auto">
          {loading ? <><Loader2 size={16} className="animate-spin" /> Generating report...</> : <><ScrollText size={16} /> Generate Report</>}
        </button>
      </div>

      {loading && (
        <div className="sc-card p-6 mt-6 flex items-center gap-3" data-testid="report-loading">
          <Loader2 size={18} className="animate-spin text-emerald-400" />
          <span className="text-sm text-gray-300">Analyzing conversations and building your report...</span>
        </div>
      )}

      {/* Report */}
      {report && (
        <div className="sc-card p-7 mt-6 sc-fade-up" data-testid="report-output">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-5">
            <div>
              <h2 className="font-display text-2xl font-bold">{report.title}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Calendar size={13} /> {report.date}</span>
                <span className="flex items-center gap-1">{report.platforms.map((p) => platform(p).name).join(", ") || "All platforms"}</span>
                <span>{report.conversations_analyzed.length} conversation(s)</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button data-testid="download-report-btn" onClick={download} className="sc-glow-btn rounded-xl px-4 py-2 text-sm font-semibold text-white flex items-center gap-2"><Download size={15} /> Download</button>
              <button data-testid="copy-report-btn" onClick={copy} className="rounded-xl px-3 py-2 text-sm text-gray-300 border border-white/15 hover:bg-white/5 transition-all flex items-center gap-2"><Copy size={15} /> Copy</button>
              <button data-testid="share-report-btn" onClick={share} className="rounded-xl px-3 py-2 text-sm text-gray-300 border border-white/15 hover:bg-white/5 transition-all flex items-center gap-2"><Share2 size={15} /></button>
            </div>
          </div>

          <div className="mt-5 space-y-6">
            <div className="rounded-xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-300 mb-2">Summary</h4>
              <p className="text-sm text-gray-200 leading-relaxed">{report.summary}</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <Block icon={FileText} title="Key Discussions" items={report.key_discussions} color="#3B82F6" />
              <Block icon={Gavel} title="Decisions" items={report.decisions} color="#8B5CF6" />
              <Block icon={CheckSquare} title="Action Items" items={report.action_items} color="#10B981" />
              <Block icon={ListTodo} title="Pending Tasks" items={report.pending_tasks} color="#EF4444" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2"><Users size={15} className="text-gray-400" /><h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">People Involved</h4></div>
              <div className="flex flex-wrap gap-2">
                {(report.people.length ? report.people : ["—"]).map((p) => (
                  <span key={p} className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 pl-1 pr-3 py-1 text-xs text-gray-200">
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(p)}&background=6366F1&color=fff&bold=true`} alt={p} className="w-5 h-5 rounded-full" /> {p}
                  </span>
                ))}
              </div>
            </div>
            <Block icon={Lightbulb} title="Recommendations / Next Steps" items={report.recommendations} color="#F59E0B" />
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="mt-10">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">Recent Reports</h3>
          <div className="space-y-2">
            {history.map((h) => (
              <button key={h.id} data-testid={`report-history-${h.id}`} onClick={() => { setReport(h); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="w-full flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-left hover:bg-white/10 transition-all">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0"><ScrollText size={16} className="text-emerald-400" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{h.title}</p>
                  <p className="text-xs text-gray-500">{h.date} · {h.conversations_analyzed.length} conversation(s)</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
