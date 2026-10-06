import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  RefreshCw,
  Download,
  Info,
  Play,
  Pause,
  Compass,
  Zap,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';

interface EpicImage {
  identifier: string;
  caption: string;
  image: string;
  date: string;
  centroidCoordinates?: {
    lat: number;
    lon: number;
  };
  dscovrJ2000Position?: {
    x: number;
    y: number;
    z: number;
  };
  imageUrl: string;
  thumbUrl: string;
  jpgUrl: string;
}

export function EpicEarthViewer() {
  const [images, setImages] = useState<EpicImage[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [type, setType] = useState<'natural' | 'enhanced'>('natural');
  const [loading, setLoading] = useState(true);
  const [isRotating, setIsRotating] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Preload and cache all frames for instant rotational scrubbing
  const preloadedRef = useRef<Record<string, HTMLImageElement>>({});

  const loadEpic = async (t: 'natural' | 'enhanced') => {
    setLoading(true);
    setImageLoaded(false);
    try {
      const res = await fetch(`/api/space/epic?type=${t}`);
      const data = await res.json();
      if (data && data.images && data.images.length > 0) {
        setImages(data.images);
        setSelectedIndex(0);

        // Preload fast JPGs in the background
        data.images.forEach((img: EpicImage) => {
          const fastSrc = img.jpgUrl || img.thumbUrl;
          if (!preloadedRef.current[fastSrc]) {
            const im = new Image();
            im.src = fastSrc;
            preloadedRef.current[fastSrc] = im;
          }
        });
      }
    } catch (err) {
      console.error('Failed to load EPIC imagery:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEpic(type);
  }, [type]);

  // Rotational Timelapse Player
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRotating && images.length > 1) {
      timer = setInterval(() => {
        setSelectedIndex((prev) => (prev + 1) % images.length);
      }, 700);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRotating, images.length]);

  const current = images[selectedIndex];

  // Fast optimized display URL: Use compressed Web JPG for zero-lag rendering
  const displaySrc = current ? current.jpgUrl || current.thumbUrl : '';

  return (
    <div className="rounded-3xl bg-[#06080d]/95 backdrop-blur-2xl border border-white/[0.12] p-6 sm:p-8 shadow-[0_16px_48px_rgba(0,0,0,0.8)] text-white select-none">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-cyan-400 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
            <span>NASA EPIC · NOAA DSCOVR SPACECRAFT</span>
            <span className="text-slate-500 hidden sm:inline">· L1 DEEP SPACE</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Earth Polychromatic Imaging Camera
            </h2>
            <span className="text-[11px] px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 font-mono border border-cyan-400/30">
              1,500,000 km from Earth
            </span>
          </div>
        </div>

        {/* Natural vs Enhanced Mode Pill */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.06] border border-white/[0.1] backdrop-blur-md self-start md:self-center">
          <button
            onClick={() => setType('natural')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
              type === 'natural'
                ? 'bg-white text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Natural Optical
          </button>
          <button
            onClick={() => setType('enhanced')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
              type === 'enhanced'
                ? 'bg-cyan-400 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Enhanced Ozone RGB
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-28 text-center text-slate-400 flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
          <span className="font-mono text-xs tracking-wider">
            STREAMING HIGH-BANDWIDTH EARTH TELEMETRY FROM NOAA DSCOVR...
          </span>
        </div>
      ) : current ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main Earth Orb Display */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl bg-black/90 border border-white/10 relative overflow-hidden group min-h-[440px]">
            {/* Ambient atmospheric back-glow */}
            <div className="absolute w-96 h-96 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

            {/* Loading placeholder spinner until image renders */}
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <RefreshCw className="w-8 h-8 animate-spin text-cyan-400/60" />
              </div>
            )}

            {/* Earth Orb Image with atmospheric halo */}
            <div className="relative flex items-center justify-center">
              <img
                key={displaySrc}
                src={displaySrc}
                alt={current.caption || 'NASA DSCOVR Earth'}
                onLoad={() => setImageLoaded(true)}
                className={`max-h-[380px] sm:max-h-[420px] w-auto object-contain rounded-full shadow-[0_0_80px_rgba(14,165,233,0.3)] transition-all duration-300 ${
                  imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
              />
            </div>

            {/* Coordinate HUD Bar */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 text-center z-10">
              <span className="text-[11px] text-slate-300 font-mono bg-white/[0.06] px-3 py-1 rounded-lg border border-white/[0.08]">
                UTC: {current.date}
              </span>
              {current.centroidCoordinates && (
                <span className="text-[11px] text-cyan-300 font-mono bg-cyan-950/50 px-3 py-1 rounded-lg border border-cyan-500/30">
                  Sub-Solar: {current.centroidCoordinates.lat.toFixed(2)}°N,{' '}
                  {current.centroidCoordinates.lon.toFixed(2)}°E
                </span>
              )}
            </div>
          </div>

          {/* Telemetry & Earth Sequence Slider */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 font-bold block">
                  Lagrange L1 Sun-Earth Neutral Orbit
                </span>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  DSCOVR Operational
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Stationed 1 million miles toward the Sun, EPIC delivers a continuous daytime view of planet Earth, tracking aerosol cloud formations, atmospheric ozone thickness, and solar wind storms.
              </p>
            </div>

            {/* Sequence Selector of Available Rotations */}
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">Diurnal Sequence:</span>
                  <span className="font-mono text-cyan-300 text-xs font-semibold">
                    Plate {selectedIndex + 1} of {images.length}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      setSelectedIndex((prev) => (prev - 1 + images.length) % images.length)
                    }
                    className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.14] text-slate-300 hover:text-white transition-colors border border-white/[0.08]"
                    title="Previous Rotation Plate"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsRotating(!isRotating)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-mono font-bold border border-cyan-400/30 transition-colors shadow-sm"
                  >
                    {isRotating ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Play Orbit</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedIndex((prev) => (prev + 1) % images.length)}
                    className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.14] text-slate-300 hover:text-white transition-colors border border-white/[0.08]"
                    title="Next Rotation Plate"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Fast Thumbnails Carousel */}
              <div className="flex items-center gap-2 overflow-x-auto thin-scrollbar pb-1 pt-1">
                {images.map((img, idx) => (
                  <button
                    key={img.identifier}
                    onClick={() => {
                      setImageLoaded(false);
                      setSelectedIndex(idx);
                    }}
                    className={`relative w-13 h-13 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      selectedIndex === idx
                        ? 'border-cyan-400 scale-105 shadow-[0_0_12px_rgba(6,182,212,0.8)]'
                        : 'border-white/10 opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img.thumbUrl}
                      alt={img.image}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Action Bar & High-Res PNG Download */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href={current.imageUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="flex-1 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-200 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg"
              >
                <Download className="w-4 h-4 text-slate-950" />
                <span>Full-Res Lossless Master (PNG)</span>
              </a>

              <button
                onClick={() => loadEpic(type)}
                className="p-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.14] text-slate-300 hover:text-white transition-colors border border-white/[0.08]"
                title="Refresh Satellite Stream"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
