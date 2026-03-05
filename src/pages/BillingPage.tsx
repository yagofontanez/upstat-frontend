import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";
import { CheckCircle, Zap } from "lucide-react";

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
    } catch (err) {
      setError("Erro ao processar upgrade");
      console.log("Erro ao processar upgrade: ", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-white text-2xl font-bold">Plano</h2>
        <p className="text-gray-500 text-sm mt-1">Gerencie sua assinatura</p>
      </div>

      <div className="grid grid-cols-2 gap-6 max-w-3xl">
        <div
          className={`bg-[#111827] rounded-xl border p-6 ${user?.plan === "free" ? "border-[#00D4AA]/40" : "border-white/10"}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Free</h3>
            {user?.plan === "free" && (
              <span className="text-xs bg-[#00D4AA]/10 text-[#00D4AA] px-2 py-1 rounded-full">
                Plano atual
              </span>
            )}
          </div>
          <p className="text-3xl font-bold text-white mb-6">
            R$0<span className="text-gray-500 text-sm font-normal">/mês</span>
          </p>
          <ul className="space-y-3">
            {[
              "1 monitor",
              "Ping a cada 5 minutos",
              "Histórico de 7 dias",
              "URL aleatória",
              "Notificação por email",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-gray-400 text-sm"
              >
                <CheckCircle size={14} className="text-gray-600 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div
          className={`bg-[#111827] rounded-xl border p-6 ${user?.plan === "pro" ? "border-[#00D4AA]/40" : "border-white/10"}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Zap size={16} className="text-[#00D4AA]" />
              Pro
            </h3>
            {user?.plan === "pro" && (
              <span className="text-xs bg-[#00D4AA]/10 text-[#00D4AA] px-2 py-1 rounded-full">
                Plano atual
              </span>
            )}
          </div>
          <p className="text-3xl font-bold text-white mb-6">
            R$29<span className="text-gray-500 text-sm font-normal">/mês</span>
          </p>
          <ul className="space-y-3 mb-6">
            {[
              "Monitores ilimitados",
              "Ping a cada 1 minuto",
              "Histórico de 90 dias",
              "URL personalizada",
              "Notificação por email",
              "Notificação por WhatsApp",
              "Múltiplos serviços na page",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-gray-400 text-sm"
              >
                <CheckCircle size={14} className="text-[#00D4AA] shrink-0" />
                {item}
              </li>
            ))}
          </ul>

          {user?.plan !== "pro" && (
            <form onSubmit={handleUpgrade}>
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 mb-3">
                  {error}
                </div>
              )}
              {!paid ? (
                <>
                  <div className="mb-3">
                    <input
                      type="text"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      className="w-full bg-[#0A0E1A] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00D4AA] transition-colors"
                      placeholder="CPF ou CNPJ"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#00D4AA] hover:bg-[#00bfa0] text-black font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
                  >
                    {loading ? "Processando..." : "Fazer upgrade →"}
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-gray-400 text-sm">
                    Após concluir o pagamento, clique no botão abaixo para
                    atualizar seu plano.
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      await refreshUser();
                      setPaid(false);
                    }}
                    className="w-full bg-[#00D4AA] hover:bg-[#00bfa0] text-black font-semibold py-2.5 rounded-lg text-sm transition-colors"
                  >
                    Já paguei, atualizar plano
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
