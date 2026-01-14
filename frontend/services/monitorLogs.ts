import { apiClient } from "./apiClient";

export async function getMonitorLogs(apiConfigId: string, limit = 50) {
  const res = await apiClient.get("/api/monitor/logs", {
    params: { apiConfigId, limit },
  });
  return res.data;
}
