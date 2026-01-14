"use client";
import { useCallback, useState } from "react";
import type { ToastItem, ToastType } from "@/components/ui/Toast";

export function useToast() {
  const [toast, setToast] = useState<ToastItem | null>(null);

  const show = useCallback((type: ToastType, message: string) => {
    setToast({ id: crypto.randomUUID(), type, message });
  }, []);

  const close = useCallback(() => setToast(null), []);

  return { toast, show, close };
}
