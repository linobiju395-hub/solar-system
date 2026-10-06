import React, { useState, useEffect } from 'react';
import {
  Search,
  ExternalLink,
  RefreshCw,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Calendar,
  Building,
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';

interface MediaItem {
  nasaId: string;
  title: string;
  description: string;
  center?: string;
  dateCreated?: string;
  keywords?: string[];
  mediaType: string;
  thumbUrl: string;
  collectionHref?: string;
}

interface CategoryPreset {
  id: string;
  label: string;
  query: string;
  badge: string;
  description: string;
}

const CATEGORY_PRESETS: CategoryPreset[] = [
  {
    id: 'webb',
    label: 'James Webb (JWST)',
    query: 'James Webb Space Telescope',
    badge: 'Deep Infrared',
    description: 'First deep fields, early universe, stellar nurseries & cosmic cliffs'
  },
  {
    id: 'hubble',
    label: 'Hubble Heritage',
    query: 'Hubble Space Telescope nebula',
    badge: 'Optical & UV',
    description: 'Pillars of Creation, supernova remnants, spiral galaxies'
  },
  {
    id: 'mars',
    label: 'Mars Rovers',
    query: 'Perseverance Mars rover Jezero',
    badge: 'Surface Ops',
    description: 'Mastcam-Z panoramas, Ingenuity helicopter, sample caching'
  },
  {
    id: 'apollo',
    label: 'Apollo Lunar Archives',
    query: 'Apollo 11 lunar surface Armstrong Aldrin',
    badge: 'Historical 1969',
    description: 'First human moonwalks, lunar landers, Earthrise photographs'
  },
  {
    id: 'cassini',
    label: 'Cassini Saturn & Moons',
    query: 'Cassini Saturn rings Enceladus Titan',
    badge: 'Gas Giants',
    description: 'Ring systems, Enceladus ice geysers, Titan hydrocarbon lakes'
  },
  {
    id: 'artemis',
    label: 'Artemis Lunar Program',
    query: 'Artemis Orion lunar flyby',
    badge: 'Next-Gen Exploration',
    description: 'Deep space test flights, Moon-Earth retrograde orbits'
  }
];

const NASA_CENTERS = [
  { id: '', label: 'All NASA Research Centers' },
  { id: 'JPL', label: 'JPL (Jet Propulsion Laboratory - Planetary)' },
  { id: 'GSFC', label: 'Goddard (Hubble & Webb Telescopes)' },
  { id: 'JSC', label: 'Johnson Space Center (Human Spaceflight)' },
  { id: 'KSC', label: 'Kennedy Space Center (Launch Operations)' }
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function NasaMediaArchiveModal({ isOpen, onClose }: Props) {
  const [activePreset, setActivePreset] = useState<string>('webb');
  const [searchTerm, setSearchTerm] = useState('James Webb Space Telescope');
  const [selectedCenter, setSelectedCenter] = useState<string>('');
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  const searchMedia = async (q: string, center: string = '') => {
    setLoading(true);
    try {
      const centerQuery = center ? `&center=${encodeURIComponent(center)}` : '';
      const res = await fetch(`/api/space/media?q=${encodeURIComponent(q)}&media_type=image${centerQuery}`);
      const data = await res.json();
      if (data && Array.isArray(data.items)) {
        setItems(data.items);
      }
    } catch (err) {
      console.error('Error fetching NASA media archive:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      searchMedia(searchTerm, selectedCenter);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePresetSelect = (preset: CategoryPreset) => {
    setActivePreset(preset.id);
    setSearchTerm(preset.query);
    searchMedia(preset.query, selectedCenter);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setActivePreset('');
      searchMedia(searchTerm.trim(), selectedCenter);
    }
  };

  const handleCenterChange = (center: string) => {
    setSelectedCenter(center);
    searchMedia(searchTerm, center);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#04060a]/95 backdrop-blur-2xl flex flex-col animate-fadeIn select-auto">
      {/* Top Professional Header */}
      <header className="h-16 px-6 sm:px-10 flex items-center justify-between border-b border-white/[0.08] bg-black/40">
        <div className="flex items-center gap-3.5">
          <div className="w-8 h-8 rounded-full bg-[#0b3d91] flex items-center justify-center font-bold tracking-wider text-[10px] text-white border border-white/20 shadow-sm">
            NASA
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold tracking-wider uppercase text-xs text-white">
                NASA Image & Video Archive
              </span>
              <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                · Dedicated Scientific Repository (images-api.nasa.gov)
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Access to 140,000+ high-resolution photographic and astronomical missions.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-xs font-mono text-white transition-colors"
        >
          <span>Exit Archive [ESC]</span>
          <X className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Main Archive Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-10 overflow-y-auto thin-scrollbar flex flex-col gap-6">
        
        {/* Curated Archive Channels Bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono uppercase tracking-wider">
            <span>Archival Collections</span>
            <span>{items.length} items loaded</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {CATEGORY_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  activePreset === preset.id
                    ? 'bg-white/[0.1] border-white text-white shadow-sm'
                    : 'bg-white/[0.02] border-white/[0.06] text-slate-300 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    {preset.badge}
                  </span>
                  <span className="text-xs font-semibold block leading-tight text-white">
                    {preset.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Search Controls & Center Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search NASA archives: 'Eagle Nebula', 'Artemis Orion', 'Curiosity Mars', 'Supernova remnant'..."
              className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/30"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* NASA Center Filter */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            <select
              value={selectedCenter}
              onChange={(e) => handleCenterChange(e.target.value)}
              className="bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-white/30 font-sans"
            >
              {NASA_CENTERS.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-slate-300" />
            <span className="font-mono text-xs tracking-wider">
              STREAMING HIGH-RESOLUTION ASSETS FROM NASA API...
            </span>
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-xs bg-white/[0.02] rounded-xl border border-white/[0.06] p-8">
            No archival records found for "{searchTerm}". Broaden your query terms or clear the NASA center filter.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {items.map((item) => (
              <div
                key={item.nasaId}
                onClick={() => setSelectedItem(item)}
                className="group cursor-pointer rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/30 transition-all flex flex-col overflow-hidden shadow-md hover:bg-white/[0.04]"
              >
                <div className="aspect-[4/3] relative overflow-hidden bg-black/60">
                  {item.thumbUrl ? (
                    <img
                      src={item.thumbUrl}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}

                  {item.center && (
                    <span className="absolute top-2 left-2 text-[10px] font-mono px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-slate-300 border border-white/10">
                      {item.center}
                    </span>
                  )}
                </div>

                <div className="p-3.5 flex flex-col justify-between flex-1">
                  <h4 className="text-xs font-semibold text-white leading-snug line-clamp-2 mb-1.5">
                    {item.title}
                  </h4>

                  <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{item.dateCreated ? item.dateCreated.slice(0, 10) : 'NASA Archive'}</span>
                    <span className="text-slate-300 group-hover:text-white font-medium">Inspect</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Item Lightbox Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-8 animate-fadeIn">
          <div className="max-w-4xl w-full bg-[#0a0e17] border border-white/10 rounded-2xl p-6 overflow-y-auto thin-scrollbar max-h-[90vh] flex flex-col gap-4 shadow-2xl">
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-white/[0.08]">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  NASA ID: {selectedItem.nasaId} · Center: {selectedItem.center || 'NASA Headquarters'}
                </span>
                <h3 className="text-lg sm:text-xl font-semibold text-white leading-snug">
                  {selectedItem.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="px-2.5 py-1 rounded bg-white/[0.08] hover:bg-white/[0.14] text-xs font-mono text-white transition-colors"
              >
                Close [ESC]
              </button>
            </div>

            {selectedItem.thumbUrl && (
              <div className="rounded-xl overflow-hidden bg-black border border-white/[0.08] max-h-[50vh] flex items-center justify-center">
                <img
                  src={selectedItem.thumbUrl}
                  alt={selectedItem.title}
                  className="max-h-[50vh] w-auto object-contain"
                />
              </div>
            )}

            <p className="text-xs text-slate-300 leading-relaxed font-sans max-h-40 overflow-y-auto thin-scrollbar">
              {selectedItem.description}
            </p>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono text-[11px]">
                Date Recorded: {selectedItem.dateCreated ? new Date(selectedItem.dateCreated).toLocaleDateString() : 'Historical'}
              </span>

              {selectedItem.thumbUrl && (
                <a
                  href={selectedItem.thumbUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-lg bg-white text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-colors hover:bg-slate-200"
                >
                  <span>Open Full Resolution Asset</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
