import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

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
    } catch (err) {
      setError("Erro ao fazer login");
      console.log("Erro ao fazer login: ", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#00D4AA]">● UpStat</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Monitoramento simples e direto
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#111827] rounded-xl p-8 border border-white/10"
        >
          <h2 className="text-white font-semibold text-lg mb-6">Entrar</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 mb-4">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="text-gray-400 text-sm mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0A0E1A] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00D4AA] transition-colors"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="mb-6">
            <label className="text-gray-400 text-sm mb-1 block">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0A0E1A] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00D4AA] transition-colors"
              placeholder="••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00D4AA] hover:bg-[#00bfa0] text-black font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <p className="text-gray-500 text-sm text-center mt-4">
            Não tem conta?{" "}
            <Link to="/register" className="text-[#00D4AA] hover:underline">
              Cadastre-se
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
