import React, { useState, useEffect } from 'react';
import {
  Sun,
  Radio,
  Zap,
  RefreshCw,
  Maximize2,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface SdoImage {
  id: string;
  name: string;
  wavelength: string;
  color: string;
  url: string;
  description: string;
}

interface SolarFlare {
  time_tag: string;
  begin_time: string;
  begin_class?: string;
  max_time: string;
  max_class: string;
  end_time?: string;
  satellite: number;
}

interface SolarAlert {
  product_id: string;
  issue_datetime: string;
  message: string;
}

interface SolarActivityData {
  timestamp: string;
  activityLevel: 'NOMINAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  hasHighAlert: boolean;
  currentKp: number;
  latestFlare: SolarFlare | null;
  flaresCount: number;
  flares: SolarFlare[];
  alerts: SolarAlert[];
  sdoImages: SdoImage[];
}

export function SolarActivity() {
  const [data, setData] = useState<SolarActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSdoIndex, setSelectedSdoIndex] = useState(0);
  const [selectedAlert, setSelectedAlert] = useState<SolarAlert | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'flares' | 'alerts'>('overview');

  const fetchSolarData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/space/solar');
      const json = await res.json();
      if (json && json.sdoImages) {
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load Solar Activity telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolarData();
  }, []);

  return (
    <div className="rounded-2xl bg-[#090d15]/95 backdrop-blur-xl border border-white/[0.08] p-6 sm:p-8 shadow-2xl text-slate-100 max-w-5xl w-full">
      {/* 1. Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1 font-mono">
            <span>NASA Solar Dynamics Observatory (SDO)</span>
            <span aria-hidden="true">·</span>
            <span>Heliophysics Fleet</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white flex items-center gap-3">
            <span>Solar Activity & Space Weather</span>
            {data && (
              <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-slate-300">
                Activity Level: {data.activityLevel}
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Coronal mass ejection monitoring, X-ray solar flare classifications, and extreme ultraviolet multi-wavelength imagery.
          </p>
        </div>

        <button
          onClick={fetchSolarData}
          className="p-2 px-3 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 hover:text-white transition-colors flex items-center gap-2 text-xs font-mono self-start md:self-center border border-white/[0.06]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-white' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 2. Critical Alert Banner */}
      {data && data.hasHighAlert && (
        <div className="my-4 p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3 text-amber-200">
          <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <span className="font-semibold text-amber-300 block mb-0.5">
              High Solar Radiation & Coronal Activity Advisory
            </span>
            <p className="text-slate-300 leading-relaxed font-sans">
              Solar radiation or major X/M-class flare flux detected. Potential radio frequency absorption on the sunlit hemisphere and auroral surges at high latitudes.
            </p>
          </div>
        </div>
      )}

      {/* 3. Scientific Telemetry Stats Row */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Latest Peak Flare</span>
            <div className="my-1.5 flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-white tabular-nums">
                {data.latestFlare?.max_class || 'B-Class'}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              {data.latestFlare ? new Date(data.latestFlare.max_time).toLocaleTimeString() : 'Nominal'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Planetary Kp Index</span>
            <div className="my-1.5 flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-white tabular-nums">
                {data.currentKp.toFixed(1)}
              </span>
              <span className="text-xs text-slate-500 font-mono">/ 9.0</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              {data.currentKp >= 5 ? 'Storm Level' : 'Quiet Magnetosphere'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">7-Day Event Count</span>
            <div className="my-1.5 flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-white tabular-nums">
                {data.flaresCount}
              </span>
              <span className="text-xs text-slate-500">Flares</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">GOES-16/18 Series</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Active Bulletins</span>
            <div className="my-1.5 flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-white tabular-nums">
                {data.alerts.length}
              </span>
              <span className="text-xs text-slate-500">Reports</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">NOAA SWPC Feed</span>
          </div>
        </div>
      )}

      {/* 4. Tab Navigation (Clean Text Segments) */}
      <div className="flex border-b border-white/[0.08] mb-5 gap-4 text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-2.5 transition-colors border-b-2 font-medium flex items-center gap-1.5 ${
            activeTab === 'overview'
              ? 'border-white text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          <span>SDO Multi-Wavelength Imagery</span>
        </button>
        <button
          onClick={() => setActiveTab('flares')}
          className={`pb-2.5 transition-colors border-b-2 font-medium flex items-center gap-1.5 ${
            activeTab === 'flares'
              ? 'border-white text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Solar Flare Log ({data?.flares.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`pb-2.5 transition-colors border-b-2 font-medium flex items-center gap-1.5 ${
            activeTab === 'alerts'
              ? 'border-white text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>NOAA Space Weather Bulletins ({data?.alerts.length || 0})</span>
        </button>
      </div>

      {/* 5. Tab Content */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-slate-300" />
          <span className="font-mono text-xs">Synchronizing NASA Heliophysics stream...</span>
        </div>
      ) : activeTab === 'overview' && data ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Main SDO High-Res Viewer */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="aspect-square w-full rounded-xl overflow-hidden bg-black border border-white/[0.08] relative shadow-lg">
              <img
                src={data.sdoImages[selectedSdoIndex]?.url}
                alt={data.sdoImages[selectedSdoIndex]?.name}
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/80 backdrop-blur-md border border-white/10 text-[11px] font-mono text-slate-200 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>NASA SDO AIA Telescope</span>
              </div>
              <a
                href={data.sdoImages[selectedSdoIndex]?.url}
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-3 right-3 p-1.5 rounded bg-black/80 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white transition-colors"
                title="Open Full Lossless Frame"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs">
              <h4 className="font-semibold text-white font-sans text-xs mb-1">
                {data.sdoImages[selectedSdoIndex]?.name}
              </h4>
              <p className="text-slate-400 leading-relaxed font-sans">
                {data.sdoImages[selectedSdoIndex]?.description}
              </p>
            </div>
          </div>

          {/* SDO Wavelength Selector Channel List */}
          <div className="lg:col-span-5 flex flex-col gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              Select Spectroscopic Channel
            </span>
            {data.sdoImages.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setSelectedSdoIndex(idx)}
                className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                  selectedSdoIndex === idx
                    ? 'bg-white/[0.08] border-white/30 text-white'
                    : 'bg-white/[0.02] border-white/[0.06] text-slate-300 hover:bg-white/[0.05]'
                }`}
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-black flex-shrink-0 border border-white/10">
                  <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold text-white font-mono">
                      {img.wavelength}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {img.color}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate font-sans mt-0.5">
                    {img.name}
                  </p>
                </div>
              </button>
            ))}

            {/* Scientific Explanation Info Box */}
            <div className="mt-3 p-3.5 rounded-xl bg-black/40 border border-white/[0.06] text-xs text-slate-400 space-y-1 font-sans">
              <span className="text-slate-200 font-semibold block text-[11px]">
                X-Ray Solar Flare Classification
              </span>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Peak X-ray flux is recorded in Watts/m² by GOES instrumentation:
                <span className="block mt-1"><strong className="text-slate-200">X-Class:</strong> Extreme major events triggering ionospheric disruptions.</span>
                <span className="block"><strong className="text-slate-200">M-Class:</strong> Medium eruptions causing high-latitude radio absorption.</span>
                <span className="block"><strong className="text-slate-200">C-Class:</strong> Minor events with negligible Earth-side impact.</span>
              </p>
            </div>
          </div>
        </div>
      ) : activeTab === 'flares' && data ? (
        <div className="space-y-2 max-h-[460px] overflow-y-auto thin-scrollbar p-1">
          <div className="text-[11px] text-slate-400 font-mono uppercase pb-1 flex justify-between">
            <span>GOES-16/18 High Energy Flare Detections</span>
            <span>{data.flares.length} Events</span>
          </div>

          {data.flares.map((f, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded font-mono font-semibold text-xs bg-white/10 text-white tabular-nums">
                  {f.max_class || 'B-Class'}
                </span>
                <div>
                  <h4 className="font-medium text-white text-xs font-sans">
                    GOES Satellite {f.satellite} Emission
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Peak: {new Date(f.max_time).toUTCString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono self-end sm:self-center">
                <span>Start: {f.begin_time ? new Date(f.begin_time).toLocaleTimeString() : 'N/A'}</span>
                <span>End: {f.end_time ? new Date(f.end_time).toLocaleTimeString() : 'Active'}</span>
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'alerts' && data ? (
        <div className="space-y-2.5 max-h-[460px] overflow-y-auto thin-scrollbar p-1">
          <div className="text-[11px] text-slate-400 font-mono uppercase pb-1">
            Space Weather Prediction Center (SWPC) Warnings
          </div>

          {data.alerts.map((al, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedAlert(al)}
              className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/20 transition-all cursor-pointer flex flex-col gap-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/[0.06] text-slate-300">
                  CODE: {al.product_id}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {al.issue_datetime}
                </span>
              </div>

              <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed bg-black/40 p-3 rounded-lg border border-white/[0.04] line-clamp-3">
                {al.message}
              </pre>

              <div className="flex justify-end">
                <span className="text-slate-300 hover:text-white text-[11px] font-medium flex items-center gap-1">
                  <span>View Full Bulletin</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* 6. Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-fadeIn">
          <div className="max-w-2xl w-full bg-[#0a0e17] border border-white/10 rounded-2xl p-6 overflow-y-auto thin-scrollbar flex flex-col gap-4 shadow-2xl">
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-white/[0.08]">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  NOAA SWPC Product {selectedAlert.product_id}
                </span>
                <h3 className="text-base sm:text-lg font-semibold text-white">
                  Space Weather Official Message
                </h3>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="px-2.5 py-1 rounded bg-white/[0.08] hover:bg-white/[0.14] text-xs font-mono text-white transition-colors"
              >
                Close [ESC]
              </button>
            </div>

            <pre className="text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed bg-black/60 p-4 rounded-xl border border-white/[0.06] max-h-96 overflow-y-auto thin-scrollbar">
              {selectedAlert.message}
            </pre>

            <div className="pt-2 border-t border-white/[0.08] text-right text-xs text-slate-400 font-mono">
              Issued at: {selectedAlert.issue_datetime} UTC
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
