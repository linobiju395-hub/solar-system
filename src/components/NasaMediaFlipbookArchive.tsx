import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  ExternalLink,
  RefreshCw,
  Search,
  X,
  Info
} from 'lucide-react';

export interface MediaItem {
  nasaId: string;
  title: string;
  description: string;
  center?: string;
  dateCreated?: string;
  keywords?: string[];
  mediaType: string;
  thumbUrl: string;
  largeUrl?: string;
  origUrl?: string;
  collectionHref?: string;
}

export interface CategoryPreset {
  id: string;
  label: string;
  query: string;
  badge: string;
  description: string;
}

// Curated Mission Channels (Optimized for maximum NASA archive plate yield)
export const EXPANDED_FLIPBOOK_PRESETS: CategoryPreset[] = [
  {
    id: 'voyager',
    label: 'Voyager Interstellar Grand Tour',
    query: 'Voyager spacecraft',
    badge: 'Interstellar Boundary',
    description: 'Historic flybys of Uranus, Neptune, Jupiter, Saturn, and the edge of interstellar space'
  },
  {
    id: 'all',
    label: 'Cosmos Panoramic Feed',
    query: 'Hubble galaxy',
    badge: 'Entire Archive',
    description: 'Comprehensive cross-mission deep sky survey across NASA astrophysics repositories'
  },
  {
    id: 'hubble',
    label: 'Hubble Space Heritage',
    query: 'Hubble nebula',
    badge: 'Deep Universe',
    description: 'Ultra Deep Field, Crab Nebula, Pillars of Creation, and distant star nurseries'
  },
  {
    id: 'apollo',
    label: 'Apollo Historic Moonwalks',
    query: 'Apollo astronaut',
    badge: 'Lunar Landings',
    description: 'Direct Hasselblad medium-format astronaut photographs across Apollo missions'
  },
  {
    id: 'mars',
    label: 'Mars Surface Expeditions',
    query: 'Mars rover',
    badge: 'Planetary Surface',
    description: 'High-definition Mastcam and Navcam panoramas across Jezero and Gale craters'
  },
  {
    id: 'artemis',
    label: 'Artemis Deep Space Flight',
    query: 'Artemis Orion',
    badge: 'Next-Gen Lunar',
    description: 'Orion optical navigation camera views of the lunar surface and translunar injection'
  },
  {
    id: 'cassini',
    label: 'Cassini Saturn & Ring Worlds',
    query: 'Cassini Saturn',
    badge: 'Outer Planets',
    description: 'Rings, atmosphere storms, geysers of Enceladus, and the methane seas of Titan'
  },
  {
    id: 'juno',
    label: 'Juno Jupiter Magnetosphere',
    query: 'Juno Jupiter',
    badge: 'Gas Giants',
    description: 'Perijove polar cyclone vortices, atmospheric ammonia plumes, and Jovian storms'
  },
  {
    id: 'iss',
    label: 'Space Station Spacewalks & Earth Views',
    query: 'Space Station Earth',
    badge: 'Microgravity',
    description: 'Spacewalk EVAs, Cupola observations, and orbital flight operations'
  },
  {
    id: 'sun',
    label: 'Solar Dynamics & Prominences',
    query: 'Sun flare',
    badge: 'Heliophysics',
    description: 'Extreme ultraviolet solar storms, coronal mass ejections, and magnetic loops'
  }
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function NasaMediaFlipbookArchive({ isOpen, onClose }: Props) {
  const [activePreset, setActivePreset] = useState<string>('voyager');
  const [searchTerm, setSearchTerm] = useState('Voyager spacecraft');
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [flipSpeedSec, setFlipSpeedSec] = useState<number>(3);
  const [showMetadata, setShowMetadata] = useState(true);
  const [customSearchOpen, setCustomSearchOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [totalHits, setTotalHits] = useState<number>(0);
  const [page, setPage] = useState<number>(1);

  // Fetch photos from NASA API (requesting up to 80 plates at once)
  const fetchArchivePhotos = async (q: string, targetPage: number = 1) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/space/media?q=${encodeURIComponent(q)}&media_type=image&limit=80&page=${targetPage}`
      );
      const data = await res.json();
      if (data && Array.isArray(data.items) && data.items.length > 0) {
        setItems(data.items);
        setTotalHits(data.totalHits || data.items.length);
        setPage(targetPage);
        setCurrentIndex(0);
      } else {
        setItems([]);
        setTotalHits(0);
      }
    } catch (err) {
      console.error('Error fetching flipbook images:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const initial = EXPANDED_FLIPBOOK_PRESETS.find((p) => p.id === activePreset) || EXPANDED_FLIPBOOK_PRESETS[0];
      setSearchTerm(initial.query);
      fetchArchivePhotos(initial.query, 1);
    }
  }, [isOpen]);

  // Slideshow / Flipbook Autoplay
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying && items.length > 1) {
      timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
      }, flipSpeedSec * 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, items.length, flipSpeedSec]);

  const handleNext = () => {
    if (items.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }
  };

  const handlePrev = () => {
    if (items.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    }
  };

  // Keyboard navigation (Arrow keys, Space, Telemetry toggle, Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        e.stopPropagation();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        e.stopPropagation();
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        setShowMetadata((m) => !m);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, items.length, onClose]);

  if (!isOpen) return null;

  const currentItem = items[currentIndex] || null;

  const handleSelectPreset = (p: CategoryPreset) => {
    setActivePreset(p.id);
    setSearchTerm(p.query);
    fetchArchivePhotos(p.query, 1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputQuery.trim()) {
      setActivePreset('');
      setSearchTerm(inputQuery.trim());
      fetchArchivePhotos(inputQuery.trim(), 1);
      setCustomSearchOpen(false);
    }
  };

  // Best high-res image URL with fallback to thumb
  const activeImageUrl = currentItem ? (currentItem.largeUrl || currentItem.origUrl || currentItem.thumbUrl) : '';

  return (
    <div className="fixed inset-0 z-50 bg-[#020408] text-white flex flex-col animate-fadeIn select-none font-['Plus_Jakarta_Sans',system-ui,sans-serif] overflow-hidden">
      {/* 1. Header Bar */}
      <header className="h-14 sm:h-16 px-4 sm:px-8 flex items-center justify-between border-b border-white/[0.08] bg-black/80 backdrop-blur-md z-30 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#0b3d91] flex items-center justify-center font-bold tracking-wider text-[10px] text-white border border-white/20 shadow-md">
            NASA
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-wider uppercase text-xs sm:text-sm text-white">
                Archival Photometric Flipbook
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-400/30 hidden sm:inline">
                {items.length} Plates Loaded
              </span>
              {totalHits > 0 && (
                <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
                  ({totalHits.toLocaleString()} in archive)
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 hidden lg:block">
              Chronological astronomical observation plates across NASA mission archives.
            </p>
          </div>
        </div>

        {/* Action Controls & Close */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Button */}
          <button
            onClick={() => setCustomSearchOpen(!customSearchOpen)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs font-mono text-slate-200 hover:text-white transition-colors border border-white/[0.08]"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Search Any Mission</span>
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-red-500/80 text-xs font-mono text-white transition-colors"
          >
            <span>Close</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. Custom Search Query Bar */}
      {customSearchOpen && (
        <div className="px-4 sm:px-8 py-3 bg-[#080d16] border-b border-white/[0.08] flex items-center justify-center z-30 animate-fadeIn flex-shrink-0">
          <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-3xl w-full">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Search NASA Archives: 'Voyager', 'Hubble Crab Nebula', 'Saturn Cassini', 'Europa Ice', 'Spacewalk EVA'..."
              className="flex-1 bg-black/80 border border-white/15 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
              autoFocus
            />
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shadow-md"
            >
              Search Archive
            </button>
          </form>
        </div>
      )}

      {/* 3. Mission Channel Selector (Horizontal Scrollable with Smooth Navigation) */}
      <div className="px-4 sm:px-8 py-2 bg-black/60 border-b border-white/[0.06] overflow-x-auto thin-scrollbar flex items-center gap-2 text-xs z-20 flex-shrink-0">
        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mr-1 flex-shrink-0">
          Mission Catalogs:
        </span>
        {EXPANDED_FLIPBOOK_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handleSelectPreset(preset)}
            className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border ${
              activePreset === preset.id
                ? 'bg-white text-slate-950 border-white font-bold shadow-md'
                : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            <span>{preset.label}</span>
          </button>
        ))}
      </div>

      {/* 4. Canvas Display Area */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-black">
        {loading ? (
          <div className="text-center text-slate-400 flex flex-col items-center gap-3 p-8">
            <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
            <span className="font-mono text-xs tracking-wider">
              STREAMING PHOTOMETRIC PLATES FROM NASA IMAGES ARCHIVES...
            </span>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center text-slate-400 text-xs bg-white/[0.02] rounded-2xl border border-white/[0.08] p-10 max-w-md">
            No archival plates available for this query. Try choosing one of the curated mission channels above or search another astronomical target.
          </div>
        ) : currentItem ? (
          /* Single Plate Mode */
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {/* The Main Hero Image */}
            <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-4">
              <img
                key={currentItem.nasaId}
                src={activeImageUrl}
                alt={currentItem.title}
                className="max-h-full max-w-full w-auto h-auto object-contain transition-opacity duration-300 animate-fadeIn select-none shadow-2xl drop-shadow-2xl"
              />
            </div>

            {/* Top Left: NASA Center Stamp */}
            {currentItem.center && (
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-black/85 backdrop-blur-md text-[11px] font-mono text-cyan-300 border border-white/15 shadow-xl flex items-center gap-2 z-20">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>{currentItem.center} Observation</span>
              </div>
            )}

            {/* Top Right: Open Lossless Source Asset in New Tab */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
              <a
                href={activeImageUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-black/85 backdrop-blur-md text-slate-300 hover:text-white border border-white/15 transition-all text-xs font-mono flex items-center gap-1.5 shadow-xl"
                title="Open Lossless Asset"
              >
                <span>Original File</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Metadata Overlay Panel (Collapsible with 'I' or button) */}
            {showMetadata && (
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/98 via-black/85 to-transparent p-6 sm:p-8 pt-16 text-slate-200 transition-opacity z-20 pointer-events-none">
                <div className="max-w-4xl mx-auto">
                  <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-mono text-cyan-400 mb-1.5">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-400/30">
                      ID: {currentItem.nasaId}
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-300">
                      {currentItem.dateCreated ? currentItem.dateCreated.slice(0, 10) : 'Archival Epoch'}
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="text-emerald-400 font-bold">
                      Plate {currentIndex + 1} of {items.length}
                    </span>
                    {totalHits > 0 && (
                      <span className="text-slate-500 hidden sm:inline">
                        (Archive Pool: {totalHits.toLocaleString()})
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg sm:text-2xl font-bold text-white tracking-tight leading-snug mb-1.5">
                    {currentItem.title}
                  </h3>

                  {currentItem.description && (
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans line-clamp-3 max-w-3xl">
                      {currentItem.description}
                    </p>
                  )}

                  {currentItem.keywords && currentItem.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {currentItem.keywords.slice(0, 6).map((kw, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-white/[0.08] text-slate-400 text-[10px] font-mono"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Left Nav Arrow Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              title="Previous Plate [Left Arrow / H]"
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/85 hover:bg-white hover:text-slate-950 text-white border border-white/20 flex items-center justify-center transition-all shadow-2xl z-40 cursor-pointer pointer-events-auto"
            >
              <ChevronLeft className="w-6 h-6 pointer-events-none" />
            </button>

            {/* Right Nav Arrow Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              title="Next Plate [Right Arrow / L]"
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/85 hover:bg-white hover:text-slate-950 text-white border border-white/20 flex items-center justify-center transition-all shadow-2xl z-40 cursor-pointer pointer-events-auto"
            >
              <ChevronRight className="w-6 h-6 pointer-events-none" />
            </button>
          </div>
        ) : null}
      </div>

      {/* 5. Bottom Flipbook Navigation & Filmstrip Tracker */}
      <footer className="h-16 px-4 sm:px-8 border-t border-white/[0.08] bg-black/90 flex items-center justify-between z-30 flex-shrink-0">
        {/* Play/Pause & Speed Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-mono font-bold transition-all shadow-md ${
              isPlaying
                ? 'bg-amber-400 text-slate-950'
                : 'bg-white/[0.1] hover:bg-white/[0.18] text-white'
            }`}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>{isPlaying ? 'Pause Flip' : 'Auto-Flip [Space]'}</span>
          </button>

          {/* Quick Step Buttons in Footer */}
          <div className="flex items-center gap-1 border-l border-white/10 pl-3">
            <button
              type="button"
              onClick={handlePrev}
              title="Previous Plate"
              className="p-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.18] text-slate-300 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              title="Next Plate"
              className="p-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.18] text-slate-300 hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Speed Selector */}
          <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-slate-400 pl-3 border-l border-white/10">
            <span>Flip Speed:</span>
            {[2, 3, 5, 8].map((sec) => (
              <button
                key={sec}
                onClick={() => setFlipSpeedSec(sec)}
                className={`px-2 py-0.5 rounded-lg text-[10px] ${
                  flipSpeedSec === sec
                    ? 'bg-cyan-500/30 text-cyan-300 font-bold border border-cyan-400/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>

        {/* Thumbnail Filmstrip Preview Slider (Quick Scrub) */}
        <div className="hidden md:flex items-center gap-1.5 max-w-md overflow-x-auto thin-scrollbar px-3 py-1">
          {items.slice(Math.max(0, currentIndex - 4), Math.min(items.length, currentIndex + 5)).map((item, i) => {
            const actualIdx = Math.max(0, currentIndex - 4) + i;
            return (
              <button
                key={`${item.nasaId}-filmstrip-${actualIdx}`}
                onClick={() => setCurrentIndex(actualIdx)}
                className={`relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border transition-all ${
                  actualIdx === currentIndex
                    ? 'border-cyan-400 ring-2 ring-cyan-400/50 scale-110'
                    : 'border-white/15 opacity-50 hover:opacity-100'
                }`}
              >
                <img src={item.thumbUrl} alt="" className="w-full h-full object-cover" />
              </button>
            );
          })}
        </div>

        {/* Plate Counter & Toggle Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowMetadata(!showMetadata)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-mono transition-colors flex items-center gap-1.5 border ${
              showMetadata
                ? 'bg-white/[0.1] text-white border-white/20'
                : 'text-slate-500 hover:text-slate-300 border-white/[0.06]'
            }`}
            title="Toggle Description Overlay [I]"
          >
            <Info className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Telemetry Info</span>
          </button>

          <span className="text-xs font-mono text-cyan-300 font-bold tabular-nums px-3 py-1.5 rounded-xl bg-black/80 border border-white/15 shadow-inner">
            {items.length > 0 ? `${currentIndex + 1} / ${items.length}` : '0 / 0'}
          </span>
        </div>
      </footer>
    </div>
  );
}
