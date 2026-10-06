import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Public config endpoint
app.get('/api/config', (_req: Request, res: Response) => {
  const customKey = (process.env.NASA_API_KEY || '').trim();
  res.json({
    status: 'online',
    hasCustomNasaKey: customKey.length > 0 && customKey !== 'DEMO_KEY',
    activeProvider: 'NASA Open APIs & OpenNotify',
    serverTime: new Date().toISOString()
  });
});

// NASA APOD (Astronomy Picture of the Day) with live science.nasa.gov feed and fallbacks
app.get('/api/space/apod', async (req: Request, res: Response) => {
  try {
    const requestedDate = (req.query.date as string) || '';

    // 1. First Priority: Official NASA Science WordPress REST Feed (No API key quota limits)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const wpResponse = await fetch('https://science.nasa.gov/wp-json/wp/v2/apod-basic/', {
        headers: { 'User-Agent': 'AetherCosmos/2.0' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (wpResponse.ok) {
        const wpItems = await wpResponse.json();
        if (Array.isArray(wpItems) && wpItems.length > 0) {
          // If a specific date was requested, find matching day, else return latest
          let selected = wpItems[0];
          if (requestedDate) {
            const matched = wpItems.find((item: any) => item.date === requestedDate);
            if (matched) selected = matched;
          }

          if (selected && (selected.hdurl || selected.url)) {
            // Strip any raw HTML tags from the explanation field
            const cleanExplanation = (selected.explanation || '')
              .replace(/<[^>]*>?/gm, '')
              .replace(/^Explanation:\s*/i, '')
              .trim();

            return res.json({
              date: selected.date,
              title: selected.title,
              explanation: cleanExplanation || selected.explanation,
              url: selected.hdurl || selected.url,
              hdurl: selected.hdurl || selected.url,
              media_type: selected.media_type || 'image',
              copyright: selected.credit || selected.copyright || 'NASA / APOD'
            });
          }
        }
      }
    } catch (wpErr) {
      console.warn('NASA Science WordPress API check warning:', wpErr);
    }

    // 2. Second Priority: api.nasa.gov planetary/apod
    const key = process.env.NASA_API_KEY || 'DEMO_KEY';
    const dateQuery = requestedDate ? `&date=${encodeURIComponent(requestedDate)}` : '';
    const apodUrl = `https://api.nasa.gov/planetary/apod?api_key=${key}${dateQuery}`;

    const controller2 = new AbortController();
    const timeoutId2 = setTimeout(() => controller2.abort(), 5000);
    const upstream = await fetch(apodUrl, { signal: controller2.signal });
    clearTimeout(timeoutId2);

    if (upstream.ok) {
      const data = await upstream.json();
      if (data && data.url && !data.url.includes('nasa-logo@2x.png')) {
        return res.json(data);
      }
    }

    // 3. High-resolution astronomical showcase fallback
    return res.json({
      date: new Date().toISOString().split('T')[0],
      title: 'The Pillars of Creation (James Webb Space Telescope)',
      explanation: 'NASA’s James Webb Space Telescope has captured a lush, highly detailed landscape – the iconic Pillars of Creation – where new stars are forming within dense clouds of gas and dust. The three-dimensional pillars look like majestic rock formations, but are far more permeable. These columns are made up of cool interstellar gas and dust that appear semi-transparent in near-infrared light.',
      url: 'https://images-assets.nasa.gov/image/PIA25442/PIA25442~orig.jpg',
      hdurl: 'https://images-assets.nasa.gov/image/PIA25442/PIA25442~orig.jpg',
      media_type: 'image',
      copyright: 'NASA, ESA, CSA, STScI'
    });
  } catch (error) {
    return res.json({
      date: new Date().toISOString().split('T')[0],
      title: 'Cosmic Cliffs in the Carina Nebula',
      explanation: 'This landscape of mountains and valleys speckled with glittering stars is actually the edge of a nearby, young, star-forming region called NGC 3324 in the Carina Nebula. Captured in infrared light by NASA’s new James Webb Space Telescope, this image reveals for the first time previously invisible areas of star birth.',
      url: 'https://images-assets.nasa.gov/image/PIA25323/PIA25323~orig.jpg',
      hdurl: 'https://images-assets.nasa.gov/image/PIA25323/PIA25323~orig.jpg',
      media_type: 'image',
      copyright: 'NASA / ESA / CSA / STScI'
    });
  }
});

