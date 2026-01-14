const BLOCKED_HEADERS = [
  'host',
  'content-length',
  'connection'
];

export function sanitizeHeaders(
  headers?: Record<string, string>
): Record<string, string> {
  if (!headers) return {};

  const sanitized: Record<string, string> = {};

  for (const key of Object.keys(headers)) {
    if (!BLOCKED_HEADERS.includes(key.toLowerCase())) {
      sanitized[key] = headers[key]!;
    }
  }

  return sanitized;
}
