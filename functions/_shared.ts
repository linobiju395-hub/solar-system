export interface PagesContext {
  request: Request;
  env: Record<string, string | undefined>;
  params?: Record<string, string | undefined>;
  next?: unknown;
  functionPath?: string;
  waitUntil?: (promise: Promise<unknown>) => void;
}

export function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=60, s-maxage=300',
      ...extraHeaders,
    },
  });
}

export function proxyUrl(url: string): string {
  return `/api/space/image?url=${encodeURIComponent(url)}`;
}

export function withProxy(url: unknown): string {
  if (typeof url !== 'string' || !url) return '';
  return url.startsWith('https://') ? proxyUrl(url) : url;
}

export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = 8000,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export async function safeJson<T = unknown>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export function isAllowedImageHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    host === 'nasa.gov' ||
    host.endsWith('.nasa.gov') ||
    host === 'stsci.edu' ||
    host.endsWith('.stsci.edu')
  );
}
