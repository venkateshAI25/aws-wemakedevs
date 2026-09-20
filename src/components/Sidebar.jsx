import { NavLink, useNavigate } from "react-router-dom";
import {
  Home, Layers, PlugZap, Inbox, Sparkles, FileBarChart, Settings as SettingsIcon,
  LifeBuoy, LogOut, ChevronLeft, MessagesSquare, Bot, ScrollText,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const mainNav = [
  { to: "/", label: "Home", icon: Home, end: true, id: "home" },
  { to: "/spaces", label: "My Spaces", icon: Layers, id: "spaces" },
  { to: "/connect", label: "Connect Apps", icon: PlugZap, id: "connect" },
  { to: "/inbox", label: "Inbox", icon: Inbox, id: "inbox" },
];

const aiNav = [
  { to: "/ai/summary", label: "AI Summary", icon: Sparkles, id: "ai-summary" },
  { to: "/ai/ask", label: "Ask SyncChat", icon: Bot, id: "ask" },
  { to: "/reports", label: "Reports", icon: ScrollText, id: "reports" },
];

function Item({ to, label, icon: Icon, end, collapsed, id, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      data-testid={`nav-${id}`}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all
        ${isActive
          ? "text-white bg-gradient-to-r from-indigo-500/25 to-violet-500/10 border border-indigo-500/30"
          : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"}`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-gradient-to-b from-indigo-400 to-violet-500" />}
          <Icon size={18} className="shrink-0" />
          {!collapsed && <span className="truncate">{label}</span>}
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar({ collapsed, onToggle, onNavigate }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <div className="flex h-full flex-col bg-[#0B0F19] border-r border-white/10">
      <div className="flex items-center justify-between px-4 h-16 border-b border-white/10">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30">
            <MessagesSquare size={18} className="text-white" />
          </div>
          {!collapsed && <span className="font-display font-bold text-lg tracking-tight">SyncChat</span>}
        </div>
        {onToggle && (
          <button
            onClick={onToggle}
            data-testid="sidebar-toggle"
            className="hidden lg:flex text-gray-500 hover:text-white transition-colors"
          >
            <ChevronLeft size={18} className={`transition-transform ${collapsed ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto sc-scroll px-3 py-4 space-y-1">
        {mainNav.map((n) => (
          <Item key={n.id} {...n} collapsed={collapsed} onNavigate={onNavigate} />
        ))}

        <div className="pt-4">
          {!collapsed && (
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-600">AI Tools</p>
          )}
          {aiNav.map((n) => (
            <Item key={n.id} {...n} collapsed={collapsed} onNavigate={onNavigate} />
          ))}
        </div>

        <div className="pt-4">
          <Item to="/settings" label="Settings" icon={SettingsIcon} id="settings" collapsed={collapsed} onNavigate={onNavigate} />
        </div>
      </nav>

      <div className="border-t border-white/10 p-3 space-y-1">
        <button
          data-testid="nav-help"
          onClick={() => { onNavigate?.(); nav("/ai/ask"); }}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <LifeBuoy size={18} className="shrink-0" />
          {!collapsed && <span>Help & Support</span>}
        </button>

        <div className={`flex items-center gap-3 rounded-xl px-2 py-2 ${collapsed ? "justify-center" : ""}`}>
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=6366F1&color=fff&bold=true`}
            alt="avatar"
            className="w-8 h-8 rounded-full shrink-0"
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          )}
          {!collapsed && (
            <button data-testid="sidebar-logout" onClick={logout} className="text-gray-500 hover:text-red-400 transition-colors">
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
