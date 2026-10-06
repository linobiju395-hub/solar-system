import React, { useState } from 'react';
import { ApodData } from '../types/space';
import { Sparkles, Calendar, Maximize2, ExternalLink, Info } from 'lucide-react';

interface Props {
  data: ApodData;
  onSelectDate: (date: string) => void;
  loading: boolean;
}

export function ApodSection({ data, onSelectDate, loading }: Props) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [dateInput, setDateInput] = useState(data.date);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateInput(e.target.value);
    onSelectDate(e.target.value);
  };

  return (
    <div className="relative rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 p-6 sm:p-8 shadow-2xl overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-300 mb-1">
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span>NASA Astronomy Picture of the Day (APOD)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-sm">
            {data.title}
          </h2>
          <div className="text-xs text-white/70 mt-1">
            Date: {data.date} {data.copyright && `· Photo Credit: ${data.copyright}`}
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-white/75 font-medium flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-cyan-300" />
            <span>Explore Archive:</span>
          </label>
          <input
            type="date"
            value={dateInput}
            max={new Date().toISOString().split('T')[0]}
            onChange={handleDateChange}
            className="px-3 py-1.5 rounded-xl bg-white/15 border border-white/25 text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-cyan-300"
          />
        </div>
      </div>

      {/* Main Image Stage */}
      <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-black/40 group max-h-[520px] flex items-center justify-center">
        {data.media_type === 'video' ? (
          <iframe
            src={data.url}
            title={data.title}
            className="w-full aspect-video rounded-xl"
            allowFullScreen
          />
        ) : (
          <>
            <img
              src={data.hdurl || data.url}
              alt={data.title}
              className="w-full h-full object-cover sm:object-contain max-h-[500px] transition-transform duration-700 group-hover:scale-[1.02]"
              loading="lazy"
            />
            <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setIsZoomed(true)}
                className="px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/30 text-white text-xs font-medium flex items-center gap-1.5 shadow-lg"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Full View</span>
              </button>
              {data.hdurl && (
                <a
                  href={data.hdurl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/80 hover:bg-cyan-500 backdrop-blur-md border border-cyan-400 text-white text-xs font-medium flex items-center gap-1.5 shadow-lg"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>NASA HD Asset</span>
                </a>
              )}
            </div>
          </>
        )}
      </div>

      {/* Scientific Explanation */}
      <div className="mt-6 p-5 rounded-2xl bg-white/5 border border-white/10 text-white/90 text-sm leading-relaxed">
        <div className="flex items-center gap-2 font-semibold text-cyan-200 mb-2">
          <Info className="w-4 h-4" />
          <span>Astronomical Briefing</span>
        </div>
        <p className="font-sans text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
          {data.explanation}
        </p>
      </div>

      {/* Modal Zoom */}
      {isZoomed && (
        <div
          onClick={() => setIsZoomed(false)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4 cursor-zoom-out animate-fadeIn"
        >
          <img
            src={data.hdurl || data.url}
            alt={data.title}
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
          />
          <span className="text-xs text-white/70 mt-3 font-mono">
            Click anywhere to close full screen
          </span>
        </div>
      )}
    </div>
  );
}
