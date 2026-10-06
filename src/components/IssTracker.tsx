import React, { useState, useEffect } from 'react';
import { fetchIssData } from '../services/spaceService';
import { IssPosition, Astronaut, IssExperiment } from '../types/space';
import {
  Satellite,
  Users,
  Activity,
  Compass,
  RefreshCw,
  Radio,
  FlaskConical,
  ExternalLink,
  ChevronRight,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';

export function IssTracker() {
  const [data, setData] = useState<{
    position: IssPosition;
    crew: { count: number; people: Astronaut[] };
    scientificProjects?: IssExperiment[];
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'telemetry' | 'experiments'>('telemetry');
  const [loading, setLoading] = useState(true);

  const loadIss = async () => {
    try {
      const res = await fetchIssData();
      setData(res);
    } catch (e) {
      console.error('ISS load failed:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIss();
    const interval = setInterval(loadIss, 6000); // Live tracking poll
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 p-6 sm:p-8 shadow-2xl text-white select-none font-['Plus_Jakarta_Sans',system-ui,sans-serif]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-300 mb-1">
            <Radio className="w-4 h-4 text-emerald-300 animate-pulse" />
            <span>NASA Orbital Telemetry & Crew Operations</span>
            <span className="text-white/40 font-mono hidden md:inline">· 51.6° Inclination</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>International Space Station (ISS)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-400/30">
              Low Earth Orbit
            </span>
          </h2>
        </div>

        {/* Tab Controls: Flight Telemetry vs Microgravity Research */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md self-start sm:self-center">
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'telemetry'
                ? 'bg-emerald-400 text-slate-950 shadow-md font-bold'
                : 'text-white/80 hover:text-white'
            }`}
          >
            Flight Telemetry
          </button>
          <button
            onClick={() => setActiveTab('experiments')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'experiments'
                ? 'bg-emerald-400 text-slate-950 shadow-md font-bold'
                : 'text-white/80 hover:text-white'
            }`}
          >
            Microgravity Experiments ({data?.scientificProjects?.length || 5})
          </button>
          <button
            onClick={loadIss}
            disabled={loading}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            title="Ping Transponder"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {data && activeTab === 'telemetry' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Coordinates & Flight Dynamics */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-2xl bg-black/40 border border-white/15 shadow-inner">
              <span className="text-xs text-white/60 block mb-1">Current Ground Track Coordinates</span>
              <div className="flex items-baseline gap-6">
                <div>
                  <span className="text-xs text-white/60 block">Latitude:</span>
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-white block">
                    {data.position.latitude.toFixed(4)}°
                  </span>
                </div>
                <div>
                  <span className="text-xs text-white/60 block">Longitude:</span>
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-white block">
                    {data.position.longitude.toFixed(4)}°
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-white/10 border border-white/15">
                <span className="text-white/60 block mb-0.5">Orbital Speed</span>
                <span className="text-xl font-bold font-mono text-cyan-300 block">
                  {data.position.velocityKmh.toLocaleString()}
                </span>
                <span className="text-[10px] text-white/50 block">km/h (~7.66 km/s)</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 border border-white/15">
                <span className="text-white/60 block mb-0.5">Altitude</span>
                <span className="text-xl font-bold font-mono text-emerald-300 block">
                  {data.position.altitudeKm}
                </span>
                <span className="text-[10px] text-white/50 block">kilometers LEO</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 border border-white/15">
                <span className="text-white/60 block mb-0.5">Day/Night State</span>
                <span className="text-sm font-bold font-mono text-amber-300 block truncate">
                  {data.position.visibility}
                </span>
                <span className="text-[10px] text-white/50 block">16 Sunrises/Day</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/80 leading-relaxed font-sans">
              Traveling at roughly 28,000 km/h, the ISS orbits Earth every 90 minutes. Astronauts onboard experience 16 sunrises and sunsets every 24 hours while conducting international microgravity research.
            </div>
          </div>

          {/* Humans in Space Right Now */}
          <div className="lg:col-span-6 p-5 rounded-2xl bg-black/40 border border-white/15 flex flex-col justify-between shadow-inner">
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Users className="w-4 h-4 text-cyan-300" />
                  <span>Humans Currently in Orbit</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-xs font-bold font-mono">
                  {data.crew.count} Astronauts
                </span>
              </div>

              <div className="max-h-56 overflow-y-auto thin-scrollbar space-y-2 pr-1">
                {data.crew.people.map((astronaut, i) => (
                  <div
                    key={`${astronaut.name}-${i}`}
                    className="p-2.5 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                      <span className="font-semibold text-white">{astronaut.name}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-lg bg-white/10 text-white/80 font-mono text-[10px]">
                      {astronaut.craft}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-white/50 mt-3 pt-2 border-t border-white/10">
              Live orbital manifest corroborated via NASA / OpenNotify space station records.
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Scientific Projects & Investigations */}
      {data && activeTab === 'experiments' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-300 block font-semibold">
                ISS U.S. National Laboratory & International Research
              </span>
              <p className="text-xs text-white/80 mt-1">
                Investigations conducted in microgravity across astrophysics, biological sciences, and human health.
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-mono whitespace-nowrap self-start">
              5 Active Programs
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(data.scientificProjects || []).map((exp) => (
              <div
                key={exp.id}
                className="p-5 rounded-2xl bg-black/40 border border-white/15 hover:border-emerald-400/50 transition-all flex flex-col justify-between group space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono text-emerald-300 uppercase tracking-wider font-semibold">
                      {exp.category}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/80 font-mono">
                      {exp.agency}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {exp.title}
                  </h4>

                  <p className="text-xs text-white/75 leading-relaxed mt-2 font-sans">
                    {exp.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
                  <span className="text-white/60 font-mono">Lead: {exp.investigator}</span>
                  <span className="font-mono text-emerald-400 font-semibold">{exp.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
