import { useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";

interface UpgradeModalProps {
  onClose: () => void;
}

export function UpgradeModal({ onClose }: UpgradeModalProps) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#111827] border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#00D4AA]/10 border border-[#00D4AA]/20 flex items-center justify-center mx-auto mb-4">
            <Zap size={28} className="text-[#00D4AA]" />
          </div>
          <h3 className="text-white text-xl font-bold mb-2">Limite atingido</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Você atingiu o limite de{" "}
            <span className="text-white font-medium">3 monitores</span> do plano
            Free. Faça upgrade pro plano Pro e monitore quantos sistemas quiser.
          </p>
        </div>

        <div className="bg-[#0A0E1A] rounded-xl border border-[#00D4AA]/20 p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-semibold flex items-center gap-2">
              <Zap size={14} className="text-[#00D4AA]" /> Pro
            </span>
            <span className="text-[#00D4AA] font-bold">R$29/mês</span>
          </div>
          <ul className="space-y-2">
            {[
              "Monitores ilimitados",
              "Ping a cada 1 minuto",
              "Histórico de 90 dias",
              "URL personalizada",
              "Notificação por WhatsApp",
              "Relatório semanal",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-gray-400 text-sm"
              >
                <span className="text-[#00D4AA]">✓</span> {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 text-gray-400 hover:text-white border border-white/10 hover:border-white/20 py-2.5 rounded-lg text-sm transition-colors"
          >
            Agora não
          </button>
          <button
            onClick={() => navigate("/billing")}
            className="flex-1 bg-[#00D4AA] hover:bg-[#00bfa0] text-black font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Zap size={14} /> Fazer upgrade
          </button>
        </div>
      </div>
    </div>
  );
}
