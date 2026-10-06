import React, { useState, useEffect } from 'react';
import {
  Search,
  Image,
  ExternalLink,
  Calendar,
  Compass,
  RefreshCw,
  Tag,
  Building,
  SlidersHorizontal,
  X,
  Sparkles,
  Info,
  Layers,
  ChevronRight
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
  center?: string;
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
    id: 'mars',
    label: 'Mars Rovers',
    query: 'Perseverance Mars rover Jezero',
    badge: 'Surface Surface Ops',
    description: 'Mastcam-Z panoramas, Ingenuity helicopter, sample caching'
  },
  {
    id: 'hubble',
    label: 'Hubble Heritage',
    query: 'Hubble Space Telescope nebula',
    badge: 'Optical & UV',
    description: 'Pillars of Creation, supernova remnants, spiral galaxies'
  },
  {
    id: 'apollo',
    label: 'Apollo Lunar Archives',
    query: 'Apollo 11 lunar surface Armstrong Aldrin',
    badge: 'Historic 1969',
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
    label: 'Artemis Moon Program',
    query: 'Artemis Orion lunar flyby',
    badge: 'Next-Gen Lunar',
    description: 'Deep space test flights, Moon-Earth retrograde orbits'
  }
];

const NASA_CENTERS = [
  { id: '', label: 'All NASA Centers' },
  { id: 'JPL', label: 'JPL (Jet Propulsion Lab - Robotic Missions)' },
  { id: 'GSFC', label: 'Goddard (Hubble & Webb Telescopes)' },
  { id: 'JSC', label: 'Johnson Space Center (Astronauts & Apollo)' },
  { id: 'KSC', label: 'Kennedy Space Center (Launches & Artemis)' }
];

