set -e
cd /tmp/solarfix
mkdir -p functions/api/space
cat > functions/_shared.ts <<'TS'
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
TS

cat > functions/api/config.ts <<'TS'
import { json, type PagesContext } from '../../_shared';

export async function onRequestGet(context: PagesContext) {
  const customKey = (context.env.NASA_API_KEY || '').trim();
  return json({
    status: 'online',
    hasCustomNasaKey: customKey.length > 0 && customKey !== 'DEMO_KEY',
    activeProvider: 'NASA Open APIs & OpenNotify',
    runtime: 'Cloudflare Pages Functions',
    serverTime: new Date().toISOString(),
  });
}
TS

cat > functions/api/space/apod.ts <<'TS'
import { fetchWithTimeout, json, safeJson, withProxy, type PagesContext } from '../../../_shared';

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
TS

cat > functions/api/space/epic.ts <<'TS'
import { fetchWithTimeout, json, safeJson, withProxy, type PagesContext } from '../../../_shared';

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
TS

cat > functions/api/space/media.ts <<'TS'
import { fetchWithTimeout, json, safeJson, withProxy, type PagesContext } from '../../../_shared';

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
TS

cat > functions/api/space/solar.ts <<'TS'
import { fetchWithTimeout, json, safeJson, withProxy, type PagesContext } from '../../../_shared';

export async function onRequestGet(_context: PagesContext) {
  try {
    const urls = [
      'https://services.swpc.noaa.gov/json/goes/primary/xray-flares-7-day.json',
      'https://services.swpc.noaa.gov/products/alerts.json',
      'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json',
    ];

    const [flaresRes, alertsRes, kpRes] = await Promise.allSettled(
      urls.map((url) => fetchWithTimeout(url, {}, 8000)),
    );

    let flares: any[] = [];
    if (flaresRes.status === 'fulfilled' && flaresRes.value.ok) {
      const data = await safeJson<any[]>(flaresRes.value);
      flares = Array.isArray(data) ? data.slice(-15).reverse() : [];
    }

    let alerts: any[] = [];
    if (alertsRes.status === 'fulfilled' && alertsRes.value.ok) {
      const data = await safeJson<any[]>(alertsRes.value);
      alerts = Array.isArray(data) ? data.slice(0, 10) : [];
    }

    let currentKp = 2.0;
    if (kpRes.status === 'fulfilled' && kpRes.value.ok) {
      const data = await safeJson<any[]>(kpRes.value);
      if (Array.isArray(data) && data.length > 1) {
        currentKp = Number.parseFloat(data[data.length - 1]?.Kp || '2.0') || 2.0;
      }
    }

    const latestFlare = flares[0] || null;
    const latestClass = latestFlare?.max_class || 'B';
    const isXClass = latestClass.startsWith('X');
    const isMClass = latestClass.startsWith('M');

    let activityLevel: 'NOMINAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL' = 'NOMINAL';
    if (isXClass || currentKp >= 7) activityLevel = 'CRITICAL';
    else if (isMClass || currentKp >= 5) activityLevel = 'HIGH';
    else if (latestClass.startsWith('C') || currentKp >= 4) activityLevel = 'ELEVATED';

    return json({
      timestamp: new Date().toISOString(),
      activityLevel,
      hasHighAlert: activityLevel === 'HIGH' || activityLevel === 'CRITICAL',
      currentKp,
      latestFlare,
      flaresCount: flares.length,
      flares,
      alerts,
      sdoImages: [
        {
          id: 'sdo_0171', name: 'AIA 171 Å (Quiet Corona & Upper Transition Region)', wavelength: '171 Å', color: 'Gold',
          url: withProxy('https://sdo.gsfc.nasa.gov/assets/img/latest/latest_512_0171.jpg'),
          description: 'Highlights coronal loops and quiet corona magnetic field lines (Fe IX, ~1 million K).',
        },
        {
          id: 'sdo_0193', name: 'AIA 193 Å (Coronal Holes & Solar Flares)', wavelength: '193 Å', color: 'Bronze',
          url: withProxy('https://sdo.gsfc.nasa.gov/assets/img/latest/latest_512_0193.jpg'),
          description: 'Reveals coronal holes (source of solar wind) and hot flare plasma (Fe XII, XXIV, ~1.25 million K).',
        },
        {
          id: 'sdo_0304', name: 'AIA 304 Å (Chromosphere & Prominences)', wavelength: '304 Å', color: 'Red/Orange',
          url: withProxy('https://sdo.gsfc.nasa.gov/assets/img/latest/latest_512_0304.jpg'),
          description: 'Captures solar filaments, eruptive prominences, and chromospheric activity (He II, ~50,000 K).',
        },
        {
          id: 'sdo_hmii', name: 'HMI Intensitygram (Sunspots & Active Regions)', wavelength: '6173 Å', color: 'Visible Light',
          url: withProxy('https://sdo.gsfc.nasa.gov/assets/img/latest/latest_512_HMII.jpg'),
          description: 'Visible light continuum displaying sunspots and photospheric granulation.',
        },
      ],
    });
  } catch (error) {
    console.error('Solar activity function failed:', error);
    return json({ error: 'Failed to retrieve Solar Activity data' }, 500);
  }
}
TS

cat > functions/api/space/iss.ts <<'TS'
import { fetchWithTimeout, json, safeJson, type PagesContext } from '../../../_shared';

