import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Menu, MessageCircle, FileBarChart, PlugZap, User, LogOut, Settings as SettingsIcon, LifeBuoy } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const notifIcon = { message: MessageCircle, report: FileBarChart, app: PlugZap };

export default function Topbar({ onMenu }) {
  const nav = useNavigate();
  const { user, logout } = useAuth();
  const [q, setQ] = useState("");
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    api.get("/notifications").then((r) => setNotifs(r.data)).catch(() => {});
  }, []);

  const unread = notifs.filter((n) => !n.read).length;

  const submit = (e) => {
    e.preventDefault();
    if (q.trim()) nav(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className="h-16 shrink-0 flex items-center gap-3 px-4 sm:px-6 border-b border-white/10 bg-[#07090E]/80 backdrop-blur-xl sticky top-0 z-30">
      <button onClick={onMenu} data-testid="topbar-menu" className="lg:hidden text-gray-400 hover:text-white">
        <Menu size={22} />
      </button>

      <form onSubmit={submit} className="flex-1 max-w-md">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            data-testid="global-search-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search messages, people, or keywords..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-transparent transition-all"
          />
        </div>
      </form>

      <div className="flex items-center gap-2 ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button data-testid="notifications-trigger" className="relative w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-all">
              <Bell size={19} />
              {unread > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#07090E]" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-[#111827] border-white/10 text-gray-200">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              <span className="text-xs text-indigo-400">{unread} new</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            {notifs.map((n, i) => {
              const Icon = notifIcon[n.type] || Bell;
              return (
                <div key={i} data-testid={`notification-${i}`} className={`flex gap-3 px-2 py-2.5 rounded-lg ${!n.read ? "bg-indigo-500/5" : ""}`}>
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center shrink-0">
                    <Icon size={15} className="text-indigo-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">{n.title}</p>
                    <p className="text-xs text-gray-400 line-clamp-1">{n.body}</p>
                    <p className="text-[10px] text-gray-600 mt-0.5">{n.time}</p>
                  </div>
                </div>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button data-testid="profile-trigger" className="flex items-center gap-2 rounded-xl pl-1 pr-2 py-1 hover:bg-white/5 transition-all">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=8B5CF6&color=fff&bold=true`}
                alt="avatar"
                className="w-8 h-8 rounded-full"
              />
              <span className="hidden sm:block text-sm text-gray-200 max-w-[120px] truncate">{user?.name}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-[#111827] border-white/10 text-gray-200">
            <DropdownMenuLabel>
              <p className="text-sm text-white">{user?.name}</p>
              <p className="text-xs text-gray-500 font-normal truncate">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem data-testid="profile-menu-settings" onClick={() => nav("/settings")} className="cursor-pointer focus:bg-white/5">
              <User size={15} className="mr-2" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => nav("/settings")} className="cursor-pointer focus:bg-white/5">
              <SettingsIcon size={15} className="mr-2" /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => nav("/ai/ask")} className="cursor-pointer focus:bg-white/5">
              <LifeBuoy size={15} className="mr-2" /> Help
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem data-testid="profile-menu-logout" onClick={logout} className="cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-400">
              <LogOut size={15} className="mr-2" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
