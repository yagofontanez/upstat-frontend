import { useState, useEffect } from "react";
import {
  Play,
  Plus,
  Trash2,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  FlaskConical,
  Loader2,
  X,
  GripVertical,
  Image,
} from "lucide-react";
import {
  getSyntheticMonitors,
  createSyntheticMonitor,
  deleteSyntheticMonitor,
  runSyntheticNow,
  getSyntheticMonitor,
  type SyntheticMonitor,
  type SyntheticStep,
} from "../services/synthetic";
import { useTranslation } from "react-i18next";

const ACTION_COLORS: Record<string, string> = {
  navigate: "#3B82F6",
  click: "#8B5CF6",
  fill: "#F59E0B",
  waitFor: "#6366F1",
  assertText: "#00D4AA",
};

function formatDuration(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

const emptyStep = (): SyntheticStep => ({
  order_index: 0,
  action: "navigate",
  selector: "",
  value: "",
});

export default function SyntheticPage() {
  const { t } = useTranslation();
  const [monitors, setMonitors] = useState<SyntheticMonitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedMonitor, setSelectedMonitor] =
    useState<SyntheticMonitor | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [screenshot, setScreenshot] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formInterval, setFormInterval] = useState(10);
  const [formSteps, setFormSteps] = useState<SyntheticStep[]>([emptyStep()]);
  const [creating, setCreating] = useState(false);

  const ACTION_LABELS: Record<string, string> = {
    navigate: t("synthetic.action_labels.navigate"),
    click: t("synthetic.action_labels.click"),
    fill: t("synthetic.action_labels.fill"),
    waitFor: t("synthetic.action_labels.waitFor"),
    assertText: t("synthetic.action_labels.assertText"),
  };

  function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t("synthetic.time_ago.now");
    if (mins < 60) return `${mins}${t("synthetic.time_ago.min_ago")}`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}${t("synthetic.time_ago.hour_ago")}`;
    return `${Math.floor(hrs / 24)}${t("synthetic.time_ago.days_ago")}`;
  }

  useEffect(() => {
    loadMonitors();
  }, []);

  async function loadMonitors() {
    try {
      const data = await getSyntheticMonitors();
      setMonitors(data);
    } finally {
      setLoading(false);
    }
  }

  async function openDetail(id: string) {
    setDetailLoading(true);
    setSelectedMonitor(null);
    try {
      const data = await getSyntheticMonitor(id);
      setSelectedMonitor(data);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleRun(id: string, e?: React.MouseEvent) {
    e?.stopPropagation();
    setRunningId(id);
    try {
      await runSyntheticNow(id);
      await loadMonitors();
      if (selectedMonitor?.id === id) await openDetail(id);
    } finally {
      setRunningId(null);
    }
  }

  async function handleDelete(id: string, e?: React.MouseEvent) {
    e?.stopPropagation();
    if (!confirm(t("synthetic.delete_confirm"))) return;
    await deleteSyntheticMonitor(id);
    setMonitors((m) => m.filter((x) => x.id !== id));
    if (selectedMonitor?.id === id) setSelectedMonitor(null);
  }

  function addStep() {
    setFormSteps((prev) => [
      ...prev,
      { ...emptyStep(), order_index: prev.length },
    ]);
  }

  function removeStep(i: number) {
    setFormSteps((prev) =>
      prev
        .filter((_, idx) => idx !== i)
        .map((s, idx) => ({ ...s, order_index: idx })),
    );
  }

  function updateStep(i: number, field: string, val: string) {
    setFormSteps((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)),
    );
  }

  async function handleCreate() {
    if (!formName.trim() || formSteps.length === 0) return;
    setCreating(true);
    try {
      await createSyntheticMonitor({
        name: formName,
        interval_minutes: formInterval,
        steps: formSteps,
      });
      setShowCreate(false);
      setFormName("");
      setFormInterval(10);
      setFormSteps([emptyStep()]);
      await loadMonitors();
    } finally {
      setCreating(false);
    }
  }

  const needsSelector = (action: string) =>
    ["click", "fill", "waitFor", "assertText"].includes(action);
  const needsValue = (action: string) =>
    ["navigate", "fill", "assertText"].includes(action);

  return (
    <div
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
      className="synthetic-page"
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "32px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "6px",
            }}
          >
            <FlaskConical size={20} color="#00D4AA" />
            <h1
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#F0F6FC",
                letterSpacing: "-0.5px",
              }}
            >
              Synthetic Monitors
            </h1>
          </div>
          <p
            style={{
              fontSize: "12px",
              color: "#bbbbbbbb",
              letterSpacing: "0.5px",
            }}
          >
            {t("synthetic.desc")}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(0,212,170,0.1)",
            border: "1px solid rgba(0,212,170,0.25)",
            borderRadius: "8px",
            padding: "10px 16px",
            color: "#00D4AA",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
            letterSpacing: "0.5px",
          }}
        >
          <Plus size={14} />
          {t("synthetic.new")}
        </button>
      </div>

      <div
        className={
          selectedMonitor
            ? "synthetic-grid synthetic-grid--detail"
            : "synthetic-grid"
        }
      >
        <div>
          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px",
                color: "#bbbbbbbb",
              }}
            >
              <Loader2
                size={20}
                style={{ animation: "spin 1s linear infinite" }}
              />
            </div>
          ) : monitors.length === 0 ? (
            <div
              style={{
                border: "1px dashed rgba(255,255,255,0.06)",
                borderRadius: "12px",
                padding: "80px",
                textAlign: "center",
              }}
            >
              <FlaskConical
                size={32}
                color="#333"
                style={{ margin: "0 auto 16px" }}
              />
              <p style={{ color: "#bbbbbbbb", fontSize: "13px" }}>
                {t("synthetic.0_monitors")}
              </p>
              <p style={{ color: "#333", fontSize: "12px", marginTop: "4px" }}>
                {t("synthetic.create_one")}
              </p>
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {monitors.map((m) => (
                <div
                  key={m.id}
                  onClick={() => openDetail(m.id)}
                  style={{
                    background:
                      selectedMonitor?.id === m.id
                        ? "rgba(0,212,170,0.04)"
                        : "#0D1117",
                    border: `1px solid ${selectedMonitor?.id === m.id ? "rgba(0,212,170,0.2)" : "rgba(255,255,255,0.06)"}`,
                    borderRadius: "12px",
                    padding: "16px 20px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        flexShrink: 0,
                        background:
                          m.last_status === "pass"
                            ? "#22C55E"
                            : m.last_status === "fail"
                              ? "#EF4444"
                              : "#bbbbbbbb",
                        boxShadow:
                          m.last_status === "pass"
                            ? "0 0 8px rgba(34,197,94,0.5)"
                            : m.last_status === "fail"
                              ? "0 0 8px rgba(239,68,68,0.5)"
                              : "none",
                      }}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#F0F6FC",
                        }}
                      >
                        {m.name}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#bbbbbbbb",
                          marginTop: "2px",
                        }}
                      >
                        {m.last_checked_at
                          ? timeAgo(m.last_checked_at)
                          : t("synthetic.never_exec")}{" "}
                        · {t("synthetic.in")} {m.interval_minutes}min
                      </div>
                    </div>
                  </div>
                  <div
                    className="synthetic-monitor-actions"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                      justifyContent: "flex-end",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        padding: "3px 10px",
                        borderRadius: "100px",
                        background:
                          m.last_status === "pass"
                            ? "rgba(34,197,94,0.08)"
                            : m.last_status === "fail"
                              ? "rgba(239,68,68,0.08)"
                              : "rgba(255,255,255,0.04)",
                        color:
                          m.last_status === "pass"
                            ? "#22C55E"
                            : m.last_status === "fail"
                              ? "#EF4444"
                              : "#bbbbbbbb",
                        border: `1px solid ${m.last_status === "pass" ? "rgba(34,197,94,0.2)" : m.last_status === "fail" ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.06)"}`,
                      }}
                    >
                      {m.last_status === "pass"
                        ? "PASS"
                        : m.last_status === "fail"
                          ? "FAIL"
                          : "PENDING"}
                    </span>
                    <button
                      onClick={(e) => handleRun(m.id, e)}
                      disabled={runningId === m.id}
                      style={{
                        background: "rgba(0,212,170,0.06)",
                        border: "1px solid rgba(0,212,170,0.15)",
                        borderRadius: "6px",
                        padding: "6px 8px",
                        cursor: "pointer",
                        color: "#00D4AA",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {runningId === m.id ? (
                        <Loader2
                          size={13}
                          style={{ animation: "spin 1s linear infinite" }}
                        />
                      ) : (
                        <Play size={13} />
                      )}
                    </button>
                    <button
                      onClick={(e) => handleDelete(m.id, e)}
                      style={{
                        background: "rgba(239,68,68,0.06)",
                        border: "1px solid rgba(239,68,68,0.15)",
                        borderRadius: "6px",
                        padding: "6px 8px",
                        cursor: "pointer",
                        color: "#EF4444",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                    <ChevronRight size={14} color="#333" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {(selectedMonitor || detailLoading) && (
          <div
            style={{
              background: "#0D1117",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "12px",
              padding: "24px",
              height: "fit-content",
              position: "sticky",
              top: "24px",
            }}
          >
            {detailLoading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#bbbbbbbb",
                }}
              >
                <Loader2
                  size={18}
                  style={{ animation: "spin 1s linear infinite" }}
                />
              </div>
            ) : (
              selectedMonitor && (
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "20px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "#F0F6FC",
                        }}
                      >
                        {selectedMonitor.name}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#bbbbbbbb",
                          marginTop: "3px",
                        }}
                      >
                        {t("synthetic.in")} {selectedMonitor.interval_minutes}{" "}
                        {t("synthetic.min")}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedMonitor(null)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#bbbbbbbb",
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#bbbbbbbb",
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                        marginBottom: "10px",
                      }}
                    >
                      Steps
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      {selectedMonitor.steps?.map((step, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            background: "rgba(255,255,255,0.02)",
                            borderRadius: "8px",
                            padding: "8px 12px",
                            border: "1px solid rgba(255,255,255,0.04)",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: "100px",
                              background: `${ACTION_COLORS[step.action]}15`,
                              color: ACTION_COLORS[step.action],
                              border: `1px solid ${ACTION_COLORS[step.action]}30`,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {step.action}
                          </span>
                          <span
                            style={{
                              fontSize: "11px",
                              color: "#8B949E",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {step.value || step.selector || "—"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#bbbbbbbb",
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                        marginBottom: "10px",
                      }}
                    >
                      {t("synthetic.last_exec")}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      {selectedMonitor.results?.length === 0 && (
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#bbbbbbbb",
                            textAlign: "center",
                            padding: "20px",
                          }}
                        >
                          {t("synthetic.0_exec")}
                        </div>
                      )}
                      {selectedMonitor.results?.map((r) => (
                        <div
                          key={r.id}
                          style={{
                            background: "rgba(255,255,255,0.02)",
                            borderRadius: "8px",
                            padding: "10px 12px",
                            border: `1px solid ${r.status === "pass" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)"}`,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: r.error_message ? "6px" : 0,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              {r.status === "pass" ? (
                                <CheckCircle size={13} color="#22C55E" />
                              ) : (
                                <XCircle size={13} color="#EF4444" />
                              )}
                              <span
                                style={{
                                  fontSize: "11px",
                                  color:
                                    r.status === "pass" ? "#22C55E" : "#EF4444",
                                  fontWeight: 700,
                                }}
                              >
                                {r.status.toUpperCase()}
                              </span>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "10px",
                                  color: "#bbbbbbbb",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <Zap size={10} />
                                {formatDuration(r.duration_ms)}
                              </span>
                              <span
                                style={{
                                  fontSize: "10px",
                                  color: "#bbbbbbbb",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <Clock size={10} />
                                {timeAgo(r.checked_at)}
                              </span>
                            </div>
                          </div>
                          {r.error_message && (
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#EF4444",
                                background: "rgba(239,68,68,0.05)",
                                borderRadius: "6px",
                                padding: "6px 8px",
                                marginTop: "6px",
                              }}
                            >
                              {r.error_message}
                            </div>
                          )}
                          {r.screenshot_url && (
                            <button
                              onClick={() =>
                                setScreenshot(
                                  `${import.meta.env.VITE_API_URL}${r.screenshot_url}`,
                                )
                              }
                              style={{
                                marginTop: "8px",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.06)",
                                borderRadius: "6px",
                                padding: "4px 10px",
                                cursor: "pointer",
                                color: "#8B949E",
                                fontSize: "10px",
                                fontFamily: "inherit",
                              }}
                            >
                              <Image size={11} /> {t("synthetic.see_img")}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )
            )}
          </div>
        )}
      </div>

      {showCreate && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#0D1117",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px",
              padding: "28px",
              width: "100%",
              maxWidth: "560px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <div
                style={{ fontSize: "15px", fontWeight: 700, color: "#F0F6FC" }}
              >
                {t("synthetic.new_monitor")}
              </div>
              <button
                onClick={() => setShowCreate(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#bbbbbbbb",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  fontSize: "11px",
                  color: "#bbbbbbbb",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                {t("synthetic.name")}
              </label>
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder={t("synthetic.name_placeholder")}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  color: "#F0F6FC",
                  fontSize: "13px",
                  fontFamily: "inherit",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  fontSize: "11px",
                  color: "#bbbbbbbb",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                {t("synthetic.interval")}
              </label>
              <select
                value={formInterval}
                onChange={(e) => setFormInterval(Number(e.target.value))}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  color: "#F0F6FC",
                  fontSize: "13px",
                  fontFamily: "inherit",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                {[5, 10, 15, 30, 60].map((v) => (
                  <option key={v} value={v} style={{ background: "#0D1117" }}>
                    {v} min
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  fontSize: "11px",
                  color: "#bbbbbbbb",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  marginBottom: "12px",
                }}
              >
                Steps
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {formSteps.map((step, i) => (
                  <div
                    key={i}
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "10px",
                      padding: "14px",
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
                          gap: "8px",
                        }}
                      >
                        <GripVertical size={14} color="#333" />
                        <span style={{ fontSize: "11px", color: "#bbbbbbbb" }}>
                          Step {i + 1}
                        </span>
                      </div>
                      {formSteps.length > 1 && (
                        <button
                          onClick={() => removeStep(i)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#bbbbbbbb",
                          }}
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "8px",
                      }}
                    >
                      <div>
                        <label
                          style={{
                            fontSize: "10px",
                            color: "#bbbbbbbb",
                            display: "block",
                            marginBottom: "4px",
                          }}
                        >
                          {t("synthetic.action")}
                        </label>
                        <select
                          value={step.action}
                          onChange={(e) =>
                            updateStep(i, "action", e.target.value)
                          }
                          style={{
                            width: "100%",
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: "6px",
                            padding: "8px 10px",
                            color: "#F0F6FC",
                            fontSize: "12px",
                            fontFamily: "inherit",
                            outline: "none",
                            cursor: "pointer",
                          }}
                        >
                          {Object.entries(ACTION_LABELS).map(([val, label]) => (
                            <option
                              key={val}
                              value={val}
                              style={{ background: "#0D1117" }}
                            >
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {needsSelector(step.action) && (
                        <div>
                          <label
                            style={{
                              fontSize: "10px",
                              color: "#bbbbbbbb",
                              display: "block",
                              marginBottom: "4px",
                            }}
                          >
                            {t("synthetic.css")}
                          </label>
                          <input
                            value={step.selector}
                            onChange={(e) =>
                              updateStep(i, "selector", e.target.value)
                            }
                            placeholder="#btn, .class"
                            style={{
                              width: "100%",
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.08)",
                              borderRadius: "6px",
                              padding: "8px 10px",
                              color: "#F0F6FC",
                              fontSize: "12px",
                              fontFamily: "inherit",
                              outline: "none",
                              boxSizing: "border-box",
                            }}
                          />
                        </div>
                      )}
                      {needsValue(step.action) && (
                        <div
                          style={{
                            gridColumn: needsSelector(step.action)
                              ? "1 / -1"
                              : "auto",
                          }}
                        >
                          <label
                            style={{
                              fontSize: "10px",
                              color: "#bbbbbbbb",
                              display: "block",
                              marginBottom: "4px",
                            }}
                          >
                            {step.action === "navigate"
                              ? "URL"
                              : step.action === "assertText"
                                ? t("synthetic.expected_text")
                                : t("synthetic.value")}
                          </label>
                          <input
                            value={step.value}
                            onChange={(e) =>
                              updateStep(i, "value", e.target.value)
                            }
                            placeholder={
                              step.action === "navigate" ? "https://..." : ""
                            }
                            style={{
                              width: "100%",
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.08)",
                              borderRadius: "6px",
                              padding: "8px 10px",
                              color: "#F0F6FC",
                              fontSize: "12px",
                              fontFamily: "inherit",
                              outline: "none",
                              boxSizing: "border-box",
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={addStep}
                style={{
                  marginTop: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "none",
                  border: "1px dashed rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  padding: "8px 14px",
                  color: "#bbbbbbbb",
                  fontSize: "12px",
                  fontFamily: "inherit",
                  cursor: "pointer",
                  width: "100%",
                  justifyContent: "center",
                  transition: "all 0.15s",
                }}
              >
                <Plus size={13} /> {t("synthetic.add")}
              </button>
            </div>

            <button
              onClick={handleCreate}
              disabled={creating || !formName.trim()}
              style={{
                width: "100%",
                background:
                  creating || !formName.trim()
                    ? "rgba(0,212,170,0.05)"
                    : "rgba(0,212,170,0.1)",
                border: "1px solid rgba(0,212,170,0.25)",
                borderRadius: "8px",
                padding: "12px",
                color: "#00D4AA",
                fontSize: "13px",
                fontWeight: 700,
                fontFamily: "inherit",
                cursor:
                  creating || !formName.trim() ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {creating ? (
                <Loader2
                  size={14}
                  style={{ animation: "spin 1s linear infinite" }}
                />
              ) : (
                <Plus size={14} />
              )}
              {t("synthetic.create")}
            </button>
          </div>
        </div>
      )}

      {screenshot && (
        <div
          onClick={() => setScreenshot(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            padding: "20px",
            cursor: "zoom-out",
          }}
        >
          <img
            src={screenshot}
            alt="screenshot"
            style={{
              maxWidth: "90vw",
              maxHeight: "85vh",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: #333; }
        input:focus, select:focus { border-color: rgba(0,212,170,0.3) !important; }
        button:hover { opacity: 0.85; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }

        .synthetic-page { padding: 32px; box-sizing: border-box; width: 100%; }
        .synthetic-grid { display: grid; gap: 20px; width: 100%; }
        .synthetic-grid--detail { grid-template-columns: 1fr 420px; }

        @media (max-width: 900px) {
          .synthetic-grid--detail { grid-template-columns: 1fr; }
        }

        @media (max-width: 640px) {
          .synthetic-page { padding: 16px; }
        }
      `}</style>
    </div>
  );
}
