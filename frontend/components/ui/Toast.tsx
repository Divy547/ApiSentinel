"use client";
import { useEffect } from "react";
import { X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export type ToastItem = {
  id: string;
  type: ToastType;
  message: string;
};

export default function Toast({
  toast,
  onClose,
  duration = 2500,
}: {
  toast: ToastItem | null;
  onClose: () => void;
  duration?: number;
}) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => onClose(), duration);
    return () => clearTimeout(t);
  }, [toast, duration, onClose]);

  if (!toast) return null;

  const style =
    toast.type === "success"
      ? "bg-green-50 border-green-200 text-green-800"
      : toast.type === "error"
      ? "bg-red-50 border-red-200 text-red-800"
      : "bg-indigo-50 border-indigo-200 text-indigo-800";

  return (
    <div className="fixed bottom-6 right-6 z-[9999] max-w-sm w-full">
      <div className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg ${style}`}>
        <div className="flex-1 text-sm font-medium">{toast.message}</div>
        <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-lg">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
