import { useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";

interface UpgradeModalProps {
  onClose: () => void;
}

const PRO_FEATURES = [
  "Monitores ilimitados",
  "Ping a cada 1 minuto",
  "Histórico de 90 dias",
  "URL personalizada",
  "Notificação por WhatsApp",
  "Relatório semanal",
];

export function UpgradeModal({ onClose }: UpgradeModalProps) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(8px)",
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
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .modal-card { animation: modalIn 0.2s ease both; }
        .cancel-btn:hover { background: rgba(255,255,255,0.04) !important; color: #F0F6FC !important; }
        .cancel-btn { transition: background 0.15s, color 0.15s; }
        .upgrade-btn:hover { background: #00bfa0 !important; transform: translateY(-1px); }
        .upgrade-btn { transition: background 0.15s, transform 0.1s; }
      `}</style>

      <div
        className="modal-card"
        style={{
          background: "#0D1117",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
          padding: "32px",
          maxWidth: "420px",
          width: "100%",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
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
            width: "180px",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(0,212,170,0.5), transparent)",
          }}
        />

        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: "rgba(0,212,170,0.08)",
              border: "1px solid rgba(0,212,170,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Zap size={24} color="#00D4AA" />
          </div>
          <h3
            style={{
              color: "#F0F6FC",
              fontSize: "18px",
              fontWeight: 700,
              letterSpacing: "-0.5px",
              margin: "0 0 8px",
            }}
          >
            Limite atingido
          </h3>
          <p
            style={{
              color: "#8B949E",
              fontSize: "13px",
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            Você atingiu o limite de{" "}
            <span style={{ color: "#F0F6FC", fontWeight: 600 }}>
              3 monitores
            </span>{" "}
            do plano Free. Faça upgrade e monitore quantos sistemas quiser.
          </p>
        </div>

        <div
          style={{
            background: "#060810",
            border: "1px solid rgba(0,212,170,0.15)",
            borderRadius: "12px",
            padding: "18px 20px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "14px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Zap size={13} color="#00D4AA" />
              <span
                style={{
                  color: "#00D4AA",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                }}
              >
                Pro
              </span>
            </div>
            <div
              style={{ display: "flex", alignItems: "baseline", gap: "3px" }}
            >
              <span
                style={{
                  color: "#F0F6FC",
                  fontSize: "20px",
                  fontWeight: 700,
                  letterSpacing: "-0.5px",
                }}
              >
                R$29
              </span>
              <span style={{ color: "#555", fontSize: "11px" }}>/mês</span>
            </div>
          </div>

          <div
            style={{
              width: "100%",
              height: "1px",
              background: "rgba(255,255,255,0.04)",
              marginBottom: "14px",
            }}
          />

          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {PRO_FEATURES.map((item) => (
              <li
                key={item}
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span
                  style={{ color: "#00D4AA", fontSize: "11px", flexShrink: 0 }}
                >
                  ✓
                </span>
                <span style={{ color: "#8B949E", fontSize: "12px" }}>
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onClose}
            className="cancel-btn"
            style={{
              flex: 1,
              background: "none",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px",
              padding: "11px",
              cursor: "pointer",
              color: "#555",
              fontSize: "13px",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            Agora não
          </button>
          <button
            onClick={() => navigate("/billing")}
            className="upgrade-btn"
            style={{
              flex: 1,
              background: "#00D4AA",
              border: "none",
              borderRadius: "8px",
              padding: "11px",
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
            <Zap size={13} /> Fazer upgrade
          </button>
        </div>
      </div>
    </div>
  );
}
