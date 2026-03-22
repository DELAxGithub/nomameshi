const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;

const store = new Map<string, { count: number; resetTime: number }>();

function cleanup() {
  const now = Date.now();
  for (const [key, value] of store) {
    if (now > value.resetTime) {
      store.delete(key);
    }
  }
}

function getIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

export function checkRateLimit(request: Request): {
  allowed: boolean;
  remaining: number;
} {
  // Clean up expired entries periodically
  if (store.size > 1000) cleanup();

  const ip = getIP(request);
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetTime) {
    store.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  entry.count++;
  if (entry.count > MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: MAX_REQUESTS - entry.count };
}
