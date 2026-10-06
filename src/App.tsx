import React, { useState, useEffect } from 'react';
import { EyesSolarCanvas } from './components/EyesSolarCanvas';
import { EyesMegaMenu } from './components/EyesMegaMenu';
import { ApodSection } from './components/ApodSection';
import { IssTracker } from './components/IssTracker';
import { EpicEarthViewer } from './components/EpicEarthViewer';
import { SolarActivity } from './components/SolarActivity';
import { NasaMediaFlipbookArchive } from './components/NasaMediaFlipbookArchive';
import { SOLAR_SYSTEM_PLANETS } from './data/planets';
import { fetchApod } from './services/spaceService';
import { ApodData, PlanetInfo } from './types/space';
import {
  Share2,
  Menu,
  Plus,
  Minus,
  Info,
  Sparkles,
  Rocket,
  Globe,
  BookOpen,
  Sun,
  Activity,
  X
} from 'lucide-react';

export default function App() {
  const [selectedTarget, setSelectedTarget] = useState<string>('EARTH');
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isFlipbookOpen, setIsFlipbookOpen] = useState(false);
  const [timeRate, setTimeRate] = useState<'real' | 'fast' | 'paused'>('real');
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [zoomScale, setZoomScale] = useState(1);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeOverlayTab, setActiveOverlayTab] = useState<'none' | 'details' | 'apod' | 'epic' | 'solar' | 'iss'>('none');

  // APOD Data
  const [apodData, setApodData] = useState<ApodData | null>(null);
  const [apodLoading, setApodLoading] = useState(false);

  useEffect(() => {
    setApodLoading(true);
    fetchApod()
      .then((data) => {
        setApodData(data);
        setApodLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setApodLoading(false);
      });
  }, []);

  // Clock progression
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        if (timeRate === 'paused') return prev;
        const addSec = timeRate === 'fast' ? 8 : 1;
        return new Date(prev.getTime() + addSec * 1000);
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeRate]);

  // Adjust simulation speed
  useEffect(() => {
    if (timeRate === 'paused') {
      setSpeedMultiplier(0);
    } else if (timeRate === 'fast') {
      setSpeedMultiplier(8);
    } else {
      setSpeedMultiplier(1);
    }
  }, [timeRate]);

  const selectedPlanetInfo: PlanetInfo | undefined = SOLAR_SYSTEM_PLANETS.find(
    (p) => p.name.toUpperCase() === selectedTarget.toUpperCase()
  );

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#030508] text-slate-100 font-['Plus_Jakarta_Sans',system-ui,sans-serif] select-none">
      {/* 1. Scientific Interactive Canvas */}
      <EyesSolarCanvas
        selectedBody={selectedTarget}
        onSelectBody={(name) => {
          setSelectedTarget(name);
          setActiveOverlayTab('details');
        }}
        speedMultiplier={speedMultiplier}
        zoomScale={zoomScale}
      />

      {/* 2. Top Header Navigation (Professional Scientific Minimalist) */}
      <header className="absolute top-0 left-0 right-0 z-30 h-14 px-6 flex items-center justify-between bg-gradient-to-b from-black/90 via-black/50 to-transparent pointer-events-auto border-b border-white/[0.04]">
        <div className="flex items-center gap-3.5">
          <div className="w-7 h-7 rounded-full bg-[#0b3d91] border border-white/20 flex items-center justify-center font-bold tracking-wider text-[9px] text-white shadow-sm">
            NASA
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-semibold tracking-wider uppercase text-xs text-white">
              Eyes on the Solar System
            </span>
            <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
              · Jet Propulsion Laboratory
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 text-xs text-slate-300">
          <button
            onClick={() => setIsFlipbookOpen(true)}
            className="hover:text-white flex items-center gap-1.5 transition-colors px-2.5 py-1.5 rounded-md bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08]"
            title="Open Deep Space Photo Flipbook"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-300" />
            <span className="hidden sm:inline text-xs font-medium text-slate-200">Media Flipbook</span>
          </button>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: 'NASA Eyes on the Solar System', url: window.location.href });
              }
            }}
            className="hover:text-white flex items-center gap-1.5 transition-colors px-2.5 py-1.5 rounded-md hover:bg-white/[0.06]"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline text-xs">Share</span>
          </button>

          <button
            onClick={() => setIsMegaMenuOpen(true)}
            className="hover:text-white flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-md bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.08] text-xs font-medium"
          >
            <Menu className="w-3.5 h-3.5" />
            <span>Directory</span>
          </button>
        </div>
      </header>

      {/* 3. Right Scientific Instrument Dock (NASA Eyes HUD Console) */}
      <div className="absolute top-20 right-5 z-20 flex flex-col items-center pointer-events-auto select-none">
        <div className="p-1.5 rounded-2xl bg-black/85 backdrop-blur-2xl border border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col items-center gap-1.5">
          {/* Header indicator */}
          <div className="w-full flex items-center justify-center pt-0.5 pb-1 border-b border-white/[0.08]">
            <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase font-semibold">
              HUD
            </span>
          </div>

          {/* Section 1: Planetary & Mission Telemetry */}
          <div className="flex flex-col items-center gap-1">
            {/* Telemetry Briefing */}
            <div className="relative group">
              <button
                onClick={() => setActiveOverlayTab(activeOverlayTab === 'details' ? 'none' : 'details')}
                aria-label="Target Ephemeris & Telemetry"
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  activeOverlayTab === 'details'
                    ? 'bg-cyan-400 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <Info className="w-4 h-4" />
              </button>
              <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center pointer-events-none z-40">
                <div className="px-2.5 py-1 rounded-lg bg-black/95 text-white border border-white/15 text-[11px] font-mono whitespace-nowrap shadow-xl">
                  {selectedTarget} Telemetry Briefing
                </div>
              </div>
            </div>

            {/* NASA SDO Heliophysics */}
            <div className="relative group">
              <button
                onClick={() => setActiveOverlayTab(activeOverlayTab === 'solar' ? 'none' : 'solar')}
                aria-label="NASA SDO Solar Flares & EUV"
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  activeOverlayTab === 'solar'
                    ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <Sun className="w-4 h-4" />
              </button>
              <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center pointer-events-none z-40">
                <div className="px-2.5 py-1 rounded-lg bg-black/95 text-white border border-white/15 text-[11px] font-mono whitespace-nowrap shadow-xl">
                  SDO Solar Activity & Flares
                </div>
              </div>
            </div>

            {/* NASA EPIC Earth */}
            <div className="relative group">
              <button
                onClick={() => setActiveOverlayTab(activeOverlayTab === 'epic' ? 'none' : 'epic')}
                aria-label="NASA EPIC Full-Disc Earth"
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  activeOverlayTab === 'epic'
                    ? 'bg-sky-400 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <Globe className="w-4 h-4" />
              </button>
              <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center pointer-events-none z-40">
                <div className="px-2.5 py-1 rounded-lg bg-black/95 text-white border border-white/15 text-[11px] font-mono whitespace-nowrap shadow-xl">
                  DSCOVR EPIC Earth View
                </div>
              </div>
            </div>

            {/* ISS Tracker */}
            <div className="relative group">
              <button
                onClick={() => setActiveOverlayTab(activeOverlayTab === 'iss' ? 'none' : 'iss')}
                aria-label="International Space Station Radar"
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  activeOverlayTab === 'iss'
                    ? 'bg-emerald-400 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <Rocket className="w-4 h-4" />
              </button>
              <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center pointer-events-none z-40">
                <div className="px-2.5 py-1 rounded-lg bg-black/95 text-white border border-white/15 text-[11px] font-mono whitespace-nowrap shadow-xl">
                  ISS Station Orbit & Crew
                </div>
              </div>
            </div>

            {/* APOD */}
            <div className="relative group">
              <button
                onClick={() => setActiveOverlayTab(activeOverlayTab === 'apod' ? 'none' : 'apod')}
                aria-label="Astronomy Picture of the Day"
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  activeOverlayTab === 'apod'
                    ? 'bg-purple-400 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <Sparkles className="w-4 h-4" />
              </button>
              <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center pointer-events-none z-40">
                <div className="px-2.5 py-1 rounded-lg bg-black/95 text-white border border-white/15 text-[11px] font-mono whitespace-nowrap shadow-xl">
                  Astronomy Picture of the Day
                </div>
              </div>
            </div>
          </div>

          <div className="h-px w-6 bg-white/[0.12] my-0.5" />

          {/* Section 2: Viewport Optics Controls */}
          <div className="flex flex-col items-center gap-1">
            {/* Zoom In */}
            <div className="relative group">
              <button
                onClick={() => setZoomScale((z) => Math.min(2.5, z + 0.2))}
                aria-label="Zoom In Orbit"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all duration-200"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center pointer-events-none z-40">
                <div className="px-2.5 py-1 rounded-lg bg-black/95 text-white border border-white/15 text-[11px] font-mono whitespace-nowrap shadow-xl">
                  Zoom Optics In
                </div>
              </div>
            </div>

            {/* Zoom Out */}
            <div className="relative group">
              <button
                onClick={() => setZoomScale((z) => Math.max(0.4, z - 0.2))}
                aria-label="Zoom Out Orbit"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all duration-200"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center pointer-events-none z-40">
                <div className="px-2.5 py-1 rounded-lg bg-black/95 text-white border border-white/15 text-[11px] font-mono whitespace-nowrap shadow-xl">
                  Zoom Optics Out
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom NASA Mission Elapsed & Epoch Timeline Console */}
      <footer className="absolute bottom-5 left-0 right-0 z-30 flex flex-col items-center pointer-events-auto px-4">
        <div className="px-4 py-2 rounded-2xl bg-black/75 backdrop-blur-2xl border border-white/15 flex flex-wrap items-center justify-center gap-3 sm:gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-xs">
          {/* Live Ephemeris Status */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
            <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-200 font-mono">
              Live Ephemeris
            </span>
          </div>

          <span className="text-slate-400 font-mono text-[11px] px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.06]">
            {currentTime.toLocaleDateString('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric'
            }).toUpperCase()}
          </span>

          {/* Temporal Rate Control */}
          <button
            onClick={() => {
              if (timeRate === 'real') setTimeRate('fast');
              else if (timeRate === 'fast') setTimeRate('paused');
              else setTimeRate('real');
            }}
            className="text-[11px] font-mono tracking-wider text-slate-200 hover:text-white px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 transition-colors flex items-center gap-1.5"
          >
            <span className="text-cyan-400 font-bold">
              {timeRate === 'real' ? '1×' : timeRate === 'fast' ? '8×' : '0×'}
            </span>
            <span>{timeRate === 'real' ? 'Real-Time' : timeRate === 'fast' ? 'Accelerated' : 'Frozen'}</span>
          </button>

          <span className="text-cyan-300 font-mono text-[11px] tabular-nums font-semibold">
            {currentTime.toLocaleTimeString('en-US', { hour12: false })} UTC
          </span>

          {/* Focal Body Quick Selector */}
          <div className="hidden md:flex items-center gap-1 pl-3 border-l border-white/10">
            <span className="text-[10px] text-slate-500 font-mono mr-1">TARGET:</span>
            {['SUN', 'EARTH', 'MOON', 'MARS', 'JUPITER', 'SATURN'].map((b) => (
              <button
                key={b}
                onClick={() => {
                  setSelectedTarget(b);
                  setActiveOverlayTab('details');
                }}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-mono transition-all duration-150 ${
                  selectedTarget.toUpperCase() === b && activeOverlayTab === 'details'
                    ? 'bg-white text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </footer>

      {/* 5. Detail Briefing Panel */}
      {activeOverlayTab === 'details' && (
        <div className="absolute top-18 right-16 z-30 w-96 max-h-[82vh] overflow-y-auto thin-scrollbar rounded-2xl bg-[#080b11]/95 backdrop-blur-xl border border-white/10 p-5 shadow-2xl animate-fadeIn pointer-events-auto">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              {selectedPlanetInfo?.imageUrl && (
                <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-black/80 border border-white/20 shadow-md">
                  <img
                    src={selectedPlanetInfo.imageUrl}
                    alt={selectedTarget}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/10" />
                </div>
              )}
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  Planetary Ephemeris Profile
                </span>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {selectedTarget}
                </h3>
              </div>
            </div>
            <button
              onClick={() => setActiveOverlayTab('none')}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {selectedPlanetInfo ? (
            <div className="space-y-4 text-xs">
              <p className="text-slate-300 leading-relaxed font-sans">
                {selectedPlanetInfo.description}
              </p>

              {/* Data Metric Grid with Tabular Numerals */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-slate-400 block text-[10px] uppercase font-mono tracking-wider">Distance from Sun</span>
                  <span className="font-mono font-semibold text-white text-sm tabular-nums">
                    {selectedPlanetInfo.distanceFromSunAU} AU
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-slate-400 block text-[10px] uppercase font-mono tracking-wider">Orbital Period</span>
                  <span className="font-mono font-semibold text-white text-sm tabular-nums">
                    {selectedPlanetInfo.orbitalPeriodDays} Earth Days
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-slate-400 block text-[10px] uppercase font-mono tracking-wider">Surface Gravity</span>
                  <span className="font-mono font-semibold text-white text-sm tabular-nums">
                    {selectedPlanetInfo.gravityMps2} m/s²
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-slate-400 block text-[10px] uppercase font-mono tracking-wider">Rotational Period</span>
                  <span className="font-mono font-semibold text-white text-sm tabular-nums">
                    {selectedPlanetInfo.dayLengthHours} Hours
                  </span>
                </div>
              </div>

              {/* Quiet Fact Section */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-300">
                <span className="font-semibold block text-[11px] text-white mb-1">Observation Note</span>
                <span className="leading-relaxed">{selectedPlanetInfo.funFact}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] mb-1.5 uppercase font-mono tracking-wider">
                  Atmospheric Spectrum
                </span>
                <span className="text-slate-300 font-sans block p-2.5 rounded-xl bg-black/40 border border-white/[0.06] leading-relaxed">
                  {selectedPlanetInfo.atmosphere}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs text-slate-300">
              <p>
                Spacecraft tracking profile for {selectedTarget}. Actively transmitting deep telemetry back to the NASA Deep Space Network.
              </p>
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 font-mono text-[11px]">
                Status: Operational Interplanetary Trajectory
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. Professional Modal Overlay Container */}
      {activeOverlayTab !== 'none' && activeOverlayTab !== 'details' && (
        <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-xl p-6 sm:p-12 overflow-y-auto thin-scrollbar pointer-events-auto flex flex-col items-center">
          <div className="max-w-5xl w-full">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-white/[0.08]">
              <span className="text-xs uppercase tracking-widest text-slate-400 font-mono">
                NASA Heliophysics & Planetary Systems
              </span>
              <button
                onClick={() => setActiveOverlayTab('none')}
                className="px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-xs font-medium text-white transition-colors"
              >
                Close View [ESC]
              </button>
            </div>

            {activeOverlayTab === 'solar' && <SolarActivity />}
            {activeOverlayTab === 'epic' && <EpicEarthViewer />}
            {activeOverlayTab === 'iss' && <IssTracker />}
            {activeOverlayTab === 'apod' && apodData && (
              <ApodSection data={apodData} onSelectDate={() => {}} loading={apodLoading} />
            )}
          </div>
        </div>
      )}

      {/* 7. Dedicated NASA Media Flipbook Archive Modal */}
      <NasaMediaFlipbookArchive
        isOpen={isFlipbookOpen}
        onClose={() => setIsFlipbookOpen(false)}
      />

      {/* 8. Directory Modal */}
      <EyesMegaMenu
        isOpen={isMegaMenuOpen}
        onClose={() => setIsMegaMenuOpen(false)}
        onSelectTarget={(target) => {
          setSelectedTarget(target);
          setActiveOverlayTab('details');
        }}
        onOpenObservatory={(tab) => {
          if (tab === 'media') {
            setIsFlipbookOpen(true);
          } else {
            setActiveOverlayTab(tab);
          }
        }}
      />
    </div>
  );
}
