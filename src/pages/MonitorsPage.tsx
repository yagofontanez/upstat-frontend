/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Pencil,
} from "lucide-react";
import {
  getMonitors,
  createMonitor,
  updateMonitor,
  deleteMonitor,
  toggleMonitor,
  type Monitor,
  pingNow,
} from "../services/monitors";
import { useNavigate } from "react-router-dom";
import { UpgradeModal } from "../components/UpgradeModal";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "react-i18next";

function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();

  const config = {
    up: {
      label: t("monitor.status.online"),
      bg: "rgba(34,197,94,0.08)",
      border: "rgba(34,197,94,0.2)",
      color: "#22C55E",
      dot: "#22C55E",
    },
    down: {
      label: t("monitor.status.off"),
      bg: "rgba(239,68,68,0.08)",
      border: "rgba(239,68,68,0.2)",
      color: "#EF4444",
      dot: "#EF4444",
    },
    pending: {
      label: t("monitor.status.verifying"),
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
        gap: "5px",
        fontSize: "11px",
        padding: "3px 10px",
        borderRadius: "100px",
        background: config.bg,
        border: `1px solid ${config.border}`,
        color: config.color,
        fontWeight: 600,
        whiteSpace: "nowrap",
        justifyContent: "center",
        marginRight: "10px",
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

type MonitorFormData = {
  name: string;
  url: string;
  keyword: string;
  monitorType: "http" | "tcp";
  tcpPort: string;
  slaTarget: string;
  httpMethod: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";
  requestBody: string;
  requestHeaders: string;
};

const emptyForm: MonitorFormData = {
  name: "",
  url: "",
  keyword: "",
  monitorType: "http",
  tcpPort: "",
  slaTarget: "99.9",
  httpMethod: "GET",
  requestBody: "",
  requestHeaders: "",
};

function monitorToForm(m: Monitor): MonitorFormData {
  return {
    name: m.name,
    url: m.url,
    keyword: m.keyword ?? "",
    monitorType: m.monitor_type ?? "http",
    tcpPort: m.tcp_port ? String(m.tcp_port) : "",
    slaTarget: m.sla_target ? String(parseFloat(m.sla_target)) : "99.9",
    httpMethod: (m.http_method as MonitorFormData["httpMethod"]) ?? "GET",
    requestBody: m.request_body ?? "",
    requestHeaders: m.request_headers
      ? Object.entries(m.request_headers)
          .map(([k, v]) => `${k}: ${v}`)
          .join("\n")
      : "",
  };
}

export function MonitorsPage() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [pinging, setPinging] = useState<string | null>(null);
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingMonitor, setEditingMonitor] = useState<Monitor | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshed, setRefreshed] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showKeywordTip, setShowKeywordTip] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<MonitorFormData>(emptyForm);

  useEffect(() => {
    getMonitors()
      .then(setMonitors)
      .finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setEditingMonitor(null);
    setForm(emptyForm);
    setShowAdvanced(false);
    setError("");
    setShowForm(true);
  }

  function openEdit(monitor: Monitor) {
    setEditingMonitor(monitor);
    const f = monitorToForm(monitor);
    setForm(f);
    setShowAdvanced(!!(f.requestHeaders || f.requestBody));
    setError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingMonitor(null);
    setForm(emptyForm);
    setError("");
  }

  function headersStringToRecord(
    str: string,
  ): Record<string, string> | undefined {
    if (!str.trim()) return undefined;
    return Object.fromEntries(
      str
        .split("\n")
        .filter((l) => l.includes(":"))
        .map((l) => [
          l.split(":")[0].trim(),
          l.split(":").slice(1).join(":").trim(),
        ]),
    );
  }

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const payload = {
      name: form.name,
      url: form.url,
      keyword: form.keyword || undefined,
      monitor_type: form.monitorType,
      tcp_port: form.tcpPort ? parseInt(form.tcpPort) : undefined,
      sla_target: parseFloat(form.slaTarget) || 99.9,
      http_method: form.httpMethod,
      request_body: form.requestBody || undefined,
      request_headers: headersStringToRecord(form.requestHeaders),
    };

    try {
      if (editingMonitor) {
        const updated = await updateMonitor(editingMonitor.id, payload);
        setMonitors((prev) =>
          prev.map((m) => (m.id === editingMonitor.id ? updated : m)),
        );
      } else {
        const monitor = await createMonitor(payload);
        setMonitors((prev) => [...prev, monitor]);

        setPinging(monitor.id);
        try {
          await pingNow(monitor.id);
          const data = await getMonitors();
          setMonitors(data);
        } finally {
          setPinging(null);
        }
      }
      closeForm();
    } catch (err: any) {
      if (err.response?.status === 403) {
        closeForm();
        setShowUpgradeModal(true);
      } else {
        setError(err.response?.data?.error || t("monitor.status.error"));
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t("monitor.status.confirm_delete"))) return;
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

  const tableGrid =
    i18n.language === "en"
      ? "1fr 90px 80px 100px 340px"
      : "1fr 80px 90px 90px 390px";

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

        .mon-table-header { display: grid; grid-template-columns: ${tableGrid}; align-items: center; padding: 10px 20px; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .mon-table-row { display: grid; grid-template-columns: 1fr 110px 90px 90px auto; align-items: center; padding: 14px 20px; }
        .mon-mobile-row { display: none; padding: 14px 20px; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .mon-header-actions { display: flex; align-items: center; gap: 10px; }
        .mon-header-refresh-label { display: inline; }

        @media (max-width: 768px) {
          .mon-table-header { display: none; }
          .mon-table-row { display: none; }
          .mon-mobile-row { display: block; }
          .form-grid { grid-template-columns: 1fr; }
          .mon-header-actions { gap: 8px; }
          .mon-header-refresh-label { display: none; }
        }
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
            {t("monitor.monitors")}
          </h2>
          <p style={{ color: "#555", fontSize: "12px", margin: 0 }}>
            {monitors.length} monitor
            {monitors.length !== 1 ? t("monitor.monitor_prefix") : ""}{" "}
            {t("monitor.registered")}
            {monitors.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="mon-header-actions">
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
            <span className="mon-header-refresh-label">
              {refreshed ? t("monitor.refreshed") : t("monitor.refresh")}
            </span>
          </button>
          <button
            onClick={openCreate}
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
            }}
          >
            <Plus size={14} />
            <span>{t("monitor.new")}</span>
          </button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mon-fade"
          style={{
            background: "#0D1117",
            border: `1px solid ${editingMonitor ? "rgba(255,255,255,0.1)" : "rgba(0,212,170,0.2)"}`,
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
              {editingMonitor
                ? `${t("monitor.editing")} ${editingMonitor.name}`
                : t("monitor.new")}
            </span>
            <button
              type="button"
              onClick={closeForm}
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

          <div className="form-grid" style={{ marginBottom: "14px" }}>
            <div>
              <label style={labelStyle}>{t("monitor.name")}</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={inputStyle}
                className="input-focus"
                placeholder={t("monitor.name_placeholder")}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>{t("monitor.type")}</label>
              <div style={{ display: "flex", gap: "6px" }}>
                {(["http", "tcp"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, monitorType: t })}
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
                        form.monitorType === t
                          ? "#00D4AA"
                          : "rgba(255,255,255,0.04)",
                      color: form.monitorType === t ? "#000" : "#555",
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
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                style={inputStyle}
                className="input-focus"
                placeholder={t("monitor.url_placeholder")}
                required
              />
            </div>
            {form.monitorType === "tcp" && (
              <div>
                <label style={labelStyle}>{t("monitor.port")}</label>
                <input
                  type="number"
                  value={form.tcpPort}
                  onChange={(e) =>
                    setForm({ ...form, tcpPort: e.target.value })
                  }
                  style={inputStyle}
                  className="input-focus"
                  placeholder="ex: 5432"
                />
              </div>
            )}
            {form.monitorType === "http" && (
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
                    {t("monitor.optional")}
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
                        {t("monitor.tooltip")}
                      </div>
                    )}
                  </div>
                </label>
                <input
                  type="text"
                  value={form.keyword}
                  onChange={(e) =>
                    setForm({ ...form, keyword: e.target.value })
                  }
                  style={inputStyle}
                  className="input-focus"
                  placeholder={t("monitor.keyword_placeholder")}
                />
              </div>
            )}
            {form.monitorType === "http" && (
              <>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>{t("monitor.method")}</label>
                  <div
                    style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}
                  >
                    {(
                      ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"] as const
                    ).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setForm({ ...form, httpMethod: m })}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: "none",
                          cursor: "pointer",
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: "11px",
                          fontWeight: 700,
                          transition: "all 0.15s",
                          background:
                            form.httpMethod === m
                              ? "#00D4AA"
                              : "rgba(255,255,255,0.04)",
                          color: form.httpMethod === m ? "#000" : "#555",
                        }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#555",
                      fontSize: "11px",
                      fontFamily: "'JetBrains Mono', monospace",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: 0,
                    }}
                  >
                    {showAdvanced ? "▾" : "▸"} {t("monitor.advanced")}
                  </button>
                </div>

                {showAdvanced && (
                  <>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={labelStyle}>
                        Headers{" "}
                        <span
                          style={{
                            color: "#333",
                            textTransform: "none",
                            letterSpacing: 0,
                          }}
                        >
                          {t("monitor.optional_header")}
                        </span>
                      </label>
                      <textarea
                        value={form.requestHeaders}
                        onChange={(e) =>
                          setForm({ ...form, requestHeaders: e.target.value })
                        }
                        style={{
                          ...inputStyle,
                          height: "80px",
                          resize: "vertical",
                        }}
                        className="input-focus"
                        placeholder={
                          "Authorization: Bearer token\nContent-Type: application/json"
                        }
                      />
                    </div>
                    {["POST", "PUT", "PATCH"].includes(form.httpMethod) && (
                      <div style={{ gridColumn: "1 / -1" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "6px",
                          }}
                        >
                          <label style={{ ...labelStyle, marginBottom: 0 }}>
                            Body{" "}
                            <span
                              style={{
                                color: "#333",
                                textTransform: "none",
                                letterSpacing: 0,
                              }}
                            >
                              (opcional)
                            </span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              try {
                                setForm({
                                  ...form,
                                  requestBody: JSON.stringify(
                                    JSON.parse(form.requestBody),
                                    null,
                                    2,
                                  ),
                                });
                              } catch {
                                window.alert(t("monitor.invalid_json"));
                              }
                            }}
                            style={{
                              background: "none",
                              border: "1px solid rgba(0,212,170,0.2)",
                              borderRadius: "6px",
                              padding: "3px 10px",
                              cursor: "pointer",
                              color: "#00D4AA",
                              fontSize: "10px",
                              fontFamily: "'JetBrains Mono', monospace",
                              fontWeight: 700,
                            }}
                          >
                            ✦ beautify
                          </button>
                        </div>
                        <textarea
                          value={form.requestBody}
                          onChange={(e) =>
                            setForm({ ...form, requestBody: e.target.value })
                          }
                          style={{
                            ...inputStyle,
                            height: "80px",
                            resize: "vertical",
                          }}
                          className="input-focus"
                          placeholder={'{"key": "value"}'}
                        />
                      </div>
                    )}
                  </>
                )}
              </>
            )}
            {user?.plan === "pro" && (
              <div>
                <label style={labelStyle}>{t("monitor.sla_target")}</label>
                <input
                  type="number"
                  value={form.slaTarget}
                  onChange={(e) =>
                    setForm({ ...form, slaTarget: e.target.value })
                  }
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
              disabled={submitting}
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
                opacity: submitting ? 0.5 : 1,
              }}
            >
              {submitting
                ? editingMonitor
                  ? t("monitor.saving")
                  : t("monitor.creating")
                : editingMonitor
                  ? t("monitor.save")
                  : t("monitor.create")}
            </button>
            <button
              type="button"
              onClick={closeForm}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#555",
                fontSize: "12px",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {t("monitor.cancel")}
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
          <div className="mon-table-header">
            {[
              t("monitor.monitor"),
              t("monitor.stat"),
              t("monitor.latency"),
              t("monitor.uptime"),
              t("monitor.actions"),
            ].map((col) => (
              <span
                key={col}
                style={{
                  fontSize: "10px",
                  color: "#555",
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
              {t("monitor.0_monitors")}
            </p>
            <button
              onClick={openCreate}
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
              {t("monitor.create_first")}
            </button>
          </div>
        ) : (
          monitors.map((monitor, i) => {
            const borderBottom =
              i < monitors.length - 1
                ? "1px solid rgba(255,255,255,0.04)"
                : "none";
            const dotColor =
              monitor.status === "up"
                ? "#22C55E"
                : monitor.status === "down"
                  ? "#EF4444"
                  : "#F59E0B";

            return (
              <div key={monitor.id}>
                <div
                  className="monitor-card mon-table-row"
                  style={{ borderBottom, opacity: monitor.is_active ? 1 : 0.5 }}
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
                        background: dotColor,
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
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          marginTop: "2px",
                        }}
                      >
                        <p
                          style={{
                            color: "#555",
                            fontSize: "11px",
                            margin: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {monitor.url}
                        </p>
                        <a
                          href={monitor.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: "#444",
                            display: "flex",
                            flexShrink: 0,
                          }}
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
                    {monitor.last_ping
                      ? `${monitor.last_ping.latency_ms}ms`
                      : "—"}
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
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <button
                      className="icon-btn"
                      onClick={() => handlePingNow(monitor.id)}
                      disabled={pinging === monitor.id}
                      style={{
                        color: "#bbbbbb",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "6px",
                        padding: "5px 10px",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "#00D4AA";
                        e.currentTarget.style.borderColor =
                          "rgba(0,212,170,0.2)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "#bbbbbb";
                        e.currentTarget.style.borderColor =
                          "rgba(255,255,255,0.09)";
                      }}
                    >
                      <Zap size={11} />
                      {pinging === monitor.id ? "..." : t("monitor.test")}
                    </button>
                    <button
                      className="icon-btn"
                      onClick={() =>
                        handleToggle(monitor.id, monitor.is_active)
                      }
                      style={{
                        color: monitor.is_active ? "#bbbbbb" : "#F59E0B",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.09)",
                        borderRadius: "6px",
                        padding: "5px 10px",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = monitor.is_active
                          ? "#F59E0B"
                          : "#22C55E";
                        e.currentTarget.style.borderColor =
                          "rgba(245,158,11,0.2)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = monitor.is_active
                          ? "#bbbbbb"
                          : "#F59E0B";
                        e.currentTarget.style.borderColor =
                          "rgba(255,255,255,0.09)";
                      }}
                    >
                      {monitor.is_active ? (
                        <Pause size={11} />
                      ) : (
                        <Play size={11} />
                      )}
                      {monitor.is_active
                        ? t("monitor.pause")
                        : t("monitor.despause")}
                    </button>
                    <button
                      className="icon-btn"
                      onClick={() => openEdit(monitor)}
                      style={{
                        color: "#bbbbbb",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.09)",
                        borderRadius: "6px",
                        padding: "5px 10px",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "#F0F6FC";
                        e.currentTarget.style.borderColor =
                          "rgba(255,255,255,0.12)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "#bbbbbb";
                        e.currentTarget.style.borderColor =
                          "rgba(255,255,255,0.09)";
                      }}
                    >
                      <Pencil size={11} />
                      {t("monitor.edit")}
                    </button>
                    <button
                      className="icon-btn"
                      onClick={() => navigate(`/monitors/${monitor.id}`)}
                      style={{
                        color: "#bbbbbb",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.09)",
                        borderRadius: "6px",
                        padding: "5px 10px",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "#F0F6FC";
                        e.currentTarget.style.borderColor =
                          "rgba(255,255,255,0.12)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "#bbbbbb";
                        e.currentTarget.style.borderColor =
                          "rgba(255,255,255,0.09)";
                      }}
                    >
                      {t("monitor.details")}
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
                        e.currentTarget.style.borderColor =
                          "rgba(239,68,68,0.2)";
                        e.currentTarget.style.background =
                          "rgba(239,68,68,0.06)";
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

                <div
                  className="monitor-card mon-mobile-row"
                  style={{ borderBottom, opacity: monitor.is_active ? 1 : 0.5 }}
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
                          background: dotColor,
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
                            color: "#555",
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
                      gap: "6px",
                      paddingLeft: "18px",
                      flexWrap: "wrap",
                    }}
                  >
                    {monitor.last_ping && (
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#555",
                          display: "flex",
                          alignItems: "center",
                          gap: "3px",
                        }}
                      >
                        <Clock size={10} />
                        {monitor.last_ping.latency_ms}ms
                      </span>
                    )}
                    {monitor.uptime_7d && (
                      <span
                        style={{
                          fontSize: "11px",
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
                    )}
                    <div
                      style={{
                        marginLeft: "auto",
                        display: "flex",
                        gap: "6px",
                      }}
                    >
                      <button
                        className="icon-btn"
                        onClick={() => handlePingNow(monitor.id)}
                        disabled={pinging === monitor.id}
                        style={{
                          color: "#bbbbbb",
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.09)",
                          borderRadius: "6px",
                          padding: "5px 10px",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "#00D4AA";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "#bbbbbb";
                        }}
                      >
                        <Zap size={11} />
                        {pinging === monitor.id ? "..." : t("monitor.test")}
                      </button>
                      <button
                        className="icon-btn"
                        onClick={() => openEdit(monitor)}
                        style={{
                          color: "#bbbbbb",
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.09)",
                          borderRadius: "6px",
                          padding: "5px 10px",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "#F0F6FC";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "#bbbbbb";
                        }}
                      >
                        <Pencil size={11} />
                        {t("monitor.edit")}
                      </button>
                      <button
                        className="icon-btn"
                        onClick={() => navigate(`/monitors/${monitor.id}`)}
                        style={{
                          color: "#bbbbbb",
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.09)",
                          borderRadius: "6px",
                          padding: "5px 10px",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "#F0F6FC";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "#bbbbbb";
                        }}
                      >
                        {t("monitor.details")}
                      </button>
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
                          e.currentTarget.style.background =
                            "rgba(239,68,68,0.06)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "#333";
                          e.currentTarget.style.background = "none";
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showUpgradeModal && (
        <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
      )}
    </div>
  );
}
