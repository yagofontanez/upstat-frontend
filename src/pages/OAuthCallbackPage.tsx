/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OAuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const error = params.get("error");

    if (token) {
      localStorage.setItem("token", token);
      navigate("/dashboard", { replace: true });
    } else if (window.location.pathname === "/oauth/callback") {
      navigate("/login?error=" + (error ?? "oauth"), { replace: true });
    }
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontFamily: "'JetBrains Mono', monospace",
        color: "#555",
        fontSize: "13px",
      }}
    >
      Autenticando...
    </div>
  );
}
