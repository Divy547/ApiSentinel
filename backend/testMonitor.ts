import axios from "axios";

const BASE = "http://localhost:3001";

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log("1) Fetching configs...");
  const configsRes = await axios.get(`${BASE}/api/configs`);
  const configs = configsRes.data;

  if (!configs.length) {
    console.log("❌ No API configs found. Add one API first.");
    return;
  }

  const api = configs[0];
  console.log("✅ Using API:", api.name, api._id);

  console.log("2) Waiting 70 seconds for cron to run at least once...");
  await sleep(70_000);

  console.log("3) Fetching last 5 monitor logs...");
  const logsRes = await axios.get(`${BASE}/api/monitor/logs`, {
    params: { apiConfigId: api._id, limit: 5 },
  });

  const logs = logsRes.data;

  if (!logs.length) {
    console.log("❌ No logs found yet. Wait 1 more minute and rerun.");
    return;
  }

  console.log("\n✅ Logs:");
  for (const log of logs) {
    console.log({
      apiConfigId: log.apiConfigId,
      isUp: log.isUp,
      statusCode: log.statusCode,
      responseTime: log.responseTime,
      checkedAt: log.checkedAt,
      error: log.error || null,
    });
  }

  const bad = logs.find((l: any) => typeof l.responseTime !== "number" || !l.checkedAt);
  if (bad) {
    console.log("\n⚠️ Problem detected:");
    console.log("responseTime should be number AND checkedAt should exist.");
  } else {
    console.log("\n🎉 responseTime + checkedAt are correct!");
  }
}

main().catch((e) => {
  console.error("❌ Test failed:", e?.message || e);
});
