/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Activity } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { getMonitors, type Monitor } from "../services/monitors";
import {
  getMonitorPings,
  getMonitorIncidents,
  type Ping,
  type Incident,
} from "../services/monitorDetails";
import { useAuth } from "../hooks/useAuth";

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

// Uptime heatmap — agrupa pings por dia
function buildHeatmap(pings: Ping[]) {
  const days: Record<string, { total: number; up: number }> = {};

  pings.forEach((ping) => {
    const day = new Date(ping.checked_at).toISOString().split("T")[0];
    if (!days[day]) days[day] = { total: 0, up: 0 };
    days[day].total++;
    if (ping.status === "up") days[day].up++;
  });

  return Object.entries(days)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, { total, up }]) => ({
      day,
      uptime: total > 0 ? Math.round((up / total) * 100) : 0,
    }));
}

// Latency chart — últimos 50 pings
function buildLatencyChart(pings: Ping[]) {
  return pings
    .filter((p) => p.latency_ms !== null && p.status === "up")
    .slice(0, 50)
    .reverse()
    .map((p) => ({
      time: new Date(p.checked_at).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      latency: p.latency_ms,
    }));
}

export function MonitorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [monitor, setMonitor] = useState<Monitor | null>(null);
  const [pings, setPings] = useState<Ping[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [uptimePercent, setUptimePercent] = useState<string | null>(null);
  const [avgLatency, setAvgLatency] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    Promise.all([getMonitors(), getMonitorPings(id), getMonitorIncidents(id)])
      .then(([monitors, pingsData, incidentsData]) => {
        const found = monitors.find((m: Monitor) => m.id === id);
        if (!found) {
          navigate("/monitors");
          return;
        }
        setMonitor(found);
        setPings(pingsData.pings);
        setUptimePercent(pingsData.uptime_percent);
        setAvgLatency(pingsData.avg_latency_ms);
        setIncidents(incidentsData);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#00D4AA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!monitor) return null;

  const heatmap = buildHeatmap(pings);
  const latencyChart = buildLatencyChart(pings);

  return (
    <div>
      <button
        onClick={() => navigate("/monitors")}
        className="flex items-center gap-2 text-gray-500 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Voltar
      </button>

      <div className="flex items-center gap-3 mb-8">
        <div
          className={`w-3 h-3 rounded-full ${
            monitor.status === "up"
              ? "bg-green-400"
              : monitor.status === "down"
                ? "bg-red-400"
                : "bg-yellow-400"
          }`}
        />
        <div>
          <h2 className="text-white text-2xl font-bold">{monitor.name}</h2>
          <p className="text-gray-500 text-sm">{monitor.url}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-[#111827] rounded-xl p-5 border border-white/10">
          <p className="text-gray-500 text-xs mb-1 uppercase tracking-wide">
            Status
          </p>
          <p
            className={`text-lg font-bold ${
              monitor.status === "up"
                ? "text-green-400"
                : monitor.status === "down"
                  ? "text-red-400"
                  : "text-yellow-400"
            }`}
          >
            {monitor.status === "up"
              ? "Online"
              : monitor.status === "down"
                ? "Offline"
                : "Pendente"}
          </p>
        </div>
        <div className="bg-[#111827] rounded-xl p-5 border border-white/10">
          <p className="text-gray-500 text-xs mb-1 uppercase tracking-wide">
            Uptime
          </p>
          <p className="text-lg font-bold text-white">
            {uptimePercent ?? "—"}%
          </p>
        </div>
        <div className="bg-[#111827] rounded-xl p-5 border border-white/10">
          <div className="flex items-center gap-1 text-gray-500 text-xs mb-1 uppercase tracking-wide">
            <Clock size={11} />
            Latência média
          </div>
          <p className="text-lg font-bold text-white">{avgLatency ?? "—"}ms</p>
        </div>
        <div className="bg-[#111827] rounded-xl p-5 border border-white/10">
          <p className="text-gray-500 text-xs mb-1 uppercase tracking-wide">
            SSL
          </p>
          {monitor.ssl_days_remaining === null ? (
            <p className="text-lg font-bold text-gray-600">—</p>
          ) : monitor.ssl_days_remaining <= 7 ? (
            <p className="text-lg font-bold text-red-400">
              {monitor.ssl_days_remaining}d restantes
            </p>
          ) : monitor.ssl_days_remaining <= 30 ? (
            <p className="text-lg font-bold text-yellow-400">
              {monitor.ssl_days_remaining}d restantes
            </p>
          ) : (
            <p className="text-lg font-bold text-green-400">
              {monitor.ssl_days_remaining}d restantes
            </p>
          )}
        </div>
      </div>

      <div className="bg-[#111827] rounded-xl border border-white/10 p-6 mb-6">
        <h3 className="text-white font-semibold mb-4">Uptime por dia</h3>
        {heatmap.length === 0 ? (
          <p className="text-gray-600 text-sm">Sem dados ainda.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {heatmap.map(({ day, uptime }) => (
              <div
                key={day}
                title={`${day}: ${uptime}%`}
                className="w-8 h-8 rounded flex items-center justify-center text-xs font-medium cursor-default"
                style={{
                  background:
                    uptime === 100
                      ? "#16a34a33"
                      : uptime >= 90
                        ? "#f59e0b33"
                        : "#ef444433",
                  color:
                    uptime === 100
                      ? "#4ade80"
                      : uptime >= 90
                        ? "#fbbf24"
                        : "#f87171",
                }}
              >
                {uptime}
              </div>
            ))}
          </div>
        )}
        <p className="text-gray-600 text-xs mt-3">
          Passe o mouse sobre cada dia para ver o detalhe
        </p>
      </div>

      <div className="bg-[#111827] rounded-xl border border-white/10 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">
            Latência ao longo do tempo
          </h3>
          {user?.plan !== "pro" && (
            <span className="text-xs bg-yellow-400/10 text-yellow-400 px-2 py-1 rounded-full">
              Pro
            </span>
          )}
        </div>
        {user?.plan !== "pro" ? (
          <div className="h-40 flex items-center justify-center border border-dashed border-white/10 rounded-lg">
            <div className="text-center">
              <Activity size={24} className="text-gray-600 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">Disponível no plano Pro</p>
            </div>
          </div>
        ) : latencyChart.length === 0 ? (
          <p className="text-gray-600 text-sm">Sem dados ainda.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={latencyChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="time" tick={{ fill: "#6b7280", fontSize: 11 }} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} unit="ms" />
              <Tooltip
                contentStyle={{
                  background: "#1f2937",
                  border: "1px solid #ffffff15",
                  borderRadius: 8,
                }}
                labelStyle={{ color: "#9ca3af" }}
                itemStyle={{ color: "#00D4AA" }}
              />
              <Line
                type="monotone"
                dataKey="latency"
                stroke="#00D4AA"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-[#111827] rounded-xl border border-white/10">
        <div className="p-5 border-b border-white/10">
          <h3 className="text-white font-semibold">Histórico de incidentes</h3>
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
              <div
                key={incident.id}
                className="flex items-center justify-between p-5"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${incident.resolved_at ? "bg-green-400" : "bg-red-400"}`}
                    />
                    <span className="text-white text-sm font-medium">
                      {incident.resolved_at ? "Resolvido" : "Em andamento"}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs">
                    Iniciou {timeAgo(incident.started_at)}
                  </p>
                </div>
                {incident.duration_ms && (
                  <span className="text-gray-400 text-sm">
                    {formatDuration(incident.duration_ms)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
