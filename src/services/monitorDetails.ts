import { api } from "./api";

export interface Ping {
  id: string;
  monitor_id: string;
  status: "up" | "down" | "timeout";
  status_code: number | null;
  latency_ms: number | null;
  checked_at: string;
}

export interface Incident {
  id: string;
  monitor_id: string;
  started_at: string;
  resolved_at: string | null;
  duration_ms: number | null;
}

export async function getMonitorPings(id: string) {
  const res = await api.get(`/monitors/${id}/pings`);
  return res.data as {
    pings: Ping[];
    uptime_percent: string | null;
    avg_latency_ms: number | null;
  };
}

export async function getMonitorIncidents(id: string) {
  const res = await api.get(`/monitors/${id}/incidents`);
  return res.data.incidents as Incident[];
}
