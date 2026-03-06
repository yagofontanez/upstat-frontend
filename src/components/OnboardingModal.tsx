import { useState } from "react";
import { api } from "../services/api";
import { createMonitor } from "../services/monitors";
import { ArrowRight, CheckCircle, Copy, ExternalLink } from "lucide-react";

interface OnboardingModalProps {
  userName: string;
  statusSlug: string;
  onComplete: () => void;
}

export function OnboardingModal({
  userName,
  statusSlug,
  onComplete,
}: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [monitorName, setMonitorName] = useState("");
  const [monitorUrl, setMonitorUrl] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const statusUrl = `${window.location.origin}/status/${statusSlug}`;

  async function handleCreateMonitor(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCreating(true);
    try {
      await createMonitor({ name: monitorName, url: monitorUrl });
      setStep(3);
    } catch {
      setError("Erro ao criar monitor. Verifique a URL e tente novamente.");
    } finally {
      setCreating(false);
    }
  }

  async function handleComplete() {
    await api.post("/auth/onboarding/complete");
    onComplete();
  }

  async function handleSkip() {
    await api.post("/auth/onboarding/complete");
    onComplete();
  }

  function handleCopy() {
    navigator.clipboard.writeText(statusUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#060810",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "8px",
    padding: "11px 14px",
    color: "#F0F6FC",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "16px",
        fontFamily: "'JetBrains Mono', 'Courier New', monospace",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.97) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .onb-card { animation: modalIn 0.25s ease both; }
        .onb-content { animation: fadeUp 0.3s ease both; }
        .onb-input:focus { border-color: #00D4AA !important; box-shadow: 0 0 0 3px rgba(0,212,170,0.08) !important; }
        .onb-primary:hover { background: #00bfa0 !important; transform: translateY(-1px); }
        .onb-primary { transition: background 0.15s, transform 0.1s; }
        .onb-skip:hover { color: #8B949E !important; }
        .onb-skip { transition: color 0.15s; }
      `}</style>

      <div
        className="onb-card"
        style={{
          background: "#0D1117",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "440px",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "200px",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(0,212,170,0.5), transparent)",
          }}
        />

        <div style={{ height: "2px", background: "rgba(255,255,255,0.04)" }}>
          <div
            style={{
              height: "100%",
              background: "#00D4AA",
              width: `${(step / 3) * 100}%`,
              transition: "width 0.4s ease",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px 0",
          }}
        >
          <div style={{ display: "flex", gap: "6px" }}>
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: s <= step ? "#00D4AA" : "rgba(255,255,255,0.08)",
                  transition: "background 0.3s",
                }}
              />
            ))}
          </div>
          <span
            style={{ fontSize: "10px", color: "#555", letterSpacing: "1px" }}
          >
            {step} / 3
          </span>
        </div>

        <div style={{ padding: "24px" }}>
          {step === 1 && (
            <div key="step1" className="onb-content">
              <div style={{ marginBottom: "28px" }}>
                <div style={{ fontSize: "28px", marginBottom: "16px" }}>👋</div>
                <h2
                  style={{
                    color: "#F0F6FC",
                    fontSize: "20px",
                    fontWeight: 700,
                    letterSpacing: "-0.5px",
                    margin: "0 0 10px",
                  }}
                >
                  Olá, {userName.split(" ")[0]}!
                </h2>
                <p
                  style={{
                    color: "#8B949E",
                    fontSize: "13px",
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  Bem-vindo ao UpStat. Em menos de 2 minutos você vai ter seu
                  primeiro monitor configurado e uma status page pública pronta
                  pra compartilhar.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  marginBottom: "28px",
                }}
              >
                {[
                  { num: "01", label: "Criar seu primeiro monitor" },
                  { num: "02", label: "Receber alertas de downtime" },
                  { num: "03", label: "Compartilhar sua status page" },
                ].map((item) => (
                  <div
                    key={item.num}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 14px",
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.04)",
                      borderRadius: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#00D4AA",
                        fontWeight: 700,
                        width: "20px",
                        flexShrink: 0,
                      }}
                    >
                      {item.num}
                    </span>
                    <span style={{ fontSize: "13px", color: "#8B949E" }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                className="onb-primary"
                style={{
                  width: "100%",
                  background: "#00D4AA",
                  border: "none",
                  borderRadius: "8px",
                  padding: "13px",
                  cursor: "pointer",
                  color: "#000",
                  fontSize: "13px",
                  fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                Começar <ArrowRight size={14} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div key="step2" className="onb-content">
              <div style={{ marginBottom: "24px" }}>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#00D4AA",
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    marginBottom: "10px",
                    opacity: 0.7,
                  }}
                >
                  // passo 1
                </div>
                <h2
                  style={{
                    color: "#F0F6FC",
                    fontSize: "18px",
                    fontWeight: 700,
                    letterSpacing: "-0.5px",
                    margin: "0 0 8px",
                  }}
                >
                  Adicione seu primeiro monitor
                </h2>
                <p
                  style={{
                    color: "#555",
                    fontSize: "12px",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  Cole a URL de qualquer site, API ou serviço que você quer
                  monitorar.
                </p>
              </div>

              <form onSubmit={handleCreateMonitor}>
                {error && (
                  <div
                    style={{
                      background: "rgba(239,68,68,0.08)",
                      border: "1px solid rgba(239,68,68,0.2)",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      marginBottom: "14px",
                      fontSize: "12px",
                      color: "#EF4444",
                    }}
                  >
                    {error}
                  </div>
                )}

                <div style={{ marginBottom: "12px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      color: "#8B949E",
                      marginBottom: "6px",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                    }}
                  >
                    Nome
                  </label>
                  <input
                    type="text"
                    value={monitorName}
                    onChange={(e) => setMonitorName(e.target.value)}
                    style={inputStyle}
                    className="onb-input"
                    placeholder="Minha API"
                    required
                    autoFocus
                  />
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      color: "#8B949E",
                      marginBottom: "6px",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                    }}
                  >
                    URL
                  </label>
                  <input
                    type="url"
                    value={monitorUrl}
                    onChange={(e) => setMonitorUrl(e.target.value)}
                    style={inputStyle}
                    className="onb-input"
                    placeholder="https://minha-api.com/health"
                    required
                  />
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="submit"
                    disabled={creating}
                    className="onb-primary"
                    style={{
                      flex: 1,
                      background: "#00D4AA",
                      border: "none",
                      borderRadius: "8px",
                      padding: "12px",
                      cursor: "pointer",
                      color: "#000",
                      fontSize: "13px",
                      fontWeight: 700,
                      fontFamily: "'JetBrains Mono', monospace",
                      opacity: creating ? 0.5 : 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    {creating ? (
                      "Criando..."
                    ) : (
                      <>
                        <ArrowRight size={13} /> Criar monitor
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="onb-skip"
                    style={{
                      background: "none",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "8px",
                      padding: "12px 16px",
                      cursor: "pointer",
                      color: "#444",
                      fontSize: "12px",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    Pular
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 3 && (
            <div key="step3" className="onb-content">
              <div style={{ marginBottom: "24px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: "rgba(0,212,170,0.08)",
                    border: "1px solid rgba(0,212,170,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "16px",
                  }}
                >
                  <CheckCircle size={20} color="#00D4AA" />
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#00D4AA",
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    marginBottom: "10px",
                    opacity: 0.7,
                  }}
                >
                  // tudo pronto
                </div>
                <h2
                  style={{
                    color: "#F0F6FC",
                    fontSize: "18px",
                    fontWeight: 700,
                    letterSpacing: "-0.5px",
                    margin: "0 0 8px",
                  }}
                >
                  Monitor criado! 🎉
                </h2>
                <p
                  style={{
                    color: "#555",
                    fontSize: "12px",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  Sua status page pública já está no ar. Compartilhe com seus
                  clientes e equipe.
                </p>
              </div>

              <div
                style={{
                  background: "#060810",
                  border: "1px solid rgba(0,212,170,0.15)",
                  borderRadius: "10px",
                  padding: "14px 16px",
                  marginBottom: "24px",
                }}
              >
                <p
                  style={{
                    fontSize: "10px",
                    color: "#555",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    margin: "0 0 8px",
                  }}
                >
                  Sua status page
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#00D4AA",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {statusUrl}
                  </span>
                  <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                    <button
                      onClick={handleCopy}
                      style={{
                        background: copied
                          ? "rgba(0,212,170,0.1)"
                          : "rgba(255,255,255,0.04)",
                        border: `1px solid ${copied ? "rgba(0,212,170,0.2)" : "rgba(255,255,255,0.06)"}`,
                        borderRadius: "6px",
                        padding: "5px 8px",
                        cursor: "pointer",
                        color: copied ? "#00D4AA" : "#555",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "11px",
                        fontFamily: "'JetBrains Mono', monospace",
                        transition: "all 0.15s",
                      }}
                    >
                      <Copy size={11} />
                      {copied ? "Copiado!" : "Copiar"}
                    </button>
                    <a
                      href={statusUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: "6px",
                        padding: "5px 8px",
                        color: "#555",
                        display: "flex",
                        alignItems: "center",
                        textDecoration: "none",
                      }}
                    >
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={handleComplete}
                  className="onb-primary"
                  style={{
                    flex: 1,
                    background: "#00D4AA",
                    border: "none",
                    borderRadius: "8px",
                    padding: "12px",
                    cursor: "pointer",
                    color: "#000",
                    fontSize: "13px",
                    fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  Ir pro dashboard <ArrowRight size={13} />
                </button>
                <a
                  href={statusUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    color: "#555",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "12px",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  <ExternalLink size={12} /> Ver page
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
