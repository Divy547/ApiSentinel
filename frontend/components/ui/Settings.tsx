"use client";

import { useEffect, useState } from "react";
import { Clock, Activity } from "lucide-react";
import { useSettings } from "@/context/SettingsProvider";

export default function Settings() {
  const { settings, update, loading } = useSettings();

  // local UI state
  const [refreshRate, setRefreshRate] = useState<string>("60"); // seconds string
  const [slowThreshold, setSlowThreshold] = useState<string>("2000"); // ms string

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // initialize local state from context settings once loaded
  useEffect(() => {
    if (!loading) {
      setRefreshRate(String(settings.uiRefreshSec));
      setSlowThreshold(String(settings.slowThresholdMs));
    }
  }, [loading, settings.uiRefreshSec, settings.slowThresholdMs]);

  async function handleSave() {
    setMsg(null);

    const uiRefreshSec = Number(refreshRate);
    const slowThresholdMs = Number(slowThreshold);

    // validation
    if (Number.isNaN(uiRefreshSec) || uiRefreshSec < 5) {
      setMsg("❌ Refresh rate must be at least 5 seconds.");
      return;
    }
    if (Number.isNaN(slowThresholdMs) || slowThresholdMs < 100) {
      setMsg("❌ Slow threshold must be at least 100ms.");
      return;
    }

    setSaving(true);
    try {
      await update({ uiRefreshSec, slowThresholdMs });
      setMsg("✅ Settings saved successfully!");
      setTimeout(() => setMsg(null), 2500);
    } catch (e) {
      console.error("Failed to save settings", e);
      setMsg("❌ Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-gray-600">Loading settings...</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your preferences and configurations</p>
      </div>

      {msg && (
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 text-sm">
          {msg}
        </div>
      )}

      {/* Settings Cards */}
      <div className="space-y-4">
        {/* Dashboard Refresh Rate */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                Dashboard Refresh Rate
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                How often the dashboard should update (in seconds)
              </p>

              <select
                value={refreshRate}
                onChange={(e) => setRefreshRate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
              >
                <option value="10">10 seconds</option>
                <option value="30">30 seconds</option>
                <option value="60">1 minute</option>
                <option value="120">2 minutes</option>
                <option value="300">5 minutes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Slow Threshold */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <Activity className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                Slow API Threshold
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                APIs slower than this will be marked as <b>Slow</b>
              </p>

              <input
                type="number"
                value={slowThreshold}
                onChange={(e) => setSlowThreshold(e.target.value)}
                className="w-full md:w-72 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                min={100}
                step={100}
              />

              <p className="text-xs text-gray-500 mt-2">
                Default: 2000ms. Example: set 500ms for stricter monitoring.
              </p>
            </div>
          </div>
        </div>

        {/* Monitoring Frequency (display only) */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <Activity className="w-5 h-5 text-indigo-600" />
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                Monitoring Frequency
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                How often APIs are checked for health
              </p>

              <div className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">
                  Every 1 minute
                </span>
                <span className="text-xs text-gray-500">(Fixed)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
