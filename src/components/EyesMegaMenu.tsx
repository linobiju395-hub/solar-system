import React from 'react';
import {
  X,
  Globe2,
  Compass,
  Rocket,
  Sparkles,
  Sun,
  Camera,
  BookOpen,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';
import { SOLAR_SYSTEM_PLANETS } from '../data/planets';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectTarget: (name: string) => void;
  onOpenObservatory?: (tabName: 'media' | 'epic' | 'solar' | 'apod' | 'iss') => void;
}

export function EyesMegaMenu({ isOpen, onClose, onSelectTarget, onOpenObservatory }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#090b10]/95 backdrop-blur-xl flex flex-col animate-fadeIn border-b border-white/10">
      {/* Top Bar with NASA meatball and title */}
      <div className="h-16 px-6 sm:px-12 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#0b3d91] flex items-center justify-center font-black tracking-widest text-[11px] text-white border border-white/20 shadow-md">
            NASA
          </div>
          <span className="font-bold tracking-widest uppercase text-sm text-white">
            Eyes on the Solar System · Directory
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Directory Columns - strictly verified objects with full real telemetry & databases */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-6 sm:p-12 overflow-y-auto thin-scrollbar grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-sm">
        
        {/* Column 1: Solar System Bodies (Sun, Planets, Moon) */}
        <div className="space-y-4">
          <div className="pb-2 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-white">
              Planetary System Bodies
            </h3>
            <span className="text-[10px] font-mono text-cyan-400">
              {SOLAR_SYSTEM_PLANETS.length} Bodies
            </span>
          </div>

          <div className="space-y-2">
            {SOLAR_SYSTEM_PLANETS.map((body) => (
              <button
                key={body.name}
                onClick={() => {
                  onSelectTarget(body.name);
                  onClose();
                }}
                className="w-full text-left p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-400/40 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-black/60 border border-white/20 shadow-sm group-hover:scale-105 transition-transform">
                    {body.imageUrl ? (
                      <img
                        src={body.imageUrl}
                        alt={body.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span
                        className="w-full h-full block rounded-full"
                        style={{ backgroundColor: body.color }}
                      />
                    )}
                    <span
                      className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/10 pointer-events-none"
                    />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-white group-hover:text-cyan-300 block">
                      {body.name}
                    </span>
                    <span className="text-[10px] text-white/50 font-mono">
                      {body.type}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-white/30 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))}
          </div>
        </div>

        {/* Column 2: Live Observatories & NASA Data Streams */}
        <div className="space-y-4">
          <div className="pb-2 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-white">
              Live Observatories & Fleets
            </h3>
            <span className="text-[10px] font-mono text-amber-400">
              Real Feeds
            </span>
          </div>

          <div className="space-y-2.5">
            {/* NASA SDO Heliophysics */}
            <button
              onClick={() => {
                if (onOpenObservatory) onOpenObservatory('solar');
                onClose();
              }}
              className="w-full text-left p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all flex items-start gap-3 group"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sun className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-amber-300 block">
                  Heliophysics Fleet
                </span>
                <span className="font-bold text-xs text-white group-hover:text-amber-200 block">
                  NASA SDO Solar Activity & Flares
                </span>
                <span className="text-[10px] text-white/60 block mt-0.5">
                  Live multi-wavelength extreme UV channels & GOES X-ray flares.
                </span>
              </div>
            </button>

            {/* NASA DSCOVR EPIC Earth */}
            <button
              onClick={() => {
                if (onOpenObservatory) onOpenObservatory('epic');
                onClose();
              }}
              className="w-full text-left p-3 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all flex items-start gap-3 group"
            >
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Globe2 className="w-4 h-4 text-cyan-300" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-300 block">
                  Lagrangian Point L1
                </span>
                <span className="font-bold text-xs text-white group-hover:text-cyan-200 block">
                  NASA DSCOVR EPIC Live Earth
                </span>
                <span className="text-[10px] text-white/60 block mt-0.5">
                  Full sunlit disc imagery from 1 million miles in deep space.
                </span>
              </div>
            </button>

            {/* NASA Media Archive Flipbook */}
            <button
              onClick={() => {
                if (onOpenObservatory) onOpenObservatory('media');
                onClose();
              }}
              className="w-full text-left p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-start gap-3 group"
            >
              <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <BookOpen className="w-4 h-4 text-cyan-300" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 block">
                  Archive Flipbook (images-api.nasa.gov)
                </span>
                <span className="font-bold text-xs text-white group-hover:text-cyan-200 block">
                  Photometric Media Flipbook
                </span>
                <span className="text-[10px] text-white/60 block mt-0.5">
                  140,000+ deep space photographic plates in an interactive flipbook.
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Column 3: High-Altitude Spaceflight Stations & Missions */}
        <div className="space-y-4">
          <div className="pb-2 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-white">
              Active Orbital Missions
            </h3>
            <span className="text-[10px] font-mono text-emerald-400">
              Live Radar
            </span>
          </div>

          <div className="space-y-2.5">
            {/* International Space Station */}
            <button
              onClick={() => {
                if (onOpenObservatory) onOpenObservatory('iss');
                onClose();
              }}
              className="w-full text-left p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all flex items-start gap-3 group"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Rocket className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-400 block">
                  Low Earth Orbit (LEO)
                </span>
                <span className="font-bold text-xs text-white group-hover:text-emerald-200 block">
                  International Space Station (ISS)
                </span>
                <span className="text-[10px] text-white/60 block mt-0.5">
                  Live orbital velocity (27,600 km/h) & current crew roster in orbit.
                </span>
              </div>
            </button>

            {/* Astronomy Picture of the Day */}
            <button
              onClick={() => {
                if (onOpenObservatory) onOpenObservatory('apod');
                onClose();
              }}
              className="w-full text-left p-3 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition-all flex items-start gap-3 group"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-purple-300" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-purple-300 block">
                  Daily Cosmic Observation
                </span>
                <span className="font-bold text-xs text-white group-hover:text-purple-200 block">
                  NASA Astronomy Picture of the Day
                </span>
                <span className="text-[10px] text-white/60 block mt-0.5">
                  Curated daily deep space astrophotography and astrophysicist briefings.
                </span>
              </div>
            </button>

            {/* Direct Telemetry Overview Card */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-xs text-slate-400 space-y-1">
              <span className="text-[10px] font-mono uppercase text-cyan-400 block font-bold">
                Direct Telemetry Integration
              </span>
              <p className="text-[11px] leading-relaxed">
                All cataloged items in this menu link directly to authenticated scientific data streams, high-resolution NASA SDO/DSCOVR telemetry, and vetted orbital coordinates.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
