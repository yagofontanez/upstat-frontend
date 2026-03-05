import { useEffect, useState } from "react";
import { Trash2, Plus, Clock, ExternalLink, RefreshCw } from "lucide-react";
import {
  getMonitors,
  createMonitor,
  deleteMonitor,
  toggleMonitor,
  type Monitor,
  pingNow,
} from "../services/monitors";
import { useNavigate } from "react-router-dom";

export function MonitorsPage() {
  const navigate = useNavigate();

  const [pinging, setPinging] = useState<string | null>(null);
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshed, setRefreshed] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getMonitors()
      .then(setMonitors)
      .finally(() => setLoading(false));
  }, []);

  async function handlePingNow(id: string) {
    setPinging(id);
    try {
      await pingNow(id);
      const data = await getMonitors();
      setMonitors(data);
    } finally {
      setPinging(null);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const data = await getMonitors();
      setMonitors(data);
      setRefreshed(true);
      setTimeout(() => setRefreshed(false), 3000);
    } finally {
      setRefreshing(false);
    }
  }

  async function handleToggle(id: string, currentState: boolean) {
    await toggleMonitor(id);
    setMonitors((prev) =>
      prev.map((m) => (m.id === id ? { ...m, is_active: !currentState } : m)),
    );
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCreating(true);
    try {
      const monitor = await createMonitor({ name, url });
      setMonitors((prev) => [...prev, monitor]);
      setName("");
      setUrl("");
      setShowForm(false);
    } catch (err) {
      setError("Erro ao criar monitor");
      console.log("Erro ao criar monitor: ", err);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja remover este monitor?")) return;
    await deleteMonitor(id);
    setMonitors((prev) => prev.filter((m) => m.id !== id));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#00D4AA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-white text-2xl font-bold">Monitores</h2>
          <p className="text-gray-500 text-sm mt-1">
            Gerencie os seus serviços monitorados
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`flex items-center gap-2 border px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 ${
              refreshed
                ? "text-[#00D4AA] border-[#00D4AA]/30"
                : "text-gray-400 hover:text-white border-white/10 hover:border-white/20"
            }`}
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            {refreshed ? "Atualizado!" : "Atualizar"}
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-[#00D4AA] hover:bg-[#00bfa0] text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <Plus size={16} />
            Novo monitor
          </button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-[#111827] rounded-xl border border-[#00D4AA]/30 p-6 mb-6"
        >
          <h3 className="text-white font-semibold mb-4">Novo monitor</h3>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0A0E1A] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00D4AA] transition-colors"
                placeholder="Minha API"
                required
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-[#0A0E1A] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00D4AA] transition-colors"
                placeholder="https://minha-api.com/health"
                required
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={creating}
              className="bg-[#00D4AA] hover:bg-[#00bfa0] text-black font-semibold px-5 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {creating ? "Criando..." : "Criar monitor"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-white px-5 py-2 rounded-lg text-sm transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="bg-[#111827] rounded-xl border border-white/10">
        {monitors.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-sm">Nenhum monitor ainda.</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-[#00D4AA] text-sm hover:underline mt-2 inline-block"
            >
              Criar primeiro monitor →
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {monitors.map((monitor) => (
              <div
                key={monitor.id}
                className="flex items-center justify-between p-5"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      monitor.status === "up"
                        ? "bg-green-400"
                        : monitor.status === "down"
                          ? "bg-red-400"
                          : "bg-yellow-400"
                    }`}
                  />
                  <div>
                    <p className="text-white text-sm font-medium">
                      {monitor.name}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <p className="text-gray-500 text-xs">{monitor.url}</p>
                      <a
                        href={monitor.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-600 hover:text-gray-400 transition-colors"
                      >
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {monitor.last_ping && (
                    <div className="flex items-center gap-1 text-gray-500 text-xs">
                      <Clock size={12} />
                      {monitor.last_ping.latency_ms}ms
                    </div>
                  )}
                  {monitor.uptime_7d && (
                    <div className="text-xs text-right">
                      <span className="text-gray-500">uptime 7d </span>
                      <span className="text-white font-medium">
                        {monitor.uptime_7d}%
                      </span>
                    </div>
                  )}
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      monitor.status === "up"
                        ? "bg-green-400/10 text-green-400"
                        : monitor.status === "down"
                          ? "bg-red-400/10 text-red-400"
                          : "bg-yellow-400/10 text-yellow-400"
                    }`}
                  >
                    {monitor.status === "up"
                      ? "Online"
                      : monitor.status === "down"
                        ? "Offline"
                        : "Pendente"}
                  </span>
                  <button
                    onClick={() => handlePingNow(monitor.id)}
                    disabled={pinging === monitor.id}
                    className="text-xs text-gray-500 hover:text-[#00D4AA] transition-colors disabled:opacity-50"
                  >
                    {pinging === monitor.id ? "Verificando..." : "Testar agora"}
                  </button>
                  <button
                    onClick={() => handleToggle(monitor.id, monitor.is_active)}
                    className={`text-xs transition-colors ${
                      monitor.is_active
                        ? "text-gray-500 hover:text-yellow-400"
                        : "text-yellow-400 hover:text-yellow-300"
                    }`}
                  >
                    {monitor.is_active ? "Pausar" : "Reativar"}
                  </button>
                  <button
                    onClick={() => navigate(`/monitors/${monitor.id}`)}
                    className="text-gray-500 hover:text-[#00D4AA] text-xs transition-colors"
                  >
                    Ver detalhes
                  </button>
                  <button
                    onClick={() => handleDelete(monitor.id)}
                    className="text-gray-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
