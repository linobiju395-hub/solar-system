import {
  ApodData,
  IssPosition,
  Astronaut,
  IssExperiment
} from '../types/space';

export async function fetchApod(date?: string): Promise<ApodData> {
  const url = date ? `/api/space/apod?date=${encodeURIComponent(date)}` : '/api/space/apod';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load Astronomy Picture of the Day');
  return res.json();
}

export async function fetchIssData(): Promise<{
  position: IssPosition;
  crew: { count: number; people: Astronaut[] };
  scientificProjects?: IssExperiment[];
}> {
  const res = await fetch('/api/space/iss');
  if (!res.ok) throw new Error('Failed to load ISS telemetry');
  return res.json();
}
