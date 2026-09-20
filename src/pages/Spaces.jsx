import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Layers, Plus, MessageSquare, ArrowRight, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { platform } from "@/data/platformMeta";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";

export default function Spaces() {
  const nav = useNavigate();
  const [spaces, setSpaces] = useState([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => api.get("/spaces").then((r) => setSpaces(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await api.post("/spaces", { name: name.trim(), description: desc.trim() });
      await load();
      toast.success(`Space "${name}" created`);
      setOpen(false); setName(""); setDesc("");
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <Layers className="text-indigo-400" size={24} />
          <h1 className="font-display text-2xl sm:text-3xl font-bold">My Spaces</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button data-testid="create-space-btn" className="sc-glow-btn rounded-xl px-4 py-2.5 text-sm font-semibold text-white flex items-center gap-2"><Plus size={16} /> Create Space</button>
          </DialogTrigger>
          <DialogContent className="bg-[#111827] border-white/10 text-white" data-testid="create-space-modal">
            <DialogHeader>
              <DialogTitle className="font-display">Create New Space</DialogTitle>
              <DialogDescription className="text-gray-400">A Space groups the conversations, platforms and reports for a project or team.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <input data-testid="space-name-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Space name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60" />
              <textarea data-testid="space-desc-input" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description (optional)" rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 resize-none" />
            </div>
            <DialogFooter>
              <button onClick={() => setOpen(false)} className="rounded-xl px-4 py-2.5 text-sm text-gray-300 border border-white/15 hover:bg-white/5">Cancel</button>
              <button data-testid="save-space-btn" onClick={create} disabled={saving || !name.trim()} className="sc-glow-btn rounded-xl px-5 py-2.5 text-sm font-semibold text-white flex items-center gap-2 disabled:opacity-60">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Create
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <p className="text-gray-400">Organize your conversations into project and team workspaces.</p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {spaces.map((s, i) => (
          <button
            key={s.slug}
            data-testid={`space-card-${s.slug}`}
            onClick={() => nav(`/inbox?space=${s.slug}`)}
            className="sc-card p-6 text-left group sc-fade-up flex flex-col"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: `${s.color}22`, border: `1px solid ${s.color}55` }}>
                <Layers size={20} style={{ color: s.color }} />
              </div>
              {s.unread > 0 && <span className="min-w-5 h-5 px-1.5 rounded-full bg-indigo-500 text-white text-[11px] font-semibold flex items-center justify-center">{s.unread}</span>}
            </div>
            <h3 className="font-display font-semibold text-lg mt-4">{s.name}</h3>
            <p className="text-sm text-gray-400 mt-1 flex-1 line-clamp-2">{s.description}</p>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center -space-x-1.5">
                {s.platforms.map((p) => (
                  <span key={p} className="w-6 h-6 rounded-full ring-2 ring-[#111827] flex items-center justify-center" style={{ background: platform(p).color }}>
                    <span className="w-2 h-2 rounded-full bg-white/90" />
                  </span>
                ))}
              </div>
              <span className="text-xs text-gray-500 flex items-center gap-1"><MessageSquare size={12} /> {s.conversation_count}</span>
            </div>
            <span className="mt-3 inline-flex items-center gap-1 text-sm text-indigo-400 group-hover:gap-2 transition-all">Open Space <ArrowRight size={14} /></span>
          </button>
        ))}
      </div>
    </div>
  );
}
