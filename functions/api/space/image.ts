import { isAllowedImageHost, type PagesContext } from '../../_shared';

export async function onRequestGet(context: PagesContext) {
  const requestUrl = new URL(context.request.url);
  const target = requestUrl.searchParams.get('url');

  if (!target) return new Response('Missing url', { status: 400 });

  let targetUrl: URL;
  try {
    targetUrl = new URL(target);
  } catch {
    return new Response('Invalid url', { status: 400 });
  }

  if (targetUrl.protocol !== 'https:' || !isAllowedImageHost(targetUrl.hostname)) {
    return new Response('Image host is not allowed', { status: 403 });
  }

  try {
    const upstream = await fetch(targetUrl.toString(), {
      headers: { 'User-Agent': 'AetherCosmos/Cloudflare-Pages' },
    });

    if (!upstream.ok || !upstream.body) {
      return new Response('Upstream image unavailable', { status: upstream.status || 502 });
    }

    const headers = new Headers();
    const contentType = upstream.headers.get('content-type');
    if (contentType) headers.set('Content-Type', contentType);
    else headers.set('Content-Type', 'image/jpeg');
    headers.set('Cache-Control', 'public, max-age=86400, s-maxage=604800, immutable');
    headers.set('Access-Control-Allow-Origin', '*');

    const contentLength = upstream.headers.get('content-length');
    if (contentLength) headers.set('Content-Length', contentLength);

    return new Response(upstream.body, { status: 200, headers });
  } catch (error) {
    console.error('Image proxy failed:', error);
    return new Response('Failed to proxy image', { status: 502 });
  }
}
