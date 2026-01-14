import { Schema, model } from "mongoose";

const SettingsSchema = new Schema(
  {
    slowThresholdMs: { type: Number, default: 2000 },
    uiRefreshSec: { type: Number, default: 30 },
  },
  { timestamps: true }
);

export const SettingsModel = model("Settings", SettingsSchema);
