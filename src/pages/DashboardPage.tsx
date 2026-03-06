import { useEffect, useState } from "react";
import {
  Activity,
  ArrowUp,
  ArrowDown,
  Clock,
  ExternalLink,
} from "lucide-react";
import { getMonitors, type Monitor } from "../services/monitors";
import { Link } from "react-router-dom";

function UptimeIndicator({ uptime }: { uptime: string | null }) {
  if (!uptime) return <span style={{ color: "#555" }}>—</span>;
  const val = parseFloat(uptime);
  const color = val >= 99 ? "#00D4AA" : val >= 95 ? "#F59E0B" : "#EF4444";
  return <span style={{ color, fontWeight: 700 }}>{uptime}%</span>;
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    up: {
      label: "Online",
      bg: "rgba(34,197,94,0.08)",
      border: "rgba(34,197,94,0.2)",
      color: "#22C55E",
    },
    down: {
      label: "Offline",
      bg: "rgba(239,68,68,0.08)",
      border: "rgba(239,68,68,0.2)",
      color: "#EF4444",
    },
    pending: {
      label: "Verificando",
      bg: "rgba(245,158,11,0.08)",
      border: "rgba(245,158,11,0.2)",
      color: "#F59E0B",
    },
  }[status] ?? {
    label: status,
    bg: "rgba(255,255,255,0.05)",
    border: "rgba(255,255,255,0.1)",
    color: "#8B949E",
  };

  return (
    <span
      style={{
        fontSize: "8px",
        padding: "3px 10px",
        borderRadius: "100px",
        background: config.bg,
        border: `1px solid ${config.border}`,
        color: config.color,
        fontWeight: 600,
        letterSpacing: "0.3px",
        marginRight: "25px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {config.label}
    </span>
  );
}

export function DashboardPage() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function fetchData() {
      getMonitors()
        .then(setMonitors)
        .finally(() => setLoading(false));
    }

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const total = monitors.length;
  const up = monitors.filter((m) => m.status === "up").length;
  const down = monitors.filter((m) => m.status === "down").length;
  const allUp = down === 0 && total > 0;

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "256px",
        }}
      >
        <div
          style={{
            width: "24px",
            height: "24px",
            border: "2px solid #00D4AA",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-live {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(0,212,170,0.4); }
          50% { opacity: 0.7; box-shadow: 0 0 0 4px rgba(0,212,170,0); }
        }
        .dash-fade { animation: fadeUp 0.4s ease both; }
        .dash-fade-1 { animation: fadeUp 0.4s 0.05s ease both; }
        .dash-fade-2 { animation: fadeUp 0.4s 0.1s ease both; }
        .dash-fade-3 { animation: fadeUp 0.4s 0.15s ease both; }
        .monitor-row:hover { background: rgba(255,255,255,0.02) !important; }
        .monitor-row { transition: background 0.15s; }
      `}</style>

      <div className="dash-fade" style={{ marginBottom: "32px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "6px",
          }}
        >
          <h2
            style={{
              color: "#F0F6FC",
              fontSize: "22px",
              fontWeight: 700,
              letterSpacing: "-0.5px",
              margin: 0,
            }}
          >
            Dashboard
          </h2>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "11px",
              color: "#00D4AA",
              background: "rgba(0,212,170,0.06)",
              border: "1px solid rgba(0,212,170,0.15)",
              padding: "3px 10px",
              borderRadius: "100px",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#00D4AA",
                animation: "pulse-live 2s infinite",
              }}
            />
            ao vivo
          </div>
        </div>
        <p style={{ color: "#555", fontSize: "12px", margin: 0 }}>
          Atualiza automaticamente a cada 60 segundos
        </p>
      </div>

      {total > 0 && (
        <div
          className="dash-fade-1"
          style={{
            background: allUp ? "rgba(0,212,170,0.04)" : "rgba(239,68,68,0.04)",
            border: `1px solid ${allUp ? "rgba(0,212,170,0.15)" : "rgba(239,68,68,0.15)"}`,
            borderRadius: "12px",
            padding: "16px 20px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: allUp ? "#00D4AA" : "#EF4444",
              flexShrink: 0,
              animation: !allUp ? "pulse-live 1.5s infinite" : "none",
            }}
          />
          <span
            style={{
              fontSize: "13px",
              color: allUp ? "#00D4AA" : "#EF4444",
              fontWeight: 600,
            }}
          >
            {allUp
              ? "✓ Todos os sistemas operacionais"
              : `⚠ ${down} sistema${down > 1 ? "s" : ""} fora do ar`}
          </span>
        </div>
      )}

      <div
        className="dash-fade-2"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        {[
          {
            icon: <Activity size={14} color="#8B949E" />,
            label: "Total",
            value: total,
            color: "#F0F6FC",
          },
          {
            icon: <ArrowUp size={14} color="#22C55E" />,
            label: "Online",
            value: up,
            color: "#22C55E",
          },
          {
            icon: <ArrowDown size={14} color="#EF4444" />,
            label: "Offline",
            value: down,
            color: down > 0 ? "#EF4444" : "#555",
          },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              background: "#0D1117",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              {card.icon}
              <span
                style={{
                  fontSize: "11px",
                  color: "#555",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                {card.label}
              </span>
            </div>
            <p
              style={{
                color: card.color,
                fontSize: "36px",
                fontWeight: 700,
                margin: 0,
                letterSpacing: "-1px",
              }}
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div
        className="dash-fade-3"
        style={{
          background: "#0D1117",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#F0F6FC" }}>
            Monitores
          </span>
          <Link
            to="/monitors"
            style={{
              fontSize: "12px",
              color: "#00D4AA",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              opacity: 0.8,
            }}
          >
            Gerenciar <ExternalLink size={10} />
          </Link>
        </div>

        {monitors.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 100px 80px 90px",
              padding: "8px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            {["Monitor", "Status", "Latência", "Uptime 7d"].map((col) => (
              <span
                key={col}
                style={{
                  fontSize: "10px",
                  color: "#333",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                }}
              >
                {col}
              </span>
            ))}
          </div>
        )}

        {monitors.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "rgba(0,212,170,0.06)",
                border: "1px solid rgba(0,212,170,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <Activity size={20} color="#00D4AA" />
            </div>
            <p style={{ color: "#555", fontSize: "13px", margin: "0 0 12px" }}>
              Nenhum monitor ainda.
            </p>
            <Link
              to="/monitors"
              style={{
                color: "#00D4AA",
                fontSize: "13px",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Criar primeiro monitor →
            </Link>
          </div>
        ) : (
          monitors.map((monitor, i) => (
            <Link
              key={monitor.id}
              to={`/monitors/${monitor.id}`}
              style={{ textDecoration: "none" }}
            >
              <div
                className="monitor-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 100px 80px 90px",
                  alignItems: "center",
                  padding: "14px 20px",
                  borderBottom:
                    i < monitors.length - 1
                      ? "1px solid rgba(255,255,255,0.04)"
                      : "none",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      flexShrink: 0,
                      background:
                        monitor.status === "up"
                          ? "#22C55E"
                          : monitor.status === "down"
                            ? "#EF4444"
                            : "#F59E0B",
                      animation:
                        monitor.status === "down"
                          ? "pulse-live 1.5s infinite"
                          : "none",
                    }}
                  />
                  <div>
                    <p
                      style={{
                        color: "#F0F6FC",
                        fontSize: "13px",
                        fontWeight: 600,
                        margin: 0,
                      }}
                    >
                      {monitor.name}
                    </p>
                    <p
                      style={{
                        color: "#333",
                        fontSize: "11px",
                        margin: "2px 0 0",
                      }}
                    >
                      {monitor.url}
                    </p>
                  </div>
                </div>

                <StatusBadge status={monitor.status} />

                <div
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <Clock size={10} color="#555" />
                  <span
                    style={{
                      fontSize: "12px",
                      color: monitor.last_ping ? "#8B949E" : "#333",
                    }}
                  >
                    {monitor.last_ping
                      ? `${monitor.last_ping.latency_ms}ms`
                      : "—"}
                  </span>
                </div>

                <div style={{ fontSize: "12px" }}>
                  <UptimeIndicator uptime={monitor.uptime_7d} />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
