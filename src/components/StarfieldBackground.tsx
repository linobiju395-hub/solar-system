import React, { useMemo } from 'react';
import solarSystemBg from '../assets/images/solar_system_background_1790843007894.jpg';

export function StarfieldBackground() {
  // Procedural twinkling stars layered on top of the 4k solar system backdrop
  const stars = useMemo(() => {
    return Array.from({ length: 90 }).map((_, i) => ({
      id: i,
      x: (i * 17.3 + 5.1) % 100,
      y: (i * 29.7 + 11.4) % 100,
      size: (i % 3 === 0 ? 2.2 : i % 2 === 0 ? 1.6 : 1.0),
      opacity: 0.2 + ((i * 11) % 60) / 100,
      duration: 3 + ((i % 4) * 1.5),
      delay: (i % 3) * 0.9
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#05070c]">
      {/* 4K Ultra-Realistic Solar System Space Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 scale-[1.03] animate-pulse"
        style={{
          backgroundImage: `url(${solarSystemBg})`,
          animationDuration: '16s'
        }}
      />

      {/* Atmospheric depth overlay for optimal UI contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#060911]/80 via-[#070b14]/60 to-[#04060b]/90 backdrop-blur-[0.5px]" />

      {/* Dynamic Nebular Vignette & Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[40vw] rounded-full bg-amber-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[50vw] h-[50vw] rounded-full bg-cyan-600/10 blur-[160px] pointer-events-none" />

      {/* Twinkling Star Layer */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {stars.map((s) => (
          <circle
            key={s.id}
            cx={`${s.x}%`}
            cy={`${s.y}%`}
            r={s.size}
            fill="#ffffff"
            opacity={s.opacity}
            className="animate-pulse"
            style={{
              animationDuration: `${s.duration}s`,
              animationDelay: `${s.delay}s`
            }}
          />
        ))}
      </svg>
    </div>
  );
}
