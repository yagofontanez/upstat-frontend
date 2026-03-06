/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Activity,
  Download,
  Shield,
  Globe,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { getMonitors, type Monitor } from "../services/monitors";
import {
  getMonitorPings,
  getMonitorIncidents,
  type Ping,
  type Incident,
} from "../services/monitorDetails";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";

function formatDuration(ms: number) {
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}min`;
  return `${Math.floor(hours / 24)}d ${hours % 24}h`;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes}min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  return `${Math.floor(hours / 24)}d atrás`;
}

function buildHeatmap(pings: Ping[]) {
  const days: Record<string, { total: number; up: number }> = {};
  pings.forEach((ping) => {
    const day = new Date(ping.checked_at).toISOString().split("T")[0];
    if (!days[day]) days[day] = { total: 0, up: 0 };
    days[day].total++;
    if (ping.status === "up") days[day].up++;
  });
  return Object.entries(days)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, { total, up }]) => ({
      day,
      uptime: total > 0 ? Math.round((up / total) * 100) : 0,
    }));
}

function buildLatencyChart(pings: Ping[]) {
  return pings
    .filter((p) => p.latency_ms !== null && p.status === "up")
    .slice(0, 50)
    .reverse()
    .map((p) => ({
      time: new Date(p.checked_at).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      latency: p.latency_ms,
    }));
}

export function MonitorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [monitor, setMonitor] = useState<Monitor | null>(null);
  const [pings, setPings] = useState<Ping[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [uptimePercent, setUptimePercent] = useState<string | null>(null);
  const [avgLatency, setAvgLatency] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([getMonitors(), getMonitorPings(id), getMonitorIncidents(id)])
      .then(([monitors, pingsData, incidentsData]) => {
        const found = monitors.find((m: Monitor) => m.id === id);
        if (!found) {
          navigate("/monitors");
          return;
        }
        setMonitor(found);
        setPings(pingsData.pings);
        setUptimePercent(pingsData.uptime_percent);
        setAvgLatency(pingsData.avg_latency_ms);
        setIncidents(incidentsData);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleExport() {
    const res = await api.get(`/monitors/${id}/export`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `upstat-${monitor?.name}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

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

  if (!monitor) return null;

  const heatmap = buildHeatmap(pings);
  const latencyChart = buildLatencyChart(pings);
  const statusColor =
    monitor.status === "up"
      ? "#22C55E"
      : monitor.status === "down"
        ? "#EF4444"
        : "#F59E0B";
  const statusLabel =
    monitor.status === "up"
      ? "Online"
      : monitor.status === "down"
        ? "Offline"
        : "Pendente";

  const statCards = [
    {
      label: "Status",
      value: statusLabel,
      color: statusColor,
      icon: (
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: statusColor,
            animation:
              monitor.status === "down" ? "pulse-dot 1.5s infinite" : "none",
          }}
        />
      ),
    },
    {
      label: "Uptime",
      value: uptimePercent ? `${uptimePercent}%` : "—",
      color:
        uptimePercent && parseFloat(uptimePercent) >= 99
          ? "#00D4AA"
          : uptimePercent && parseFloat(uptimePercent) >= 95
            ? "#F59E0B"
            : "#EF4444",
      icon: <Activity size={12} color="#555" />,
    },
    {
      label: "Latência média",
      value: avgLatency ? `${avgLatency}ms` : "—",
      color: "#F0F6FC",
      icon: <Clock size={12} color="#555" />,
    },
    {
      label: "SSL",
      value:
        monitor.ssl_days_remaining === null
          ? "—"
          : `${monitor.ssl_days_remaining}d`,
      color:
        monitor.ssl_days_remaining === null
          ? "#555"
          : monitor.ssl_days_remaining <= 7
            ? "#EF4444"
            : monitor.ssl_days_remaining <= 30
              ? "#F59E0B"
              : "#22C55E",
      icon: <Shield size={12} color="#555" />,
    },
    {
      label: "DNS",
      value:
        monitor.dns_valid === null || monitor.dns_valid === undefined
          ? "—"
          : monitor.dns_valid
            ? "OK"
            : "Falhou",
      color:
        monitor.dns_valid === null || monitor.dns_valid === undefined
          ? "#555"
          : monitor.dns_valid
            ? "#22C55E"
            : "#EF4444",
      icon: <Globe size={12} color="#555" />,
    },
  ];

  return (
    <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse-dot { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        .det-fade { animation: fadeUp 0.4s ease both; }
        .det-fade-1 { animation: fadeUp 0.4s 0.05s ease both; }
        .det-fade-2 { animation: fadeUp 0.4s 0.1s ease both; }
        .det-fade-3 { animation: fadeUp 0.4s 0.15s ease both; }
        .det-fade-4 { animation: fadeUp 0.4s 0.2s ease both; }
        .incident-row:hover { background: rgba(255,255,255,0.02) !important; }
        .incident-row { transition: background 0.15s; }
        .back-btn:hover { color: #F0F6FC !important; }
        .export-btn:hover { background: rgba(255,255,255,0.08) !important; color: #F0F6FC !important; }
      `}</style>

      <button
        className="back-btn"
        onClick={() => navigate("/monitors")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#555",
          fontSize: "12px",
          fontFamily: "'JetBrains Mono', monospace",
          marginBottom: "24px",
          padding: 0,
          transition: "color 0.15s",
        }}
      >
        <ArrowLeft size={14} />
        Voltar
      </button>

      <div
        className="det-fade"
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "28px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: `${statusColor}11`,
              border: `1px solid ${statusColor}33`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: statusColor,
                animation:
                  monitor.status === "down"
                    ? "pulse-dot 1.5s infinite"
                    : "none",
              }}
            />
          </div>
          <div>
            <h2
              style={{
                color: "#F0F6FC",
                fontSize: "20px",
                fontWeight: 700,
                letterSpacing: "-0.5px",
                margin: "0 0 3px",
              }}
            >
              {monitor.name}
            </h2>
            <a
              href={monitor.url}
              target="_blank"
              rel="noreferrer"
              style={{
                color: "#555",
                fontSize: "12px",
                textDecoration: "none",
              }}
            >
              {monitor.url} ↗
            </a>
          </div>
        </div>

        {user?.plan === "pro" ? (
          <button
            onClick={handleExport}
            className="export-btn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px",
              padding: "8px 14px",
              cursor: "pointer",
              color: "#8B949E",
              fontSize: "12px",
              fontFamily: "'JetBrains Mono', monospace",
              transition: "all 0.15s",
            }}
          >
            <Download size={13} />
            Exportar CSV
          </button>
        ) : (
          <button
            onClick={() => navigate("/billing")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(0,212,170,0.04)",
              border: "1px solid rgba(0,212,170,0.12)",
              borderRadius: "8px",
              padding: "8px 14px",
              cursor: "pointer",
              color: "#00D4AA",
              fontSize: "12px",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            <Download size={13} />
            Exportar CSV
            <span
              style={{
                fontSize: "10px",
                background: "rgba(0,212,170,0.1)",
                color: "#00D4AA",
                padding: "1px 6px",
                borderRadius: "4px",
                fontWeight: 700,
              }}
            >
              Pro
            </span>
          </button>
        )}
      </div>

      <div
        className="det-fade-1"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        {statCards.map((card) => (
          <div
            key={card.label}
            style={{
              background: "#0D1117",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "12px",
              padding: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "10px",
              }}
            >
              {card.icon}
              <span
                style={{
                  fontSize: "10px",
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
                fontSize: "18px",
                fontWeight: 700,
                margin: 0,
                letterSpacing: "-0.5px",
              }}
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div
        className="det-fade-2"
        style={{
          background: "#0D1117",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#F0F6FC" }}>
            Uptime por dia
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontSize: "10px",
              color: "#555",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "3px",
                  background: "rgba(34,197,94,0.2)",
                }}
              />{" "}
              100%
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "3px",
                  background: "rgba(245,158,11,0.2)",
                }}
              />{" "}
              &gt;90%
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "3px",
                  background: "rgba(239,68,68,0.2)",
                }}
              />{" "}
              &lt;90%
            </div>
          </div>
        </div>
        {heatmap.length === 0 ? (
          <p style={{ color: "#555", fontSize: "12px" }}>Sem dados ainda.</p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {heatmap.map(({ day, uptime }) => (
              <div
                key={day}
                title={`${day}: ${uptime}%`}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  fontWeight: 600,
                  cursor: "default",
                  background:
                    uptime === 100
                      ? "rgba(34,197,94,0.12)"
                      : uptime >= 90
                        ? "rgba(245,158,11,0.12)"
                        : "rgba(239,68,68,0.12)",
                  color:
                    uptime === 100
                      ? "#22C55E"
                      : uptime >= 90
                        ? "#F59E0B"
                        : "#EF4444",
                  border: `1px solid ${uptime === 100 ? "rgba(34,197,94,0.15)" : uptime >= 90 ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)"}`,
                }}
              >
                {uptime}
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        className="det-fade-3"
        style={{
          background: "#0D1117",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#F0F6FC" }}>
            Latência ao longo do tempo
          </span>
          {user?.plan !== "pro" && (
            <span
              style={{
                fontSize: "10px",
                padding: "3px 8px",
                borderRadius: "100px",
                background: "rgba(245,158,11,0.08)",
                color: "#F59E0B",
                border: "1px solid rgba(245,158,11,0.15)",
                fontWeight: 600,
              }}
            >
              Pro
            </span>
          )}
        </div>
        {user?.plan !== "pro" ? (
          <div
            style={{
              height: "160px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px dashed rgba(255,255,255,0.06)",
              borderRadius: "8px",
              cursor: "pointer",
            }}
            onClick={() => navigate("/billing")}
          >
            <div style={{ textAlign: "center" }}>
              <Activity
                size={20}
                color="#333"
                style={{ margin: "0 auto 8px" }}
              />
              <p style={{ color: "#555", fontSize: "12px", margin: 0 }}>
                Disponível no plano Pro
              </p>
              <p
                style={{
                  color: "#00D4AA",
                  fontSize: "11px",
                  margin: "4px 0 0",
                }}
              >
                Fazer upgrade →
              </p>
            </div>
          </div>
        ) : latencyChart.length === 0 ? (
          <p style={{ color: "#555", fontSize: "12px" }}>Sem dados ainda.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={latencyChart}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
              />
              <XAxis
                dataKey="time"
                tick={{
                  fill: "#555",
                  fontSize: 10,
                  fontFamily: "JetBrains Mono",
                }}
              />
              <YAxis
                tick={{
                  fill: "#555",
                  fontSize: 10,
                  fontFamily: "JetBrains Mono",
                }}
                unit="ms"
              />
              <Tooltip
                contentStyle={{
                  background: "#161B22",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  fontFamily: "JetBrains Mono",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "#8B949E" }}
                itemStyle={{ color: "#00D4AA" }}
              />
              <Line
                type="monotone"
                dataKey="latency"
                stroke="#00D4AA"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#00D4AA" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div
        className="det-fade-4"
        style={{
          background: "#0D1117",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#F0F6FC" }}>
            Histórico de incidentes
          </span>
          <span style={{ fontSize: "11px", color: "#555" }}>
            {incidents.length} total
          </span>
        </div>

        {incidents.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "rgba(34,197,94,0.06)",
                border: "1px solid rgba(34,197,94,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
              }}
            >
              <span style={{ fontSize: "18px" }}>🎉</span>
            </div>
            <p style={{ color: "#555", fontSize: "13px", margin: 0 }}>
              Nenhum incidente registrado.
            </p>
          </div>
        ) : (
          incidents.map((incident, i) => (
            <div
              key={incident.id}
              className="incident-row"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                borderBottom:
                  i < incidents.length - 1
                    ? "1px solid rgba(255,255,255,0.04)"
                    : "none",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    flexShrink: 0,
                    background: incident.resolved_at
                      ? "rgba(34,197,94,0.08)"
                      : "rgba(239,68,68,0.08)",
                    border: `1px solid ${incident.resolved_at ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)"}`,
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
                      background: incident.resolved_at ? "#22C55E" : "#EF4444",
                    }}
                  />
                </div>
                <div>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "#F0F6FC",
                      fontWeight: 600,
                    }}
                  >
                    {incident.resolved_at ? "Resolvido" : "Em andamento"}
                  </span>
                  <p
                    style={{
                      color: "#555",
                      fontSize: "11px",
                      margin: "2px 0 0",
                    }}
                  >
                    Iniciou {timeAgo(incident.started_at)}
                  </p>
                </div>
              </div>
              {incident.duration_ms && (
                <span
                  style={{
                    fontSize: "12px",
                    color: "#8B949E",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    padding: "4px 10px",
                    borderRadius: "6px",
                  }}
                >
                  {formatDuration(incident.duration_ms)}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
