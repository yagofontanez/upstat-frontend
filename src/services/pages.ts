import { api } from "./api";

export async function getMyPage() {
  const res = await api.get("/page");
  return res.data.page;
}

export async function updatePage(data: {
  title?: string;
  description?: string;
  slug?: string;
  monitor_ids?: string[];
}) {
  const res = await api.put("/page", data);
  return res.data.page;
}
