import { useEffect, useState } from "react";
import {
  Trash2,
  Plus,
  Clock,
  ExternalLink,
  RefreshCw,
  HelpCircle,
  Pause,
  Play,
  Zap,
  Activity,
} from "lucide-react";
import {
  getMonitors,
  createMonitor,
  deleteMonitor,
  toggleMonitor,
  type Monitor,
  pingNow,
} from "../services/monitors";
import { useNavigate } from "react-router-dom";
import { UpgradeModal } from "../components/UpgradeModal";
import { useAuth } from "../hooks/useAuth";

function StatusBadge({ status }: { status: string }) {
  const config = {
    up: {
      label: "Online",
      bg: "rgba(34,197,94,0.08)",
      border: "rgba(34,197,94,0.2)",
      color: "#22C55E",
      dot: "#22C55E",
    },
    down: {
      label: "Offline",
      bg: "rgba(239,68,68,0.08)",
      border: "rgba(239,68,68,0.2)",
      color: "#EF4444",
      dot: "#EF4444",
    },
    pending: {
      label: "Verificando",
      bg: "rgba(245,158,11,0.08)",
      border: "rgba(245,158,11,0.2)",
      color: "#F59E0B",
      dot: "#F59E0B",
    },
  }[status] ?? {
    label: status,
    bg: "rgba(255,255,255,0.05)",
    border: "rgba(255,255,255,0.1)",
    color: "#8B949E",
    dot: "#8B949E",
  };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "5px",
        fontSize: "11px",
        padding: "3px 10px",
        borderRadius: "100px",
        background: config.bg,
        border: `1px solid ${config.border}`,
        color: config.color,
        fontWeight: 600,
        marginRight: 10,
      }}
    >
      <span
        style={{
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          background: config.dot,
          flexShrink: 0,
        }}
      />
      {config.label}
    </span>
  );
}

