"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AppSettings } from "@/types/settings.type";
import { getSettings, saveSettings } from "@/services/settings";

type SettingsContextValue = {
  settings: AppSettings;
  loading: boolean;
  refresh: () => Promise<void>;
  update: (patch: Partial<AppSettings>) => Promise<void>;
};

const defaultSettings: AppSettings = {
  slowThresholdMs: 2000,
  uiRefreshSec: 60,
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  // Load settings from backend
  const refresh = async () => {
    setLoading(true);
    try {
      const data = await getSettings();
      setSettings({
        slowThresholdMs: data.slowThresholdMs ?? 2000,
        uiRefreshSec: data.uiRefreshSec ?? 60,
      });
    } finally {
      setLoading(false);
    }
  };

  // Update settings on backend + sync local state
  const update = async (patch: Partial<AppSettings>) => {
    const next = await saveSettings(patch);
    setSettings({
      slowThresholdMs: next.slowThresholdMs ?? settings.slowThresholdMs,
      uiRefreshSec: next.uiRefreshSec ?? settings.uiRefreshSec,
    });
  };

  useEffect(() => {
    refresh();
  }, []);

  const value = useMemo(
    () => ({
      settings,
      loading,
      refresh,
      update,
    }),
    [settings, loading]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside <SettingsProvider>");
  return ctx;
}
