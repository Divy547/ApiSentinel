import * as cron from "node-cron";
import { ApiConfigModel } from "../models/apiConfig.models.ts";
import { ApiMonitorLogModel } from "../models/apiMonitorLog.model.ts";
import { executeApiTest } from "./apiExecuter.ts";

let task: cron.ScheduledTask | null = null;
let isRunning = false;

export function startApiMonitoringService() {
  if (task) {
    console.warn("⚠️ Monitoring already started");
    return;
  }

  console.log("🟢 Starting API monitoring service");

  task = cron.schedule("* * * * *", async () => {
    if (isRunning) {
      console.warn("⚠️ Previous monitoring cycle still running. Skipping...");
      return;
    }

    isRunning = true;
    console.log("⏱ Cron triggered at", new Date().toISOString());

    try {
      const apiConfigs = await ApiConfigModel.find();
      console.log("📦 API configs found:", apiConfigs.length);

      const results = await Promise.allSettled(
        apiConfigs.map(async (config) => {
          try {
            const result = await executeApiTest({
              method: config.method,
              url: config.url,
              headers: Object.fromEntries(config.headers || []),
              queryParams: Object.fromEntries(config.queryParams || []),
              body: config.body,
            });

            const statusCode = result.statusCode;

            // ✅ Correct rule: 200–499 is UP, 5xx / null is DOWN
            const isUp =
              typeof statusCode === "number" &&
              statusCode >= 200 &&
              statusCode < 500;

            await ApiMonitorLogModel.create({
              apiConfigId: config._id,
              isUp,
              statusCode,
              responseTime: result.responseTime, // ✅ use executor timing
              error: result.error?.message || null,
              checkedAt: new Date(),
            });

            console.log(
              `✅ ${config.name} | ${statusCode} | up=${isUp} | ${result.responseTime}ms`
            );
          } catch (err: any) {
            await ApiMonitorLogModel.create({
              apiConfigId: config._id,
              isUp: false,
              statusCode: null,
              responseTime: undefined,
              error: err.message || "Unknown error",
              checkedAt: new Date(),
            });

            console.log(`❌ ${config.name} | ERROR: ${err.message}`);
          }
        })
      );

      const rejected = results.filter((r) => r.status === "rejected").length;
      if (rejected > 0) console.warn(`⚠️ ${rejected} monitoring tasks rejected`);

      console.log("✅ Monitoring cycle finished");
    } catch (err) {
      console.error("🔥 Monitoring cycle failed:", err);
    } finally {
      isRunning = false;
    }
  });

  task.start();
}
