import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";
import { getMyPage, updatePage } from "../services/pages";
import { ExternalLink, Bell, Globe, User, Code } from "lucide-react";
import {
  subscribePush,
  unsubscribePush,
  isPushSubscribed,
} from "../services/push";

function Toggle({
  enabled,
  onChange,
  disabled = false,
}: {
  enabled: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      style={{
        flexShrink: 0,
        width: "44px",
        height: "24px",
        borderRadius: "100px",
        background: enabled ? "#00D4AA" : "rgba(255,255,255,0.08)",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        position: "relative",
        transition: "background 0.2s",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "4px",
          left: enabled ? "24px" : "4px",
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.2s",
          boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
        }}
      />
    </button>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#0D1117",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "12px",
        overflow: "hidden",
        marginBottom: "16px",
      }}
    >
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#F0F6FC" }}>
          {title}
        </span>
      </div>
      <div style={{ padding: "20px" }}>{children}</div>
    </div>
  );
}

export function SettingsPage() {
  const { user } = useAuth();
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pageTitle, setPageTitle] = useState("");
  const [pageDescription, setPageDescription] = useState("");
  const [pageSlug, setPageSlug] = useState("");
  const [originalSlug, setOriginalSlug] = useState("");
  const [savingPage, setSavingPage] = useState(false);
  const [pageSuccess, setPageSuccess] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [monitors, setMonitors] = useState<{ id: string; name: string }[]>([]);
  const [selectedMonitorIds, setSelectedMonitorIds] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      api.get("/settings/notifications"),
      getMyPage(),
      api.get("/monitors"),
      isPushSubscribed(),
    ])
      .then(([notifRes, page, monitorsRes, pushSubscribed]) => {
        if (notifRes.data.notifications)
          setEmailEnabled(notifRes.data.notifications.email_enabled);
        setPageTitle(page.title);
        setPageDescription(page.description || "");
        setPageSlug(page.slug);
        setOriginalSlug(page.slug);
        setMonitors(monitorsRes.data.monitors);
        setSelectedMonitorIds(page.monitor_ids || []);
        setPushEnabled(pushSubscribed);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleTogglePush() {
    setPushLoading(true);
    try {
      if (pushEnabled) {
        await unsubscribePush();
        setPushEnabled(false);
      } else {
        const ok = await subscribePush();
        setPushEnabled(ok);
      }
    } finally {
      setPushLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSuccess(false);
    try {
      await api.put("/settings/notifications", { email_enabled: emailEnabled });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  async function handleSavePage() {
    setSavingPage(true);
    setPageError("");
    setPageSuccess(false);
    try {
      await updatePage({
        title: pageTitle,
        description: pageDescription,
        slug: pageSlug !== originalSlug ? pageSlug : undefined,
        monitor_ids: selectedMonitorIds,
      });
      setOriginalSlug(pageSlug);
      setPageSuccess(true);
      setTimeout(() => setPageSuccess(false), 3000);
    } catch {
      setPageError("Erro ao salvar");
    } finally {
      setSavingPage(false);
    }
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

  const saveBtn: React.CSSProperties = {
    background: "#00D4AA",
    border: "none",
    borderRadius: "8px",
    padding: "10px 20px",
    cursor: "pointer",
    color: "#000",
    fontSize: "12px",
    fontWeight: 700,
    fontFamily: "'JetBrains Mono', monospace",
    transition: "background 0.2s",
  };

  return (
    <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .set-fade { animation: fadeUp 0.4s ease both; }
        .set-fade-1 { animation: fadeUp 0.4s 0.05s ease both; }
        .set-fade-2 { animation: fadeUp 0.4s 0.1s ease both; }
        .set-fade-3 { animation: fadeUp 0.4s 0.15s ease both; }
        .set-fade-4 { animation: fadeUp 0.4s 0.2s ease both; }
        .input-focus:focus { border-color: #00D4AA !important; box-shadow: 0 0 0 3px rgba(0,212,170,0.08) !important; }
        .monitor-check:hover { border-color: rgba(0,212,170,0.3) !important; }
        .monitor-check { transition: border-color 0.15s; }
      `}</style>

      <div className="set-fade" style={{ marginBottom: "28px" }}>
        <h2
          style={{
            color: "#F0F6FC",
            fontSize: "22px",
            fontWeight: 700,
            letterSpacing: "-0.5px",
            margin: "0 0 4px",
          }}
        >
          Configurações
        </h2>
        <p style={{ color: "#555", fontSize: "12px", margin: 0 }}>
          Gerencie sua conta e notificações
        </p>
      </div>

      <div className="set-fade-1">
        <Section title="Conta" icon={<User size={14} />}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px",
              marginBottom: "16px",
            }}
          >
            <div>
              <label style={labelStyle}>Nome</label>
              <input
                type="text"
                value={user?.name}
                disabled
                style={{ ...inputStyle, color: "#555", cursor: "not-allowed" }}
              />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={user?.email}
                disabled
                style={{ ...inputStyle, color: "#555", cursor: "not-allowed" }}
              />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                fontSize: "11px",
                padding: "4px 12px",
                borderRadius: "100px",
                fontWeight: 600,
                background:
                  user?.plan === "pro"
                    ? "rgba(0,212,170,0.08)"
                    : "rgba(255,255,255,0.04)",
                color: user?.plan === "pro" ? "#00D4AA" : "#555",
                border: `1px solid ${user?.plan === "pro" ? "rgba(0,212,170,0.15)" : "rgba(255,255,255,0.08)"}`,
              }}
            >
              {user?.plan === "pro" ? "⚡ Pro" : "Free"}
            </span>
            {user?.plan === "free" && (
              <span style={{ fontSize: "11px", color: "#555" }}>
                Faça upgrade para desbloquear mais recursos.
              </span>
            )}
          </div>
        </Section>
      </div>

      <div className="set-fade-2">
        <Section title="Notificações" icon={<Bell size={14} />}>
          {[
            {
              label: "Email",
              desc: "Alertas de downtime por email",
              enabled: emailEnabled,
              onChange: () => setEmailEnabled(!emailEnabled),
              disabled: false,
            },
            {
              label: "WhatsApp",
              desc: "Disponível no plano Pro",
              enabled: false,
              onChange: () => {},
              disabled: true,
            },
            {
              label: "Notificações no browser",
              desc: "Alertas mesmo com a aba fechada",
              enabled: pushEnabled,
              onChange: handleTogglePush,
              disabled: pushLoading,
            },
          ].map((item, i, arr) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: i < arr.length - 1 ? "16px" : "0",
                marginBottom: i < arr.length - 1 ? "16px" : "0",
                borderBottom:
                  i < arr.length - 1
                    ? "1px solid rgba(255,255,255,0.04)"
                    : "none",
              }}
            >
              <div>
                <p
                  style={{
                    color: "#F0F6FC",
                    fontSize: "13px",
                    fontWeight: 500,
                    margin: "0 0 2px",
                  }}
                >
                  {item.label}
                </p>
                <p style={{ color: "#555", fontSize: "11px", margin: 0 }}>
                  {item.desc}
                </p>
              </div>
              <Toggle
                enabled={item.enabled}
                onChange={item.onChange}
                disabled={item.disabled}
              />
            </div>
          ))}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginTop: "20px",
              paddingTop: "16px",
              borderTop: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ ...saveBtn, opacity: saving ? 0.5 : 1 }}
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
            {success && (
              <span style={{ fontSize: "12px", color: "#22C55E" }}>
                ✓ Salvo
              </span>
            )}
          </div>
        </Section>
      </div>

      <div className="set-fade-3">
        <Section title="Badge para README" icon={<Code size={14} />}>
          <p
            style={{
              color: "#555",
              fontSize: "12px",
              marginBottom: "16px",
              lineHeight: 1.6,
            }}
          >
            Cole no README do seu projeto no GitHub para mostrar o status em
            tempo real.
          </p>
          <div
            style={{
              background: "#060810",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "10px",
            }}
          >
            <p
              style={{
                fontSize: "10px",
                color: "#555",
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              Preview
            </p>
            <img
              src={`${import.meta.env.VITE_API_URL}/badge/${originalSlug}`}
              alt="uptime badge"
            />
          </div>
          <div
            style={{
              background: "#060810",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "8px",
              padding: "16px",
            }}
          >
            <p
              style={{
                fontSize: "10px",
                color: "#555",
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              Markdown
            </p>
            <code
              style={{
                color: "#00D4AA",
                fontSize: "12px",
                wordBreak: "break-all",
              }}
            >
              {`![uptime](${import.meta.env.VITE_API_URL}/badge/${originalSlug})`}
            </code>
          </div>
        </Section>
      </div>

      <div className="set-fade-4">
        <div
          style={{
            background: "#0D1117",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "12px",
            overflow: "hidden",
            marginBottom: "16px",
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
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Globe size={14} color="#555" />
              <span
                style={{ fontSize: "13px", fontWeight: 600, color: "#F0F6FC" }}
              >
                Status Page
              </span>
            </div>
            <a
              href={`/status/${pageSlug || originalSlug}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "12px",
                color: "#00D4AA",
                textDecoration: "none",
                opacity: 0.8,
              }}
            >
              Ver página <ExternalLink size={11} />
            </a>
          </div>

          <div style={{ padding: "20px" }}>
            {pageError && (
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
                {pageError}
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
                <label style={labelStyle}>Título</label>
                <input
                  type="text"
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                  style={inputStyle}
                  className="input-focus"
                  placeholder="Minha Status Page"
                />
              </div>
              <div>
                <label
                  style={{
                    ...labelStyle,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  Slug
                  {user?.plan !== "pro" && (
                    <span
                      style={{
                        color: "#F59E0B",
                        fontSize: "10px",
                        textTransform: "none",
                        letterSpacing: 0,
                        fontWeight: 600,
                      }}
                    >
                      somente Pro
                    </span>
                  )}
                </label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: "#060810",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    gap: "4px",
                  }}
                >
                  <span
                    style={{
                      color: "#555",
                      fontSize: "12px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    upstat.app/status/
                  </span>
                  <input
                    type="text"
                    value={pageSlug}
                    onChange={(e) => setPageSlug(e.target.value)}
                    disabled={user?.plan !== "pro"}
                    style={{
                      flex: 1,
                      background: "none",
                      border: "none",
                      outline: "none",
                      color: user?.plan !== "pro" ? "#555" : "#F0F6FC",
                      fontSize: "13px",
                      fontFamily: "'JetBrains Mono', monospace",
                      cursor: user?.plan !== "pro" ? "not-allowed" : "text",
                    }}
                    placeholder="meu-slug"
                  />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Descrição</label>
              <input
                type="text"
                value={pageDescription}
                onChange={(e) => setPageDescription(e.target.value)}
                style={inputStyle}
                className="input-focus"
                placeholder="Acompanhe o status dos nossos serviços."
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ ...labelStyle, marginBottom: "10px" }}>
                Monitores exibidos
              </label>
              {monitors.length === 0 ? (
                <p style={{ color: "#555", fontSize: "12px" }}>
                  Nenhum monitor cadastrado ainda.
                </p>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  {monitors.map((monitor) => (
                    <label
                      key={monitor.id}
                      className="monitor-check"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 14px",
                        background: "#060810",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedMonitorIds.includes(monitor.id)}
                        onChange={(e) => {
                          if (e.target.checked)
                            setSelectedMonitorIds((prev) => [
                              ...prev,
                              monitor.id,
                            ]);
                          else
                            setSelectedMonitorIds((prev) =>
                              prev.filter((id) => id !== monitor.id),
                            );
                        }}
                        style={{
                          accentColor: "#00D4AA",
                          width: "14px",
                          height: "14px",
                        }}
                      />
                      <span style={{ color: "#F0F6FC", fontSize: "13px" }}>
                        {monitor.name}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                onClick={handleSavePage}
                disabled={savingPage}
                style={{ ...saveBtn, opacity: savingPage ? 0.5 : 1 }}
              >
                {savingPage ? "Salvando..." : "Salvar"}
              </button>
              {pageSuccess && (
                <span style={{ fontSize: "12px", color: "#22C55E" }}>
                  ✓ Salvo
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
