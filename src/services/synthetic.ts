import { api } from "./api";

export interface SyntheticStep {
  order_index: number;
  action: "navigate" | "click" | "fill" | "waitFor" | "assertText";
  selector?: string;
  value?: string;
}

export interface SyntheticMonitor {
  id: string;
  name: string;
  is_active: boolean;
  interval_minutes: number;
  last_status: "pass" | "fail" | null;
  last_checked_at: string | null;
  steps?: SyntheticStep[];
  results?: SyntheticResult[];
}

export interface SyntheticResult {
  id: string;
  status: "pass" | "fail";
  failed_step_index: number | null;
  failed_step_action: string | null;
  error_message: string | null;
  screenshot_url: string | null;
  duration_ms: number;
  checked_at: string;
}

export async function getSyntheticMonitors(): Promise<SyntheticMonitor[]> {
  const { data } = await api.get("/synthetic");
  return data;
}

export async function getSyntheticMonitor(
  id: string,
): Promise<SyntheticMonitor> {
  const { data } = await api.get(`/synthetic/${id}`);
  return data;
}

export async function createSyntheticMonitor(payload: {
  name: string;
  interval_minutes: number;
  steps: SyntheticStep[];
}): Promise<SyntheticMonitor> {
  const { data } = await api.post("/synthetic", payload);
  return data;
}

export async function deleteSyntheticMonitor(id: string): Promise<void> {
  await api.delete(`/synthetic/${id}`);
}

export async function runSyntheticNow(
  id: string,
): Promise<{
  status: string;
  duration: number;
  failedStepIndex: number | null;
  errorMessage: string | null;
}> {
  const { data } = await api.post(`/synthetic/${id}/run`);
  return data;
}
