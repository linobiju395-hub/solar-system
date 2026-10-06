import { fetchWithTimeout, json, safeJson, withProxy, type PagesContext } from '../../_shared';

function cleanText(value: unknown): string {
  return typeof value === 'string'
    ? value.replace(/<[^>]*>?/gm, '').replace(/^Explanation:\s*/i, '').trim()
    : '';
}

function normalizeApod(item: any) {
  const mediaType = item?.media_type || 'image';
  const url = item?.hdurl || item?.url || '';
  const hdurl = item?.hdurl || item?.url || '';

  return {
    date: item?.date || new Date().toISOString().slice(0, 10),
    title: item?.title || 'NASA Astronomy Picture of the Day',
    explanation: cleanText(item?.explanation),
    url: mediaType === 'image' ? withProxy(url) : url,
    hdurl: mediaType === 'image' ? withProxy(hdurl) : hdurl,
    media_type: mediaType,
    copyright: item?.credit || item?.copyright || 'NASA / APOD',
    sourceUrl: item?.hdurl || item?.url || item?.permalink || '',
  };
}

const fallback = () => normalizeApod({
  date: new Date().toISOString().slice(0, 10),
  title: 'NASA Astronomy Picture of the Day',
  explanation: 'NASA APOD is temporarily unavailable. Please try again shortly.',
  media_type: 'image',
  url: 'https://images-assets.nasa.gov/image/PIA25442/PIA25442~orig.jpg',
  hdurl: 'https://images-assets.nasa.gov/image/PIA25442/PIA25442~orig.jpg',
  copyright: 'NASA / ESA / CSA / STScI',
});

export async function onRequestGet(context: PagesContext) {
  const url = new URL(context.request.url);
  const requestedDate = url.searchParams.get('date') || '';

  // Current NASA APOD endpoint. NASA migrated APOD to this WordPress API in September 2026.
  const params = new URLSearchParams();
  if (requestedDate) params.set('date', requestedDate);
  const apiKey = (context.env.NASA_API_KEY || '').trim();
  if (apiKey) params.set('api_key', apiKey);

  try {
    const wpUrl = `https://science.nasa.gov/wp-json/wp/v2/apod-basic/${params.toString() ? `?${params}` : ''}`;
    const response = await fetchWithTimeout(wpUrl, {
      headers: { 'User-Agent': 'AetherCosmos/Cloudflare-Pages' },
    }, 8000);
    const data = await safeJson<any>(response);

    if (response.ok && data) {
      const item = Array.isArray(data) ? data[0] : data;
      if (item && (item.hdurl || item.url)) return json(normalizeApod(item));
    }
  } catch (error) {
    console.warn('NASA APOD primary request failed:', error);
  }

  // Legacy NASA endpoint as a temporary compatibility fallback.
  try {
    const key = apiKey || 'DEMO_KEY';
    const legacy = new URL('https://api.nasa.gov/planetary/apod');
    legacy.searchParams.set('api_key', key);
    if (requestedDate) legacy.searchParams.set('date', requestedDate);
    const response = await fetchWithTimeout(legacy.toString(), {}, 7000);
    const data = await safeJson<any>(response);
    if (response.ok && data?.url) return json(normalizeApod(data));
  } catch (error) {
    console.warn('NASA APOD legacy fallback failed:', error);
  }

  return json(fallback());
}
