import { ApiMonitorLogModel } from "../models/apiMonitorLog.model.js";

export async function getMonitorLogs(req: any, res: any) {
  const { apiConfigId, limit = 50 } = req.query;

  if (!apiConfigId) {
    return res.status(400).json({ message: "apiConfigId is required" });
  }

  const logs = await ApiMonitorLogModel.find({ apiConfigId })
    .sort({ checkedAt: -1 })
    .limit(Number(limit));

  res.json(logs);
}
