interface MethodBadgeProps {
  method: string;
}

export default function MethodBadge({ method }: MethodBadgeProps) {
  const colors = {
    GET: 'bg-blue-100 text-blue-700',
    POST: 'bg-green-100 text-green-700',
    PUT: 'bg-amber-100 text-amber-700',
    DELETE: 'bg-red-100 text-red-700',
    PATCH: 'bg-purple-100 text-purple-700',
  };

  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
        colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-700'
      }`}
    >
      {method}
    </span>
  );
}
