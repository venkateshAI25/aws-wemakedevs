import { useState, useEffect } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2, PlugZap } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { platform } from "@/data/platformMeta";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

export function IntegrationCard({ p, onToggle, busy }) {
  const meta = platform(p.id);
  const Icon = meta.icon;
  return (
    <div className="sc-card p-6 flex flex-col" data-testid={`integration-card-${p.id}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${meta.color}22`, border: `1px solid ${meta.color}55` }}>
          <Icon size={24} style={{ color: meta.color }} />
        </div>
        {p.connected && (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-2.5 py-1">
            <CheckCircle2 size={13} /> Connected
          </span>
        )}
      </div>
      <h3 className="font-display font-semibold text-lg">{meta.name}</h3>
      <p className="text-sm text-gray-400 mt-1 flex-1">{p.description}</p>
      <button
        data-testid={`${p.connected ? "disconnect" : "connect"}-btn-${p.id}`}
        onClick={() => onToggle(p)}
        disabled={busy}
        className={`mt-5 rounded-xl py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-60 ${
          p.connected
            ? "border border-white/15 text-gray-300 hover:bg-white/5 hover:text-red-300"
            : "sc-glow-btn text-white"
        }`}
      >
        {busy ? <Loader2 size={15} className="animate-spin" /> : null}
        {p.connected ? "Disconnect" : "Connect"}
      </button>
    </div>
  );
}

export default function ConnectApps() {
  const { patchUser, user } = useAuth();
  const [platforms, setPlatforms] = useState([]);
  const [target, setTarget] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [connecting, setConnecting] = useState(false);

  const load = () => api.get("/platforms").then((r) => setPlatforms(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleToggle = (p) => {
    if (p.connected) {
      disconnect(p);
    } else {
      setTarget(p);
    }
  };

  const disconnect = async (p) => {
    setBusyId(p.id);
    try {
      await api.post("/platforms/disconnect", { platform_id: p.id });
      await load();
      patchUser({ connected_platforms: (user.connected_platforms || []).filter((x) => x !== p.id) });
      toast.success(`${platform(p.id).name} disconnected`);
    } finally { setBusyId(null); }
  };

  const confirmConnect = async () => {
    if (!target) return;
    setConnecting(true);
    await new Promise((r) => setTimeout(r, 1100)); // simulated connection flow
    try {
      await api.post("/platforms/connect", { platform_id: target.id });
      await load();
      patchUser({ connected_platforms: [...(user.connected_platforms || []), target.id] });
      toast.success(`${platform(target.id).name} connected ✓`);
      setTarget(null);
    } finally { setConnecting(false); }
  };

  const connectedCount = platforms.filter((p) => p.connected).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="flex items-center gap-3 mb-2">
        <PlugZap className="text-indigo-400" size={24} />
        <h1 className="font-display text-2xl sm:text-3xl font-bold">Connect Your Apps</h1>
      </div>
      <p className="text-gray-400 max-w-2xl">Bring your conversations from multiple platforms into one smart workspace.</p>
      <p className="text-xs text-gray-500 mt-2">{connectedCount} of {platforms.length} platforms connected · Demo Mode (simulated)</p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {platforms.map((p) => (
          <IntegrationCard key={p.id} p={p} onToggle={handleToggle} busy={busyId === p.id} />
        ))}
      </div>

      <Dialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent className="bg-[#111827] border-white/10 text-white" data-testid="connect-modal">
          <DialogHeader>
            <DialogTitle className="font-display">Connect {target && platform(target.id).name}</DialogTitle>
            <DialogDescription className="text-gray-400">
              Connect {target && platform(target.id).name} to sync your conversations with SyncChat.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-xs text-gray-400">
            This is a simulated connection for the demo. No real credentials are required.
          </div>
          <DialogFooter>
            <button onClick={() => setTarget(null)} className="rounded-xl px-4 py-2.5 text-sm text-gray-300 border border-white/15 hover:bg-white/5 transition-all">Cancel</button>
            <button data-testid="confirm-connect-btn" onClick={confirmConnect} disabled={connecting} className="sc-glow-btn rounded-xl px-5 py-2.5 text-sm font-semibold text-white flex items-center gap-2 disabled:opacity-60">
              {connecting ? <><Loader2 size={15} className="animate-spin" /> Connecting...</> : "Connect"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
