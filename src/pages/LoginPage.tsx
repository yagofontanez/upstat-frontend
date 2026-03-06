import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const monitors = [
  {
    name: "API Principal",
    url: "api.minha-startup.com",
    status: "up",
    latency: 142,
    uptime: 99.98,
  },
  {
    name: "Dashboard Web",
    url: "app.minha-startup.com",
    status: "up",
    latency: 89,
    uptime: 100,
  },
  {
    name: "Worker Queue",
    url: "queue.minha-startup.com",
    status: "down",
    latency: null,
    uptime: 97.2,
  },
  {
    name: "Auth Service",
    url: "auth.minha-startup.com",
    status: "up",
    latency: 56,
    uptime: 99.99,
  },
];

const UPTIME_BARS = Array.from({ length: 36 }, (_, i) => {
  if (i === 4 || i === 18) return "down";
  if (i === 10 || i === 28) return "warn";
  return "up";
});

function UptimeBars() {
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {UPTIME_BARS.map((status, i) => (
        <div
          key={i}
          style={{
            width: "6px",
            height: "20px",
            borderRadius: "2px",
            background:
              status === "down"
                ? "rgba(239,68,68,0.7)"
                : status === "warn"
                  ? "rgba(245,158,11,0.6)"
                  : "rgba(0,212,170,0.5)",
          }}
        />
      ))}
    </div>
  );
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch {
      setError("Email ou senha incorretos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#060810",
        display: "flex",
        fontFamily: "'JetBrains Mono', 'Courier New', monospace",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
        .fade-up-1 { animation: fadeUp 0.5s 0.1s ease both; }
        .fade-up-2 { animation: fadeUp 0.5s 0.2s ease both; }
        .fade-up-3 { animation: fadeUp 0.5s 0.3s ease both; }
        .fade-up-4 { animation: fadeUp 0.5s 0.4s ease both; }
        .fade-up-5 { animation: fadeUp 0.5s 0.5s ease both; }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 1000px #0D1117 inset !important;
          -webkit-text-fill-color: #F0F6FC !important;
        }
        .input-field {
          width: 100%;
          background: #0D1117;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 12px 16px;
          color: #F0F6FC;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .input-field:focus {
          border-color: #00D4AA;
          box-shadow: 0 0 0 3px rgba(0,212,170,0.08);
        }
        .input-field::placeholder { color: #555; }
        .submit-btn {
          width: 100%;
          background: #00D4AA;
          color: #000;
          border: none;
          border-radius: 8px;
          padding: 13px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
          letter-spacing: 0.5px;
        }
        .submit-btn:hover:not(:disabled) { background: #00bfa0; transform: translateY(-1px); }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div
        style={{
          flex: 1,
          display: "none",
          position: "relative",
          overflow: "hidden",
          borderRight: "1px solid rgba(255,255,255,0.05)",
        }}
        className="lg-show"
      >
        <style>{`@media(min-width:1024px){.lg-show{display:flex!important;flex-direction:column;justify-content:center;padding:60px;}}`}</style>

        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(0,212,170,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,170,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(0,212,170,0.06) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", maxWidth: "480px" }}>
          <div style={{ marginBottom: "48px" }}>
            <div
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "#00D4AA",
                letterSpacing: "-0.5px",
                marginBottom: "12px",
              }}
            >
              ● UpStat
            </div>
            <div
              style={{
                fontSize: "32px",
                fontWeight: 700,
                color: "#F0F6FC",
                lineHeight: 1.2,
                letterSpacing: "-1px",
              }}
            >
              Seu sistema caiu.
              <br />
              <span style={{ color: "#00D4AA", fontStyle: "italic" }}>
                Você vai saber primeiro.
              </span>
            </div>
          </div>

          <div
            style={{
              background: "#0D1117",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: "#161B22",
                padding: "12px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "#EF4444",
                  opacity: 0.7,
                }}
              />
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "#F59E0B",
                  opacity: 0.7,
                }}
              />
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "#22C55E",
                  opacity: 0.7,
                }}
              />
              <span
                style={{ marginLeft: "8px", fontSize: "11px", color: "#555" }}
              >
                upstat.online/dashboard
              </span>
            </div>

            <div style={{ padding: "20px" }}>
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
                    color: "#F0F6FC",
                  }}
                >
                  Monitores
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "11px",
                    color: "#00D4AA",
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
                  ao vivo
                </div>
              </div>

              {monitors.map((m, i) => (
                <div
                  key={m.name}
                  style={{
                    padding: "12px 0",
                    borderBottom:
                      i < monitors.length - 1
                        ? "1px solid rgba(255,255,255,0.04)"
                        : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: m.status === "up" ? "#22C55E" : "#EF4444",
                          animation:
                            m.status === "down"
                              ? "pulse-dot 1s infinite"
                              : "none",
                        }}
                      />
                      <span style={{ fontSize: "12px", color: "#F0F6FC" }}>
                        {m.name}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <span style={{ fontSize: "11px", color: "#555" }}>
                        {m.latency ? `${m.latency}ms` : "—"}
                      </span>
                      <span
                        style={{
                          fontSize: "10px",
                          padding: "2px 8px",
                          borderRadius: "100px",
                          background:
                            m.status === "up"
                              ? "rgba(34,197,94,0.1)"
                              : "rgba(239,68,68,0.1)",
                          color: m.status === "up" ? "#22C55E" : "#EF4444",
                        }}
                      >
                        {m.status === "up" ? "Online" : "Offline"}
                      </span>
                    </div>
                  </div>
                  <UptimeBars />
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "12px",
              marginTop: "16px",
            }}
          >
            {[
              { label: "uptime médio", value: "99.8%" },
              { label: "tempo de resposta", value: "96ms" },
              { label: "incidentes (7d)", value: "1" },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: "#0D1117",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "10px",
                  padding: "12px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#00D4AA",
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "#555",
                    marginTop: "2px",
                    letterSpacing: "0.5px",
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "40px 32px",
        }}
      >
        <div
          className="mobile-logo"
          style={{ marginBottom: "40px", textAlign: "center" }}
        >
          <style>{`@media(min-width:1024px){.mobile-logo{display:none!important;}}`}</style>
          <div style={{ fontSize: "22px", fontWeight: 700, color: "#00D4AA" }}>
            ● UpStat
          </div>
        </div>

        <div className="fade-up-1" style={{ marginBottom: "40px" }}>
          <div
            style={{
              fontSize: "11px",
              color: "#00D4AA",
              letterSpacing: "3px",
              textTransform: "uppercase",
              marginBottom: "12px",
              opacity: 0.7,
            }}
          >
            // acesso
          </div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "#F0F6FC",
              letterSpacing: "-1px",
              margin: 0,
            }}
          >
            Bem-vindo de volta
          </h1>
          <p style={{ color: "#555", fontSize: "13px", marginTop: "8px" }}>
            Entre pra ver seus monitores
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div
              className="fade-up"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: "8px",
                padding: "12px 16px",
                marginBottom: "20px",
                fontSize: "12px",
                color: "#EF4444",
              }}
            >
              {error}
            </div>
          )}

          <div className="fade-up-2" style={{ marginBottom: "16px" }}>
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
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="fade-up-3" style={{ marginBottom: "28px" }}>
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
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="fade-up-4">
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? "Entrando..." : "Entrar →"}
            </button>
          </div>
        </form>

        <div
          className="fade-up-5"
          style={{
            marginTop: "32px",
            paddingTop: "24px",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            textAlign: "center",
            fontSize: "12px",
            color: "#555",
          }}
        >
          Não tem conta?{" "}
          <Link
            to="/register"
            style={{
              color: "#00D4AA",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Cadastre-se grátis
          </Link>
        </div>
      </div>
    </div>
  );
}
