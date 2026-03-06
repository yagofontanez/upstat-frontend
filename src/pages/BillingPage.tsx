import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";
import { CheckCircle, Zap, Lock } from "lucide-react";

const FREE_FEATURES = [
  "3 monitores",
  "Ping a cada 5 minutos",
  "Histórico de 7 dias",
  "URL aleatória",
  "Notificação por email",
];

const PRO_FEATURES = [
  "Monitores ilimitados",
  "Ping a cada 1 minuto",
  "Histórico de 90 dias",
  "URL personalizada",
  "Notificação por email",
  "Notificação por WhatsApp",
  "Múltiplos serviços na page",
  "Relatório semanal",
  "Exportar histórico CSV",
];

export function BillingPage() {
  const { user, refreshUser } = useAuth();
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paid, setPaid] = useState(false);

  async function handleUpgrade(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/billing/upgrade", {
        cpf_cnpj: cpf.replace(/\D/g, ""),
      });
      window.open(res.data.payment_url, "_blank");
      setPaid(true);
    } catch {
      setError("Erro ao processar upgrade");
    } finally {
      setLoading(false);
    }
  }

  const isPro = user?.plan === "pro";

  return (
    <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .bill-fade { animation: fadeUp 0.4s ease both; }
        .bill-fade-1 { animation: fadeUp 0.4s 0.05s ease both; }
        .bill-fade-2 { animation: fadeUp 0.4s 0.1s ease both; }
        .input-cpf {
          width: 100%;
          background: #060810;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 11px 14px;
          color: #F0F6FC;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input-cpf:focus {
          border-color: #00D4AA;
          box-shadow: 0 0 0 3px rgba(0,212,170,0.08);
        }
        .input-cpf::placeholder { color: #555; }
      `}</style>

      <div className="bill-fade" style={{ marginBottom: "32px" }}>
        <h2
          style={{
            color: "#F0F6FC",
            fontSize: "22px",
            fontWeight: 700,
            letterSpacing: "-0.5px",
            margin: "0 0 4px",
          }}
        >
          Plano
        </h2>
        <p style={{ color: "#555", fontSize: "12px", margin: 0 }}>
          Gerencie sua assinatura
        </p>
      </div>

      <div
        className="bill-fade-1"
        style={{
          background: isPro ? "rgba(0,212,170,0.04)" : "rgba(255,255,255,0.02)",
          border: `1px solid ${isPro ? "rgba(0,212,170,0.15)" : "rgba(255,255,255,0.06)"}`,
          borderRadius: "12px",
          padding: "16px 20px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {isPro ? (
            <Zap size={16} color="#00D4AA" />
          ) : (
            <Lock size={16} color="#555" />
          )}
          <div>
            <span
              style={{ fontSize: "13px", color: "#F0F6FC", fontWeight: 600 }}
            >
              Você está no plano {isPro ? "Pro" : "Free"}
            </span>
            <p
              style={{
                fontSize: "11px",
                color: isPro ? "#00D4AA" : "#555",
                margin: "2px 0 0",
              }}
            >
              {isPro
                ? "Todos os recursos desbloqueados"
                : "Faça upgrade para desbloquear todos os recursos"}
            </p>
          </div>
        </div>
        <span
          style={{
            fontSize: "11px",
            padding: "4px 12px",
            borderRadius: "100px",
            background: isPro
              ? "rgba(0,212,170,0.1)"
              : "rgba(255,255,255,0.06)",
            color: isPro ? "#00D4AA" : "#555",
            border: `1px solid ${isPro ? "rgba(0,212,170,0.2)" : "rgba(255,255,255,0.08)"}`,
            fontWeight: 600,
          }}
        >
          {isPro ? "● Ativo" : "Free"}
        </span>
      </div>

      <div
        className="bill-fade-2"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          maxWidth: "780px",
        }}
      >
        <div
          style={{
            background: "#0D1117",
            border: `1px solid ${!isPro ? "rgba(0,212,170,0.2)" : "rgba(255,255,255,0.06)"}`,
            borderRadius: "16px",
            padding: "28px",
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
            <span
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#8B949E",
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              Free
            </span>
            {!isPro && (
              <span
                style={{
                  fontSize: "10px",
                  padding: "3px 10px",
                  borderRadius: "100px",
                  background: "rgba(0,212,170,0.08)",
                  color: "#00D4AA",
                  border: "1px solid rgba(0,212,170,0.15)",
                  fontWeight: 600,
                }}
              >
                Plano atual
              </span>
            )}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "4px",
              marginBottom: "20px",
            }}
          >
            <span
              style={{
                fontSize: "40px",
                fontWeight: 700,
                color: "#F0F6FC",
                letterSpacing: "-2px",
              }}
            >
              R$0
            </span>
            <span style={{ fontSize: "13px", color: "#555" }}>/mês</span>
          </div>
          <div
            style={{
              width: "100%",
              height: "1px",
              background: "rgba(255,255,255,0.04)",
              marginBottom: "20px",
            }}
          />
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {FREE_FEATURES.map((item) => (
              <li
                key={item}
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <CheckCircle size={13} color="#333" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: "12px", color: "#8B949E" }}>
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div
          style={{
            background: "#0D1117",
            border: `1px solid ${isPro ? "rgba(0,212,170,0.2)" : "rgba(0,212,170,0.12)"}`,
            borderRadius: "16px",
            padding: "28px",
            position: "relative",
            overflow: "hidden",
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
                "linear-gradient(90deg, transparent, rgba(0,212,170,0.4), transparent)",
            }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Zap size={14} color="#00D4AA" />
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#00D4AA",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                }}
              >
                Pro
              </span>
            </div>
            <span
              style={{
                fontSize: "10px",
                padding: "3px 10px",
                borderRadius: "100px",
                background: "rgba(0,212,170,0.06)",
                color: "#00D4AA",
                border: "1px solid rgba(0,212,170,0.12)",
                fontWeight: 600,
              }}
            >
              {isPro ? "Plano atual" : "Recomendado"}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "4px",
              marginBottom: "20px",
            }}
          >
            <span
              style={{
                fontSize: "40px",
                fontWeight: 700,
                color: "#F0F6FC",
                letterSpacing: "-2px",
              }}
            >
              R$29
            </span>
            <span style={{ fontSize: "13px", color: "#555" }}>/mês</span>
          </div>

          <div
            style={{
              width: "100%",
              height: "1px",
              background: "rgba(255,255,255,0.04)",
              marginBottom: "20px",
            }}
          />

          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: "0 0 24px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {PRO_FEATURES.map((item) => (
              <li
                key={item}
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <CheckCircle
                  size={13}
                  color="#00D4AA"
                  style={{ flexShrink: 0 }}
                />
                <span style={{ fontSize: "12px", color: "#8B949E" }}>
                  {item}
                </span>
              </li>
            ))}
          </ul>

          {!isPro && (
            <form onSubmit={handleUpgrade}>
              {error && (
                <div
                  style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    marginBottom: "12px",
                    fontSize: "12px",
                    color: "#EF4444",
                  }}
                >
                  {error}
                </div>
              )}
              {!paid ? (
                <>
                  <div style={{ marginBottom: "10px" }}>
                    <input
                      type="text"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      className="input-cpf"
                      placeholder="CPF ou CNPJ"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: "100%",
                      background: "#00D4AA",
                      border: "none",
                      borderRadius: "8px",
                      padding: "12px",
                      cursor: "pointer",
                      color: "#000",
                      fontSize: "13px",
                      fontWeight: 700,
                      fontFamily: "'JetBrains Mono', monospace",
                      opacity: loading ? 0.5 : 1,
                      transition: "background 0.2s",
                    }}
                  >
                    {loading ? "Processando..." : "Fazer upgrade →"}
                  </button>
                  <p
                    style={{
                      fontSize: "10px",
                      color: "#333",
                      textAlign: "center",
                      margin: "10px 0 0",
                    }}
                  >
                    Pagamento seguro via Asaas · Cancele quando quiser
                  </p>
                </>
              ) : (
                <div>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#8B949E",
                      marginBottom: "12px",
                      lineHeight: 1.6,
                    }}
                  >
                    Após concluir o pagamento, clique abaixo para atualizar seu
                    plano.
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      await refreshUser();
                      setPaid(false);
                    }}
                    style={{
                      width: "100%",
                      background: "#00D4AA",
                      border: "none",
                      borderRadius: "8px",
                      padding: "12px",
                      cursor: "pointer",
                      color: "#000",
                      fontSize: "13px",
                      fontWeight: 700,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    Já paguei, atualizar plano
                  </button>
                </div>
              )}
            </form>
          )}

          {isPro && (
            <div
              style={{
                padding: "14px",
                background: "rgba(0,212,170,0.04)",
                border: "1px solid rgba(0,212,170,0.1)",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <span style={{ fontSize: "12px", color: "#00D4AA" }}>
                ✓ Plano ativo
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