export function NasaMediaLibraryViewer() {
  const [activePreset, setActivePreset] = useState<string>('webb');
  const [searchTerm, setSearchTerm] = useState('James Webb Space Telescope');
  const [selectedCenter, setSelectedCenter] = useState<string>('');
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');

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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchMedia(searchTerm, selectedCenter);
  }, []);

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
    <div className="rounded-3xl bg-[#080b12]/95 backdrop-blur-2xl border border-white/15 p-6 sm:p-8 shadow-2xl text-white max-w-6xl w-full">
      {/* 1. Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1 font-mono">
            <Building className="w-3.5 h-3.5 text-cyan-400" />
            <span>NASA Image and Video Library · images-api.nasa.gov</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <span>NASA Deep Media Archive</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-400/30">
              140k+ Assets
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Curated photographic telemetry and high-resolution planetary science imagery indexed directly across NASA Centers.
          </p>
        </div>

        {/* Center Filter Dropdown */}
        <div className="flex items-center gap-2 self-start md:self-center">
          <SlidersHorizontal className="w-4 h-4 text-white/50" />
          <select
            value={selectedCenter}
            onChange={(e) => handleCenterChange(e.target.value)}
            className="bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-sans"
          >
            {NASA_CENTERS.map((c) => (
              <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Organized Curated Mission Channels */}
      <div className="pt-5 pb-3">
        <div className="flex items-center justify-between text-xs text-white/60 mb-2 font-mono uppercase tracking-wider">
          <span>Curated Mission Archives</span>
          <span className="text-cyan-400">{items.length} items loaded</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {CATEGORY_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset)}
              className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                activePreset === preset.id
                  ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div>
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/10 text-cyan-300 block w-max mb-1">
                  {preset.badge}
                </span>
                <span className="text-xs font-bold block leading-tight text-white">
                  {preset.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 my-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search queries: 'Pillars of Creation', 'Artemis Orion', 'Curiosity rover', 'Jupiter aurora'..."
            className="w-full bg-black/60 border border-white/20 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2 shadow-lg"
        >
          <Search className="w-4 h-4" />
          <span>Search Archive</span>
        </button>
      </form>

      {/* 4. Results Gallery Grid */}
      {loading ? (
        <div className="py-28 text-center text-white/60 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-7 h-7 animate-spin text-cyan-400" />
          <span className="font-mono text-xs tracking-wider">
            RETRIEVING ARCHIVAL METADATA FROM NASA SERVERS...
          </span>
        </div>
      ) : items.length === 0 ? (
        <div className="py-24 text-center text-white/50 text-xs bg-white/5 rounded-2xl border border-white/10 p-8">
          No catalog records found for "{searchTerm}". Try broadening your keywords or clearing the NASA center filter.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[480px] overflow-y-auto thin-scrollbar p-1">
          {items.map((item) => (
            <div
              key={item.nasaId}
              onClick={() => setSelectedItem(item)}
              className="group cursor-pointer rounded-2xl bg-[#0f1422] border border-white/10 hover:border-cyan-400/80 transition-all flex flex-col overflow-hidden shadow-lg hover:shadow-cyan-500/10"
            >
              {/* Thumbnail Container */}
              <div className="aspect-[4/3] relative overflow-hidden bg-black/80">
                {item.thumbUrl ? (
                  <img
                    src={item.thumbUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20">
                    <Image className="w-8 h-8" />
                  </div>
                )}

                {/* Center Badge */}
                {item.center && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[9px] font-mono text-cyan-300 border border-white/15">
                    {item.center}
                  </span>
                )}

                {/* Date Badge */}
                {item.dateCreated && (
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[9px] font-mono text-white/70 border border-white/15">
                    {new Date(item.dateCreated).getFullYear()}
                  </span>
                )}
              </div>

              {/* Title and ID Card */}
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400/80 block mb-1">
                    ID: {item.nasaId}
                  </span>
                  <h4 className="text-xs font-semibold text-white group-hover:text-cyan-300 line-clamp-2 leading-snug transition-colors">
                    {item.title}
                  </h4>
                </div>

                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-white/50">
                  <span className="font-mono uppercase">{item.mediaType}</span>
                  <span className="text-cyan-400 flex items-center gap-0.5 font-medium group-hover:translate-x-0.5 transition-transform">
                    <span>Inspect</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. High-Resolution Telemetry Modal Lightbox */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-8 animate-fadeIn">
          <div className="max-w-4xl w-full max-h-[92vh] bg-[#0c1017] border border-white/20 rounded-3xl p-6 sm:p-8 overflow-y-auto thin-scrollbar flex flex-col gap-5 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                    NASA ID: {selectedItem.nasaId}
                  </span>
                  {selectedItem.center && (
                    <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-white/10 text-white/80">
                      Center: {selectedItem.center}
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                  {selectedItem.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image Preview with High Contrast Frame */}
            {selectedItem.thumbUrl && (
              <div className="rounded-2xl overflow-hidden max-h-[460px] bg-black flex items-center justify-center border border-white/15 p-2">
                <img
                  src={selectedItem.thumbUrl}
                  alt={selectedItem.title}
                  className="max-h-[440px] w-auto object-contain rounded-lg"
                />
              </div>
            )}

            {/* Archival Description */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold block">
                Official NASA Archival Record
              </span>
              <p className="text-xs text-slate-300 leading-relaxed max-h-36 overflow-y-auto thin-scrollbar bg-black/40 p-4 rounded-xl border border-white/10 font-sans">
                {selectedItem.description || 'No detailed archival description provided with this record.'}
              </p>
            </div>

            {/* Keyword Chips */}
            {selectedItem.keywords && selectedItem.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedItem.keywords.slice(0, 8).map((kw, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white/70"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10">
              <span className="text-xs text-white/50 font-mono">
                Catalog Date: {selectedItem.dateCreated ? new Date(selectedItem.dateCreated).toDateString() : 'Historical'}
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href={selectedItem.thumbUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg"
                >
                  <span>Open Full High-Res Asset</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
