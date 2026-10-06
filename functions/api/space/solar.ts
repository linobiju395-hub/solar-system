import { fetchWithTimeout, json, safeJson, withProxy, type PagesContext } from '../../_shared';

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
