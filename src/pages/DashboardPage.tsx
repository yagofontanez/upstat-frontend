/* eslint-disable react-hooks/exhaustive-deps */
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
import { useAuth } from "../hooks/useAuth";
import { getMyPage } from "../services/pages";
import { OnboardingModal } from "../components/OnboardingModal";
import { useTranslation } from "react-i18next";

function UptimeIndicator({ uptime }: { uptime: string | null }) {
  if (!uptime) return <span style={{ color: "#555" }}>—</span>;
  const val = parseFloat(uptime);
  const color = val >= 99 ? "#00D4AA" : val >= 95 ? "#F59E0B" : "#EF4444";
  return <span style={{ color, fontWeight: 700 }}>{uptime}%</span>;
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();

  const config = {
    up: {
      label: t("dashboard.status.online"),
      bg: "rgba(34,197,94,0.08)",
      border: "rgba(34,197,94,0.2)",
      color: "#22C55E",
    },
    down: {
      label: t("dashboard.status.off"),
      bg: "rgba(239,68,68,0.08)",
      border: "rgba(239,68,68,0.2)",
      color: "#EF4444",
    },
    pending: {
      label: t("dashboard.status.verifying"),
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
        fontSize: "11px",
        padding: "3px 10px",
        borderRadius: "100px",
        background: config.bg,
        border: `1px solid ${config.border}`,
        color: config.color,
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        whiteSpace: "nowrap",
        marginRight: 15,
        justifyContent: "center",
      }}
    >
      <span
        style={{
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          background: config.color,
          flexShrink: 0,
        }}
      />
      {config.label}
    </span>
  );
}

export function DashboardPage() {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [statusSlug, setStatusSlug] = useState("");

  useEffect(() => {
    if (!user?.onboarding_completed) {
      getMyPage().then((page) => {
        setStatusSlug(page.slug);
        setShowOnboarding(true);
      });
    }
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
      {showOnboarding && (
        <OnboardingModal
          userName={user!.name}
          statusSlug={statusSlug}
          onComplete={async () => {
            await refreshUser();
            setShowOnboarding(false);
          }}
        />
      )}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse-live { 0%,100% { opacity:1; box-shadow:0 0 0 0 rgba(0,212,170,0.4); } 50% { opacity:0.7; box-shadow:0 0 0 4px rgba(0,212,170,0); } }
        .dash-fade { animation: fadeUp 0.4s ease both; }
        .dash-fade-1 { animation: fadeUp 0.4s 0.05s ease both; }
        .dash-fade-2 { animation: fadeUp 0.4s 0.1s ease both; }
        .dash-fade-3 { animation: fadeUp 0.4s 0.15s ease both; }
        .monitor-row:hover { background: rgba(255,255,255,0.02) !important; }
        .monitor-row { transition: background 0.15s; }

        .monitor-desktop { display: grid; grid-template-columns: 1fr 100px 80px 90px; align-items: center; padding: 14px 20px; cursor: pointer; }
        .monitor-mobile { display: none; padding: 14px 20px; cursor: pointer; }
        .monitor-col-header { display: grid; grid-template-columns: 1fr 100px 80px 90px; padding: 8px 20px; border-bottom: 1px solid rgba(255,255,255,0.04); }

        @media (max-width: 768px) {
          .monitor-desktop { display: none; }
          .monitor-mobile { display: block; }
          .monitor-col-header { display: none; }
        }
      `}</style>

      <div className="dash-fade" style={{ marginBottom: "28px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "4px",
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
            {t("dashboard.dash")}
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
            {t("dashboard.live")}
          </div>
        </div>
        <p style={{ color: "#bbbbbb", fontSize: "12px", margin: 0 }}>
          {t("dashboard.att")}
        </p>
      </div>

      {total > 0 && (
        <div
          className="dash-fade-1"
          style={{
            background: allUp ? "rgba(0,212,170,0.04)" : "rgba(239,68,68,0.04)",
            border: `1px solid ${allUp ? "rgba(0,212,170,0.15)" : "rgba(239,68,68,0.15)"}`,
            borderRadius: "12px",
            padding: "14px 20px",
            marginBottom: "20px",
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
              ? t("dashboard.all_ok")
              : `⚠ ${down} ${t("dashboard.some_off")}${down > 1 ? "s" : ""} ${t("dashboard.some_off_2")}`}
          </span>
        </div>
      )}

      <div
        className="dash-fade-2"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px",
          marginBottom: "20px",
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
              padding: "16px 20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "10px",
              }}
            >
              {card.icon}
              <span
                style={{
                  fontSize: "10px",
                  color: "#bbbbbb",
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
                fontSize: "32px",
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
            padding: "14px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#F0F6FC" }}>
            {t("dashboard.monitors")}
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
            {t("dashboard.gerency")} <ExternalLink size={10} />
          </Link>
        </div>

        {monitors.length > 0 && (
          <div className="monitor-col-header">
            {[
              t("dashboard.monitor"),
              t("dashboard.stat"),
              t("dashboard.latency"),
              t("dashboard.uptime"),
            ].map((col) => (
              <span
                key={col}
                style={{
                  fontSize: "10px",
                  color: "#bbbbbb",
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
            <p
              style={{ color: "#bbbbbb", fontSize: "13px", margin: "0 0 12px" }}
            >
              {t("dashboard.0_monitors")}
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
              {t("dashboard.create_first")}
            </Link>
          </div>
        ) : (
          monitors.map((monitor, i) => {
            const borderBottom =
              i < monitors.length - 1
                ? "1px solid rgba(255,255,255,0.04)"
                : "none";
            return (
              <div key={monitor.id}>
                <Link
                  to={`/monitors/${monitor.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    className="monitor-row monitor-desktop"
                    style={{ borderBottom }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        minWidth: 0,
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
                              ? "pulse-live 1.5s infinite"
                              : "none",
                        }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <p
                          style={{
                            color: "#F0F6FC",
                            fontSize: "13px",
                            fontWeight: 600,
                            margin: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {monitor.name}
                        </p>
                        <p
                          style={{
                            color: "#8f8f8f",
                            fontSize: "11px",
                            margin: "2px 0 0",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {monitor.url}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={monitor.status} />
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
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

                <div
                  className="monitor-row monitor-mobile"
                  style={{ borderBottom }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      marginBottom: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        minWidth: 0,
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
                              ? "pulse-live 1.5s infinite"
                              : "none",
                        }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <p
                          style={{
                            color: "#F0F6FC",
                            fontSize: "13px",
                            fontWeight: 600,
                            margin: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {monitor.name}
                        </p>
                        <p
                          style={{
                            color: "#333",
                            fontSize: "11px",
                            margin: "2px 0 0",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {monitor.url}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={monitor.status} />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      paddingLeft: "18px",
                    }}
                  >
                    {monitor.last_ping && (
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#555",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Clock size={10} color="#555" />
                        {monitor.last_ping.latency_ms}ms
                      </span>
                    )}
                    {monitor.uptime_7d && (
                      <span style={{ fontSize: "11px", color: "#555" }}>
                        uptime <UptimeIndicator uptime={monitor.uptime_7d} />
                      </span>
                    )}
                    <Link
                      to={`/monitors/${monitor.id}`}
                      style={{
                        marginLeft: "auto",
                        fontSize: "11px",
                        color: "#00D4AA",
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      {t("dashboard.details")} <ExternalLink size={10} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