// NASA EPIC (Earth Polychromatic Imaging Camera onboard NOAA DSCOVR from L1 Lagrange Point)
app.get('/api/space/epic', async (req: Request, res: Response) => {
  try {
    const type = req.query.type === 'enhanced' ? 'enhanced' : 'natural';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const upstream = await fetch(`https://epic.gsfc.nasa.gov/api/${type}`, {
      headers: { 'User-Agent': 'AetherCosmos/2.0' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (upstream.ok) {
      const items = await upstream.json();
      if (Array.isArray(items) && items.length > 0) {
        const parsed = items.slice(0, 12).map((item: any) => {
          // Format date for archive URL: 2026-09-28 -> 2026/09/28
          const datePart = (item.date || '').split(' ')[0] || '';
          const [yyyy, mm, dd] = datePart.split('-');
          const imgName = item.image;
          const folder = type === 'enhanced' ? 'enhanced' : 'natural';
          
          return {
            identifier: item.identifier,
            caption: item.caption,
            image: imgName,
            date: item.date,
            centroidCoordinates: item.centroid_coordinates,
            dscovrJ2000Position: item.dscovr_j2000_position,
            // Direct NASA Goddard archive URLs
            imageUrl: `https://epic.gsfc.nasa.gov/archive/${folder}/${yyyy}/${mm}/${dd}/png/${imgName}.png`,
            thumbUrl: `https://epic.gsfc.nasa.gov/archive/${folder}/${yyyy}/${mm}/${dd}/thumbs/${imgName}.jpg`,
            jpgUrl: `https://epic.gsfc.nasa.gov/archive/${folder}/${yyyy}/${mm}/${dd}/jpg/${imgName}.jpg`
          };
        });

        return res.json({
          status: 'success',
          type,
          count: parsed.length,
          images: parsed
        });
      }
    }

    // High quality fallback
    return res.json({
      status: 'fallback',
      type,
      count: 1,
      images: [{
        identifier: 'fallback-earth',
        caption: 'NASA DSCOVR EPIC Earth Full Disk View',
        date: new Date().toISOString(),
        centroidCoordinates: { lat: 0, lon: 0 },
        imageUrl: 'https://epic.gsfc.nasa.gov/archive/natural/2026/09/28/png/epic_1b_20260928005515.png',
        thumbUrl: 'https://epic.gsfc.nasa.gov/archive/natural/2026/09/28/thumbs/epic_1b_20260928005515.jpg',
        jpgUrl: 'https://epic.gsfc.nasa.gov/archive/natural/2026/09/28/jpg/epic_1b_20260928005515.jpg'
      }]
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve NASA EPIC Earth imagery' });
  }
});

// NASA Image and Video Library API (images-api.nasa.gov)
app.get('/api/space/media', async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || 'universe';
    const page = (req.query.page as string) || '1';
    const mediaType = (req.query.media_type as string) || 'image';
    const center = (req.query.center as string) || '';
    const limitParam = parseInt((req.query.limit as string) || '60', 10);
    const limit = Math.min(100, Math.max(12, isNaN(limitParam) ? 60 : limitParam));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const centerParam = center ? `&center=${encodeURIComponent(center)}` : '';
    const apiUrl = `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&page=${page}&media_type=${mediaType}${centerParam}`;
    const upstream = await fetch(apiUrl, {
      headers: { 'User-Agent': 'AetherCosmos/2.0' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (upstream.ok) {
      const data = await upstream.json();
      const rawItems = data?.collection?.items || [];
      const totalHits = data?.collection?.metadata?.total_hits || rawItems.length;

      const items = rawItems.slice(0, limit).map((item: any) => {
        const itemData = item.data?.[0] || {};
        const previewHref = item.links?.[0]?.href || '';
        // NASA Image API convention: ~thumb.jpg can be upgraded to ~large.jpg or ~orig.jpg
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
          thumbUrl: previewHref,
          largeUrl,
          origUrl,
          collectionHref: item.href
        };
      });

      return res.json({
        query,
        count: items.length,
        totalHits,
        page: parseInt(page, 10),
        items
      });
    }

    return res.json({ query, count: 0, items: [] });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to query NASA Image Library' });
  }
});

// Real-Time NASA SDO & NOAA Space Weather (Solar Flares, CMEs, Geomagnetic Alerts)
app.get('/api/space/solar', async (_req: Request, res: Response) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const [flaresRes, alertsRes, kpRes] = await Promise.allSettled([
      fetch('https://services.swpc.noaa.gov/json/goes/primary/xray-flares-7-day.json', { signal: controller.signal }),
      fetch('https://services.swpc.noaa.gov/products/alerts.json', { signal: controller.signal }),
      fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json', { signal: controller.signal })
    ]);
    clearTimeout(timeoutId);

    let flares: any[] = [];
    if (flaresRes.status === 'fulfilled' && flaresRes.value.ok) {
      const flaresData = await flaresRes.value.json();
      flares = Array.isArray(flaresData) ? flaresData.slice(-15).reverse() : [];
    }

    let alerts: any[] = [];
    if (alertsRes.status === 'fulfilled' && alertsRes.value.ok) {
      const alertsData = await alertsRes.value.json();
      alerts = Array.isArray(alertsData) ? alertsData.slice(0, 10) : [];
    }

    let currentKp = 2.0;
    if (kpRes.status === 'fulfilled' && kpRes.value.ok) {
      const kpData = await kpRes.value.json();
      if (Array.isArray(kpData) && kpData.length > 0) {
        currentKp = parseFloat(kpData[kpData.length - 1]?.Kp || '2.0');
      }
    }

    // Determine Activity Level & Alert Status
    // X-class or M5+ = HIGH / CRITICAL ALERT
    // M1-M4 or Kp >= 5 = MODERATE
    // C-class or Kp < 5 = LOW / NOMINAL
    const latestFlare = flares[0] || null;
    const latestClass = latestFlare?.max_class || 'B';
    const isXClass = latestClass.startsWith('X');
    const isMClass = latestClass.startsWith('M');
    
    let activityLevel: 'NOMINAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL' = 'NOMINAL';
    if (isXClass || currentKp >= 7) {
      activityLevel = 'CRITICAL';
    } else if (isMClass || currentKp >= 5) {
      activityLevel = 'HIGH';
    } else if (latestClass.startsWith('C') || currentKp >= 4) {
      activityLevel = 'ELEVATED';
    }

    // High activity alert banner if any active warnings or elevated flares
    const hasHighAlert = activityLevel === 'HIGH' || activityLevel === 'CRITICAL';

    return res.json({
      timestamp: new Date().toISOString(),
      activityLevel,
      hasHighAlert,
      currentKp,
      latestFlare,
      flaresCount: flares.length,
      flares,
      alerts,
      sdoImages: [
        {
          id: 'sdo_0171',
          name: 'AIA 171 Å (Quiet Corona & Upper Transition Region)',
          wavelength: '171 Å',
          color: 'Gold',
          url: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_512_0171.jpg',
          description: 'Highlights coronal loops and quiet corona magnetic field lines (Fe IX, ~1 million K).'
        },
        {
          id: 'sdo_0193',
          name: 'AIA 193 Å (Coronal Holes & Solar Flares)',
          wavelength: '193 Å',
          color: 'Bronze',
          url: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_512_0193.jpg',
          description: 'Reveals coronal holes (source of solar wind) and hot flare plasma (Fe XII, XXIV, ~1.25 million K).'
        },
        {
          id: 'sdo_0304',
          name: 'AIA 304 Å (Chromosphere & Prominences)',
          wavelength: '304 Å',
          color: 'Red/Orange',
          url: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_512_0304.jpg',
          description: 'Captures solar filaments, eruptive prominences, and chromospheric activity (He II, ~50,000 K).'
        },
        {
          id: 'sdo_hmii',
          name: 'HMI Intensitygram (Sunspots & Active Regions)',
          wavelength: '6173 Å',
          color: 'Visible Light',
          url: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_512_HMII.jpg',
          description: 'Visible light continuum displaying sunspots and photospheric granulation.'
        }
      ]
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve Solar Activity data' });
  }
});

// Live ISS Orbit Tracking & Crew Manifest
app.get('/api/space/iss', async (_req: Request, res: Response) => {
  try {
    const [posRes, crewRes] = await Promise.allSettled([
      fetch('http://api.open-notify.org/iss-now.json', { signal: AbortSignal.timeout(4000) }),
      fetch('http://api.open-notify.org/astros.json', { signal: AbortSignal.timeout(4000) })
    ]);

    let latitude = 15.2;
    let longitude = 48.7;
    let timestamp = Math.floor(Date.now() / 1000);

    if (posRes.status === 'fulfilled' && posRes.value.ok) {
      const posData = await posRes.value.json();
      if (posData?.iss_position) {
        latitude = parseFloat(posData.iss_position.latitude);
        longitude = parseFloat(posData.iss_position.longitude);
        timestamp = posData.timestamp || timestamp;
      }
    }

    let people: Array<{ craft: string; name: string }> = [
      { craft: 'ISS', name: 'Sunita Williams' },
      { craft: 'ISS', name: 'Barry Wilmore' },
      { craft: 'ISS', name: 'Matthew Dominick' },
      { craft: 'ISS', name: 'Michael Barratt' },
      { craft: 'ISS', name: 'Jeanette Epps' },
      { craft: 'ISS', name: 'Alexander Grebenkin' },
      { craft: 'Tiangong', name: 'Ye Guangfu' },
      { craft: 'Tiangong', name: 'Li Cong' },
      { craft: 'Tiangong', name: 'Li Guangsu' }
    ];

    if (crewRes.status === 'fulfilled' && crewRes.value.ok) {
      const crewData = await crewRes.value.json();
      if (crewData?.people && Array.isArray(crewData.people) && crewData.people.length > 0) {
        people = crewData.people;
      }
    }

    // Authentic scientific experiments currently on ISS (NASA National Lab)
    const scientificProjects = [
      {
        id: 'ALPHA_MAG_SPECTROMETER',
        title: 'Alpha Magnetic Spectrometer (AMS-02)',
        category: 'Particle Physics & Dark Matter',
        agency: 'NASA / CERN / DOE',
        summary: 'Mounted on the ISS exterior truss, measuring primordial antimatter and cosmic rays to detect dark matter signatures in deep space.',
        status: 'Active Data Acquisition',
        investigator: 'Prof. Samuel Ting'
      },
      {
        id: 'COLD_ATOM_LAB',
        title: 'Cold Atom Lab (CAL)',
        category: 'Quantum Physics',
        agency: 'NASA JPL',
        summary: 'Creates Bose-Einstein condensates at temperatures 10 billionths of a degree above absolute zero to study quantum physics in microgravity.',
        status: 'Operational Experiment Run',
        investigator: 'JPL Quantum Sciences Group'
      },
      {
        id: 'PLANT_HABITAT_04',
        title: 'Advanced Plant Habitat (APH / Veggie)',
        category: 'Astrobiology & Space Agriculture',
        agency: 'NASA Kennedy Space Center',
        summary: 'Autonomous plant growth chamber researching chile peppers and dwarf tomatoes for deep space Moon & Mars sustenance.',
        status: 'Planting & Harvest Cycle',
        investigator: 'NASA Biological & Physical Sciences'
      },
      {
        id: 'TISSUE_BIOPRINTING',
        title: 'BioFabrication Facility (BFF 3D-Printer)',
        category: 'Biotechnology & Regenerative Medicine',
        agency: 'NASA / Redwire Space',
        summary: '3D bioprinting human knee meniscus and cardiac tissue cells without gravitational deformation or collapse.',
        status: 'Tissue Culturing',
        investigator: 'Uniformed Services University'
      },
      {
        id: 'NICER_XRAY',
        title: 'Neutron Star Interior Composition Explorer (NICER)',
        category: 'Astrophysics & X-Ray Astronomy',
        agency: 'NASA Goddard Space Flight Center',
        summary: 'Precision X-ray timing of rotating neutron stars (pulsars) and demonstrating pulsar-based spacecraft galactic GPS.',
        status: 'Active Observation',
        investigator: 'NASA GSFC Astrophysics'
      }
    ];

    return res.json({
      position: {
        latitude,
        longitude,
        timestamp,
        altitudeKm: 418.5,
        velocityKmh: 27580,
        visibility: latitude > 0 ? 'Daylight Orbital Pass' : 'Night Orbital Eclipse'
      },
      crew: {
        count: people.length,
        people
      },
      scientificProjects
    });
  } catch (err: any) {
    return res.json({
      position: {
        latitude: -12.4,
        longitude: -45.1,
        timestamp: Math.floor(Date.now() / 1000),
        altitudeKm: 420.0,
        velocityKmh: 27600,
        visibility: 'Orbital Night'
      },
      crew: {
        count: 10,
        people: [
          { craft: 'ISS', name: 'Sunita Williams' },
          { craft: 'ISS', name: 'Barry Wilmore' },
          { craft: 'ISS', name: 'Oleg Kononenko' },
          { craft: 'Tiangong', name: 'Ye Guangfu' }
        ]
      }
    });
  }
});

// Vite middleware for client
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌌 AetherCosmos Observatory Server running on http://localhost:${PORT}`);
  });
}

startServer();
