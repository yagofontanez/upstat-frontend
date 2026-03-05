import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../services/api";
import { CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react";
import { UptimeBar } from "../components/UptimeBar";

interface MonitorPublic {
  id: string;
  name: string;
  url: string;
  status: "up" | "down" | "degraded" | "pending";
  uptime_percent: string | null;
  last_ping: {
    status: string;
    latency_ms: number;
    checked_at: string;
  } | null;
}

interface Incident {
  id: string;
  monitor_name: string;
  started_at: string;
  resolved_at: string | null;
  duration_ms: number | null;
}

interface PageData {
  page: {
    title: string;
    description: string | null;
    slug: string;
  };
  overall_status: "operational" | "degraded" | "down";
  monitors: MonitorPublic[];
  incidents: Incident[];
}

interface DayData {
  day: string;
  total: number;
  up: number;
}

interface MonitorPublic {
  id: string;
  name: string;
  url: string;
  status: "up" | "down" | "degraded" | "pending";
  uptime_percent: string | null;
  uptime_history: DayData[] | null;
  last_ping: {
    status: string;
    latency_ms: number;
    checked_at: string;
  } | null;
}

function formatDuration(ms: number) {
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}min`;
  return `${Math.floor(hours / 24)}d ${hours % 24}h`;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes}min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  return `${Math.floor(hours / 24)}d atrás`;
}

export function StatusPage() {
  const { slug } = useParams();
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    function fetchData() {
      api
        .get(`/status/${slug}`)
        .then((res) => setData(res.data))
        .catch(() => setNotFound(true))
        .finally(() => setLoading(false));
    }

    fetchData();

    const interval = setInterval(fetchData, 60000);

    return () => clearInterval(interval);
  }, [slug]);

  useEffect(() => {
    if (!data) return;

    const status =
      data.overall_status === "operational"
        ? "✅ Todos os sistemas operacionais"
        : data.overall_status === "degraded"
          ? "⚠️ Desempenho degradado"
          : "🔴 Interrupção em andamento";

    document.title = `${data.page.title} — UpStat`;

    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", status);
    setMeta("og:title", data.page.title, true);
    setMeta("og:description", status, true);

    return () => {
      document.title = "UpStat — Monitoramento de sistemas";
    };
  }, [data]);

  useEffect(() => {
    if (!data) return;

    Promise.resolve().then(() => setCountdown(60));

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return 60;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#00D4AA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-[#111827] border border-white/10 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🔍</span>
          </div>
          <h1 className="text-white text-2xl font-bold mb-2">
            Página não encontrada
          </h1>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Esta status page não existe ou foi removida. Verifique o link e
            tente novamente.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-[#00D4AA] hover:bg-[#00bfa0] text-black font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            Criar minha status page →
          </a>
          <p className="text-gray-700 text-xs mt-8">● UpStat</p>
        </div>
      </div>
    );
  }

  const { page, overall_status, monitors, incidents } = data;

  const statusConfig = {
    operational: {
      label: "Todos os sistemas operacionais",
      icon: CheckCircle,
      color: "text-green-400",
      bg: "bg-green-400/10 border-green-400/20",
    },
    degraded: {
      label: "Desempenho degradado",
      icon: AlertCircle,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10 border-yellow-400/20",
    },
    down: {
      label: "Interrupção em andamento",
      icon: XCircle,
      color: "text-red-400",
      bg: "bg-red-400/10 border-red-400/20",
    },
  };

  const current = statusConfig[overall_status];
  const StatusIcon = current.icon;

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-white text-3xl font-bold mb-2">{page.title}</h1>
          {page.description && (
            <p className="text-gray-500 text-sm">{page.description}</p>
          )}
        </div>

        <div
          className={`flex items-center gap-3 p-4 rounded-xl border mb-8 ${current.bg}`}
        >
          <StatusIcon size={20} className={current.color} />
          <span className={`font-semibold ${current.color}`}>
            {current.label}
          </span>
        </div>

        {monitors.length > 0 && (
          <div className="bg-[#111827] rounded-xl border border-white/10 mb-8">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-white font-semibold text-sm">Serviços</h2>
            </div>
            <div className="divide-y divide-white/5">
              {monitors.map((monitor) => (
                <div key={monitor.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
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
                      <span className="text-white text-sm">{monitor.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      {monitor.last_ping && (
                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                          <Clock size={11} />
                          {monitor.last_ping.latency_ms}ms
                        </div>
                      )}
                      {monitor.uptime_percent && (
                        <span className="text-gray-500 text-xs">
                          {monitor.uptime_percent}% uptime
                        </span>
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
                          ? "Operacional"
                          : monitor.status === "down"
                            ? "Fora do ar"
                            : "Pendente"}
                      </span>
                    </div>
                  </div>
                  <UptimeBar history={monitor.uptime_history || []} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-[#111827] rounded-xl border border-white/10 mb-12">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-white font-semibold text-sm">
              Incidentes recentes
            </h2>
          </div>
          {incidents.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 text-sm">
                Nenhum incidente registrado. 🎉
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {incidents.map((incident) => (
                <div key={incident.id} className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm font-medium">
                      {incident.monitor_name}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        incident.resolved_at
                          ? "bg-green-400/10 text-green-400"
                          : "bg-red-400/10 text-red-400"
                      }`}
                    >
                      {incident.resolved_at ? "Resolvido" : "Em andamento"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>Iniciou {timeAgo(incident.started_at)}</span>
                    {incident.duration_ms && (
                      <span>
                        · Duração: {formatDuration(incident.duration_ms)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-gray-600 text-xs">
            Powered by <span className="text-[#00D4AA]">● UpStat</span>
          </p>
        </div>

        <div className="text-center mt-3">
          <p className="text-gray-700 text-xs">
            Próxima atualização em{" "}
            <span className="text-gray-500">{countdown}s</span>
          </p>
        </div>
      </div>
    </div>
  );
}
