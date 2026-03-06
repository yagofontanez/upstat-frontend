import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Activity,
  Settings,
  LogOut,
  Zap,
  Menu,
  X,
  GitBranch,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Monitores", icon: Activity, path: "/monitors" },
  { label: "Plano", icon: Zap, path: "/billing" },
  { label: "Dependências", icon: GitBranch, path: "/dependencies" },
  { label: "Configurações", icon: Settings, path: "/settings" },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          padding: "24px 20px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
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
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#bbbbbb",
              display: "flex",
              padding: "4px",
            }}
          >
            <X size={18} />
          </button>
        )}
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
              onClick={onClose}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 12px",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "13px",
                background: active ? "rgba(0,212,170,0.08)" : "transparent",
                color: active ? "#00D4AA" : "#bbbbbb",
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
                color: user?.plan === "pro" ? "#00D4AA" : "#bbbbbb",
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
            color: "#bbbbbb",
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
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "#060810",
        fontFamily: "'JetBrains Mono', 'Courier New', monospace",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');
        .nav-link { transition: background 0.15s, color 0.15s; }
        .nav-link:hover { background: rgba(255,255,255,0.04) !important; color: #F0F6FC !important; }
        .logout-btn:hover { background: rgba(239,68,68,0.06) !important; color: #EF4444 !important; }
        .logout-btn { transition: background 0.15s, color 0.15s; }
        @keyframes drawerIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }

        .layout-topbar { display: none; }
        .layout-sidebar { display: flex; width: 220px; flex-shrink: 0; }

        @media (max-width: 768px) {
          .layout-sidebar { display: none; }
          .layout-topbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 14px 20px;
            background: #0A0D16;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            position: sticky;
            top: 0;
            z-index: 40;
            flex-shrink: 0;
          }
          .layout-main { padding: 20px 16px !important; }
        }
      `}</style>

      <div className="layout-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "6px",
              background: "rgba(0,212,170,0.1)",
              border: "1px solid rgba(0,212,170,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#00D4AA",
              }}
            />
          </div>
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#F0F6FC" }}>
            UpStat
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#8B949E",
            display: "flex",
            padding: "4px",
          }}
        >
          <Menu size={20} />
        </button>
      </div>

      <div style={{ display: "flex", flex: 1 }}>
        <aside
          className="layout-sidebar"
          style={{
            height: "100vh",
            position: "sticky",
            top: 0,
            background: "#0A0D16",
            borderRight: "1px solid rgba(255,255,255,0.05)",
            flexDirection: "column",
          }}
        >
          <SidebarContent />
        </aside>

        <main
          className="layout-main"
          style={{ flex: 1, padding: "32px", minWidth: 0, overflowX: "hidden" }}
        >
          {children}
        </main>
      </div>

      {mobileOpen && (
        <>
          <div
            onClick={() => setMobileOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(4px)",
              zIndex: 50,
              animation: "overlayIn 0.2s ease both",
            }}
          />
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              bottom: 0,
              width: "260px",
              background: "#0A0D16",
              borderRight: "1px solid rgba(255,255,255,0.08)",
              zIndex: 60,
              animation: "drawerIn 0.25s ease both",
            }}
          >
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </div>
        </>
      )}
    </div>
  );
}
