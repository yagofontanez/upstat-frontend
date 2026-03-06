import { api } from "./api";

export interface Monitor {
  id: string;
  name: string;
  url: string;
  status: "up" | "down" | "pending";
  is_active: boolean;
  uptime_7d: string | null;
  last_ping: {
    status: string;
    latency_ms: number;
    checked_at: string;
  } | null;
  ssl_days_remaining: number | null;
  ssl_valid_until: string | null;
  keyword: string | null;
  dns_valid: boolean | null;
  dns_checked_at: string | null;
  monitor_type: "http" | "tcp";
  tcp_port: number | null;
}

export async function getMonitors() {
  const res = await api.get("/monitors");
  return res.data.monitors;
}

export async function createMonitor(data: {
  name: string;
  url: string;
  keyword?: string;
  monitor_type?: "http" | "tcp";
  tcp_port?: number;
  sla_target?: number;
}) {
  const res = await api.post("/monitors", data);
  return res.data.monitor as Monitor;
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