export function MonitorsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pinging, setPinging] = useState<string | null>(null);
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshed, setRefreshed] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showKeywordTip, setShowKeywordTip] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [keyword, setKeyword] = useState("");
  const [monitorType, setMonitorType] = useState<"http" | "tcp">("http");
  const [tcpPort, setTcpPort] = useState("");
  const [slaTarget, setSlaTarget] = useState("99.9");
  const [error, setError] = useState("");

  useEffect(() => {
    getMonitors()
      .then(setMonitors)
      .finally(() => setLoading(false));
  }, []);

  async function handlePingNow(id: string) {
    setPinging(id);
    try {
      await pingNow(id);
      const data = await getMonitors();
      setMonitors(data);
    } finally {
      setPinging(null);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const data = await getMonitors();
      setMonitors(data);
      setRefreshed(true);
      setTimeout(() => setRefreshed(false), 3000);
    } finally {
      setRefreshing(false);
    }
  }

  async function handleToggle(id: string, currentState: boolean) {
    await toggleMonitor(id);
    setMonitors((prev) =>
      prev.map((m) => (m.id === id ? { ...m, is_active: !currentState } : m)),
    );
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCreating(true);
    try {
      const monitor = await createMonitor({
        name,
        url,
        keyword: keyword || undefined,
        monitor_type: monitorType,
        tcp_port: tcpPort ? parseInt(tcpPort) : undefined,
        sla_target: parseFloat(slaTarget) || 99.9,
      });
      setMonitors((prev) => [...prev, monitor]);
      setName("");
      setUrl("");
      setKeyword("");
      setMonitorType("http");
      setTcpPort("");
      setSlaTarget("99.9");
      setShowForm(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.response?.status === 403) {
        setShowForm(false);
        setShowUpgradeModal(true);
      } else {
        setError(err.response?.data?.error || "Erro ao criar monitor");
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja remover este monitor?")) return;
    await deleteMonitor(id);
    setMonitors((prev) => prev.filter((m) => m.id !== id));
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

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#060810",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "8px",
    padding: "10px 14px",
    color: "#F0F6FC",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "11px",
    color: "#8B949E",
    marginBottom: "6px",
    letterSpacing: "1px",
    textTransform: "uppercase",
    fontFamily: "'JetBrains Mono', monospace",
  };

  return (
    <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .mon-fade { animation: fadeUp 0.35s ease both; }
        .monitor-card:hover { background: rgba(255,255,255,0.015) !important; }
        .monitor-card { transition: background 0.15s; }
        .icon-btn { background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: color 0.15s, opacity 0.15s; font-family: 'JetBrains Mono', monospace; font-size: 12px; }
        .icon-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .input-focus:focus { border-color: #00D4AA !important; box-shadow: 0 0 0 3px rgba(0,212,170,0.08) !important; outline: none !important; }
      `}</style>

      <div
        className="mon-fade"
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "32px",
        }}
      >
        <div>
          <h2
            style={{
              color: "#F0F6FC",
              fontSize: "22px",
              fontWeight: 700,
              letterSpacing: "-0.5px",
              margin: "0 0 4px",
            }}
          >
            Monitores
          </h2>
          <p style={{ color: "#555", fontSize: "12px", margin: 0 }}>
            {monitors.length} monitor{monitors.length !== 1 ? "es" : ""}{" "}
            cadastrado{monitors.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "none",
              border: `1px solid ${refreshed ? "rgba(0,212,170,0.3)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: "8px",
              padding: "8px 14px",
              cursor: "pointer",
              color: refreshed ? "#00D4AA" : "#8B949E",
              fontSize: "12px",
              fontFamily: "'JetBrains Mono', monospace",
              transition: "all 0.2s",
            }}
          >
            <RefreshCw
              size={13}
              style={{
                animation: refreshing ? "spin 0.8s linear infinite" : "none",
              }}
            />
            {refreshed ? "Atualizado!" : "Atualizar"}
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "#00D4AA",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              cursor: "pointer",
              color: "#000",
              fontSize: "12px",
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
              transition: "background 0.2s",
            }}
          >
            <Plus size={14} />
            Novo monitor
          </button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mon-fade"
          style={{
            background: "#0D1117",
            border: "1px solid rgba(0,212,170,0.2)",
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <span
              style={{ fontSize: "13px", fontWeight: 700, color: "#F0F6FC" }}
            >
              Novo monitor
            </span>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#555",
                fontSize: "18px",
              }}
            >
              ×
            </button>
          </div>

          {error && (
            <div
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: "8px",
                padding: "10px 14px",
                marginBottom: "16px",
                fontSize: "12px",
                color: "#EF4444",
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px",
              marginBottom: "14px",
            }}
          >
            <div>
              <label style={labelStyle}>Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
                className="input-focus"
                placeholder="Minha API"
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Tipo</label>
              <div style={{ display: "flex", gap: "6px" }}>
                {(["http", "tcp"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setMonitorType(t)}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "8px",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "12px",
                      fontWeight: 700,
                      transition: "all 0.15s",
                      background:
                        monitorType === t
                          ? "#00D4AA"
                          : "rgba(255,255,255,0.04)",
                      color: monitorType === t ? "#000" : "#555",
                    }}
                  >
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                style={inputStyle}
                className="input-focus"
                placeholder="https://minha-api.com/health"
                required
              />
            </div>
            {monitorType === "tcp" && (
              <div>
                <label style={labelStyle}>Porta</label>
                <input
                  type="number"
                  value={tcpPort}
                  onChange={(e) => setTcpPort(e.target.value)}
                  style={inputStyle}
                  className="input-focus"
                  placeholder="ex: 5432"
                />
              </div>
            )}
            {monitorType === "http" && (
              <div>
                <label
                  style={{
                    ...labelStyle,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  Keyword{" "}
                  <span
                    style={{
                      color: "#333",
                      textTransform: "none",
                      letterSpacing: 0,
                    }}
                  >
                    (opcional)
                  </span>
                  <div style={{ position: "relative" }}>
                    <button
                      type="button"
                      onMouseEnter={() => setShowKeywordTip(true)}
                      onMouseLeave={() => setShowKeywordTip(false)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#555",
                        display: "flex",
                        padding: 0,
                      }}
                    >
                      <HelpCircle size={12} />
                    </button>
                    {showKeywordTip && (
                      <div
                        style={{
                          position: "absolute",
                          left: "50%",
                          transform: "translateX(-50%)",
                          bottom: "calc(100% + 8px)",
                          width: "240px",
                          background: "#1C2128",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "8px",
                          padding: "12px",
                          fontSize: "11px",
                          color: "#8B949E",
                          lineHeight: 1.6,
                          zIndex: 10,
                          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                          fontWeight: 400,
                          textTransform: "none",
                          letterSpacing: 0,
                        }}
                      >
                        Verifica se esta palavra aparece na resposta. Se não
                        aparecer, o monitor é marcado como offline mesmo com
                        status 200.
                      </div>
                    )}
                  </div>
                </label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  style={inputStyle}
                  className="input-focus"
                  placeholder='"operational" ou "ok"'
                />
              </div>
            )}
            {user?.plan === "pro" && (
              <div>
                <label style={labelStyle}>Meta de SLA (%)</label>
                <input
                  type="number"
                  value={slaTarget}
                  onChange={(e) => setSlaTarget(e.target.value)}
                  style={inputStyle}
                  className="input-focus"
                  placeholder="99.9"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="submit"
              disabled={creating}
              style={{
                background: "#00D4AA",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                cursor: "pointer",
                color: "#000",
                fontSize: "12px",
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
                opacity: creating ? 0.5 : 1,
              }}
            >
              {creating ? "Criando..." : "Criar monitor"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#555",
                fontSize: "12px",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div
        className="mon-fade"
        style={{
          background: "#0D1117",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        {monitors.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 110px 90px 90px 300px",
              alignItems: "center",
              padding: "10px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            {["Monitor", "Status", "Latência", "Uptime", "Ações"].map((col) => (
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
          <div style={{ padding: "56px", textAlign: "center" }}>
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
            <button
              onClick={() => setShowForm(true)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#00D4AA",
                fontSize: "13px",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
              }}
            >
              Criar primeiro monitor →
            </button>
          </div>
        ) : (
          monitors.map((monitor, i) => (
            <div
              key={monitor.id}
              className="monitor-card"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 110px 90px 90px 300px",
                alignItems: "center",
                padding: "14px 20px",
                borderBottom:
                  i < monitors.length - 1
                    ? "1px solid rgba(255,255,255,0.04)"
                    : "none",
                opacity: monitor.is_active ? 1 : 0.5,
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
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      marginTop: "2px",
                    }}
                  >
                    <p style={{ color: "#333", fontSize: "11px", margin: 0 }}>
                      {monitor.url}
                    </p>
                    <a
                      href={monitor.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "#444", display: "flex" }}
                    >
                      <ExternalLink size={9} />
                    </a>
                  </div>
                </div>
              </div>

              <StatusBadge status={monitor.status} />

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  color: "#555",
                  fontSize: "12px",
                }}
              >
                <Clock size={10} />
                {monitor.last_ping ? `${monitor.last_ping.latency_ms}ms` : "—"}
              </div>

              <div style={{ fontSize: "12px" }}>
                {monitor.uptime_7d ? (
                  <span
                    style={{
                      color:
                        parseFloat(monitor.uptime_7d) >= 99
                          ? "#00D4AA"
                          : parseFloat(monitor.uptime_7d) >= 95
                            ? "#F59E0B"
                            : "#EF4444",
                      fontWeight: 700,
                    }}
                  >
                    {monitor.uptime_7d}%
                  </span>
                ) : (
                  <span style={{ color: "#333" }}>—</span>
                )}
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <button
                  className="icon-btn"
                  onClick={() => handlePingNow(monitor.id)}
                  disabled={pinging === monitor.id}
                  style={{
                    color: "#555",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "6px",
                    padding: "5px 10px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#00D4AA";
                    e.currentTarget.style.borderColor = "rgba(0,212,170,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#555";
                    e.currentTarget.style.borderColor =
                      "rgba(255,255,255,0.06)";
                  }}
                >
                  <Zap size={11} />
                  {pinging === monitor.id ? "..." : "Testar"}
                </button>

                <button
                  className="icon-btn"
                  onClick={() => handleToggle(monitor.id, monitor.is_active)}
                  style={{
                    color: monitor.is_active ? "#555" : "#F59E0B",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "6px",
                    padding: "5px 10px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = monitor.is_active
                      ? "#F59E0B"
                      : "#22C55E";
                    e.currentTarget.style.borderColor = "rgba(245,158,11,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = monitor.is_active
                      ? "#555"
                      : "#F59E0B";
                    e.currentTarget.style.borderColor =
                      "rgba(255,255,255,0.06)";
                  }}
                >
                  {monitor.is_active ? <Pause size={11} /> : <Play size={11} />}
                  {monitor.is_active ? "Pausar" : "Reativar"}
                </button>

                <button
                  className="icon-btn"
                  onClick={() => navigate(`/monitors/${monitor.id}`)}
                  style={{
                    color: "#555",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "6px",
                    padding: "5px 10px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#F0F6FC";
                    e.currentTarget.style.borderColor =
                      "rgba(255,255,255,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#555";
                    e.currentTarget.style.borderColor =
                      "rgba(255,255,255,0.06)";
                  }}
                >
                  Detalhes
                </button>

                <div
                  style={{
                    width: "1px",
                    height: "20px",
                    background: "rgba(255,255,255,0.06)",
                    margin: "0 2px",
                  }}
                />

                <button
                  className="icon-btn"
                  onClick={() => handleDelete(monitor.id)}
                  style={{
                    color: "#333",
                    background: "none",
                    border: "1px solid transparent",
                    borderRadius: "6px",
                    padding: "5px 8px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#EF4444";
                    e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)";
                    e.currentTarget.style.background = "rgba(239,68,68,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#333";
                    e.currentTarget.style.borderColor = "transparent";
                    e.currentTarget.style.background = "none";
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showUpgradeModal && (
        <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
      )}
    </div>
  );
}
