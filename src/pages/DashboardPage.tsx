import { useEffect, useState } from "react";
import { Activity, ArrowUp, ArrowDown, Clock } from "lucide-react";
import { getMonitors, type Monitor } from "../services/monitors";
import { Link } from "react-router-dom";

export function DashboardPage() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMonitors()
      .then(setMonitors)
      .finally(() => setLoading(false));
  }, []);

  const total = monitors.length;
  const up = monitors.filter((m) => m.status === "up").length;
  const down = monitors.filter((m) => m.status === "down").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#00D4AA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-white text-2xl font-bold">Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">
          Visão geral dos seus monitores
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#111827] rounded-xl p-5 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <Activity size={16} className="text-gray-500" />
            <span className="text-gray-500 text-sm">Total</span>
          </div>
          <p className="text-white text-3xl font-bold">{total}</p>
        </div>
        <div className="bg-[#111827] rounded-xl p-5 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <ArrowUp size={16} className="text-green-400" />
            <span className="text-gray-500 text-sm">Online</span>
          </div>
          <p className="text-green-400 text-3xl font-bold">{up}</p>
        </div>
        <div className="bg-[#111827] rounded-xl p-5 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <ArrowDown size={16} className="text-red-400" />
            <span className="text-gray-500 text-sm">Offline</span>
          </div>
          <p className="text-red-400 text-3xl font-bold">{down}</p>
        </div>
      </div>

      <div className="bg-[#111827] rounded-xl border border-white/10">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h3 className="text-white font-semibold">Monitores</h3>
          <Link
            to="/monitors"
            className="text-[#00D4AA] text-sm hover:underline"
          >
            Ver todos
          </Link>
        </div>

        {monitors.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 text-sm">
              Nenhum monitor cadastrado ainda.
            </p>
            <Link
              to="/monitors"
              className="text-[#00D4AA] text-sm hover:underline mt-2 inline-block"
            >
              Criar primeiro monitor →
            </Link>
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
                    <p className="text-gray-500 text-xs">{monitor.url}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-right">
                  {monitor.last_ping && (
                    <div className="flex items-center gap-1 text-gray-500 text-xs">
                      <Clock size={12} />
                      {monitor.last_ping.latency_ms}ms
                    </div>
                  )}
                  {monitor.uptime_7d && (
                    <div className="text-xs">
                      <span className="text-gray-500">7d </span>
                      <span className="text-white font-medium">
                        {monitor.uptime_7d}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
