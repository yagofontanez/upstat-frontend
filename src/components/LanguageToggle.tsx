import { useTranslation } from "react-i18next";

export function LanguageToggle() {
  const { i18n } = useTranslation();

  function toggle() {
    const next = i18n.language === "pt" ? "en" : "pt";
    i18n.changeLanguage(next);
    localStorage.setItem("lang", next);
  }

  return (
    <button
      onClick={toggle}
      title={
        i18n.language === "pt" ? "Switch to English" : "Mudar para Português"
      }
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        background: "#0A0D16",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "8px",
        padding: "7px 12px",
        cursor: "pointer",
        color: "#8B949E",
        fontSize: "11px",
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 700,
        letterSpacing: "0.5px",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "#00D4AA";
        e.currentTarget.style.borderColor = "rgba(0,212,170,0.3)";
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,212,170,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "#8B949E";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.4)";
      }}
    >
      🌐 {i18n.language === "pt" ? "EN" : "PT"}
    </button>
  );
}
