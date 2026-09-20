import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { User, PlugZap, Bell, Shield, Palette, CheckCircle2, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { platform } from "@/data/platformMeta";
import { Switch } from "@/components/ui/switch";

function Card({ icon: Icon, title, children }) {
  return (
    <div className="sc-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={18} className="text-indigo-400" />
        <h3 className="font-display font-semibold text-lg">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Row({ label, desc, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-white/5 last:border-0">
      <div>
        <p className="text-sm text-gray-200">{label}</p>
        {desc && <p className="text-xs text-gray-500">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [platforms, setPlatforms] = useState([]);
  const [notifMsg, setNotifMsg] = useState(user?.settings?.notify_messages ?? true);
  const [notifReport, setNotifReport] = useState(user?.settings?.notify_reports ?? true);
  const [saveData, setSaveData] = useState(true);

  useEffect(() => { api.get("/platforms").then((r) => setPlatforms(r.data)).catch(() => {}); }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
      <div className="flex items-center gap-3">
        <User className="text-indigo-400" size={24} />
        <h1 className="font-display text-2xl sm:text-3xl font-bold">Settings</h1>
      </div>

      <Card icon={User} title="Account">
        <div className="flex items-center gap-4">
          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=6366F1&color=fff&bold=true&size=96`} alt="avatar" className="w-16 h-16 rounded-2xl" />
          <div>
            <p className="text-white font-medium">{user?.name}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
            <span className="inline-block mt-1 text-[10px] uppercase tracking-wider text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-2 py-0.5">{user?.role}</span>
          </div>
        </div>
      </Card>

      <Card icon={PlugZap} title="Connected Apps">
        <div className="space-y-2">
          {platforms.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2 text-sm text-gray-200">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: platform(p.id).color }} />
                {platform(p.id).name}
              </div>
              {p.connected
                ? <span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle2 size={13} /> Connected</span>
                : <span className="text-xs text-gray-600">Not connected</span>}
            </div>
          ))}
        </div>
        <button data-testid="settings-manage-apps" onClick={() => nav("/connect")} className="mt-4 w-full flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-gray-200 hover:bg-white/10 transition-all">
          Manage connected platforms <ChevronRight size={16} />
        </button>
      </Card>

      <Card icon={Bell} title="Notifications">
        <Row label="Message notifications" desc="Get notified about new messages across platforms.">
          <Switch data-testid="toggle-msg-notif" checked={notifMsg} onCheckedChange={(v) => { setNotifMsg(v); toast.success("Preference saved"); }} className="data-[state=checked]:bg-indigo-500" />
        </Row>
        <Row label="AI report notifications" desc="Get notified when a report is ready.">
          <Switch data-testid="toggle-report-notif" checked={notifReport} onCheckedChange={(v) => { setNotifReport(v); toast.success("Preference saved"); }} className="data-[state=checked]:bg-indigo-500" />
        </Row>
      </Card>

      <Card icon={Shield} title="Privacy">
        <Row label="Store conversation data" desc="Allow SyncChat to store conversations to power AI features.">
          <Switch data-testid="toggle-privacy" checked={saveData} onCheckedChange={(v) => { setSaveData(v); toast.success("Preference saved"); }} className="data-[state=checked]:bg-indigo-500" />
        </Row>
      </Card>

      <Card icon={Palette} title="Appearance">
        <Row label="Theme" desc="SyncChat is optimized for a premium dark experience.">
          <span className="text-sm text-gray-200 rounded-full bg-white/5 border border-white/10 px-3 py-1.5">Dark</span>
        </Row>
      </Card>
    </div>
  );
}
