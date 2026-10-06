import { fetchWithTimeout, json, safeJson, withProxy, type PagesContext } from '../../_shared';

export async function onRequestGet(context: PagesContext) {
  const requestUrl = new URL(context.request.url);
  const query = requestUrl.searchParams.get('q') || 'universe';
  const page = requestUrl.searchParams.get('page') || '1';
  const mediaType = requestUrl.searchParams.get('media_type') || 'image';
  const center = requestUrl.searchParams.get('center') || '';
  const rawLimit = Number.parseInt(requestUrl.searchParams.get('limit') || '60', 10);
  const limit = Math.min(100, Math.max(12, Number.isNaN(rawLimit) ? 60 : rawLimit));

  try {
    const apiUrl = new URL('https://images-api.nasa.gov/search');
    apiUrl.searchParams.set('q', query);
    apiUrl.searchParams.set('page', page);
    apiUrl.searchParams.set('media_type', mediaType);
    if (center) apiUrl.searchParams.set('center', center);

    const upstream = await fetchWithTimeout(apiUrl.toString(), {
      headers: { 'User-Agent': 'AetherCosmos/Cloudflare-Pages' },
    }, 10000);
    const data = await safeJson<any>(upstream);

    if (upstream.ok && data) {
      const rawItems = data?.collection?.items || [];
      const totalHits = data?.collection?.metadata?.total_hits || rawItems.length;
      const items = rawItems.slice(0, limit).map((item: any) => {
        const itemData = item.data?.[0] || {};
        const previewHref = item.links?.[0]?.href || '';
        const largeUrl = previewHref.includes('~thumb.')
          ? previewHref.replace('~thumb.', '~large.')
          : previewHref;
        const origUrl = previewHref.includes('~thumb.')
          ? previewHref.replace('~thumb.', '~orig.')
          : previewHref;
        return {
          nasaId: itemData.nasa_id,
          title: itemData.title,
          description: itemData.description,
          center: itemData.center,
          dateCreated: itemData.date_created,
          keywords: itemData.keywords || [],
          mediaType: itemData.media_type,
          thumbUrl: withProxy(previewHref),
          largeUrl: withProxy(largeUrl),
          origUrl: withProxy(origUrl),
          collectionHref: item.href,
        };
      });
      return json({ query, count: items.length, totalHits, page: Number.parseInt(page, 10), items });
    }
  } catch (error) {
    console.warn('NASA Image Library request failed:', error);
  }

  return json({ query, count: 0, totalHits: 0, page: Number.parseInt(page, 10) || 1, items: [] });
}
