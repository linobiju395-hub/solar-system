import React, { useState } from 'react';
import { SOLAR_SYSTEM_PLANETS } from '../data/planets';
import { PlanetInfo } from '../types/space';
import {
  Orbit,
  Sparkles,
  Compass,
  Thermometer,
  Layers,
  CircleDot,
  Radio,
  Eye,
  RotateCw,
  SunMedium
} from 'lucide-react';

export function SolarSystemOrrery() {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetInfo>(SOLAR_SYSTEM_PLANETS[2]); // Earth default
  const [viewMode, setViewMode] = useState<'orbits' | 'surface'>('orbits');

  return (
    <div className="rounded-3xl bg-slate-950/40 backdrop-blur-2xl border border-white/20 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Background ambient lighting based on planet */}
      <div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-[140px] opacity-30 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: selectedPlanet.color }}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300 mb-1">
            <Orbit className="w-4 h-4 text-amber-300" />
            <span>Interactive Heliocentric Orrery & Astrophysical Encyclopedia</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>Solar System Celestial Mechanics</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono border border-amber-300/30">
              4K Orbital Simulation
            </span>
          </h2>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md self-start sm:self-center">
          <button
            onClick={() => setViewMode('orbits')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              viewMode === 'orbits'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <Orbit className="w-3.5 h-3.5" />
            <span>Interactive Orbits</span>
          </button>
          <button
            onClick={() => setViewMode('surface')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              viewMode === 'surface'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Geology & Geology</span>
          </button>
        </div>
      </div>

      {/* Planetary Selector Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto thin-scrollbar pb-3 mb-6 relative z-10">
        {SOLAR_SYSTEM_PLANETS.map((planet) => {
          const isSelected = selectedPlanet.name === planet.name;
          return (
            <button
              key={planet.name}
              onClick={() => setSelectedPlanet(planet)}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2.5 border ${
                isSelected
                  ? 'bg-white text-slate-900 border-white shadow-xl scale-105'
                  : 'bg-white/10 text-white border-white/15 hover:bg-white/20'
              }`}
            >
              <span
                className="w-3 h-3 rounded-full shadow-sm"
                style={{ backgroundColor: planet.color }}
              />
              <span>{planet.name}</span>
              {isSelected && (
                <span className="text-[10px] font-mono opacity-70">
                  ({planet.distanceFromSunAU} AU)
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Interactive Concentric Orbit Ring Simulation Banner */}
      {viewMode === 'orbits' && (
        <div className="mb-6 p-4 rounded-2xl bg-black/40 border border-white/10 relative overflow-hidden flex flex-col items-center justify-center min-h-[170px]">
          <div className="text-[11px] text-white/50 mb-2 font-mono uppercase tracking-wider flex items-center gap-2">
            <SunMedium className="w-3.5 h-3.5 text-amber-400" />
            <span>Heliocentric Orbital Planes (Scaled Relative Order)</span>
          </div>

          {/* Interactive Scaled Planet Orbit Tracks */}
          <div className="w-full flex items-center justify-between gap-1 max-w-4xl py-2 px-2 overflow-x-auto thin-scrollbar">
            {/* Sun Hub */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 shadow-[0_0_20px_#f59e0b] border-2 border-yellow-200 animate-pulse" />
              <span className="text-[10px] font-bold text-amber-300 font-mono">Sun</span>
            </div>

            {/* Orbit connectors */}
            {SOLAR_SYSTEM_PLANETS.map((p, idx) => {
              const isCurrent = selectedPlanet.name === p.name;
              return (
                <button
                  key={`track-${p.name}`}
                  onClick={() => setSelectedPlanet(p)}
                  className={`flex flex-col items-center gap-1 group flex-shrink-0 transition-transform ${
                    isCurrent ? 'scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${
                      isCurrent
                        ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.8)]'
                        : 'border-white/30 group-hover:border-white/70'
                    }`}
                    style={{ backgroundColor: p.color }}
                  >
                    {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                  </div>
                  <span className={`text-[10px] font-mono ${isCurrent ? 'text-white font-bold' : 'text-white/60'}`}>
                    {p.name.slice(0, 3)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Planet Showcase Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
        {/* Planet Visual Representation with High Realism */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 rounded-3xl bg-black/40 border border-white/15 relative overflow-hidden min-h-[320px]">
          {/* Ambient Specular Highlight */}
          <div
            className="absolute w-52 h-52 rounded-full blur-3xl opacity-30 pointer-events-none"
            style={{ backgroundColor: selectedPlanet.color }}
          />

          {/* 3D-Look Stylized Planet Orb with dynamic surface lighting */}
          <div
            className={`w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-gradient-to-br ${selectedPlanet.gradient} shadow-2xl relative flex items-center justify-center border border-white/20`}
            style={{
              boxShadow: `0 0 60px -10px ${selectedPlanet.color}90, inset -25px -25px 45px rgba(0,0,0,0.85), inset 12px 12px 25px rgba(255,255,255,0.4)`
            }}
          >
            {/* Saturn Ring simulation */}
            {selectedPlanet.name === 'Saturn' && (
              <div className="absolute w-[320px] h-[65px] rounded-full border-4 border-amber-200/70 rotate-[-25deg] shadow-[0_0_20px_rgba(251,191,36,0.3)] pointer-events-none" />
            )}

            {/* Uranus faint ring simulation */}
            {selectedPlanet.name === 'Uranus' && (
              <div className="absolute w-[260px] h-[50px] rounded-full border-2 border-cyan-200/40 rotate-[75deg] pointer-events-none" />
            )}
          </div>

          <div className="mt-6 text-center">
            <span className="text-2xl font-bold text-white block">
              {selectedPlanet.name}
            </span>
            <span className="text-xs text-cyan-200 font-mono">
              {selectedPlanet.type}
            </span>
          </div>
        </div>

        {/* Planet Telemetry & Scientific Stats */}
        <div className="lg:col-span-7 space-y-4">
          <p className="text-sm sm:text-base text-white/90 leading-relaxed font-sans">
            {selectedPlanet.description}
          </p>

          {/* Core Numerical Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15">
              <span className="text-white/60 block mb-0.5">Distance from Sun</span>
              <span className="text-base font-bold font-mono text-white">
                {selectedPlanet.distanceFromSunAU} AU
              </span>
              <span className="text-[10px] text-white/50 block">~{(selectedPlanet.distanceFromSunAU * 149.6).toFixed(0)}M km</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15">
              <span className="text-white/60 block mb-0.5">Orbital Period</span>
              <span className="text-base font-bold font-mono text-white">
                {selectedPlanet.orbitalPeriodDays > 365
                  ? `${(selectedPlanet.orbitalPeriodDays / 365.25).toFixed(1)} Yrs`
                  : `${selectedPlanet.orbitalPeriodDays} Days`}
              </span>
              <span className="text-[10px] text-white/50 block">Sidereal Year</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15">
              <span className="text-white/60 block mb-0.5">Equatorial Diameter</span>
              <span className="text-base font-bold font-mono text-white">
                {selectedPlanet.diameterKm.toLocaleString()} km
              </span>
              <span className="text-[10px] text-white/50 block">Planetary Body</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15">
              <span className="text-white/60 block mb-0.5">Mean Temperature</span>
              <span className="text-base font-bold font-mono text-white">
                {selectedPlanet.meanTempC}°C
              </span>
              <span className="text-[10px] text-white/50 block">Atmosphere / Crust</span>
            </div>
          </div>

          {/* Fun Fact Badge */}
          <div className="p-4 rounded-2xl bg-amber-400/15 border border-amber-300/30 flex items-start gap-3 text-xs sm:text-sm text-amber-100">
            <Sparkles className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-200 block mb-0.5">Astronomical Insight</span>
              <span>{selectedPlanet.funFact}</span>
            </div>
          </div>

          {/* Key Geographic & Atmospheric Features */}
          <div className="pt-2">
            <span className="text-xs text-white/60 block mb-2 font-medium">Surface Landmarks & Moons:</span>
            <div className="flex flex-wrap gap-2">
              {selectedPlanet.surfaceFeatures.map((feat) => (
                <span
                  key={feat}
                  className="px-3 py-1 rounded-xl bg-white/10 border border-white/15 text-xs text-white/90"
                >
                  {feat}
                </span>
              ))}
              <span className="px-3 py-1 rounded-xl bg-cyan-400/20 text-cyan-200 border border-cyan-300/30 text-xs font-semibold">
                Natural Satellites: {selectedPlanet.moonsCount} Moons
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
