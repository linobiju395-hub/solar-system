import { fetchWithTimeout, json, safeJson, type PagesContext } from '../../_shared';

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
