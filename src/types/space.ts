export interface ApodData {
  date: string;
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: 'image' | 'video';
  copyright?: string;
}

export interface IssPosition {
  latitude: number;
  longitude: number;
  timestamp: number;
  altitudeKm: number;
  velocityKmh: number;
  visibility: string;
}

export interface Astronaut {
  name: string;
  craft: string;
  role?: string;
  daysInSpace?: number;
}

export interface IssExperiment {
  id: string;
  title: string;
  category: string;
  agency: string;
  summary: string;
  status: string;
  investigator: string;
}

export interface SolarFlare {
  begin_time: string;
  max_time: string;
  end_time: string;
  max_class: string;
}

export interface SolarAlert {
  product_id: string;
  issue_datetime: string;
  message: string;
}

export interface SolarData {
  timestamp: string;
  kpIndex: number;
  activityLevel: 'NOMINAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  hasAlert: boolean;
  flares: SolarFlare[];
  alerts: SolarAlert[];
}

export interface EpicImage {
  identifier: string;
  caption: string;
  image: string;
  date: string;
  centroidCoordinates: {
    lat: number;
    lon: number;
  };
  imageUrl: string;
  thumbUrl: string;
  jpgUrl: string;
}

export interface PlanetInfo {
  name: string;
  type: string;
  distanceFromSunAU: number;
  orbitalPeriodDays: number;
  diameterKm: number;
  radiusKm?: number;
  moonsCount: number;
  meanTempC: number;
  temperatureC?: number;
  gravityMps2: number;
  escapeVelocityKms: number;
  dayLengthHours: number;
  atmosphere: string | string[];
  color: string;
  gradient: string;
  imageUrl?: string;
  description: string;
  summary?: string;
  funFact: string;
  surfaceFeatures: string[];
}
