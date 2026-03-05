import { api } from "./api";

export interface Monitor {
  id: string;
  name: string;
  url: string;
  status: "pending" | "up" | "down" | "degraded";
  interval_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_ping: {
    status: string;
    latency_ms: number;
    checked_at: string;
  } | null;
  uptime_7d: string | null;
}

export async function getMonitors() {
  const res = await api.get("/monitors");
  return res.data.monitors;
}

export async function createMonitor(data: { name: string; url: string }) {
  const res = await api.post("/monitors", data);
  return res.data.monitor;
}

export async function deleteMonitor(id: string) {
  await api.delete(`/monitors/${id}`);
}

export async function toggleMonitor(id: string) {
  const res = await api.patch(`/monitors/${id}/toggle`);
  return res.data as { is_active: boolean };
}

export async function pingNow(id: string) {
  const res = await api.post(`/monitors/${id}/ping`);
  return res.data as {
    status: string;
    status_code: number | null;
    latency_ms: number | null;
  };
}
