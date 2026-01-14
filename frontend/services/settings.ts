import { apiClient } from "./apiClient";
import type { AppSettings } from "@/types/settings.type";

export async function getSettings(): Promise<AppSettings> {
  const res = await apiClient.get("/api/settings");
  return res.data;
}

export async function saveSettings(payload: Partial<AppSettings>): Promise<AppSettings> {
  const res = await apiClient.put("/api/settings", payload);
  return res.data;
}

export async function updateSettings(payload: any) {
  return (await apiClient.put("/api/settings", payload)).data;
}
