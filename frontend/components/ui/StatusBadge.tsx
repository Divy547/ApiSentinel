interface StatusBadgeProps {
  status: "healthy" | "slow" | "down" | "unknown" | string;
  /** Optional: show threshold in slow label e.g. Slow (>2000ms) */
  slowThresholdMs?: number;
}

export default function StatusBadge({ status, slowThresholdMs }: StatusBadgeProps) {
  const config = {
    healthy: { color: "bg-green-100 text-green-700", label: "Healthy" },
    slow: {
      color: "bg-amber-100 text-amber-700",
      label: slowThresholdMs ? `Slow (>${slowThresholdMs}ms)` : "Slow",
    },
    down: { color: "bg-red-100 text-red-700", label: "Down" },
    unknown: { color: "bg-gray-100 text-gray-700", label: "Unknown" },
  };

  const fallback = config.unknown;
  const { color, label } = config[status as keyof typeof config] || fallback;

  const dot =
    status === "healthy"
      ? "bg-green-500"
      : status === "slow"
      ? "bg-amber-500"
      : status === "down"
      ? "bg-red-500"
      : "bg-gray-500";

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded ${color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
