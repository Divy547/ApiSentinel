import { Router } from "express";
import { getMonitorLogs } from "../controllers/apiMonitorLog.controller.ts";

const router = Router();

// GET /api/monitor/logs?apiConfigId=...&limit=50
router.get("/logs", getMonitorLogs);

export default router;
