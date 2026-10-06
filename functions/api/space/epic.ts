import { fetchWithTimeout, json, safeJson, withProxy, type PagesContext } from '../../_shared';

function fallback(type: string) {
  const date = '2026/09/28';
  const name = type === 'enhanced' ? 'epic_RGB_20260928005515' : 'epic_1b_20260928005515';
  const base = `https://epic.gsfc.nasa.gov/archive/${type}/${date}`;
  return {
    status: 'fallback',
    type,
    count: 1,
    images: [{
      identifier: 'fallback-earth',
      caption: 'NASA DSCOVR EPIC Earth Full Disk View',
      image: name,
      date: new Date().toISOString(),
      centroidCoordinates: { lat: 0, lon: 0 },
      imageUrl: withProxy(`${base}/png/${name}.png`),
      thumbUrl: withProxy(`${base}/thumbs/${name}.jpg`),
      jpgUrl: withProxy(`${base}/jpg/${name}.jpg`),
    }],
  };
}

export async function onRequestGet(context: PagesContext) {
  const url = new URL(context.request.url);
  const type = url.searchParams.get('type') === 'enhanced' ? 'enhanced' : 'natural';

  try {
    const upstream = await fetchWithTimeout(`https://epic.gsfc.nasa.gov/api/${type}`, {
      headers: { 'User-Agent': 'AetherCosmos/Cloudflare-Pages' },
    }, 8000);
    const items = await safeJson<any[]>(upstream);

    if (upstream.ok && Array.isArray(items) && items.length) {
      const parsed = items.slice(0, 12).map((item: any) => {
        const datePart = (item.date || '').split(' ')[0] || '';
        const [yyyy, mm, dd] = datePart.split('-');
        const imageName = item.image;
        const base = `https://epic.gsfc.nasa.gov/archive/${type}/${yyyy}/${mm}/${dd}`;
        return {
          identifier: item.identifier,
          caption: item.caption,
          image: imageName,
          date: item.date,
          centroidCoordinates: item.centroid_coordinates,
          dscovrJ2000Position: item.dscovr_j2000_position,
          imageUrl: withProxy(`${base}/png/${imageName}.png`),
          thumbUrl: withProxy(`${base}/thumbs/${imageName}.jpg`),
          jpgUrl: withProxy(`${base}/jpg/${imageName}.jpg`),
        };
      });
      return json({ status: 'success', type, count: parsed.length, images: parsed });
    }
  } catch (error) {
    console.warn('NASA EPIC request failed:', error);
  }

  return json(fallback(type));
}
