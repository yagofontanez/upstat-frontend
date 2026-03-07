/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../services/api";
import { CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react";
import { UptimeBar } from "../components/UptimeBar";
import { useTranslation } from "react-i18next";

interface DayData {
  day: string;
  total: number;
  up: number;
}

interface MonitorPublic {
  id: string;
  name: string;
  url: string;
  status: "up" | "down" | "degraded" | "pending";
  uptime_percent: string | null;
  uptime_history: DayData[] | null;
  last_ping: {
    status: string;
    latency_ms: number;
    checked_at: string;
  } | null;
}

interface Incident {
  id: string;
  monitor_name: string;
  started_at: string;
  resolved_at: string | null;
  duration_ms: number | null;
}

interface PageData {
  page: { title: string; description: string | null; slug: string };
  overall_status: "operational" | "degraded" | "down";
  monitors: MonitorPublic[];
  incidents: Incident[];
}

function formatDuration(ms: number) {
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}min`;
  return `${Math.floor(hours / 24)}d ${hours % 24}h`;
}

export function StatusPage() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    function fetchData() {
      api
        .get(`/status/${slug}`)
        .then((res) => setData(res.data))
        .catch(() => setNotFound(true))
        .finally(() => setLoading(false));
    }
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [slug]);

  useEffect(() => {
    if (!data) return;
    const status =
      data.overall_status === "operational"
        ? t("status_page.all_ok")
        : data.overall_status === "degraded"
          ? t("status_page.degraded")
          : t("status_page.down");
    document.title = `${data.page.title} — UpStat`;
    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    setMeta("description", status);
    setMeta("og:title", data.page.title, true);
    setMeta("og:description", status, true);
    return () => {
      document.title = "UpStat — Monitoramento de sistemas";
    };
  }, [data]);

  useEffect(() => {
    if (!data) return;
    Promise.resolve().then(() => setCountdown(60));
    const timer = setInterval(
      () => setCountdown((prev) => (prev <= 1 ? 60 : prev - 1)),
      1000,
    );
    return () => clearInterval(timer);
  }, [data]);

  function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return t("status_page.time_ago.now");
    if (minutes < 60) return `${minutes}${t("status_page.time_ago.min_ago")}`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}${t("status_page.time_ago.hour_ago")}`;
    return `${Math.floor(hours / 24)}${t("status_page.time_ago.days_ago")}`;
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#060810",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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

  if (notFound || !data) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#060810",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');`}</style>
        <div style={{ textAlign: "center", maxWidth: "360px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "#0D1117",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              fontSize: "28px",
            }}
          >
            🔍
          </div>
          <h1
            style={{
              color: "#F0F6FC",
              fontSize: "22px",
              fontWeight: 700,
              margin: "0 0 8px",
              letterSpacing: "-0.5px",
            }}
          >
            {t("status_page.not_found")}
          </h1>
          <p
            style={{
              color: "#555",
              fontSize: "13px",
              lineHeight: 1.7,
              margin: "0 0 32px",
            }}
          >
            {t("status_page.not_found_2")}
          </p>
          <a
            href="/"
            style={{
              display: "inline-block",
              background: "#00D4AA",
              color: "#000",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "13px",
              fontWeight: 700,
              padding: "12px 24px",
              borderRadius: "8px",
              textDecoration: "none",
            }}
          >
            {t("status_page.create")}
          </a>
          <p style={{ color: "#333", fontSize: "12px", marginTop: "32px" }}>
            ● UpStat
          </p>
        </div>
      </div>
    );
  }

  const { page, overall_status, monitors, incidents } = data;

  const statusConfig = {
    operational: {
      label: t("status_page.status_config.all_ok"),
      Icon: CheckCircle,
      color: "#22C55E",
      bg: "rgba(34,197,94,0.06)",
      border: "rgba(34,197,94,0.15)",
    },
    degraded: {
      label: t("status_page.status_config.degraded"),
      Icon: AlertCircle,
      color: "#F59E0B",
      bg: "rgba(245,158,11,0.06)",
      border: "rgba(245,158,11,0.15)",
    },
    down: {
      label: t("status_page.status_config.down"),
      Icon: XCircle,
      color: "#EF4444",
      bg: "rgba(239,68,68,0.06)",
      border: "rgba(239,68,68,0.15)",
    },
  };

  const current = statusConfig[overall_status];
  const { Icon: StatusIcon } = current;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#060810",
        fontFamily: "'JetBrains Mono', 'Courier New', monospace",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse-dot { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        .sp-fade { animation: fadeUp 0.5s ease both; }
        .sp-fade-1 { animation: fadeUp 0.5s 0.1s ease both; }
        .sp-fade-2 { animation: fadeUp 0.5s 0.15s ease both; }
        .sp-fade-3 { animation: fadeUp 0.5s 0.2s ease both; }
        .sp-fade-4 { animation: fadeUp 0.5s 0.25s ease both; }
        .monitor-row:hover { background: rgba(255,255,255,0.01) !important; }
      `}</style>

      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(0,212,170,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,170,0.02) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: "640px",
          margin: "0 auto",
          padding: "64px 24px",
          position: "relative",
        }}
      >
        <div
          className="sp-fade"
          style={{ textAlign: "center", marginBottom: "48px" }}
        >
          <div
            style={{
              fontSize: "13px",
              color: "#00D4AA",
              letterSpacing: "3px",
              textTransform: "uppercase",
              marginBottom: "16px",
              opacity: 0.7,
            }}
          >
            ● UpStat
          </div>
          <h1
            style={{
              color: "#F0F6FC",
              fontSize: "32px",
              fontWeight: 700,
              letterSpacing: "-1px",
              margin: "0 0 10px",
            }}
          >
            {page.title}
          </h1>
          {page.description && (
            <p
              style={{
                color: "#555",
                fontSize: "13px",
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              {page.description}
            </p>
          )}
        </div>

        <div
          className="sp-fade-1"
          style={{
            background: current.bg,
            border: `1px solid ${current.border}`,
            borderRadius: "14px",
            padding: "18px 24px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <StatusIcon
            size={18}
            color={current.color}
            style={{ flexShrink: 0 }}
          />
          <span
            style={{ fontSize: "14px", fontWeight: 700, color: current.color }}
          >
            {current.label}
          </span>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "11px",
              color: "#bbbbbb",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#00D4AA",
                animation: "pulse-dot 2s infinite",
              }}
            />
            {t("status_page.att_in")} {countdown}s
          </div>
        </div>

        {monitors.length > 0 && (
          <div
            className="sp-fade-2"
            style={{
              background: "#0D1117",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "14px",
              overflow: "hidden",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                padding: "14px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#F0F6FC",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                {t("status_page.services")}
              </span>
            </div>
            {monitors.map((monitor, i) => (
              <div
                key={monitor.id}
                className="monitor-row"
                style={{
                  padding: "16px 20px",
                  borderBottom:
                    i < monitors.length - 1
                      ? "1px solid rgba(255,255,255,0.04)"
                      : "none",
                  transition: "background 0.15s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
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
                            ? "pulse-dot 1.5s infinite"
                            : "none",
                      }}
                    />
                    <span
                      style={{
                        color: "#F0F6FC",
                        fontSize: "13px",
                        fontWeight: 600,
                      }}
                    >
                      {monitor.name}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    {monitor.last_ping && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          color: "#bbbbbb",
                          fontSize: "11px",
                        }}
                      >
                        <Clock size={10} />
                        {monitor.last_ping.latency_ms}ms
                      </div>
                    )}
                    {monitor.uptime_percent && (
                      <span style={{ fontSize: "11px", color: "#bbbbbb" }}>
                        {monitor.uptime_percent}%
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "3px 10px",
                        borderRadius: "100px",
                        fontWeight: 600,
                        background:
                          monitor.status === "up"
                            ? "rgba(34,197,94,0.08)"
                            : monitor.status === "down"
                              ? "rgba(239,68,68,0.08)"
                              : "rgba(245,158,11,0.08)",
                        color:
                          monitor.status === "up"
                            ? "#22C55E"
                            : monitor.status === "down"
                              ? "#EF4444"
                              : "#F59E0B",
                        border: `1px solid ${monitor.status === "up" ? "rgba(34,197,94,0.2)" : monitor.status === "down" ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.2)"}`,
                      }}
                    >
                      {monitor.status === "up"
                        ? t("status_page.up")
                        : monitor.status === "down"
                          ? t("status_page.down_stts")
                          : t("status_page.pending")}
                    </span>
                  </div>
                </div>
                <UptimeBar history={monitor.uptime_history || []} />
              </div>
            ))}
          </div>
        )}

        <div
          className="sp-fade-3"
          style={{
            background: "#0D1117",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "14px",
            overflow: "hidden",
            marginBottom: "48px",
          }}
        >
          <div
            style={{
              padding: "14px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#F0F6FC",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              {t("status_page.incidents")}
            </span>
          </div>
          {incidents.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "rgba(34,197,94,0.06)",
                  border: "1px solid rgba(34,197,94,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                  fontSize: "18px",
                }}
              >
                🎉
              </div>
              <p style={{ color: "#bbbbbb", fontSize: "13px", margin: 0 }}>
                {t("status_page.0_incidents")}
              </p>
            </div>
          ) : (
            incidents.map((incident, i) => (
              <div
                key={incident.id}
                style={{
                  padding: "14px 20px",
                  borderBottom:
                    i < incidents.length - 1
                      ? "1px solid rgba(255,255,255,0.04)"
                      : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "7px",
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
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: incident.resolved_at
                          ? "#22C55E"
                          : "#EF4444",
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
                      {incident.monitor_name}
                    </span>
                    <p
                      style={{
                        color: "#bbbbbb",
                        fontSize: "11px",
                        margin: "2px 0 0",
                      }}
                    >
                      {timeAgo(incident.started_at)}
                      {incident.duration_ms &&
                        ` · ${formatDuration(incident.duration_ms)}`}
                    </p>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "11px",
                    padding: "3px 10px",
                    borderRadius: "100px",
                    fontWeight: 600,
                    background: incident.resolved_at
                      ? "rgba(34,197,94,0.08)"
                      : "rgba(239,68,68,0.08)",
                    color: incident.resolved_at ? "#22C55E" : "#EF4444",
                    border: `1px solid ${incident.resolved_at ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
                  }}
                >
                  {incident.resolved_at
                    ? t("status_page.resolved")
                    : t("status_page.in_progress")}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="sp-fade-4" style={{ textAlign: "center" }}>
          <a
            href="https://upstat.online"
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: "none" }}
          >
            <span style={{ fontSize: "12px", color: "#bbbbbb" }}>
              Powered by{" "}
            </span>
            <span
              style={{ fontSize: "12px", color: "#00D4AA", fontWeight: 600 }}
            >
              ● UpStat
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