const fallbackPeople = [
  { craft: 'ISS', name: 'Sunita Williams' },
  { craft: 'ISS', name: 'Barry Wilmore' },
  { craft: 'ISS', name: 'Matthew Dominick' },
  { craft: 'ISS', name: 'Michael Barratt' },
  { craft: 'ISS', name: 'Jeanette Epps' },
  { craft: 'ISS', name: 'Alexander Grebenkin' },
  { craft: 'Tiangong', name: 'Ye Guangfu' },
  { craft: 'Tiangong', name: 'Li Cong' },
  { craft: 'Tiangong', name: 'Li Guangsu' },
];

export async function onRequestGet(_context: PagesContext) {
  try {
    // Open Notify's public API is historically HTTP. Try HTTPS first and HTTP as a fallback.
    const [posRes, crewRes] = await Promise.allSettled([
      fetchWithTimeout('https://api.open-notify.org/iss-now.json', {}, 5000).catch(() =>
        fetchWithTimeout('http://api.open-notify.org/iss-now.json', {}, 5000),
      ),
      fetchWithTimeout('https://api.open-notify.org/astros.json', {}, 5000).catch(() =>
        fetchWithTimeout('http://api.open-notify.org/astros.json', {}, 5000),
      ),
    ]);

    let latitude = 15.2;
    let longitude = 48.7;
    let timestamp = Math.floor(Date.now() / 1000);

    if (posRes.status === 'fulfilled' && posRes.value.ok) {
      const data = await safeJson<any>(posRes.value);
      if (data?.iss_position) {
        latitude = Number.parseFloat(data.iss_position.latitude) || latitude;
        longitude = Number.parseFloat(data.iss_position.longitude) || longitude;
        timestamp = data.timestamp || timestamp;
      }
    }

    let people = fallbackPeople;
    if (crewRes.status === 'fulfilled' && crewRes.value.ok) {
      const data = await safeJson<any>(crewRes.value);
      if (Array.isArray(data?.people) && data.people.length) people = data.people;
    }

    const scientificProjects = [
      { id: 'ALPHA_MAG_SPECTROMETER', title: 'Alpha Magnetic Spectrometer (AMS-02)', category: 'Particle Physics & Dark Matter', agency: 'NASA / CERN / DOE', summary: 'Mounted on the ISS exterior truss, measuring primordial antimatter and cosmic rays to detect dark matter signatures in deep space.', status: 'Active Data Acquisition', investigator: 'Prof. Samuel Ting' },
      { id: 'COLD_ATOM_LAB', title: 'Cold Atom Lab (CAL)', category: 'Quantum Physics', agency: 'NASA JPL', summary: 'Creates Bose-Einstein condensates at temperatures 10 billionths of a degree above absolute zero to study quantum physics in microgravity.', status: 'Operational Experiment Run', investigator: 'JPL Quantum Sciences Group' },
      { id: 'PLANT_HABITAT_04', title: 'Advanced Plant Habitat (APH / Veggie)', category: 'Astrobiology & Space Agriculture', agency: 'NASA Kennedy Space Center', summary: 'Autonomous plant growth chamber researching crops for deep-space Moon and Mars missions.', status: 'Planting & Harvest Cycle', investigator: 'NASA Biological & Physical Sciences' },
      { id: 'TISSUE_BIOPRINTING', title: 'BioFabrication Facility (BFF 3D-Printer)', category: 'Biotechnology & Regenerative Medicine', agency: 'NASA / Redwire Space', summary: '3D bioprinting human tissue in microgravity.', status: 'Tissue Culturing', investigator: 'Uniformed Services University' },
      { id: 'NICER_XRAY', title: 'Neutron Star Interior Composition Explorer (NICER)', category: 'Astrophysics & X-Ray Astronomy', agency: 'NASA Goddard Space Flight Center', summary: 'Precision X-ray timing of rotating neutron stars and pulsars.', status: 'Active Observation', investigator: 'NASA GSFC Astrophysics' },
    ];

    return json({
      position: {
        latitude,
        longitude,
        timestamp,
        altitudeKm: 418.5,
        velocityKmh: 27580,
        visibility: latitude > 0 ? 'Daylight Orbital Pass' : 'Night Orbital Eclipse',
      },
      crew: { count: people.length, people },
      scientificProjects,
    });
  } catch (error) {
    console.error('ISS function failed:', error);
    return json({
      position: { latitude: -12.4, longitude: -45.1, timestamp: Math.floor(Date.now() / 1000), altitudeKm: 418.5, velocityKmh: 27580, visibility: 'Orbital Pass' },
      crew: { count: fallbackPeople.length, people: fallbackPeople },
      scientificProjects: [],
    });
  }
}
TS

cat > functions/api/space/image.ts <<'TS'
import { isAllowedImageHost, type PagesContext } from '../../../_shared';

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
      cf: { cacheTtl: 86400, cacheEverything: true },
    } as RequestInit);

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
TS

# Update package dependency to the Vite-compatible esbuild version.
python - <<'PY'
import json
p='package.json'
data=json.load(open(p))
data['devDependencies']['esbuild']='^0.28.0'
open(p,'w').write(json.dumps(data, indent=2)+'\n')
PY

# Replace direct NASA image asset URLs in the static planet data and canvas with same-origin proxy URLs.
python - <<'PY'
from pathlib import Path
files=['src/data/planets.ts','src/components/EyesSolarCanvas.tsx']
for fn in files:
    p=Path(fn); s=p.read_text()
    import re
    s=re.sub(r"'https://images-assets\.nasa\.gov/([^']+)'", lambda m: "'/api/space/image?url=" + __import__('urllib.parse').parse.quote('https://images-assets.nasa.gov/'+m.group(1), safe='') + "'", s)
    p.write_text(s)
PY

# Show resulting changes.
grep -RIn "images-assets.nasa.gov\|/api/space/image" src/data/planets.ts src/components/EyesSolarCanvas.tsx | head -30
cat package.json
