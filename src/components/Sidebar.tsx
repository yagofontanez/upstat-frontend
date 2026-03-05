import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Activity, Settings, LogOut, Zap } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Monitores", icon: Activity, path: "/monitors" },
  { label: "Plano", icon: Zap, path: "/billing" },
  { label: "Configurações", icon: Settings, path: "/settings" },
];

export function Sidebar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside className="w-60 h-screen sticky top-0 bg-[#111827] border-r border-white/10 flex flex-col">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-bold text-[#00D4AA]">● UpStat</h1>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-1">
        {navItems.map(({ label, icon: Icon, path }) => (
          <Link
            key={path}
            to={path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              pathname === path
                ? "bg-[#00D4AA]/10 text-[#00D4AA]"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-7 h-7 rounded-full bg-[#00D4AA]/20 flex items-center justify-center">
            <span className="text-[#00D4AA] text-xs font-bold">
              {user?.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {user?.name}
            </p>
            <p className="text-gray-500 text-xs capitalize">{user?.plan}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-400/5 transition-colors w-full"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  );
}
