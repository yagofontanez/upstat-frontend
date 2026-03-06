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
    <aside
      style={{
        width: "220px",
        height: "100vh",
        position: "sticky",
        top: 0,
        background: "#0A0D16",
        borderRight: "1px solid rgba(255,255,255,0.05)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'JetBrains Mono', 'Courier New', monospace",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');
        .nav-link { transition: background 0.15s, color 0.15s; }
        .nav-link:hover { background: rgba(255,255,255,0.04) !important; color: #F0F6FC !important; }
        .logout-btn:hover { background: rgba(239,68,68,0.06) !important; color: #EF4444 !important; }
        .logout-btn { transition: background 0.15s, color 0.15s; }
      `}</style>

      <div
        style={{
          padding: "24px 20px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              background: "rgba(0,212,170,0.1)",
              border: "1px solid rgba(0,212,170,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#00D4AA",
              }}
            />
          </div>
          <span
            style={{
              fontSize: "15px",
              fontWeight: 700,
              color: "#F0F6FC",
              letterSpacing: "-0.5px",
            }}
          >
            UpStat
          </span>
        </div>
      </div>

      <nav
        style={{
          flex: 1,
          padding: "12px 10px",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
      >
        {navItems.map(({ label, icon: Icon, path }) => {
          const active = pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className="nav-link"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 12px",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "13px",
                background: active ? "rgba(0,212,170,0.08)" : "transparent",
                color: active ? "#00D4AA" : "#555",
                fontWeight: active ? 600 : 400,
                borderLeft: active
                  ? "2px solid #00D4AA"
                  : "2px solid transparent",
              }}
            >
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div
        style={{
          padding: "12px 10px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 12px",
            marginBottom: "2px",
          }}
        >
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "8px",
              background: "rgba(0,212,170,0.1)",
              border: "1px solid rgba(0,212,170,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span
              style={{ color: "#00D4AA", fontSize: "12px", fontWeight: 700 }}
            >
              {user?.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                color: "#F0F6FC",
                fontSize: "12px",
                fontWeight: 600,
                margin: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.name}
            </p>
            <p
              style={{
                fontSize: "10px",
                margin: "1px 0 0",
                color: user?.plan === "pro" ? "#00D4AA" : "#555",
                fontWeight: user?.plan === "pro" ? 600 : 400,
              }}
            >
              {user?.plan === "pro" ? "⚡ Pro" : "Free"}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="logout-btn"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "9px 12px",
            borderRadius: "8px",
            fontSize: "13px",
            color: "#444",
            background: "none",
            border: "none",
            cursor: "pointer",
            width: "100%",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <LogOut size={14} />
          Sair
        </button>
      </div>
    </aside>
  );
}
