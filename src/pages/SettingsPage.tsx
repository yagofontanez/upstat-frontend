import { useEffect, useState } from "react";
import { useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";
import { getMyPage, updatePage } from "../services/pages";
import { ExternalLink, Bell, Globe, User, Code } from "lucide-react";
import {
  subscribePush,
  unsubscribePush,
  isPushSubscribed,
} from "../services/push";
import { useTranslation } from "react-i18next";
import { Upload, X } from "lucide-react";

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
  const { t } = useTranslation();
  const { user } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [slackWebhook, setSlackWebhook] = useState("");
  const [slackEnabled, setSlackEnabled] = useState(false);
  const [savingSlack, setSavingSlack] = useState(false);
  const [slackSuccess, setSlackSuccess] = useState(false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [savingWhatsapp, setSavingWhatsapp] = useState(false);
  const [whatsappSuccess, setWhatsappSuccess] = useState(false);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [canceling, setCanceling] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);

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
        setSlackEnabled(notifRes.data.notifications.slack_enabled ?? false);
        setSlackWebhook(notifRes.data.notifications.slack_webhook_url ?? "");
        setWhatsappEnabled(
          notifRes.data.notifications.whatsapp_enabled ?? false,
        );
        setWhatsappNumber(notifRes.data.notifications.whatsapp_number ?? "");
        setLogoBase64(page.logo_base64 ?? null);
      })
      .finally(() => setLoading(false));
  }, []);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert(t("settings.alert"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogoBase64(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleCancelPlan() {
    setCanceling(true);

    try {
      await api.post("/billing/cancel");
      window.location.reload();
    } catch {
      alert(t("settings.cancel_error"));
    } finally {
      setCanceling(false);
    }
  }

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

  async function handleSaveSlack() {
    setSavingSlack(true);
    setSlackSuccess(false);
    try {
      await api.put("/settings/slack", {
        slack_webhook_url: slackWebhook,
        slack_enabled: slackEnabled,
      });
      setSlackSuccess(true);
      setTimeout(() => setSlackSuccess(false), 3000);
    } finally {
      setSavingSlack(false);
    }
  }

  async function handleSaveWhatsapp() {
    setSavingWhatsapp(true);
    setWhatsappSuccess(false);
    try {
      await api.put("/settings/notifications", {
        email_enabled: emailEnabled,
        whatsapp_enabled: whatsappEnabled,
        whatsapp_number: whatsappNumber,
      });
      setWhatsappSuccess(true);
      setTimeout(() => setWhatsappSuccess(false), 3000);
    } finally {
      setSavingWhatsapp(false);
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
        logo_base64: logoBase64 ?? null,
      });
      setOriginalSlug(pageSlug);
      setPageSuccess(true);
      setTimeout(() => setPageSuccess(false), 3000);
    } catch {
      setPageError(t("settings.error"));
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
        .logo-upload:hover { border-color: rgba(0,212,170,0.3) !important; background: rgba(0,212,170,0.03) !important; }
        .logo-upload { transition: all 0.15s; }
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
          {t("settings.config")}
        </h2>
        <p style={{ color: "#bbbbbb", fontSize: "12px", margin: 0 }}>
          {t("settings.desc")}
        </p>
      </div>

      <div className="set-fade-1">
        <Section
          title={t("settings.sections.account")}
          icon={<User size={14} />}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px",
              marginBottom: "16px",
            }}
          >
            <div>
              <label style={labelStyle}>{t("settings.name")}</label>
              <input
                type="text"
                value={user?.name}
                disabled
                style={{
                  ...inputStyle,
                  color: "#bbbbbb",
                  cursor: "not-allowed",
                }}
              />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={user?.email}
                disabled
                style={{
                  ...inputStyle,
                  color: "#bbbbbb",
                  cursor: "not-allowed",
                }}
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
                color: user?.plan === "pro" ? "#00D4AA" : "#bbbbbb",
                border: `1px solid ${user?.plan === "pro" ? "rgba(0,212,170,0.15)" : "rgba(255,255,255,0.08)"}`,
              }}
            >
              {user?.plan === "pro" ? "⚡ Pro" : "Free"}
            </span>
            {user?.plan === "free" && (
              <span style={{ fontSize: "11px", color: "#bbbbbb" }}>
                {t("settings.do_upgrade")}
              </span>
            )}
            {user?.plan === "pro" && (
              <button
                onClick={() => setCancelModal(true)}
                style={{
                  marginLeft: "auto",
                  background: "none",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: "8px",
                  padding: "6px 14px",
                  cursor: "pointer",
                  color: "#EF4444",
                  fontSize: "11px",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {t("settings.cancel")}
              </button>
            )}
          </div>
        </Section>
      </div>

      <div className="set-fade-2">
        <Section
          title={t("settings.sections.notifications")}
          icon={<Bell size={14} />}
        >
          {[
            {
              label: "Email",
              desc: t("settings.mail_alert"),
              enabled: emailEnabled,
              onChange: () => setEmailEnabled(!emailEnabled),
              disabled: false,
            },
            {
              label: t("settings.push_alert"),
              desc: t("settings.push_alert_desc"),
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
                <p style={{ color: "#bbbbbb", fontSize: "11px", margin: 0 }}>
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
              {saving ? t("settings.saving") : t("settings.save")}
            </button>
            {success && (
              <span style={{ fontSize: "12px", color: "#22C55E" }}>
                {t("settings.saved")}
              </span>
            )}
          </div>
        </Section>
      </div>

      {user?.plan === "pro" && (
        <div className="set-fade-3">
          <Section title={t("settings.sections.wpp")} icon={<Bell size={14} />}>
            <p
              style={{
                color: "#bbbbbb",
                fontSize: "12px",
                marginBottom: "16px",
                lineHeight: 1.6,
              }}
            >
              {t("settings.wpp_alert")}
            </p>
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>{t("settings.number")}</label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                style={inputStyle}
                className="input-focus"
                placeholder="+5511999999999"
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
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
                  {t("settings.activate")}
                </p>
                <p style={{ color: "#bbbbbb", fontSize: "11px", margin: 0 }}>
                  {t("settings.send_alert")}
                </p>
              </div>
              <Toggle
                enabled={whatsappEnabled}
                onChange={() => setWhatsappEnabled(!whatsappEnabled)}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                onClick={handleSaveWhatsapp}
                disabled={savingWhatsapp}
                style={{ ...saveBtn, opacity: savingWhatsapp ? 0.5 : 1 }}
              >
                {savingWhatsapp ? t("settings.saving") : t("settings.save")}
              </button>
              {whatsappSuccess && (
                <span style={{ fontSize: "12px", color: "#22C55E" }}>
                  {t("settings.saved")}
                </span>
              )}
            </div>
          </Section>
        </div>
      )}

      <div className="set-fade-3">
        <Section title={t("settings.sections.slack")} icon={<Bell size={14} />}>
          <p
            style={{
              color: "#bbbbbb",
              fontSize: "12px",
              marginBottom: "16px",
              lineHeight: 1.6,
            }}
          >
            {t("settings.slack_desc")}{" "}
            <a
              href="https://api.slack.com/messaging/webhooks"
              target="_blank"
              rel="noreferrer"
              style={{ color: "#00D4AA" }}
            >
              {t("settings.how_create_webhook")}
            </a>
          </p>

          <div style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>Webhook URL</label>
            <input
              type="url"
              value={slackWebhook}
              onChange={(e) => setSlackWebhook(e.target.value)}
              style={inputStyle}
              className="input-focus"
              placeholder="https://hooks.slack.com/services/..."
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
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
                {t("settings.activate")}
              </p>
              <p style={{ color: "#bbbbbb", fontSize: "11px", margin: 0 }}>
                {t("settings.send_alert")}
              </p>
            </div>
            <Toggle
              enabled={slackEnabled}
              onChange={() => setSlackEnabled(!slackEnabled)}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={handleSaveSlack}
              disabled={savingSlack}
              style={{ ...saveBtn, opacity: savingSlack ? 0.5 : 1 }}
            >
              {savingSlack ? t("settings.saving") : t("settings.save")}
            </button>
            {slackSuccess && (
              <span style={{ fontSize: "12px", color: "#22C55E" }}>
                {t("settings.saved")}
              </span>
            )}
          </div>
        </Section>
      </div>

      <div className="set-fade-4">
        <Section
          title={t("settings.sections.readme")}
          icon={<Code size={14} />}
        >
          <p
            style={{
              color: "#bbbbbb",
              fontSize: "12px",
              marginBottom: "16px",
              lineHeight: 1.6,
            }}
          >
            {t("settings.readme_desc")}
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
                color: "#bbbbbb",
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
                color: "#bbbbbb",
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

      <div className="set-fade-5">
        <Section
          title={t("settings.sections.widget")}
          icon={<Code size={14} />}
        >
          <p
            style={{
              color: "#bbbbbb",
              fontSize: "12px",
              marginBottom: "16px",
              lineHeight: 1.6,
            }}
          >
            {t("settings.widget_desc")}
          </p>
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
                color: "#bbbbbb",
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              HTML
            </p>
            <code
              style={{
                color: "#00D4AA",
                fontSize: "12px",
                wordBreak: "break-all",
              }}
            >
              {`<script src="https://upstat.online/widget.js" data-slug="${originalSlug}"></script>`}
            </code>
          </div>
        </Section>
      </div>

      <div className="set-fade-6">
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
              <Globe size={14} color="#bbbbbb" />
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
              {t("settings.see_page")} <ExternalLink size={11} />
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

            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Logo</label>
              <div
                style={{ display: "flex", alignItems: "center", gap: "14px" }}
              >
                {logoBase64 ? (
                  <div style={{ position: "relative" }}>
                    <img
                      src={logoBase64}
                      alt="logo"
                      style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "10px",
                        objectFit: "contain",
                        background: "#060810",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    />
                    <button
                      onClick={() => setLogoBase64(null)}
                      style={{
                        position: "absolute",
                        top: "-6px",
                        right: "-6px",
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        background: "#EF4444",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <X size={10} color="#fff" />
                    </button>
                  </div>
                ) : (
                  <div
                    className="logo-upload"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "10px",
                      background: "#060810",
                      border: "1px dashed rgba(255,255,255,0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <Upload size={16} color="#555" />
                  </div>
                )}
                <div>
                  <p
                    style={{
                      color: "#F0F6FC",
                      fontSize: "12px",
                      margin: "0 0 4px",
                    }}
                  >
                    {logoBase64 ? t("settings.logo") : t("settings.logo_2")}
                  </p>
                  <p style={{ color: "#555", fontSize: "11px", margin: 0 }}>
                    {t("settings.types")}
                  </p>
                  {!logoBase64 && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        marginTop: "6px",
                        background: "none",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "6px",
                        padding: "4px 10px",
                        cursor: "pointer",
                        color: "#8B949E",
                        fontSize: "11px",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {t("settings.choose")}
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  style={{ display: "none" }}
                />
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "14px",
                marginBottom: "14px",
              }}
            >
              <div>
                <label style={labelStyle}>{t("settings.title")}</label>
                <input
                  type="text"
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                  style={inputStyle}
                  className="input-focus"
                  placeholder={t("settings.title_placeholder")}
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
                      {t("settings.only_pro")}
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
                      color: "#bbbbbb",
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
                      color: user?.plan !== "pro" ? "#bbbbbb" : "#F0F6FC",
                      fontSize: "13px",
                      fontFamily: "'JetBrains Mono', monospace",
                      cursor: user?.plan !== "pro" ? "not-allowed" : "text",
                    }}
                    placeholder={t("settings.my_slug")}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>{t("settings.description")}</label>
              <input
                type="text"
                value={pageDescription}
                onChange={(e) => setPageDescription(e.target.value)}
                style={inputStyle}
                className="input-focus"
                placeholder={t("settings.description_placeholder")}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ ...labelStyle, marginBottom: "10px" }}>
                {t("settings.monitors")}
              </label>
              {monitors.length === 0 ? (
                <p style={{ color: "#bbbbbb", fontSize: "12px" }}>
                  {t("settings.0_monitors")}
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
                {savingPage ? t("settings.saving") : t("settings.save")}
              </button>
              {pageSuccess && (
                <span style={{ fontSize: "12px", color: "#22C55E" }}>
                  {t("settings.saved")}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      {cancelModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            style={{
              background: "#0D1117",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px",
              padding: "28px",
              maxWidth: "380px",
              width: "100%",
            }}
          >
            <h3
              style={{
                color: "#F0F6FC",
                fontSize: "16px",
                fontWeight: 700,
                margin: "0 0 10px",
              }}
            >
              {t("settings.confirm_cancel")}
            </h3>
            <p
              style={{
                color: "#8B949E",
                fontSize: "12px",
                lineHeight: 1.7,
                margin: "0 0 24px",
              }}
            >
              {t("settings.confirm_cancel_desc")}
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setCancelModal(false)}
                style={{
                  flex: 1,
                  background: "none",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  padding: "10px",
                  cursor: "pointer",
                  color: "#8B949E",
                  fontSize: "12px",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {t("settings.no_cancel")}
              </button>
              <button
                onClick={() => {
                  setCancelModal(false);
                  handleCancelPlan();
                }}
                disabled={canceling}
                style={{
                  flex: 1,
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: "8px",
                  padding: "10px",
                  cursor: "pointer",
                  color: "#EF4444",
                  fontSize: "12px",
                  fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  opacity: canceling ? 0.5 : 1,
                }}
              >
                {canceling ? t("settings.canceling") : t("settings.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
