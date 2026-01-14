import { SettingsModel } from "../models/settings.models.js";

async function getSingleton() {
  let doc = await SettingsModel.findOne();
  if (!doc) doc = await SettingsModel.create({});
  return doc;
}

export async function getSettings(req: any, res: any) {
  const doc = await getSingleton();
  res.json(doc);
}

export async function updateSettings(req: any, res: any) {
  const doc = await getSingleton();

  const { slowThresholdMs, uiRefreshSec } = req.body;

  if (slowThresholdMs != null) doc.slowThresholdMs = Number(slowThresholdMs);
  if (uiRefreshSec != null) doc.uiRefreshSec = Number(uiRefreshSec);

  await doc.save();
  res.json(doc);
}
