import { api } from "./api";

export interface ExternalService {
  id: string;
  name: string;
  slug: string;
  category: string;
  status_url: string;
  website_url: string;
  is_dependency: boolean;
  current_indicator: string | null;
  current_description: string | null;
  status_page_url: string | null;
}

export async function getServices(): Promise<ExternalService[]> {
  const { data } = await api.get("/dependencies/services");
  return data;
}

export async function getMyDependencies(): Promise<ExternalService[]> {
  const { data } = await api.get("/dependencies/my");
  return data;
}

export async function addDependency(serviceId: string): Promise<void> {
  await api.post(`/dependencies/${serviceId}`);
}

export async function removeDependency(serviceId: string): Promise<void> {
  await api.delete(`/dependencies/${serviceId}`);
}
