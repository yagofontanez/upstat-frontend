import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const STEPS = [
  { icon: "01", label: "Crie sua conta", desc: "Email e senha, sem cartão" },
  {
    icon: "02",
    label: "Adicione um monitor",
    desc: "Cole a URL da sua API ou site",
  },
  {
    icon: "03",
    label: "Compartilhe sua status page",
    desc: "Link público pra seus clientes",
  },
];

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/dashboard");
    } catch {
      setError("Erro ao criar conta. Tente outro email.");
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
        .fade-up-1 { animation: fadeUp 0.5s 0.1s ease both; }
        .fade-up-2 { animation: fadeUp 0.5s 0.2s ease both; }
        .fade-up-3 { animation: fadeUp 0.5s 0.3s ease both; }
        .fade-up-4 { animation: fadeUp 0.5s 0.4s ease both; }
        .fade-up-5 { animation: fadeUp 0.5s 0.5s ease both; }
        .fade-up-6 { animation: fadeUp 0.5s 0.6s ease both; }
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
          <div style={{ marginBottom: "56px" }}>
            <div
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "#00D4AA",
                letterSpacing: "-0.5px",
                marginBottom: "16px",
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
                marginBottom: "12px",
              }}
            >
              Do cadastro à
              <br />
              <span style={{ color: "#00D4AA", fontStyle: "italic" }}>
                status page em 2 minutos.
              </span>
            </div>
            <p style={{ fontSize: "14px", color: "#bbbbbb", lineHeight: 1.6 }}>
              Sem cartão de crédito. Sem configuração complexa.
              <br />
              Só você e seus monitores.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {STEPS.map((step, i) => (
              <div
                key={step.icon}
                style={{
                  display: "flex",
                  gap: "24px",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: "rgba(0,212,170,0.08)",
                      border: "1px solid rgba(0,212,170,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#00D4AA",
                      flexShrink: 0,
                    }}
                  >
                    {step.icon}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      style={{
                        width: "1px",
                        flex: 1,
                        minHeight: "32px",
                        background: "rgba(0,212,170,0.1)",
                        margin: "8px 0",
                      }}
                    />
                  )}
                </div>

                <div
                  style={{
                    paddingTop: "8px",
                    paddingBottom: i < STEPS.length - 1 ? "8px" : "0",
                  }}
                >
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#F0F6FC",
                      marginBottom: "4px",
                    }}
                  >
                    {step.label}
                  </div>
                  <div style={{ fontSize: "13px", color: "#bbbbbb" }}>
                    {step.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: "48px",
              padding: "20px 24px",
              background: "#0D1117",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#22C55E",
                }}
              />
              <span
                style={{ fontSize: "12px", color: "#22C55E", fontWeight: 600 }}
              >
                Plano Free — pra sempre
              </span>
            </div>
            <div
              style={{ fontSize: "13px", color: "#bbbbbb", lineHeight: 1.6 }}
            >
              3 monitores · alertas por email · status page pública
            </div>
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
            // nova conta
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
            Comece de graça
          </h1>
          <p style={{ color: "#bbbbbb", fontSize: "13px", marginTop: "8px" }}>
            Sem cartão · sem burocracia
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div
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
              Nome
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Seu nome"
              required
            />
          </div>

          <div className="fade-up-3" style={{ marginBottom: "16px" }}>
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

          <div className="fade-up-4" style={{ marginBottom: "28px" }}>
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
              placeholder="mínimo 6 caracteres"
              minLength={6}
              required
            />
          </div>

          <div className="fade-up-5">
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? "Criando conta..." : "Criar conta grátis →"}
            </button>
          </div>

          <div className="fade-up-6" style={{ marginTop: "16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: "1px",
                  background: "rgba(255,255,255,0.06)",
                }}
              />
              <span
                style={{
                  fontSize: "11px",
                  color: "#555",
                  letterSpacing: "1px",
                }}
              >
                OU
              </span>
              <div
                style={{
                  flex: 1,
                  height: "1px",
                  background: "rgba(255,255,255,0.06)",
                }}
              />
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <a
                href={`${import.meta.env.VITE_API_URL}/auth/google`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  padding: "12px",
                  color: "#F0F6FC",
                  fontSize: "13px",
                  fontFamily: "inherit",
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "border-color 0.2s",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continuar com Google
              </a>
              <a
                href={`${import.meta.env.VITE_API_URL}/auth/github`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  padding: "12px",
                  color: "#F0F6FC",
                  fontSize: "13px",
                  fontFamily: "inherit",
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "border-color 0.2s",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#F0F6FC">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                Continuar com GitHub
              </a>
            </div>
          </div>
        </form>

        <div
          className="fade-up-7"
          style={{
            marginTop: "24px",
            fontSize: "11px",
            color: "#bbbbbb",
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          Ao criar uma conta você concorda com nossos termos de uso.
        </div>

        <div
          style={{
            marginTop: "24px",
            paddingTop: "24px",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            textAlign: "center",
            fontSize: "12px",
            color: "#bbbbbb",
          }}
        >
          Já tem conta?{" "}
          <Link
            to="/login"
            style={{
              color: "#00D4AA",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Entrar
          </Link>
        </div>
      </div>
    </div>
  );
}
