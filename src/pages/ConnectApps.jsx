import { useState, useEffect } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2, PlugZap, Radio, ArrowRight, ShieldCheck, Zap } from "lucide-react";
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
    <div className="sc-card p-6 flex flex-col group hover:border-indigo-500/30 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden" data-testid={`integration-card-${p.id}`}>
      {/* Active connection signal line at top of card */}
      {p.connected && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500/40 via-emerald-400 to-indigo-500/40" />
      )}

      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
            p.connected ? "shadow-[0_0_16px_rgba(16,185,129,0.25)] ring-1 ring-emerald-500/30" : ""
          }`}
          style={{ background: `${meta.color}22`, border: `1px solid ${meta.color}55` }}
        >
          <Icon size={24} style={{ color: meta.color }} />
        </div>
        {p.connected ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Connected
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400 bg-white/5 border border-white/10 rounded-full px-2.5 py-0.5">
            Available
          </span>
        )}
      </div>

      <h3 className="font-display font-semibold text-lg text-white group-hover:text-indigo-200 transition-colors">{meta.name}</h3>
      <p className="text-sm text-gray-400 mt-1.5 flex-1 leading-relaxed">{p.description}</p>

      {/* Signal Status Indicator */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <Zap size={12} className={p.connected ? "text-emerald-400" : "text-gray-500"} />
          {p.connected ? "Active Stream" : "Ready to connect"}
        </span>
        <span className="text-[11px] text-gray-400 font-mono">
          {p.connected ? "2-way sync" : "SSL Encrypted"}
        </span>
      </div>

      <button
        data-testid={`${p.connected ? "disconnect" : "connect"}-btn-${p.id}`}
        onClick={() => onToggle(p)}
        disabled={busy}
        className={`mt-4 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 active:scale-95 ${
          p.connected
            ? "border border-white/15 bg-white/5 text-gray-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-300"
            : "sc-glow-btn text-white shadow-md shadow-indigo-500/20"
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
        <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <PlugZap size={22} />
        </div>
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">Connect Your Apps</h1>
          <p className="text-gray-400 text-sm mt-0.5">Bring your conversations from multiple platforms into one smart workspace.</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Radio size={16} className="text-emerald-400 animate-pulse" />
          <span>
            <strong className="text-white font-semibold">{connectedCount}</strong> of {platforms.length} platforms connected
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
          <ShieldCheck size={14} className="text-indigo-400" />
          <span>Secure Real-Time Webhooks</span>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {platforms.map((p) => (
          <IntegrationCard key={p.id} p={p} onToggle={handleToggle} busy={busyId === p.id} />
        ))}
      </div>

      <Dialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent className="bg-[#111827] border-white/10 text-white max-w-md" data-testid="connect-modal">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Connect {target && platform(target.id).name}</DialogTitle>
            <DialogDescription className="text-gray-400">
              Connect {target && platform(target.id).name} to sync your conversations with SyncChat.
            </DialogDescription>
          </DialogHeader>

          {/* Signal Transmission Animation Preview */}
          <div className="my-2 p-5 rounded-2xl bg-[#0B0F19] border border-white/10 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="flex items-center justify-between w-full max-w-[260px] relative z-10">
              {/* Channel Node */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{
                    background: target ? `${platform(target.id).color}22` : "rgba(255,255,255,0.05)",
                    border: target ? `1px solid ${platform(target.id).color}66` : "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {target && (() => {
                    const Icon = platform(target.id).icon;
                    return <Icon size={22} style={{ color: platform(target.id).color }} />;
                  })()}
                </div>
                <span className="text-[11px] font-medium text-gray-300">{target && platform(target.id).name}</span>
              </div>

              {/* Connecting Signal Beam */}
              <div className="flex-1 mx-3 flex items-center justify-center relative">
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden relative">
                  <div className={`h-full ${connecting ? "sc-signal-beam w-full" : "w-1/2 bg-indigo-500/40"}`} />
                </div>
                <div className={`absolute w-3 h-3 rounded-full bg-indigo-400 shadow-[0_0_8px_#818CF8] ${connecting ? "animate-ping" : ""}`} />
              </div>

              {/* SyncChat Hub Node */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/25 border border-indigo-500/50 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <PlugZap size={22} className="text-indigo-400" />
                </div>
                <span className="text-[11px] font-medium text-gray-300">SyncChat</span>
              </div>
            </div>

            <p className="mt-4 text-[11px] text-gray-400 text-center">
              {connecting ? "Handshaking encrypted webhook tokens..." : "Simulated direct connection · No OAuth key required"}
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <button onClick={() => setTarget(null)} className="rounded-xl px-4 py-2.5 text-sm text-gray-300 border border-white/15 hover:bg-white/5 transition-all">Cancel</button>
            <button data-testid="confirm-connect-btn" onClick={confirmConnect} disabled={connecting} className="sc-glow-btn rounded-xl px-5 py-2.5 text-sm font-semibold text-white flex items-center gap-2 disabled:opacity-60 active:scale-95">
              {connecting ? <><Loader2 size={15} className="animate-spin" /> Connecting...</> : "Connect Platform"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
